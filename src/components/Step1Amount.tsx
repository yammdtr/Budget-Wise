import React from 'react';
import { ArrowRight, Delete, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { TransactionType } from '../types/ledger';

interface Step1AmountProps {
  amountStr: string;
  onAmountChange: (val: string) => void;
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  currency: string;
  onNext: () => void;
}

export const Step1Amount: React.FC<Step1AmountProps> = ({
  amountStr,
  onAmountChange,
  type,
  onTypeChange,
  currency,
  onNext,
}) => {

  const handleDigit = (digit: string) => {
    if (digit === '.') {
      if (amountStr.includes('.')) return;
      onAmountChange(amountStr === '' ? '0.' : `${amountStr}.`);
      return;
    }

    if (amountStr.includes('.')) {
      const parts = amountStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }

    if (amountStr === '0' && digit === '0') return;
    if (amountStr === '0' && digit !== '.') {
      onAmountChange(digit);
      return;
    }

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
    onAmountChange(next.endsWith('.00') ? String(parseInt(next, 10)) : next);
  };

  const amountNumber = parseFloat(amountStr) || 0;
  const canContinue = amountNumber > 0;
  const displayValue = amountStr ? `${currency}${amountStr}` : `${currency}0.00`;

  return (
    <div className="max-w-md mx-auto w-full space-y-4">
      {/* Front Hero: Amount Input */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm">
        {/* Type Switcher */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Step 1 of 3: Enter Amount
          </span>
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            <button
              type="button"
              onClick={() => onTypeChange('Expense')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'Expense'
                  ? 'bg-rose-500 text-white shadow-xs'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'Income'
                  ? 'bg-emerald-600 text-white shadow-xs'
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
          className={`rounded-2xl py-6 px-4 mb-4 text-center border transition-all ${
            type === 'Expense'
              ? 'bg-gradient-to-b from-stone-50 to-rose-50/20 border-rose-100'
              : 'bg-gradient-to-b from-stone-50 to-emerald-50/20 border-emerald-100'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
            {type === 'Expense' ? 'How much did you spend?' : 'How much did you receive?'}
          </div>
          <div className="text-5xl sm:text-6xl font-mono font-extrabold tracking-tight select-none">
            <span
              className={
                amountStr
                  ? type === 'Expense'
                    ? 'text-stone-900'
                    : 'text-emerald-600'
                  : 'text-stone-300'
              }
            >
              {displayValue}
            </span>
          </div>
        </div>

        {/* Quick Add Chips */}
        <div className="flex items-center gap-1.5 mb-3">
          {[10, 20, 50, 100].map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleQuickAdd(inc)}
              className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition active:scale-95"
              aria-label={`Add ${inc} to amount`}
            >
              +{inc}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={!amountStr}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-100 text-stone-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 transition"
            aria-label="Clear amount"
          >
            <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
            Clear
          </button>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3.5 text-2xl font-bold font-mono text-stone-800 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 border border-stone-200/80 rounded-2xl transition shadow-2xs active:scale-95"
              aria-label={`Keypad ${digit}`}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 flex items-center justify-center text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 rounded-2xl transition shadow-2xs active:scale-95"
            aria-label="Backspace"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Big Next Button */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              canContinue
                ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer shadow-stone-900/10'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
            aria-label="Continue to Category"
          >
            <span>
              {canContinue
                ? `Continue with ${currency}${amountNumber.toFixed(2)} →`
                : 'Enter an amount to continue'}
            </span>
            {canContinue && <ArrowRight className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
