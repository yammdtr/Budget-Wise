import React from 'react';
import { Delete, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { TransactionType } from '../types/ledger';

interface KeypadEntryProps {
  amountStr: string;
  onAmountChange: (val: string) => void;
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  currency: string;
}

export const KeypadEntry: React.FC<KeypadEntryProps> = ({
  amountStr,
  onAmountChange,
  type,
  onTypeChange,
  currency,
}) => {
  const handleDigit = (digit: string) => {
    // If it's a decimal point
    if (digit === '.') {
      if (amountStr.includes('.')) return;
      onAmountChange(amountStr === '' ? '0.' : `${amountStr}.`);
      return;
    }

    // Limit to 2 decimal places
    if (amountStr.includes('.')) {
      const parts = amountStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }

    // Prevent excessive leading zeros
    if (amountStr === '0' && digit === '0') return;
    if (amountStr === '0' && digit !== '.') {
      onAmountChange(digit);
      return;
    }

    // Prevent ridiculously large inputs
    if (amountStr.replace('.', '').length >= 9) return;

    onAmountChange(`${amountStr}${digit}`);
  };

  const handleBackspace = () => {
    if (amountStr.length <= 1) {
      onAmountChange('');
    } else {
      onAmountChange(amountStr.slice(0, -1));
    }
  };

  const handleClear = () => {
    onAmountChange('');
  };

  const handleQuickAdd = (increment: number) => {
    const current = parseFloat(amountStr) || 0;
    const next = (current + increment).toFixed(2);
    // remove trailing zero if clean integer
    onAmountChange(next.endsWith('.00') ? String(parseInt(next, 10)) : next);
  };

  const displayValue = amountStr ? `${currency}${amountStr}` : `${currency}0.00`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm">
      {/* Step Indicator & Type Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            1
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Amount & Type
          </span>
        </div>

        {/* Type selector */}
        <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => onTypeChange('Expense')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              type === 'Expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-pressed={type === 'Expense'}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('Income')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              type === 'Income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-pressed={type === 'Income'}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Income
          </button>
        </div>
      </div>

      {/* Large Digital Display */}
      <div
        className={`rounded-2xl p-4 mb-4 text-center transition-colors border ${
          type === 'Expense'
            ? 'bg-gradient-to-b from-stone-50 to-rose-50/30 border-rose-100'
            : 'bg-gradient-to-b from-stone-50 to-emerald-50/30 border-emerald-100'
        }`}
      >
        <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
          {type === 'Expense' ? 'Expense Amount' : 'Income Amount'}
        </div>
        <div className="relative flex items-center justify-center min-h-[4rem]">
          <span
            className={`text-4xl sm:text-5xl font-mono font-bold tracking-tight select-none ${
              amountStr
                ? type === 'Expense'
                  ? 'text-stone-900'
                  : 'text-emerald-600'
                : 'text-stone-300'
            }`}
          >
            {displayValue}
          </span>
        </div>
        {amountStr && (
          <div className="text-xs text-stone-400 mt-1">
            Tap Save & Sync below when ready
          </div>
        )}
      </div>

      {/* Quick Add Increment Chips */}
      <div className="flex items-center justify-between gap-1.5 mb-3">
        {[10, 20, 50, 100].map((inc) => (
          <button
            key={inc}
            type="button"
            onClick={() => handleQuickAdd(inc)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 transition"
            aria-label={`Add ${inc} to amount`}
          >
            +{inc}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          disabled={!amountStr}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-stone-600 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-40 transition"
          aria-label="Clear amount"
          title="Clear"
        >
          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
          Clear
        </button>
      </div>

      {/* Touch-Friendly Numerical Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className="py-3 text-xl font-bold font-mono text-stone-800 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 border border-stone-200/70 rounded-xl transition shadow-xs active:scale-95"
            aria-label={`Keypad ${digit}`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={handleBackspace}
          className="py-3 flex items-center justify-center text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 rounded-xl transition shadow-xs active:scale-95"
          aria-label="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
