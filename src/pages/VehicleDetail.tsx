import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ConfirmDialog from '../components/ConfirmDialog';
import type { MaintenanceRecord } from '../../shared/types';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchVehicleDetail, deleteVehicle, loading } = useAppStore();

  const [vehicle, setVehicle] = useState<any>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (vehicleId: number) => {
    try {
      const data = await fetchVehicleDetail(vehicleId);
      setVehicle(data.vehicle);
      setRecords(data.records || []);
    } catch (e) {
      console.error(e);
    }
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
            onClick={() => window.open(`/print/${id}`, '_blank')}
          >
            <Printer className="w-4 h-4 mr-2" />
            打印记录
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

        <div className="lg:col-span-2">
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
                    className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary-500 ring-4 ring-white" />
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatDate(record.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Gauge className="w-3 h-3" />
                            {record.mileage?.toLocaleString()} km
                          </p>
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

                      <div className="flex flex-wrap gap-2 mb-2">
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
                        <p className="text-sm text-gray-500 bg-white p-2 rounded-lg">
                          备注：{record.notes}
                        </p>
                      )}
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
    </div>
  );
}
