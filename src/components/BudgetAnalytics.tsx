import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronRight, PieChart, Target, TrendingUp } from 'lucide-react';
import { LedgerSummary } from '../types/ledger';
import { formatCurrency } from '../utils/ledger';

interface BudgetAnalyticsProps {
  summary: LedgerSummary;
  currency: string;
  monthlyBudget: number;
  onUpdateMonthlyBudget: (budget: number) => void;
}

export const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({
  summary,
  currency,
  monthlyBudget,
  onUpdateMonthlyBudget,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(String(monthlyBudget));

  const percentSpent = monthlyBudget > 0 ? (summary.totalExpense / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - summary.totalExpense;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetValue);
    if (!isNaN(val) && val > 0) {
      onUpdateMonthlyBudget(val);
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Expense */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
            {formatCurrency(summary.totalExpense, currency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Across {summary.categoryTotals.length} expense categories
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
            {formatCurrency(summary.totalIncome, currency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Inflow logged to ledger
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Balance</span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              summary.netBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${
            summary.netBalance >= 0 ? 'text-stone-900' : 'text-rose-600'
          }`}>
            {formatCurrency(summary.netBalance, currency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            {summary.netBalance >= 0 ? 'Net positive savings' : 'Expenses exceed income'}
          </div>
        </div>
      </div>

      {/* Monthly Budget Goal Tracker Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-stone-900">Monthly Budget Cap</h2>
              <p className="text-[11px] text-stone-500">
                {percentSpent > 100 ? 'Budget exceeded' : `${formatCurrency(remainingBudget, currency)} remaining`}
              </p>
            </div>
          </div>

          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="flex items-center gap-1.5">
              <input
                type="number"
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                className="w-20 px-2 py-1 text-xs border border-stone-300 rounded font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs font-semibold bg-stone-900 text-white rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="px-2 py-1 text-xs text-stone-500"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setBudgetValue(String(monthlyBudget));
                setIsEditingBudget(true);
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition"
            >
              Goal: {formatCurrency(monthlyBudget, currency)}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentSpent > 100
                ? 'bg-rose-500'
                : percentSpent > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(percentSpent, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-stone-500">
          <span>Spent: <strong>{formatCurrency(summary.totalExpense, currency)}</strong> ({percentSpent.toFixed(1)}%)</span>
          <span>Target: {formatCurrency(monthlyBudget, currency)}</span>
        </div>
      </div>

      {/* Category Breakdown list */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-stone-900">Expense Breakdown by Catalog</h2>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">
            {summary.categoryTotals.length} active
          </span>
        </div>

        {summary.categoryTotals.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-400">
            No expenses recorded yet. Use the keypad or quick log above!
          </div>
        ) : (
          <div className="space-y-3">
            {summary.categoryTotals.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="font-semibold text-stone-800">{cat.category}</span>
                    <span className="text-[10px] text-stone-400">({cat.count} tx)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-stone-900">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                    <span className="text-stone-400 text-[11px] w-12 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar per category */}
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(cat.percentage, 2)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
