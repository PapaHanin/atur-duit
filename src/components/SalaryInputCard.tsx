import React, { useState } from 'react';
import { Wallet, Sparkles, CheckCircle, ArrowRight, ShieldCheck, Utensils, Receipt, Coffee, PiggyBank } from 'lucide-react';
import { BUDGET_PRESETS } from '../utils/presets';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

interface SalaryInputCardProps {
  onSetSalaryAndPreset: (income: number, presetId: string) => void;
  currentIncome?: number;
}

export const SalaryInputCard: React.FC<SalaryInputCardProps> = ({
  onSetSalaryAndPreset,
  currentIncome = 0,
}) => {
  const [incomeInput, setIncomeInput] = useState<string>(currentIncome > 0 ? currentIncome.toString() : '');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standar_seimbang');

  const parsedAmount = parseRupiahInput(incomeInput);
  const selectedPreset = BUDGET_PRESETS.find((p) => p.id === selectedPresetId) || BUDGET_PRESETS[0];

  const handleQuickAmount = (amount: number) => {
    setIncomeInput(amount.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;
    onSetSalaryAndPreset(parsedAmount, selectedPresetId);
  };

  return (
    <div className="bg-[#111C30] rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-10 max-w-3xl mx-auto my-6 transition-all">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-950/70 text-indigo-400 mb-3.5 shadow-sm border border-indigo-900/60">
          <Wallet className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Masukkan Total Gaji Bersih Bulan Ini
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Sistem akan secara otomatis memecah gaji Anda ke 4 pos keuangan utama untuk menjaga arus kas tetap sehat dan mencegah boncos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Salary Input */}
        <div className="bg-[#0B1120] p-6 rounded-2xl border border-slate-800">
          <label htmlFor="salary-main-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Nominal Gaji Bersih (Take Home Pay)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 font-mono">
              Rp
            </span>
            <input
              id="salary-main-input"
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 5.000.000 atau 8.500.000"
              value={incomeInput ? new Intl.NumberFormat('id-ID').format(parsedAmount) : ''}
              onChange={(e) => setIncomeInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-xl sm:text-2xl font-bold font-mono text-white bg-[#0E1726] border-2 border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
              autoFocus
            />
          </div>

          {/* Quick Amount Suggestion Chips */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Pilihan cepat:</span>
            {[3000000, 5000000, 7500000, 10000000, 15000000, 20000000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => handleQuickAmount(quick)}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#0E1726] text-slate-300 border border-slate-800 hover:border-indigo-500 hover:text-indigo-400 transition-colors font-medium shadow-2xs"
              >
                {formatRupiah(quick)}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Pilih Formula Alokasi Otomatis
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BUDGET_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`text-left p-4 rounded-2xl border transition-all relative ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-800 bg-[#0B1120] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {preset.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    )}
                  </div>

                  {/* Percentage tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {preset.allocations.map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-750"
                      >
                        {a.name.split(' ')[0]}: {a.percentage}%
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Auto-Allocation Breakdown Preview */}
        {parsedAmount > 0 && (
          <div className="bg-[#0B1120] p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Pratinjau Pembagian Otomatis ({formatRupiah(parsedAmount)}):
              </span>
              <span className="text-xs text-slate-400">Dapat diedit nanti</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedPreset.allocations.map((item, idx) => {
                const allocated = Math.round((parsedAmount * item.percentage) / 100);
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#0E1726] rounded-xl border border-slate-800 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Porsi: {item.percentage}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {formatRupiah(allocated)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          id="salary-submit-btn"
          type="submit"
          disabled={parsedAmount <= 0}
          className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-950 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span>Terapkan Alokasi Otomatis Sekarang</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
