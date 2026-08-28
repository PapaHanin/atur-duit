import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  DollarSign,
  PieChart,
  Sparkles,
  Edit3,
  Plus,
  Layers,
  Wallet,
} from 'lucide-react';
import { Category, Expense, AdditionalIncome } from '../types';
import { formatRupiah, calculateCategorySpent, getRemainingDaysInMonth } from '../utils/formatters';

interface BudgetSummaryStatsProps {
  totalIncome: number;
  baseSalary: number;
  additionalIncomes?: AdditionalIncome[];
  categories: Category[];
  expenses: Expense[];
  monthKey: string;
  onEditSalary: () => void;
  onOpenCategoryManager: () => void;
  onOpenAddIncome: () => void;
  onOpenIncomeManager: () => void;
}

export const BudgetSummaryStats: React.FC<BudgetSummaryStatsProps> = ({
  totalIncome,
  baseSalary,
  additionalIncomes = [],
  categories = [],
  expenses = [],
  monthKey,
  onEditSalary,
  onOpenCategoryManager,
  onOpenAddIncome,
  onOpenIncomeManager,
}) => {
  const totalAdditional = (additionalIncomes || []).reduce((sum, item) => sum + (item?.amount || 0), 0);
  const totalAllocated = (categories || []).reduce((sum, c) => sum + (c?.allocatedAmount || 0), 0);
  const totalSpent = (expenses || []).reduce((sum, e) => sum + (e?.amount || 0), 0);
  const totalRemaining = totalIncome - totalSpent;
  const spentPercentage = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

  const remainingDays = getRemainingDaysInMonth(monthKey);
  
  // Daily safe spend: only consider non-tabungan remaining balance or total remaining
  const nonSavingRemaining = (categories || [])
    .filter((c) => c && c.group !== 'tabungan')
    .reduce((sum, c) => {
      const spent = calculateCategorySpent(c.id, expenses);
      return sum + Math.max(0, c.allocatedAmount - spent);
    }, 0);

  const safeDailySpend = remainingDays > 0 ? Math.floor(nonSavingRemaining / remainingDays) : 0;

  // Global Health Status
  let healthLabel = 'Keuangan Aman (Surplus)';
  let healthStatusType: 'safe' | 'warning' | 'danger' = 'safe';
  let statusDotClass = 'bg-emerald-500';
  let statusTextClass = 'text-emerald-700 dark:text-emerald-300';
  let statusBgClass = 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/60';

  if (spentPercentage >= 100 || totalRemaining < 0) {
    healthLabel = 'Defisit / Boncos Melebihi Pemasukan';
    healthStatusType = 'danger';
    statusDotClass = 'bg-rose-500';
    statusTextClass = 'text-rose-700 dark:text-rose-300';
    statusBgClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60';
  } else if (spentPercentage >= 85) {
    healthLabel = 'Kondisi Kritis (>85% Terpakai)';
    healthStatusType = 'danger';
    statusDotClass = 'bg-rose-500';
    statusTextClass = 'text-rose-700 dark:text-rose-300';
    statusBgClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60';
  } else if (spentPercentage >= 70) {
    healthLabel = 'Perlu Waspada (70% - 85% Terpakai)';
    healthStatusType = 'warning';
    statusDotClass = 'bg-amber-500';
    statusTextClass = 'text-amber-700 dark:text-amber-300';
    statusBgClass = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60';
  }

  return (
    <div className="space-y-4">
      {/* Bento Row: Top Highlights & Wallet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Bento: Dompet & Health Status Tile (Span 5) */}
        <div className="lg:col-span-5 bg-[#111C30] rounded-3xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
                Status Dompet & Pemasukan
              </h2>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAddIncome}
                  id="dashboard-add-income-btn"
                  className="text-xs font-bold text-emerald-200 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-emerald-950/60 active:scale-95 group"
                  title="Tambah Job Dadakan, Gaji Tambahan, Freelance, Bonus, atau THR"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-125 transition-transform" />
                  <span>+ Job / Pemasukan</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Pemasukan Bulan Ini
                </p>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                  {formatRupiah(totalIncome)}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={onOpenIncomeManager}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#0B1120] hover:bg-[#16233B] text-slate-300 border border-slate-800 transition-colors flex items-center gap-1"
                  title="Lihat Rincian Sumber Pemasukan"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  Rincian
                </button>
                <button
                  onClick={onOpenCategoryManager}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#0B1120] hover:bg-[#16233B] text-slate-300 border border-slate-800 transition-colors flex items-center gap-1"
                  title="Kelola Pos Anggaran"
                >
                  <PieChart className="w-3.5 h-3.5 text-indigo-400" />
                  Atur Pos
                </button>
              </div>
            </div>

            {/* Income Streams Breakdown Micro-Bar */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Gaji Pokok:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatRupiah(baseSalary)}
                </span>
                <button
                  onClick={onEditSalary}
                  className="text-[11px] text-indigo-400 hover:underline ml-0.5"
                  title="Ubah Gaji Pokok"
                >
                  (Ubah)
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Lainnya:</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{formatRupiah(totalAdditional)}
                </span>
                {additionalIncomes.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                    {additionalIncomes.length} item
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-2xl p-4 sm:p-4.5 border transition-all ${statusBgClass}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Indikator Arus Kas
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${statusDotClass} animate-pulse`}></div>
                <span className={`text-xs font-bold ${statusTextClass}`}>{healthLabel}</span>
              </div>
            </div>
            
            <div className="mt-2.5 h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  healthStatusType === 'danger'
                    ? 'bg-rose-500'
                    : healthStatusType === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs mt-2 font-medium">
              <span className="text-slate-400">
                {spentPercentage.toFixed(1)}% budget terpakai
              </span>
              <span className="text-slate-400 text-[11px]">
                {expenses.length} transaksi tercatat
              </span>
            </div>
          </div>
        </div>

        {/* Right Bento: 3 Multi-stat Tiles (Span 7) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Saldo Tersisa (Hero Pill Style) */}
          <div className="bg-[#111C30] rounded-3xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Sisa Saldo Kas
                </p>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                  totalRemaining >= 0 ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                }`}>
                  {totalRemaining >= 0 ? 'Tersisa' : 'Defisit'}
                </span>
              </div>
              <p className={`text-xl sm:text-2xl font-mono font-bold tracking-tight mt-1 truncate ${
                totalRemaining >= 0 ? 'text-white' : 'text-rose-400'
              }`}>
                {formatRupiah(totalRemaining)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Porsi Aman:</span>
              <span className="font-bold text-emerald-400">
                {totalIncome > 0 ? `${(100 - spentPercentage).toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Total Terpakai */}
          <div className="bg-[#111C30] rounded-3xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Total Terpakai
                </p>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#0B1120] text-slate-300 border border-slate-800">
                  {spentPercentage.toFixed(0)}%
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight mt-1 truncate">
                {formatRupiah(totalSpent)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Dari Target:</span>
              <span className="font-semibold text-slate-200">
                {formatRupiah(totalAllocated)}
              </span>
            </div>
          </div>

          {/* Kuota Belanja Harian (Bento Dark Style - Exact User Screenshot Match) */}
          <div className="bg-[#0E1726] text-white rounded-3xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> BATAS HARIAN
                </p>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-800/80">
                  {remainingDays} Hari
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight mt-1 truncate">
                {formatRupiah(safeDailySpend)}
                <span className="text-xs font-normal text-slate-400 ml-1">/hari</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Batas Non-Tabungan</span>
              <span className="text-emerald-400 font-medium">Biar Gak Boncos</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
