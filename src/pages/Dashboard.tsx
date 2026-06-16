import { useEffect, useState } from 'react';
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
  X,
  Calendar,
  CalendarCheck,
  CheckCircle,
  User,
  PhoneCall,
} from 'lucide-react';
import Modal from '../components/Modal';
import type { Reminder, FollowUpRecord, FollowUpStatus } from '../../shared/types';
import StatCard from '../components/StatCard';
import { useAppStore } from '../store/useAppStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    dashboardStats,
    reminders,
    allFollowUps,
    fetchDashboardStats,
    fetchReminders,
    fetchAllFollowUps,
    updateReminderStatus,
    addFollowUp,
    updateFollowUp,
  } = useAppStore();
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    fetchReminders('pending');
    fetchAllFollowUps({ status: 'scheduled' });
  }, [fetchDashboardStats, fetchReminders, fetchAllFollowUps]);

  useEffect(() => {
    if (reminders.length > 0) {
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem('lastReminderModalDate');
      const notifiedToday = JSON.parse(localStorage.getItem('notifiedRemindersToday') || '[]');
      const unnotified = reminders.filter((r) => !notifiedToday.includes(r.id));

      if (lastShown !== today && unnotified.length > 0) {
        setShowReminderModal(true);
        localStorage.setItem('lastReminderModalDate', today);
      }
    }
  }, [reminders]);

  const pendingReminders = reminders.slice(0, 5);

  const getScheduledFollowUps = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return allFollowUps.filter((f) => {
      if (!f.scheduledDate || f.status !== 'scheduled') return false;
      const scheduled = new Date(f.scheduledDate);
      return scheduled >= targetDate && scheduled < nextDay;
    });
  };

  const isOverdue = (scheduledDate?: string | null) => {
    if (!scheduledDate) return false;
    const scheduled = new Date(scheduledDate);
    const now = new Date();
    return scheduled < now;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('zh-CN', {
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

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleCall = (reminder: Reminder) => {
    if (reminder.vehicle?.ownerPhone) {
      window.location.href = `tel:${reminder.vehicle.ownerPhone}`;
    }
    setCurrentReminder(reminder);
    setScheduleDate('');
    setScheduleTime('');
    setShowScheduleModal(true);
  };

  const handleCompleteCall = async () => {
    if (!currentReminder) return;
    
    const notifiedToday = JSON.parse(localStorage.getItem('notifiedRemindersToday') || '[]');
    if (!notifiedToday.includes(currentReminder.id)) {
      notifiedToday.push(currentReminder.id);
      localStorage.setItem('notifiedRemindersToday', JSON.stringify(notifiedToday));
    }

    const scheduledDateTime = scheduleDate && scheduleTime
      ? `${scheduleDate}T${scheduleTime}:00`
      : scheduleDate
      ? `${scheduleDate}T09:00:00`
      : null;

    const status: FollowUpStatus = scheduledDateTime ? 'scheduled' : 'called';

    try {
      await Promise.all([
        updateReminderStatus(currentReminder.id, 'notified'),
        addFollowUp({
          vehicleId: currentReminder.vehicleId,
          type: '电话联系',
          content: scheduledDateTime
            ? `电话联系客户，提醒车辆保养，已预约到店时间。`
            : '电话联系客户，提醒车辆保养，暂未预约到店时间。',
          scheduledDate: scheduledDateTime,
          status,
          source: '首页弹窗',
        }),
      ]);
      
      fetchReminders('pending');
      fetchDashboardStats();
      fetchAllFollowUps({ status: 'scheduled' });
      setShowScheduleModal(false);
      setCurrentReminder(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkArrived = async (record: FollowUpRecord) => {
    try {
      await updateFollowUp(record.id, { status: 'arrived' });
      fetchAllFollowUps({ status: 'scheduled' });
    } catch (e) {
      console.error(e);
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
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-accent-600" />
                </div>
                <h3 className="font-semibold text-gray-900">今日预约</h3>
              </div>
              {getScheduledFollowUps(new Date().toISOString().split('T')[0]).length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">今日暂无预约</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getScheduledFollowUps(new Date().toISOString().split('T')[0]).map((record) => (
                    <div
                      key={record.id}
                      className={`p-3 rounded-lg border ${
                        isOverdue(record.scheduledDate)
                          ? 'bg-danger-50 border-danger-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary-500" />
                          <span className="font-medium text-gray-900">
                            {record.vehicle?.plateNumber}
                          </span>
                        </div>
                        {isOverdue(record.scheduledDate) && (
                          <span className="text-xs text-danger-600 font-medium">已超时</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {record.vehicle?.ownerName}
                        <span className="text-gray-300">·</span>
                        <Clock className="w-3 h-3" />
                        {formatTime(record.scheduledDate!)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn-success btn-xs flex-1"
                          onClick={() => handleMarkArrived(record)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已到店
                        </button>
                        <button
                          className="btn-secondary btn-xs"
                          onClick={() => navigate(`/vehicles/${record.vehicleId}`)}
                        >
                          详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">明日预约</h3>
              </div>
              {getScheduledFollowUps(getTomorrow()).length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">明日暂无预约</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getScheduledFollowUps(getTomorrow()).map((record) => (
                    <div
                      key={record.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary-500" />
                          <span className="font-medium text-gray-900">
                            {record.vehicle?.plateNumber}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {record.vehicle?.ownerName}
                        <span className="text-gray-300">·</span>
                        <Clock className="w-3 h-3" />
                        {formatTime(record.scheduledDate!)}
                      </div>
                      <button
                        className="btn-secondary btn-xs w-full"
                        onClick={() => navigate(`/vehicles/${record.vehicleId}`)}
                      >
                        查看详情
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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

      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-warning-50 to-accent-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">保养提醒</h3>
                  <p className="text-sm text-gray-500">以下车辆即将到保养里程</p>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center text-gray-500 transition-colors"
                onClick={() => setShowReminderModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto max-h-[50vh]">
              {reminders
                .filter((r) => {
                  const notifiedToday = JSON.parse(localStorage.getItem('notifiedRemindersToday') || '[]');
                  return !notifiedToday.includes(r.id);
                })
                .map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {reminder.vehicle?.plateNumber}
                      </span>
                      {getUrgencyBadge(reminder.remainingMileage)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {reminder.vehicle?.ownerName} · {reminder.vehicle?.ownerPhone}
                  </p>
                  <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    还剩 <span className="font-medium text-gray-700">{reminder.remainingMileage?.toLocaleString() || 0}</span> 公里
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="btn-accent btn-sm flex-1"
                      onClick={() => handleCall(reminder)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      电话联系
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => navigate(`/vehicles/${reminder.vehicleId}`)}
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                className="btn-primary w-full"
                onClick={() => setShowReminderModal(false)}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && currentReminder && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="预约到店时间"
        >
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-gray-900">
                  {currentReminder.vehicle?.plateNumber}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <User className="w-4 h-4 inline mr-1" />
                {currentReminder.vehicle?.ownerName}
                <span className="mx-2 text-gray-300">·</span>
                <Phone className="w-4 h-4 inline mr-1" />
                {currentReminder.vehicle?.ownerPhone}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预约日期
                </label>
                <input
                  type="date"
                  className="input w-full"
                  value={scheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预约时间
                </label>
                <input
                  type="time"
                  className="input w-full"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                <span>
                  已自动拨打电话联系客户。请在上方选择预约到店时间，或直接确认无需预约。
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="btn-secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                取消
              </button>
              <button className="btn-primary" onClick={handleCompleteCall}>
                {scheduleDate ? '确认预约' : '暂不预约'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
