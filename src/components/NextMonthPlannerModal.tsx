import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Sparkles,
  Copy,
  DollarSign,
  PieChart,
  Check,
  ArrowRight,
  TrendingUp,
  Plus,
  Trash2,
  Layers,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { MonthlyData, Category, FinancialGoal } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { BUDGET_PRESETS, generateCategoriesFromPreset } from '../utils/presets';
import {
  formatRupiah,
  parseRupiahInput,
  getNextMonthKey,
  formatMonthYearTitle,
  calculateCategorySpent,
} from '../utils/formatters';

interface NextMonthPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  currentMonthData: MonthlyData;
  allMonthsData: Record<string, MonthlyData>;
  goals: FinancialGoal[];
  onSaveNextMonthPlan: (
    targetMonthKey: string,
    income: number,
    categories: Category[],
    rolloverSurplus: number,
    notes: string,
    switchToMonthImmediately: boolean
  ) => void;
}

export const NextMonthPlannerModal: React.FC<NextMonthPlannerModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  currentMonthData,
  allMonthsData,
  goals,
  onSaveNextMonthPlan,
}) => {
  const nextMonthDefault = getNextMonthKey(currentMonth);
  const [targetMonth, setTargetMonth] = useState<string>(nextMonthDefault);

  // Form states
  const [incomeInput, setIncomeInput] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [includeSurplusRollover, setIncludeSurplusRollover] = useState<boolean>(false);
  const [planNotes, setPlanNotes] = useState<string>('');

  // Calculate current month's remaining unspent balance (including additional incomes)
  const currentTotalAdditional = (currentMonthData?.additionalIncomes || []).reduce((sum, i) => sum + (i?.amount || 0), 0);
  const currentEffectiveIncome = (currentMonthData?.monthlyIncome || 0) + currentTotalAdditional;
  const currentTotalSpent = (currentMonthData?.expenses || []).reduce((sum, e) => sum + (e?.amount || 0), 0);
  const currentSurplus = Math.max(0, currentEffectiveIncome - currentTotalSpent);

  // Check if target month data already exists
  const existingTargetData = (allMonthsData || {})[targetMonth];

  useEffect(() => {
    if (isOpen) {
      const nMonth = getNextMonthKey(currentMonth);
      setTargetMonth(nMonth);

      // If target month already has data, load it; otherwise clone from current month
      const existing = (allMonthsData || {})[nMonth];
      if (existing && existing.monthlyIncome > 0 && (existing.categories || []).length > 0) {
        setIncomeInput(String(existing.monthlyIncome));
        setCategories((existing.categories || []).map((c) => ({ ...c })));
        setIncludeSurplusRollover(!!existing.surplusRolloverFromPrevMonth);
        setPlanNotes(existing.notesForMonth || '');
      } else {
        // Clone from current month
        setIncomeInput(String(currentMonthData?.monthlyIncome || 0));
        setCategories(
          (currentMonthData?.categories || []).map((c) => ({
            ...c,
            // Deep copy
          }))
        );
        setIncludeSurplusRollover(false);
        setPlanNotes('');
      }
    }
  }, [isOpen, currentMonth, currentMonthData, allMonthsData]);

  // When target month selection changes
  const handleTargetMonthChange = (newMonth: string) => {
    setTargetMonth(newMonth);
    const existing = (allMonthsData || {})[newMonth];
    if (existing && existing.monthlyIncome > 0 && (existing.categories || []).length > 0) {
      setIncomeInput(String(existing.monthlyIncome));
      setCategories((existing.categories || []).map((c) => ({ ...c })));
      setIncludeSurplusRollover(!!existing.surplusRolloverFromPrevMonth);
      setPlanNotes(existing.notesForMonth || '');
    } else {
      setIncomeInput(String(currentMonthData?.monthlyIncome || 0));
      setCategories((currentMonthData?.categories || []).map((c) => ({ ...c })));
      setIncludeSurplusRollover(false);
      setPlanNotes('');
    }
  };

  if (!isOpen) return null;

  const baseIncome = parseRupiahInput(incomeInput);
  const rolloverAmount = includeSurplusRollover ? currentSurplus : 0;
  const effectiveTotalIncome = baseIncome + rolloverAmount;

  // Percentage & Allocation Calculations
  const totalPercentage = categories.reduce((sum, c) => sum + (c.percentage || 0), 0);
  const totalAllocated = categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);

  // Recalculate categories when income changes
  const handleIncomeChange = (val: string) => {
    setIncomeInput(val);
    const newBase = parseRupiahInput(val);
    const newEff = newBase + (includeSurplusRollover ? currentSurplus : 0);

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        allocatedAmount: Math.round((newEff * cat.percentage) / 100),
      }))
    );
  };

  // Toggle surplus rollover
  const handleToggleSurplus = (checked: boolean) => {
    setIncludeSurplusRollover(checked);
    const newEff = baseIncome + (checked ? currentSurplus : 0);

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        allocatedAmount: Math.round((newEff * cat.percentage) / 100),
      }))
    );
  };

  // Adjust category percentage
  const handleCategoryPercentageChange = (catId: string, newPctStr: string) => {
    const newPct = parseFloat(newPctStr) || 0;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            percentage: newPct,
            allocatedAmount: Math.round((effectiveTotalIncome * newPct) / 100),
          };
        }
        return c;
      })
    );
  };

  // Adjust category nominal amount directly
  const handleCategoryNominalChange = (catId: string, valStr: string) => {
    const nominal = parseRupiahInput(valStr);
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          const pct = effectiveTotalIncome > 0 ? Number(((nominal / effectiveTotalIncome) * 100).toFixed(1)) : 0;
          return {
            ...c,
            percentage: pct,
            allocatedAmount: nominal,
          };
        }
        return c;
      })
    );
  };

  // 1-Click: Reset / Re-sync from current month
  const handleCopyFromCurrentMonth = () => {
    setIncomeInput(String(currentMonthData.monthlyIncome));
    setCategories(
      currentMonthData.categories.map((c) => ({
        ...c,
      }))
    );
  };

  // Apply a standard preset for next month
  const handleApplyPreset = (presetId: string) => {
    const preset = BUDGET_PRESETS.find((p) => p.id === presetId) || BUDGET_PRESETS[0];
    const generated = generateCategoriesFromPreset(preset, effectiveTotalIncome);
    setCategories(generated);
  };

  // Save Plan Action
  const handleSavePlan = (switchToMonthImmediately: boolean) => {
    if (baseIncome <= 0) {
      alert('Mohon masukkan perkiraan gaji untuk bulan depan.');
      return;
    }
    if (categories.length === 0) {
      alert('Minimal harus ada 1 pos anggaran.');
      return;
    }

    onSaveNextMonthPlan(
      targetMonth,
      baseIncome,
      categories,
      rolloverAmount,
      planNotes,
      switchToMonthImmediately
    );

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Atur Rencana Bulan Depan
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  {formatMonthYearTitle(targetMonth)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Siapkan alokasi gaji, pos anggaran, dan surplus kas sebelum bulan baru dimulai.
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

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Target Month Picker & Quick Action Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Bulan Target:
              </label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => e.target.value && handleTargetMonthChange(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFromCurrentMonth}
                className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Salin ulang konfigurasi pos dan gaji bulan saat ini"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-600" />
                Salin dari Bulan Ini
              </button>
            </div>
          </div>

          {/* Current Month Surplus / Carry-Over Banner */}
          {currentSurplus > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Sisa Saldo Kas Bulan Ini ({formatMonthYearTitle(currentMonth)}): {formatRupiah(currentSurplus)}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Anda memiliki surplus sisa kas yang belum terpakai di bulan berjalan.
                </p>
              </div>

              <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 cursor-pointer text-xs font-bold text-emerald-900 dark:text-emerald-200 shrink-0">
                <input
                  type="checkbox"
                  checked={includeSurplusRollover}
                  onChange={(e) => handleToggleSurplus(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Rollover Surplus (+{formatRupiah(currentSurplus)})</span>
              </label>
            </div>
          )}

          {/* Planned Salary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Perkiraan Gaji Pokok ({formatMonthYearTitle(targetMonth)}) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold font-mono text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="0"
                  value={incomeInput ? new Intl.NumberFormat('id-ID').format(baseIncome) : ''}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-lg font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Total Anggaran Rencana:
              </span>
              <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {formatRupiah(effectiveTotalIncome)}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {includeSurplusRollover ? `Gaji Pokok + Surplus Bawaan (${formatRupiah(currentSurplus)})` : 'Sesuai gaji pokok bulan depan'}
              </span>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Terapkan Formula Template Anggaran:
            </span>
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p.id)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  {p.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Allocation Tuning */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Penyesuaian Pos Anggaran ({categories.length} Pos)
                </h4>
                <p className="text-xs text-slate-500">
                  Sesuaikan porsi pengeluaran untuk kebutuhan khusus di bulan {formatMonthYearTitle(targetMonth)}.
                </p>
              </div>

              {/* Status total percentage */}
              <div className="text-right">
                <span className="text-xs font-bold block">
                  Total Alokasi:{' '}
                  <span
                    className={
                      totalPercentage === 100
                        ? 'text-emerald-600 font-mono font-bold'
                        : 'text-amber-600 font-mono font-bold'
                    }
                  >
                    {totalPercentage}%
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {formatRupiah(totalAllocated)} / {formatRupiah(effectiveTotalIncome)}
                </span>
              </div>
            </div>

            {/* Visual allocation bar */}
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              {categories.map((c, i) => (
                <div
                  key={c.id || i}
                  style={{
                    width: `${Math.max(0, c.percentage)}%`,
                    backgroundColor: c.color || '#4f46e5',
                  }}
                  className="h-full transition-all"
                  title={`${c.name}: ${c.percentage}%`}
                />
              ))}
            </div>

            {/* Categories List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color || '#4f46e5' }}
                    >
                      <DynamicIcon name={cat.icon || 'ShoppingBag'} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-500 capitalize">
                        Grup: {cat.group}
                      </span>
                    </div>
                  </div>

                  {/* Percentage & Nominal inputs */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="relative w-20">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={cat.percentage}
                        onChange={(e) => handleCategoryPercentageChange(cat.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        %
                      </span>
                    </div>

                    <div className="relative w-36">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={new Intl.NumberFormat('id-ID').format(cat.allocatedAmount || 0)}
                        onChange={(e) => handleCategoryNominalChange(cat.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Month Notes / Priorities */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Catatan Khusus Rencana Bulan Depan
            </label>
            <input
              type="text"
              placeholder="Contoh: Fokus tambah tabungan DP Rumah, antisipasi perpanjang STNK..."
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSavePlan(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan Rencana
            </button>

            <button
              type="button"
              onClick={() => handleSavePlan(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Terapkan & Buka Bulan Depan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
