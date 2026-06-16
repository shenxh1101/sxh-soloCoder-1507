import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Car,
  DollarSign,
  User,
  Calendar,
  Search,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function RecordList() {
  const navigate = useNavigate();
  const { records, recordsTotal, fetchRecords } = useAppStore();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchRecords(page, pageSize);
  }, [page, pageSize, fetchRecords]);

  const totalPages = Math.ceil(recordsTotal / pageSize);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">维修记录</h1>
          <p className="text-gray-500 mt-1">共 {recordsTotal} 条记录</p>
        </div>
        <button className="btn-accent" onClick={() => navigate('/records/new')}>
          <Plus className="w-4 h-4 mr-2" />
          记录维修
        </button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="搜索车牌号、车主..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">暂无维修记录</p>
            <p className="text-sm mt-1">点击右上角按钮添加第一条维修记录</p>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>车辆</th>
                  <th>维修项目</th>
                  <th>维修师傅</th>
                  <th>里程</th>
                  <th>费用</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record: any) => (
                  <tr
                    key={record.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/vehicles/${record.vehicleId}`)}
                  >
                    <td>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(record.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Car className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.vehicle?.plateNumber || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.vehicle?.ownerName || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {record.serviceItems?.slice(0, 2).map((item: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {item.name}
                          </span>
                        ))}
                        {record.serviceItems?.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                            +{record.serviceItems.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-gray-600">
                        <User className="w-4 h-4" />
                        {record.mechanicName || '-'}
                      </span>
                    </td>
                    <td className="text-gray-600">
                      {record.mileage?.toLocaleString()} km
                    </td>
                    <td>
                      <span className="font-semibold text-accent-600">
                        ¥{record.totalCost?.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  第 {page} / {totalPages} 页，共 {recordsTotal} 条
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
    </div>
  );
}
