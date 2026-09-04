import React, { useEffect, useState } from 'react';
import { Sliders, Save, RefreshCw, Cpu, Server, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export const AnalyticsPage: React.FC = () => {
  const [weights, setWeights] = useState({
    cost: 0.35,
    duplicate: 0.30,
    delay: 0.25,
    data_quality: 0.10,
  });
  const [status, setStatus] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getRiskWeights().then((res: any) => setWeights({
      cost: res.cost ?? 0.35,
      duplicate: res.duplicate ?? 0.30,
      delay: res.delay ?? 0.25,
      data_quality: res.data_quality ?? 0.10,
    })).catch(console.error);
    api.getSystemStatus().then(setStatus).catch(console.error);
  }, []);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSaveWeights = async () => {
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      alert(`Weights must sum to 1.0 (currently ${totalWeight.toFixed(2)}).`);
      return;
    }
    try {
      setSaving(true);
      await api.updateRiskWeights(weights);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save weights: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Platform Analytics & Risk Engine Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tune deterministic risk weight distribution and inspect deployment telemetry.
        </p>
      </div>

      {/* Weights Tuning Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Unified Risk Formula Weight Calibration
            </h2>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${
            Math.abs(totalWeight - 1.0) < 0.01
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            Sum: {(totalWeight * 100).toFixed(0)}% / 100%
          </span>
        </div>

        <div className="space-y-5 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Cost Anomaly Weight</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{(weights.cost * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.cost}
              onChange={(e) => setWeights({ ...weights, cost: parseFloat(e.target.value) })}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Duplicate / Overlap Detection Weight</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{(weights.duplicate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.duplicate}
              onChange={(e) => setWeights({ ...weights, duplicate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Schedule Delay & Velocity Weight</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{(weights.delay * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.delay}
              onChange={(e) => setWeights({ ...weights, delay: parseFloat(e.target.value) })}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Data Quality Deficit Weight</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{(weights.data_quality * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.data_quality}
              onChange={(e) => setWeights({ ...weights, data_quality: parseFloat(e.target.value) })}
              className="w-full accent-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Formula: Risk = (Cost × {weights.cost}) + (Dup × {weights.duplicate}) + (Delay × {weights.delay}) + (DQ × {weights.data_quality})
          </div>
          <button
            onClick={handleSaveWeights}
            disabled={saving || Math.abs(totalWeight - 1.0) > 0.01}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 transition"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-sky-400" />}
            <span>{saving ? 'Updating...' : saveSuccess ? 'Saved!' : 'Save Calibration'}</span>
          </button>
        </div>
      </div>

      {/* Telemetry Card */}
      {status && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-500" />
            <span>Deployment Diagnostics & Architecture Telemetry</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Backend Engine</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{status.version || 'FastAPI 0.115'}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Dataset Scale</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">774 MPLADS Projects</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">AI Provider</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Offline Deterministic</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">System Year</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{status.current_year ?? 2026}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
