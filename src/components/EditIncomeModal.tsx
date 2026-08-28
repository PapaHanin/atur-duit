import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, Check, Trash2, Briefcase, Gift, TrendingUp, Store, Clock, Sparkles } from 'lucide-react';
import { AdditionalIncome, Category } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { ReceiptUpload } from './ReceiptUpload';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  income: AdditionalIncome | null;
  categories: Category[];
  onSaveIncome: (updatedIncome: AdditionalIncome) => void;
  onDeleteIncome?: (id: string) => void;
}

const INCOME_TYPES = [
  { id: 'freelance', label: 'Freelance & Proyek', icon: Briefcase, color: '#4f46e5' },
  { id: 'bonus', label: 'Bonus, THR & Insentif', icon: Gift, color: '#059669' },
  { id: 'bisnis', label: 'Bisnis & Jualan Sampingan', icon: Store, color: '#d97706' },
  { id: 'investasi', label: 'Dividen, Bunga & Investasi', icon: TrendingUp, color: '#0891b2' },
  { id: 'lembur', label: 'Uang Lembur & Komisi', icon: Clock, color: '#7c3aed' },
  { id: 'hadiah', label: 'Hadiah, Cashback & Lainnya', icon: Sparkles, color: '#db2777' },
  { id: 'lainnya', label: 'Pemasukan Lainnya', icon: DollarSign, color: '#64748b' },
] as const;

export const EditIncomeModal: React.FC<EditIncomeModalProps> = ({
  isOpen,
  onClose,
  income,
  categories = [],
  onSaveIncome,
  onDeleteIncome,
}) => {
  const [sourceName, setSourceName] = useState('');
  const [incomeType, setIncomeType] = useState<AdditionalIncome['incomeType']>('freelance');
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [allocationMode, setAllocationMode] = useState<AdditionalIncome['allocationMode']>('unallocated_surplus');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (income) {
      setSourceName(income.sourceName);
      setIncomeType(income.incomeType);
      setAmountInput(income.amount.toString());
      setDate(income.date);
      setNotes(income.notes || '');
      setAllocationMode(income.allocationMode || 'unallocated_surplus');
      setTargetCategoryId(income.targetCategoryId || (categories[0]?.id || ''));
      setReceiptImage(income.receiptImage);
    }
  }, [income, categories]);

  if (!isOpen || !income) return null;

  const parsedAmount = parseRupiahInput(amountInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || !sourceName.trim()) return;

    const targetCat = (categories || []).find((c) => c.id === targetCategoryId);

    onSaveIncome({
      ...income,
      sourceName: sourceName.trim(),
      incomeType,
      amount: parsedAmount,
      date,
      notes: notes.trim() || undefined,
      receiptImage: receiptImage || undefined,
      allocationMode,
      targetCategoryId: allocationMode === 'specific_category' ? targetCategoryId : undefined,
      targetCategoryName: allocationMode === 'specific_category' ? targetCat?.name : undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (onDeleteIncome) {
      onDeleteIncome(income.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#111C30] rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Edit Sumber Pemasukan
              </h2>
              <p className="text-xs text-slate-400">
                Ubah nominal atau keterangan pemasukan tambahan.
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
          
          {/* Income Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Jenis Pemasukan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INCOME_TYPES.map((type) => {
                const isSelected = incomeType === type.id;
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIncomeType(type.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/60 ring-2 ring-emerald-500/20 text-white'
                        : 'border-slate-800 bg-[#0B1120] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: type.color }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold truncate">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nominal Pemasukan *
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
                className="w-full pl-12 pr-4 py-3 bg-[#0B1120] border border-slate-800 rounded-2xl font-bold font-mono text-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Source Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nama / Keterangan Sumber *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Freelance Desain Web"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B1120] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Optional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tanggal Diterima
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B1120] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Catatan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B1120] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Receipt / Transfer Proof Upload Section */}
          <ReceiptUpload
            receiptImage={receiptImage}
            onChange={setReceiptImage}
            label="Unggah Bukti Transfer / Invoice / Struk"
            sublabel="Lampirkan tangkapan layar transfer m-banking atau invoice pembayaran agar arsip transaksi aman"
            onPreviewFull={() => setIsPreviewOpen(true)}
          />

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {onDeleteIncome ? (
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
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition-all active:scale-95 flex items-center gap-1.5"
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
        title={sourceName || 'Bukti Pemasukan'}
        amount={parsedAmount}
        date={date}
        isIncome={true}
      />
    </div>
  );
};
