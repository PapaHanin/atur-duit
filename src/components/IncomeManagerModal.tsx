import React, { useState } from 'react';
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
  Trash2,
  Calendar,
  Layers,
  PieChart,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Check,
  Edit3,
} from 'lucide-react';
import { AdditionalIncome, Category } from '../types';
import { formatRupiah, formatIndonesianDate, formatMonthYearTitle } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';

interface IncomeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseSalary: number;
  additionalIncomes: AdditionalIncome[];
  monthKey: string;
  categories: Category[];
  onOpenAddIncomeModal: () => void;
  onOpenSalaryEditModal: () => void;
  onOpenEditIncome?: (income: AdditionalIncome) => void;
  onDeleteIncome: (incomeId: string) => void;
  onBulkDeleteIncomes?: (incomeIds: string[]) => void;
}

const INCOME_TYPE_ICONS: Record<string, { icon: any; color: string; label: string }> = {
  freelance: { icon: Briefcase, color: '#4f46e5', label: 'Freelance & Proyek' },
  bonus: { icon: Gift, color: '#059669', label: 'Bonus & THR' },
  bisnis: { icon: Store, color: '#d97706', label: 'Bisnis & Jualan' },
  investasi: { icon: TrendingUp, color: '#0891b2', label: 'Dividen & Investasi' },
  lembur: { icon: Clock, color: '#7c3aed', label: 'Lembur & Komisi' },
  hadiah: { icon: Sparkles, color: '#db2777', label: 'Hadiah & Cashback' },
  lainnya: { icon: DollarSign, color: '#64748b', label: 'Pemasukan Lainnya' },
};

export const IncomeManagerModal: React.FC<IncomeManagerModalProps> = ({
  isOpen,
  onClose,
  baseSalary,
  additionalIncomes = [],
  monthKey,
  categories = [],
  onOpenAddIncomeModal,
  onOpenSalaryEditModal,
  onOpenEditIncome,
  onDeleteIncome,
  onBulkDeleteIncomes,
}) => {
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<string[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const totalAdditional = (additionalIncomes || []).reduce((sum, item) => sum + (item?.amount || 0), 0);
  const totalCombinedIncome = baseSalary + totalAdditional;

  const isAllSelected = (additionalIncomes || []).length > 0 && selectedIncomeIds.length === (additionalIncomes || []).length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIncomeIds([]);
    } else {
      setSelectedIncomeIds((additionalIncomes || []).map((i) => i.id));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedIncomeIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkDelete = () => {
    if (selectedIncomeIds.length === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDeleteAction = () => {
    if (onBulkDeleteIncomes) {
      onBulkDeleteIncomes(selectedIncomeIds);
    } else {
      selectedIncomeIds.forEach((id) => onDeleteIncome(id));
    }
    setSelectedIncomeIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Rincian Sumber Pemasukan
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  {formatMonthYearTitle(monthKey)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kelola gaji pokok dan seluruh sumber pemasukan tambahan dengan fitur centang & edit.
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

        {/* Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Top Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Income */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                Total Pemasukan Bulan Ini
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {formatRupiah(totalCombinedIncome)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {1 + additionalIncomes.length} Sumber Pendapatan
              </span>
            </div>

            {/* Gaji Pokok */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Gaji Pokok Bulanan
                </span>
                <div className="text-base sm:text-lg font-bold font-mono text-slate-800 dark:text-white">
                  {formatRupiah(baseSalary)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSalaryEditModal();
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mt-2 self-start"
              >
                Ubah Gaji Pokok →
              </button>
            </div>

            {/* Pemasukan Tambahan */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block mb-1">
                  Pemasukan Tambahan
                </span>
                <div className="text-base sm:text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  +{formatRupiah(totalAdditional)}
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">
                {additionalIncomes.length} transaksi sampingan
              </span>
            </div>
          </div>

          {/* Bulk Action Bar when items are checked */}
          {selectedIncomeIds.length > 0 && (
            <div className="p-3.5 bg-emerald-900 text-white rounded-2xl shadow-lg border border-emerald-800 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-150">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                  {selectedIncomeIds.length}
                </span>
                <span className="font-bold text-xs">
                  {selectedIncomeIds.length} Pemasukan Dicentang
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExecuteBulkDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Tercentang ({selectedIncomeIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIncomeIds([])}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-white/80"
                  title="Batal Centang"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* List of Income Sources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Daftar Sumber Pemasukan
                </h4>
                {additionalIncomes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800"
                  >
                    {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    {isAllSelected ? 'Hapus Centang' : 'Centang Semua'}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddIncomeModal();
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                + Catat Pemasukan
              </button>
            </div>

            {/* Primary Salary Row */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Gaji Pokok (Take Home Pay)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      Gaji Utama
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sumber anggaran utama bulan {formatMonthYearTitle(monthKey)}
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white">
                  {formatRupiah(baseSalary)}
                </div>
              </div>
            </div>

            {/* Additional Incomes List */}
            {additionalIncomes.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Belum ada pemasukan tambahan yang dicatat untuk bulan ini.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddIncomeModal();
                  }}
                  className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Catat penghasilan freelance, bonus, dividen, dll.
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {additionalIncomes.map((income) => {
                  const typeConfig = INCOME_TYPE_ICONS[income.incomeType] || INCOME_TYPE_ICONS.lainnya;
                  const Icon = typeConfig.icon;
                  const isSelected = selectedIncomeIds.includes(income.id);

                  let allocationText = 'Alokasi: Kas Bebas (Surplus)';
                  if (income.allocationMode === 'specific_category') {
                    allocationText = `Alokasi: Masuk Pos "${income.targetCategoryName || 'Pos Khusus'}"`;
                  } else if (income.allocationMode === 'proportional') {
                    allocationText = 'Alokasi: Dibagi Rata ke Seluruh Pos';
                  }

                  return (
                    <div
                      key={income.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-1 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleItem(income.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-400'
                          }`}
                          title="Centang Pemasukan Ini"
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: typeConfig.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {income.sourceName}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md font-semibold text-white shrink-0"
                              style={{ backgroundColor: typeConfig.color }}
                            >
                              {typeConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatIndonesianDate(income.date)}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                              {allocationText}
                            </span>
                          </div>
                          {income.notes && (
                            <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                              "{income.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            +{formatRupiah(income.amount)}
                          </div>
                        </div>

                        {/* Edit Button */}
                        {onOpenEditIncome && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenEditIncome(income);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition-colors"
                            title="Edit Pemasukan Ini"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onDeleteIncome(income.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                          title="Hapus catatan pemasukan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
          
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAddIncomeModal();
            }}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 dark:shadow-none active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tambah Pemasukan Baru
          </button>
        </div>
      </div>

      {/* Confirm Bulk Delete Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDeleteAction}
        title="Hapus Pemasukan Terpilih"
        message={`Apakah Anda yakin ingin menghapus ${selectedIncomeIds.length} pemasukan tambahan yang dicentang?`}
        confirmText="Hapus Semua"
      />
    </div>
  );
};
