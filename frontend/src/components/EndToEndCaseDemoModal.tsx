import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  FileCheck2,
  TrendingUp,
  Copy,
  Clock,
  Scale,
  Receipt,
  AlertOctagon,
  ClipboardList,
  History,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
}

interface StepInfo {
  step: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  description: string;
  inputData: string;
  engineOutput: string;
  highlight: string;
}

export const EndToEndCaseDemoModal: React.FC<Props> = ({ isOpen, onClose, onSelectProject }) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps: StepInfo[] = [
    {
      step: 1,
      title: 'Data Ingestion & Normalization',
      subtitle: 'Authoritative eSAKSHI & Departmental Works Ingestion',
      badge: 'Data Architecture',
      icon: FileCheck2,
      description: 'Public infrastructure portfolios are ingested from the official MoSPI eSAKSHI parliamentary database or departmental CSV/XLSX/JSON files. Nomenclature is fuzzy-mapped to standard schema.',
      inputData: 'Source: MoSPI eSAKSHI Official Portal • 774 MP Portfolios (543 Lok Sabha + 231 Rajya Sabha)',
      engineOutput: 'Normalized 12 administrative columns: budget, expenditure, start date, target completion date, location centroid.',
      highlight: 'Zero mock data mixed with official records; metadata source declared.',
    },
    {
      step: 2,
      title: 'Automated 16-Point Integrity Audit',
      subtitle: 'Schema, Logic, and Boundary Screening',
      badge: 'Integrity Check',
      icon: CheckCircle2,
      description: 'Every record is audited against 16 automated validation rules including numeric bounds, non-negative funds, logical start/end dates, Indian territorial coordinates, and duplicate primary keys.',
      inputData: 'Project MPLADS-LS-388: Sanctioned ₹1,470.00L • Cumulative Exp ₹537.99L • Reported Progress 0.0%',
      engineOutput: '16/16 Schema checks executed • 0 duplicate IDs • Valid geo-coordinates (19.12, 72.85)',
      highlight: 'Completeness Score: 100% • No schema anomalies detected.',
    },
    {
      step: 3,
      title: 'Statistical Peer Cost Anomaly Engine',
      subtitle: 'IQR & Category Regional Median Modeling',
      badge: 'Cost Intelligence',
      icon: TrendingUp,
      description: 'The project is grouped with comparable regional civil infrastructure works. Robust Interquartile Range (IQR) and median baselines detect significant cost per work deviations.',
      inputData: 'Portfolio budget ₹1,470.00L across 67 sanctioned works (₹21.94L avg/work)',
      engineOutput: 'Category Regional Median: ₹15.35L/work • Cost Deviation: +42.9% above benchmark • Risk Score: 78.5/100',
      highlight: 'Non-parametric median avoids distortion from extreme regional outliers.',
    },
    {
      step: 4,
      title: 'Duplicate & Overlap Intelligence',
      subtitle: 'Multi-Factor Correlation Cross-Matching',
      badge: 'Overlap Detection',
      icon: Copy,
      description: 'NLP TF-IDF / Cosine semantic similarity combines with Haversine geographic distance, schedule concurrency, and budget ratios to surface potential duplicate tenders.',
      inputData: 'Querying across 774 administrative portfolios within Maharashtra zone',
      engineOutput: 'Top Match: MPLADS-LS-389 (Mumbai North East) • Combined Overlap Score: 48.2% • Distance: 8.4 km',
      highlight: 'Side-by-side forensic screen compares titles, coordinates, and concurrent execution windows.',
    },
    {
      step: 5,
      title: 'Schedule & Milestone Tracking',
      subtitle: 'Contractual Timeline Velocity Monitoring',
      badge: 'Timeline Tracking',
      icon: Clock,
      description: 'Evaluates contractual duration elapsed against reported completion percentage. Flags stagnant progress and velocity slippage.',
      inputData: 'Start: 2024-06-04 • Expected End: 2029-06-03 • 25.0% duration elapsed • Reported Completion: 0.0%',
      engineOutput: 'Schedule Deviation: -25.0% behind expected milestone velocity • Risk Score: 68.0/100',
      highlight: 'Velocity classification: SEVERE_EXECUTION_STAGNATION.',
    },
    {
      step: 6,
      title: 'Physical vs Financial Consistency',
      subtitle: 'Execution Divergence Detection',
      badge: 'Consistency Engine',
      icon: Scale,
      description: 'Compares physical progress percentage against financial utilization percentage to identify patterns where disbursements significantly outpace ground execution.',
      inputData: 'Financial Utilization: 100% of released allocation (₹537.99L spent) vs Physical Completion: 0.0%',
      engineOutput: 'Consistency Score: 18.2 / 100 • Classification: HIGH_EXPENDITURE_LOW_PHYSICAL_PROGRESS',
      highlight: 'Flagged: 100% fund drawdown occurred with zero physical asset completion reported.',
    },
    {
      step: 7,
      title: 'Deterministic Unified Risk Scoring',
      subtitle: 'Multi-Engine Weighted Synthesis',
      badge: 'Risk Engine',
      icon: AlertOctagon,
      description: 'Synthesizes cost deviation (35%), duplicate risk (30%), schedule delay (25%), and data quality deficit (10%) into an objective, explainable risk score (0-100).',
      inputData: 'Cost Risk (78.5) + Overlap Risk (46.6) + Delay Risk (68.0) + Consistency Gap (81.8)',
      engineOutput: 'Overall Risk Score: 78.4 / 100 • Risk Classification: CRITICAL',
      highlight: 'Every score point is mathematically traceable to specific verified data anomalies.',
    },
    {
      step: 8,
      title: 'Early Warning Alert Generation',
      subtitle: 'Automated Vigilance Notification',
      badge: 'Alert Center',
      icon: ShieldAlert,
      description: 'An Early Warning Alert is automatically generated and dispatched to the centralized Alert Center with high-priority triage status.',
      inputData: 'Trigger: High Expenditure + Zero Progress + Cost Deviation',
      engineOutput: 'Alert ID: ALT-2026-001 • Severity: CRITICAL • Status: NEW • Recommended Action Assigned',
      highlight: 'Appears instantly in Executive Dashboard, Alert Center, and District Authority radar.',
    },
    {
      step: 9,
      title: 'Forensic Evidence Assembly',
      subtitle: 'Cryptographic Diagnostic Dossier',
      badge: 'Evidence Hub',
      icon: Sparkles,
      description: 'The system compiles raw telemetry, milestone records, geolocation coordinates, and statistical peer baselines into a tamper-evident audit package.',
      inputData: 'Case Evidence Package: 67 works inventory, release vouchers, and regional IQR distributions',
      engineOutput: 'SHA-256 Signature: 8f4b1e7c9... • Verification Source: MoSPI Official Performance Bulletin',
      highlight: 'Fully reproducible machine-readable diagnostic schema.',
    },
    {
      step: 10,
      title: 'Priority Review Queue Triage',
      subtitle: 'Role-Based Case Routing',
      badge: 'Review Queue',
      icon: ClipboardList,
      description: 'The dossier enters the Priority Review Queue with clear \"Why Prioritized\" tags, categorized for Senior Vigilance Officers and District Collectors.',
      inputData: 'Review Case ID: RC-774-388 • Priority: CRITICAL • Queue Position: #1 Highest Risk Case',
      engineOutput: 'Why Prioritized: \"100% fund disbursement with 0% reported physical completion across 67 works\"',
      highlight: 'Direct action buttons: \"Open Dossier\", \"Assign Field Inspection\", \"Issue Show-Cause Query\".',
    },
    {
      step: 11,
      title: 'Human Reviewer Notes & Findings',
      subtitle: 'Desk Review Clearance Observations',
      badge: 'Human Decision',
      icon: ClipboardList,
      description: 'A human vigilance officer logs official desk audit notes, records field team findings, and documents formal explanations from the executing agency.',
      inputData: 'Auditor: Senior Vigilance Auditor • Action: Desk Review Verified',
      engineOutput: 'Audit Note: \"Verified bank scroll against eSAKSHI release order. District Collector requested to submit MB copies.\"',
      highlight: 'Non-accusatory protocol: AI supports human verification; humans make final decisions.',
    },
    {
      step: 12,
      title: 'Administrative Action & Status Update',
      subtitle: 'Operational Case Disposition',
      badge: 'Clearance Flow',
      icon: CheckCircle2,
      description: 'The case status is transitioned to \"UNDER_REVIEW\" or \"ACTION_REQUESTED\" with an official directive issued to the implementing agency.',
      inputData: 'Action: Directive issued for physical geo-inspection and contractor bill reconciliation',
      engineOutput: 'Status: ACTION_REQUESTED • Assigned Officer: District Collector (Mumbai Suburban)',
      highlight: 'Formal compliance tracking under statutory MPLADS 2023 Guidelines.',
    },
    {
      step: 13,
      title: 'Audit Trail Retention & Compliance Archive',
      subtitle: 'End-to-End Governance Record',
      badge: 'Audit Trail',
      icon: History,
      description: 'All steps, algorithmic scores, alerts, human reviewer notes, and status changes are permanently logged with timestamps and actor credentials for parliamentary review.',
      inputData: 'Complete Lifecycle Audit Trail: Steps 1 through 12',
      engineOutput: 'Audit Ledger Entry Created • Status: ARCHIVED_IN_PROGRESS • Tamper-Evident Record',
      highlight: '100% transparent, auditable, and defendable public sector intelligence lifecycle.',
    },
  ];

  const current = steps[currentStep - 1];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center border border-sky-200 dark:border-sky-800/60">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  End-to-End Anomaly Intelligence Demonstration
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-sky-800">
                  13-Step Lifecycle
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete workflow from official dataset ingestion to multi-engine anomaly detection, human review, and compliance audit trail.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 13-Step Horizontal Stepper Bar */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5">
          {steps.map((s) => {
            const isDone = s.step < currentStep;
            const isCur = s.step === currentStep;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  isCur
                    ? 'bg-sky-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{s.step}</span>
                <span className="hidden sm:inline text-[11px]">{s.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Step Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
                  Step {current.step} of 13 • {current.badge}
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {current.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {current.subtitle}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
              {Math.round((currentStep / 13) * 100)}% Complete
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            {current.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Observed Source Input</span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {current.inputData}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-2">
              <span className="text-[10px] text-sky-600 dark:text-cyan-400 uppercase font-bold block">Intelligence Engine Output</span>
              <p className="font-mono font-bold text-sky-950 dark:text-sky-200 leading-relaxed">
                {current.engineOutput}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">
              <strong>Key System Assurance:</strong> {current.highlight}
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
            <button
              onClick={() => setCurrentStep((p) => Math.min(13, p + 1))}
              disabled={currentStep === 13}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onSelectProject('MPLADS-LS-388');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-400 hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <span>Launch Live Case Dossier (LS-388)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
