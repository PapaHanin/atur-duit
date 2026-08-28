import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  Download,
  ArrowUpDown,
  FileText,
  ShoppingCart,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Gift,
  TrendingUp,
  Store,
  Clock,
  Sparkles,
  DollarSign,
  CheckSquare,
  Square,
  Check,
  Edit3,
  Tag,
  X,
  SlidersHorizontal,
  Image as ImageIcon,
} from 'lucide-react';
import { Category, Expense, AdditionalIncome } from '../types';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { ConfirmModal } from './ConfirmModal';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  additionalIncomes?: AdditionalIncome[];
  onDeleteExpense: (id: string) => void;
  onDeleteIncome?: (id: string) => void;
  onOpenAddExpenseModal: () => void;
  onOpenAddIncomeModal?: () => void;
  onOpenEditExpense?: (expense: Expense) => void;
  onOpenEditIncome?: (income: AdditionalIncome) => void;
  onBulkDelete?: (expenseIds: string[], incomeIds: string[]) => void;
  onBulkUpdateCategory?: (expenseIds: string[], targetCategoryId: string) => void;
  onBulkUpdateDate?: (expenseIds: string[], incomeIds: string[], targetDate: string) => void;
  onOpenExportModal?: () => void;
}

type FeedFilterType = 'all' | 'expense' | 'income';

interface UnifiedTransactionItem {
  id: string;
  type: 'expense' | 'income';
  title: string;
  categoryOrSource: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: number;
  iconName?: string;
  color?: string;
  incomeType?: string;
  allocationInfo?: string;
  receiptImage?: string;
  originalExpense?: Expense;
  originalIncome?: AdditionalIncome;
}

