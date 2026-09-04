import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  AlertTriangle,
  Flame,
  AlertOctagon,
  Copy,
  DollarSign,
  Clock,
  CheckSquare,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../api';
import { DashboardData, Project } from '../types';
import { MetricCard } from '../components/MetricCard';
import { RiskBadge } from '../components/RiskBadge';
import { DonutChart, HorizontalBarChart } from '../components/SvgCharts';

interface Props {
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onSelectProject, onNavigateTab }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <span className="text-sm font-semibold">Aggregating project intelligence...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h3 className="font-bold">Dashboard Error</h3>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, risk_distribution, category_distribution, state_distribution, high_priority_projects } = data;

  // Donut chart data
  const donutData = [
    { label: 'Low Risk', value: risk_distribution.LOW || 0, color: '#10b981' },
    { label: 'Medium Risk', value: risk_distribution.MEDIUM || 0, color: '#f59e0b' },
    { label: 'High Risk', value: risk_distribution.HIGH || 0, color: '#f97316' },
    { label: 'Critical Risk', value: risk_distribution.CRITICAL || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-gov-800 to-gov-900 rounded-2xl p-6 text-white shadow-lg shadow-gov-900/10">
        <div>
          <span className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm mb-2">
            Intelligence Overview
          </span>
          <h1 className="text-2xl font-black tracking-tight">MPLADS National Vigilance Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Official MPLADS Intelligence Screening: Monitoring {metrics.total_projects.toLocaleString()} Parliamentary Constituency development funds across all {state_distribution.length || 36} States & Union Territories.
            Prioritizing {metrics.projects_requiring_review} flagged cases for expert audit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('review')}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-300"
          >
            <span>Review Queue ({metrics.projects_requiring_review})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Metric KPIs in 2 rows */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Core Anomaly & Pipeline Indicators
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Projects"
            value={metrics.total_projects}
            subtitle="Uploaded active registry"
            icon={FolderKanban}
            variant="default"
            onClick={() => onNavigateTab('projects')}
          />
          <MetricCard
            title="Action Queue"
            value={metrics.projects_requiring_review}
            subtitle="Flagged for human audit"
            icon={AlertTriangle}
            variant="warning"
            onClick={() => onNavigateTab('review')}
          />
          <MetricCard
            title="Critical Risk"
            value={metrics.critical_risk_count}
            subtitle="Score > 80/100"
            icon={Flame}
            variant="danger"
            onClick={() => onNavigateTab('review')}
          />
          <MetricCard
            title="High Risk"
            value={metrics.high_risk_count}
            subtitle="Score 61–80/100"
            icon={AlertOctagon}
            variant="warning"
            onClick={() => onNavigateTab('review')}
          />
          <MetricCard
            title="Cost Anomalies"
            value={metrics.cost_anomalies}
            subtitle="> 50% deviation from median"
            icon={DollarSign}
            variant="danger"
          />
          <MetricCard
            title="Duplicate Cases"
            value={metrics.duplicate_cases}
            subtitle="Semantic & geo overlap"
            icon={Copy}
            variant="warning"
          />
          <MetricCard
            title="Schedule Risks"
            value={metrics.schedule_risks}
            subtitle="Severe progress delay"
            icon={Clock}
            variant="danger"
          />
          <MetricCard
            title="Data Quality"
            value={metrics.data_quality_issues}
            subtitle="Invalid dates / bounds"
            icon={CheckSquare}
            variant="info"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Overall Risk Distribution</h3>
            <span className="text-[11px] font-semibold text-slate-400">4 Tier Standard</span>
          </div>
          <DonutChart data={donutData} title="Risk Profile" />
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Projects by Sector Category</h3>
            <span className="text-[11px] font-semibold text-slate-400">Count (Avg Risk)</span>
          </div>
          <HorizontalBarChart
            data={category_distribution.map((c) => ({
              label: c.category,
              value: c.count,
              subValue: `Risk ${c.avg_risk}`,
              color: c.avg_risk > 50 ? '#f97316' : '#1b4d89',
            }))}
            maxBars={6}
          />
        </div>

        {/* State Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Geographic Spread (States)</h3>
            <span className="text-[11px] font-semibold text-slate-400">Regional Volume</span>
          </div>
          <HorizontalBarChart
            data={state_distribution.map((s) => ({
              label: s.state,
              value: s.count,
              subValue: `Avg Risk ${s.avg_risk}`,
              color: '#3b82f6',
            }))}
            maxBars={6}
          />
        </div>
      </div>

      {/* Priority Review Queue: Top 10 High Risk Projects */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Immediate Action: Top 10 Highest Risk Projects</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked strictly by evidence-driven risk scoring engine. Click any row for comprehensive forensic analysis.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <span>View All Projects ({metrics.total_projects})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Work Description</th>
                <th className="py-3 px-4">Sector / Category</th>
                <th className="py-3 px-4">State & District</th>
                <th className="py-3 px-4 text-right">Sanctioned Budget</th>
                <th className="py-3 px-4 text-center">Progress</th>
                <th className="py-3 px-4 text-center">Risk Assessment</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {high_priority_projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p.project_id)}
                  className="hover:bg-blue-50/50 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{p.project_id}</td>
                  <td className="py-3.5 px-4 max-w-xs font-medium text-slate-800 truncate" title={p.project_name}>
                    {p.project_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.district}, <span className="font-semibold text-slate-800">{p.state}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                    ₹{p.budget ? p.budget.toLocaleString() : '—'} Lakh
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">
                    <span className={p.completion_percentage < 30 ? 'text-rose-600' : 'text-slate-700'}>
                      {p.completion_percentage.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:underline">
                      Investigate <ArrowRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
