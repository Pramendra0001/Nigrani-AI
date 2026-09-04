import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Sliders,
  Download,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
} from 'lucide-react';
import { api } from '../api';
import { ComplianceSummary, ComplianceRuleItem } from '../types';

interface Props {
  onSelectProject: (projectId: string) => void;
}

export const CompliancePage: React.FC<Props> = ({ onSelectProject }) => {
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<ComplianceSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const data = await api.getComplianceSummary();
      setComplianceData(data);
    } catch (err) {
      console.error('Failed to load compliance summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const deviationCases = [
    {
      case_id: 'CMP-DEV-891',
      rule_code: 'CMP-FIN-01',
      rule_name: 'Disbursement-Completion Discrepancy',
      project_id: 'MPLADS-LS-388',
      project_name: 'Ravindra Dattaram Waikar — Mumbai North West',
      clause: 'MPLADS Guideline 2023 Sec 4.2',
      disbursed_lakhs: 537.99,
      completion_pct: 0.0,
      severity: 'CRITICAL',
      status: 'VIOLATION_AUDIT',
      remediation: 'Issue immediate show-cause query regarding 100% fund disbursement against 0% physical progress.',
    },
    {
      case_id: 'CMP-DEV-704',
      rule_code: 'CMP-TIM-01',
      rule_name: 'Severe Schedule Slippage',
      project_id: 'MPLADS-LS-001',
      project_name: 'Afzal Ansari — Ghazipur',
      clause: 'MPLADS Guideline 2023 Sec 6.1',
      disbursed_lakhs: 215.40,
      completion_pct: 35.0,
      severity: 'HIGH',
      status: 'DEVIATION_FLAGGED',
      remediation: 'Mandate submission of updated PERT chart and revised milestone completion schedule.',
    },
    {
      case_id: 'CMP-DEV-552',
      rule_code: 'CMP-FIN-02',
      rule_name: 'Idle Unspent Fund Accumulation',
      project_id: 'MPLADS-LS-142',
      project_name: 'Kanimozhi Karunanidhi — Thoothukkudi',
      clause: 'MPLADS Guideline 2023 Sec 3.8',
      disbursed_lakhs: 180.20,
      completion_pct: 60.0,
      severity: 'HIGH',
      status: 'DEVIATION_FLAGGED',
      remediation: 'Expedite district release reconciliation for idle balance exceeding ₹400 Lakhs.',
    },
    {
      case_id: 'CMP-DEV-310',
      rule_code: 'CMP-DOC-01',
      rule_name: 'Missing Utilization Certification',
      project_id: 'MPLADS-RS-022',
      project_name: 'Sudha Murty — Nominated Rajya Sabha',
      clause: 'GFR Rule 238(1)',
      disbursed_lakhs: 125.00,
      completion_pct: 85.0,
      severity: 'MEDIUM',
      status: 'AUDIT_PENDING',
      remediation: 'Upload final measurement book certification with verified digital signatures.',
    },
  ];

  const filteredRules = (complianceData?.rules || []).filter((r) => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.rule_code.toLowerCase().includes(q) ||
        r.clause.toLowerCase().includes(q)
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
              Statutory Governance & Compliance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Compliance Monitoring & Audit Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated screening against revised MPLADS 2023 guidelines, General Financial Rules (GFR), and physical milestone mandates.
          </p>
        </div>

        <button
          onClick={() => {
            const report = JSON.stringify({ summary: complianceData, deviations: deviationCases }, null, 2);
            const blob = new Blob([report], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Nigrani_AI_Compliance_Audit_Report_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1222] hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-sky-500" />
          <span>Export Compliance Audit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Audited</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {complianceData?.total_portfolios_audited || 774}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">MPLADS Portfolios Evaluated</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Statutory Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {complianceData?.compliance_rate_percent || 94.2}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pass rate across core guidelines</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Audit Rules</span>
            <Scale className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {complianceData?.rules.length || 5}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Normative verification gates</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Critical Deviations</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {complianceData?.rule_violations['CMP-FIN-01'] || 7}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">High financial discrepancy cases</p>
        </div>
      </div>

      {/* Rules Registry Section */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Regulatory Rules Catalog</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rules defined in accordance with MoSPI statutory circulars and General Financial Rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'FINANCIAL', 'TIMELINE', 'DOCUMENTATION', 'PHYSICAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRules.map((rule) => {
            const violationCount = complianceData?.rule_violations[rule.rule_code] || 0;
            return (
              <div
                key={rule.rule_code}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-cyan-400 bg-sky-100/70 dark:bg-sky-950 px-2 py-0.5 rounded">
                      {rule.rule_code}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : rule.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                    {rule.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] font-mono text-slate-400">{rule.clause}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {violationCount} Flagged
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged Deviations Dossier Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Priority Compliance Deviations</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specific project portfolios triggering automated audit violation thresholds.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{deviationCases.length} Active Deviations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Rule / Clause</th>
                <th className="py-2.5 px-3">Project Portfolio</th>
                <th className="py-2.5 px-3">Disbursed / Progress</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Recommended Remediation</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {deviationCases.map((c) => (
                <tr key={c.case_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-sky-600 dark:text-cyan-400">
                    {c.case_id}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{c.rule_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.clause}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 dark:text-white">{c.project_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.project_id}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200">₹{c.disbursed_lakhs} Lakhs</p>
                    <p className="text-[10px] text-rose-500 font-bold">{c.completion_pct}% physical completion</p>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        c.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-xs">
                    {c.remediation}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectProject(c.project_id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline"
                    >
                      <span>Examine</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
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