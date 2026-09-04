import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Building2,
  ExternalLink,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { api } from '../api';
import { GeoSummary, GeoStateData } from '../types';
import { RiskBadge } from '../components/RiskBadge';

interface Props {
  onSelectProject: (projectId: string) => void;
}

export const GeoMapPage: React.FC<Props> = ({ onSelectProject }) => {
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState<GeoSummary | null>(null);
  const [parliamentType, setParliamentType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<GeoStateData | null>(null);
  const [sortBy, setSortBy] = useState<'risk' | 'count' | 'budget' | 'exp'>('risk');

  const fetchGeoData = async () => {
    setLoading(true);
    try {
      const data = await api.getGeoSummary(parliamentType);
      setGeoData(data);
      if (data.states.length > 0 && !selectedState) {
        setSelectedState(data.states[0]);
      }
    } catch (err) {
      console.error('Failed to load geographic summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeoData();
  }, [parliamentType]);

  const filteredStates = useMemo(() => {
    if (!geoData) return [];
    let list = geoData.states.filter((s) =>
      s.state.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    list = [...list].sort((a, b) => {
      if (sortBy === 'risk') {
        const aTotalRisk = a.critical_risk_count * 2 + a.high_risk_count;
        const bTotalRisk = b.critical_risk_count * 2 + b.high_risk_count;
        if (bTotalRisk !== aTotalRisk) return bTotalRisk - aTotalRisk;
        return b.avg_risk - a.avg_risk;
      }
      if (sortBy === 'count') return b.project_count - a.project_count;
      if (sortBy === 'budget') return b.total_budget - a.total_budget;
      if (sortBy === 'exp') return b.total_expenditure - a.total_expenditure;
      return 0;
    });

    return list;
  }, [geoData, searchQuery, sortBy]);

  const nationalMetrics = useMemo(() => {
    if (!geoData) return { totalStates: 0, highRiskStates: 0, totalBudget: 0, totalExp: 0 };
    const totalStates = geoData.states.length;
    const highRiskStates = geoData.states.filter(
      (s) => s.critical_risk_count > 0 || s.high_risk_count > 0
    ).length;
    const totalBudget = geoData.states.reduce((acc, s) => acc + s.total_budget, 0);
    const totalExp = geoData.states.reduce((acc, s) => acc + s.total_expenditure, 0);
    return { totalStates, highRiskStates, totalBudget, totalExp };
  }, [geoData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Spatial Intelligence & GIS Cluster
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Geographic Risk Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spatial distribution, state-level risk heatmaps, and fund absorption analysis across 36 States & UTs.
          </p>
        </div>

        {/* Parliament House Filter */}
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1222] p-1 shadow-xs self-start sm:self-auto">
          {(['ALL', 'Lok Sabha', 'Rajya Sabha'] as const).map((house) => (
            <button
              key={house}
              onClick={() => setParliamentType(house)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                parliamentType === house
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {house === 'ALL' ? 'Combined (774 Portfolios)' : house}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Covered Jurisdictions</span>
            <MapPin className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {nationalMetrics.totalStates}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">States & Union Territories</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jurisdictions with High Risk</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {nationalMetrics.highRiskStates}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">States containing High/Critical cases</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">National Limit Tracked</span>
            <Building2 className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹{(nationalMetrics.totalBudget / 100).toFixed(2)} <span className="text-xs font-medium text-slate-400">Cr</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Total sanctioned portfolio limit</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Cumulative Expenditure</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{(nationalMetrics.totalExp / 100).toFixed(2)} <span className="text-xs font-medium text-slate-400">Cr</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {nationalMetrics.totalBudget > 0
              ? `${((nationalMetrics.totalExp / nationalMetrics.totalBudget) * 100).toFixed(1)}% fund absorption`
              : '0% absorption'}
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout: State List & State Detailed Geospatial Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: State Search, Filter, and Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter state or UT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                >
                  <option value="risk">Risk Severity</option>
                  <option value="count">Project Count</option>
                  <option value="budget">Sanctioned Budget</option>
                  <option value="exp">Expenditure</option>
                </select>
              </div>
            </div>

            {/* State Grid List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading spatial intelligence...</div>
              ) : filteredStates.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No matching jurisdictions found.</div>
              ) : (
                filteredStates.map((s) => {
                  const isSelected = selectedState?.state === s.state;
                  const hasCritical = s.critical_risk_count > 0;
                  const hasHigh = s.high_risk_count > 0;

                  return (
                    <div
                      key={s.state}
                      onClick={() => setSelectedState(s)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 dark:border-cyan-500 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {s.state}
                          </h3>
                          {hasCritical && (
                            <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.2 border border-rose-300 dark:border-rose-800">
                              {s.critical_risk_count} Critical
                            </span>
                          )}
                          {hasHigh && (
                            <span className="rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.2 border border-amber-300 dark:border-amber-800">
                              {s.high_risk_count} High
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            <strong>{s.project_count}</strong> Portfolios
                          </span>
                          <span>•</span>
                          <span>
                            ₹<strong>{(s.total_budget / 100).toFixed(1)}</strong> Cr Sanctioned
                          </span>
                          <span>•</span>
                          <span>
                            ₹<strong>{(s.total_expenditure / 100).toFixed(1)}</strong> Cr Spent
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Avg Risk</p>
                          <p className={`font-mono text-xs font-black ${
                            s.avg_risk >= 55 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {s.avg_risk.toFixed(1)}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${
                          isSelected ? 'translate-x-1 text-sky-500 dark:text-cyan-400' : ''
                        }`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected State Dossier & Spatial Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {selectedState ? (
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-5 shadow-xs space-y-5 sticky top-20">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
                      State Spatial Profile
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {selectedState.state}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Centroid: {selectedState.lat.toFixed(4)}° N, {selectedState.lng.toFixed(4)}° E
                  </p>
                </div>
                <RiskBadge
                  level={
                    selectedState.critical_risk_count > 0
                      ? 'CRITICAL'
                      : selectedState.high_risk_count > 0
                      ? 'HIGH'
                      : selectedState.avg_risk >= 35
                      ? 'MEDIUM'
                      : 'LOW'
                  }
                  score={selectedState.avg_risk}
                  size="md"
                />
              </div>

              {/* Spatial Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Portfolios</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedState.project_count}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Fund Absorption</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {selectedState.total_budget > 0
                      ? `${((selectedState.total_expenditure / selectedState.total_budget) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Allocated Budget</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    ₹{(selectedState.total_budget / 100).toFixed(2)} Cr
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Expenditure Booked</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    ₹{(selectedState.total_expenditure / 100).toFixed(2)} Cr
                  </p>
                </div>
              </div>

              {/* Simulated Map Visualizer */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-4 relative overflow-hidden h-44 flex flex-col justify-between">
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>GIS Coordinate Cluster</span>
                  </div>
                  <span className="rounded bg-sky-950/80 border border-sky-600 text-sky-300 text-[10px] font-mono px-2 py-0.5">
                    WGS84 Grid
                  </span>
                </div>

                <div className="z-10 text-center space-y-1">
                  <MapPin className="w-7 h-7 text-rose-500 mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-white">{selectedState.state} Regional Cluster</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedState.high_risk_count + selectedState.critical_risk_count > 0
                      ? `${selectedState.high_risk_count + selectedState.critical_risk_count} anomaly clusters detected in administrative divisions`
                      : 'Zero critical anomaly clusters identified in this jurisdiction'}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 z-10 border-t border-slate-800 pt-2 font-mono">
                  <span>Geodetic Precision: ±3.5m</span>
                  <span>Spatial Mode: Polygon Cluster</span>
                </div>

                {/* Subtle Grid Graphic Background */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* Action notice */}
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 p-3 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Geospatial risk scoring synthesizes delay index, contractor concentration, and ward-level duplicate submission likelihood for {selectedState.state}.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              Select a state from the list to inspect geospatial analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};