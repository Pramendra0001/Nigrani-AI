import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Lock,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Info,
} from 'lucide-react';
import { api } from '../api';
import { EvidenceSummary, EvidenceItem } from '../types';

interface Props {
  onSelectProject: (projectId: string) => void;
}

export const EvidencePage: React.FC<Props> = ({ onSelectProject }) => {
  const [loading, setLoading] = useState(true);
  const [evidenceData, setEvidenceData] = useState<EvidenceSummary | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const data = await api.getEvidenceSummary();
      setEvidenceData(data);
    } catch (err) {
      console.error('Failed to load evidence summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const filteredSamples = (evidenceData?.samples || []).filter((s) => {
    if (stageFilter !== 'ALL' && s.stage !== stageFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.project_name.toLowerCase().includes(q) ||
        s.project_id.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.finding.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Asset Verification & Ground Truth
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Asset & Evidence Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geotagged physical milestone imagery, drone inspection surveys, and cryptographic validation hashes.
          </p>
        </div>

        {/* Stage Filter */}
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1222] p-1 shadow-xs self-start sm:self-auto flex-wrap">
          {['ALL', 'BEFORE_COMMENCEMENT', 'DURING_EXECUTION', 'COMPLETION_AUDIT'].map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                stageFilter === st
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'All Stages'
                : st === 'BEFORE_COMMENCEMENT'
                ? 'Before'
                : st === 'DURING_EXECUTION'
                ? 'During'
                : 'Completion'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Asset Records</span>
            <Camera className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {evidenceData?.total_evidence_records || 1284}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Geotagged milestone captures</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Verified Ground Truth</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {evidenceData?.verified_geotagged || 1148}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cryptographically certified</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Physical Discrepancies</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {evidenceData?.discrepancies_flagged || 136}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Progress mismatch vs expenditure</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Drone UAV Surveys</span>
            <FileCheck2 className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {evidenceData?.drone_surveys_completed || 82}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">High-resolution aerial audits</p>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Milestone Evidence Records</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspected physical asset verifications with SHA-256 cryptographic signatures.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search evidence records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSamples.map((item) => {
            const isAnomaly = item.status === 'ANOMALY_SUSPECTED';
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                  isAnomaly
                    ? 'border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-cyan-400 bg-sky-100/70 dark:bg-sky-950 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isAnomaly
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {item.project_name}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-400">{item.project_id}</p>
                  </div>

                  {/* Simulated Image Placeholder with overlay tags */}
                  <div className="h-32 rounded-lg bg-slate-800 border border-slate-700 flex flex-col justify-between p-3 relative overflow-hidden text-white">
                    <div className="flex items-center justify-between z-10 text-[10px]">
                      <span className="rounded bg-black/60 backdrop-blur-xs px-2 py-0.5 font-bold uppercase tracking-wider">
                        {item.stage.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-[9px] bg-black/60 px-1.5 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>SHA-256</span>
                      </div>
                    </div>

                    <div className="z-10 space-y-0.5">
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-400" />
                        <span>{item.location}</span>
                      </p>
                      <p className="text-[10px] text-slate-300 font-mono">{item.coordinates}</p>
                    </div>

                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.finding}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  <button
                    onClick={() => onSelectProject(item.project_id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline"
                  >
                    <span>Examine Project</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};