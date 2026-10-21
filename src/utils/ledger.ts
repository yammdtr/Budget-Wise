import { Category, CategoryTotal, LedgerSummary, Transaction, TransactionType } from '../types/ledger';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_food', name: 'Food & Dining', icon: '🍔', color: '#f97316' },
  { id: 'cat_bills', name: 'Bills & Utilities', icon: '💡', color: '#eab308' },
  { id: 'cat_transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { id: 'cat_groceries', name: 'Groceries', icon: '🛒', color: '#10b981' },
  { id: 'cat_hobbies', name: 'Hobbies & Entertainment', icon: '🎮', color: '#8b5cf6' },
  { id: 'cat_freelance', name: 'Freelance', icon: '💼', color: '#06b6d4' },
  { id: 'cat_salary', name: 'Salary', icon: '💰', color: '#22c55e' },
  { id: 'cat_shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'cat_health', name: 'Health & Fitness', icon: '🏃', color: '#ef4444' },
  { id: 'cat_other', name: 'Other', icon: '📦', color: '#64748b' },
];

export function formatCurrency(amount: number, currency = '$'): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${currency}${formatted}` : `${currency}${formatted}`;
}

export function getCurrentDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentTimeString(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Generates CSV content conforming to the exact Google Drive schema:
 * Date,Time,Type,Amount,Category,Memo,Sync Status
 */
export function generateCSV(transactions: Transaction[]): string {
  const header = ['Date', 'Time', 'Type', 'Amount', 'Category', 'Memo', 'Sync Status'];

  const rows = transactions.map((t) => {
    const escape = (val: string | number) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      t.date,
      t.time,
      t.type,
      t.amount.toFixed(2),
      escape(t.category),
      escape(t.memo || ''),
      t.syncStatus || 'Synced',
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

/**
 * Parses CSV lines conforming to the Google Drive schema back into Transaction objects
 */
export function parseCSV(csvContent: string): { transactions: Transaction[]; errors: string[] } {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { transactions: [], errors: ['CSV content is empty'] };
  }

  const errors: string[] = [];
  const transactions: Transaction[] = [];

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const isHeader = headerLine.includes('date') && headerLine.includes('amount');
  const dataLines = isHeader ? lines.slice(1) : lines;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const columns = parseCSVRow(line);

    if (columns.length < 4) {
      errors.push(`Row ${i + 1}: expected at least 4 columns, got ${columns.length}`);
      continue;
    }

    const [date, time, rawType, rawAmount, category, memo, rawSyncStatus] = columns;
    const amount = parseFloat(rawAmount);

    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: invalid amount "${rawAmount}"`);
      continue;
    }

    const type: TransactionType =
      rawType?.toLowerCase().includes('inc') ? 'Income' : 'Expense';

    const syncStatus =
      rawSyncStatus === 'Queued' || rawSyncStatus === 'Offline Ready'
        ? rawSyncStatus
        : 'Synced';

    transactions.push({
      id: `imported_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      date: date || getCurrentDateString(),
      time: time || getCurrentTimeString(),
      type,
      amount,
      category: category || 'Other',
      memo: memo || '',
      syncStatus,
      createdAt: Date.now() - (dataLines.length - i) * 1000,
    });
  }

  return { transactions, errors };
}

function parseCSVRow(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Natural language parser for user input like:
 * "Spent 250 on food"
 * "Paid 1500 for electric bill"
 * "Earned 5000 freelance"
 * "Lunch 18.50"
 */
export function parseTransactionText(
  input: string,
  categories: Category[]
): {
  amount: number | null;
  type: TransactionType;
  category: Category;
  memo: string;
  confidence: number;
} {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Determine Type
  const isIncome =
    lower.includes('earned') ||
    lower.includes('salary') ||
    lower.includes('income') ||
    lower.includes('received') ||
    lower.includes('freelance') ||
    lower.includes('got paid') ||
    lower.includes('+');

  const type: TransactionType = isIncome ? 'Income' : 'Expense';

  // Extract amount: numbers with optional decimals, currency symbols
  const amountMatch = text.match(/(?:[$€£¥₹₱]?\s*)(\d+(?:\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

  // Match category
  let matchedCategory: Category | undefined;
  let highestScore = 0;

  const categoryKeywords: Record<string, string[]> = {
    cat_food: ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'cafe', 'restaurant', 'coffee', 'starbucks', 'burger', 'pizza', 'sushi', 'dining', 'snack'],
    cat_bills: ['bill', 'electric', 'electricity', 'water', 'internet', 'wifi', 'utility', 'utilities', 'phone', 'rent', 'subscription', 'netflix', 'power'],
    cat_transport: ['transport', 'gas', 'fuel', 'uber', 'lyft', 'taxi', 'train', 'subway', 'bus', 'parking', 'toll', 'flight', 'metro', 'fare'],
    cat_groceries: ['groceries', 'grocery', 'supermarket', 'walmart', 'trader joe', 'costco', 'market', 'produce', 'vegetables', 'fruit', 'bread'],
    cat_hobbies: ['hobby', 'game', 'gaming', 'steam', 'playstation', 'nintendo', 'cinema', 'movie', 'concert', 'entertainment', 'book', 'bowling'],
    cat_freelance: ['freelance', 'client', 'gig', 'upwork', 'project', 'contract', 'consulting'],
    cat_salary: ['salary', 'paycheck', 'payroll', 'wages', 'bonus', 'stipend'],
    cat_shopping: ['shopping', 'clothes', 'shoes', 'amazon', 'gear', 'electronics', 'gadget'],
    cat_health: ['health', 'gym', 'fitness', 'doctor', 'medicine', 'pharmacy', 'dentist', 'workout'],
  };

  for (const cat of categories) {
    const catNameLower = cat.name.toLowerCase();
    if (lower.includes(catNameLower)) {
      matchedCategory = cat;
      highestScore = 10;
      break;
    }

    const keywords = categoryKeywords[cat.id] || [];
    for (const kw of keywords) {
      if (lower.includes(kw) && kw.length > highestScore) {
        matchedCategory = cat;
        highestScore = kw.length;
      }
    }
  }

  // Fallback to default category
  if (!matchedCategory) {
    if (type === 'Income') {
      matchedCategory = categories.find((c) => c.id === 'cat_salary' || c.id === 'cat_freelance') || categories[0];
    } else {
      matchedCategory = categories.find((c) => c.id === 'cat_food') || categories[0];
    }
  }

  // Memo extraction: clean up filler words
  let memo = text
    .replace(/(?:spent|paid|bought|earned|got paid|received|for|on|about|dollars|usd|aud|eur|in)\b/gi, '')
    .replace(/(?:[$€£¥₹₱]?\s*)(\d+(?:\.\d{1,2})?)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!memo && matchedCategory) {
    memo = matchedCategory.name;
  }

  return {
    amount,
    type,
    category: matchedCategory,
    memo,
    confidence: amount !== null ? (highestScore > 0 ? 0.9 : 0.6) : 0.3,
  };
}

export function calculateLedgerSummary(
  transactions: Transaction[],
  categories: Category[]
): LedgerSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const t of transactions) {
    if (t.type === 'Income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    }
  }

  const categoryTotals: CategoryTotal[] = Array.from(categoryMap.entries())
    .map(([categoryName, data]) => {
      const catObj = categories.find((c) => c.name === categoryName);
      const percentage = totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;
      return {
        category: categoryName,
        amount: data.amount,
        percentage: Number(percentage.toFixed(1)),
        count: data.count,
        color: catObj?.color || '#94a3b8',
        icon: catObj?.icon || '🏷️',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    categoryTotals,
  };
}

const DEFAULT_FALLBACK_TAGS = [
  'Lunch',
  'Coffee',
  'Supermarket',
  'Electric Bill',
  'Subway / Gas',
  'Online Order',
  'Client Payout',
];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'on', 'at', 'by', 'from', 'with', 'of', 'is', 'was', 'my', 'our', 'new'
]);

export function extractMemoSuggestions(
  transactions: Transaction[],
  limit: number = 8,
  fallbackTags: string[] = DEFAULT_FALLBACK_TAGS
): string[] {
  const suggestions: string[] = [];
  const seen = new Set<string>();

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 30) return;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower) || STOP_WORDS.has(lower)) return;
    seen.add(lower);
    suggestions.push(trimmed);
  };

  // 1. First, prioritize full clean memos from most recent transactions
  const sorted = [...transactions].sort((a, b) => b.createdAt - a.createdAt);

  for (const tx of sorted) {
    if (tx.memo && tx.memo.trim()) {
      const fullMemo = tx.memo.trim();
      if (fullMemo.length <= 25) {
        addTag(fullMemo);
      }
      if (suggestions.length >= limit) break;
    }
  }

  // 2. Second, if more slots available, extract prominent keywords from multi-word memos
  if (suggestions.length < limit) {
    for (const tx of sorted) {
      if (tx.memo && tx.memo.trim()) {
        const words = tx.memo.trim().split(/[\s,/-]+/);
        for (const w of words) {
          if (w.length >= 3 && !STOP_WORDS.has(w.toLowerCase())) {
            const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
            addTag(capitalized);
            if (suggestions.length >= limit) break;
          }
        }
      }
      if (suggestions.length >= limit) break;
    }
  }

  // 3. Third, fill remaining slots with fallback defaults
  for (const fallback of fallbackTags) {
    if (suggestions.length >= limit) break;
    addTag(fallback);
  }

  return suggestions;
}
