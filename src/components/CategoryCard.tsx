import React from 'react';
import { Plus, Edit2, AlertCircle, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';
import { Category, Expense } from '../types';
import { formatRupiah, calculateCategorySpent, getCategoryHealth } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';

interface CategoryCardProps {
  category: Category;
  expenses: Expense[];
  onQuickSpend: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  expenses,
  onQuickSpend,
  onEditCategory,
  onDeleteCategory,
}) => {
  const spent = calculateCategorySpent(category.id, expenses);
  const health = getCategoryHealth(spent, category.allocatedAmount);

  // Group label helper
  const groupLabelMap: Record<string, string> = {
    kewajiban: 'Kewajiban & Hutang',
    pokok: 'Kebutuhan Pokok',
    keinginan: 'Keinginan / Lifestyle',
    tabungan: 'Tabungan & Investasi',
    lainnya: 'Lain-lain',
  };

  // Bento Badge Colors & Text
  let badgeClasses = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300';
  let badgeLabel = 'Aman';
  let progressBg = 'bg-emerald-500';
  let remainingColor = 'text-emerald-600 dark:text-emerald-400';

  if (health.health === 'overbudget') {
    badgeClasses = 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300';
    badgeLabel = 'Overbudget';
    progressBg = 'bg-rose-500';
    remainingColor = 'text-rose-600 dark:text-rose-400';
  } else if (health.health === 'danger') {
    badgeClasses = 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300';
    badgeLabel = 'Kritis';
    progressBg = 'bg-rose-500';
    remainingColor = 'text-rose-600 dark:text-rose-400';
  } else if (health.health === 'warning') {
    badgeClasses = 'bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300';
    badgeLabel = 'Waspada';
    progressBg = 'bg-amber-500';
    remainingColor = 'text-amber-600 dark:text-amber-400';
  } else if (category.group === 'tabungan') {
    badgeClasses = 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300';
    badgeLabel = 'Target';
    progressBg = 'bg-indigo-500';
    remainingColor = 'text-indigo-600 dark:text-indigo-400';
  }

  return (
    <div className="bg-[#111C30] rounded-3xl border border-slate-800 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-700 hover:shadow-lg transition-all group">
      
      {/* Top Content */}
      <div>
        {/* Header with Group Title & Bento Badge */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: category.color || '#4f46e5' }}
              >
                <DynamicIcon name={category.icon} className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter truncate">
                {groupLabelMap[category.group] || category.name}
              </p>
            </div>
            <h3 className="text-xl font-bold text-white mt-2 truncate">
              {formatRupiah(category.allocatedAmount)}{' '}
              <span className="text-sm font-normal text-slate-400">({category.percentage}%)</span>
            </h3>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">
              {category.name}
            </p>
          </div>

          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase shrink-0 ${badgeClasses}`}>
            {badgeLabel}
          </span>
        </div>

        {/* Real-time Progress Bar */}
        <div className="mt-4 mb-2">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressBg} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(health.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Bento Stats Matrix */}
        <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-800/80 mb-3">
          <span className="text-slate-400 text-xs">
            {health.remaining >= 0 ? 'Sisa Saldo' : 'Minus'}
          </span>
          <span className={`font-bold font-mono ${remainingColor}`}>
            {formatRupiah(health.remaining)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
          <span>Terpakai: {formatRupiah(spent)}</span>
          <span>{health.percentage.toFixed(0)}% budget</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
        <button
          id={`cat-quick-spend-${category.id}`}
          type="button"
          onClick={() => onQuickSpend(category)}
          className="flex-1 py-2 px-3 rounded-xl bg-[#0B1120] hover:bg-[#16233B] text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-800"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat di Pos Ini</span>
        </button>

        <button
          id={`cat-edit-${category.id}`}
          type="button"
          onClick={() => onEditCategory(category)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Edit Pos Anggaran"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {category.isCustom && (
          <button
            id={`cat-delete-${category.id}`}
            type="button"
            onClick={() => onDeleteCategory(category.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Hapus Kategori"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
