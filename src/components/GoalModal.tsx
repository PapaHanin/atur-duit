import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign, Sparkles, Check, Link, Info } from 'lucide-react';
import { FinancialGoal, Category } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { parseRupiahInput, formatRupiah, calculateGoalStats } from '../utils/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'contributions'>, goalId?: string) => void;
  editingGoal?: FinancialGoal | null;
  categories: Category[];
}

const GOAL_ICONS = [
  'Target',
  'Shield',
  'Home',
  'Car',
  'Plane',
  'Laptop',
  'Sparkles',
  'Heart',
  'PiggyBank',
  'Briefcase',
  'GraduationCap',
  'ShoppingBag',
];

const GOAL_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#7c3aed', // Purple
  '#ea580c', // Orange
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
  editingGoal,
  categories = [],
}) => {
  const [name, setName] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('');
  const [initialAmountInput, setInitialAmountInput] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [linkedCategoryId, setLinkedCategoryId] = useState('');
  const [icon, setIcon] = useState('Target');
  const [color, setColor] = useState('#4f46e5');
  const [description, setDescription] = useState('');

  // Default target date: 6 months from today
  const getDefaultTargetDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmountInput(String(editingGoal.targetAmount));
      setInitialAmountInput(String(editingGoal.currentAmount));
      setTargetDate(editingGoal.targetDate);
      setLinkedCategoryId(editingGoal.linkedCategoryId || '');
      setIcon(editingGoal.icon || 'Target');
      setColor(editingGoal.color || '#4f46e5');
      setDescription(editingGoal.description || '');
    } else {
      setName('');
      setTargetAmountInput('');
      setInitialAmountInput('');
      setTargetDate(getDefaultTargetDate());
      // Suggest first savings category if available
      const savingsCat = (categories || []).find((c) => c && c.group === 'tabungan');
      setLinkedCategoryId(savingsCat ? savingsCat.id : '');
      setIcon('Target');
      setColor('#4f46e5');
      setDescription('');
    }
  }, [editingGoal, isOpen, categories]);

  if (!isOpen) return null;

  const targetAmount = parseRupiahInput(targetAmountInput);
  const initialAmount = parseRupiahInput(initialAmountInput);

  const previewStats = calculateGoalStats(
    initialAmount,
    targetAmount,
    targetDate || getDefaultTargetDate()
  );

  const savingsCategories = (categories || []).filter((c) => c && (c.group === 'tabungan' || c.group === 'lainnya'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Mohon masukkan nama target finansial.');
      return;
    }
    if (targetAmount <= 0) {
      alert('Mohon masukkan nominal target yang valid.');
      return;
    }
    if (!targetDate) {
      alert('Mohon tentukan tanggal target tercapai.');
      return;
    }

    const linkedCat = categories.find((c) => c.id === linkedCategoryId);

    onSaveGoal(
      {
        name: name.trim(),
        targetAmount,
        currentAmount: initialAmount,
        targetDate,
        linkedCategoryId: linkedCategoryId || undefined,
        categoryName: linkedCat ? linkedCat.name : undefined,
        icon,
        color,
        description: description.trim(),
      },
      editingGoal?.id
    );

    onClose();
  };

  // Quick preset goal suggestions
  const applyGoalPreset = (presetName: string, presetAmount: number, presetIcon: string, presetMonths: number) => {
    setName(presetName);
    setTargetAmountInput(String(presetAmount));
    setIcon(presetIcon);
    const d = new Date();
    d.setMonth(d.getMonth() + presetMonths);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl text-white shadow-sm flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Target Finansial' : 'Buat Target Finansial Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Wujudkan impian finansial dengan rencana terukur dan terarah.
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

        {/* Quick Goal Presets (Only when creating new) */}
        {!editingGoal && (
          <div className="px-5 pt-4 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Template Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5 pb-2">
              <button
                type="button"
                onClick={() => applyGoalPreset('Dana Darurat 6 Bulan', 18000000, 'Shield', 12)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 font-medium transition-colors"
              >
                🛡️ Dana Darurat
              </button>
              <button
                type="button"
                onClick={() => applyGoalPreset('DP Rumah / KPR', 50000000, 'Home', 24)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 font-medium transition-colors"
              >
                🏡 DP Rumah
              </button>
              <button
                type="button"
                onClick={() => applyGoalPreset('Liburan Akhir Tahun', 10000000, 'Plane', 6)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 font-medium transition-colors"
              >
                ✈️ Liburan
              </button>
              <button
                type="button"
                onClick={() => applyGoalPreset('Gadget / Laptop Baru', 15000000, 'Laptop', 5)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 font-medium transition-colors"
              >
                💻 Gadget Baru
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Nama Target Finansial *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Dana Darurat 6 Bulan, DP Rumah, Liburan Jepang"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Target Amount & Initial Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Jumlah Target (Rp) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="0"
                  value={targetAmountInput ? new Intl.NumberFormat('id-ID').format(targetAmount) : ''}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Dana Terkumpul Awal (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={initialAmountInput ? new Intl.NumberFormat('id-ID').format(initialAmount) : ''}
                  onChange={(e) => setInitialAmountInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Target Date & Linked Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Target Tanggal Tercapai *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Tautkan Pos Tabungan
              </label>
              <select
                value={linkedCategoryId}
                onChange={(e) => setLinkedCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Tanpa Tautan Langsung --</option>
                {savingsCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.percentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Projection Card */}
          {targetAmount > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Rekomendasi Setoran:
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
                  {formatRupiah(previewStats.monthlyRecommendation)} / bulan
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                <span>
                  Sisa Waktu: <b>{previewStats.remainingMonths} bulan</b> ({previewStats.diffDays > 0 ? `${previewStats.diffDays} hari` : 'Sudah lewat'})
                </span>
                <span>
                  Progres: <b>{previewStats.percentage}%</b> ({formatRupiah(initialAmount)} / {formatRupiah(targetAmount)})
                </span>
              </div>
            </div>
          )}

          {/* Icon & Color Selector */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Pilih Ikon:
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-xl border transition-all ${
                      icon === iconName
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <DynamicIcon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Pilih Warna Aksen:
              </label>
              <div className="flex items-center gap-2">
                {GOAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Catatan / Motivasi Target
            </label>
            <input
              type="text"
              placeholder="Contoh: Disimpan di Reksadana Pasar Uang / Deposito Digital"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
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
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {editingGoal ? 'Simpan Perubahan' : 'Buat Target Finansial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
