import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Phone,
  Check,
  Clock,
  CalendarClock,
  Car,
  AlertTriangle,
  User,
  PhoneCall,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Modal from '../components/Modal';
import type { Reminder, ReminderStatus, FollowUpStatus } from '../../shared/types';

export default function ReminderList() {
  const navigate = useNavigate();
  const {
    reminders,
    remindersTotal,
    fetchReminders,
    updateReminderStatus,
    postponeReminder,
    addFollowUp,
  } = useAppStore();
  const [filter, setFilter] = useState<ReminderStatus | 'all'>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    fetchReminders(filter === 'all' ? undefined : filter);
  }, [filter, fetchReminders]);

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
          source: '保养提醒页',
        }),
      ]);
      
      fetchReminders(filter === 'all' ? undefined : filter);
      setShowScheduleModal(false);
      setCurrentReminder(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = (id: number) => {
    updateReminderStatus(id, 'completed');
  };

  const handlePostpone = (id: number) => {
    postponeReminder(id, 1000);
    fetchReminders(filter === 'all' ? undefined : filter);
  };

  const getUrgencyLevel = (remaining?: number) => {
    if (remaining === undefined) return 'normal';
    if (remaining <= 0) return 'overdue';
    if (remaining <= 500) return 'urgent';
    if (remaining <= 1000) return 'soon';
    return 'normal';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'overdue':
        return 'border-danger-400 bg-danger-50';
      case 'urgent':
        return 'border-warning-400 bg-warning-50';
      case 'soon':
        return 'border-accent-400 bg-accent-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="badge-warning">待提醒</span>;
      case 'notified':
        return <span className="badge-primary">已通知</span>;
      case 'completed':
        return <span className="badge-success">已完成</span>;
      case 'postponed':
        return <span className="badge-accent">已延后</span>;
      default:
        return null;
    }
  };

  const filters: { key: ReminderStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待提醒' },
    { key: 'notified', label: '已通知' },
    { key: 'completed', label: '已完成' },
    { key: 'postponed', label: '已延后' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">保养提醒</h1>
          <p className="text-gray-500 mt-1">
            共 {remindersTotal} 条提醒
          </p>
        </div>
      </div>

      <div className="card p-2">
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无保养提醒</p>
          <p className="text-sm mt-1">车辆保养到期后会自动出现在这里</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder) => {
            const urgency = getUrgencyLevel(reminder.remainingMileage);
            const isOverdue =
              reminder.remainingMileage !== undefined &&
              reminder.remainingMileage <= 0;

            return (
              <div
                key={reminder.id}
                className={`card p-5 border-l-4 ${getUrgencyColor(
                  urgency
                )} transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isOverdue
                          ? 'bg-danger-100 text-danger-600'
                          : urgency === 'urgent'
                          ? 'bg-warning-100 text-warning-600'
                          : 'bg-primary-100 text-primary-600'
                      }`}
                    >
                      {isOverdue ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <Bell className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">
                          {reminder.vehicle?.plateNumber}
                        </span>
                        {getStatusBadge(reminder.status)}
                      </div>
                      <p className="text-gray-600 mt-1">
                        {reminder.vehicle?.ownerName} ·{' '}
                        {reminder.vehicle?.carModel || '未填写车型'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        当前里程：
                        {reminder.currentMileage?.toLocaleString()} km /
                        目标：{reminder.targetMileage?.toLocaleString()} km
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        isOverdue
                          ? 'text-danger-600'
                          : urgency === 'urgent'
                          ? 'text-warning-600'
                          : 'text-primary-600'
                      }`}
                    >
                      {reminder.remainingMileage !== undefined
                        ? isOverdue
                          ? `超 ${Math.abs(
                              reminder.remainingMileage
                            ).toLocaleString()}`
                          : `${reminder.remainingMileage.toLocaleString()} km`
                        : '-'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {isOverdue ? '已超出保养里程' : '距离保养'}
                    </p>
                  </div>
                </div>

                {reminder.status !== 'completed' && (
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 no-print">
                    {reminder.status === 'pending' && (
                      <>
                        <button
                          className="btn-accent btn-sm"
                          onClick={() => handleCall(reminder)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          电话联系
                        </button>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handlePostpone(reminder.id)}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          延后 1000km
                        </button>
                      </>
                    )}
                    {reminder.status === 'notified' && (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleComplete(reminder.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        标记已完成
                      </button>
                    )}
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() =>
                        navigate(`/vehicles/${reminder.vehicleId}`)
                      }
                    >
                      查看详情
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
