import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { api } from '../api';

export const UploadPage: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importDone, setImportDone] = useState<any | null>(null);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Dataset Ingestion & Flexible Schema Mapping
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload any department or district public works dataset in CSV format. The intelligent fuzzy mapper automatically matches column nomenclature.
        </p>
      </div>

      {/* Step 1: Upload Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          1. Select Public Works CSV Dataset
        </h2>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 hover:border-sky-500 dark:hover:border-sky-500 transition cursor-pointer bg-slate-50/50 dark:bg-slate-900/40">
          <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & drop CSV file or click to browse</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Supports PMGSY, State PWD, Jal Jeevan, or Municipal project lists</p>
          <input
            type="file"
            accept=".csv"
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
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Analyzing CSV...' : 'Parse & Validate'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Schema Mapping & Preview */}
      {uploadResult && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1222] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Automated Column Matching & Schema Alignment
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Detected {uploadResult.total_rows} records. Confirm the mapped standard attributes below.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              Fuzzy Match Confidence: {uploadResult.confidence_score ?? 95}%
            </span>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(mapping).map((header) => (
              <div key={header} className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono truncate max-w-[160px]" title={header}>
                  {header}
                </span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={mapping[header]}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    className="rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="ignore">— Ignore Column —</option>
                    <option value="project_name">project_name</option>
                    <option value="category">category</option>
                    <option value="state">state</option>
                    <option value="district">district</option>
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
