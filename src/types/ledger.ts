export type TransactionType = 'Expense' | 'Income';

export type SyncStatus = 'Synced' | 'Queued' | 'Offline Ready';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: TransactionType;
  amount: number;
  category: string;
  memo: string;
  syncStatus: SyncStatus;
  createdAt: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  icon: string;
}

export interface LedgerSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  categoryTotals: CategoryTotal[];
}

export interface BudgetGoal {
  monthlyLimit: number;
  currency: string;
}
