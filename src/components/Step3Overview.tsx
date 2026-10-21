import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  Edit3,
  FileSpreadsheet,
  HardDrive,
  PlusCircle,
  Search,
  TableProperties,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { Category, LedgerSummary, Transaction } from '../types/ledger';
import { formatCurrency } from '../utils/ledger';
import { TransactionLedger } from './TransactionLedger';

interface Step3OverviewProps {
  summary: LedgerSummary;
  currency: string;
  monthlyBudget: number;
  onUpdateMonthlyBudget: (budget: number) => void;
  transactions: Transaction[];
  categories: Category[];
  onUpdateTransaction: (updated: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onBatchDeleteTransactions: (ids: string[]) => void;
  onLogAnother: () => void;
  onOpenDriveModal: () => void;
  lastLoggedTx?: Transaction | null;
}

const BUDGET_PRESETS = [500, 1000, 1500, 2000, 2500, 3000, 5000, 10000];

export const Step3Overview: React.FC<Step3OverviewProps> = ({
  summary,
  currency,
  monthlyBudget,
  onUpdateMonthlyBudget,
  transactions,
  categories,
  onUpdateTransaction,
  onDeleteTransaction,
  onBatchDeleteTransactions,
  onLogAnother,
  onOpenDriveModal,
  lastLoggedTx,
}) => {
  const [showFullTable, setShowFullTable] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(String(monthlyBudget));
  const [budgetSuccessToast, setBudgetSuccessToast] = useState(false);

  // Memo Search State
  const [memoSearch, setMemoSearch] = useState('');
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);

  const percentSpent = monthlyBudget > 0 ? (summary.totalExpense / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - summary.totalExpense;

  // Fully editable budget: no min, no max values
  const handleSaveBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(budgetValue);
    if (!isNaN(val)) {
      onUpdateMonthlyBudget(val);
      setIsEditingBudget(false);
      setBudgetSuccessToast(true);
      setTimeout(() => setBudgetSuccessToast(false), 2500);
    }
  };

  const handleSelectPreset = (amount: number) => {
    setBudgetValue(String(amount));
    onUpdateMonthlyBudget(amount);
    setIsEditingBudget(false);
    setBudgetSuccessToast(true);
    setTimeout(() => setBudgetSuccessToast(false), 2500);
  };

  // Filtered transactions by memo
  const memoFilteredTransactions = useMemo(() => {
    if (!memoSearch.trim()) return transactions;
    const query = memoSearch.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        t.memo.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }, [transactions, memoSearch]);

