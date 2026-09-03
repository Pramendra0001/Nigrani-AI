import React, { useEffect, useState } from 'react';
import { ClipboardList, ArrowRight, Filter, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../api';
import { ReviewCaseItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  onSelectProject: (projectId: string) => void;
}

export const ReviewQueuePage: React.FC<Props> = ({ onSelectProject }) => {
  const [cases, setCases] = useState<ReviewCaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await api.getReviewQueue({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        page,
        page_size: 20,
      });
      setCases(res.cases);
      setTotal(res.total);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [page, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">Priority Human Review Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Projects flagged by automated statistical screening requiring human triage, field verification, or clearance.
          </p>
        </div>
        <button
          onClick={loadQueue}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Triage Status:</span>
        </div>
        {['ALL', 'NEW', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setPage(1); }}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="font-bold text-slate-700">Severity:</span>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
          </select>
        </div>
      </div>

      {/* Queue List Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Case / Project Code</th>
                <th className="py-3 px-4">Work Scope</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Triage Status</th>
                <th className="py-3 px-4 text-center">Assigned Reviewer</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Audit Notes</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading review queue...</td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No review cases currently matching this filter status.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectProject(c.project_code)}
                    className="hover:bg-blue-50/40 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{c.project_code}</td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 truncate">{c.project_name}</div>
                      <div className="text-[11px] text-slate-400">{c.category}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.district}, <span className="font-semibold text-slate-800">{c.state}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} type="review" />
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600">
                      {c.assigned_to || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {c.notes_count} note{c.notes_count !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                        Open File <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
