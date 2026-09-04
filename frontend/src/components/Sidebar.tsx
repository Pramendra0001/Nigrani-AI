import React from 'react';
import {
  LayoutDashboard,
  Database,
  ClipboardCheck,
  UploadCloud,
  Sliders,
  Sparkles,
  User,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';

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
    { id: 'upload', label: 'Data Ingestion & Mapping', icon: UploadCloud },
    { id: 'analytics', label: 'Sector Analytics & Weights', icon: Sliders },
  ];

  const accountNavItems = [
    { id: 'profile', label: 'Officer Profile', icon: User },
    { id: 'settings', label: 'Account & Security', icon: SettingsIcon },
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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 transition-transform duration-200 md:static md:translate-x-0 md:min-h-[calc(100vh-4rem)] ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menu Navigation
            </span>
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Modules */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Intelligence Modules
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
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Account & Administration */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Identity & Governance
            </p>
            <nav className="space-y-1">
              {accountNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Forensic Guarantee Card */}
          <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Transparent AI Auditing</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Nigrani AI prioritizes review queues through reproducible statistical baselines, not arbitrary accusations.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400 font-mono">
              <span>v1.0 • 500 Projects</span>
              <span className="text-emerald-600">Deterministic</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600">National Vigilance Platform • 2026</p>
          <p>Public Infrastructure Track</p>
        </div>
      </aside>
    </>
  );
};
