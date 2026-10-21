import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, CloudUpload, FileSpreadsheet, Sparkles } from 'lucide-react';
import { getCurrentDateString, getCurrentTimeString } from '../utils/ledger';

interface MemoAndSyncProps {
  memo: string;
  onMemoChange: (memo: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  time: string;
  onTimeChange: (time: string) => void;
  onSaveAndSync: () => void;
  canSave: boolean;
  selectedCategory: string;
  amountStr: string;
  currency: string;
  isSaving?: boolean;
}

const COMMON_TAGS = ['Lunch', 'Coffee', 'Supermarket', 'Electric Bill', 'Subway / Gas', 'Online Order', 'Client Payout'];

export const MemoAndSync: React.FC<MemoAndSyncProps> = ({
  memo,
  onMemoChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  onSaveAndSync,
  canSave,
  selectedCategory,
  amountStr,
  currency,
  isSaving,
}) => {
  const [showDateTime, setShowDateTime] = useState(false);
  const [recentSavedToast, setRecentSavedToast] = useState(false);

  const handleSave = () => {
    if (!canSave || isSaving) return;
    onSaveAndSync();
    setRecentSavedToast(true);
    setTimeout(() => {
      setRecentSavedToast(false);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            3
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Memo & Direct Sync
          </span>
        </div>

        {/* Date/Time Toggle */}
        <button
          type="button"
          onClick={() => setShowDateTime(!showDateTime)}
          className="text-xs font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>{date || 'Today'}</span>
          <span className="text-stone-300">&bull;</span>
          <span>{time || 'Now'}</span>
        </button>
      </div>

      {/* Date & Time fields if expanded */}
      {showDateTime && (
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 gap-2 animate-in fade-in">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Time (HH:MM)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Memo text input */}
      <div>
        <label htmlFor="memo-input" className="block text-xs font-semibold text-stone-700 mb-1.5">
          Optional Memo / Note
        </label>
        <input
          id="memo-input"
          type="text"
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSave) {
              handleSave();
            }
          }}
          placeholder="e.g., Lunch at cafe, Electricity bill, Grocery restock..."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />

        {/* Quick Tag suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] text-stone-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick:
          </span>
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onMemoChange(tag)}
              className="px-2 py-0.5 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-md transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Save & Sync Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave || isSaving}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
          canSave && !isSaving
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer'
            : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
        }`}
        aria-label="Save and sync transaction"
      >
        <CloudUpload className="w-4 h-4" />
        <span>
          Save & Sync {amountStr ? `${currency}${amountStr}` : 'Entry'}
        </span>
      </button>

      {/* Sync destination note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
        <span>Appends directly to <strong className="font-mono text-stone-700">/PocketLedger/budget_data.csv</strong></span>
      </div>

      {/* Toast Notification when saved */}
      {recentSavedToast && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Saved to budget ledger! Stored in offline cache & Sheets ready.</span>
        </div>
      )}
    </div>
  );
};
