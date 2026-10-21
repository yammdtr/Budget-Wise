/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Check,
  ChevronRight,
  HardDrive,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Category, Transaction, TransactionType } from './types/ledger';
import {
  calculateLedgerSummary,
  getCurrentDateString,
  getCurrentTimeString,
} from './utils/ledger';
import {
  INITIAL_TRANSACTIONS,
  loadCategories,
  loadCurrency,
  loadMonthlyBudget,
  loadTransactions,
  saveCategories,
  saveCurrency,
  saveMonthlyBudget,
  saveTransactions,
} from './utils/storage';
import { useNetworkStatus } from './utils/network';
import { Header } from './components/Header';
import { Step1Amount } from './components/Step1Amount';
import { Step2Category } from './components/Step2Category';
import { Step3Overview } from './components/Step3Overview';
import { DriveExportModal } from './components/DriveExportModal';

export default function App() {
  // Persistent data
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [currency, setCurrency] = useState<string>(() => loadCurrency());
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => loadMonthlyBudget());

  // Wizard Flow Step: 1 = Amount, 2 = Where spent, 3 = Spending Overview
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  // Input states
  const [amountStr, setAmountStr] = useState<string>('');
  const [transactionType, setTransactionType] = useState<TransactionType>('Expense');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Food & Dining');
  const [memo, setMemo] = useState<string>('');
  const [date, setDate] = useState<string>(() => getCurrentDateString());
  const [time, setTime] = useState<string>(() => getCurrentTimeString());

  // Recent logged transaction reference for overview banner
  const [lastLoggedTx, setLastLoggedTx] = useState<Transaction | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Modals
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Auto-sync function whenever wifi/internet connects
  const handleAutoSync = useCallback(() => {
    setTransactions((prev) => {
      const queuedCount = prev.filter((t) => t.syncStatus !== 'Synced').length;
      if (queuedCount > 0) {
        setSyncNotification(
          `Internet reconnected: Automatically synced & uploaded ${queuedCount} queued transaction(s) to /PocketLedger/budget_data.csv!`
        );
        setTimeout(() => setSyncNotification(null), 4500);
        return prev.map((t) =>
          t.syncStatus !== 'Synced' ? { ...t, syncStatus: 'Synced' as const } : t
        );
      }
      return prev;
    });
  }, []);

  // Offline / Online network status hook
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    triggerManualSync,
  } = useNetworkStatus(handleAutoSync);

  // Sync to local storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveCurrency(currency);
  }, [currency]);

  useEffect(() => {
    saveMonthlyBudget(monthlyBudget);
  }, [monthlyBudget]);

  const summary = useMemo(() => {
    return calculateLedgerSummary(transactions, categories);
  }, [transactions, categories]);

  const unsyncedCount = useMemo(() => {
    return transactions.filter((t) => t.syncStatus !== 'Synced').length;
  }, [transactions]);

  const goToStep = (step: 1 | 2 | 3) => {
    setSlideDirection(step >= currentStep ? 'forward' : 'backward');
    setCurrentStep(step);
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setLastLoggedTx(newTx);
    goToStep(3); // Slide to Overview!
  };

  const handleSaveAndSync = () => {
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    // If online: 'Synced'. If offline: 'Queued' for auto-upload upon reconnection!
    const initialSyncStatus = isOnline ? 'Synced' : 'Queued';

    handleAddTransaction({
      date: date || getCurrentDateString(),
      time: time || getCurrentTimeString(),
      type: transactionType,
      amount: parsedAmount,
      category: selectedCategoryName,
      memo: memo.trim() || selectedCategoryName,
      syncStatus: initialSyncStatus,
    });

    // Reset amount & memo ready for next
    setAmountStr('');
    setMemo('');
  };

  const handleLogAnother = () => {
    setAmountStr('');
    setMemo('');
    setDate(getCurrentDateString());
    setTime(getCurrentTimeString());
    setLastLoggedTx(null);
    goToStep(1); // Slide back to Amount
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBatchDeleteTransactions = (ids: string[]) => {
    setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions((prev) => [...imported, ...prev]);
    goToStep(3);
  };

  const handleSyncAllQueued = () => {
    setTransactions((prev) =>
      prev.map((t) => (t.syncStatus !== 'Synced' ? { ...t, syncStatus: 'Synced' as const } : t))
    );
  };

  const handleResetToDemo = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setIsResetConfirmOpen(false);
    goToStep(1);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onResetData={() => setIsResetConfirmOpen(true)}
        transactionCount={transactions.length}
        unsyncedCount={unsyncedCount}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={toggleSimulatedOffline}
        onManualSync={triggerManualSync}
      />

      {/* Auto-Sync Reconnection Banner */}
      {syncNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <Wifi className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{syncNotification}</span>
        </div>
      )}

      {/* Offline Alert Bar when offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            Offline Mode active &bull; All entries are saved locally and will auto-upload when reconnected
          </span>
          <button
            onClick={toggleSimulatedOffline}
            className="ml-2 underline text-[11px] font-extrabold hover:text-white"
          >
            {isSimulatedOffline ? 'Reconnect Now' : 'Check WiFi'}
          </button>
        </div>
      )}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 flex flex-col">
        {/* Step Indicator / Navigation Tabs Bar */}
        <div className="mb-5 bg-white/80 backdrop-blur-xs p-1.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="grid grid-cols-3 gap-1 text-center">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                currentStep === 1
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 1 ? 'bg-emerald-400 text-stone-900' : 'bg-stone-200 text-stone-600'
              }`}>
                1
              </span>
              <span>Input Money</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (parseFloat(amountStr) > 0 || currentStep > 1) {
                  goToStep(2);
                }
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 2 ? 'bg-emerald-400 text-stone-900' : 'bg-stone-200 text-stone-600'
              }`}>
                2
              </span>
              <span>Where Spent</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(3)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                currentStep === 3
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 3 ? 'bg-emerald-400 text-stone-900' : 'bg-stone-200 text-stone-600'
              }`}>
                3
              </span>
              <span>Overview</span>
            </button>
          </div>
        </div>

        {/* Tab Slides Content */}
        <div className="flex-1 flex flex-col justify-center">
          {currentStep === 1 && (
            <div className="animate-in fade-in zoom-in-98 duration-200">
              <Step1Amount
                amountStr={amountStr}
                onAmountChange={setAmountStr}
                type={transactionType}
                onTypeChange={(newType) => {
                  setTransactionType(newType);
                  if (newType === 'Income' && selectedCategoryName === 'Food & Dining') {
                    setSelectedCategoryName('Freelance');
                  } else if (newType === 'Expense' && selectedCategoryName === 'Freelance') {
                    setSelectedCategoryName('Food & Dining');
                  }
                }}
                currency={currency}
                onNext={() => goToStep(2)}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in zoom-in-98 duration-200">
              <Step2Category
                amountStr={amountStr}
                currency={currency}
                type={transactionType}
                categories={categories}
                selectedCategoryName={selectedCategoryName}
                onSelectCategory={setSelectedCategoryName}
                memo={memo}
                onMemoChange={setMemo}
                date={date}
                onDateChange={setDate}
                time={time}
                onTimeChange={setTime}
                onBack={() => goToStep(1)}
                onSaveAndSync={handleSaveAndSync}
                onAddCustomCategory={(newCat) => {
                  setCategories((prev) => [...prev, newCat]);
                  setSelectedCategoryName(newCat.name);
                }}
                transactions={transactions}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in zoom-in-98 duration-200">
              <Step3Overview
                summary={summary}
                currency={currency}
                monthlyBudget={monthlyBudget}
                onUpdateMonthlyBudget={setMonthlyBudget}
                transactions={transactions}
                categories={categories}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onBatchDeleteTransactions={handleBatchDeleteTransactions}
                onLogAnother={handleLogAnother}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
                lastLoggedTx={lastLoggedTx}
              />
            </div>
          )}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-3 text-center text-[11px] text-stone-400 border-t border-stone-200/80 bg-white/50">
        PocketLedger &bull; Minimalist Local-First Budgeting &bull; Google Drive <code className="font-mono text-stone-600">/PocketLedger/budget_data.csv</code>
      </footer>

      {/* Drive Modal */}
      <DriveExportModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        transactions={transactions}
        onImportTransactions={handleImportTransactions}
        onSyncAllQueued={handleSyncAllQueued}
      />

      {/* Reset Confirm */}
      {isResetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-stone-900 mb-2">Reset to Demo Data?</h2>
            <p className="text-xs text-stone-600 mb-4">
              This will restore standard sample transactions.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDemo}
                className="px-4 py-1.5 text-xs font-bold text-white bg-stone-900 rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
