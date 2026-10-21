import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileSpreadsheet,
  Filter,
  Layers,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types/ledger';
import { formatCurrency } from '../utils/ledger';

interface TransactionLedgerProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onUpdateTransaction: (updated: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onBatchDeleteTransactions: (ids: string[]) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  categories,
  currency,
  onUpdateTransaction,
  onDeleteTransaction,
  onBatchDeleteTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | TransactionType>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');

  // Multi-select for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'All' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchMemo = t.memo.toLowerCase().includes(s);
          const matchCat = t.category.toLowerCase().includes(s);
          const matchDate = t.date.includes(s);
          const matchAmount = t.amount.toString().includes(s);
          return matchMemo || matchCat || matchDate || matchAmount;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'highest') return b.amount - a.amount;
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmBatchDelete = () => {
    onBatchDeleteTransactions(selectedIds);
    setSelectedIds([]);
    setIsBatchDeleteModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    onUpdateTransaction(editingTx);
    setEditingTx(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
      {/* Header and Controls */}
      <div className="p-4 sm:p-5 border-b border-stone-200/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">
                Master Budget Ledger
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full">
                {filteredTransactions.length} entries
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live schema matching Google Drive format: <code className="font-mono text-stone-700">Date,Time,Type,Amount,Category,Memo,Sync Status</code>
            </p>
          </div>

          {/* Batch delete action bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-xs font-semibold text-stone-700">
                {selectedIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memo, category, amount..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium text-stone-600">
            <button
              onClick={() => setTypeFilter('All')}
              className={`px-2.5 py-1 rounded-lg transition ${
                typeFilter === 'All' ? 'bg-white text-stone-900 shadow-xs font-semibold' : ''
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('Expense')}
              className={`px-2.5 py-1 rounded-lg transition ${
                typeFilter === 'Expense' ? 'bg-white text-rose-600 shadow-xs font-semibold' : ''
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('Income')}
              className={`px-2.5 py-1 rounded-lg transition ${
                typeFilter === 'Income' ? 'bg-white text-emerald-600 shadow-xs font-semibold' : ''
              }`}
            >
              Income
            </button>
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">All Catalogs</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredTransactions.length > 0 &&
                    selectedIds.length === filteredTransactions.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  aria-label="Select all transactions"
                />
              </th>
              <th className="py-3 px-3.5">Date & Time</th>
              <th className="py-3 px-3.5">Type</th>
              <th className="py-3 px-3.5">Category</th>
              <th className="py-3 px-3.5">Memo / Notes</th>
              <th className="py-3 px-3.5 text-right">Amount</th>
              <th className="py-3 px-3.5 text-center">Sync Status</th>
              <th className="py-3 px-3.5 text-right w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-stone-400">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                  <p className="font-semibold text-stone-600">No transactions found</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Try adjusting your filters or log a new entry above
                  </p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                const catObj = categories.find((c) => c.name === tx.category);

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tx.id)}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        aria-label={`Select transaction on ${tx.date} for ${tx.category}`}
                      />
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-stone-700">
                      <div>{tx.date}</div>
                      <div className="text-[11px] text-stone-400">{tx.time}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.type === 'Income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-stone-900 font-semibold">
                        <span>{catObj?.icon || '🏷️'}</span>
                        <span>{tx.category}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 max-w-[200px] truncate text-stone-600">
                      {tx.memo || <span className="text-stone-300 italic">—</span>}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-right font-mono font-bold">
                      <span
                        className={
                          tx.type === 'Income' ? 'text-emerald-600' : 'text-stone-900'
                        }
                      >
                        {tx.type === 'Income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tx.syncStatus === 'Synced'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : tx.syncStatus === 'Queued'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tx.syncStatus === 'Synced'
                              ? 'bg-emerald-500'
                              : tx.syncStatus === 'Queued'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        {tx.syncStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingTx({ ...tx })}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                          title="Edit transaction"
                          aria-label={`Edit transaction from ${tx.date}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTx(tx)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete transaction"
                          aria-label={`Delete transaction from ${tx.date}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Single Delete Confirmation Dialog (Mandatory user confirmation) */}
      {deleteConfirmTx && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h2 id="delete-dialog-title" className="text-base font-bold text-stone-900 mb-2">
              Delete Transaction?
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Are you sure you want to delete this {deleteConfirmTx.type.toLowerCase()} of{' '}
              <strong className="font-mono text-stone-900">
                {formatCurrency(deleteConfirmTx.amount, currency)}
              </strong>{' '}
              ({deleteConfirmTx.category}) on {deleteConfirmTx.date}? This will remove it from the ledger.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTx(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(deleteConfirmTx.id);
                  setDeleteConfirmTx(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Dialog */}
      {isBatchDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-delete-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h2 id="batch-delete-title" className="text-base font-bold text-stone-900 mb-2">
              Delete {selectedIds.length} Transactions?
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Are you sure you want to delete {selectedIds.length} selected entries from your budget ledger? This operation cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-dialog-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 id="edit-dialog-title" className="text-base font-bold text-stone-900">
                Edit Transaction
              </h2>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                aria-label="Close edit dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTx.amount}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingTx.type}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, type: e.target.value as TransactionType })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={editingTx.category}
                  onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editingTx.time}
                    onChange={(e) => setEditingTx({ ...editingTx, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Memo / Note
                </label>
                <input
                  type="text"
                  value={editingTx.memo}
                  onChange={(e) => setEditingTx({ ...editingTx, memo: e.target.value })}
                  placeholder="Optional note"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
