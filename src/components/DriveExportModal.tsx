import React, { useState } from 'react';
import {
  Check,
  Clipboard,
  Download,
  FileSpreadsheet,
  FolderOpen,
  HardDrive,
  RefreshCw,
  Upload,
  X,
  ExternalLink,
} from 'lucide-react';
import { Transaction } from '../types/ledger';
import { generateCSV, parseCSV } from '../utils/ledger';

interface DriveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onImportTransactions: (imported: Transaction[]) => void;
  onSyncAllQueued: () => void;
}

export const DriveExportModal: React.FC<DriveExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onImportTransactions,
  onSyncAllQueued,
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'guide'>('export');

  if (!isOpen) return null;

  const csvContent = generateCSV(transactions);

  const handleDownloadCSV = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'budget_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onSyncAllQueued();
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pocketledger_backup.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(csvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { transactions: parsed, errors } = parseCSV(text);
      if (errors.length > 0 && parsed.length === 0) {
        setImportStatus(`Import failed: ${errors[0]}`);
      } else {
        onImportTransactions(parsed);
        setImportStatus(
          `Successfully loaded ${parsed.length} entries${
            errors.length > 0 ? ` (${errors.length} skipped)` : ''
          }!`
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-modal-title"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 id="drive-modal-title" className="text-base font-bold text-stone-900">
                Google Drive & CSV Ledger Sync
              </h2>
              <p className="text-xs text-stone-500">
                Direct file storage at <code className="font-mono text-stone-700 bg-stone-100 px-1 py-0.5 rounded">/PocketLedger/budget_data.csv</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-100 mt-3 shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Export & Download
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Import CSV
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Google Drive & Sheets Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-950 mb-0.5">
                    Standardized Google Drive Schema
                  </div>
                  <div className="text-emerald-800 leading-relaxed text-[11px]">
                    Every entry is formatted as a standardized CSV row with columns:
                    <br />
                    <code className="font-mono bg-emerald-100/70 text-emerald-900 px-1 py-0.5 rounded text-[10px]">
                      Date,Time,Type,Amount,Category,Memo,Sync Status
                    </code>
                  </div>
                </div>
              </div>

              {/* CSV Preview snippet */}
              <div>
                <div className="flex items-center justify-between text-stone-500 mb-1.5">
                  <span className="font-semibold text-[11px] uppercase tracking-wider">
                    CSV Preview ({transactions.length} entries)
                  </span>
                  <button
                    onClick={handleCopyClipboard}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Raw CSV'}
                  </button>
                </div>
                <pre className="p-3 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40 leading-relaxed selection:bg-emerald-900 selection:text-white">
                  {csvContent}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={handleDownloadCSV}
                  className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download budget_data.csv</span>
                </button>

                <button
                  onClick={handleDownloadJSON}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold flex items-center justify-center gap-2 transition active:scale-95 border border-stone-200"
                >
                  <Download className="w-4 h-4 text-stone-500" />
                  <span>Download JSON Backup</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-stone-50/50">
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <div className="font-bold text-stone-800 mb-1">
                  Upload existing budget_data.csv
                </div>
                <p className="text-stone-500 text-[11px] mb-3">
                  Upload your budget file from Google Drive, Sheets, or desktop to restore or append entries.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-stone-800 transition">
                  <span>Select CSV File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div className="p-3 bg-stone-100 text-stone-800 rounded-xl font-medium border border-stone-200">
                  {importStatus}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 leading-relaxed text-stone-700">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  1. Local Folder in Google Drive
                </div>
                <p className="text-stone-600 text-[11px]">
                  Inside your personal Google Drive, create a folder named <strong className="font-mono text-stone-900">PocketLedger</strong>. Save your downloaded <code className="font-mono text-stone-900">budget_data.csv</code> here.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  2. Open Directly in Google Sheets
                </div>
                <p className="text-stone-600 text-[11px]">
                  In Google Drive, double-click the file and select <strong>Open with &gt; Google Sheets</strong>. Because it is standard CSV, Google Sheets immediately presents neat columns for formulas, filters, and pivot charts.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  3. Offline Caching & Revisions
                </div>
                <p className="text-stone-600 text-[11px]">
                  PocketLedger caches your entries offline in browser local storage. When you reconnect or download the file, your transactions stay updated with zero database lock-in.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-400">
            {transactions.length} total transactions in memory
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
