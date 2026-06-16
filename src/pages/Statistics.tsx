import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wrench,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Statistics() {
  const {
    serviceTypeStats,
    mechanicStats,
    revenueStats,
    fetchServiceTypeStats,
    fetchMechanicStats,
    fetchRevenueStats,
  } = useAppStore();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchServiceTypeStats(currentMonth);
    fetchMechanicStats(currentMonth);
    fetchRevenueStats(6);
  }, [currentMonth, fetchServiceTypeStats, fetchMechanicStats, fetchRevenueStats]);

  const maxServiceCount = Math.max(...serviceTypeStats.map((s) => s.count), 1);
  const maxRevenue = Math.max(...revenueStats.map((r) => r.revenue), 1);

  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${month}月`;
  };

  const totalRevenue = revenueStats.reduce((sum, r) => sum + r.revenue, 0);
  const totalRecords = revenueStats.reduce((sum, r) => sum + r.recordCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计报表</h1>
          <p className="text-gray-500 mt-1">查看业务数据和分析</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            className="input w-auto"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthStr = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, '0')}`;
              return (
                <option key={monthStr} value={monthStr}>
                  {date.getFullYear()}年{date.getMonth() + 1}月
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">6个月总收入</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">6个月总维修</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRecords} 次
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均客单价</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{totalRecords > 0 ? Math.round(totalRevenue / totalRecords).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            本月故障类型分布
          </h2>
          {serviceTypeStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>本月暂无数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceTypeStats.slice(0, 8).map((item, index) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 font-medium">
                      {index + 1}. {item.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.count} 次 ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{
                        width: `${(item.count / maxServiceCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-600" />
            本月师傅排名
          </h2>
          {mechanicStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>本月暂无数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mechanicStats.map((mechanic, index) => (
                <div
                  key={mechanic.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-700'
                        : index === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {mechanic.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mechanic.recordCount} 次维修
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent-600">
                      ¥{mechanic.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      均价 ¥{mechanic.avgCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success-600" />
          近6个月收入趋势
        </h2>
        <div className="h-64 flex items-end justify-between gap-4">
          {revenueStats.map((item, index) => (
            <div key={item.month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center mb-3">
                <span className="text-sm font-semibold text-accent-600 mb-1">
                  ¥{item.revenue.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">
                  {item.recordCount} 单
                </span>
              </div>
              <div
                className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(item.revenue / maxRevenue) * 100}%`,
                  minHeight: '8px',
                }}
              />
              <span className="mt-2 text-sm text-gray-500">
                {getMonthLabel(item.month)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
