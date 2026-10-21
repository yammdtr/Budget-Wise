import { Category, Transaction } from '../types/ledger';
import { DEFAULT_CATEGORIES } from './ledger';

const STORAGE_KEYS = {
  TRANSACTIONS: 'pocketledger_transactions_v1',
  CATEGORIES: 'pocketledger_categories_v1',
  CURRENCY: 'pocketledger_currency_v1',
  MONTHLY_BUDGET: 'pocketledger_budget_v1',
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_1',
    date: '2026-10-21',
    time: '14:40',
    type: 'Expense',
    amount: 250.0,
    category: 'Food & Dining',
    memo: 'Lunch',
    syncStatus: 'Synced',
    createdAt: 1729518000000,
  },
  {
    id: 'tx_seed_2',
    date: '2026-10-21',
    time: '18:00',
    type: 'Expense',
    amount: 1500.0,
    category: 'Bills & Utilities',
    memo: 'Electric Bill',
    syncStatus: 'Synced',
    createdAt: 1729530000000,
  },
  {
    id: 'tx_seed_3',
    date: '2026-10-22',
    time: '09:15',
    type: 'Income',
    amount: 5000.0,
    category: 'Freelance',
    memo: 'Web Project Payment',
    syncStatus: 'Synced',
    createdAt: 1729585000000,
  },
  {
    id: 'tx_seed_4',
    date: '2026-10-22',
    time: '13:30',
    type: 'Expense',
    amount: 84.5,
    category: 'Groceries',
    memo: 'Supermarket weekly essentials',
    syncStatus: 'Synced',
    createdAt: 1729600000000,
  },
  {
    id: 'tx_seed_5',
    date: '2026-10-22',
    time: '16:10',
    type: 'Expense',
    amount: 18.25,
    category: 'Transportation',
    memo: 'Subway card top-up',
    syncStatus: 'Synced',
    createdAt: 1729610000000,
  },
  {
    id: 'tx_seed_6',
    date: '2026-10-23',
    time: '20:15',
    type: 'Expense',
    amount: 59.99,
    category: 'Hobbies & Entertainment',
    memo: 'New indie game release',
    syncStatus: 'Synced',
    createdAt: 1729700000000,
  },
];

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
  } catch (e) {
    console.error('Failed to load transactions from localStorage', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function loadCurrency(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || '$';
  } catch {
    return '$';
  }
}

export function saveCurrency(currency: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  } catch (e) {
    console.error('Failed to save currency', e);
  }
}

export function loadMonthlyBudget(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.MONTHLY_BUDGET);
    return val ? parseFloat(val) : 2500;
  } catch {
    return 2500;
  }
}

export function saveMonthlyBudget(budget: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_BUDGET, String(budget));
  } catch (e) {
    console.error('Failed to save monthly budget', e);
  }
}
