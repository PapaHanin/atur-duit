import React, { useState, useEffect } from 'react';
import { X, DollarSign, RefreshCw, Check, Sparkles } from 'lucide-react';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { BUDGET_PRESETS } from '../utils/presets';

interface SalaryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIncome: number;
  onUpdateSalary: (newIncome: number, reapplyPresetId?: string) => void;
}

export const SalaryEditModal: React.FC<SalaryEditModalProps> = ({
  isOpen,
  onClose,
  currentIncome,
  onUpdateSalary,
}) => {
  const [incomeInput, setIncomeInput] = useState<string>(currentIncome ? currentIncome.toString() : '');
  const [reapplyMode, setReapplyMode] = useState<'proportional' | 'preset'>('proportional');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standar_seimbang');

  useEffect(() => {
    if (isOpen) {
      setIncomeInput(currentIncome ? currentIncome.toString() : '');
    }
  }, [currentIncome, isOpen]);

  if (!isOpen) return null;

  const parsedAmount = parseRupiahInput(incomeInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    if (reapplyMode === 'preset') {
      onUpdateSalary(parsedAmount, selectedPresetId);
    } else {
      onUpdateSalary(parsedAmount);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Perbarui Gaji Bersih Bulan Ini
              </h2>
              <p className="text-xs text-slate-500">
                Sesuaikan nominal total pendapatan bulanan
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Nominal Gaji Baru (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold font-mono text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={incomeInput ? new Intl.NumberFormat('id-ID').format(parsedAmount) : ''}
                onChange={(e) => setIncomeInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Allocation update options */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Metode Penyesuaian Pos Anggaran:
            </label>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="reapply_mode"
                  checked={reapplyMode === 'proportional'}
                  onChange={() => setReapplyMode('proportional')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Skalakan Proporsional (Sesuai Porsi Saat Ini)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mempertahankan persentase pos yang sudah Anda atur.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="reapply_mode"
                  checked={reapplyMode === 'preset'}
                  onChange={() => setReapplyMode('preset')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Terapkan Ulang Template Formula
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Reset pos kategori ke salah satu formula standar:
                  </div>

                  {reapplyMode === 'preset' && (
                    <select
                      value={selectedPresetId}
                      onChange={(e) => setSelectedPresetId(e.target.value)}
                      className="mt-2.5 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {BUDGET_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            </div>
          </div>

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
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan & Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
