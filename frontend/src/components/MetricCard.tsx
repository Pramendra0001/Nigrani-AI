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
      border: 'border-slate-200/80 dark:border-slate-800/80',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
      valColor: 'text-slate-900 dark:text-white',
      accent: 'hover:border-slate-300 dark:hover:border-slate-700',
    },
    danger: {
      border: 'border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-br from-white to-rose-50/30 dark:from-[#0b1222] dark:to-rose-950/20',
      iconBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      valColor: 'text-rose-700 dark:text-rose-400',
      accent: 'hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-rose-500/5',
    },
    warning: {
      border: 'border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-white to-amber-50/30 dark:from-[#0b1222] dark:to-amber-950/20',
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      valColor: 'text-amber-700 dark:text-amber-400',
      accent: 'hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-amber-500/5',
    },
    info: {
      border: 'border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-br from-white to-sky-50/30 dark:from-[#0b1222] dark:to-sky-950/20',
      iconBg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
      valColor: 'text-sky-700 dark:text-sky-400',
      accent: 'hover:border-sky-300 dark:hover:border-sky-800 hover:shadow-sky-500/5',
    },
    success: {
      border: 'border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-white to-emerald-50/30 dark:from-[#0b1222] dark:to-emerald-950/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      valColor: 'text-emerald-700 dark:text-emerald-400',
      accent: 'hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-emerald-500/5',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white dark:bg-[#0b1222] p-4 sm:p-5 shadow-xs transition-all duration-200 w-full min-w-0 overflow-hidden ${styles.border} ${styles.accent} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className={`mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight truncate ${styles.valColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 sm:p-3 shrink-0 ${styles.iconBg}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};
