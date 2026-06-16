import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Calendar,
  Clock,
  User,
  Car,
  MessageSquare,
  Filter,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  CalendarCheck,
  PhoneCall,
  Eye,
  Edit3,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { FollowUpRecord, FollowUpStatus } from '../../shared/types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function FollowUpCenter() {
  const navigate = useNavigate();
  const { allFollowUps, fetchAllFollowUps, updateFollowUp, deleteFollowUp, loading } = useAppStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [scheduledDateFrom, setScheduledDateFrom] = useState('');
  const [scheduledDateTo, setScheduledDateTo] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FollowUpRecord | null>(null);
  const [editForm, setEditForm] = useState({
    type: '',
    content: '',
    scheduledDate: '',
    scheduledTime: '',
    status: 'called' as FollowUpStatus,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter, dateFrom, dateTo, scheduledDateFrom, scheduledDateTo]);

  const loadData = () => {
    const filters: any = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (scheduledDateFrom) filters.scheduledDateFrom = scheduledDateFrom;
    if (scheduledDateTo) filters.scheduledDateTo = scheduledDateTo;
    fetchAllFollowUps(filters);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatFullDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
        return <span className="badge-warning">待回访</span>;
      case 'arrived':
        return <span className="badge-success">已到店</span>;
      case 'cancelled':
        return <span className="badge-danger">已取消</span>;
      default:
        return null;
    }
  };

  const isOverdue = (scheduledDate?: string | null) => {
    if (!scheduledDate) return false;
    const scheduled = new Date(scheduledDate);
    const now = new Date();
    return scheduled < now;
  };

  const handleEdit = (record: FollowUpRecord) => {
    setEditingRecord(record);
    let datePart = '';
    let timePart = '';
    if (record.scheduledDate) {
      const dt = new Date(record.scheduledDate);
      datePart = dt.toISOString().split('T')[0];
      timePart = dt.toTimeString().slice(0, 5);
    }
    setEditForm({
      type: record.type,
      content: record.content,
      scheduledDate: datePart,
      scheduledTime: timePart,
      status: record.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      let scheduledDate: string | null = null;
      if (editForm.scheduledDate) {
        const time = editForm.scheduledTime || '09:00';
        scheduledDate = `${editForm.scheduledDate}T${time}:00`;
      }
      const updateData = {
        type: editForm.type,
        content: editForm.content,
        scheduledDate,
        status: editForm.status,
      };
      await updateFollowUp(editingRecord.id, updateData);
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkArrived = async (record: FollowUpRecord) => {
    try {
      await updateFollowUp(record.id, { status: 'arrived' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkArrivedAndCreateRecord = (record: FollowUpRecord) => {
    navigate(`/records/new?vehicleId=${record.vehicleId}`);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await deleteFollowUp(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setScheduledDateFrom('');
    setScheduledDateTo('');
  };

  const statusTabs = [
    { value: 'all', label: '全部' },
    { value: 'scheduled', label: '待回访' },
    { value: 'called', label: '已联系' },
    { value: 'arrived', label: '已到店' },
  ];

  const stats = {
    total: allFollowUps.length,
    scheduled: allFollowUps.filter((f) => f.status === 'scheduled').length,
    called: allFollowUps.filter((f) => f.status === 'called').length,
    arrived: allFollowUps.filter((f) => f.status === 'arrived').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客户回访中心</h1>
          <p className="text-gray-500 mt-1">管理所有客户跟进和预约记录</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-primary-600">全部记录</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-warning-50 to-warning-100">
          <div className="text-2xl font-bold text-warning-600">{stats.scheduled}</div>
          <div className="text-sm text-warning-600">待回访</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="text-2xl font-bold text-primary-600">{stats.called}</div>
          <div className="text-sm text-primary-600">已联系</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-success-50 to-success-100">
          <div className="text-2xl font-bold text-success-600">{stats.arrived}</div>
          <div className="text-sm text-success-600">已到店</div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">筛选条件</span>
          <button className="ml-auto text-sm text-primary-600 hover:text-primary-700" onClick={clearFilters}>
            清除筛选
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">联系日期</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="input flex-1"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <input
                type="date"
                className="input flex-1"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">预约日期</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="input flex-1"
                value={scheduledDateFrom}
                onChange={(e) => setScheduledDateFrom(e.target.value)}
              />
              <input
                type="date"
                className="input flex-1"
                value={scheduledDateTo}
                onChange={(e) => setScheduledDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 border-b border-gray-200">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                statusFilter === tab.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1 text-xs">
                  ({tab.value === 'scheduled' ? stats.scheduled : tab.value === 'called' ? stats.called : stats.arrived})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          加载中...
        </div>
      ) : allFollowUps.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无跟进记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allFollowUps.map((record) => (
            <div
              key={record.id}
              className={`card p-4 transition-all hover:shadow-md ${
                record.status === 'scheduled' && isOverdue(record.scheduledDate)
                  ? 'border-l-4 border-l-danger-500'
                  : record.status === 'scheduled'
                  ? 'border-l-4 border-l-warning-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {record.vehicle && (
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-primary-500" />
                        <span className="font-semibold text-gray-900">{record.vehicle.plateNumber}</span>
                        <span className="text-gray-400">·</span>
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{record.vehicle.ownerName}</span>
                      </div>
                    )}
                    {getStatusBadge(record.status)}
                    {record.status === 'scheduled' && isOverdue(record.scheduledDate) && (
                      <span className="text-xs text-danger-600 font-medium">已超时</span>
                    )}
                    {record.source && (
                      <span className="text-xs text-gray-400">来源：{record.source}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(record.createdAt)}
                    </span>
                    {record.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        预约：{formatFullDateTime(record.scheduledDate)}
                      </span>
                    )}
                    {record.arrivedAt && (
                      <span className="flex items-center gap-1 text-success-600">
                        <CheckCircle className="w-4 h-4" />
                        到店：{formatDateTime(record.arrivedAt)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700">
                    <span className="text-primary-600 font-medium">{record.type}：</span>
                    {record.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {record.status === 'scheduled' && (
                    <>
                      <button
                        className="btn-success btn-sm"
                        onClick={() => handleMarkArrived(record)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        标记到店
                      </button>
                      <button
                        className="btn-accent btn-sm"
                        onClick={() => handleMarkArrivedAndCreateRecord(record)}
                      >
                        <Wrench className="w-4 h-4 mr-1" />
                        到店开单
                      </button>
                    </>
                  )}
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => navigate(`/vehicles/${record.vehicleId}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    车辆详情
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => handleEdit(record)}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    编辑
                  </button>
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => {
                      setDeletingId(record.id);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑跟进记录"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">跟进类型</label>
            <select
              className="input w-full"
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
            >
              <option value="电话联系">电话联系</option>
              <option value="微信联系">微信联系</option>
              <option value="短信提醒">短信提醒</option>
              <option value="客户到店">客户到店</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">跟进内容</label>
            <textarea
              className="input w-full h-24"
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">预约到店时间</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="input flex-1"
                value={editForm.scheduledDate}
                onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
              />
              <input
                type="time"
                className="input w-32"
                value={editForm.scheduledTime}
                onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              className="input w-full"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as FollowUpStatus })}
            >
              <option value="called">已联系</option>
              <option value="scheduled">待回访</option>
              <option value="arrived">已到店</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
              取消
            </button>
            <button className="btn-primary" onClick={handleSaveEdit}>
              保存
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="删除跟进记录"
        message="确定要删除这条跟进记录吗？此操作不可撤销。"
        confirmText="删除"
        type="danger"
      />
    </div>
  );
}
