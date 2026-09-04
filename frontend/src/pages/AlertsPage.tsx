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

export type AlertCategory =
  | 'Financial Variance'
  | 'Cost Anomaly'
  | 'Payment Anomaly'
  | 'Schedule Delay'
  | 'Physical vs Financial Consistency'
  | 'Duplicate / Overlap Risk'
  | 'Rule-Based Compliance Deviation'
  | 'Data Quality Deficit'
  | 'Asset Verification Required';

export type AlertStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'UNDER_REVIEW'
  | 'ACTION_REQUESTED'
  | 'RESOLVED'
  | 'DISMISSED_WITH_REASON';

interface AlertRecord {
  id: string;
  category: AlertCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WATCH' | 'INFO';
  project_id: string;
  project_name: string;
  state: string;
  district: string;
  detection_date: string;
  trigger_summary: string;
  evidence_summary: string;
  confidence: string;
  status: AlertStatus;
  recommended_action: string;
}

export const AlertsPage: React.FC<Props> = ({ onSelectProject }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [alerts, setAlerts] = useState<AlertRecord[]>([
    {
      id: 'ALT-2026-001',
      category: 'Physical vs Financial Consistency',
      severity: 'CRITICAL',
      project_id: 'MPLADS-LS-388',
      project_name: 'Ravindra Dattaram Waikar — Mumbai North West',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      detection_date: '2026-02-18',
      trigger_summary: '100% fund disbursement (₹537.99 Lakhs) with 0% physical completion across 67 sanctioned works.',
      evidence_summary: 'Divergence gap of 100.0%. Pattern: HIGH_EXPENDITURE_LOW_PHYSICAL_PROGRESS. Consistency Score: 0/100.',
      confidence: '96%',
      status: 'NEW',
      recommended_action: 'Issue statutory show-cause query and mandate physical geo-inspection of executing sites.',
    },
    {
      id: 'ALT-2026-002',
      category: 'Payment Anomaly',
      severity: 'CRITICAL',
      project_id: 'MPLADS-LS-215',
      project_name: 'P. P. Mohammed Faizal — Lakshadweep',
      state: 'Lakshadweep',
      district: 'Lakshadweep',
      detection_date: '2026-02-22',
      trigger_summary: 'High expenditure-to-progress variance: ₹320 Lakhs disbursed with incomplete milestone certificates.',
      evidence_summary: 'Disbursement velocity spike: 68% of funds drawn in 72-hour window without corresponding physical progress update.',
      confidence: '91%',
      status: 'UNDER_REVIEW',
      recommended_action: 'Direct District Collector to submit digital Measurement Book and satellite photo proof.',
    },
    {
      id: 'ALT-2026-003',
      category: 'Schedule Delay',
      severity: 'HIGH',
      project_id: 'MPLADS-LS-001',
      project_name: 'Afzal Ansari — Ghazipur',
      state: 'Uttar Pradesh',
      district: 'Ghazipur',
      detection_date: '2026-01-28',
      trigger_summary: 'Sluggish intermediate progress against sanctioned work volume signals multi-quarter schedule delay.',
      evidence_summary: 'Elapsed duration is 148% of planned contract window. Reported progress has stagnated at 42% for 6+ months.',
      confidence: '88%',
      status: 'ACKNOWLEDGED',
      recommended_action: 'Review implementing agency execution speed across village connectivity civil packages.',
    },
    {
      id: 'ALT-2026-004',
      category: 'Cost Anomaly',
      severity: 'HIGH',
      project_id: 'MPLADS-RS-005',
      project_name: 'Dr. Laxmikant Bajpayee — Uttar Pradesh (RS)',
      state: 'Uttar Pradesh',
      district: 'Meerut',
      detection_date: '2026-02-04',
      trigger_summary: 'Unusual cost variance in community civil works exceeding comparable district median by +34%.',
      evidence_summary: 'Peer median cost is ₹18.4L against project unit rate of ₹24.7L across 19 comparable works.',
      confidence: '85%',
      status: 'UNDER_REVIEW',
      recommended_action: 'Cross-reference standard Schedule of Rates (SoR) and tender bids for civil materials.',
    },
    {
      id: 'ALT-2026-005',
      category: 'Financial Variance',
      severity: 'MEDIUM',
      project_id: 'MPLADS-LS-142',
      project_name: 'Kanimozhi Karunanidhi — Thoothukkudi',
      state: 'Tamil Nadu',
      district: 'Thoothukkudi',
      detection_date: '2026-01-15',
      trigger_summary: 'Idle unspent fund accumulation: unutilized balance exceeding ₹400 Lakhs over consecutive quarters.',
      evidence_summary: 'Unspent balance represents 74.2% of cumulative release, indicating slow recommendation processing by District Authority.',
      confidence: '82%',
      status: 'ACTION_REQUESTED',
      recommended_action: 'Expedite district recommendation sanctions to prevent lapse of parliamentary entitlement.',
    },
    {
      id: 'ALT-2026-006',
      category: 'Rule-Based Compliance Deviation',
      severity: 'WATCH',
      project_id: 'MPLADS-RS-022',
      project_name: 'Sudha Murty — Nominated Rajya Sabha',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      detection_date: '2026-02-10',
      trigger_summary: 'Missing digital Utilization Certificate for completed public library infrastructure package.',
      evidence_summary: 'Deviation under GFR Rule 238: Formal UC not reconciled within 12 months of physical completion.',
      confidence: '89%',
      status: 'RESOLVED',
      recommended_action: 'Digital UC submitted and verified by State Nodal Authority on 2026-02-28.',
    },
    {
      id: 'ALT-2026-007',
      category: 'Duplicate / Overlap Risk',
      severity: 'HIGH',
      project_id: 'MPLADS-LS-089',
      project_name: 'Dr. Jitendra Singh — Udhampur',
      state: 'Jammu and Kashmir',
      district: 'Udhampur',
      detection_date: '2026-02-12',
      trigger_summary: '89% semantic and geospatial overlap with prior year public community center civil sanction.',
      evidence_summary: 'Candidate match with Work ID #JK-UDH-4011; Haversine distance < 120m; co-terminus implementation window.',
      confidence: '92%',
      status: 'NEW',
      recommended_action: 'Perform joint on-site physical demarcation to ensure dual billing was not issued for a single structure.',
    },
    {
      id: 'ALT-2026-008',
      category: 'Data Quality Deficit',
      severity: 'MEDIUM',
      project_id: 'MPLADS-LS-502',
      project_name: 'M. K. Raghavan — Kozhikode',
      state: 'Kerala',
      district: 'Kozhikode',
      detection_date: '2026-01-20',
      trigger_summary: 'Centroid geographic coordinates resolve outside official administrative district boundary.',
      evidence_summary: 'Recorded lat/lon falls in Arabian Sea coastal buffer zone (Lat 11.2588, Lon 75.7804). Reverse-geocode anomaly.',
      confidence: '94%',
      status: 'ACTION_REQUESTED',
      recommended_action: 'Request implementing agency engineer to re-submit GPS-calibrated site survey coordinates.',
    },
    {
      id: 'ALT-2026-009',
      category: 'Asset Verification Required',
      severity: 'HIGH',
      project_id: 'MPLADS-RS-118',
      project_name: 'Bhubaneswar Kalita — Assam (RS)',
      state: 'Assam',
      district: 'Kamrup Metropolitan',
      detection_date: '2026-02-14',
      trigger_summary: 'Durable capital asset marked as 100% completed without verified on-site photographic evidence.',
      evidence_summary: 'Asset Creation Flag: Yes; Verification Status: PENDING_FIELD_AUDIT; No geo-tagged tamper-proof image upload.',
      confidence: '87%',
      status: 'NEW',
      recommended_action: 'Dispatch District Planning Officer for mobile app geo-tag photographic inspection.',
    },
  ]);

  const handleStatusChange = (id: string, newStatus: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.project_name.toLowerCase().includes(q) ||
        a.project_id.toLowerCase().includes(q) ||
        a.trigger_summary.toLowerCase().includes(q) ||
        a.evidence_summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
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
            {alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED' && a.status !== 'DISMISSED_WITH_REASON').length}
          </p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Immediate intervention required</p>
        </div>

        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/80 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">High Hazards</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-2">
            {alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'RESOLVED' && a.status !== 'DISMISSED_WITH_REASON').length}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Cost/delay warning signals</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Active Alerts</span>
            <BellRing className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED' || a.status === 'UNDER_REVIEW' || a.status === 'ACTION_REQUESTED').length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Under surveillance or review</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Resolved / Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {alerts.filter((a) => a.status === 'RESOLVED' || a.status === 'DISMISSED_WITH_REASON').length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Audit trail recorded</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs space-y-3.5">
        {/* Category Tabs (9 Categories) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Filter by Early Warning Category (9 Categories):
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Showing {filteredAlerts.length} of {alerts.length} Alerts
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              'ALL',
              'Financial Variance',
              'Cost Anomaly',
              'Payment Anomaly',
              'Schedule Delay',
              'Physical vs Financial Consistency',
              'Duplicate / Overlap Risk',
              'Rule-Based Compliance Deviation',
              'Data Quality Deficit',
              'Asset Verification Required',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search, Severity, and Status Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative w-full lg:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts by project, trigger, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Severity:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'WATCH'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-slate-900 dark:bg-slate-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[11px] font-bold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="ACTION_REQUESTED">ACTION REQUESTED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="DISMISSED_WITH_REASON">DISMISSED</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#0b1222] rounded-xl border border-slate-200 dark:border-slate-800">
            No alerts match the active filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                alert.status === 'RESOLVED' || alert.status === 'DISMISSED_WITH_REASON'
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 opacity-75'
                  : alert.severity === 'CRITICAL'
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20'
                  : alert.severity === 'HIGH'
                  ? 'border-amber-300 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1222]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200/60 dark:border-sky-800/40">
                    {alert.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {alert.category}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
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

                {/* Status Selector with 6 Lifecycle States */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Lifecycle:</span>
                  <select
                    value={alert.status}
                    onChange={(e) => handleStatusChange(alert.id, e.target.value as AlertStatus)}
                    className="text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                  >
                    <option value="NEW">NEW</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ACTION_REQUESTED">ACTION REQUESTED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="DISMISSED_WITH_REASON">DISMISSED (WITH REASON)</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {alert.project_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {alert.project_id} • {alert.district}, {alert.state}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Trigger Summary
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {alert.trigger_summary}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                    Evidence Summary
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {alert.evidence_summary}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 text-xs">
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase block mb-0.5">
                  Recommended Vigilance Action
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {alert.recommended_action}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">
                  Non-Accusatory Protocol • Statistical Outlier Decision Support
                </span>
                <button
                  onClick={() => onSelectProject(alert.project_id)}
                  className="inline-flex items-center gap-1.5 font-bold text-sky-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  <span>Examine Project Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};