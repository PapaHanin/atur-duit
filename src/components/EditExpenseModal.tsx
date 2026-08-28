import React, { useState, useEffect } from 'react';
import { X, Edit3, Calendar, Tag, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { Category, Expense } from '../types';
import { formatRupiah, parseRupiahInput, calculateCategorySpent, getCategoryHealth } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { ReceiptUpload } from './ReceiptUpload';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  categories: Category[];
  expenses: Expense[];
  onSaveExpense: (updatedExpense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
}

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  categories = [],
  expenses = [],
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (expense) {
      setCategoryId(expense.categoryId);
      setAmountInput(expense.amount.toString());
      setDescription(expense.description);
      setDate(expense.date);
      setNotes(expense.notes || '');
      setReceiptImage(expense.receiptImage);
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const parsedAmount = parseRupiahInput(amountInput);
  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];

  // Current category calculation (excluding this current expense before edit)
  const otherExpensesInCat = (expenses || []).filter((e) => e && e.id !== expense.id && e.categoryId === categoryId);
  const currentSpent = otherExpensesInCat.reduce((sum, e) => sum + (e?.amount || 0), 0);
  const simulatedSpent = currentSpent + parsedAmount;
  const simulatedHealth = selectedCategory ? getCategoryHealth(simulatedSpent, selectedCategory.allocatedAmount) : null;

  const handleQuickAddAmount = (addValue: number) => {
    setAmountInput((prev) => {
      const current = parseRupiahInput(prev);
      return (current + addValue).toString();
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || !description.trim() || !categoryId) return;

    onSaveExpense({
      ...expense,
      categoryId,
      amount: parsedAmount,
      description: description.trim(),
      date,
      notes: notes.trim() || undefined,
      receiptImage: receiptImage || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (onDeleteExpense) {
      onDeleteExpense(expense.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#111C30] rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Edit Catatan Pengeluaran
              </h2>
              <p className="text-xs text-slate-400">
                Ubah nominal, keterangan, tanggal, atau pindahkan ke pos lain.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pilih Pos Anggaran *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto p-1.5 bg-[#0B1120] rounded-2xl border border-slate-800">
              {categories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-800 bg-[#111C30] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: cat.color || '#4f46e5' }}
                      >
                        <DynamicIcon name={cat.icon || 'Tag'} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nominal Pengeluaran *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400 text-base">
                Rp
              </span>
              <input
                type="text"
                required
                placeholder="0"
                value={amountInput ? formatRupiah(parsedAmount).replace('Rp', '').trim() : ''}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0B1120] border border-slate-800 rounded-2xl font-bold font-mono text-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0B1120] hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-800 transition-colors"
                >
                  +{formatRupiah(val).replace('Rp', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Category Simulation Impact */}
          {selectedCategory && parsedAmount > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Pos Anggaran:</span>
                <span className="font-bold text-white">{selectedCategory.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Total Setelah Edit:</span>
                <span className="font-mono font-bold text-white">
                  {formatRupiah(simulatedSpent)} / {formatRupiah(selectedCategory.allocatedAmount)}
                </span>
              </div>
              {simulatedHealth && (simulatedHealth.health === 'overbudget' || simulatedHealth.remaining < 0) && (
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold pt-1 border-t border-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Perhatian: Nominal ini melebihi kuota pos sebesar {formatRupiah(simulatedSpent - selectedCategory.allocatedAmount)}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Keterangan Pengeluaran *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Beli Bensin & Parkir"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B1120] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date & Optional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tanggal Transaksi
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0B1120] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: bareng teman kantor"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B1120] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Receipt / Photo Upload Section */}
          <ReceiptUpload
            receiptImage={receiptImage}
            onChange={setReceiptImage}
            label="Unggah Struk / Foto Transaksi"
            sublabel="Lampirkan foto struk fisik, nota belanja, atau screenshot QRIS agar lebih aman"
            onPreviewFull={() => setIsPreviewOpen(true)}
          />

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {onDeleteExpense ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Hapus
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950/50 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Receipt Viewer Lightbox */}
      <ReceiptViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={receiptImage}
        title={description || 'Struk Pengeluaran'}
        amount={parsedAmount}
        date={date}
        categoryName={selectedCategory?.name}
      />
    </div>
  );
};
