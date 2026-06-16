import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Bell,
  BarChart3,
  Settings,
  WrenchIcon,
  PhoneCall,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';


const navItems = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/vehicles', label: '车辆管理', icon: Car },
  { path: '/records', label: '维修记录', icon: Wrench },
  { path: '/reminders', label: '保养提醒', icon: Bell },
  { path: '/follow-ups', label: '回访中心', icon: PhoneCall },
  { path: '/statistics', label: '统计报表', icon: BarChart3 },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { settings, fetchSettings, dashboardStats, fetchDashboardStats, fetchReminders, reminders } = useAppStore();

  useEffect(() => {
    fetchSettings();
    fetchDashboardStats();
    fetchReminders('pending');
  }, [fetchSettings, fetchDashboardStats, fetchReminders]);

  const pendingCount = reminders.filter(r => r.status === 'pending').length;

  return (
    <aside className="no-print fixed left-0 top-0 h-full w-64 bg-primary-800 text-white flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
            <WrenchIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              {settings?.shopName || '汽修管理系统'}
            </h1>
            <p className="text-xs text-primary-300">车辆保养管理</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                      : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.path === '/reminders' && pendingCount > 0 && (
                    <span className="ml-auto bg-danger-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-700">
        <div className="text-xs text-primary-400 text-center">
          © 2024 汽修管理系统
        </div>
      </div>
    </aside>
  );
}
