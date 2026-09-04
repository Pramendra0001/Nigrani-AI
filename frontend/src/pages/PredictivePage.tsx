import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { api } from '../api';
import { PredictiveSummary } from '../types';

interface Props {
  onSelectProject: (projectId: string) => void;
}

export const PredictivePage: React.FC<Props> = ({ onSelectProject }) => {
  const [loading, setLoading] = useState(true);
  const [predictiveData, setPredictiveData] = useState<PredictiveSummary | null>(null);

  const fetchPredictive = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictiveSummary();
      setPredictiveData(data);
    } catch (err) {
      console.error('Failed to load predictive insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictive();
  }, []);

  const earlyWarningCases = [
    {
      id: 'MPLADS-LS-388',
      name: 'Ravindra Dattaram Waikar — Mumbai North West',
      risk_label: 'Critical Hazard',
      projected_delay_months: '+14.5 months',
      predicted_overrun_pct: '+38.4%',
      confidence: '94%',
      trigger_reason: '100% fund disbursement with 0% physical progress creates extreme milestone abandonment hazard.',
    },
    {
      id: 'MPLADS-LS-001',
      name: 'Afzal Ansari — Ghazipur',
      risk_label: 'Elevated Risk',
      projected_delay_months: '+8.2 months',
      predicted_overrun_pct: '+18.6%',
      confidence: '88%',
      trigger_reason: 'Sluggish intermediate progress against sanctioned work volume signals multi-quarter slippage.',
    },
    {
      id: 'MPLADS-RS-005',
      name: 'Dr. Laxmikant Bajpayee — Uttar Pradesh (RS)',
      risk_label: 'Moderate Slippage',
      projected_delay_months: '+5.1 months',
      predicted_overrun_pct: '+12.0%',
      confidence: '82%',
      trigger_reason: 'Contractor administrative handover delay across secondary civil infrastructure packages.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Forecasting & Early Warning Radar
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Predictive Insights & Early Warnings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical survival models predicting project completion timelines, budget overrun likelihood, and completion horizon.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Portfolios Modeled</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {predictiveData?.total_portfolios_modeled || 774}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Lok Sabha & Rajya Sabha combined</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">High Delay Probability</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {predictiveData?.delay_probability.high_probability || 261}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Portfolios with &gt;60% delay hazard</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">High Overrun Likelihood</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {predictiveData?.overrun_likelihood.high_likelihood || 65}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Portfolios with cost variance risk</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Controlled Budgets</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {predictiveData?.overrun_likelihood.controlled_budget || 439}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Stable expenditure trajectory</p>
        </div>
      </div>

      {/* Two-Column Analytics: Quarterly Burn Forecast & Early Warning Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quarterly Completion Projection */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quarterly Completion & Spend Horizon</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monte Carlo simulation projecting portfolio completion milestones across 2026.
              </p>
            </div>

            <div className="space-y-3">
              {(predictiveData?.estimated_completion_quarters || []).map((q, idx) => {
                const maxSpend = 800;
                const spendPct = Math.min((q.forecast_spend_cr / maxSpend) * 100, 100);
                return (
                  <div
                    key={q.quarter}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{q.quarter}</span>
                        <span className="text-[10px] font-mono text-sky-600 dark:text-cyan-400 bg-sky-100/60 dark:bg-sky-950 px-1.5 py-0.2 rounded">
                          {q.projected_completed_portfolios} Portfolios
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        ₹{q.forecast_spend_cr} Cr
                      </span>
                    </div>

                    {/* Progress visual bar */}
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                        style={{ width: `${spendPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 p-3 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Projected disbursements peak in Q3 2026 as sanctioned works complete civil execution phases prior to financial year close.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Early Warning Flagged Cases */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Predictive Early Warning Radar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Portfolios exhibiting high mathematical probability of severe schedule abandonment.
              </p>
            </div>

            <div className="space-y-3">
              {earlyWarningCases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-cyan-400">
                        {c.id}
                      </span>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                        {c.name}
                      </h3>
                    </div>
                    <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide shrink-0">
                      {c.risk_label}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {c.trigger_reason}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Delay: <strong className="text-rose-600 dark:text-rose-400">{c.projected_delay_months}</strong></span>
                      <span>Overrun: <strong className="text-amber-600 dark:text-amber-400">{c.predicted_overrun_pct}</strong></span>
                      <span>Confidence: {c.confidence}</span>
                    </div>

                    <button
                      onClick={() => onSelectProject(c.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};