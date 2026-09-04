import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Clock,
  Copy,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const IntelligenceSweepModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setIsDone(false);
      setProgress(15);
      return;
    }

    const timer1 = setTimeout(() => { setCurrentStep(2); setProgress(35); }, 400);
    const timer2 = setTimeout(() => { setCurrentStep(3); setProgress(60); }, 800);
    const timer3 = setTimeout(() => { setCurrentStep(4); setProgress(82); }, 1200);
    const timer4 = setTimeout(() => { setCurrentStep(5); setProgress(95); }, 1500);
    const timer5 = setTimeout(() => { setProgress(100); setIsDone(true); }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                National Intelligence Sweep
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-engine anomaly screening across 774 official parliamentary portfolios
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400 font-mono">
                {isDone ? 'Screening Pipeline Complete' : 'Executing Analytics Pipeline...'}
              </span>
              <span className="font-mono text-sky-600 dark:text-cyan-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Sequential Step Execution Feed */}
          <div className="space-y-2.5 text-xs">
            {[
              { step: 1, title: '16-Point Ingestion Data Integrity Audit', metric: '774 records validated' },
              { step: 2, title: 'Peer-Group Statistical Cost Outlier Screening', metric: 'IQR & category median baseline' },
              { step: 3, title: 'Multi-Factor Duplicate & Overlap Cross-Matching', metric: 'Cosine semantic + Haversine distance' },
              { step: 4, title: 'Schedule Slippage & Disbursement-Progress Imbalance', metric: 'Timeline hazard modeling' },
              { step: 5, title: 'Unified Risk Calibration & Review Queue Sync', metric: '0-100 composite scoring' },
            ].map((st) => {
              const isPast = currentStep > st.step || isDone;
              const isCurrent = currentStep === st.step && !isDone;

              return (
                <div
                  key={st.step}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isPast
                      ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                      : isCurrent
                      ? 'border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 text-sky-950 dark:text-sky-200'
                      : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-sky-500 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span className="font-semibold truncate">{st.title}</span>
                  </div>
                  <span className="text-[10px] font-mono shrink-0 text-slate-500 dark:text-slate-400">
                    {st.metric}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Results Summary Cards (shown when done) */}
          {isDone && (
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Sweep Execution Findings
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  Status: Synchronized
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Analyzed</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">774</p>
                  <p className="text-[9px] text-slate-400">Portfolios</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Cost Variances</p>
                  <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">193</p>
                  <p className="text-[9px] text-slate-400">Outlier flags</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Delay Risks</p>
                  <p className="text-base font-black text-orange-600 dark:text-orange-400 mt-0.5">261</p>
                  <p className="text-[9px] text-slate-400">Execution alerts</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Review Queue</p>
                  <p className="text-base font-black text-sky-600 dark:text-cyan-400 mt-0.5">557</p>
                  <p className="text-[9px] text-slate-400">Active cases</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 p-4 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
          {isDone && (
            <button
              onClick={() => {
                onClose();
                onNavigateTab('review');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition"
            >
              <span>View Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};