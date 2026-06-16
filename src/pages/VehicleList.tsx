import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Search,
  Plus,
  Phone,
  Calendar,
  Gauge,
  ChevronRight,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ConfirmDialog from '../components/ConfirmDialog';

export default function VehicleList() {
  const navigate = useNavigate();
  const { vehicles, vehiclesTotal, fetchVehicles, deleteVehicle } = useAppStore();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchVehicles(page, pageSize, keyword);
  }, [page, pageSize, keyword, fetchVehicles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles(1, pageSize, keyword);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(deleteId);
      fetchVehicles(page, pageSize, keyword);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(vehiclesTotal / pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">车辆管理</h1>
          <p className="text-gray-500 mt-1">共 {vehiclesTotal} 辆车</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/vehicles/new')}>
          <Plus className="w-4 h-4 mr-2" />
          添加车辆
        </button>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="搜索车牌号、车主姓名、电话..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary">
            搜索
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {vehicles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">暂无车辆数据</p>
            <p className="text-sm mt-1">点击右上角按钮添加第一辆车</p>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>车牌号</th>
                  <th>车主</th>
                  <th>车型</th>
                  <th>当前里程</th>
                  <th>下次保养</th>
                  <th>上次维修</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {vehicle.plateNumber}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">
                        {vehicle.ownerName}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {vehicle.ownerPhone}
                      </p>
                    </div>
                  </td>
                  <td className="text-gray-600">{vehicle.carModel || '-'}</td>
                  <td className="text-gray-600">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      {vehicle.currentMileage.toLocaleString()} km
                    </span>
                  </td>
                  <td>
                    {vehicle.nextMaintenanceMileage ? (
                      <span
                        className={`${
                          vehicle.nextMaintenanceMileage <=
                          vehicle.currentMileage
                            ? 'text-danger-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {vehicle.nextMaintenanceMileage.toLocaleString()} km
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-gray-500 text-sm">
                    {vehicle.lastMaintenanceDate ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(
                          vehicle.lastMaintenanceDate
                        ).toLocaleDateString()}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2 no-print">
                      <button
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vehicles/${vehicle.id}/edit`);
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(vehicle.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  第 {page} / {totalPages} 页，共 {vehiclesTotal} 条
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    上一页
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
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
