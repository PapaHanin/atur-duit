import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  DollarSign,
  Briefcase,
  Gift,
  TrendingUp,
  Store,
  Clock,
  Sparkles,
  PieChart,
  Wallet,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Category, AdditionalIncome } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { ReceiptUpload } from './ReceiptUpload';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentMonth: string;
  onAddIncome: (
    incomeData: Omit<AdditionalIncome, 'id' | 'createdAt'>
  ) => void;
}

const INCOME_TYPE_OPTIONS: {
  id: AdditionalIncome['incomeType'];
  label: string;
  icon: any;
  color: string;
}[] = [
  { id: 'freelance', label: 'Freelance & Proyek', icon: Briefcase, color: '#4f46e5' },
  { id: 'bonus', label: 'Bonus, THR & Insentif', icon: Gift, color: '#059669' },
  { id: 'bisnis', label: 'Hasil Bisnis & Jualan', icon: Store, color: '#d97706' },
  { id: 'investasi', label: 'Dividen & Imbal Hasil', icon: TrendingUp, color: '#0891b2' },
  { id: 'lembur', label: 'Lembur & Komisi', icon: Clock, color: '#7c3aed' },
  { id: 'hadiah', label: 'Hadiah & Cashback', icon: Sparkles, color: '#db2777' },
  { id: 'lainnya', label: 'Pemasukan Lainnya', icon: DollarSign, color: '#64748b' },
];

const SUGGESTIONS: { name: string; type: AdditionalIncome['incomeType'] }[] = [
  { name: 'Job Dadakan / Project Tambahan', type: 'freelance' },
  { name: 'Gaji / Upah Tambahan', type: 'freelance' },
  { name: 'Freelance Desain / Web / Content', type: 'freelance' },
  { name: 'Bonus Kinerja / Insentif', type: 'bonus' },
  { name: 'Uang Lembur & Komisi', type: 'lembur' },
  { name: 'Penjualan / Bisnis Online', type: 'bisnis' },
  { name: 'Dividen Saham / Imbal Hasil', type: 'investasi' },
  { name: 'Cashback & Hadiah', type: 'hadiah' },
];

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentMonth,
  onAddIncome,
}) => {
  const [sourceName, setSourceName] = useState('');
  const [incomeType, setIncomeType] = useState<AdditionalIncome['incomeType']>('freelance');
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [allocationMode, setAllocationMode] = useState<AdditionalIncome['allocationMode']>('specific_category');
  const [targetCategoryId, setTargetCategoryId] = useState<string>(() => {
    // Default to saving category if exists, or first category
    const savingCat = categories.find((c) => c.group === 'tabungan');
    return savingCat ? savingCat.id : categories[0]?.id || '';
  });
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = parseRupiahInput(amountInput);

  const handleApplySuggestion = (s: { name: string; type: AdditionalIncome['incomeType'] }) => {
    setSourceName(s.name);
    setIncomeType(s.type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert('Mohon masukkan nominal pemasukan yang valid.');
      return;
    }
    if (!sourceName.trim()) {
      alert('Mohon isi nama sumber pemasukan.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === targetCategoryId);

    onAddIncome({
      sourceName: sourceName.trim(),
      incomeType,
      amount: parsedAmount,
      date,
      notes: notes.trim() || undefined,
      receiptImage: receiptImage || undefined,
      allocationMode,
      targetCategoryId: allocationMode === 'specific_category' ? targetCategoryId : undefined,
      targetCategoryName: allocationMode === 'specific_category' ? selectedCategory?.name : undefined,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    // Reset & close
    setSourceName('');
    setAmountInput('');
    setNotes('');
    setReceiptImage(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Catat Pemasukan Tambahan
              </h2>
              <p className="text-xs text-slate-500">
                Tambahkan penghasilan di luar gaji (freelance, bonus, dividen, dll)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Suggestions Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Saran Cepat Sumber Pemasukan:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySuggestion(s)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                >
                  + {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Source Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Nama Sumber Pemasukan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Proyek Desain Logo, Bonus Akhir Kuartal, Dividen Saham..."
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Income Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Kategori Jenis Pemasukan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INCOME_TYPE_OPTIONS.map((opt) => {
                const isSelected = incomeType === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIncomeType(opt.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: opt.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] truncate leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nominal Input & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nominal Pemasukan (Rp) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="0"
                  value={amountInput ? new Intl.NumberFormat('id-ID').format(parsedAmount) : ''}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full pl-11 pr-3 py-2.5 text-base font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Tanggal Diterima
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Allocation Options */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pilihan Alokasi Pemasukan Ini:
            </label>

            <div className="space-y-2">
              {/* Option 1: Add to a specific category */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="income_allocation"
                  checked={allocationMode === 'specific_category'}
                  onChange={() => setAllocationMode('specific_category')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Salurkan ke Pos Anggaran Khusus (Direkomendasikan)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Plafon pos terpilih akan bertambah sebesar nominal pemasukan ini (misal: tambah ke pos Tabungan).
                  </div>

                  {allocationMode === 'specific_category' && (
                    <div className="mt-2.5">
                      <select
                        value={targetCategoryId}
                        onChange={(e) => setTargetCategoryId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Alokasi Saat Ini: {formatRupiah(c.allocatedAmount)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: Proportional across all categories */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="income_allocation"
                  checked={allocationMode === 'proportional'}
                  onChange={() => setAllocationMode('proportional')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-indigo-600" />
                    Bagi Rata ke Seluruh Pos Anggaran (Proporsional)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mendistribusikan pemasukan tambahan ini ke semua pos sesuai persentase yang telah diatur.
                  </div>
                </div>
              </label>

              {/* Option 3: Unallocated cash surplus */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="income_allocation"
                  checked={allocationMode === 'unallocated_surplus'}
                  onChange={() => setAllocationMode('unallocated_surplus')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-600" />
                    Simpan Sebagai Kas Bebas (Surplus)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Menambah total saldo kas tersisa tanpa mengubah limit belanja pos anggaran.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Transfer dari klien PT ABC, sisa pembayaran termin 2..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Receipt / Transfer Proof Upload Section */}
          <ReceiptUpload
            receiptImage={receiptImage}
            onChange={setReceiptImage}
            label="Unggah Bukti Transfer / Invoice / Struk (Opsional)"
            sublabel="Lampirkan tangkapan layar transfer m-banking atau invoice pembayaran agar arsip transaksi aman"
            onPreviewFull={() => setIsPreviewOpen(true)}
          />

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-100 dark:shadow-none hover:shadow-emerald-200 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Pemasukan
            </button>
          </div>
        </form>
      </div>

      {/* Full Preview Lightbox Modal */}
      <ReceiptViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={receiptImage}
        title={sourceName || 'Bukti Pemasukan'}
        amount={parsedAmount}
        date={date}
        isIncome={true}
      />
    </div>
  );
};
