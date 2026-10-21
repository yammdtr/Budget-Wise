import React, { useState, useMemo } from 'react';
import { ArrowRight, Bot, Check, CornerDownLeft, Sparkles } from 'lucide-react';
import { Category, Transaction } from '../types/ledger';
import { getCurrentDateString, getCurrentTimeString, parseTransactionText } from '../utils/ledger';

interface NaturalLanguageInputProps {
  categories: Category[];
  currency: string;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

const EXAMPLES = [
  'Spent 250 on food',
  'Paid 1500 for electric bill',
  'Earned 5000 freelance',
  'Coffee 4.50 at bakery',
  'Spent 65 on groceries',
];

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  categories,
  currency,
  onAddTransaction,
}) => {
  const [inputText, setInputText] = useState('');
  const [justLogged, setJustLogged] = useState(false);

  const parsed = useMemo(() => {
    if (!inputText.trim()) return null;
    return parseTransactionText(inputText, categories);
  }, [inputText, categories]);

  const handleQuickLog = () => {
    if (!parsed || parsed.amount === null || parsed.amount <= 0) return;

    onAddTransaction({
      date: getCurrentDateString(),
      time: getCurrentTimeString(),
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category.name,
      memo: parsed.memo || parsed.category.name,
      syncStatus: 'Synced',
    });

    setInputText('');
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  };

  return (
    <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-stone-800">
            Natural Quick Log
          </span>
          <span className="text-[10px] text-stone-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded-md">
            Type & Press Enter
          </span>
        </div>

        {justLogged && (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Added to ledger!
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleQuickLog();
            }
          }}
          placeholder="e.g., Spent 250 on food, Paid 1500 for electric bill, $12 lunch..."
          className="w-full pl-3.5 pr-24 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder:text-stone-400 shadow-xs"
        />

        {parsed && parsed.amount !== null && (
          <button
            type="button"
            onClick={handleQuickLog}
            aria-label="Submit natural language log"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition active:scale-95 shadow-sm"
          >
            <span>Log</span>
            <CornerDownLeft className="w-3 h-3 text-stone-300" />
          </button>
        )}
      </div>

      {/* Live preview banner */}
      {parsed && (
        <div className="mt-2.5 p-2 bg-white rounded-xl border border-stone-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 text-[11px] font-medium">Parsed:</span>
          {parsed.amount !== null ? (
            <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
              {parsed.type === 'Income' ? '+' : '-'}
              {currency}{parsed.amount.toFixed(2)}
            </span>
          ) : (
            <span className="text-rose-500 italic">No amount detected yet</span>
          )}

          <span
            className="px-2 py-0.5 rounded font-medium flex items-center gap-1"
            style={{
              backgroundColor: `${parsed.category.color}15`,
              color: parsed.category.color,
            }}
          >
            <span>{parsed.category.icon}</span>
            <span>{parsed.category.name}</span>
          </span>

          <span className="text-stone-600 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded truncate max-w-[150px]">
            &ldquo;{parsed.memo || parsed.category.name}&rdquo;
          </span>

          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
              parsed.type === 'Income'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {parsed.type}
          </span>
        </div>
      )}

      {/* Quick Example Clickers */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-[10px] text-stone-400">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInputText(ex)}
            className="text-[10px] bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 px-2 py-0.5 rounded-full transition"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};