const INCOME_TYPE_ICONS: Record<string, { icon: any; color: string; label: string }> = {
  freelance: { icon: Briefcase, color: '#4f46e5', label: 'Freelance' },
  bonus: { icon: Gift, color: '#059669', label: 'Bonus & THR' },
  bisnis: { icon: Store, color: '#d97706', label: 'Bisnis' },
  investasi: { icon: TrendingUp, color: '#0891b2', label: 'Investasi' },
  lembur: { icon: Clock, color: '#7c3aed', label: 'Lembur' },
  hadiah: { icon: Sparkles, color: '#db2777', label: 'Hadiah' },
  lainnya: { icon: DollarSign, color: '#64748b', label: 'Lainnya' },
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  additionalIncomes = [],
  onDeleteExpense,
  onDeleteIncome,
  onOpenAddExpenseModal,
  onOpenAddIncomeModal,
  onOpenEditExpense,
  onOpenEditIncome,
  onBulkDelete,
  onBulkUpdateCategory,
  onBulkUpdateDate,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<FeedFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterReceiptOnly, setFilterReceiptOnly] = useState(false);

  // Receipt Quick Viewer Modal State
  const [previewReceipt, setPreviewReceipt] = useState<{
    imageUrl: string;
    title: string;
    amount: number;
    date: string;
    categoryName?: string;
    isIncome: boolean;
  } | null>(null);

  // Multi-select Checkboxes State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [targetBulkCategory, setTargetBulkCategory] = useState<string>(categories[0]?.id || '');
  const [showBulkDateModal, setShowBulkDateModal] = useState(false);
  const [targetBulkDate, setTargetBulkDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Combine expenses and additional incomes into unified list
  const unifiedTransactions = useMemo<UnifiedTransactionItem[]>(() => {
    const list: UnifiedTransactionItem[] = [];

    // Expenses
    expenses.forEach((e) => {
      const cat = categoryMap.get(e.categoryId);
      list.push({
        id: e.id,
        type: 'expense',
        title: e.description,
        categoryOrSource: cat?.name || 'Pos Lainnya',
        amount: e.amount,
        date: e.date,
        notes: e.notes,
        createdAt: e.createdAt,
        iconName: cat?.icon || 'Receipt',
        color: cat?.color || '#4f46e5',
        receiptImage: e.receiptImage,
        originalExpense: e,
      });
    });

    // Incomes
    additionalIncomes.forEach((inc) => {
      const conf = INCOME_TYPE_ICONS[inc.incomeType] || INCOME_TYPE_ICONS.lainnya;
      let alloc = 'Kas Bebas (Surplus)';
      if (inc.allocationMode === 'specific_category') {
        alloc = `Masuk Pos ${inc.targetCategoryName || 'Khusus'}`;
      } else if (inc.allocationMode === 'proportional') {
        alloc = 'Bagi Rata ke Seluruh Pos';
      }

      list.push({
        id: inc.id,
        type: 'income',
        title: inc.sourceName,
        categoryOrSource: `Pemasukan: ${conf.label}`,
        amount: inc.amount,
        date: inc.date,
        notes: inc.notes,
        createdAt: inc.createdAt,
        color: conf.color,
        incomeType: inc.incomeType,
        allocationInfo: alloc,
        receiptImage: inc.receiptImage,
        originalIncome: inc,
      });
    });

    return list;
  }, [expenses, additionalIncomes, categoryMap]);

  // Filtered and sorted
  const filteredTransactions = useMemo(() => {
    return unifiedTransactions
      .filter((item) => {
        // Tab filter
        if (activeTab === 'expense' && item.type !== 'expense') return false;
        if (activeTab === 'income' && item.type !== 'income') return false;

        // Filter only items with receipt
        if (filterReceiptOnly && !item.receiptImage) return false;

        // Category filter (only applies to expenses)
        if (selectedCategoryId !== 'all' && item.type === 'expense') {
          const expenseObj = expenses.find((e) => e.id === item.id);
          if (expenseObj && expenseObj.categoryId !== selectedCategoryId) {
            return false;
          }
        }

        // Search query
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
        const matchesCat = item.categoryOrSource.toLowerCase().includes(q);

        return matchesTitle || matchesNotes || matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [unifiedTransactions, activeTab, selectedCategoryId, searchQuery, sortBy, filterReceiptOnly, expenses]);

  const countWithReceipt = useMemo(() => {
    return unifiedTransactions.filter((t) => !!t.receiptImage).length;
  }, [unifiedTransactions]);

  const totalExpenseSum = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalIncomeSum = useMemo(() => {
    return additionalIncomes.reduce((sum, e) => sum + e.amount, 0);
  }, [additionalIncomes]);

  // Multi-select helpers
  const isAllFilteredSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Unselect all currently filtered
      const filteredIds = new Set(filteredTransactions.map((t) => t.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Select all currently filtered
      const allFilteredIds = filteredTransactions.map((t) => t.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Delete
  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDeleteAction = () => {
    const selectedExpenses = expenses.filter((e) => selectedIds.includes(e.id));
    const selectedIncomes = additionalIncomes.filter((i) => selectedIds.includes(i.id));

    if (onBulkDelete) {
      onBulkDelete(
        selectedExpenses.map((e) => e.id),
        selectedIncomes.map((i) => i.id)
      );
    } else {
      selectedExpenses.forEach((e) => onDeleteExpense(e.id));
      if (onDeleteIncome) {
        selectedIncomes.forEach((i) => onDeleteIncome(i.id));
      }
    }
    setSelectedIds([]);
  };

  // Bulk Category Update
  const handleExecuteBulkCategoryChange = () => {
    const selectedExpenseIds = expenses
      .filter((e) => selectedIds.includes(e.id))
      .map((e) => e.id);

    if (selectedExpenseIds.length === 0) {
      alert('Hanya transaksi pengeluaran yang dapat diubah pos anggarannya.');
      setShowBulkCategoryModal(false);
      return;
    }

    if (onBulkUpdateCategory && targetBulkCategory) {
      onBulkUpdateCategory(selectedExpenseIds, targetBulkCategory);
      setShowBulkCategoryModal(false);
      setSelectedIds([]);
    }
  };

  // Bulk Date Update
  const handleExecuteBulkDateChange = () => {
    if (selectedIds.length === 0 || !targetBulkDate) return;
    const selectedExpenseIds = expenses
      .filter((e) => selectedIds.includes(e.id))
      .map((e) => e.id);
    const selectedIncomeIds = additionalIncomes
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.id);

    if (onBulkUpdateDate) {
      onBulkUpdateDate(selectedExpenseIds, selectedIncomeIds, targetBulkDate);
      setShowBulkDateModal(false);
      setSelectedIds([]);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['Tipe', 'Tanggal', 'Kategori/Sumber', 'Keterangan', 'Nominal (Rp)', 'Catatan'];
    const rows = filteredTransactions.map((t) => [
      `"${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}"`,
      `"${t.date}"`,
      `"${t.categoryOrSource.replace(/"/g, '""')}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type === 'income' ? `+${t.amount}` : `-${t.amount}`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transaksi_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#111C30] rounded-3xl border border-slate-800 p-6 shadow-sm space-y-5">
      {/* Header with Bento styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2.5">
            <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
            Riwayat Arus Kas & Transaksi
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Pengeluaran: <strong className="text-rose-400 font-mono">{formatRupiah(totalExpenseSum)}</strong>
            </span>
            {totalIncomeSum > 0 && (
              <>
                <span>•</span>
                <span>
                  Pemasukan Lain: <strong className="text-emerald-400 font-mono">+{formatRupiah(totalIncomeSum)}</strong>
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenExportModal && (
            <button
              id="expense-export-pdf-excel-btn"
              type="button"
              onClick={onOpenExportModal}
              className="text-xs px-3 py-2 rounded-xl border border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 flex items-center gap-1.5 font-bold transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Laporan & PDF
            </button>
          )}

          {filteredTransactions.length > 0 && (
            <button
              id="expense-export-csv-btn"
              type="button"
              onClick={handleExportCSV}
              className="text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-[#16233B] flex items-center gap-1.5 font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          )}

          {onOpenAddIncomeModal && (
            <button
              id="expense-add-income-btn"
              type="button"
              onClick={onOpenAddIncomeModal}
              className="text-xs px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> + Pemasukan
            </button>
          )}

          <button
            id="expense-add-new-btn"
            type="button"
            onClick={onOpenAddExpenseModal}
            className="text-xs px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-950/50 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> + Pengeluaran
          </button>
        </div>
      </div>

      {/* Tabs Filter & Centang Semua Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0B1120] rounded-2xl w-fit border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#16233B] text-white shadow-2xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Transaksi ({unifiedTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              activeTab === 'expense'
                ? 'bg-[#16233B] text-rose-400 shadow-2xs'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <ArrowDownRight className="w-3 h-3 text-rose-500" />
            Pengeluaran ({expenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              activeTab === 'income'
                ? 'bg-[#16233B] text-emerald-400 shadow-2xs'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            Pemasukan Lain ({additionalIncomes.length})
          </button>
        </div>

        {/* Centang Semua (Select All) Checkbox Button */}
        {filteredTransactions.length > 0 && (
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isAllFilteredSelected
                ? 'bg-indigo-950/70 border-indigo-800 text-indigo-300'
                : 'bg-[#0B1120] border-slate-800 text-slate-300 hover:bg-[#16233B]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                isAllFilteredSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : selectedIds.length > 0
                  ? 'bg-indigo-900 border-indigo-500 text-indigo-300'
                  : 'border-slate-700 bg-[#0B1120]'
              }`}
            >
              {isAllFilteredSelected && <Check className="w-3 h-3" />}
              {!isAllFilteredSelected && selectedIds.length > 0 && (
                <div className="w-2 h-0.5 bg-indigo-400 rounded-sm" />
              )}
            </div>
            <span>
              {isAllFilteredSelected
                ? 'Hapus Centang Semua'
                : selectedIds.length > 0
                ? `Centang Semua (${selectedIds.length}/${filteredTransactions.length})`
                : 'Centang Semua Transaksi'}
            </span>
          </button>
        )}
      </div>

      {/* Floating / Sticky Bulk Action Bar when items are checked */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 bg-indigo-950/90 text-white rounded-2xl shadow-xl border border-indigo-700/80 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="font-bold text-xs sm:text-sm">
              {selectedIds.length} Transaksi Dicentang
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Ubah Kategori Terpilih */}
            {onBulkUpdateCategory && (
              <button
                type="button"
                onClick={() => setShowBulkCategoryModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-indigo-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-700/60"
              >
                <Tag className="w-3.5 h-3.5" />
                Ubah Pos
              </button>
            )}

            {/* Ubah Tanggal Terpilih */}
            {onBulkUpdateDate && (
              <button
                type="button"
                onClick={() => setShowBulkDateModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-indigo-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-700/60"
              >
                <Calendar className="w-3.5 h-3.5" />
                Ubah Tanggal
              </button>
            )}

            {/* Hapus Terpilih */}
            <button
              type="button"
              onClick={handleExecuteBulkDelete}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Tercentang ({selectedIds.length})
            </button>

            {/* Batal Centang */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Batal Pilihan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="expense-search-input"
            type="text"
            placeholder="Cari transaksi (e.g. bensin, bonus, freelance)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-[#0B1120] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            id="expense-category-filter"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-[#0B1120] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
          >
            <option value="all">Semua Pos Anggaran</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            id="expense-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-[#0B1120] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
          >
            <option value="newest">Terbaru (Tanggal)</option>
            <option value="oldest">Terlama (Tanggal)</option>
            <option value="highest">Nominal Terbesar</option>
            <option value="lowest">Nominal Terkecil</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Bar: Receipt toggle & counts */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterReceiptOnly(false)}
            className={`px-3 py-1 rounded-xl font-bold transition-all text-xs border ${
              !filterReceiptOnly
                ? 'bg-slate-800 border-slate-700 text-white shadow-2xs'
                : 'bg-transparent border-slate-800/80 text-slate-400 hover:text-slate-300'
            }`}
          >
            Semua Transaksi ({unifiedTransactions.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterReceiptOnly(true)}
            className={`px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 border ${
              filterReceiptOnly
                ? 'bg-indigo-950/90 border-indigo-600 text-indigo-300 shadow-2xs'
                : 'bg-transparent border-slate-800/80 text-slate-400 hover:text-indigo-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ada Struk / Bukti ({countWithReceipt})</span>
          </button>
        </div>

        {filterReceiptOnly && (
          <span className="text-[11px] text-indigo-400 font-semibold">
            Menampilkan transaksi berstruk
          </span>
        )}
      </div>

      {/* Transaction List Content */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#0B1120] rounded-2xl border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-[#111C30] flex items-center justify-center mx-auto text-slate-400 mb-2.5">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">
            Belum ada transaksi pada daftar ini
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategoryId !== 'all'
              ? 'Tidak ada transaksi yang cocok dengan filter pencarian.'
              : 'Mulai catat pengeluaran harian atau pemasukan tambahan untuk memantau arus kas Anda.'}
          </p>
          <div className="mt-3.5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onOpenAddExpenseModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800 hover:underline"
            >
              + Catat Pengeluaran
            </button>
            {onOpenAddIncomeModal && (
              <button
                type="button"
                onClick={onOpenAddIncomeModal}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 hover:underline"
              >
                + Catat Pemasukan
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-800 max-h-[560px] overflow-y-auto pr-1">
          {filteredTransactions.map((item) => {
            const isIncome = item.type === 'income';
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`py-3.5 sm:py-4 flex items-center justify-between gap-3 rounded-2xl px-3 transition-colors group ${
                  isSelected
                    ? 'bg-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'hover:bg-[#0B1120]'
                }`}
              >
                {/* Left: Checkbox + Icon + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Item Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                        : 'border-slate-700 bg-[#0B1120] hover:border-indigo-400'
                    }`}
                    title={isSelected ? 'Hilangkan Centang' : 'Centang Transaksi'}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color || (isIncome ? '#059669' : '#4f46e5') }}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <DynamicIcon name={item.iconName || 'Receipt'} className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">
                        {item.title}
                      </span>
                      {isIncome && (
                        <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold shrink-0">
                          Pemasukan
                        </span>
                      )}
                      {item.receiptImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewReceipt({
                              imageUrl: item.receiptImage!,
                              title: item.title,
                              amount: item.amount,
                              date: item.date,
                              categoryName: item.categoryOrSource,
                              isIncome: item.type === 'income',
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold transition-all shrink-0 cursor-pointer shadow-2xs hover:border-indigo-400 group/receipt"
                          title="Klik untuk melihat foto/struk transaksi"
                        >
                          <ImageIcon className="w-3 h-3 text-indigo-400 group-hover/receipt:scale-110 transition-transform" />
                          <span>Lihat Struk</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span
                        className={`font-medium ${
                          isIncome ? 'text-emerald-300' : 'text-slate-300'
                        }`}
                      >
                        {item.categoryOrSource}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatIndonesianDate(item.date)}
                      </span>
                      {item.allocationInfo && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 font-medium">{item.allocationInfo}</span>
                        </>
                      )}
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[160px] italic text-slate-400">
                            "{item.notes}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Edit Button + Delete Button */}
                <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
                  <span
                    className={`font-bold font-mono text-sm sm:text-base ${
                      isIncome
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? `+${formatRupiah(item.amount)}` : `-${formatRupiah(item.amount)}`}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Quick Edit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isIncome && onOpenEditIncome && item.originalIncome) {
                          onOpenEditIncome(item.originalIncome);
                        } else if (!isIncome && onOpenEditExpense && item.originalExpense) {
                          onOpenEditExpense(item.originalExpense);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all opacity-80 group-hover:opacity-100"
                      title="Edit Transaksi Ini"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isIncome && onDeleteIncome) {
                          onDeleteIncome(item.id);
                        } else {
                          onDeleteExpense(item.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all opacity-80 group-hover:opacity-100"
                      title={isIncome ? 'Hapus Pemasukan' : 'Hapus Pengeluaran'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Bulk Change Category */}
      {showBulkCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                Ubah Pos Anggaran ({selectedIds.length} Transaksi)
              </h3>
              <button
                onClick={() => setShowBulkCategoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Pindahkan semua transaksi pengeluaran terpilih ke pos anggaran baru di bawah ini:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTargetBulkCategory(cat.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                    targetBulkCategory === cat.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <DynamicIcon name={cat.icon || 'Tag'} className="w-3.5 h-3.5" />
                    </div>
                    <span>{cat.name}</span>
                  </div>
                  {targetBulkCategory === cat.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkCategoryModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkCategoryChange}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm"
              >
                Terapkan ke Pos Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Change Date */}
      {showBulkDateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Ubah Tanggal ({selectedIds.length} Transaksi)
              </h3>
              <button
                onClick={() => setShowBulkDateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Setel tanggal baru untuk semua transaksi yang dicentang:
            </p>

            <input
              type="date"
              value={targetBulkDate}
              onChange={(e) => setTargetBulkDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold"
            />

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkDateModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDateChange}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm"
              >
                Ubah Semua Tanggal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bulk Delete Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDeleteAction}
        title="Hapus Transaksi Terpilih"
        message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi yang dicentang? Saldo pos anggaran terkait akan diperbarui secara otomatis.`}
        confirmText="Hapus Semua"
      />

      {/* Quick Receipt Viewer Lightbox */}
      <ReceiptViewerModal
        isOpen={!!previewReceipt}
        onClose={() => setPreviewReceipt(null)}
        imageUrl={previewReceipt?.imageUrl}
        title={previewReceipt?.title}
        amount={previewReceipt?.amount}
        date={previewReceipt?.date}
        categoryName={previewReceipt?.categoryName}
        isIncome={previewReceipt?.isIncome}
      />
    </div>
  );
};
