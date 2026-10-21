import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CATEGORIES,
  formatCurrency,
  generateCSV,
  parseCSV,
  parseTransactionText,
  calculateLedgerSummary,
  extractMemoSuggestions,
} from './ledger';
import { Transaction } from '../types/ledger';

test('formatCurrency formats values correctly with symbol', () => {
  assert.equal(formatCurrency(250), '$250.00');
  assert.equal(formatCurrency(1500.5), '$1,500.50');
  assert.equal(formatCurrency(-45.2, '€'), '-€45.20');
});

test('generateCSV conforms to Google Drive schema', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2026-10-21',
      time: '14:40',
      type: 'Expense',
      amount: 250,
      category: 'Food & Dining',
      memo: 'Lunch',
      syncStatus: 'Synced',
      createdAt: 1000,
    },
    {
      id: '2',
      date: '2026-10-21',
      time: '18:00',
      type: 'Expense',
      amount: 1500,
      category: 'Bills & Utilities',
      memo: 'Electric Bill',
      syncStatus: 'Synced',
      createdAt: 2000,
    },
    {
      id: '3',
      date: '2026-10-22',
      time: '09:15',
      type: 'Income',
      amount: 5000,
      category: 'Freelance',
      memo: 'Web Project Payment',
      syncStatus: 'Synced',
      createdAt: 3000,
    },
  ];

  const csv = generateCSV(transactions);
  const lines = csv.split('\n');

  assert.equal(lines[0], 'Date,Time,Type,Amount,Category,Memo,Sync Status');
  assert.equal(lines[1], '2026-10-21,14:40,Expense,250.00,Food & Dining,Lunch,Synced');
  assert.equal(lines[2], '2026-10-21,18:00,Expense,1500.00,Bills & Utilities,Electric Bill,Synced');
  assert.equal(lines[3], '2026-10-22,09:15,Income,5000.00,Freelance,Web Project Payment,Synced');
});

test('parseCSV reads CSV correctly and handles quoted fields', () => {
  const rawCsv = `Date,Time,Type,Amount,Category,Memo,Sync Status
2026-10-21,14:40,Expense,250.00,Food & Dining,Lunch,Synced
2026-10-21,18:00,Expense,1500.00,"Bills, Utilities","Electric, Gas Bill",Queued
2026-10-22,09:15,Income,5000.00,Freelance,"Web Project, Phase 1",Synced`;

  const { transactions, errors } = parseCSV(rawCsv);
  assert.equal(errors.length, 0);
  assert.equal(transactions.length, 3);

  assert.equal(transactions[0].amount, 250);
  assert.equal(transactions[0].category, 'Food & Dining');
  assert.equal(transactions[0].syncStatus, 'Synced');

  assert.equal(transactions[1].amount, 1500);
  assert.equal(transactions[1].category, 'Bills, Utilities');
  assert.equal(transactions[1].memo, 'Electric, Gas Bill');
  assert.equal(transactions[1].syncStatus, 'Queued');

  assert.equal(transactions[2].type, 'Income');
  assert.equal(transactions[2].amount, 5000);
});

test('parseTransactionText parses natural language budget inputs', () => {
  const p1 = parseTransactionText('Spent 250 on food', DEFAULT_CATEGORIES);
  assert.equal(p1.amount, 250);
  assert.equal(p1.type, 'Expense');
  assert.equal(p1.category.name, 'Food & Dining');

  const p2 = parseTransactionText('Paid 1500 for electric bill', DEFAULT_CATEGORIES);
  assert.equal(p2.amount, 1500);
  assert.equal(p2.type, 'Expense');
  assert.equal(p2.category.name, 'Bills & Utilities');

  const p3 = parseTransactionText('Earned 5000 freelance', DEFAULT_CATEGORIES);
  assert.equal(p3.amount, 5000);
  assert.equal(p3.type, 'Income');
  assert.equal(p3.category.name, 'Freelance');

  const p4 = parseTransactionText('Spent 42 on groceries at supermarket', DEFAULT_CATEGORIES);
  assert.equal(p4.amount, 42);
  assert.equal(p4.category.name, 'Groceries');
});

test('calculateLedgerSummary aggregates amounts and categories', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2026-10-21',
      time: '12:00',
      type: 'Expense',
      amount: 100,
      category: 'Food & Dining',
      memo: 'Lunch',
      syncStatus: 'Synced',
      createdAt: 1,
    },
    {
      id: '2',
      date: '2026-10-21',
      time: '13:00',
      type: 'Expense',
      amount: 300,
      category: 'Bills & Utilities',
      memo: 'Power',
      syncStatus: 'Synced',
      createdAt: 2,
    },
    {
      id: '3',
      date: '2026-10-21',
      time: '14:00',
      type: 'Income',
      amount: 1000,
      category: 'Salary',
      memo: 'Monthly pay',
      syncStatus: 'Synced',
      createdAt: 3,
    },
  ];

  const summary = calculateLedgerSummary(transactions, DEFAULT_CATEGORIES);
  assert.equal(summary.totalExpense, 400);
  assert.equal(summary.totalIncome, 1000);
  assert.equal(summary.netBalance, 600);
  assert.equal(summary.categoryTotals.length, 2);
  // Bills & Utilities should be highest expense (300 / 400 = 75%)
  assert.equal(summary.categoryTotals[0].category, 'Bills & Utilities');
  assert.equal(summary.categoryTotals[0].amount, 300);
  assert.equal(summary.categoryTotals[0].percentage, 75);
});

test('extractMemoSuggestions prioritizes keywords from previous memos first', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2026-10-21',
      time: '12:00',
      type: 'Expense',
      amount: 100,
      category: 'Food & Dining',
      memo: 'Ramen bar lunch',
      syncStatus: 'Synced',
      createdAt: 10,
    },
    {
      id: '2',
      date: '2026-10-21',
      time: '13:00',
      type: 'Expense',
      amount: 45,
      category: 'Groceries',
      memo: 'Trader Joe essentials',
      syncStatus: 'Synced',
      createdAt: 20,
    },
  ];

  const suggestions = extractMemoSuggestions(transactions, 5);
  // Most recent first: 'Trader Joe essentials' (or keywords 'Trader', 'Joe', 'Essentials'), then 'Ramen bar lunch'
  assert.ok(suggestions.includes('Trader Joe essentials') || suggestions.includes('Trader'));
  assert.ok(suggestions.includes('Ramen bar lunch') || suggestions.includes('Ramen'));
  assert.equal(suggestions.length, 5);
});
