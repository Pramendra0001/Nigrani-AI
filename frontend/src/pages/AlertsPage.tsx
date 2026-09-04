import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Info,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  Download,
} from 'lucide-react';

interface Props {
  onSelectProject: (projectId: string) => void;
}

interface AlertRecord {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WATCH' | 'INFO';
  project_id: string;
  project_name: string;
  state: string;
  district: string;
  detection_date: string;
  reason: string;
  confidence: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  recommended_action: string;
}

export const AlertsPage: React.FC<Props> = ({ onSelectProject }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [alerts, setAlerts] = useState<AlertRecord[]>([
    {
      id: 'ALT-2026-001',
      severity: 'CRITICAL',
      project_id: 'MPLADS-LS-388',
      project_name: 'Ravindra Dattaram Waikar — Mumbai North West',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      detection_date: '2026-02-18',
      reason: '100% fund disbursement (₹537.99 Lakhs) with 0% physical completion across 67 sanctioned works.',
      confidence: '96%',
      status: 'OPEN',
      recommended_action: 'Issue statutory show-cause query and mandate physical geo-inspection of executing sites.',
    },
    {
      id: 'ALT-2026-002',
      severity: 'CRITICAL',
      project_id: 'MPLADS-LS-215',
      project_name: 'P. P. Mohammed Faizal — Lakshadweep',
      state: 'Lakshadweep',
      district: 'Lakshadweep',
      detection_date: '2026-02-22',
      reason: 'High expenditure-to-progress variance: ₹320 Lakhs disbursed with incomplete milestone certificates.',
      confidence: '91%',
      status: 'UNDER_REVIEW',
      recommended_action: 'Direct District Collector to submit digital Measurement Book and satellite photo proof.',
    },
    {
      id: 'ALT-2026-003',
      severity: 'HIGH',
      project_id: 'MPLADS-LS-001',
      project_name: 'Afzal Ansari — Ghazipur',
      state: 'Uttar Pradesh',
      district: 'Ghazipur',
      detection_date: '2026-01-28',
      reason: 'Sluggish intermediate progress against sanctioned work volume signals multi-quarter schedule delay.',
      confidence: '88%',
      status: 'OPEN',
      recommended_action: 'Review implementing agency execution speed across village connectivity civil packages.',
    },
    {
      id: 'ALT-2026-004',
      severity: 'HIGH',
      project_id: 'MPLADS-RS-005',
      project_name: 'Dr. Laxmikant Bajpayee — Uttar Pradesh (RS)',
      state: 'Uttar Pradesh',
      district: 'Meerut',
      detection_date: '2026-02-04',
      reason: 'Unusual cost variance in community civil works exceeding comparable district median by +34%.',
      confidence: '85%',
      status: 'UNDER_REVIEW',
      recommended_action: 'Cross-reference standard Schedule of Rates (SoR) and tender bids for civil materials.',
    },
    {
      id: 'ALT-2026-005',
      severity: 'MEDIUM',
      project_id: 'MPLADS-LS-142',
      project_name: 'Kanimozhi Karunanidhi — Thoothukkudi',
      state: 'Tamil Nadu',
      district: 'Thoothukkudi',
      detection_date: '2026-01-15',
      reason: 'Idle unspent fund accumulation: unutilized balance exceeding ₹400 Lakhs over consecutive quarters.',
      confidence: '82%',
      status: 'OPEN',
      recommended_action: 'Expedite district recommendation sanctions to prevent lapse of parliamentary entitlement.',
    },
    {
      id: 'ALT-2026-006',
      severity: 'WATCH',
      project_id: 'MPLADS-RS-022',
      project_name: 'Sudha Murty — Nominated Rajya Sabha',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      detection_date: '2026-02-10',
      reason: 'Missing digital Utilization Certificate for completed public library infrastructure package.',
      confidence: '89%',
      status: 'RESOLVED',
      recommended_action: 'Digital UC submitted and verified by State Nodal Authority on 2026-02-28.',
    },
  ]);

  const handleStatusChange = (id: string, newStatus: AlertRecord['status']) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.project_name.toLowerCase().includes(q) ||
        a.project_id.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q)
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
            <span className="rounded bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Early Warning Radar
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Early Warning & Alert Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active multi-factor risk signals, execution stall warnings, and statutory deviation alerts.
          </p>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(alerts, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Nigrani_AI_Alert_Log_${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1222] hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-sky-500" />
          <span>Export Alert Log</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/80 bg-rose-50/50 dark:bg-rose-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Critical Alerts</span>
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-2">
            {alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length}
          </p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Immediate intervention required</p>
        </div>

        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/80 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">High Hazards</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-2">
            {alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'RESOLVED').length}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Cost/delay warning signals</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Open Alerts</span>
            <BellRing className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {alerts.filter((a) => a.status === 'OPEN').length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Awaiting triage action</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Resolved Alerts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {alerts.filter((a) => a.status === 'RESOLVED').length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cleared with audit record</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts by project or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'WATCH'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  severityFilter === sev
                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#0b1222] rounded-xl border border-slate-200 dark:border-slate-800">
            No alerts match the active filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                alert.status === 'RESOLVED'
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 opacity-75'
                  : alert.severity === 'CRITICAL'
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                  : alert.severity === 'HIGH'
                  ? 'border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400">
                    {alert.id}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Detected: {alert.detection_date}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    • Confidence: {alert.confidence}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={alert.status}
                    onChange={(e) => handleStatusChange(alert.id, e.target.value as any)}
                    className="text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="UNDER_REVIEW">Status: UNDER REVIEW</option>
                    <option value="RESOLVED">Status: RESOLVED</option>
                    <option value="DISMISSED">Status: DISMISSED</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                  {alert.project_name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {alert.project_id} • {alert.district}, {alert.state}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Trigger Reason:</strong> {alert.reason}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  <strong>Recommended Action:</strong> {alert.recommended_action}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] text-slate-400">
                  Decision-Support Indicator • Requires Human Verification
                </span>
                <button
                  onClick={() => onSelectProject(alert.project_id)}
                  className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-cyan-400 hover:underline"
                >
                  <span>Examine Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};