import React, { useEffect, useState } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import { api } from '../api';
import { Project } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsPage: React.FC<Props> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filter states
  const [search, setSearch] = useState('');
  const [state, setState] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [parliamentType, setParliamentType] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    states: string[];
    categories: string[];
    risk_levels: string[];
    statuses: string[];
  }>({
    states: [],
    categories: [],
    risk_levels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    statuses: ['ONGOING', 'COMPLETED', 'DELAYED', 'NOT_STARTED'],
  });

  const [loading, setLoading] = useState(true);

  // Load filter lists
  useEffect(() => {
    api.getProjectFilters().then(setFilterOptions).catch(console.error);
  }, []);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects({
        page,
        page_size: pageSize,
        search,
        parliament_type: parliamentType === 'ALL' ? undefined : parliamentType,
        state: state === 'ALL' ? undefined : state,
        category: category === 'ALL' ? undefined : category,
        risk_level: riskLevel === 'ALL' ? undefined : riskLevel,
        status: status === 'ALL' ? undefined : status,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setProjects(res.projects);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, parliamentType, state, category, riskLevel, status, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Project Intelligence Database
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, and inspect {total.toLocaleString()} official MPLADS projects across Lok Sabha & Rajya Sabha portfolios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjects}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Featured Priority Audit Dossier Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-sky-300/70 dark:border-sky-800/70 bg-sky-50/50 dark:bg-sky-950/20 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="rounded bg-sky-600 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide shrink-0">
            Priority Audit Dossier
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            <strong className="font-mono text-sky-600 dark:text-sky-400">MPLADS-LS-388</strong>: Ravindra Dattaram Waikar — Mumbai North West (₹537.99L disbursed, 0% works completed)
          </span>
        </div>
        <button
          onClick={() => onSelectProject('MPLADS-LS-388')}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold shrink-0 transition"
        >
          <span>Open Case</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs space-y-3">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by project name, ID (e.g. MPLADS-LS-001), district or work scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            Search
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Parliament Type</label>
            <select
              value={parliamentType}
              onChange={(e) => { setParliamentType(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Parliament (Both)</option>
              <option value="Lok Sabha">Lok Sabha</option>
              <option value="Rajya Sabha">Rajya Sabha</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">State / UT</label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All States ({filterOptions.states.length})</option>
              {filterOptions.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Category / Sector</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All Categories ({filterOptions.categories.length})</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Risk Severity</label>
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              {filterOptions.risk_levels.map((r) => (
                <option key={r} value={r}>{r} RISK</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All Work Statuses</option>
              {filterOptions.statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('project_id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Project ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('project_name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Work Title & Scope</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">State & District</th>
                <th
                  onClick={() => handleSort('budget')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Budget (₹ L)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Progress</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th
                  onClick={() => handleSort('risk_score')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-sky-500" />
                      <span>Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching public infrastructure projects found.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p.project_id)}
                    className="hover:bg-sky-50/30 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {p.project_id}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition" title={p.project_name}>
                        {p.project_name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{p.description}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        (p.parliament_type === 'Rajya Sabha' || p.category?.includes('Rajya Sabha'))
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60'
                      }`}>
                        {p.category || (p.parliament_type ? `MPLADS — ${p.parliament_type}` : 'MPLADS')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {p.district}, <span className="font-semibold text-slate-800 dark:text-slate-200">{p.state}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      ₹{p.budget ? p.budget.toLocaleString() : '—'} L
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold whitespace-nowrap">
                      <span className={p.completion_percentage < 30 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                        {p.completion_percentage.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{projects.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(page * pageSize, total)}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{total.toLocaleString()}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-mono text-[11px] px-2">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
