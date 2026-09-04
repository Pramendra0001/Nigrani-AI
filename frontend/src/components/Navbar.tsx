import React, { useState } from 'react';
import {
  RefreshCw,
  Menu,
  X,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api';
import { NigraniLogo } from './NigraniLogo';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  onNavigateTab: (tab: string) => void;
  onBatchAnalyze?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<Props> = ({
  onNavigateTab,
  onBatchAnalyze,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [sweepNotice, setSweepNotice] = useState(false);

  const handleBatch = async () => {
    try {
      setAnalyzing(true);
      await api.analyzeBatch();
      if (onBatchAnalyze) onBatchAnalyze();
      setSweepNotice(true);
      setTimeout(() => setSweepNotice(false), 3500);
    } catch (err: any) {
      alert(`Batch analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#070b14]/90 px-4 sm:px-6 backdrop-blur-md transition-colors">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden rounded-lg p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <div
          onClick={() => onNavigateTab('dashboard')}
          className="cursor-pointer flex items-center gap-3 group"
          title="Nigrani AI — Public Project Intelligence"
        >
          <NigraniLogo size="md" showWordmark={true} showSubtitle={false} />
          
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="rounded-md bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 tracking-wide border border-sky-200/70 dark:border-sky-800/50">
              Official MPLADS Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Offline Demo Mode Status Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium">Offline Intelligence Active</span>
        </div>

        {/* Sweep Success Notification Pill */}
        {sweepNotice && (
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="text-[11px]">Screening Complete</span>
          </div>
        )}

        {/* Batch Anomaly Sweep Trigger */}
        <button
          onClick={handleBatch}
          disabled={analyzing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/60 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition active:scale-95 disabled:opacity-50"
          title="Run statistical anomaly screening across all active project portfolios"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${analyzing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline text-[11px]">{analyzing ? 'Screening...' : 'Run Intelligence Sweep'}</span>
          <span className="sm:hidden text-[11px]">{analyzing ? '...' : 'Sweep'}</span>
        </button>

        {/* Theme Selector (Light / Dark / System) */}
        <ThemeToggle variant="segmented" />
      </div>
    </header>
  );
};
