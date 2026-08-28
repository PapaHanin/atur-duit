import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Plus, Sparkles, DollarSign, Wallet, ArrowUpRight, Check, PiggyBank } from 'lucide-react';
import { FinancialGoal, Category, GoalContribution } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { parseRupiahInput, formatRupiah, calculateGoalStats } from '../utils/formatters';
import { ReceiptUpload } from './ReceiptUpload';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface GoalContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  categories: Category[];
  currentMonth: string;
  onAddContribution: (
    goalId: string,
    contribution: Omit<GoalContribution, 'id' | 'createdAt'>,
    createExpenseInCategoryId?: string
  ) => void;
}

export const GoalContributionModal: React.FC<GoalContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
  categories = [],
  currentMonth,
  onAddContribution,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [depositDate, setDepositDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sourceType, setSourceType] = useState<'category_savings' | 'direct_deposit'>('category_savings');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isOpen || !goal) return null;

  const currentStats = calculateGoalStats(goal.currentAmount, goal.targetAmount, goal.targetDate);
  const parsedAmount = parseRupiahInput(amountInput);
  const projectedAmount = goal.currentAmount + parsedAmount;
  const projectedPercentage = goal.targetAmount > 0 ? Math.min(100, Math.round((projectedAmount / goal.targetAmount) * 100)) : 0;

  // Filter savings categories
  const savingsCategories = (categories || []).filter((c) => c && (c.group === 'tabungan' || c.group === 'lainnya'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert('Mohon masukkan nominal setoran yang valid.');
      return;
    }

    let linkedCategoryName: string | undefined;
    let expenseCategoryIdToRecord: string | undefined;

    if (sourceType === 'category_savings') {
      const chosenCatId = selectedCategoryId || goal.linkedCategoryId || savingsCategories[0]?.id;
      const cat = categories.find((c) => c.id === chosenCatId);
      if (cat) {
        linkedCategoryName = cat.name;
        expenseCategoryIdToRecord = cat.id;
      }
    }

    onAddContribution(
      goal.id,
      {
        goalId: goal.id,
        amount: parsedAmount,
        date: depositDate,
        monthKey: currentMonth,
        sourceType,
        sourceCategoryName: linkedCategoryName,
        notes: notes.trim() || undefined,
        receiptImage: receiptImage || undefined,
      },
      expenseCategoryIdToRecord
    );

    // Trigger celebration if reaching or exceeding 100%
    if (projectedAmount >= goal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    // Reset and close
    setAmountInput('');
    setNotes('');
    setReceiptImage(undefined);
    onClose();
  };

  const setQuickAmount = (val: number) => {
    setAmountInput(String(val));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl text-white shadow-sm flex items-center justify-center"
              style={{ backgroundColor: goal.color || '#4f46e5' }}
            >
              <DynamicIcon name={goal.icon || 'Target'} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Setor Dana ke Target
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {goal.name} · Progres saat ini {currentStats.percentage}%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Goal Status Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Terkumpul Sekarang:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
              {formatRupiah(goal.currentAmount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Kekurangan:</span>
            <span className="font-bold font-mono text-rose-600 dark:text-rose-400 text-sm">
              {formatRupiah(currentStats.remainingAmount)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Nominal Setoran (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-slate-400">
                Rp
              </span>
              <input
                type="text"
                required
                autoFocus
                inputMode="numeric"
                placeholder="0"
                value={amountInput ? new Intl.NumberFormat('id-ID').format(parsedAmount) : ''}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-lg font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setQuickAmount(500000)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
              >
                +500 rb
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(1000000)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
              >
                +1 Jt
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(2500000)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
              >
                +2.5 Jt
              </button>
              {currentStats.monthlyRecommendation > 0 && (
                <button
                  type="button"
                  onClick={() => setQuickAmount(currentStats.monthlyRecommendation)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors font-bold"
                >
                  Saran: {formatRupiah(currentStats.monthlyRecommendation)}
                </button>
              )}
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sumber Dana Setoran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                  sourceType === 'category_savings'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="sourceType"
                  checked={sourceType === 'category_savings'}
                  onChange={() => setSourceType('category_savings')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <div className="font-bold">Pos Tabungan</div>
                  <div className="text-[10px] text-slate-500">Potong alokasi bulanan</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                  sourceType === 'direct_deposit'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="sourceType"
                  checked={sourceType === 'direct_deposit'}
                  onChange={() => setSourceType('direct_deposit')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <div className="font-bold">Setoran Luar</div>
                  <div className="text-[10px] text-slate-500">Bonus, sampingan, dll</div>
                </div>
              </label>
            </div>

            {sourceType === 'category_savings' && savingsCategories.length > 0 && (
              <div className="pt-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Pilih Pos Tabungan yang Dipotong:
                </label>
                <select
                  value={selectedCategoryId || goal.linkedCategoryId || savingsCategories[0]?.id}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {savingsCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Alokasi: {formatRupiah(c.allocatedAmount)})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                  ✨ Transaksi pengeluaran/setoran akan otomatis dicatat di pos ini.
                </p>
              </div>
            )}
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Tanggal Setor
              </label>
              <input
                type="date"
                required
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Nabung dari gaji / freelance"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt / Transfer Proof Upload */}
          <ReceiptUpload
            receiptImage={receiptImage}
            onChange={setReceiptImage}
            label="Unggah Bukti Setoran / Transfer (Opsional)"
            sublabel="Lampirkan bukti setoran bank, transfer reksa dana, atau slip tabungan"
            onPreviewFull={() => setIsPreviewOpen(true)}
          />

          {/* Projected Progress Preview */}
          {parsedAmount > 0 && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-950 dark:text-indigo-200">
                  Progres Baru: {projectedPercentage}%
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(projectedAmount)} / {formatRupiah(goal.targetAmount)}
                </span>
              </div>
              <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-900/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all rounded-full"
                  style={{ width: `${projectedPercentage}%` }}
                />
              </div>
              {projectedAmount >= goal.targetAmount && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  🎉 Selamat! Setoran ini akan menyelesaikan target finansial Anda!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={parsedAmount <= 0}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Konfirmasi Setoran
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Viewer Lightbox */}
      <ReceiptViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={receiptImage}
        title={goal?.title ? `Bukti Setoran: ${goal.title}` : 'Bukti Setoran Target'}
        amount={parsedAmount}
        date={depositDate}
        categoryName={goal?.title}
      />
    </div>
  );
};
