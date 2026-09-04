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
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Priority Human Review Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official MPLADS projects flagged by automated statistical screening requiring human triage, field verification, or clearance.
          </p>
        </div>
        <button
          onClick={loadQueue}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#0b1222] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Triage Status:</span>
        </div>
        {['ALL', 'NEW', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setPage(1); }}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              statusFilter === st
                ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs border border-slate-700 dark:border-slate-600'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Severity:</span>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Queue items list */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0b1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-500 mb-2" />
            <span className="text-xs font-semibold">Updating triage queue...</span>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0b1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No review cases match this filter</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              All projects under this status have been addressed or cleared.
            </p>
          </div>
        ) : (
          cases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectProject(c.project_id)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] hover:border-sky-500/50 hover:bg-sky-50/20 dark:hover:bg-slate-800/30 transition-all cursor-pointer shadow-xs gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{c.project_id}</span>
                  <StatusBadge status={c.status} type="review" />
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Priority: <span className="font-bold text-slate-700 dark:text-slate-200">{c.priority}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                  {c.project_name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  Scope: <span className="text-slate-700 dark:text-slate-300 font-medium">{c.category} • Budget: ₹{c.budget ? c.budget.toLocaleString() : '—'} L • {c.district}, {c.state}</span>
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1 font-mono">
                  <span>Queued: {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active Queue'}</span>
                  <span>•</span>
                  <span>{c.notes_count} Audit Notes Logged</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                <RiskBadge level={c.priority} score={c.risk_score} size="md" />
                <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline">
                  Open Dossier <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0b1222] rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Total: <strong className="text-slate-800 dark:text-slate-200">{total}</strong> items needing review
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 py-1 font-mono">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
