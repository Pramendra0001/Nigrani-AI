import React from 'react';
import {
  LayoutDashboard,
  Database,
  ClipboardCheck,
  UploadCloud,
  Sliders,
  Sparkles,
  Settings as SettingsIcon,
  X,
  FileCheck2,
} from 'lucide-react';
import { NigraniLogo } from './NigraniLogo';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reviewCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  reviewCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const primaryNavItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects Database', icon: Database },
    {
      id: 'review',
      label: 'Priority Review Queue',
      icon: ClipboardCheck,
      badge: reviewCount > 0 ? reviewCount : undefined,
    },
    { id: 'analytics', label: 'Sector Analytics & Weights', icon: Sliders },
    { id: 'upload', label: 'Data Ingestion & Mapping', icon: UploadCloud },
    { id: 'settings', label: 'System & Vigilance Settings', icon: SettingsIcon },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] flex flex-col justify-between p-4 transition-all duration-200 md:static md:translate-x-0 md:min-h-[calc(100vh-4rem)] ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden border-b border-slate-100 dark:border-slate-800 pb-3">
            <NigraniLogo size="sm" showWordmark={true} showSubtitle={false} />
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Modules Navigation */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Vigilance Modules
            </p>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/40 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="rounded-full bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Forensic Guarantee Card */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0f172a]/60 p-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Transparent AI Auditing</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Nigrani AI prioritizes review queues through reproducible statistical baselines, not arbitrary accusations.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-semibold font-mono">
              <span className="text-slate-500 dark:text-slate-400">543 LS Constituencies</span>
              <span className="text-emerald-600 dark:text-emerald-400">Deterministic</span>
            </div>
          </div>
        </div>

        {/* Footer Area with Theme Toggle & Telemetry */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle variant="compact" />
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 space-y-0.5 px-1">
            <p className="font-semibold text-slate-600 dark:text-slate-400">Nigrani AI Platform • 2026</p>
            <p>Smart India Hackathon • Public Track</p>
          </div>
        </div>
      </aside>
    </>
  );
};
