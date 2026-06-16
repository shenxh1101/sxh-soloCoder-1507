import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Wrench,
  Bell,
  DollarSign,
  Plus,
  Phone,
  AlertCircle,
  Clock,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { useAppStore } from '../store/useAppStore';
import type { Reminder } from '../../shared/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    dashboardStats,
    reminders,
    fetchDashboardStats,
    fetchReminders,
    updateReminderStatus,
  } = useAppStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchReminders('pending');
  }, [fetchDashboardStats, fetchReminders]);

  const pendingReminders = reminders.slice(0, 5);

  const handleCall = (reminder: Reminder) => {
    if (reminder.vehicle?.ownerPhone) {
      window.location.href = `tel:${reminder.vehicle.ownerPhone}`;
      updateReminderStatus(reminder.id, 'notified');
    }
  };

  const getUrgencyBadge = (remaining?: number) => {
    if (remaining === undefined) return null;
    if (remaining <= 0) {
      return <span className="badge-danger">已到期</span>;
    }
    if (remaining <= 500) {
      return <span className="badge-warning">即将到期</span>;
    }
    return <span className="badge-primary">待保养</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">首页仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎回来，查看今日工作概览</p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn-primary"
            onClick={() => navigate('/vehicles/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加车辆
          </button>
          <button
            className="btn-accent"
            onClick={() => navigate('/records/new')}
          >
            <Wrench className="w-4 h-4 mr-2" />
            记录维修
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="车辆总数"
          value={dashboardStats?.totalVehicles || 0}
          icon={Car}
          color="primary"
          subtext="登记在册的客户车辆"
        />
        <StatCard
          title="本月维修"
          value={dashboardStats?.thisMonthRecords || 0}
          icon={Wrench}
          color="accent"
          subtext="本月维修记录数"
        />
        <StatCard
          title="本月收入"
          value={`¥${(dashboardStats?.thisMonthRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="success"
          subtext="本月总营收"
        />
        <StatCard
          title="待提醒"
          value={dashboardStats?.pendingReminders || 0}
          icon={Bell}
          color="warning"
          subtext="即将到期保养的车辆"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                保养提醒
              </h2>
              <button
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => navigate('/reminders')}
              >
                查看全部 →
              </button>
            </div>

            {pendingReminders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无待提醒的保养</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/vehicles/${reminder.vehicleId}`)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          reminder.remainingMileage &&
                          reminder.remainingMileage <= 0
                            ? 'bg-danger-100 text-danger-600'
                            : reminder.remainingMileage &&
                              reminder.remainingMileage <= 500
                            ? 'bg-warning-100 text-warning-600'
                            : 'bg-primary-100 text-primary-600'
                        }`}
                      >
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {reminder.vehicle?.plateNumber}
                          </span>
                          {getUrgencyBadge(reminder.remainingMileage)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {reminder.vehicle?.ownerName} ·{' '}
                          {reminder.vehicle?.carModel}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          还剩{' '}
                          <span className="font-medium">
                            {reminder.remainingMileage?.toLocaleString() || 0}
                          </span>{' '}
                          公里
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn-accent btn-sm no-print"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCall(reminder);
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      联系客户
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              快捷操作
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex flex-col items-center justify-center p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors text-primary-700"
                onClick={() => navigate('/vehicles/new')}
              >
                <Car className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">添加车辆</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 bg-accent-50 rounded-xl hover:bg-accent-100 transition-colors text-accent-700"
                onClick={() => navigate('/records/new')}
              >
                <Wrench className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">记录维修</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 bg-success-50 rounded-xl hover:bg-success-100 transition-colors text-success-700"
                onClick={() => navigate('/reminders')}
              >
                <Bell className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">保养提醒</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 bg-warning-50 rounded-xl hover:bg-warning-100 transition-colors text-warning-700"
                onClick={() => navigate('/statistics')}
              >
                <DollarSign className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">统计报表</span>
              </button>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-800 to-primary-900 text-white">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-accent-400" />
              <h3 className="font-semibold">今日提示</h3>
            </div>
            <p className="text-sm text-primary-200">
              今天有 {dashboardStats?.pendingReminders || 0} 辆车需要保养提醒，
              记得及时联系客户哦！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
