import React from 'react';
import {
  LayoutDashboard,
  Database,
  ClipboardCheck,
  UploadCloud,
  Sliders,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reviewCount?: number;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, reviewCount = 0 }) => {
  const navItems = [
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

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Intelligence Modules
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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

        {/* SIH Objective Card */}
        <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Human-in-the-Loop AI</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Nigrani AI prioritizes review queues through transparent statistical baselines, not arbitrary accusations.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400 font-mono">
            <span>v1.0 • 500 Projects</span>
            <span className="text-emerald-600">Deterministic</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-600">Smart India Hackathon</p>
        <p>Govt & Public Infrastructure Track</p>
      </div>
    </aside>
  );
};
