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
} from 'lucide-react';
import { api } from '../api';
import { ProjectInvestigation } from '../types';
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

  // Review form state
  const [noteAuthor, setNoteAuthor] = useState('Senior Vigilance Officer');
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
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <span className="text-sm font-semibold">Loading forensic investigation file...</span>
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {project.project_id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">{project.category}</span>
            </div>
            <h1 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">{project.project_name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{analyzing ? 'Analyzing Pipeline...' : 'Re-Run Intelligence Pipeline'}</span>
          </button>
          <RiskBadge level={analysis.risk_level} score={analysis.overall_risk_score} size="lg" />
        </div>
      </div>

      {/* Top Profile Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Radial Score Gauge */}
          <div className="flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
            <RadialRiskGauge score={analysis.overall_risk_score} level={analysis.risk_level} />
            <p className="text-[11px] text-slate-400 text-center mt-2 max-w-[160px]">
              Deterministic weighted sum of Cost (35%), Duplicate (30%), Delay (25%), DQ (10%).
            </p>
          </div>

          {/* Component Risk Progress Breakdown */}
          <div className="lg:col-span-2 space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Cost Anomaly Risk (35% weight)</span>
                <span className="font-mono font-bold text-slate-900">{analysis.cost_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.cost_risk_score)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Duplicate / Overlap Risk (30% weight)</span>
                <span className="font-mono font-bold text-slate-900">{analysis.duplicate_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.duplicate_risk_score)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Schedule Delay Risk (25% weight)</span>
                <span className="font-mono font-bold text-slate-900">{analysis.delay_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.delay_risk_score)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Data Quality Deficit (10% weight)</span>
                <span className="font-mono font-bold text-slate-900">{analysis.data_quality_risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, analysis.data_quality_risk_score)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Sanctioned Budget:</span>
              <span className="font-mono font-bold text-slate-900">₹{project.budget ? project.budget.toLocaleString() : '—'} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Actual Booked Cost:</span>
              <span className="font-mono font-bold text-slate-900">₹{project.actual_cost ? project.actual_cost.toLocaleString() : '—'} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Reported Completion:</span>
              <span className="font-mono font-bold text-slate-900">{project.completion_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Work Status:</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex justify-between">
              <span className="text-slate-400 font-medium">Location:</span>
              <span className="font-semibold text-slate-700">{project.district}, {project.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-2 shadow-sm overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isAct = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                isAct
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isAct ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{t.label}</span>
              {t.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  t.badge === '!' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Work Scope & Specifications</h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {project.description || 'No work description specified in original sanction document.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 font-semibold block uppercase">Administrative Location</span>
                <p className="mt-1 font-bold text-slate-800 text-sm">{project.district}, {project.state}</p>
                <p className="text-xs text-slate-500 mt-1">
                  GPS: {project.latitude ?? '—'}, {project.longitude ?? '—'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 font-semibold block uppercase">Timeline Contract</span>
                <p className="mt-1 font-bold text-slate-800 text-sm">
                  {project.start_date || '—'} → {project.expected_end_date || '—'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Duration: {delay_analysis.planned_duration_days ? `${delay_analysis.planned_duration_days} days` : 'Not recorded'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 font-semibold block uppercase">Review Status</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={review_case?.status || 'NEW'} type="review" />
                  <span className="text-xs font-semibold text-slate-600">
                    Priority: {review_case?.priority || 'MEDIUM'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. COST ANALYSIS TAB */}
        {activeTab === 'cost' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Statistical Cost Anomaly Detection</h3>
                <p className="text-xs text-slate-500">
                  Compared against {cost_analysis.comparable_count} similar {project.category} projects in {project.district} and {project.state}.
                </p>
              </div>
              <RiskBadge score={cost_analysis.risk_score} size="md" />
            </div>

            {/* Benchmark Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">This Project Cost</span>
                <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
                  ₹{cost_analysis.project_cost?.toLocaleString()} L
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Comparable Median</span>
                <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
                  ₹{cost_analysis.comparable_median ? cost_analysis.comparable_median.toLocaleString() : '—'} L
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Cost Deviation</span>
                <p className={`mt-1 text-2xl font-black font-mono ${
                  (cost_analysis.cost_deviation_percentage || 0) > 50 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {cost_analysis.cost_deviation_percentage !== undefined ? `${cost_analysis.cost_deviation_percentage > 0 ? '+' : ''}${cost_analysis.cost_deviation_percentage}%` : '—'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Cost Percentile Rank</span>
                <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
                  {cost_analysis.percentile_rank !== undefined ? `${cost_analysis.percentile_rank}th` : '—'}
                </p>
              </div>
            </div>

            {/* AI Contextual Narrative */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Cost Explanation & Contextual Reasoning</span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed">
                {cost_analysis.ai_explanation?.narrative || 'No specific cost narrative generated.'}
              </p>

              {cost_analysis.ai_explanation?.recommendations && cost_analysis.ai_explanation.recommendations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-blue-200/60">
                  <span className="text-xs font-bold text-blue-900 block mb-2">Recommended Reviewer Actions:</span>
                  <ul className="list-disc list-inside text-xs text-blue-950 space-y-1">
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Duplicate & Overlapping Asset Intelligence</h3>
                <p className="text-xs text-slate-500">
                  Semantic description analysis combined with Haversine distance, concurrent timelines, and budget ratios.
                </p>
              </div>
              <RiskBadge score={duplicate_analysis.risk_score} size="md" />
            </div>

            {duplicate_analysis.ai_explanation?.narrative && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Overlap Assessment</span>
                </div>
                <p>{duplicate_analysis.ai_explanation.narrative}</p>
              </div>
            )}

            {duplicate_analysis.top_candidates.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium">
                No duplicate or overlapping candidates detected in this administrative zone.
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Top Matched Candidate Projects ({duplicate_analysis.top_candidates.length})
                </h4>
                {duplicate_analysis.top_candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition bg-slate-50/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700">{cand.target_code}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cand.classification === 'POSSIBLE_DUPLICATE'
                              ? 'bg-rose-100 text-rose-700'
                              : cand.classification === 'POSSIBLE_OVERLAP'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {cand.classification}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">{cand.target_name}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Combined Similarity</span>
                        <span className="text-xl font-black font-mono text-slate-900">
                          {(cand.combined_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Similarity Breakdown Pills */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Semantic Match</span>
                        <span className="font-bold font-mono">{(cand.description_similarity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Geo Proximity</span>
                        <span className="font-bold font-mono">
                          {cand.geographic_distance_km !== null && cand.geographic_distance_km !== undefined
                            ? `${cand.geographic_distance_km} km`
                            : 'Adjacent'}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Timeline Overlap</span>
                        <span className="font-bold font-mono">{(cand.timeline_overlap * 100).toFixed(0)}%</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Budget Match</span>
                        <span className="font-bold font-mono">{(cand.budget_similarity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => onSelectOtherProject(cand.target_code)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          Compare <ChevronRight className="w-3.5 h-3.5" />
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule & Execution Velocity Monitoring</h3>
                <p className="text-xs text-slate-500">
                  Calculates elapsed duration against reported completion to flag progress stalls.
                </p>
              </div>
              <RiskBadge score={delay_analysis.risk_score} size="md" />
            </div>

            {/* Timeline Progress Bar */}
            <div className="space-y-4 rounded-xl border border-slate-200 p-5 bg-slate-50">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Contractual Timeline Elapsed</span>
                  <span className="font-mono">{delay_analysis.time_elapsed_percentage || 0}%</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-600 rounded-full"
                    style={{ width: `${Math.min(100, delay_analysis.time_elapsed_percentage || 0)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Reported Physical Completion</span>
                  <span className="font-mono font-bold text-blue-600">{delay_analysis.completion_percentage}%</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, delay_analysis.completion_percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Classification</span>
                <p className="mt-1 text-base font-bold text-slate-900">{delay_analysis.delay_classification}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Schedule Deficit</span>
                <p className="mt-1 text-2xl font-black font-mono text-rose-600">
                  {delay_analysis.schedule_deviation ? `${delay_analysis.schedule_deviation}%` : '0%'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Planned Duration</span>
                <p className="mt-1 text-base font-bold text-slate-900 font-mono">
                  {delay_analysis.planned_duration_days ?? '—'} days
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Elapsed Days</span>
                <p className="mt-1 text-base font-bold text-slate-900 font-mono">
                  {delay_analysis.elapsed_days ?? '—'} days
                </p>
              </div>
            </div>

            {delay_analysis.ai_explanation?.narrative && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5 text-xs text-rose-950">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Data Integrity & Completeness Audit</h3>
                <p className="text-xs text-slate-500">
                  Checks mandatory fields, logical date orders, coordinate territorial bounds, and cost sanity.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  Completeness: <span className="font-bold text-slate-900 font-mono">{data_quality_analysis.completeness_score}%</span>
                </span>
                <RiskBadge score={data_quality_analysis.risk_score} size="md" />
              </div>
            </div>

            {data_quality_analysis.issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700">100% Valid Data Quality</span>
                <span className="text-xs">No missing fields, invalid ranges, or geographic bounding errors detected.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Identified Schema Anomaly Flags ({data_quality_analysis.total_issues})
                </h4>
                {data_quality_analysis.issues.map((iss, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : iss.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {iss.severity}
                      </span>
                      <span className="font-semibold text-slate-800">{iss.issue}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{iss.field}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. AI INVESTIGATION SUMMARY */}
        {activeTab === 'ai_summary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  AI-Generated Forensic Investigation Brief
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesizes multi-factor statistical evidence into an actionable vigilance brief for human decision-makers.
                </p>
              </div>
              <RiskBadge level={analysis.risk_level} score={analysis.overall_risk_score} size="md" />
            </div>

            {analysis.ai_summary ? (
              <div className="space-y-5">
                {/* Executive Brief Box */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-white p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-blue-900 mb-2">Executive Overview</h4>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {analysis.ai_summary.executive_summary}
                  </p>
                </div>

                {/* Key Findings List */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Evidence Signals</h4>
                  <div className="space-y-2">
                    {analysis.ai_summary.key_findings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-800 font-medium">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Action Recommended */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <span className="text-[11px] font-bold text-amber-900 uppercase block mb-1">Recommended Vigilance Action</span>
                  <p className="text-xs text-amber-950 font-semibold">{analysis.ai_summary.priority_action}</p>
                </div>

                {/* Legal / Ethical Disclaimer */}
                <p className="text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {analysis.ai_summary.disclaimer}
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                Click "Re-Run Intelligence Pipeline" above to synthesize the AI investigation summary.
              </div>
            )}
          </div>
        )}

        {/* 7. HUMAN REVIEW & AUDIT TAB */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Human Reviewer Decision & Audit Trail</h3>
                <p className="text-xs text-slate-500">
                  Record official observations, assign investigators, and update triage status.
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={reviewStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="NEW">NEW CASE</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ADDITIONAL_INFORMATION_REQUIRED">INFO REQUIRED</option>
                  <option value="RESOLVED">RESOLVED / CLEARED</option>
                </select>
              </div>
            </div>

            {/* Note Entry Form */}
            <form onSubmit={handleAddNote} className="space-y-3 rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add Investigator Observation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Reviewer Name / Designation"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
                <select
                  value={noteAction}
                  onChange={(e) => setNoteAction(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
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
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:border-blue-500"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gov-700 px-4 py-2 text-xs font-bold text-white hover:bg-gov-800 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{savingNote ? 'Recording Note...' : 'Log Official Note'}</span>
                </button>
              </div>
            </form>

            {/* Notes Audit Trail */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audit History ({review_case?.notes.length || 0} Entries)
              </h4>
              {review_case?.notes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No reviewer notes logged yet.</p>
              ) : (
                review_case?.notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200 p-4 text-xs space-y-1 bg-white">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-800">{note.author}</span>
                      <span className="font-mono text-[10px]">{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    {note.action_taken && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        Action: {note.action_taken}
                      </span>
                    )}
                    <p className="text-slate-700 mt-1 leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 8. RAW EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Explainable Raw Evidence Payload</h3>
                <p className="text-xs text-slate-500">
                  Full machine-readable diagnostic schema verifying deterministic score derivation.
                </p>
              </div>
            </div>
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-[11px] overflow-x-auto font-mono max-h-[500px]">
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
    </div>
  );
};
