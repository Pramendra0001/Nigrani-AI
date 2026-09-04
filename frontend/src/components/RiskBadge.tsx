import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface Props {
  level?: string | null;
  score?: number | null;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ level, score, showScore = true, size = 'md' }) => {
  const normalized = (level || 'LOW').toUpperCase();

  const config = {
    LOW: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'LOW RISK',
    },
    MEDIUM: {
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'MEDIUM RISK',
    },
    HIGH: {
      bg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200/80 dark:border-orange-800/60 text-orange-700 dark:text-orange-300',
      dot: 'bg-orange-500',
      icon: AlertOctagon,
      label: 'HIGH RISK',
    },
    CRITICAL: {
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60 text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      icon: Flame,
      label: 'CRITICAL RISK',
    },
  }[normalized] || {
    bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
    icon: ShieldCheck,
    label: normalized || 'PENDING',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1 gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-all ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {showScore && score !== undefined && score !== null && (
        <span className="opacity-80 font-mono ml-0.5 text-[10px]">({score.toFixed(1)})</span>
      )}
    </span>
  );
};
