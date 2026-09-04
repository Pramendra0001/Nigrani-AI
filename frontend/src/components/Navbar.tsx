import React, { useState } from 'react';
import {
  Shield,
  RefreshCw,
  User,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
  onBatchAnalyze?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<Props> = ({
  user,
  onOpenAuth,
  onNavigateTab,
  onLogout,
  onBatchAnalyze,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleBatch = async () => {
    try {
      setAnalyzing(true);
      await api.analyzeBatch();
      if (onBatchAnalyze) onBatchAnalyze();
    } catch (err: any) {
      alert(`Batch analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <div
          onClick={() => onNavigateTab('dashboard')}
          className="cursor-pointer flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gov-700 to-gov-900 text-white shadow-md shadow-gov-900/20">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                NIGRANI <span className="text-blue-600">AI</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide border border-slate-200">
                National Vigilance Platform • 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI-Powered Public Project Intelligence & Explainable Anomaly Review Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Demo Mode indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Offline AI Active</span>
        </div>

        {/* Batch Analyze trigger */}
        <button
          onClick={handleBatch}
          disabled={analyzing}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-gov-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gov-800 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{analyzing ? 'Analyzing All...' : 'Run Intelligence Sweep'}</span>
          <span className="sm:hidden">{analyzing ? '...' : 'Sweep'}</span>
        </button>

        {/* Authentication Section */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <div className="h-7 w-7 rounded-full bg-gov-700 text-white flex items-center justify-center text-[10px] font-bold">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  getInitials(user.full_name)
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-bold leading-tight">{user.full_name.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-500">{user.role || 'Analyst'}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 text-xs z-50 animate-in fade-in duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600">
                    <Shield className="h-3 w-3" />
                    <span>Role: {user.role || 'Analyst'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('profile')}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => onNavigateTab('settings')}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                >
                  <SettingsIcon className="h-4 w-4 text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition font-semibold"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="hidden sm:inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
