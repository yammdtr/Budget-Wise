import React from 'react';
import { Wallet, RefreshCw, HardDrive, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  currency: string;
  onCurrencyChange: (c: string) => void;
  onOpenDriveModal: () => void;
  onResetData: () => void;
  transactionCount: number;
  unsyncedCount: number;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulateOffline: () => void;
  onManualSync: () => void;
}

const CURRENCIES = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '¥', label: 'JPY (¥)' },
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: '₱', label: 'PHP (₱)' },
  { symbol: 'C$', label: 'CAD ($)' },
  { symbol: 'A$', label: 'AUD ($)' },
];

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  onOpenDriveModal,
  onResetData,
  transactionCount,
  unsyncedCount,
  isOnline,
  isSimulatedOffline,
  onToggleSimulateOffline,
  onManualSync,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/85 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/10 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">PocketLedger</h1>
              
              {/* Online / Offline Sync Badge */}
              <button
                type="button"
                onClick={onToggleSimulateOffline}
                title={isOnline ? 'Online (Click to simulate offline)' : 'Offline (Click to reconnect)'}
                className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 transition cursor-pointer ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span>Online &bull; Auto-Sync</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span>Offline {unsyncedCount > 0 ? `(${unsyncedCount} Queued)` : 'Ready'}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Local-First &bull; Auto-syncs to <code className="font-mono text-stone-700 bg-stone-100 px-1 py-0.2 rounded">/PocketLedger/budget_data.csv</code>
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Unsynced queue chip / manual sync button */}
          {unsyncedCount > 0 && isOnline && (
            <button
              onClick={onManualSync}
              className="text-xs font-bold px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg border border-amber-300 flex items-center gap-1 transition"
              title="Click to sync queued items now"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync {unsyncedCount} Queued</span>
            </button>
          )}

          {/* Currency selector */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-xs">
            <label htmlFor="currency-select" className="sr-only">Currency</label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent text-stone-800 font-medium px-2 py-1 rounded focus:outline-none cursor-pointer"
              title="Select Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Google Drive / CSV Sync Modal button */}
          <button
            onClick={onOpenDriveModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm active:scale-95"
            aria-label="Manage Drive Sync and CSV export"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drive / CSV</span>
          </button>

          {/* Reset demo data */}
          <button
            onClick={onResetData}
            title="Reset to sample transactions"
            aria-label="Reset to default sample transactions"
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
