import React from 'react';
import { AlertTriangle, AlertCircle, Sparkles, TrendingDown, ArrowRight, ShieldAlert } from 'lucide-react';
import { Category, Expense } from '../types';
import { calculateCategorySpent, getCategoryHealth, formatRupiah, getRemainingDaysInMonth } from '../utils/formatters';

interface AntiBoncosAlertsProps {
  categories: Category[];
  expenses: Expense[];
  monthKey: string;
  onOpenCategoryManager: () => void;
  onQuickSpend: (category: Category) => void;
}

export const AntiBoncosAlerts: React.FC<AntiBoncosAlertsProps> = ({
  categories,
  expenses,
  monthKey,
  onOpenCategoryManager,
  onQuickSpend,
}) => {
  const remainingDays = getRemainingDaysInMonth(monthKey);

  // Find all categories in warning, danger, or overbudget state
  const criticalCategories = categories
    .map((cat) => {
      const spent = calculateCategorySpent(cat.id, expenses);
      const health = getCategoryHealth(spent, cat.allocatedAmount);
      const dailyAllowance = remainingDays > 0 ? Math.max(0, Math.floor(health.remaining / remainingDays)) : 0;
      return {
        category: cat,
        spent,
        health,
        dailyAllowance,
      };
    })
    .filter((item) => item.health.health !== 'safe' && item.category.allocatedAmount > 0)
    .sort((a, b) => b.health.percentage - a.health.percentage);

  if (criticalCategories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 my-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Peringatan Anti-Boncos ({criticalCategories.length} Pos Perlu Perhatian)
        </h3>
        <button
          type="button"
          onClick={onOpenCategoryManager}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          Sesuaikan Alokasi Pos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criticalCategories.map(({ category, spent, health, dailyAllowance }) => {
          const isOver = health.health === 'overbudget';
          const isDanger = health.health === 'danger';

          return (
            <div
              key={category.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isOver
                  ? 'bg-rose-950/40 border-rose-800/80 shadow-sm'
                  : isDanger
                  ? 'bg-rose-950/30 border-rose-800/60 shadow-sm'
                  : 'bg-amber-950/30 border-amber-800/60 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        isOver || isDanger
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isOver || isDanger ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {category.name}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Terpakai {health.percentage.toFixed(1)}% ({formatRupiah(spent)} / {formatRupiah(category.allocatedAmount)})
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      isOver
                        ? 'bg-rose-600 text-white'
                        : isDanger
                        ? 'bg-rose-900 text-rose-300'
                        : 'bg-amber-900 text-amber-300'
                    }`}
                  >
                    {health.label}
                  </span>
                </div>

                {/* Anti-Boncos Advice Text */}
                <div className="mt-3.5 text-xs text-slate-300 bg-[#0B1120] p-3.5 rounded-2xl border border-slate-800">
                  {isOver ? (
                    <p className="font-medium text-rose-400 leading-relaxed">
                      🚨 <strong>Dana Habis!</strong> Anda sudah minus {formatRupiah(Math.abs(health.remaining))}. Hindari transaksi tambahan pada pos ini hingga bulan depan.
                    </p>
                  ) : (
                    <p className="leading-relaxed">
                      💡 <strong>Saran Hemat:</strong> Sisa dana {formatRupiah(health.remaining)}. Untuk {remainingDays} hari ke depan, batasi pengeluaran pos ini maksimal <strong>{formatRupiah(dailyAllowance)}/hari</strong> agar tidak boncos.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick action footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-xs text-slate-400">
                  {remainingDays} hari tersisa di bulan ini
                </span>
                <button
                  type="button"
                  onClick={() => onQuickSpend(category)}
                  className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  Catat Transaksi <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
