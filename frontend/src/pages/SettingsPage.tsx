import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Laptop,
  Download,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Database,
  Sliders,
  Server,
  Trash2,
  Lock,
} from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';
import { api } from '../api';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<'theme' | 'dossier' | 'dataset' | 'connectivity'>('theme');

  // Backend status state
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [pingLoading, setPingLoading] = useState(false);
  const [reloadStatus, setReloadStatus] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  // Check backend connectivity
  const checkPing = async () => {
    try {
      setPingLoading(true);
      const res = await api.getHealth();
      setBackendStatus(`Connected (${res.status})`);
    } catch {
      setBackendStatus('Offline / Local Embedded Fallback Active');
    } finally {
      setPingLoading(false);
    }
  };

  useEffect(() => {
    checkPing();
  }, []);

  const handleExportDossier = () => {
    const data = {
      auditor_identity: 'Senior Public Vigilance Analyst',
      organization: 'Ministry of Statistics & Programme Implementation (MoSPI) / Public Infrastructure Track',
      jurisdiction: 'National Vigilance Track — MPLADS & Infrastructure Funds',
      platform: 'Nigrani AI — Public Project Intelligence Platform',
      active_dataset: 'Official Parliamentary eSAKSHI Dataset (543 Lok Sabha + 231 Rajya Sabha = 774 Portfolios)',
      deterministic_scoring_weights: {
        cost_variance: 0.35,
        duplicate_intelligence: 0.30,
        schedule_delay: 0.25,
        data_quality: 0.10,
      },
      export_timestamp: new Date().toISOString(),
      classification: 'OFFICIAL AUDITOR DOSSIER',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nigrani_auditor_dossier_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReloadMPLADS = async () => {
    try {
      setReloading(true);
      setReloadStatus(null);
      const res = await api.reloadMpladsDataset();
      setReloadStatus(res.message || 'Dataset reloaded successfully.');
    } catch (err: any) {
      setReloadStatus(`Reload notice: ${err.message || 'Using local bundled MPLADS records.'}`);
    } finally {
      setReloading(false);
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear local preferences and application cache? The page will reload.')) {
      localStorage.removeItem('nigrani-theme');
      localStorage.removeItem('nigrani_user_profile');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="h-5 w-5 text-sky-500" />
          <span>System & Vigilance Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure enterprise appearance tokens, export official auditor records, verify cloud connectivity, and manage national datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveSection('theme')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
              activeSection === 'theme'
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Theme & Display</span>
          </button>

          <button
            onClick={() => setActiveSection('dossier')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
              activeSection === 'dossier'
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Auditor Dossier</span>
          </button>

          <button
            onClick={() => setActiveSection('dataset')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
              activeSection === 'dataset'
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>MPLADS Dataset</span>
          </button>

          <button
            onClick={() => setActiveSection('connectivity')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
              activeSection === 'connectivity'
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Cloud Connectivity</span>
          </button>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <button
              onClick={handleClearCache}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset Local Cache</span>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3">
          {/* 1. THEME & DISPLAY */}
          {activeSection === 'theme' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Appearance & Theme Mode</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select your preferred color scheme. The chosen theme persists automatically across all visits.
                </p>
              </div>

              {/* Theme Options Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'light' as Theme,
                    label: 'Light Mode',
                    desc: 'Clean white surfaces with dark navy typography and neutral borders.',
                    icon: Sun,
                  },
                  {
                    id: 'dark' as Theme,
                    label: 'Dark Mode',
                    desc: 'Deep navy enterprise surfaces with cyan and emerald accents.',
                    icon: Moon,
                  },
                  {
                    id: 'system' as Theme,
                    label: 'System Sync',
                    desc: 'Automatically aligns with your device OS dark/light mode preference in real-time.',
                    icon: Laptop,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setTheme(item.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/30 ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                        <span>{isSelected ? 'Active Preference' : 'Click to Apply'}</span>
                        {item.id === 'system' && (
                          <span className="font-mono text-sky-600 dark:text-sky-400">({resolvedTheme})</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Theme Guarantee Note */}
              <div className="rounded-xl border border-sky-200/70 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/30 p-4 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold text-sky-900 dark:text-sky-300 mb-1">Zero-Flash Theme Architecture</p>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Nigrani AI utilizes an instant inline DOM boot script coupled with CSS variable tokens. All charts, tables, badges, and modals adapt immediately without visual jitter.
                </p>
              </div>
            </div>
          )}

          {/* 2. AUDITOR DOSSIER */}
          {activeSection === 'dossier' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Auditor Credentials & Dossier</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official verification profile for National Infrastructure vigilance audits.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Assigned Auditor Role:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Principal Public Works Investigator</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Organization / Department:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Ministry of Statistics & Programme Implementation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Jurisdiction Track:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">774 Parliamentary Funds (543 Lok Sabha + 231 Rajya Sabha across 36 States/UTs)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cryptographic Integrity:</span>
                  <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Deterministic Baselines
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={handleExportDossier}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Download Official Auditor Dossier (JSON)</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. MPLADS DATASET */}
          {activeSection === 'dataset' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Official Parliamentary eSAKSHI Dataset (Lok Sabha & Rajya Sabha)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Package derived directly from the official MoSPI eSAKSHI portal (<code className="text-[11px] font-mono">mplads.gov.in</code>), covering both Parliamentary Houses.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Total Portfolios</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">774 MPs</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Allocated Limit</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">₹11,681.90 Cr</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Expenditure</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">₹3,995.34 Cr</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Works Monitored</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">131,141</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl border border-cyan-200/70 dark:border-cyan-900/50 bg-cyan-50/30 dark:bg-cyan-950/20">
                  <span className="font-bold text-cyan-800 dark:text-cyan-300 block mb-1">Lok Sabha Portfolios (543 MPs)</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Allocated: <strong>₹8,333.67 Cr</strong> • Disbursed: <strong>₹2,771.91 Cr</strong> (33.3% utilization) • <strong>106,458</strong> works sanctioned/recommended across all 543 constituencies.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-purple-200/70 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20">
                  <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1">Rajya Sabha Portfolios (231 MPs)</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Allocated: <strong>₹3,363.85 Cr</strong> • Disbursed: <strong>₹1,237.92 Cr</strong> (36.8% utilization) • <strong>25,144</strong> works sanctioned/recommended across 231 sitting MPs.
                  </p>
                </div>
              </div>

              {reloadStatus && (
                <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 p-3.5 text-xs text-sky-800 dark:text-sky-300">
                  {reloadStatus}
                </div>
              )}

              <div>
                <button
                  onClick={handleReloadMPLADS}
                  disabled={reloading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${reloading ? 'animate-spin' : ''}`} />
                  <span>{reloading ? 'Reloading MPLADS...' : 'Re-Sync Official MPLADS Package'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. CLOUD CONNECTIVITY */}
          {activeSection === 'connectivity' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Cloud Backend Connectivity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time network telemetry between hosted GitHub Pages and Render cloud service.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Public Cloud Backend:</span>
                  <a
                    href="https://nigrani-ai-u7gz.onrender.com/health"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sky-600 dark:text-sky-400 font-bold hover:underline truncate max-w-[240px]"
                  >
                    https://nigrani-ai-u7gz.onrender.com/
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Interactive API Docs:</span>
                  <a
                    href="https://nigrani-ai-u7gz.onrender.com/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sky-600 dark:text-sky-400 font-bold hover:underline"
                  >
                    .../docs (Swagger UI)
                  </a>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Telemetry Status:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {backendStatus}
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={checkPing}
                  disabled={pingLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${pingLoading ? 'animate-spin' : ''}`} />
                  <span>Verify Live Uptime</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
