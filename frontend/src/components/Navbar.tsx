import React, { useState } from 'react';
import { Shield, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { api } from '../api';

export const Navbar: React.FC<{ onBatchAnalyze?: () => void }> = ({ onBatchAnalyze }) => {
  const [analyzing, setAnalyzing] = useState(false);

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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gov-700 to-gov-900 text-white shadow-md shadow-gov-900/20">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900">
              NIGRANI <span className="text-blue-600">AI</span>
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide border border-slate-200">
              SIH 2024 / Infra Vigilance
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            AI-Powered Public Project Intelligence & Explainable Anomaly Review Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Offline Demo Mode indicator */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden md:inline">Demo Mode:</span>
          <span className="font-bold">Offline AI Active</span>
        </div>

        {/* Batch Analyze trigger */}
        <button
          onClick={handleBatch}
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-gov-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gov-800 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Analyzing All...' : 'Run Intelligence Sweep'}</span>
        </button>
      </div>
    </header>
  );
};
