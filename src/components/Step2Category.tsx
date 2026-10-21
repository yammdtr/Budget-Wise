import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  CloudUpload,
  FileSpreadsheet,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types/ledger';
import { extractMemoSuggestions } from '../utils/ledger';

interface Step2CategoryProps {
  amountStr: string;
  currency: string;
  type: TransactionType;
  categories: Category[];
  selectedCategoryName: string;
  onSelectCategory: (name: string) => void;
  memo: string;
  onMemoChange: (memo: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  time: string;
  onTimeChange: (time: string) => void;
  onBack: () => void;
  onSaveAndSync: () => void;
  onAddCustomCategory: (newCat: Category) => void;
  transactions?: Transaction[];
}

const COMMON_TAGS = ['Lunch', 'Coffee', 'Supermarket', 'Electric Bill', 'Subway / Gas', 'Online Order', 'Client Payout'];
const EMOJI_OPTIONS = ['🍔', '💡', '🚗', '🛒', '🎮', '💼', '💰', '🛍️', '🏃', '✈️', '☕', '🏠', '🎁', '📚', '🎬', '💊', '🐾', '💈'];
const COLOR_OPTIONS = ['#f97316', '#eab308', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#ef4444', '#64748b', '#14b8a6'];

export const Step2Category: React.FC<Step2CategoryProps> = ({
  amountStr,
  currency,
  type,
  categories,
  selectedCategoryName,
  onSelectCategory,
  memo,
  onMemoChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  onBack,
  onSaveAndSync,
  onAddCustomCategory,
  transactions = [],
}) => {
  const [showDateTime, setShowDateTime] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🛍️');
  const [newCatColor, setNewCatColor] = useState('#ec4899');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract memo suggestions prioritizing keywords from previous memos first!
  const memoSuggestions = React.useMemo(() => {
    return extractMemoSuggestions(transactions, 8);
  }, [transactions]);

  const amountNumber = parseFloat(amountStr) || 0;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a category name');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Category already exists');
      return;
    }
    const newCat: Category = {
      id: `cat_custom_${Date.now()}`,
      name: trimmed,
      icon: newCatEmoji,
      color: newCatColor,
      isCustom: true,
    };
    onAddCustomCategory(newCat);
    onSelectCategory(newCat.name);
    setNewCatName('');
    setErrorMsg('');
    setIsCustomModalOpen(false);
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-4">
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Step Indicator & Selected Amount Badge */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Amount</span>
          </button>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Logging Entry
            </span>
            <span
              className={`text-lg font-mono font-extrabold ${
                type === 'Expense' ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {type === 'Expense' ? '-' : '+'}
              {currency}
              {amountNumber.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Question Heading */}
        <div>
          <h2 className="text-lg font-extrabold text-stone-900">
            {type === 'Expense' ? 'Where was the money spent?' : 'Where did this income come from?'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Select a category catalog below to organize this transaction.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategoryName === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-left border transition-all active:scale-95 ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/10'
                    : 'border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
                aria-pressed={isSelected}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${cat.color}18`,
                    color: cat.color,
                  }}
                >
                  {cat.icon}
                </div>
                <span className="text-xs font-bold truncate leading-tight flex-1">
                  {cat.name}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}

          {/* Add Custom Category Button */}
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-2 p-2.5 rounded-2xl border border-dashed border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-100/70 text-stone-600 transition active:scale-95 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-stone-500 shrink-0 border border-stone-200">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-600 truncate">
              + Custom
            </span>
          </button>
        </div>

        {/* Bigger, Spacious Memo & Notes Section */}
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="step2-memo" className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <span>Memo / Description</span>
              <span className="text-[11px] font-normal text-stone-400">(optional)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowDateTime(!showDateTime)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 bg-stone-50 hover:bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{date || 'Today'}</span>
            </button>
          </div>

          <textarea
            id="step2-memo"
            rows={3}
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
            placeholder={`Add details (e.g., "Lunch with client at cafe", "Electricity bill", "Monthly groceries")...`}
            className="w-full p-3.5 text-sm sm:text-base font-medium text-stone-900 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none placeholder:text-stone-400 shadow-2xs leading-relaxed"
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Suggestions (from previous memos):
            </span>
            {memoSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onMemoChange(tag)}
                className="px-2.5 py-1 text-xs font-medium bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 rounded-lg transition active:scale-95 border border-stone-200/60"
              >
                {tag}
              </button>
            ))}
          </div>

          {showDateTime && (
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-stone-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-stone-200 rounded-lg font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Primary Save & Sync Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSaveAndSync}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer"
            aria-label="Save and sync entry"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Save & View Overview →</span>
          </button>
          <div className="text-center text-[11px] text-stone-400 mt-2 flex items-center justify-center gap-1">
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            <span>Syncs to <code className="font-mono text-stone-600">/PocketLedger/budget_data.csv</code></span>
          </div>
        </div>
      </div>

      {/* Custom Category Modal */}
      {isCustomModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-cat-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 id="custom-cat-title" className="text-sm font-bold text-stone-900">
                New Category
              </h2>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustom} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. Subscriptions, Gifts"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  autoFocus
                />
                {errorMsg && <p className="text-[11px] text-rose-500 mt-1">{errorMsg}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Emoji Icon</label>
                <div className="flex flex-wrap gap-1.5 p-1 border border-stone-100 rounded-xl max-h-24 overflow-y-auto">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewCatEmoji(em)}
                      className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center ${
                        newCatEmoji === em ? 'bg-emerald-100 ring-2 ring-emerald-600' : 'hover:bg-stone-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
