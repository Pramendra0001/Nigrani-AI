import React from 'react';
import { Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  status: string;
  type?: 'project' | 'review';
}

export const StatusBadge: React.FC<Props> = ({ status, type = 'project' }) => {
  const norm = (status || '').toUpperCase();

  if (type === 'review') {
    const config: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      NEW: {
        bg: 'bg-blue-50 border-blue-200 text-blue-700',
        text: 'text-blue-700',
        label: 'NEW CASE',
        icon: AlertCircle,
      },
      UNDER_REVIEW: {
        bg: 'bg-purple-50 border-purple-200 text-purple-700',
        text: 'text-purple-700',
        label: 'UNDER REVIEW',
        icon: Clock,
      },
      ADDITIONAL_INFORMATION_REQUIRED: {
        bg: 'bg-amber-50 border-amber-200 text-amber-700',
        text: 'text-amber-700',
        label: 'INFO REQUIRED',
        icon: HelpCircle,
      },
      RESOLVED: {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        text: 'text-emerald-700',
        label: 'RESOLVED / CLEARED',
        icon: CheckCircle2,
      },
    };

    const item = config[norm] || {
      bg: 'bg-slate-50 border-slate-200 text-slate-700',
      text: 'text-slate-700',
      label: norm,
      icon: Clock,
    };
    const Icon = item.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${item.bg}`}>
        <Icon className="w-3 h-3" />
        {item.label}
      </span>
    );
  }

  // Project status
  const pConfig: Record<string, string> = {
    ONGOING: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DELAYED: 'bg-rose-50 text-rose-700 border-rose-200',
    NOT_STARTED: 'bg-slate-100 text-slate-700 border-slate-200',
    SUSPENDED: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${pConfig[norm] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {norm}
    </span>
  );
};
