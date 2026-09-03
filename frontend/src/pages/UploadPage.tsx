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
        <h1 className="text-xl font-black tracking-tight text-slate-900">Dataset Ingestion & Flexible Schema Mapping</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload any department or district public works dataset in CSV format. The intelligent fuzzy mapper automatically matches column nomenclature.
        </p>
      </div>

      {/* Step 1: Upload Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800">1. Select Public Works CSV Dataset</h2>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-500 transition cursor-pointer bg-slate-50/50">
          <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">Drag & drop CSV file or click to browse</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Supports PMGSY, State PWD, Jal Jeevan, or Municipal project lists</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-4 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gov-700 file:text-white hover:file:bg-gov-800 cursor-pointer"
          />
        </div>

        {file && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono font-medium text-slate-700">
              Selected: <span className="font-bold">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-gov-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-gov-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Detecting Schema...' : 'Detect Columns & Validate'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Column Mapping & Preview */}
      {uploadResult && !importDone && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">2. Verify Column Schema Mapping</h2>
              <p className="text-xs text-slate-500">
                Found {uploadResult.headers.length} columns in file. Review the auto-suggested standard field assignments below.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-100">
              {uploadResult.preview.total_records} Total Rows
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {uploadResult.headers.map((h: string) => (
              <div key={h} className="flex items-center justify-between gap-3 text-xs bg-white p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={h}>{h}</span>
                <span className="text-slate-400">→</span>
                <select
                  value={mapping[h] || ''}
                  onChange={(e) => handleMappingChange(h, e.target.value)}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 max-w-[160px]"
                >
                  <option value="">-- Ignore Column --</option>
                  {uploadResult.standard_fields.map((f: string) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Validation summary */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  {uploadResult.preview.valid_records} valid records ready for ingestion
                </p>
                <p className="text-[11px] text-emerald-800">
                  Automated statistical anomaly detection will automatically process all newly imported rows.
                </p>
              </div>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
            >
              <span>{importing ? 'Importing Dataset...' : 'Commit Import & Analyze'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success Feedback */}
      {importDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-emerald-950">Import Successfully Completed!</h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            Imported {importDone.imported_count} projects into the active registry. Statistical baseline and anomaly review queues have been updated.
          </p>
        </div>
      )}
    </div>
  );
};
