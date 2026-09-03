import React, { useEffect, useState } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, Layers } from 'lucide-react';
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
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');

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
  }, [page, state, category, riskLevel, status, sortBy, sortOrder]);

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
          <h1 className="text-xl font-black tracking-tight text-slate-900">Project Intelligence Database</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and inspect {total.toLocaleString()} public infrastructure projects across all administrative divisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjects}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, ID (e.g. PRJ-MH-001), district or work scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-gov-700 px-4 py-2 text-xs font-semibold text-white hover:bg-gov-800 transition"
          >
            Search
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">State</label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All States ({filterOptions.states.length})</option>
              {filterOptions.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category / Sector</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Categories ({filterOptions.categories.length})</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Risk Severity</label>
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              {filterOptions.risk_levels.map((r) => (
                <option key={r} value={r}>{r} RISK</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
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
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('project_id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Project ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('project_name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
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
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Budget (₹ Lakh)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('completion_percentage')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Progress</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th
                  onClick={() => handleSort('risk_score')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Risk Level</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Loading project records...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No matching project records found for current filters.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p.project_id)}
                    className="hover:bg-blue-50/40 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{p.project_id}</td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 truncate" title={p.project_name}>
                        {p.project_name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {p.description || 'No work description provided'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.district}, <span className="font-semibold text-slate-800">{p.state}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      ₹{p.budget ? p.budget.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className={p.completion_percentage < 30 && p.status === 'DELAYED' ? 'text-rose-600' : 'text-slate-700'}>
                        {p.completion_percentage.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{projects.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(page * pageSize, total)}</span> of{' '}
            <span className="font-semibold text-slate-800">{total}</span> records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
