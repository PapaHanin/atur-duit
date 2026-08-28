import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Tag, AlertTriangle, AlertCircle, ShieldCheck, Check, Sparkles, Wallet as WalletIcon } from 'lucide-react';
import { Category, Expense, Wallet } from '../types';
import { formatRupiah, parseRupiahInput, calculateCategorySpent, getCategoryHealth } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { ReceiptUpload } from './ReceiptUpload';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  expenses: Expense[];
  wallets?: Wallet[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  preselectedCategoryId?: string;
  initialData?: {
    description?: string;
    amount?: number;
    date?: string;
    receiptImage?: string;
    notes?: string;
    categoryId?: string;
  };
}

const QUICK_AMOUNTS = [15000, 25000, 50000, 100000, 250000, 500000];

const SAMPLE_DESCRIPTIONS = [
  'Makan Siang / Malam',
  'Beli Bensin & Parkir',
  'Belanja Sembako / Dapur',
  'Kopi & Nongkrong',
  'Token Listrik / Air',
  'Pulsa & Paket Data',
  'Tagihan Internet / WiFi',
  'Obat & Vitamin',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  categories,
  expenses,
  wallets = [],
  onAddExpense,
  preselectedCategoryId,
  initialData,
}) => {
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId || preselectedCategoryId || categories[0]?.id || ''
  );
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '');
  const [amountInput, setAmountInput] = useState<string>(
    initialData?.amount ? initialData.amount.toString() : ''
  );
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [date, setDate] = useState<string>(
    () => initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(initialData?.receiptImage);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.categoryId) setCategoryId(initialData.categoryId);
      if (initialData.amount) setAmountInput(initialData.amount.toString());
      if (initialData.description) setDescription(initialData.description);
      if (initialData.date) setDate(initialData.date);
      if (initialData.receiptImage) setReceiptImage(initialData.receiptImage);
      if (initialData.notes) setNotes(initialData.notes);
    } else if (preselectedCategoryId) {
      setCategoryId(preselectedCategoryId);
    } else if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [initialData, preselectedCategoryId, categories]);

  if (!isOpen) return null;

  const parsedAmount = parseRupiahInput(amountInput);
  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];

  // Current category calculation
  const currentSpent = selectedCategory ? calculateCategorySpent(selectedCategory.id, expenses) : 0;
  const currentHealth = selectedCategory ? getCategoryHealth(currentSpent, selectedCategory.allocatedAmount) : null;

  // Simulated next state after this expense
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

    onAddExpense({
      categoryId,
      walletId: walletId || undefined,
      amount: parsedAmount,
      description: description.trim(),
      date,
      notes: notes.trim() || undefined,
      receiptImage: receiptImage || undefined,
    });

    // Reset fields
    setAmountInput('');
    setDescription('');
    setNotes('');
    setReceiptImage(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#111C30] rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Catat Pengeluaran Harian
              </h2>
              <p className="text-xs text-slate-400">
                Pilih pos anggaran agar sisa saldo terpotong secara otomatis.
              </p>
            </div>
          </div>
          <button
            id="expense-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Category Selector with Visual Remaining Balance */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Potong Dari Pos Anggaran *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1.5 bg-[#0B1120] rounded-2xl border border-slate-800">
              {categories.map((cat) => {
                const isSelected = cat.id === categoryId;
                const spent = calculateCategorySpent(cat.id, expenses);
                const health = getCategoryHealth(spent, cat.allocatedAmount);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-500'
                        : 'border-slate-800/80 bg-[#111C30]/60 hover:border-slate-700 hover:bg-[#111C30]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.color + '20', color: cat.color }}
                    >
                      <DynamicIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-2xs">
                        <span className="text-slate-400">Sisa:</span>
                        <span
                          className={`font-semibold font-mono ${
                            health.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatRupiah(health.remaining)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet / Source of Payment */}
          {wallets.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Sumber Dana / Dompet Pembayaran
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {wallets.map((w) => {
                  const isSel = w.id === walletId;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWalletId(w.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 transition-all ${
                        isSel
                          ? 'border-teal-500 bg-teal-950/40 text-white ring-1 ring-teal-500'
                          : 'border-slate-800 bg-[#0B1120] text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white text-2xs"
                        style={{ backgroundColor: w.color }}
                      >
                        <DynamicIcon name={w.icon} className="w-3 h-3" />
                      </div>
                      <span className="truncate font-semibold">{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount Input with Currency and Quick Presets */}
          <div>
            <label htmlFor="expense-amount-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nominal Pengeluaran *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base font-mono">
                Rp
              </span>
              <input
                id="expense-amount-input"
                type="text"
                required
                placeholder="0"
                value={amountInput ? parseInt(amountInput.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-4 py-3 text-lg font-bold font-mono rounded-2xl border border-slate-800 bg-[#0B1120] text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAddAmount(amt)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-[#0B1120] hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-800 transition-colors font-medium shadow-2xs"
                >
                  +{formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Description Input & Suggestions */}
          <div>
            <label htmlFor="expense-desc-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Keterangan Pengeluaran *
            </label>
            <input
              id="expense-desc-input"
              type="text"
              required
              placeholder="Contoh: Beli bensin 50rb, Makan siang warteg, Belanja bulanan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-800 bg-[#0B1120] text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {/* Quick Sample Tags */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SAMPLE_DESCRIPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDescription(tag)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-[#0B1120] text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker & Optional Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Tanggal Transaksi
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-800 bg-[#0B1120] text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: Struk tersimpan, patungan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-[#0B1120] text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt / Photo Upload Section */}
          <ReceiptUpload
            receiptImage={receiptImage}
            onChange={setReceiptImage}
            label="Unggah Struk / Bukti Foto (Opsional)"
            sublabel="Lampirkan foto struk fisik, nota belanja, atau screenshot QRIS agar lebih aman"
            onPreviewFull={() => setIsPreviewOpen(true)}
          />

          {/* Real-time Anti-Boncos Simulation Alert Box */}
          {selectedCategory && parsedAmount > 0 && simulatedHealth && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                simulatedHealth.health === 'overbudget' || simulatedHealth.health === 'danger'
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : simulatedHealth.health === 'warning'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-indigo-950/30 border-indigo-800 text-indigo-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {simulatedHealth.health === 'safe' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  {simulatedHealth.health === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {(simulatedHealth.health === 'danger' || simulatedHealth.health === 'overbudget') && (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-xs leading-relaxed">
                  <div className="font-bold">
                    Pratinjau Sisa Saldo Pos {selectedCategory.name}:
                  </div>
                  <div className="mt-0.5">
                    Setelah pengeluaran ini, sisa saldo menjadi{' '}
                    <span className="font-bold font-mono">{formatRupiah(simulatedHealth.remaining)}</span>{' '}
                    (Terpakai {simulatedHealth.percentage.toFixed(1)}% - {simulatedHealth.label}).
                  </div>
                  {simulatedHealth.remaining < 0 && (
                    <p className="mt-1.5 font-bold text-rose-400">
                      ⚠️ PERINGATAN: Pos ini akan mengalami kelebihan pengeluaran (boncos)!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-800 text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              id="expense-submit-btn"
              type="submit"
              disabled={parsedAmount <= 0 || !description.trim()}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-950/50 active:scale-95 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Full Preview Lightbox */}
      <ReceiptViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={receiptImage}
        title={description || 'Pratinjau Struk Pengeluaran'}
        amount={parsedAmount}
        date={date}
        categoryName={selectedCategory?.name}
      />
    </div>
  );
};

