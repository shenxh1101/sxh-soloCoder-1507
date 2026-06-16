import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Phone,
  Gauge,
  Calendar,
  Wrench,
  Edit3,
  Trash2,
  Printer,
  Clock,
  DollarSign,
  User,
  MessageSquare,
  Plus,
  Send,
  CheckCircle,
  CalendarCheck,
  XCircle,
  Eye,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import type { MaintenanceRecord, FollowUpRecord, FollowUpStatus } from '../../shared/types';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('record');
  const navigate = useNavigate();
  const {
    fetchVehicleDetail,
    deleteVehicle,
    fetchFollowUps,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    deleteRecord,
    fetchRecordDetail,
    followUps,
    loading,
  } = useAppStore();
  
  const recordRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [vehicle, setVehicle] = useState<any>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    type: '电话联系',
    content: '',
    scheduledDate: '',
    scheduledTime: '',
    status: 'called' as FollowUpStatus,
  });
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showDeleteRecord, setShowDeleteRecord] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (recordId && records.length > 0) {
      const id = parseInt(recordId);
      const recordEl = recordRefs.current.get(id);
      if (recordEl) {
        recordEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedRecordId(id);
        setTimeout(() => setHighlightedRecordId(null), 3000);
      }
    }
  }, [recordId, records]);

  const loadData = async (vehicleId: number) => {
    try {
      const data = await fetchVehicleDetail(vehicleId);
      setVehicle(data.vehicle);
      setRecords(data.records || []);
      fetchFollowUps(vehicleId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewRecord = async (recordId: number) => {
    const record = await fetchRecordDetail(recordId);
    if (record) {
      setSelectedRecord(record);
      setShowRecordDetail(true);
    }
  };

  const handleDeleteRecord = async () => {
    if (deletingRecordId === null) return;
    try {
      await deleteRecord(deletingRecordId);
      if (id) {
        loadData(parseInt(id));
      }
      setShowDeleteRecord(false);
      setDeletingRecordId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintRecord = (recordId: number) => {
    window.open(`/print/${id}?mode=record&recordId=${recordId}`, '_blank');
  };

  const handlePrintAll = () => {
    window.open(`/print/${id}?mode=vehicle`, '_blank');
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(parseInt(id));
      navigate('/vehicles');
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFullDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: FollowUpStatus) => {
    switch (status) {
      case 'called':
        return <span className="badge-primary">已联系</span>;
      case 'scheduled':
        return <span className="badge-warning">已预约</span>;
      case 'arrived':
        return <span className="badge-success">已到店</span>;
      case 'cancelled':
        return <span className="badge-danger">已取消</span>;
      default:
        return null;
    }
  };

  const handleAddFollowUp = async () => {
    if (!id || !followUpForm.content.trim()) return;
    setSubmittingFollowUp(true);
    try {
      let scheduledDate: string | null = null;
      if (followUpForm.scheduledDate) {
        const time = followUpForm.scheduledTime || '09:00';
        scheduledDate = `${followUpForm.scheduledDate}T${time}:00`;
      }
      await addFollowUp({
        vehicleId: parseInt(id),
        type: followUpForm.type,
        content: followUpForm.content,
        scheduledDate,
        status: followUpForm.status,
      });
      setFollowUpForm({
        type: '电话联系',
        content: '',
        scheduledDate: '',
        scheduledTime: '',
        status: 'called',
      });
      setShowFollowUpModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => navigate('/vehicles')}
        >
          <ArrowLeft className="w-5 h-5" />
          返回车辆列表
        </button>
        <div className="flex gap-2 no-print">
          <button
            className="btn-secondary"
            onClick={handlePrintAll}
          >
            <Printer className="w-4 h-4 mr-2" />
            打印全部
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate(`/vehicles/${id}/edit`)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            编辑
          </button>
          <button className="btn-danger" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 bg-gradient-to-br from-primary-800 to-primary-900 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{vehicle.plateNumber}</h2>
                <p className="text-primary-200">{vehicle.carModel || '未填写车型'}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-primary-200">
                <User className="w-4 h-4" />
                <span>{vehicle.ownerName}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-200">
                <Phone className="w-4 h-4" />
                <span>{vehicle.ownerPhone}</span>
              </div>
              {vehicle.color && (
                <div className="flex items-center gap-2 text-primary-200">
                  <span className="w-3 h-3 rounded-full bg-white/50 mr-1" />
                  <span>{vehicle.color}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">里程信息</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  当前里程
                </span>
                <span className="font-semibold text-gray-900">
                  {vehicle.currentMileage?.toLocaleString()} km
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  下次保养
                </span>
                <span
                  className={`font-semibold ${
                    vehicle.nextMaintenanceMileage &&
                    vehicle.nextMaintenanceMileage <= vehicle.currentMileage
                      ? 'text-danger-600'
                      : 'text-primary-600'
                  }`}
                >
                  {vehicle.nextMaintenanceMileage
                    ? `${vehicle.nextMaintenanceMileage.toLocaleString()} km`
                    : '暂无记录'}
                </span>
              </div>
              {vehicle.nextMaintenanceMileage && (
                <div className="pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        vehicle.nextMaintenanceMileage <= vehicle.currentMileage
                          ? 'bg-danger-500 w-full'
                          : vehicle.nextMaintenanceMileage - vehicle.currentMileage < 1000
                          ? 'bg-warning-500'
                          : 'bg-primary-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (vehicle.currentMileage / vehicle.nextMaintenanceMileage) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {vehicle.nextMaintenanceMileage >= vehicle.currentMileage
                      ? `还剩 ${(
                          vehicle.nextMaintenanceMileage - vehicle.currentMileage
                        ).toLocaleString()} km`
                      : '已超出保养里程'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">维修统计</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-primary-600">{records.length}</p>
                <p className="text-xs text-gray-500">维修次数</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-accent-600">
                  ¥
                  {records
                    .reduce((sum, r) => sum + (r.totalCost || 0), 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">累计消费</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">维修历史</h3>
              <button
                className="btn-accent btn-sm no-print"
                onClick={() =>
                  navigate(`/records/new?vehicleId=${vehicle.id}`)
                }
              >
                <Wrench className="w-4 h-4 mr-2" />
                新增维修
              </button>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无维修记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div
                    key={record.id}
                    ref={(el) => {
                      if (el) recordRefs.current.set(record.id, el);
                    }}
                    className={`relative pl-8 pb-4 border-l-2 border-gray-200 last:border-0 last:pb-0 transition-all ${
                      highlightedRecordId === record.id
                        ? 'bg-accent-50 -mx-2 px-2 rounded-xl'
                        : ''
                    }`}
                  >
                    <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full ring-4 ring-white ${
                      highlightedRecordId === record.id ? 'bg-accent-500' : 'bg-primary-500'
                    }`} />
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatDate(record.createdAt)}
                            </span>
                            {(record as any).isRework && (
                              <span className="badge-danger text-xs">返工</span>
                            )}
                            <span className="text-xs text-gray-400">#{record.id}</span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Gauge className="w-3 h-3" />
                            {record.mileage?.toLocaleString()} km
                          </p>
                          {(record as any).durationMinutes && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              用时 {(record as any).durationMinutes} 分钟
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent-600">
                            ¥{record.totalCost?.toLocaleString()}
                          </p>
                          {record.mechanicName && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                              <User className="w-3 h-3" />
                              {record.mechanicName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {record.serviceItems?.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white rounded-md text-xs text-gray-600 border border-gray-200"
                          >
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                      </div>

                      {record.notes && (
                        <p className="text-sm text-gray-500 bg-white p-2 rounded-lg mb-3">
                          备注：{record.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 no-print">
                        <button
                          className="btn-secondary btn-xs"
                          onClick={() => handleViewRecord(record.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          查看
                        </button>
                        <button
                          className="btn-secondary btn-xs"
                          onClick={() => handlePrintRecord(record.id)}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          打印
                        </button>
                        <button
                          className="btn-danger btn-xs ml-auto"
                          onClick={() => {
                            setDeletingRecordId(record.id);
                            setShowDeleteRecord(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                客户跟进记录
              </h3>
              <button
                className="btn-primary btn-sm no-print"
                onClick={() => setShowFollowUpModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加跟进
              </button>
            </div>

            {followUps.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无跟进记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {followUp.type}
                        </span>
                        {getStatusBadge(followUp.status)}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(followUp.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{followUp.content}</p>
                    {followUp.scheduledDate && (
                      <p className="text-xs text-warning-600 flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3" />
                        预约时间：{formatFullDateTime(followUp.scheduledDate)}
                      </p>
                    )}
                    {(followUp as any).source && (
                      <p className="text-xs text-gray-400 mt-1">
                        来源：{(followUp as any).source}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {followUp.status !== 'arrived' && (
                        <button
                          className="text-xs px-2 py-1 bg-success-50 text-success-700 rounded-md hover:bg-success-100 transition-colors"
                          onClick={() =>
                            updateFollowUp(followUp.id, { status: 'arrived' })
                          }
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          标记到店
                        </button>
                      )}
                      {followUp.status !== 'cancelled' &&
                        followUp.status !== 'arrived' && (
                          <button
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() =>
                              updateFollowUp(followUp.id, { status: 'cancelled' })
                            }
                          >
                            <XCircle className="w-3 h-3 inline mr-1" />
                            取消
                          </button>
                        )}
                      <button
                        className="text-xs px-2 py-1 bg-danger-50 text-danger-600 rounded-md hover:bg-danger-100 transition-colors ml-auto"
                        onClick={() => deleteFollowUp(followUp.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="删除车辆"
        message="确定要删除这辆车吗？相关的维修记录也会被删除，此操作不可撤销。"
        type="danger"
        confirmText="删除"
        isLoading={isDeleting}
      />

      <Modal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        title="添加客户跟进记录"
      >
        <div className="space-y-4">
          <div>
            <label className="label">跟进方式</label>
            <select
              className="input"
              value={followUpForm.type}
              onChange={(e) =>
                setFollowUpForm({ ...followUpForm, type: e.target.value })
              }
            >
              <option value="电话联系">电话联系</option>
              <option value="微信联系">微信联系</option>
              <option value="到店咨询">到店咨询</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="label">跟进状态</label>
            <select
              className="input"
              value={followUpForm.status}
              onChange={(e) =>
                setFollowUpForm({
                  ...followUpForm,
                  status: e.target.value as FollowUpStatus,
                })
              }
            >
              <option value="called">已联系</option>
              <option value="scheduled">已预约</option>
              <option value="arrived">已到店</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          {followUpForm.status === 'scheduled' && (
            <div>
              <label className="label">预约到店时间</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="input flex-1"
                  value={followUpForm.scheduledDate}
                  onChange={(e) =>
                    setFollowUpForm({ ...followUpForm, scheduledDate: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="input w-32"
                  value={followUpForm.scheduledTime}
                  onChange={(e) =>
                    setFollowUpForm({ ...followUpForm, scheduledTime: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <div>
            <label className="label">跟进内容 *</label>
            <textarea
              className="input min-h-24 resize-none"
              placeholder="记录沟通内容、客户反馈、预约详情等..."
              value={followUpForm.content}
              onChange={(e) =>
                setFollowUpForm({ ...followUpForm, content: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowFollowUpModal(false)}
            >
              取消
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddFollowUp}
              disabled={!followUpForm.content.trim() || submittingFollowUp}
            >
              <Send className="w-4 h-4 mr-2" />
              {submittingFollowUp ? '保存中...' : '保存记录'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRecordDetail}
        onClose={() => setShowRecordDetail(false)}
        title="维修记录详情"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 mb-1">维修日期</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedRecord.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">记录编号</p>
                <p className="font-medium text-gray-900">#{selectedRecord.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">维修里程</p>
                <p className="font-medium text-gray-900">
                  {selectedRecord.mileage?.toLocaleString()} km
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">维修师傅</p>
                <p className="font-medium text-gray-900">
                  {selectedRecord.mechanicName || '-'}
                </p>
              </div>
              {(selectedRecord as any).durationMinutes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">维修用时</p>
                  <p className="font-medium text-gray-900">
                    {(selectedRecord as any).durationMinutes} 分钟
                  </p>
                </div>
              )}
              {(selectedRecord as any).isRework && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">返工</p>
                  <span className="badge-danger text-xs">是</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">维修项目</p>
              <div className="space-y-2">
                {selectedRecord.serviceItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{item.name}</span>
                    <div className="text-sm text-gray-500">
                      <span>×{item.quantity}</span>
                      <span className="mx-2">·</span>
                      <span>¥{item.price?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedRecord.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">备注</p>
                <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                  {selectedRecord.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
              <span className="text-gray-600">费用合计</span>
              <span className="text-2xl font-bold text-accent-600">
                ¥{selectedRecord.totalCost?.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                className="btn-secondary"
                onClick={() => {
                  handlePrintRecord(selectedRecord.id);
                  setShowRecordDetail(false);
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                打印
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowRecordDetail(false)}
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteRecord}
        onClose={() => setShowDeleteRecord(false)}
        onConfirm={handleDeleteRecord}
        title="删除维修记录"
        message="确定要删除这条维修记录吗？此操作不可撤销。"
        type="danger"
        confirmText="删除"
      />
    </div>
  );
}
