import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'accent' | 'success' | 'warning';
  subtext?: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtext,
  trend,
  trendUp,
}: StatCardProps) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
  };

  const iconBgClasses = {
    primary: 'bg-white/20',
    accent: 'bg-white/20',
    success: 'bg-white/20',
    warning: 'bg-white/20',
  };

  return (
    <div
      className={`card overflow-hidden bg-gradient-to-br ${colorClasses[color]} text-white`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtext && (
              <p className="text-white/70 text-xs mt-1">{subtext}</p>
            )}
            {trend && (
              <p
                className={`text-xs mt-2 font-medium ${
                  trendUp ? 'text-white' : 'text-white/70'
                }`}
              >
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl ${iconBgClasses[color]} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
