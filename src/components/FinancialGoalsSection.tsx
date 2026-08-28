import React, { useState } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
  History,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
  PiggyBank,
  CheckSquare,
  Square,
  Check,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { FinancialGoal, Category, GoalContribution } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { formatRupiah, calculateGoalStats, formatIndonesianDate } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface FinancialGoalsSectionProps {
  goals: FinancialGoal[];
  categories: Category[];
  currentMonth: string;
  onOpenCreateGoalModal: () => void;
  onOpenEditGoalModal: (goal: FinancialGoal) => void;
  onOpenContributionModal: (goal: FinancialGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onDeleteContribution?: (goalId: string, contributionId: string) => void;
  onBulkDeleteGoals?: (goalIds: string[]) => void;
  onBulkCompleteGoals?: (goalIds: string[]) => void;
}

export const FinancialGoalsSection: React.FC<FinancialGoalsSectionProps> = ({
  goals = [],
  categories = [],
  currentMonth,
  onOpenCreateGoalModal,
  onOpenEditGoalModal,
  onOpenContributionModal,
  onDeleteGoal,
  onDeleteContribution,
  onBulkDeleteGoals,
  onBulkCompleteGoals,
}) => {
  const [selectedGoalHistory, setSelectedGoalHistory] = useState<FinancialGoal | null>(null);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{
    imageUrl: string;
    title: string;
    amount: number;
    date: string;
    categoryName?: string;
  } | null>(null);

  // Overall Goal Metrics
  const totalTargetAmount = (goals || []).reduce((sum, g) => sum + (g?.targetAmount || 0), 0);
  const totalCurrentAmount = (goals || []).reduce((sum, g) => sum + (g?.currentAmount || 0), 0);
  const overallPercentage = totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0;
  const completedGoalsCount = (goals || []).filter((g) => g && g.currentAmount >= g.targetAmount).length;

  const isAllGoalsSelected = (goals || []).length > 0 && selectedGoalIds.length === (goals || []).length;

  const handleToggleSelectAll = () => {
    if (isAllGoalsSelected) {
      setSelectedGoalIds([]);
    } else {
      setSelectedGoalIds((goals || []).map((g) => g.id));
    }
  };

  const handleToggleGoal = (goalId: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleExecuteBulkDelete = () => {
    if (selectedGoalIds.length === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDeleteAction = () => {
    if (onBulkDeleteGoals) {
      onBulkDeleteGoals(selectedGoalIds);
    } else {
      selectedGoalIds.forEach((id) => onDeleteGoal(id));
    }
    setSelectedGoalIds([]);
  };

  const handleExecuteBulkComplete = () => {
    if (selectedGoalIds.length === 0) return;
    if (onBulkCompleteGoals) {
      onBulkCompleteGoals(selectedGoalIds);
      setSelectedGoalIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            Target Finansial & Tabungan ({goals.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lacak impian tabungan, investasi, dan progres pencapaian target keuangan Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {goals.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`text-xs px-3 py-2 rounded-2xl font-bold transition-all border flex items-center gap-1.5 ${
                isAllGoalsSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {isAllGoalsSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>{isAllGoalsSelected ? 'Hapus Centang' : 'Centang Semua'}</span>
            </button>
          )}

          <button
            onClick={onOpenCreateGoalModal}
            className="text-xs px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Target Baru</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar when Goals are checked */}
      {selectedGoalIds.length > 0 && (
        <div className="p-3.5 bg-indigo-900 text-white rounded-2xl shadow-lg border border-indigo-800 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
              {selectedGoalIds.length}
            </span>
            <span className="font-bold text-xs">
              {selectedGoalIds.length} Target Finansial Dicentang
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onBulkCompleteGoals && (
              <button
                type="button"
                onClick={handleExecuteBulkComplete}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Tercapai (100%)
              </button>
            )}

            <button
              type="button"
              onClick={handleExecuteBulkDelete}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Tercentang ({selectedGoalIds.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoalIds([])}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80"
              title="Batal Centang"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Bento Header Card (if goals exist) */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Total Terkumpul vs Target */}
          <div className="bg-[#111C30] p-4 rounded-3xl border border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Dana Terkumpul
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white">
              {formatRupiah(totalCurrentAmount)}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Dari total target {formatRupiah(totalTargetAmount)}
            </p>
          </div>

          {/* Card 2: Rata-rata Progres */}
          <div className="bg-[#111C30] p-4 rounded-3xl border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Progres Keseluruhan</span>
              <span className="font-mono text-indigo-400">{overallPercentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {completedGoalsCount} dari {goals.length} target telah tercapai
            </p>
          </div>

          {/* Card 3: Rekomendasi Alokasi Tabungan Bulanan */}
          <div className="bg-[#111C30] p-4 rounded-3xl border border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Kebutuhan Tabung Bulanan
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400">
              {formatRupiah(
                goals
                  .filter((g) => g.currentAmount < g.targetAmount)
                  .reduce((sum, g) => {
                    const stats = calculateGoalStats(g.currentAmount, g.targetAmount, g.targetDate);
                    return sum + stats.monthlyRecommendation;
                  }, 0)
              )}
            </div>
            <p className="text-xs text-slate-400">
              Untuk mencapai semua target tepat waktu
            </p>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        /* Empty State */
        <div className="bg-[#111C30] p-8 sm:p-12 rounded-3xl border border-dashed border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-indigo-950 text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <PiggyBank className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Belum Ada Target Finansial
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Mulai rencanakan target keuangan seperti Dana Darurat, Tabungan Rumah, Liburan, atau Investasi. Aplikasi akan membantu melacak progres dan rekomendasi setoran bulanan Anda.
            </p>
          </div>
          <button
            onClick={onOpenCreateGoalModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Target Pertama Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {goals.map((goal) => {
            const stats = calculateGoalStats(goal.currentAmount, goal.targetAmount, goal.targetDate);
            const isCompleted = stats.isCompleted;
            const isSelected = selectedGoalIds.includes(goal.id);

            return (
              <div
                key={goal.id}
                className={`bg-[#111C30] rounded-3xl p-5 border transition-all duration-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20'
                    : isCompleted
                    ? 'border-emerald-900/60'
                    : stats.isOverdue
                    ? 'border-rose-900/60'
                    : 'border-slate-800'
                }`}
              >
                {/* Card Top: Checkbox, Icon, Name, Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-700 bg-[#0B1120] hover:border-indigo-400'
                        }`}
                        title="Centang Target Ini"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: goal.color || '#4f46e5' }}
                      >
                        <DynamicIcon name={goal.icon || 'Target'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1">
                          {goal.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatIndonesianDate(goal.targetDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" /> Tercapai
                        </span>
                      ) : stats.isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-950 text-rose-300 border border-rose-800/60">
                          <AlertCircle className="w-3 h-3" /> Lewat Deadline
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                          <Clock className="w-3 h-3" /> {stats.remainingMonths} bln lagi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description / Category link */}
                  {(goal.description || goal.categoryName) && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 bg-[#0B1120] px-2.5 py-1 rounded-xl border border-slate-800">
                      {goal.categoryName && (
                        <span className="font-semibold text-indigo-400 mr-1.5">
                          Pos: {goal.categoryName} ·
                        </span>
                      )}
                      {goal.description || 'Target terhubung pos tabungan'}
                    </div>
                  )}

                  {/* Numbers & Progress Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold block">
                          Terkumpul
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-white">
                          {formatRupiah(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 uppercase font-bold block">
                          Target
                        </span>
                        <span className="text-sm sm:text-base font-bold font-mono text-slate-400">
                          {formatRupiah(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${Math.max(3, stats.percentage)}%`,
                          backgroundColor: isCompleted ? '#059669' : goal.color || '#4f46e5',
                        }}
                      />
                    </div>

                    {/* Progress stats footer */}
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>
                        Progres: <b className="text-white">{stats.percentage}%</b>
                      </span>
                      <span>
                        {isCompleted ? (
                          <b className="text-emerald-400">Target Terpenuhi 🎉</b>
                        ) : (
                          <>
                            Kurang <b className="font-mono text-slate-200">{formatRupiah(stats.remainingAmount)}</b>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Recommendation Pill */}
                  {!isCompleted && stats.monthlyRecommendation > 0 && (
                    <div className="p-2.5 rounded-2xl bg-indigo-950/50 border border-indigo-800/60 flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Saran Nabung:
                      </span>
                      <span className="font-bold font-mono text-indigo-300">
                        {formatRupiah(stats.monthlyRecommendation)} / bln
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditGoalModal(goal)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Edit Target"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedGoalHistory(goal)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/50 transition-colors"
                      title="Riwayat Setoran"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenContributionModal(goal)}
                    className="px-3.5 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Setor Dana</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Contribution History Modal */}
      {selectedGoalHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-2xl text-white shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: selectedGoalHistory.color || '#4f46e5' }}
                >
                  <DynamicIcon name={selectedGoalHistory.icon || 'Target'} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Riwayat Setoran: {selectedGoalHistory.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Total Terkumpul: {formatRupiah(selectedGoalHistory.currentAmount)} / {formatRupiah(selectedGoalHistory.targetAmount)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGoalHistory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {!selectedGoalHistory.contributions || selectedGoalHistory.contributions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Belum ada riwayat setoran terperinci untuk target ini.
                </div>
              ) : (
                selectedGoalHistory.contributions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          +{formatRupiah(c.amount)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                          {c.sourceType === 'category_savings' ? `Pos: ${c.sourceCategoryName || 'Tabungan'}` : 'Setoran Mandiri'}
                        </span>
                        {c.receiptImage && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewReceipt({
                                imageUrl: c.receiptImage!,
                                title: `Bukti Setoran: ${selectedGoalHistory.name}`,
                                amount: c.amount,
                                date: c.date,
                                categoryName: selectedGoalHistory.name,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 hover:bg-indigo-200 dark:hover:bg-indigo-900 border border-indigo-300 dark:border-indigo-700/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                            title="Lihat foto bukti transfer/setoran"
                          >
                            <ImageIcon className="w-3 h-3 text-indigo-500" />
                            <span>Lihat Bukti</span>
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {formatIndonesianDate(c.date)} {c.notes && `· ${c.notes}`}
                      </div>
                    </div>

                    {onDeleteContribution && (
                      <button
                        onClick={() => onDeleteContribution(selectedGoalHistory.id, c.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus Catatan Setoran Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex justify-between items-center">
              <button
                onClick={() => {
                  const g = selectedGoalHistory;
                  setSelectedGoalHistory(null);
                  onOpenContributionModal(g);
                }}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Setoran Sekarang
              </button>

              <button
                onClick={() => setSelectedGoalHistory(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-750"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bulk Delete Goals Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDeleteAction}
        title="Hapus Target Finansial Terpilih"
        message={`Apakah Anda yakin ingin menghapus ${selectedGoalIds.length} target finansial yang dicentang?`}
        confirmText="Hapus Semua"
      />

      {/* Receipt Viewer Lightbox */}
      <ReceiptViewerModal
        isOpen={!!previewReceipt}
        onClose={() => setPreviewReceipt(null)}
        imageUrl={previewReceipt?.imageUrl}
        title={previewReceipt?.title}
        amount={previewReceipt?.amount}
        date={previewReceipt?.date}
        categoryName={previewReceipt?.categoryName}
      />
    </div>
  );
};