  return (
    <div className="max-w-2xl mx-auto w-full space-y-5 animate-in fade-in">
      {/* Success banner if just logged */}
      {lastLoggedTx && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-emerald-950">
                Logged {lastLoggedTx.type === 'Income' ? '+' : '-'}
                {formatCurrency(lastLoggedTx.amount, currency)} to {lastLoggedTx.category}
              </div>
              <div className="text-emerald-700 text-[11px]">
                Appended to <code className="font-mono font-semibold">/PocketLedger/budget_data.csv</code> &bull; Offline cached
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogAnother}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Log Another</span>
          </button>
        </div>
      )}

      {/* Primary Action Button: Log Another Transaction */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onLogAnother}
          className="flex-1 py-3.5 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
          aria-label="Log another entry"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>+ Log Another Entry</span>
        </button>

        <button
          type="button"
          onClick={onOpenDriveModal}
          className="px-4 py-3.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
        >
          <HardDrive className="w-4 h-4 text-emerald-600" />
          <span>Drive / CSV</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900">
            {formatCurrency(summary.totalExpense, currency)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Across {summary.categoryTotals.length} categories</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Income</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600">
            {formatCurrency(summary.totalIncome, currency)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Inflow to ledger</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Balance</span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              summary.netBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold font-mono ${
            summary.netBalance >= 0 ? 'text-stone-900' : 'text-rose-600'
          }`}>
            {formatCurrency(summary.netBalance, currency)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {summary.netBalance >= 0 ? 'Net savings' : 'Budget deficit'}
          </div>
        </div>
      </div>

      {/* Fully Editable Monthly Budget Card (No min or max limits) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">Monthly Budget Target</span>
                {budgetSuccessToast && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 animate-in fade-in">
                    <Check className="w-3 h-3" /> Updated!
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-400">
                Fully customizable spending target (no min or max)
              </div>
            </div>
          </div>

          {!isEditingBudget ? (
            <button
              type="button"
              onClick={() => {
                setBudgetValue(String(monthlyBudget));
                setIsEditingBudget(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition border border-stone-200"
              aria-label="Edit Monthly Budget Target"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-mono">{formatCurrency(monthlyBudget, currency)}</span>
              <span className="text-[10px] font-normal text-stone-500 ml-0.5">(Edit)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              aria-label="Cancel editing budget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Fully Editable Input (No min, no max limits) */}
        {isEditingBudget && (
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl mb-3 space-y-3 animate-in fade-in zoom-in-98">
            <form onSubmit={handleSaveBudget} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-stone-400 font-mono">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Set any budget amount (e.g. 0, 500, 3000...)"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-600 text-xs font-semibold rounded-xl border border-stone-200"
              >
                Cancel
              </button>
            </form>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-stone-400 mr-1">Quick Presets:</span>
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded-lg transition ${
                    monthlyBudget === preset
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {currency}{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentSpent > 100
                ? 'bg-rose-500'
                : percentSpent > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(Math.max(percentSpent, 0), 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-stone-500">
          <span>Spent: <strong>{formatCurrency(summary.totalExpense, currency)}</strong> ({percentSpent.toFixed(1)}%)</span>
          <span>
            {monthlyBudget <= 0
              ? 'No budget limit set'
              : remainingBudget >= 0
              ? `${formatCurrency(remainingBudget, currency)} remaining`
              : 'Over budget'}
          </span>
        </div>
      </div>

      {/* Quick Category Spending Breakdown */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
          Spending Breakdown by Category
        </h3>
        <div className="space-y-2.5">
          {summary.categoryTotals.slice(0, 5).map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-stone-800">
                  <span>{cat.icon}</span>
                  <span>{cat.category}</span>
                </span>
                <span className="font-mono font-bold text-stone-900">
                  {formatCurrency(cat.amount, currency)} <span className="text-stone-400 font-normal">({cat.percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(cat.percentage, 2)}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Transactions Section with Search Bar for Memo */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Transactions & Memo Search
            </h3>
            <p className="text-[11px] text-stone-500">
              Search by memo or notes across all your stored ledger records
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFullTable(!showFullTable)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-xl transition"
          >
            <TableProperties className="w-3.5 h-3.5 text-stone-500" />
            <span>{showFullTable ? 'Hide Table View' : 'Full Table View'}</span>
          </button>
        </div>

        {/* Prominent Memo Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={memoSearch}
            onChange={(e) => setMemoSearch(e.target.value)}
            placeholder="Search memo notes (e.g. 'Lunch', 'Electric Bill', 'Coffee', 'Supermarket')..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder:text-stone-400 shadow-2xs transition"
          />
          {memoSearch && (
            <button
              type="button"
              onClick={() => setMemoSearch('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5 rounded-full hover:bg-stone-200"
              aria-label="Clear memo search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Memo Search Results Count */}
        {memoSearch && (
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Found <strong>{memoFilteredTransactions.length}</strong> matching memo &ldquo;{memoSearch}&rdquo;
            </span>
            <button
              type="button"
              onClick={() => setMemoSearch('')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Live Memo Search Results List */}
        <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
          {memoFilteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              <Search className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
              <p className="font-semibold text-stone-600">No transactions match memo &ldquo;{memoSearch}&rdquo;</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Check for typos or try clearing the search</p>
            </div>
          ) : (
            memoFilteredTransactions.map((tx) => {
              const catObj = categories.find((c) => c.name === tx.category);
              return (
                <div
                  key={tx.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                      style={{
                        backgroundColor: `${catObj?.color || '#94a3b8'}15`,
                        color: catObj?.color || '#94a3b8',
                      }}
                    >
                      {catObj?.icon || '🏷️'}
                    </div>

                    <div className="min-w-0">
                      {/* Memo note highlighted */}
                      <div className="font-bold text-stone-900 truncate flex items-center gap-1.5">
                        <span className="truncate">
                          {tx.memo || <span className="text-stone-300 italic">No memo</span>}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded shrink-0">
                          {tx.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-mono">
                        <span>{tx.date}</span>
                        <span>&bull;</span>
                        <span>{tx.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold ${
                          tx.type === 'Income' ? 'text-emerald-600' : 'text-stone-900'
                        }`}
                      >
                        {tx.type === 'Income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </div>
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-full inline-block ${
                          tx.syncStatus === 'Synced'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {tx.syncStatus}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmTx(tx)}
                      className="p-1 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete entry"
                      aria-label={`Delete entry ${tx.memo || tx.category}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Full Table View toggle modal/drawer */}
        {showFullTable && (
          <div className="pt-2 animate-in fade-in">
            <TransactionLedger
              transactions={transactions}
              categories={categories}
              currency={currency}
              onUpdateTransaction={onUpdateTransaction}
              onDeleteTransaction={onDeleteTransaction}
              onBatchDeleteTransactions={onBatchDeleteTransactions}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTx && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-stone-900 mb-2">Delete Transaction?</h2>
            <p className="text-xs text-stone-600 mb-4">
              Delete entry of{' '}
              <strong className="font-mono text-stone-900">
                {formatCurrency(deleteConfirmTx.amount, currency)}
              </strong>{' '}
              ({deleteConfirmTx.memo || deleteConfirmTx.category})?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTx(null)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(deleteConfirmTx.id);
                  setDeleteConfirmTx(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
