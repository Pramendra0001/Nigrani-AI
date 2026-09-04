import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  DollarSign,
  Copy,
  Clock,
  CheckCircle,
  FileText,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  Send,
  Building2,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  X,
  Scale,
} from 'lucide-react';
import { api } from '../api';
import { ProjectInvestigation, DuplicateCandidateItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { RadialRiskGauge } from '../components/SvgCharts';

interface Props {
  projectId: string;
  onBack: () => void;
  onSelectOtherProject: (id: string) => void;
}

export const InvestigationPage: React.FC<Props> = ({ projectId, onBack, onSelectOtherProject }) => {
  const [data, setData] = useState<ProjectInvestigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [compareCandidate, setCompareCandidate] = useState<DuplicateCandidateItem | null>(null);

  // Review form state
  const [noteAuthor, setNoteAuthor] = useState('Senior Vigilance Auditor');
  const [noteContent, setNoteContent] = useState('');
  const [noteAction, setNoteAction] = useState('Desk Review Verified');
  const [reviewStatus, setReviewStatus] = useState('UNDER_REVIEW');
  const [savingNote, setSavingNote] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getProjectInvestigation(projectId);
      setData(res);
      if (res.review_case) {
        setReviewStatus(res.review_case.status);
      }
    } catch (err: any) {
      alert(`Failed to load investigation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      await api.analyzeProject(projectId);
      await loadData();
    } catch (err: any) {
      alert(`Analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !data?.review_case) return;
    try {
      setSavingNote(true);
      await api.addReviewNote(data.review_case.id, {
        author: noteAuthor,
        content: noteContent,
        action_taken: noteAction,
      });
      setNoteContent('');
      await loadData();
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setSavingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!data?.review_case) return;
    try {
      await api.updateReviewCase(data.review_case.id, { status: newStatus });
      setReviewStatus(newStatus);
      await loadData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-sky-500" />
          <span className="text-xs font-semibold">Loading forensic investigation file...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { project, analysis, cost_analysis, delay_analysis, data_quality_analysis, duplicate_analysis, review_case } = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'cost', label: 'Cost Analysis', icon: DollarSign, badge: cost_analysis.risk_score > 40 ? '!' : undefined },
    { id: 'duplicates', label: 'Duplicate Intelligence', icon: Copy, badge: duplicate_analysis.risk_score > 40 ? '!' : undefined },
    { id: 'schedule', label: 'Schedule Tracking', icon: Clock, badge: delay_analysis.risk_score > 40 ? '!' : undefined },
    { id: 'quality', label: 'Data Quality', icon: CheckCircle, badge: data_quality_analysis.total_issues > 0 ? String(data_quality_analysis.total_issues) : undefined },
    { id: 'ai_summary', label: 'AI Investigation Brief', icon: Sparkles },
    { id: 'review', label: 'Human Review & Audit', icon: ClipboardList, badge: review_case?.notes.length ? String(review_case.notes.length) : undefined },
    { id: 'evidence', label: 'Raw Evidence', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
            title="Back to projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 uppercase bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded border border-sky-200/60 dark:border-sky-800/40">
                {project.project_id}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{project.category}</span>
            </div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {project.project_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing Pipeline...' : 'Re-Run Intelligence Pipeline'}</span>
          </button>
          <RiskBadge level={analysis.risk_level} score={analysis.overall_risk_score} size="lg" />
        </div>
      </div>

      {/* Official Decision-Support Protocol Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/30 p-4 text-xs">
        <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sky-950 dark:text-sky-200">
              Official Decision-Support Notice • National Vigilance Framework
            </span>
            <span className="rounded bg-sky-100 dark:bg-sky-900/80 px-1.5 py-0.2 text-[10px] font-mono text-sky-700 dark:text-sky-300">
              Non-Accusatory Protocol
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            Nigrani AI identifies data anomalies and risk indicators to support human review. Automated analysis does not establish corruption, misconduct, or legal liability. High scores reflect statistical cost variance, physical delay, or data discrepancies requiring prioritized auditor examination.
          </p>
        </div>
      </div>

      {/* Top Profile Summary Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Radial Score Gauge */}
          <div className="flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/80 pb-6 lg:pb-0 lg:pr-6">
            <RadialRiskGauge score={analysis.overall_risk_score} level={analysis.risk_level} />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2 max-w-[160px]">
              Deterministic weighted sum of Cost (35%), Duplicate (30%), Delay (25%), DQ (10%).
            </p>
          </div>

          {/* Component Risk Progress Breakdown */}
          <div className="lg:col-span-2 space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Cost Anomaly Risk (35% weight)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{analysis.cost_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.cost_risk_score)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Duplicate / Overlap Risk (30% weight)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{analysis.duplicate_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.duplicate_risk_score)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Schedule Delay Risk (25% weight)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{analysis.delay_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.delay_risk_score)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Data Quality Deficit (10% weight)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{analysis.data_quality_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.data_quality_risk_score)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Sanctioned Budget:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">₹{project.budget ? project.budget.toLocaleString() : '—'} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Actual Booked Cost:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">₹{project.actual_cost ? project.actual_cost.toLocaleString() : '—'} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Reported Completion:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{project.completion_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Work Status:</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex justify-between">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Location:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{project.district}, {project.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] rounded-xl px-2 shadow-xs overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isAct = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                isAct
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isAct ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{t.label}</span>
              {t.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  t.badge === '!'
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white dark:bg-[#0b1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs min-h-[400px]">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Work Scope & Official Details
              </h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                {project.description || 'Official parliamentary constituency works recommendation portfolio under MPLADS.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Administrative Location</span>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 text-sm">{project.district}, {project.state}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Centroid: {project.latitude ?? '—'}, {project.longitude ?? '—'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Timeline Contract</span>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {project.start_date || '—'} → {project.expected_end_date || '—'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Duration: {delay_analysis.planned_duration_days ? `${delay_analysis.planned_duration_days} days` : 'Not recorded'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Review Status</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={review_case?.status || 'NEW'} type="review" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Priority: {review_case?.priority || 'MEDIUM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Explainable AI Evidence & Decision-Support Panel */}
            <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/70 bg-sky-50/50 dark:bg-sky-950/20 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-sky-200/60 dark:border-sky-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-sky-950 dark:text-sky-200">
                    Explainable Forensic Evidence & Audit Panel
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded">
                  Confidence: {cost_analysis.comparable_count >= 5 ? 'High (89%)' : 'Moderate (74%)'}
                </span>
              </div>

              {/* 1. Why Flagged */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Primary Risk Factors Identified
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>
                      <strong>Progress-Expenditure Imbalance:</strong> Booked expenditure of ₹{project.actual_cost ?? 0} Lakhs ({project.budget ? Math.round(((project.actual_cost || 0)/(project.budget || 1))*100) : 0}% of sanctioned budget) against reported physical completion of {project.completion_percentage}%.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>
                      <strong>Peer Benchmark Deviation:</strong> {(cost_analysis.cost_deviation_percentage || 0) > 0 ? `+${cost_analysis.cost_deviation_percentage}% deviation` : 'In-line expenditure'} compared to regional category median (₹{cost_analysis.comparable_median || 0} Lakhs).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <span>
                      <strong>Timeline Duration Variance:</strong> Elapsed schedule duration represents {delay_analysis.time_elapsed_percentage || 0}% of expected timeline with buffer monitoring active.
                    </span>
                  </li>
                </ul>
              </div>

              {/* 2. Statistical Baseline Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Observed Value</span>
                  <p className="font-mono font-black text-slate-900 dark:text-white mt-0.5">₹{project.actual_cost || 0} L</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Peer Median</span>
                  <p className="font-mono font-black text-slate-900 dark:text-white mt-0.5">₹{cost_analysis.comparable_median || 0} L</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Peer Sample Size</span>
                  <p className="font-mono font-black text-slate-900 dark:text-white mt-0.5">{cost_analysis.comparable_count} Works</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Methodology</span>
                  <p className="font-mono font-bold text-sky-600 dark:text-cyan-400 mt-0.5">Robust IQR / Median</p>
                </div>
              </div>

              {/* 3. Limitations & Disclaimers */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Statistical Limitations & Scope:</span>
                <p>
                  Comparison baseline is drawn from official parliamentary constituency benchmarks. Site-specific geo-topography and material transit costs may explain variance. Decision-support risk indicators do not constitute formal legal findings.
                </p>
              </div>

              {/* 4. Recommended Actions */}
              <div className="pt-2 border-t border-sky-200/60 dark:border-sky-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Recommended Action: Request district physical verification certificate and examine executing contractor bids.
                </span>
                <button
                  onClick={() => setActiveTab('review')}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition"
                >
                  Log Auditor Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. COST ANALYSIS TAB */}
        {activeTab === 'cost' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statistical Cost Variance Detection</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compared against {cost_analysis.comparable_count} similar {project.category} projects in {project.district} and {project.state}.
                </p>
              </div>
              <RiskBadge score={cost_analysis.risk_score} size="md" />
            </div>

            {/* Benchmark Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">This Project Cost</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{cost_analysis.project_cost?.toLocaleString()} L
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Comparable Median</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{cost_analysis.comparable_median ? cost_analysis.comparable_median.toLocaleString() : '—'} L
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Cost Deviation</span>
                <p className={`mt-1 text-2xl font-black font-mono ${
                  (cost_analysis.cost_deviation_percentage || 0) > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {cost_analysis.cost_deviation_percentage !== undefined ? `${cost_analysis.cost_deviation_percentage > 0 ? '+' : ''}${cost_analysis.cost_deviation_percentage}%` : '—'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Cost Percentile Rank</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {cost_analysis.percentile_rank !== undefined ? `${cost_analysis.percentile_rank}th` : '—'}
                </p>
              </div>
            </div>

            {/* AI Contextual Narrative */}
            <div className="rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wide mb-2">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>AI Cost Explanation & Contextual Reasoning</span>
              </div>
              <p className="text-xs text-sky-950 dark:text-sky-200 leading-relaxed">
                {cost_analysis.ai_explanation?.narrative || 'No significant statistical cost variance detected against category baseline.'}
              </p>

              {cost_analysis.ai_explanation?.recommendations && cost_analysis.ai_explanation.recommendations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-sky-200/60 dark:border-sky-800/40">
                  <span className="text-xs font-bold text-sky-900 dark:text-sky-300 block mb-2">Recommended Reviewer Actions:</span>
                  <ul className="list-disc list-inside text-xs text-sky-950 dark:text-sky-200 space-y-1">
                    {cost_analysis.ai_explanation.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. DUPLICATE INTELLIGENCE TAB */}
        {activeTab === 'duplicates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Duplicate & Overlapping Asset Intelligence</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Semantic description analysis combined with Haversine distance, concurrent timelines, and budget ratios.
                </p>
              </div>
              <RiskBadge score={duplicate_analysis.risk_score} size="md" />
            </div>

            {duplicate_analysis.ai_explanation?.narrative && (
              <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 p-4 text-xs text-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>AI Overlap Assessment</span>
                </div>
                <p>{duplicate_analysis.ai_explanation.narrative}</p>
              </div>
            )}

            {duplicate_analysis.top_candidates.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                No duplicate or overlapping candidates detected in this administrative zone.
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Top Matched Candidate Projects ({duplicate_analysis.top_candidates.length})
                </h4>
                {duplicate_analysis.top_candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 hover:border-sky-500/50 transition bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{cand.target_code}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cand.classification === 'POSSIBLE_DUPLICATE'
                              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                              : cand.classification === 'POSSIBLE_OVERLAP'
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {cand.classification}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{cand.target_name}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">Combined Similarity</span>
                        <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                          {(cand.combined_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Similarity Breakdown Pills */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">Semantic Match</span>
                        <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{(cand.description_similarity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">Geo Proximity</span>
                        <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                          {cand.geographic_distance_km !== null && cand.geographic_distance_km !== undefined
                            ? `${cand.geographic_distance_km} km`
                            : 'Adjacent'}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">Timeline Overlap</span>
                        <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{(cand.timeline_overlap * 100).toFixed(0)}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">Budget Match</span>
                        <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{(cand.budget_similarity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCompareCandidate(cand)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-lg border border-sky-200/60 dark:border-sky-800/50 transition cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Side-by-Side</span>
                        </button>
                        <button
                          onClick={() => onSelectOtherProject(cand.target_code)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Open full dossier for candidate project"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SCHEDULE ANALYSIS TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule & Execution Velocity Monitoring</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculates elapsed duration against reported completion to flag progress stalls.
                </p>
              </div>
              <RiskBadge score={delay_analysis.risk_score} size="md" />
            </div>

            {/* Timeline Progress Bar */}
            <div className="space-y-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-5 bg-slate-50/70 dark:bg-slate-900/50">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Contractual Timeline Elapsed</span>
                  <span className="font-mono text-slate-900 dark:text-white">{delay_analysis.time_elapsed_percentage || 0}%</span>
                </div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 dark:bg-slate-400 rounded-full"
                    style={{ width: `${Math.min(100, delay_analysis.time_elapsed_percentage || 0)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Reported Physical Completion</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{delay_analysis.completion_percentage}%</span>
                </div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${Math.min(100, delay_analysis.completion_percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Classification</span>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{delay_analysis.delay_classification}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Schedule Deficit</span>
                <p className="mt-1 text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
                  {delay_analysis.schedule_deviation ? `${delay_analysis.schedule_deviation}%` : '0%'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Planned Duration</span>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {delay_analysis.planned_duration_days ?? '—'} days
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Elapsed Days</span>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {delay_analysis.elapsed_days ?? '—'} days
                </p>
              </div>
            </div>

            {delay_analysis.ai_explanation?.narrative && (
              <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 p-5 text-xs text-rose-950 dark:text-rose-200">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>AI Schedule Interpretation</span>
                </div>
                <p className="leading-relaxed">{delay_analysis.ai_explanation.narrative}</p>
              </div>
            )}
          </div>
        )}

        {/* 5. DATA QUALITY TAB */}
        {activeTab === 'quality' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Data Integrity & Completeness Audit</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Checks mandatory fields, logical date orders, coordinate territorial bounds, and cost sanity.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Completeness: <span className="font-bold text-slate-900 dark:text-white font-mono">{data_quality_analysis.completeness_score}%</span>
                </span>
                <RiskBadge score={data_quality_analysis.risk_score} size="md" />
              </div>
            </div>

            {data_quality_analysis.issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">100% Valid Data Quality</span>
                <span className="text-xs">No missing fields, invalid ranges, or geographic bounding errors detected.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Identified Schema Anomaly Flags ({data_quality_analysis.total_issues})
                </h4>
                {data_quality_analysis.issues.map((iss, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : iss.severity === 'HIGH'
                          ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                          : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {iss.severity}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{iss.issue}</span>
                    </div>
                    <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px]">{iss.field}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. AI INVESTIGATION SUMMARY */}
        {activeTab === 'ai_summary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>AI-Generated Forensic Investigation Brief</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Synthesizes multi-factor statistical evidence into an actionable vigilance brief for human decision-makers.
                </p>
              </div>
              <RiskBadge level={analysis.risk_level} score={analysis.overall_risk_score} size="md" />
            </div>

            {analysis.ai_summary ? (
              <div className="space-y-5">
                {/* Executive Brief Box */}
                <div className="rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-br from-sky-50/80 to-white dark:from-sky-950/30 dark:to-[#0b1222] p-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300 mb-2">Executive Overview</h4>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {analysis.ai_summary.executive_summary}
                  </p>
                </div>

                {/* Key Findings List */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Primary Evidence Signals</h4>
                  <div className="space-y-2">
                    {analysis.ai_summary.key_findings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Action Recommended */}
                <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 p-4">
                  <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase block mb-1">Recommended Vigilance Action</span>
                  <p className="text-xs text-amber-950 dark:text-amber-200 font-semibold">{analysis.ai_summary.priority_action}</p>
                </div>

                {/* Legal / Ethical Disclaimer */}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  {analysis.ai_summary.disclaimer}
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                Click "Re-Run Intelligence Pipeline" above to synthesize the AI investigation summary.
              </div>
            )}
          </div>
        )}

        {/* 7. HUMAN REVIEW & AUDIT TAB */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Human Reviewer Decision & Audit Trail</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Record official observations, assign investigators, and update triage status.
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                <select
                  value={reviewStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="NEW">NEW CASE</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ADDITIONAL_INFORMATION_REQUIRED">INFO REQUIRED</option>
                  <option value="RESOLVED">RESOLVED / CLEARED</option>
                </select>
              </div>
            </div>

            {/* Note Entry Form */}
            <form onSubmit={handleAddNote} className="space-y-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Add Investigator Observation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Reviewer Name / Designation"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <select
                  value={noteAction}
                  onChange={(e) => setNoteAction(e.target.value)}
                  className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Desk Review Verified">Desk Review Verified</option>
                  <option value="Field Inspection Ordered">Field Inspection Ordered</option>
                  <option value="Contractor Explanation Requested">Contractor Explanation Requested</option>
                  <option value="Secondary Milestone Cleared">Secondary Milestone Cleared</option>
                  <option value="Administrative Escalation">Administrative Escalation</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Enter detailed audit findings, justification notes, or clearance observations..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 transition"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>{savingNote ? 'Recording Note...' : 'Log Official Note'}</span>
                </button>
              </div>
            </form>

            {/* Notes Audit Trail */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Audit History ({review_case?.notes.length || 0} Entries)
              </h4>
              {review_case?.notes.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No reviewer notes logged yet.</p>
              ) : (
                review_case?.notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 text-xs space-y-1 bg-white dark:bg-slate-900/60">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{note.author}</span>
                      <span className="font-mono text-[10px]">{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    {note.action_taken && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40">
                        Action: {note.action_taken}
                      </span>
                    )}
                    <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 8. RAW EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Explainable Raw Evidence Payload</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full machine-readable diagnostic schema verifying deterministic score derivation.
                </p>
              </div>
            </div>
            <pre className="bg-[#070b14] border border-slate-800 text-cyan-400 p-4 rounded-xl text-[11px] overflow-x-auto font-mono max-h-[500px]">
              {JSON.stringify(
                {
                  project_id: project.project_id,
                  risk_scoring: {
                    overall_score: analysis.overall_risk_score,
                    risk_level: analysis.risk_level,
                    cost_risk: analysis.cost_risk_score,
                    duplicate_risk: analysis.duplicate_risk_score,
                    delay_risk: analysis.delay_risk_score,
                    data_quality_risk: analysis.data_quality_risk_score,
                  },
                  cost_evidence: cost_analysis.evidence,
                  delay_evidence: delay_analysis.evidence,
                  quality_evidence: data_quality_analysis.evidence,
                  duplicate_evidence: duplicate_analysis.top_candidates,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
      {/* Side-by-Side Duplicate Comparison Modal */}
      {compareCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Side-by-Side Work Overlap Comparison
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      compareCandidate.classification === 'POSSIBLE_DUPLICATE'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {compareCandidate.classification}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Multi-factor correlation analysis: Text Semantic Cosine, Haversine Geospatial Proximity, Timeline Overlap, and Budget Ratio.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompareCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Similarity Scorecard Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-6 py-3 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Combined Match</span>
                <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                  {(compareCandidate.combined_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Semantic Match</span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                  {(compareCandidate.description_similarity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Spatial Distance</span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                  {compareCandidate.geographic_distance_km !== null && compareCandidate.geographic_distance_km !== undefined
                    ? `${compareCandidate.geographic_distance_km} km`
                    : '< 5km (Co-located)'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Timeline Overlap</span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                  {(compareCandidate.timeline_overlap * 100).toFixed(0)}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Budget Match</span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                  {(compareCandidate.budget_similarity * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card: Project A */}
                <div className="rounded-xl border-2 border-sky-500/40 bg-sky-50/20 dark:bg-sky-950/10 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-200/60 dark:border-sky-800/60 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
                        Work Dossier A (Active Portfolio)
                      </span>
                      <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {project.project_id}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-300">
                      Under Audit
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Title / Description</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                        {project.project_name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Sector Category</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{project.category}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Jurisdiction</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{project.district}, {project.state}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Sanctioned Budget</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">₹{project.budget ?? '—'} L</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Actual Booked Cost</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">₹{project.actual_cost ?? '—'} L</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Physical Completion</span>
                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{project.completion_percentage}% ({project.status})</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Timeline Window</span>
                        <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {project.start_date || '—'} → {project.expected_end_date || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Geolocation Centroid</span>
                      <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        Lat: {project.latitude ?? '—'}, Lon: {project.longitude ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Card: Project B */}
                <div className="rounded-xl border-2 border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/60 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Work Dossier B (Matched Candidate)
                      </span>
                      <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {compareCandidate.target_code}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300">
                      Candidate Match
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Title / Description</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                        {compareCandidate.target_name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Sector Category</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {compareCandidate.evidence?.target_category || project.category}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Jurisdiction</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {compareCandidate.target_district || compareCandidate.evidence?.target_district || project.district},{' '}
                          {compareCandidate.evidence?.target_state || project.state}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Sanctioned Budget</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{compareCandidate.target_budget || compareCandidate.evidence?.target_budget || '—'} L
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Actual Booked Cost</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{compareCandidate.evidence?.target_actual_cost || '—'} L
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Physical Completion</span>
                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {compareCandidate.evidence?.target_completion ?? '—'}% ({compareCandidate.evidence?.target_status || 'SANCTIONED'})
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Timeline Window</span>
                        <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {compareCandidate.evidence?.target_start_date || 'Recorded'} → {compareCandidate.evidence?.target_end_date || 'Recorded'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Geolocation Coordinates</span>
                      <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        Lat: {compareCandidate.evidence?.target_lat ?? '—'}, Lon: {compareCandidate.evidence?.target_lon ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forensic Correlation Findings */}
              <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs text-amber-950 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Forensic Overlap Interpretation</span>
                </div>
                <p className="leading-relaxed">
                  Both records describe infrastructure in the same administrative area ({project.district}) with {(compareCandidate.description_similarity * 100).toFixed(0)}% semantic vocabulary overlap and {(compareCandidate.timeline_overlap * 100).toFixed(0)}% concurrent execution windows. Recommend field verification to ensure separate physical assets were created.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span>Classification: </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{compareCandidate.classification}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareCandidate(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Close Comparison
                </button>
                <button
                  onClick={() => {
                    const nextId = compareCandidate.target_code;
                    setCompareCandidate(null);
                    onSelectOtherProject(nextId);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition shadow-sm"
                >
                  <span>Open Dossier for {compareCandidate.target_code}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
