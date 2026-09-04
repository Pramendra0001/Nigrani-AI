import React from 'react';
import { Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  status: string;
  type?: 'project' | 'review';
}

export const StatusBadge: React.FC<Props> = ({ status, type = 'project' }) => {
  const norm = (status || '').toUpperCase();

  if (type === 'review') {
    const config: Record<string, { bg: string; label: string; icon: any }> = {
      NEW: {
        bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/60 text-sky-700 dark:text-sky-300',
        label: 'NEW CASE',
        icon: AlertCircle,
      },
      UNDER_REVIEW: {
        bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/60 text-purple-700 dark:text-purple-300',
        label: 'UNDER REVIEW',
        icon: Clock,
      },
      ADDITIONAL_INFORMATION_REQUIRED: {
        bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300',
        label: 'INFO REQUIRED',
        icon: HelpCircle,
      },
      RESOLVED: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300',
        label: 'RESOLVED / CLEARED',
        icon: CheckCircle2,
      },
    };

    const item = config[norm] || {
      bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
      label: norm,
      icon: Clock,
    };
    const Icon = item.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${item.bg}`}>
        <Icon className="w-3 h-3" />
        {item.label}
      </span>
    );
  }

  // Project status
  const pConfig: Record<string, string> = {
    ONGOING: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
    COMPLETED: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    DELAYED: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
    NOT_STARTED: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    SUSPENDED: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${pConfig[norm] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
      {norm}
    </span>
  );
};
