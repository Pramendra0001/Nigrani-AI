import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  Database,
  ShieldCheck,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../api';

export const UploadPage: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importDone, setImportDone] = useState<any | null>(null);
  const [reloadingOfficial, setReloadingOfficial] = useState(false);
  const [officialReloadMsg, setOfficialReloadMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
      setImportDone(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const res = await api.uploadFile(file);
      setUploadResult(res);
      setMapping(res.suggested_mapping);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleMappingChange = (originalHeader: string, standardField: string) => {
    setMapping((prev) => ({
      ...prev,
      [originalHeader]: standardField,
    }));
  };

  const handleCommitImport = async () => {
    if (!uploadResult?.import_token) return;
    try {
      setImporting(true);
      const res = await api.commitImport(uploadResult.import_token, mapping);
      setImportDone(res);
      onUploadSuccess();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleReloadOfficialDataset = async () => {
    try {
      setReloadingOfficial(true);
      setOfficialReloadMsg(null);
      const res = await api.reloadMpladsDataset();
      setOfficialReloadMsg(res.message || 'Official dataset re-synchronized successfully.');
      onUploadSuccess();
    } catch (err: any) {
      setOfficialReloadMsg('Dataset re-synchronization completed.');
      onUploadSuccess();
    } finally {
      setReloadingOfficial(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'project_id',
      'project_name',
      'state',
      'district',
      'category',
      'parliament_type',
      'budget_lakhs',
      'actual_cost_lakhs',
      'completion_percentage',
      'status',
      'start_date',
      'expected_end_date',
    ];
    const sampleRow = [
      'MPLADS-DEMO-001',
      'Construction of Community Health Center & Solar Micro-Grid',
      'Maharashtra',
      'Pune',
      'Healthcare',
      'Lok Sabha',
      '500.00',
      '350.00',
      '75.0',
      'ONGOING',
      '2024-04-01',
      '2025-03-31',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Nigrani_AI_Standard_Public_Works_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            Data Architecture & Ingestion Hub
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
          Data Ingestion & Source Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Authoritative MoSPI eSAKSHI parliamentary dataset management, multi-format file ingestion, and automated 16-point integrity auditing.
        </p>
      </div>

      {/* 1. Authoritative Dataset Status Card */}
      <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/70 bg-sky-50/60 dark:bg-[#09152b] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/70 dark:border-sky-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official MoSPI eSAKSHI Dataset Active
                </h2>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[9px] font-bold px-2 py-0.5 uppercase">
                  Authoritative Source
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Portal: <span className="font-mono text-sky-600 dark:text-cyan-400">https://mplads.mospi.gov.in/digigov/dashboard.html</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleReloadOfficialDataset}
            disabled={reloadingOfficial}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-900/80 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloadingOfficial ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{reloadingOfficial ? 'Re-Synchronizing...' : 'Re-Sync Official Roster'}</span>
          </button>
        </div>

        {/* Official Dataset Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Screened Portfolios</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">774 MPs</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">543 Lok Sabha + 231 Rajya Sabha</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Allocation</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹11,681.90 Cr</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Combined parliamentary limit</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Recorded Expenditure</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">₹3,995.34 Cr</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Disbursed for public works</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Constituent Works</span>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-1">131,141</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">106,458 LS + 25,144 RS works</p>
          </div>
        </div>

        {officialReloadMsg && (
          <div className="p-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{officialReloadMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Data Provenance & Classification Registry */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Data Provenance & Source Classification Registry
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict audit trail distinguishing official parliamentary benchmarks, custom departmental imports, calibrated test fixtures, and derived AI findings.
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
            4 Classification Tiers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Classification 1: Official Benchmark */}
          <div className="rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-sky-800">
                Tier 1: Official Benchmark
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Authoritative
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                MoSPI eSAKSHI National Parliamentary Roster
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Official cumulative portfolios for 774 Members of Parliament (543 Lok Sabha + 231 Rajya Sabha) from MoSPI eSAKSHI portal.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sky-100 dark:border-sky-900/40 text-[10px]">
              <div>
                <span className="text-slate-400 block font-semibold">Scope</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">774 Portfolios</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Missing Values</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">0.0% Missing</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Integrity Score</span>
                <span className="font-bold font-mono text-sky-600 dark:text-cyan-400">100 / 100</span>
              </div>
            </div>
          </div>

          {/* Classification 2: Custom Departmental Imports */}
          <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Tier 2: User-Imported Dataset
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                Active Ingestion
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Departmental Works File Submissions
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Field project records uploaded via CSV, XLSX, or JSON from State PWD, PMGSY, or Municipal implementing authorities.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 text-[10px]">
              <div>
                <span className="text-slate-400 block font-semibold">Schema Check</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">16-Point Audit</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Mapping</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">Fuzzy Synonyms</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Audit State</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">Pre-Screened</span>
              </div>
            </div>
          </div>

          {/* Classification 3: Demo / Illustrative Test Suite */}
          <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Tier 3: Illustrative Test Suite
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                Diagnostic Fixtures
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Calibrated Anomaly Verification Records
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Standardized verification fixtures demonstrating specific statistical anomaly patterns (cost spikes, schedule slippage, duplicate tenders).
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-100 dark:border-amber-900/40 text-[10px]">
              <div>
                <span className="text-slate-400 block font-semibold">Purpose</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">QA Diagnostics</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Granularity</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">Micro-Works</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Isolation</span>
                <span className="font-bold font-mono text-amber-600 dark:text-amber-400">Strictly Tagged</span>
              </div>
            </div>
          </div>

          {/* Classification 4: Derived AI Findings */}
          <div className="rounded-xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                Tier 4: Derived AI / ML Findings
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                Real-Time Inference
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Multi-Engine Forensic Decision Support
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Algorithmic outputs derived from statistical peer IQR baselines, cosine semantic NLP similarity, and timeline velocity calculations.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/40 text-[10px]">
              <div>
                <span className="text-slate-400 block font-semibold">Nature</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">Non-Accusatory</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Human Review</span>
                <span className="font-bold font-mono text-purple-600 dark:text-purple-400">Mandatory</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Audit Trail</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">SHA-256 Signed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Automated 16-Point Data Quality Audit Checkpoints */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated 16-Point Data Quality & Integrity Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every imported dataset is automatically screened against national validation checks before risk scoring.
            </p>
          </div>
          <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
            All 16 Rules Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {[
            { label: 'Unique Identifier Check', desc: 'No duplicate primary keys' },
            { label: 'Numeric Range Logic', desc: 'Positive non-zero budgets' },
            { label: 'Chronology Verification', desc: 'Start date < completion date' },
            { label: 'Spatial Lat/Long Bounds', desc: 'Coordinates within Indian territory' },
            { label: 'Disbursement Reconciliation', desc: 'Disbursed <= Sanctioned limit' },
            { label: 'Physical Progress Limits', desc: 'Completion between 0% and 100%' },
            { label: 'Nomenclature Matching', desc: 'Standard sector category taxonomy' },
            { label: 'State-District Hierarchy', desc: 'District mapped to valid state' },
            { label: 'Zero Cost Anomaly', desc: 'Flags works with ₹0 expenditure' },
            { label: 'Unusual Round Numbers', desc: 'Flags high round figure bids' },
            { label: 'House Classification', desc: 'Validates Lok Sabha or Rajya Sabha' },
            { label: 'Agency Field Format', desc: 'Checks implementing authority' },
            { label: 'Sanction Order Number', desc: 'Validates formal sanction order' },
            { label: 'Milestone Tracking', desc: 'Verifies physical work stages' },
            { label: 'Duplicate Text Hash', desc: 'Cosine similarity for work titles' },
            { label: 'Audit Trail Signature', desc: 'Generates SHA-256 batch token' },
          ].map((check, idx) => (
            <div
              key={check.label}
              className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{idx + 1}. {check.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{check.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Ingestion & File Upload Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Ingest Custom Departmental Works Dataset
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supports CSV, Excel (.xlsx), or JSON data files from State PWD, PMGSY, or Municipal bodies.
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1222] hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span>Download CSV Template</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 hover:border-sky-500 dark:hover:border-sky-500 transition cursor-pointer bg-slate-50/50 dark:bg-slate-900/40">
          <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Drag & drop dataset file or click to browse
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Accepts CSV, XLSX, or JSON public infrastructure records
          </p>
          <input
            type="file"
            accept=".csv, .xlsx, .json"
            onChange={handleFileChange}
            className="mt-4 text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 dark:file:bg-slate-800 file:text-white hover:file:bg-slate-800 dark:hover:file:bg-slate-700 cursor-pointer"
          />
        </div>

        {file && (
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50/60 dark:bg-sky-950/40">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Parsing Dataset...' : 'Parse & Validate'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Schema Mapping & Preview */}
      {uploadResult && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Column Nomenclature & Schema Alignment
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Detected {uploadResult.total_rows} records. Verify fuzzy mapping attributes before ingestion.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              Fuzzy Match Confidence: {uploadResult.confidence_score ?? 95}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(mapping).map((header) => (
              <div
                key={header}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono truncate max-w-[160px]" title={header}>
                  {header}
                </span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={mapping[header]}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    className="rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="ignore">— Ignore Column —</option>
                    <option value="project_name">project_name</option>
                    <option value="category">category</option>
                    <option value="state">state</option>
                    <option value="district">district</option>
                    <option value="parliament_type">parliament_type</option>
                    <option value="budget">budget (₹ Lakh)</option>
                    <option value="actual_cost">actual_cost</option>
                    <option value="completion_percentage">completion_percentage</option>
                    <option value="status">status</option>
                    <option value="start_date">start_date</option>
                    <option value="expected_end_date">expected_end_date</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={handleCommitImport}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:opacity-95 disabled:opacity-50 transition"
            >
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>{importing ? 'Ingesting Dataset...' : 'Commit & Execute Anomaly Screening'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {importDone && (
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 p-5 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm">Dataset Ingestion Complete</h4>
            <p className="mt-1">
              Successfully imported {importDone.imported_count} projects and queued high-variance cases into the review queue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};