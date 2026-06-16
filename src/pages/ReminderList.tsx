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
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Reminder, ReminderStatus } from '../../shared/types';

export default function ReminderList() {
  const navigate = useNavigate();
  const { reminders, remindersTotal, fetchReminders, updateReminderStatus, postponeReminder } =
    useAppStore();
  const [filter, setFilter] = useState<ReminderStatus | 'all'>('all');

  useEffect(() => {
    fetchReminders(filter === 'all' ? undefined : filter);
  }, [filter, fetchReminders]);

  const handleCall = (reminder: Reminder) => {
    if (reminder.vehicle?.ownerPhone) {
      window.location.href = `tel:${reminder.vehicle.ownerPhone}`;
      updateReminderStatus(reminder.id, 'notified');
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
    </div>
  );
}
