import React, { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Category, TransactionType } from '../types/ledger';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryName: string;
  onSelectCategory: (categoryName: string) => void;
  onAddCustomCategory: (newCategory: Category) => void;
  transactionType: TransactionType;
}

const EMOJI_OPTIONS = ['🍔', '💡', '🚗', '🛒', '🎮', '💼', '💰', '🛍️', '🏃', '✈️', '☕', '🏠', '🎁', '📚', '🎬', '💊', '🐾', '💈'];
const COLOR_OPTIONS = ['#f97316', '#eab308', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#ef4444', '#64748b', '#14b8a6'];

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryName,
  onSelectCategory,
  onAddCustomCategory,
  transactionType,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🛍️');
  const [newCatColor, setNewCatColor] = useState('#ec4899');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a category name');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('A category with this name already exists');
      return;
    }

    const newCat: Category = {
      id: `cat_custom_${Date.now()}`,
      name: trimmed,
      icon: newCatEmoji,
      color: newCatColor,
      isCustom: true,
    };

    onAddCustomCategory(newCat);
    onSelectCategory(newCat.name);
    setNewCatName('');
    setErrorMsg('');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Catalog / Category
          </span>
        </div>
        <span className="text-xs font-medium text-stone-500">
          Selected: <strong className="text-stone-800">{selectedCategoryName}</strong>
        </span>
      </div>

      {/* Grid of category buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategoryName === cat.name;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all active:scale-95 ${
                isSelected
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/10'
                  : 'border-stone-200/80 bg-stone-50/50 hover:bg-stone-100/80 text-stone-800'
              }`}
              aria-pressed={isSelected}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-xs shrink-0"
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${cat.color}18`,
                  color: cat.color,
                }}
              >
                {cat.icon}
              </div>
              <span className="text-xs font-semibold truncate leading-tight flex-1">
                {cat.name}
              </span>
              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </button>
          );
        })}

        {/* Custom Category Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-600 transition active:scale-95 text-left"
          aria-label="Add custom category"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-stone-600 truncate">
            + Custom Catalog
          </span>
        </button>
      </div>

      {/* Custom Category Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-cat-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 id="custom-cat-title" className="text-base font-bold text-stone-900">
                New Custom Category
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g., Subscriptions, Books, Gifts"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-500 mt-1">{errorMsg}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pick an Icon
                </label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 border border-stone-100 rounded-xl">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCatEmoji(emoji)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition ${
                        newCatEmoji === emoji
                          ? 'bg-emerald-100 ring-2 ring-emerald-600'
                          : 'hover:bg-stone-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Color Tag
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newCatColor === c ? 'ring-2 ring-offset-2 ring-stone-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
