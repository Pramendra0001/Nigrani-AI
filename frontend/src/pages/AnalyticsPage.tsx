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
        <h1 className="text-xl font-black tracking-tight text-slate-900">Platform Analytics & Risk Engine Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tune deterministic risk weight distribution and inspect deployment telemetry.
        </p>
      </div>

      {/* Weights Tuning Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Unified Risk Formula Weight Calibration</h2>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
            Math.abs(totalWeight - 1.0) < 0.01 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            Sum: {(totalWeight * 100).toFixed(0)}% / 100%
          </span>
        </div>

        <div className="space-y-5 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Cost Anomaly Weight</span>
              <span className="font-mono font-bold text-slate-900">{(weights.cost * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.cost}
              onChange={(e) => setWeights({ ...weights, cost: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Duplicate / Overlap Intelligence Weight</span>
              <span className="font-mono font-bold text-slate-900">{(weights.duplicate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.duplicate}
              onChange={(e) => setWeights({ ...weights, duplicate: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-amber-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Schedule Delay Deficit Weight</span>
              <span className="font-mono font-bold text-slate-900">{(weights.delay * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.delay}
              onChange={(e) => setWeights({ ...weights, delay: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-orange-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Data Quality Deficit Weight</span>
              <span className="font-mono font-bold text-slate-900">{(weights.data_quality * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.data_quality}
              onChange={(e) => setWeights({ ...weights, data_quality: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Formula: Overall = (Cost × w₁) + (Duplicate × w₂) + (Delay × w₃) + (DQ × w₄)
          </p>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Weights Saved!
              </span>
            )}
            <button
              onClick={handleSaveWeights}
              disabled={saving || Math.abs(totalWeight - 1.0) > 0.01}
              className="inline-flex items-center gap-2 rounded-lg bg-gov-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-gov-800 disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Applying Weights...' : 'Update Risk Weights'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status & Architecture Card */}
      {status && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-800">System Architecture Telemetry</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Engine Status</span>
              <span className="font-bold text-emerald-600">{status.status}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Database Engine</span>
              <span className="font-bold text-slate-800">{status.database}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">AI Layer Mode</span>
              <span className="font-bold text-slate-800 uppercase">{status.ai_provider} (Deterministic)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Registry Volume</span>
              <span className="font-bold text-slate-800">{status.total_projects} Projects</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
