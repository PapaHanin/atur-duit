import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  PieChart,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Square,
  Layers,
  Percent,
} from 'lucide-react';
import { Category, BudgetPreset } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { BUDGET_PRESETS, generateCategoriesFromPreset } from '../utils/presets';
import { ConfirmModal } from './ConfirmModal';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  totalIncome: number;
  onSaveCategories: (updatedCategories: Category[]) => void;
}

const AVAILABLE_ICONS = [
  'Utensils',
  'Receipt',
  'Coffee',
  'PiggyBank',
  'Home',
  'Car',
  'ShoppingBag',
  'ShieldCheck',
  'HeartPulse',
  'GraduationCap',
  'Film',
  'Smartphone',
  'Plane',
  'Gift',
  'TrendingUp',
  'Wallet',
];

const AVAILABLE_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#16a34a', // Green
  '#ea580c', // Orange
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories = [],
  totalIncome,
  onSaveCategories,
}) => {
  const [localCategories, setLocalCategories] = useState<Category[]>(() =>
    Array.isArray(categories) ? JSON.parse(JSON.stringify(categories)) : []
  );
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Multi-select Checkboxes State
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [showBulkGroupModal, setShowBulkGroupModal] = useState(false);

  // New Category Form State
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<'kewajiban' | 'pokok' | 'keinginan' | 'tabungan' | 'lainnya'>('pokok');
  const [newPercentage, setNewPercentage] = useState<number>(10);
  const [newNominal, setNewNominal] = useState<number>(0);
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('ShoppingBag');
  const [newColor, setNewColor] = useState('#4f46e5');

  // Confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  if (!isOpen) return null;

  const totalPercentage = localCategories.reduce((sum, c) => sum + (c.percentage || 0), 0);
  const totalAllocated = localCategories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);

  // Toggle Single Checkbox
  const handleToggleSelectCat = (id: string) => {
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  // Toggle All Checkboxes
  const isAllSelected = localCategories.length > 0 && selectedCatIds.length === localCategories.length;
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCatIds([]);
    } else {
      setSelectedCatIds(localCategories.map((c) => c.id));
    }
  };

  // Bulk Delete Selected Categories
  const handleBulkDeleteSelected = () => {
    if (selectedCatIds.length === 0) return;
    if (localCategories.length - selectedCatIds.length < 1) {
      alert('Minimal harus ada 1 pos anggaran tersisa.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Pos Anggaran Terpilih',
      message: `Apakah Anda yakin ingin menghapus ${selectedCatIds.length} pos anggaran yang dicentang?`,
      confirmText: 'Hapus',
      onConfirm: () => {
        setLocalCategories((prev) => prev.filter((c) => !selectedCatIds.includes(c.id)));
        setSelectedCatIds([]);
      },
    });
  };

  // Bulk Change Group for Selected Categories
  const handleBulkChangeGroup = (targetGroup: Category['group']) => {
    setLocalCategories((prev) =>
      prev.map((cat) => (selectedCatIds.includes(cat.id) ? { ...cat, group: targetGroup } : cat))
    );
    setShowBulkGroupModal(false);
  };

  // Bulk Equalize Percentage for Selected Categories
  const handleBulkEqualizePercentage = () => {
    if (selectedCatIds.length === 0) return;
    const selectedCats = localCategories.filter((c) => selectedCatIds.includes(c.id));
    const totalSelectedPct = selectedCats.reduce((sum, c) => sum + (c.percentage || 0), 0);
    const equalPct = Math.floor(totalSelectedPct / selectedCatIds.length);
    const remainder = totalSelectedPct - equalPct * selectedCatIds.length;

    setLocalCategories((prev) => {
      let allocatedCount = 0;
      return prev.map((cat) => {
        if (selectedCatIds.includes(cat.id)) {
          const finalPct = equalPct + (allocatedCount === 0 ? remainder : 0);
          allocatedCount++;
          const finalNominal = totalIncome > 0 ? Math.round((totalIncome * finalPct) / 100) : cat.allocatedAmount;
          return {
            ...cat,
            percentage: finalPct,
            allocatedAmount: finalNominal,
          };
        }
        return cat;
      });
    });
  };

  // Update a single category's percentage (and recalculate its nominal)
  const handlePercentageChange = (id: string, newPctStr: string) => {
    const pct = parseFloat(newPctStr) || 0;
    setLocalCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          const allocated = totalIncome > 0 ? Math.round((totalIncome * pct) / 100) : cat.allocatedAmount;
          return { ...cat, percentage: pct, allocatedAmount: allocated };
        }
        return cat;
      })
    );
  };

  // Update a single category's nominal (and recalculate its percentage)
  const handleNominalChange = (id: string, rawVal: string) => {
    const parsed = parseRupiahInput(rawVal);
    setLocalCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          const pct = totalIncome > 0 ? Number(((parsed / totalIncome) * 100).toFixed(1)) : cat.percentage;
          return { ...cat, allocatedAmount: parsed, percentage: pct };
        }
        return cat;
      })
    );
  };

  // Update category text/info
  const handleInfoChange = (id: string, key: 'name' | 'description', value: string) => {
    setLocalCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [key]: value } : cat))
    );
  };

  const handleDeleteCategory = (id: string) => {
    if (localCategories.length <= 1) {
      alert('Minimal harus ada 1 pos anggaran.');
      return;
    }
    const cat = localCategories.find((c) => c.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Pos Anggaran',
      message: `Hapus pos anggaran "${cat?.name || 'ini'}"?`,
      confirmText: 'Hapus',
      onConfirm: () => {
        setLocalCategories((prev) => prev.filter((c) => c.id !== id));
        setSelectedCatIds((prev) => prev.filter((catId) => catId !== id));
      },
    });
  };

  const handleApplyPreset = (preset: BudgetPreset) => {
    setConfirmDialog({
      isOpen: true,
      title: `Terapkan Formula ${preset.name}`,
      message: `Terapkan formula ${preset.name}? Alokasi seluruh pos anggaran akan disesuaikan secara otomatis.`,
      confirmText: 'Terapkan',
      onConfirm: () => {
        const generated = generateCategoriesFromPreset(preset, totalIncome);
        setLocalCategories(generated);
        setSelectedCatIds([]);
      },
    });
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let calcAlloc = newNominal;
    let calcPct = newPercentage;

    if (totalIncome > 0) {
      if (newPercentage > 0 && newNominal === 0) {
        calcAlloc = Math.round((totalIncome * newPercentage) / 100);
      } else if (newNominal > 0) {
        calcPct = Number(((newNominal / totalIncome) * 100).toFixed(1));
      }
    }

    const newCat: Category = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      group: newGroup,
      icon: newIcon,
      description: newDescription.trim() || 'Pos anggaran kustom',
      percentage: calcPct,
      allocatedAmount: calcAlloc,
      color: newColor,
      isCustom: true,
    };

    setLocalCategories((prev) => [...prev, newCat]);
    setIsAddingNew(false);
    setNewName('');
    setNewDescription('');
    setNewPercentage(10);
    setNewNominal(0);
  };

  const handleSave = () => {
    onSaveCategories(localCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Kustomisasi & Atur Pos Anggaran
              </h2>
              <p className="text-xs text-slate-500">
                Centang pos untuk mengedit kelompok atau menghapus sekaligus, atau ubah nominal per pos.
              </p>
            </div>
          </div>
          <button
            id="cat-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Quick Preset Selector Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
              Template Cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  {p.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Health Bar Tracker */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                Total Porsi Alokasi:{' '}
                <span className={totalPercentage === 100 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-amber-600 font-bold'}>
                  {totalPercentage}%
                </span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">
                Total Nominal: {formatRupiah(totalAllocated)} (Gaji: {formatRupiah(totalIncome)})
              </span>
            </div>

            {/* Visual multi-colored progress bar */}
            <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              {localCategories.map((c, i) => (
                <div
                  key={c.id || i}
                  style={{
                    width: `${Math.max(0, c.percentage)}%`,
                    backgroundColor: c.color || '#4f46e5',
                  }}
                  className="h-full transition-all"
                  title={`${c.name}: ${c.percentage}% (${formatRupiah(c.allocatedAmount)})`}
                />
              ))}
            </div>

            {totalPercentage !== 100 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {totalPercentage < 100
                  ? `Masih tersisa ${100 - totalPercentage}% (${formatRupiah(totalIncome - totalAllocated)}) yang belum dialokasikan.`
                  : `Total alokasi melebihi 100% sebesar ${totalPercentage - 100}%. Harap kurangi salah satu pos.`}
              </div>
            )}
          </div>

          {/* Bulk Action Bar when Categories are checked */}
          {selectedCatIds.length > 0 && (
            <div className="p-3.5 bg-indigo-900 text-white rounded-2xl shadow-lg border border-indigo-800 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-150">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                  {selectedCatIds.length}
                </span>
                <span className="font-bold text-xs">
                  {selectedCatIds.length} Pos Anggaran Dicentang
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowBulkGroupModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" /> Ubah Kelompok
                </button>

                <button
                  type="button"
                  onClick={handleBulkEqualizePercentage}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Percent className="w-3.5 h-3.5" /> Bagi Rata %
                </button>

                <button
                  type="button"
                  onClick={handleBulkDeleteSelected}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Tercentang ({selectedCatIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCatIds([])}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-white/80"
                  title="Batal Centang"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Category List Header & Select All */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daftar Pos Anggaran ({localCategories.length})
                </h3>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800"
                >
                  {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  {isAllSelected ? 'Hapus Centang Semua' : 'Centang Semua Pos'}
                </button>
              </div>

              {!isAddingNew && (
                <button
                  id="cat-add-new-trigger-btn"
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pos Kustom
                </button>
              )}
            </div>

            {localCategories.map((category) => {
              const isSelected = selectedCatIds.includes(category.id);

              return (
                <div
                  key={category.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelectCat(category.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-400'
                        }`}
                        title="Centang Pos Ini"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: category.color || '#4f46e5' }}
                      >
                        <DynamicIcon name={category.icon} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => handleInfoChange(category.id, 'name', e.target.value)}
                          className="font-bold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-full sm:w-64"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {category.group}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus Pos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub Inputs: Percentage & Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Porsi Persentase (%)
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={category.percentage}
                          onChange={(e) => handlePercentageChange(category.id, e.target.value)}
                          className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3.5 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Nominal Budget (Rp)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={new Intl.NumberFormat('id-ID').format(category.allocatedAmount || 0)}
                        onChange={(e) => handleNominalChange(category.id, e.target.value)}
                        className="w-full px-3.5 py-2 text-sm font-semibold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Catatan / contoh pengeluaran pos ini..."
                      value={category.description || ''}
                      onChange={(e) => handleInfoChange(category.id, 'description', e.target.value)}
                      className="w-full text-xs text-slate-600 dark:text-slate-400 bg-transparent border-b border-dashed border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 px-1 py-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Category Sub-Form */}
          {isAddingNew && (
            <form
              onSubmit={handleAddNewCategory}
              className="p-5 rounded-2xl border-2 border-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Tambah Pos Kategori Baru
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Nama Pos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Langganan SaaS / Hiburan"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Kelompok Pos
                  </label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="kewajiban">Kewajiban & Tagihan</option>
                    <option value="pokok">Kebutuhan Pokok</option>
                    <option value="keinginan">Keinginan & Lifestyle</option>
                    <option value="tabungan">Tabungan & Investasi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Porsi Persentase (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Atau Nominal Tetap (Rp)
                  </label>
                  <input
                    type="text"
                    placeholder="Opsional"
                    value={newNominal ? formatRupiah(newNominal).replace('Rp', '').trim() : ''}
                    onChange={(e) => setNewNominal(parseRupiahInput(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Icon & Color Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Pilih Ikon & Warna
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.slice(0, 12).map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`p-2 rounded-xl border transition-all ${
                        newIcon === icon
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <DynamicIcon name={icon} className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  + Tambahkan Pos
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Simpan Pos Anggaran
          </button>
        </div>
      </div>

      {/* Sub-modal: Bulk Change Group */}
      {showBulkGroupModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Pindahkan {selectedCatIds.length} Pos ke Kelompok:
            </h3>

            <div className="space-y-2">
              {[
                { id: 'kewajiban', label: 'Kewajiban & Tagihan' },
                { id: 'pokok', label: 'Kebutuhan Pokok' },
                { id: 'keinginan', label: 'Keinginan & Gaya Hidup' },
                { id: 'tabungan', label: 'Tabungan & Investasi' },
                { id: 'lainnya', label: 'Lainnya' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleBulkChangeGroup(g.id as any)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  {g.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowBulkGroupModal(false)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
      />
    </div>
  );
};
