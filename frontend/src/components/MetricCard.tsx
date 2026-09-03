import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  onClick?: () => void;
}

export const MetricCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const styles = {
    default: {
      border: 'border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-700',
      valColor: 'text-slate-900',
      accent: 'hover:border-slate-300',
    },
    danger: {
      border: 'border-rose-200/80 bg-gradient-to-br from-white to-rose-50/30',
      iconBg: 'bg-rose-100 text-rose-600',
      valColor: 'text-rose-700',
      accent: 'hover:border-rose-300 hover:shadow-rose-100',
    },
    warning: {
      border: 'border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30',
      iconBg: 'bg-amber-100 text-amber-600',
      valColor: 'text-amber-700',
      accent: 'hover:border-amber-300 hover:shadow-amber-100',
    },
    info: {
      border: 'border-blue-200/80 bg-gradient-to-br from-white to-blue-50/30',
      iconBg: 'bg-blue-100 text-blue-600',
      valColor: 'text-blue-700',
      accent: 'hover:border-blue-300 hover:shadow-blue-100',
    },
    success: {
      border: 'border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30',
      iconBg: 'bg-emerald-100 text-emerald-600',
      valColor: 'text-emerald-700',
      accent: 'hover:border-emerald-300 hover:shadow-emerald-100',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 ${styles.border} ${styles.accent} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-extrabold tracking-tight ${styles.valColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
