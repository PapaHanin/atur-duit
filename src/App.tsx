import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Plus, PieChart, ShieldAlert, Sparkles, Filter, RefreshCw, Layers, Calendar, Target, Wallet as WalletIcon, CalendarClock, Scale, Calculator, ScanLine } from 'lucide-react';
import { Header, ActiveNavTab } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BudgetSummaryStats } from './components/BudgetSummaryStats';
import { SalaryInputCard } from './components/SalaryInputCard';
import { CategoryCard } from './components/CategoryCard';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AntiBoncosAlerts } from './components/AntiBoncosAlerts';
import { ExpenseList } from './components/ExpenseList';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SalaryEditModal } from './components/SalaryEditModal';
import { ExportModal } from './components/ExportModal';
import { FinancialGoalsSection } from './components/FinancialGoalsSection';
import { GoalModal } from './components/GoalModal';
import { GoalContributionModal } from './components/GoalContributionModal';
import { NextMonthPlannerModal } from './components/NextMonthPlannerModal';
import { AddIncomeModal } from './components/AddIncomeModal';
import { IncomeManagerModal } from './components/IncomeManagerModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { EditIncomeModal } from './components/EditIncomeModal';
import { AiFinancialAdvisorSection } from './components/AiFinancialAdvisorSection';
import { IncomeExpenseLineChart } from './components/IncomeExpenseLineChart';
import { ConfirmModal } from './components/ConfirmModal';
import { BillManagerSection } from './components/BillManagerSection';
import { AddBillModal } from './components/AddBillModal';
import { WalletManagerSection } from './components/WalletManagerSection';
import { AddWalletModal } from './components/AddWalletModal';
import { WalletTransferModal } from './components/WalletTransferModal';
import { MonthlyComparisonSection } from './components/MonthlyComparisonSection';
import { FinancialSimulatorsSection } from './components/FinancialSimulatorsSection';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import {
  MonthlyData,
  Category,
  Expense,
  BudgetNotification,
  FinancialGoal,
  GoalContribution,
  AdditionalIncome,
  Wallet,
  WalletTransfer,
  RecurringBill,
} from './types';
import { BUDGET_PRESETS, generateCategoriesFromPreset } from './utils/presets';
import {
  calculateCategorySpent,
  getCategoryHealth,
  formatRupiah,
  getNextMonthKey,
  formatMonthYearTitle,
} from './utils/formatters';

const STORAGE_KEY = 'aturduit_app_data_v1';
const NOTIFICATIONS_KEY = 'aturduit_notifications_v1';
const GOALS_STORAGE_KEY = 'aturduit_financial_goals_v1';
const WALLETS_STORAGE_KEY = 'aturduit_wallets_v1';
const TRANSFERS_STORAGE_KEY = 'aturduit_transfers_v1';
const BILLS_STORAGE_KEY = 'aturduit_bills_v1';

// Default initial wallets for instant experience
const DEFAULT_INITIAL_WALLETS: Wallet[] = [
  {
    id: 'wallet_bca',
    name: 'BCA Utama',
    type: 'bank',
    initialBalance: 12500000,
    accountNumber: 'Rekening Operasional & Payroll',
    color: '#3b82f6',
    icon: 'Landmark',
    isDefault: true,
  },
  {
    id: 'wallet_gopay',
    name: 'GoPay / QRIS',
    type: 'ewallet',
    initialBalance: 750000,
    accountNumber: '0812-3456-7890',
    color: '#06b6d4',
    icon: 'Smartphone',
  },
  {
    id: 'wallet_cash',
    name: 'Uang Tunai (Dompet Fisik)',
    type: 'cash',
    initialBalance: 450000,
    color: '#10b981',
    icon: 'Banknote',
  },
  {
    id: 'wallet_bibit',
    name: 'Bibit / Reksadana Likuid',
    type: 'investment',
    initialBalance: 15000000,
    accountNumber: 'Dana Pasar Uang',
    color: '#14b8a6',
    icon: 'TrendingUp',
  },
];

// Default initial recurring bills
const DEFAULT_INITIAL_BILLS: RecurringBill[] = [
  {
    id: 'bill_listrik',
    name: 'Listrik PLN Pascabayar',
    amount: 450000,
    dueDateDay: 5,
    categoryId: 'kewajiban_1',
    walletId: 'wallet_bca',
    frequency: 'monthly',
    paidMonthKeys: ['2026-07'],
    icon: 'Zap',
    color: '#eab308',
    reminderDaysBefore: 3,
    notes: 'No Meter: 1423 8892 1109',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'bill_wifi',
    name: 'Internet Indihome 50 Mbps',
    amount: 385000,
    dueDateDay: 15,
    categoryId: 'kewajiban_2',
    walletId: 'wallet_bca',
    frequency: 'monthly',
    paidMonthKeys: ['2026-07'],
    icon: 'Wifi',
    color: '#06b6d4',
    reminderDaysBefore: 2,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'bill_bpjs',
    name: 'BPJS Kesehatan Kelas 1',
    amount: 150000,
    dueDateDay: 10,
    categoryId: 'kewajiban_3',
    walletId: 'wallet_bca',
    frequency: 'monthly',
    paidMonthKeys: ['2026-07', '2026-08'],
    icon: 'HeartPulse',
    color: '#10b981',
    reminderDaysBefore: 2,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
];


// Default initial goals for rich out-of-the-box experience
const DEFAULT_INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal_dana_darurat',
    name: 'Dana Darurat 6 Bulan',
    targetAmount: 24000000,
    currentAmount: 8500000,
    targetDate: '2027-02-28',
    categoryName: 'Tabungan & Investasi',
    icon: 'Shield',
    color: '#4f46e5',
    description: 'Disimpan di Reksadana Pasar Uang likuid untuk dana cadangan darurat',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    contributions: [
      {
        id: 'contrib_1',
        goalId: 'goal_dana_darurat',
        amount: 5000000,
        date: '2026-07-01',
        monthKey: '2026-07',
        sourceType: 'category_savings',
        sourceCategoryName: 'Tabungan & Investasi',
        notes: 'Setoran tabungan awal',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'contrib_2',
        goalId: 'goal_dana_darurat',
        amount: 3500000,
        date: '2026-08-05',
        monthKey: '2026-08',
        sourceType: 'category_savings',
        sourceCategoryName: 'Tabungan & Investasi',
        notes: 'Alokasi rutin gaji bulan ini',
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'goal_dp_rumah',
    name: 'DP Rumah Impian (KPR)',
    targetAmount: 60000000,
    currentAmount: 18000000,
    targetDate: '2027-12-31',
    categoryName: 'Investasi Masa Depan',
    icon: 'Home',
    color: '#059669',
    description: 'Target uang muka perumahan di suburban',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    contributions: [
      {
        id: 'contrib_3',
        goalId: 'goal_dp_rumah',
        amount: 18000000,
        date: '2026-06-15',
        monthKey: '2026-06',
        sourceType: 'direct_deposit',
        notes: 'Bonus tahunan dan tabungan emas',
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      },
    ],
  },
];

export default function App() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Store all months data
  const [allMonthsData, setAllMonthsData] = useState<Record<string, MonthlyData>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load local storage', e);
    }
    return {};
  });

  // Financial Goals state
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(() => {
    try {
      const saved = localStorage.getItem(GOALS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load financial goals', e);
    }
    return DEFAULT_INITIAL_GOALS;
  });

  // Multi-Wallets & Accounts state
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    try {
      const saved = localStorage.getItem(WALLETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load wallets', e);
    }
    return DEFAULT_INITIAL_WALLETS;
  });

  // Inter-wallet Transfers state
  const [transfers, setTransfers] = useState<WalletTransfer[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSFERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transfers', e);
    }
    return [];
  });

  // Recurring Bills & Subscriptions state
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem(BILLS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load bills', e);
    }
    return DEFAULT_INITIAL_BILLS;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<BudgetNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
    return [];
  });

  // Modal visibility states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<FinancialGoal | null>(null);
  const [isNextMonthPlannerOpen, setIsNextMonthPlannerOpen] = useState(false);
  const [selectedQuickSpendCategory, setSelectedQuickSpendCategory] = useState<string | undefined>();
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isIncomeManagerModalOpen, setIsIncomeManagerModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<Expense | null>(null);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [selectedIncomeForEdit, setSelectedIncomeForEdit] = useState<AdditionalIncome | null>(null);

  // New Feature Modals
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [isWalletTransferModalOpen, setIsWalletTransferModalOpen] = useState(false);

  // Top Menu Navigation Tab ('all' | 'categories' | 'bills' | 'wallets' | 'transactions' | 'goals' | 'comparison' | 'simulators' | 'ai')
  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter category group tab on UI ('all', 'pokok', 'kewajiban', 'keinginan', 'tabungan')
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('all');

  // Confirmation Dialog State
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

  // Helper to open confirmation modal
  const openConfirmation = (title: string, message: string, onConfirm: () => void, confirmText = 'Hapus') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  // Save to localStorage whenever allMonthsData updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allMonthsData));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [allMonthsData]);

  // Save financial goals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(financialGoals));
    } catch (e) {
      console.error('Failed to save financial goals', e);
    }
  }, [financialGoals]);

  // Save wallets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
    } catch (e) {
      console.error('Failed to save wallets', e);
    }
  }, [wallets]);

  // Save transfers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(transfers));
    } catch (e) {
      console.error('Failed to save transfers', e);
    }
  }, [transfers]);

  // Save bills to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(recurringBills));
    } catch (e) {
      console.error('Failed to save bills', e);
    }
  }, [recurringBills]);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }, [notifications]);


  // Current Month Data
  const currentMonthData: MonthlyData = allMonthsData[currentMonth] || {
    monthKey: currentMonth,
    monthlyIncome: 0,
    categories: [],
    expenses: [],
    lastUpdated: Date.now(),
  };

  const hasSalarySet = currentMonthData.monthlyIncome > 0 && currentMonthData.categories.length > 0;

  // Initialize or Set Salary and Auto-Allocate
  const handleSetSalaryAndPreset = (income: number, presetId: string) => {
    const preset = BUDGET_PRESETS.find((p) => p.id === presetId) || BUDGET_PRESETS[0];
    const generatedCategories = generateCategoriesFromPreset(preset, income);

    const updatedData: MonthlyData = {
      ...currentMonthData,
      monthlyIncome: income,
      activePresetId: presetId,
      categories: generatedCategories,
      lastUpdated: Date.now(),
    };

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: updatedData,
    }));

    // Trigger celebratory confetti
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Add info notification
    const newNotif: BudgetNotification = {
      id: `notif_${Date.now()}`,
      categoryId: '',
      categoryName: 'Alokasi Gaji',
      type: 'info',
      title: 'Alokasi Gaji Berhasil Diterapkan!',
      message: `Total gaji ${formatRupiah(income)} telah otomatis dipecah ke dalam ${generatedCategories.length} pos anggaran (${preset.name}).`,
      percentage: 0,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Update Salary from Modal
  const handleUpdateSalary = (newIncome: number, reapplyPresetId?: string) => {
    let newCategories: Category[] = [];

    if (reapplyPresetId) {
      const preset = BUDGET_PRESETS.find((p) => p.id === reapplyPresetId) || BUDGET_PRESETS[0];
      newCategories = generateCategoriesFromPreset(preset, newIncome);
    } else {
      // Proportional scale
      newCategories = currentMonthData.categories.map((cat) => {
        const allocated = Math.round((newIncome * cat.percentage) / 100);
        return {
          ...cat,
          allocatedAmount: allocated,
        };
      });
    }

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        monthlyIncome: newIncome,
        categories: newCategories,
        lastUpdated: Date.now(),
      },
    }));
  };

  // Save Categories from Category Manager
  const handleSaveCategories = (updatedCategories: Category[]) => {
    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        categories: updatedCategories,
        lastUpdated: Date.now(),
      },
    }));
  };

  // Add an Expense & check for Anti-Boncos alerts
  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      createdAt: Date.now(),
    };

    const updatedExpenses = [newExpense, ...currentMonthData.expenses];

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        expenses: updatedExpenses,
        lastUpdated: Date.now(),
      },
    }));

    // Check if this expense causes a critical threshold trigger
    const targetCat = currentMonthData.categories.find((c) => c.id === expenseData.categoryId);
    if (targetCat && targetCat.allocatedAmount > 0) {
      const totalSpent = calculateCategorySpent(targetCat.id, updatedExpenses);
      const health = getCategoryHealth(totalSpent, targetCat.allocatedAmount);

      if (health.health === 'warning') {
        const warningNotif: BudgetNotification = {
          id: `notif_${Date.now()}`,
          categoryId: targetCat.id,
          categoryName: targetCat.name,
          type: 'warning',
          title: `⚠️ Waspada: Pos ${targetCat.name} Tersentuh ${health.percentage.toFixed(0)}%!`,
          message: `Pengeluaran ${formatRupiah(expenseData.amount)} baru saja dicatat. Sisa saldo pos ini tinggal ${formatRupiah(health.remaining)}. Harap jaga pengeluaran!`,
          percentage: health.percentage,
          timestamp: Date.now(),
          read: false,
        };
        setNotifications((prev) => [warningNotif, ...prev]);
      } else if (health.health === 'danger' || health.health === 'overbudget') {
        const dangerNotif: BudgetNotification = {
          id: `notif_${Date.now()}`,
          categoryId: targetCat.id,
          categoryName: targetCat.name,
          type: 'danger',
          title: `🚨 Peringatan Boncos: Pos ${targetCat.name} Masuk Kondisi Kritis!`,
          message:
            health.remaining < 0
              ? `Pos ${targetCat.name} telah OVERBUDGET sebesar ${formatRupiah(Math.abs(health.remaining))}!`
              : `Pos ${targetCat.name} sudah terpakai ${health.percentage.toFixed(0)}% (Sisa hanya ${formatRupiah(health.remaining)}).`,
          percentage: health.percentage,
          timestamp: Date.now(),
          read: false,
        };
        setNotifications((prev) => [dangerNotif, ...prev]);
      }
    }
  };

  // Delete an Expense
  const handleDeleteExpense = (id: string) => {
    const targetExpense = currentMonthData.expenses.find((e) => e.id === id);
    openConfirmation(
      'Hapus Catatan Pengeluaran',
      `Hapus catatan pengeluaran "${targetExpense?.description || 'ini'}" (${formatRupiah(targetExpense?.amount || 0)})? Sisa saldo pos terkait akan dikembalikan.`,
      () => {
        setAllMonthsData((prev) => ({
          ...prev,
          [currentMonth]: {
            ...currentMonthData,
            expenses: currentMonthData.expenses.filter((e) => e.id !== id),
            lastUpdated: Date.now(),
          },
        }));
      }
    );
  };

  // Edit an existing Expense
  const handleSaveEditedExpense = (updatedExpense: Expense) => {
    const updatedExpenses = currentMonthData.expenses.map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    );

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        expenses: updatedExpenses,
        lastUpdated: Date.now(),
      },
    }));

    // Re-check category health for notification
    const targetCat = currentMonthData.categories.find((c) => c.id === updatedExpense.categoryId);
    if (targetCat && targetCat.allocatedAmount > 0) {
      const totalSpent = calculateCategorySpent(targetCat.id, updatedExpenses);
      const health = getCategoryHealth(totalSpent, targetCat.allocatedAmount);
      if (health.health === 'warning' || health.health === 'danger' || health.health === 'overbudget') {
        const notif: BudgetNotification = {
          id: `notif_${Date.now()}`,
          categoryId: targetCat.id,
          categoryName: targetCat.name,
          type: health.health === 'warning' ? 'warning' : 'danger',
          title: `Update Pengeluaran: Pos ${targetCat.name}`,
          message: `Transaksi "${updatedExpense.description}" diubah (${formatRupiah(updatedExpense.amount)}). Saldo terpakai: ${health.percentage.toFixed(0)}%.`,
          percentage: health.percentage,
          timestamp: Date.now(),
          read: false,
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  // Edit an existing Additional Income
  const handleSaveEditedIncome = (updatedIncome: AdditionalIncome) => {
    const oldIncome = (currentMonthData.additionalIncomes || []).find((i) => i.id === updatedIncome.id);
    let updatedCategories = [...currentMonthData.categories];

    // Revert old allocation
    if (oldIncome) {
      if (oldIncome.allocationMode === 'specific_category' && oldIncome.targetCategoryId) {
        updatedCategories = updatedCategories.map((cat) => {
          if (cat.id === oldIncome.targetCategoryId) {
            return { ...cat, allocatedAmount: Math.max(0, cat.allocatedAmount - oldIncome.amount) };
          }
          return cat;
        });
      } else if (oldIncome.allocationMode === 'proportional') {
        updatedCategories = updatedCategories.map((cat) => {
          const deducted = Math.round((oldIncome.amount * cat.percentage) / 100);
          return { ...cat, allocatedAmount: Math.max(0, cat.allocatedAmount - deducted) };
        });
      }
    }

    // Apply new allocation
    if (updatedIncome.allocationMode === 'specific_category' && updatedIncome.targetCategoryId) {
      updatedCategories = updatedCategories.map((cat) => {
        if (cat.id === updatedIncome.targetCategoryId) {
          return { ...cat, allocatedAmount: cat.allocatedAmount + updatedIncome.amount };
        }
        return cat;
      });
    } else if (updatedIncome.allocationMode === 'proportional' && updatedCategories.length > 0) {
      updatedCategories = updatedCategories.map((cat) => {
        const added = Math.round((updatedIncome.amount * cat.percentage) / 100);
        return { ...cat, allocatedAmount: cat.allocatedAmount + added };
      });
    }

    const updatedIncomes = (currentMonthData.additionalIncomes || []).map((i) =>
      i.id === updatedIncome.id ? updatedIncome : i
    );

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        categories: updatedCategories,
        additionalIncomes: updatedIncomes,
        lastUpdated: Date.now(),
      },
    }));
  };

  // Bulk Delete Transactions (Expenses and Incomes)
  const handleBulkDeleteTransactions = (expenseIds: string[], incomeIds: string[]) => {
    const expenseSet = new Set(expenseIds);
    const incomeSet = new Set(incomeIds);

    let updatedCategories = [...currentMonthData.categories];
    const incomesToDelete = (currentMonthData.additionalIncomes || []).filter((i) => incomeSet.has(i.id));

    // Deduct categories allocated from deleted incomes
    incomesToDelete.forEach((inc) => {
      if (inc.allocationMode === 'specific_category' && inc.targetCategoryId) {
        updatedCategories = updatedCategories.map((cat) => {
          if (cat.id === inc.targetCategoryId) {
            return { ...cat, allocatedAmount: Math.max(0, cat.allocatedAmount - inc.amount) };
          }
          return cat;
        });
      } else if (inc.allocationMode === 'proportional') {
        updatedCategories = updatedCategories.map((cat) => {
          const deducted = Math.round((inc.amount * cat.percentage) / 100);
          return { ...cat, allocatedAmount: Math.max(0, cat.allocatedAmount - deducted) };
        });
      }
    });

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        categories: updatedCategories,
        expenses: currentMonthData.expenses.filter((e) => !expenseSet.has(e.id)),
        additionalIncomes: (currentMonthData.additionalIncomes || []).filter((i) => !incomeSet.has(i.id)),
        lastUpdated: Date.now(),
      },
    }));
  };

  // Bulk Update Expense Category
  const handleBulkUpdateExpenseCategory = (expenseIds: string[], targetCategoryId: string) => {
    const targetCat = currentMonthData.categories.find((c) => c.id === targetCategoryId);
    if (!targetCat) return;

    const expenseSet = new Set(expenseIds);
    const updatedExpenses = currentMonthData.expenses.map((e) =>
      expenseSet.has(e.id) ? { ...e, categoryId: targetCategoryId } : e
    );

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        expenses: updatedExpenses,
        lastUpdated: Date.now(),
      },
    }));
  };

  // Bulk Update Date for Transactions
  const handleBulkUpdateDate = (expenseIds: string[], incomeIds: string[], targetDate: string) => {
    const expenseSet = new Set(expenseIds);
    const incomeSet = new Set(incomeIds);

    const updatedExpenses = currentMonthData.expenses.map((e) =>
      expenseSet.has(e.id) ? { ...e, date: targetDate } : e
    );
    const updatedIncomes = (currentMonthData.additionalIncomes || []).map((i) =>
      incomeSet.has(i.id) ? { ...i, date: targetDate } : i
    );

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        expenses: updatedExpenses,
        additionalIncomes: updatedIncomes,
        lastUpdated: Date.now(),
      },
    }));
  };

  // Bulk Delete Goals
  const handleBulkDeleteGoals = (goalIds: string[]) => {
    const goalSet = new Set(goalIds);
    setFinancialGoals((prev) => prev.filter((g) => !goalSet.has(g.id)));
  };

  // Bulk Complete Goals
  const handleBulkCompleteGoals = (goalIds: string[]) => {
    const goalSet = new Set(goalIds);
    setFinancialGoals((prev) =>
      prev.map((g) => (goalSet.has(g.id) ? { ...g, currentAmount: g.targetAmount } : g))
    );
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Bulk Delete Incomes from Income Manager
  const handleBulkDeleteIncomes = (incomeIds: string[]) => {
    const incomeSet = new Set(incomeIds);
    let updatedCategories = [...currentMonthData.categories];
    const incomesToDelete = (currentMonthData.additionalIncomes || []).filter((i) => incomeSet.has(i.id));

    incomesToDelete.forEach((inc) => {
      if (inc.allocationMode === 'specific_category' && inc.targetCategoryId) {
        updatedCategories = updatedCategories.map((cat) => {
          if (cat.id === inc.targetCategoryId) {
            return { ...cat, allocatedAmount: Math.max(0, cat.allocatedAmount - inc.amount) };
          }
          return cat;
        });
      } else if (inc.allocationMode === 'proportional') {
        updatedCategories = updatedCategories.map((cat) => {
          const deducted = Math.round((inc.amount * cat.percentage) / 100);
          return { ...cat, allocatedAmount: Math.max(0, cat.allocatedAmount - deducted) };
        });
      }
    });

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        categories: updatedCategories,
        additionalIncomes: (currentMonthData.additionalIncomes || []).filter((i) => !incomeSet.has(i.id)),
        lastUpdated: Date.now(),
      },
    }));
  };

  // Delete a Category
  const handleDeleteCategory = (categoryId: string) => {
    if (currentMonthData.categories.length <= 1) {
      alert('Minimal harus ada satu pos kategori.');
      return;
    }
    const catToDelete = currentMonthData.categories.find((c) => c.id === categoryId);
    openConfirmation(
      'Hapus Pos Anggaran',
      `Hapus pos anggaran "${catToDelete?.name || 'ini'}"? Catatan transaksi yang sudah dicatat pada pos ini tetap tersimpan di riwayat.`,
      () => {
        setAllMonthsData((prev) => ({
          ...prev,
          [currentMonth]: {
            ...currentMonthData,
            categories: currentMonthData.categories.filter((c) => c.id !== categoryId),
            lastUpdated: Date.now(),
          },
        }));
      }
    );
  };

  // Reset month data
  const handleResetData = () => {
    openConfirmation(
      'Atur Ulang Data Bulan Ini',
      `Atur ulang seluruh data anggaran, pos kategori, dan pengeluaran untuk bulan ${formatMonthYearTitle(currentMonth)}? Tindakan ini tidak dapat dibatalkan.`,
      () => {
        setAllMonthsData((prev) => {
          const copy = { ...prev };
          delete copy[currentMonth];
          return copy;
        });
      },
      'Atur Ulang'
    );
  };

  // Quick spend modal trigger from a specific card
  const handleQuickSpendCategory = (category: Category) => {
    setSelectedQuickSpendCategory(category.id);
    setIsExpenseModalOpen(true);
  };

  // --- Additional Income Handlers ---
  const handleAddAdditionalIncome = (incomeData: Omit<AdditionalIncome, 'id' | 'createdAt'>) => {
    const newIncome: AdditionalIncome = {
      ...incomeData,
      id: `inc_${Date.now()}`,
      createdAt: Date.now(),
    };

    let updatedCategories = [...currentMonthData.categories];

    // If allocation mode is specific_category, increment that category's allocatedAmount
    if (incomeData.allocationMode === 'specific_category' && incomeData.targetCategoryId) {
      updatedCategories = updatedCategories.map((cat) => {
        if (cat.id === incomeData.targetCategoryId) {
          return {
            ...cat,
            allocatedAmount: cat.allocatedAmount + incomeData.amount,
          };
        }
        return cat;
      });
    } else if (incomeData.allocationMode === 'proportional' && updatedCategories.length > 0) {
      // Proportional allocation across existing categories based on percentages
      updatedCategories = updatedCategories.map((cat) => {
        const addedAmount = Math.round((incomeData.amount * cat.percentage) / 100);
        return {
          ...cat,
          allocatedAmount: cat.allocatedAmount + addedAmount,
        };
      });
    }

    const updatedIncomes = [newIncome, ...(currentMonthData.additionalIncomes || [])];

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        categories: updatedCategories,
        additionalIncomes: updatedIncomes,
        lastUpdated: Date.now(),
      },
    }));

    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.6 },
    });

    const notif: BudgetNotification = {
      id: `notif_${Date.now()}`,
      categoryId: incomeData.targetCategoryId || '',
      categoryName: 'Pemasukan Tambahan',
      type: 'info',
      title: `Pemasukan Tambahan Dicatat: +${formatRupiah(incomeData.amount)}`,
      message: `Sumber "${incomeData.sourceName}" (${incomeData.incomeType}) berhasil ditambahkan ke arus kas bulan ini.`,
      percentage: 0,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleDeleteAdditionalIncome = (incomeId: string) => {
    const incomeToDelete = (currentMonthData.additionalIncomes || []).find((i) => i.id === incomeId);
    if (!incomeToDelete) return;

    openConfirmation(
      'Hapus Catatan Pemasukan',
      `Hapus pemasukan tambahan "${incomeToDelete.sourceName}" (${formatRupiah(incomeToDelete.amount)})?`,
      () => {
        let updatedCategories = [...currentMonthData.categories];
        if (incomeToDelete.allocationMode === 'specific_category' && incomeToDelete.targetCategoryId) {
          updatedCategories = updatedCategories.map((cat) => {
            if (cat.id === incomeToDelete.targetCategoryId) {
              return {
                ...cat,
                allocatedAmount: Math.max(0, cat.allocatedAmount - incomeToDelete.amount),
              };
            }
            return cat;
          });
        } else if (incomeToDelete.allocationMode === 'proportional') {
          updatedCategories = updatedCategories.map((cat) => {
            const deducted = Math.round((incomeToDelete.amount * cat.percentage) / 100);
            return {
              ...cat,
              allocatedAmount: Math.max(0, cat.allocatedAmount - deducted),
            };
          });
        }

        setAllMonthsData((prev) => ({
          ...prev,
          [currentMonth]: {
            ...currentMonthData,
            categories: updatedCategories,
            additionalIncomes: (currentMonthData.additionalIncomes || []).filter((i) => i.id !== incomeId),
            lastUpdated: Date.now(),
          },
        }));
      }
    );
  };

  // --- Financial Goals Handlers ---
  const handleSaveGoal = (
    goalData: Omit<FinancialGoal, 'id' | 'createdAt' | 'contributions'>,
    goalId?: string
  ) => {
    if (goalId) {
      // Edit existing goal
      setFinancialGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            return {
              ...g,
              ...goalData,
            };
          }
          return g;
        })
      );
    } else {
      // Create new goal
      const newGoal: FinancialGoal = {
        ...goalData,
        id: `goal_${Date.now()}`,
        createdAt: Date.now(),
        contributions: goalData.currentAmount > 0 ? [
          {
            id: `contrib_${Date.now()}`,
            goalId: `goal_${Date.now()}`,
            amount: goalData.currentAmount,
            date: new Date().toISOString().split('T')[0],
            monthKey: currentMonth,
            sourceType: 'direct_deposit',
            notes: 'Setoran saldo awal',
            createdAt: Date.now(),
          }
        ] : [],
      };

      setFinancialGoals((prev) => [newGoal, ...prev]);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
      });
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    const targetGoal = financialGoals.find((g) => g.id === goalId);
    openConfirmation(
      'Hapus Target Finansial',
      `Hapus target finansial "${targetGoal?.name || 'ini'}"? Seluruh riwayat setoran pada target ini akan dihapus.`,
      () => {
        setFinancialGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    );
  };

  const handleAddGoalContribution = (
    goalId: string,
    contributionData: Omit<GoalContribution, 'id' | 'createdAt'>,
    createExpenseInCategoryId?: string
  ) => {
    const newContrib: GoalContribution = {
      ...contributionData,
      id: `contrib_${Date.now()}`,
      createdAt: Date.now(),
    };

    // Update goal's accumulated amount & contributions
    setFinancialGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updatedAmount = g.currentAmount + contributionData.amount;
          return {
            ...g,
            currentAmount: updatedAmount,
            contributions: [newContrib, ...(g.contributions || [])],
          };
        }
        return g;
      })
    );

    // If source is category savings, automatically log an expense transaction in the monthly data!
    if (createExpenseInCategoryId) {
      const targetGoal = financialGoals.find((g) => g.id === goalId);
      const newExpense: Expense = {
        id: `exp_goal_${Date.now()}`,
        categoryId: createExpenseInCategoryId,
        amount: contributionData.amount,
        description: `Setoran Target: ${targetGoal?.name || 'Target Finansial'}`,
        date: contributionData.date,
        notes: contributionData.notes || 'Alokasi otomatis dari pos tabungan ke target finansial',
        createdAt: Date.now(),
        linkedGoalId: goalId,
      };

      setAllMonthsData((prev) => ({
        ...prev,
        [currentMonth]: {
          ...currentMonthData,
          expenses: [newExpense, ...currentMonthData.expenses],
          lastUpdated: Date.now(),
        },
      }));
    }

    // Add info notification
    const targetGoal = financialGoals.find((g) => g.id === goalId);
    const newNotif: BudgetNotification = {
      id: `notif_${Date.now()}`,
      categoryId: createExpenseInCategoryId || '',
      categoryName: 'Target Finansial',
      type: 'info',
      title: `Setoran Berhasil: ${targetGoal?.name || 'Target'}`,
      message: `Setoran ${formatRupiah(contributionData.amount)} telah berhasil dicatat. Progres target finansial Anda meningkat!`,
      percentage: 0,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDeleteContribution = (goalId: string, contributionId: string) => {
    openConfirmation(
      'Hapus Catatan Setoran',
      'Hapus catatan setoran ini? Saldo terkumpul target akan dikurangi sesuai nominal setoran yang dihapus.',
      () => {
        setFinancialGoals((prev) =>
          prev.map((g) => {
            if (g.id === goalId) {
              const contribToDelete = g.contributions?.find((c) => c.id === contributionId);
              const deductAmount = contribToDelete ? contribToDelete.amount : 0;
              return {
                ...g,
                currentAmount: Math.max(0, g.currentAmount - deductAmount),
                contributions: g.contributions?.filter((c) => c.id !== contributionId) || [],
              };
            }
            return g;
          })
        );
      }
    );
  };

  // --- Next Month Planner Handler ---
  const handleSaveNextMonthPlan = (
    targetMonthKey: string,
    income: number,
    categories: Category[],
    rolloverSurplus: number,
    notes: string,
    switchToMonthImmediately: boolean
  ) => {
    const existing = allMonthsData[targetMonthKey] || {
      monthKey: targetMonthKey,
      expenses: [],
      lastUpdated: Date.now(),
    };

    const updatedMonthData: MonthlyData = {
      ...existing,
      monthKey: targetMonthKey,
      monthlyIncome: income + rolloverSurplus,
      categories,
      surplusRolloverFromPrevMonth: rolloverSurplus,
      notesForMonth: notes,
      lastUpdated: Date.now(),
    };

    setAllMonthsData((prev) => ({
      ...prev,
      [targetMonthKey]: updatedMonthData,
    }));

    // Notification
    const notif: BudgetNotification = {
      id: `notif_${Date.now()}`,
      categoryId: '',
      categoryName: 'Rencana Bulan Depan',
      type: 'info',
      title: `Rencana Anggaran ${formatMonthYearTitle(targetMonthKey)} Tersimpan!`,
      message: `Konfigurasi gaji ${formatRupiah(income + rolloverSurplus)} dan ${categories.length} pos telah disiapkan untuk bulan depan.`,
      percentage: 0,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (switchToMonthImmediately) {
      setCurrentMonth(targetMonthKey);
    }
  };

  // Filter categories by group tab
  const filteredCategories = currentMonthData.categories.filter((cat) => {
    if (activeGroupFilter === 'all') return true;
    return cat.group === activeGroupFilter;
  });

  const totalAdditionalIncome = (currentMonthData.additionalIncomes || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalCombinedIncome = currentMonthData.monthlyIncome + totalAdditionalIncome;

  // Handler for restoring full JSON backup
  const handleImportBackup = (backupData: { allMonthsData: Record<string, MonthlyData>; financialGoals: FinancialGoal[] }) => {
    if (backupData.allMonthsData) {
      setAllMonthsData(backupData.allMonthsData);
    }
    if (backupData.financialGoals) {
      setFinancialGoals(backupData.financialGoals);
    }
  };

  // --- Multi-Wallet & Account Handlers ---
  const handleAddWallet = (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: `wallet_${Date.now()}`,
    };
    setWallets((prev) => [...prev, newWallet]);
  };

  const handleEditWallet = (walletData: Omit<Wallet, 'id'>) => {
    if (!editingWallet) return;
    setWallets((prev) =>
      prev.map((w) => (w.id === editingWallet.id ? { ...walletData, id: editingWallet.id } : w))
    );
    setEditingWallet(null);
  };

  const handleDeleteWallet = (walletId: string) => {
    const targetWallet = wallets.find((w) => w.id === walletId);
    openConfirmation(
      'Hapus Dompet / Rekening',
      `Hapus rekening "${targetWallet?.name || 'ini'}"? Transaksi yang menggunakan rekening ini tidak akan terhapus, tetapi riwayat rekening akan disesuaikan.`,
      () => {
        setWallets((prev) => prev.filter((w) => w.id !== walletId));
      }
    );
  };

  const handleAddTransfer = (transferData: Omit<WalletTransfer, 'id' | 'createdAt'>) => {
    const newTransfer: WalletTransfer = {
      ...transferData,
      id: `transfer_${Date.now()}`,
      createdAt: Date.now(),
    };
    setTransfers((prev) => [newTransfer, ...prev]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleDeleteTransfer = (transferId: string) => {
    openConfirmation('Hapus Riwayat Transfer', 'Hapus catatan transfer antar dompet ini?', () => {
      setTransfers((prev) => prev.filter((t) => t.id !== transferId));
    });
  };

  // --- Recurring Bills Handlers ---
  const handleSaveBill = (billData: Omit<RecurringBill, 'id' | 'createdAt' | 'paidMonthKeys'>) => {
    if (editingBill) {
      setRecurringBills((prev) =>
        prev.map((b) =>
          b.id === editingBill.id
            ? { ...b, ...billData }
            : b
        )
      );
      setEditingBill(null);
    } else {
      const newBill: RecurringBill = {
        ...billData,
        id: `bill_${Date.now()}`,
        paidMonthKeys: [],
        createdAt: Date.now(),
      };
      setRecurringBills((prev) => [...prev, newBill]);
    }
  };

  const handleDeleteBill = (billId: string) => {
    const targetBill = recurringBills.find((b) => b.id === billId);
    openConfirmation(
      'Hapus Pengingat Tagihan',
      `Hapus pengingat "${targetBill?.name || 'tagihan ini'}"?`,
      () => {
        setRecurringBills((prev) => prev.filter((b) => b.id !== billId));
      }
    );
  };

  const handlePayBill = (bill: RecurringBill) => {
    // 1. Mark bill as paid for current month
    setRecurringBills((prev) =>
      prev.map((b) => {
        if (b.id === bill.id && !b.paidMonthKeys.includes(currentMonth)) {
          return {
            ...b,
            paidMonthKeys: [...b.paidMonthKeys, currentMonth],
          };
        }
        return b;
      })
    );

    // 2. Automatically log an expense transaction in the current month
    const newExpense: Expense = {
      id: `exp_bill_${Date.now()}`,
      categoryId: bill.categoryId,
      amount: bill.amount,
      description: `Tagihan Rutin: ${bill.name}`,
      date: new Date().toISOString().slice(0, 10),
      notes: bill.notes || `Pembayaran tagihan rutin bulanan jatuh tempo tgl ${bill.dueDateDay}`,
      walletId: bill.walletId,
      linkedBillId: bill.id,
      createdAt: Date.now(),
    };

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        expenses: [newExpense, ...currentMonthData.expenses],
        lastUpdated: Date.now(),
      },
    }));

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleUnpayBill = (billId: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            paidMonthKeys: b.paidMonthKeys.filter((k) => k !== currentMonth),
          };
        }
        return b;
      })
    );
  };

  // --- Smart OCR Receipt Scan Handler ---
  const handleSaveScannedExpense = (expenseData: {
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    notes?: string;
    receiptImage?: string;
    walletId?: string;
  }) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_scan_${Date.now()}`,
      createdAt: Date.now(),
    };

    setAllMonthsData((prev) => ({
      ...prev,
      [currentMonth]: {
        ...currentMonthData,
        expenses: [newExpense, ...currentMonthData.expenses],
        lastUpdated: Date.now(),
      },
    }));

    setIsReceiptScannerOpen(false);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };


  // Handler for importing parsed Excel/CSV transactions into a specific month
  const handleImportTransactions = (
    importedExpenses: Expense[],
    importedIncomes: AdditionalIncome[],
    targetMonthKey: string
  ) => {
    setAllMonthsData((prev) => {
      const existing = prev[targetMonthKey] || {
        monthKey: targetMonthKey,
        monthlyIncome: 0,
        categories: generateCategoriesFromPreset(BUDGET_PRESETS[0], 0),
        expenses: [],
        additionalIncomes: [],
        lastUpdated: Date.now(),
      };

      return {
        ...prev,
        [targetMonthKey]: {
          ...existing,
          expenses: [...existing.expenses, ...importedExpenses],
          additionalIncomes: [...(existing.additionalIncomes || []), ...importedIncomes],
          lastUpdated: Date.now(),
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex font-sans selection:bg-indigo-600 selection:text-white relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(7,13,24,0))] pointer-events-none -z-10" />

      {/* Fixed Sidebar Navigation (Stay stationary / tidak ikut terscroll) */}
      <Sidebar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenExpenseModal={() => {
          setSelectedQuickSpendCategory(undefined);
          setIsExpenseModalOpen(true);
        }}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onOpenAddIncomeModal={() => setIsAddIncomeModalOpen(true)}
        onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
        onOpenNextMonthPlanner={() => setIsNextMonthPlannerOpen(true)}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onExportData={() => setIsExportModalOpen(true)}
        onResetData={handleResetData}
        totalIncome={totalCombinedIncome}
        categoriesCount={currentMonthData.categories.length}
        expensesCount={currentMonthData.expenses.length + (currentMonthData.additionalIncomes || []).length}
        goalsCount={financialGoals.length}
        billsCount={recurringBills.length}
        walletsCount={wallets.length}
      />

      {/* Main Content Area (Independent scroll container while sidebar remains anchored) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen md:pl-64 lg:pl-72 transition-all">
        {/* Header Bar */}
        <Header
          currentMonth={currentMonth}
          onChangeMonth={(newMonth) => setCurrentMonth(newMonth)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
          onOpenExpenseModal={() => {
            setSelectedQuickSpendCategory(undefined);
            setIsExpenseModalOpen(true);
          }}
          onOpenAddIncomeModal={() => setIsAddIncomeModalOpen(true)}
          onOpenNotificationDrawer={() => setIsNotificationDrawerOpen(true)}
          onOpenNextMonthPlanner={() => setIsNextMonthPlannerOpen(true)}
          onOpenGoalModal={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
          onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
          onOpenAddBill={() => {
            setEditingBill(null);
            setIsAddBillModalOpen(true);
          }}
          onOpenAddWallet={() => {
            setEditingWallet(null);
            setIsAddWalletModalOpen(true);
          }}
          notifications={notifications}
          onResetData={handleResetData}
          onExportData={() => setIsExportModalOpen(true)}
          totalIncome={totalCombinedIncome}
        />

        {/* Main Bento Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6 pb-20">
        
        {!hasSalarySet ? (
          /* STEP 1: Initial Salary Input & Auto-Allocation Setup */
          <div className="py-6 sm:py-10">
            <SalaryInputCard
              onSetSalaryAndPreset={handleSetSalaryAndPreset}
              currentIncome={currentMonthData.monthlyIncome}
            />
          </div>
        ) : (
          /* ACTIVE FINANCIAL DASHBOARD VIEWS */
          <>
            {/* View Tab 1: Ringkasan / Overview (All) */}
            {activeNavTab === 'all' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Top Summary & Financial Health Score */}
                <BudgetSummaryStats
                  totalIncome={totalCombinedIncome}
                  baseSalary={currentMonthData.monthlyIncome}
                  additionalIncomes={currentMonthData.additionalIncomes || []}
                  categories={currentMonthData.categories}
                  expenses={currentMonthData.expenses}
                  monthKey={currentMonth}
                  onEditSalary={() => setIsSalaryModalOpen(true)}
                  onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
                  onOpenAddIncome={() => setIsAddIncomeModalOpen(true)}
                  onOpenIncomeManager={() => setIsIncomeManagerModalOpen(true)}
                />

                {/* Line Chart: Pemasukan vs Pengeluaran (Arus Kas & Akumulasi) */}
                <IncomeExpenseLineChart
                  monthKey={currentMonth}
                  monthlyIncome={currentMonthData.monthlyIncome}
                  additionalIncomes={currentMonthData.additionalIncomes || []}
                  expenses={currentMonthData.expenses}
                />

                {/* Anti-Boncos Active Alerts */}
                <AntiBoncosAlerts
                  categories={currentMonthData.categories}
                  expenses={currentMonthData.expenses}
                  monthKey={currentMonth}
                  onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
                  onQuickSpend={handleQuickSpendCategory}
                />

                {/* Transaction & Receipt History */}
                <div className="pt-1">
                  <ExpenseList
                    expenses={currentMonthData.expenses}
                    categories={currentMonthData.categories}
                    additionalIncomes={currentMonthData.additionalIncomes || []}
                    onDeleteExpense={handleDeleteExpense}
                    onDeleteIncome={handleDeleteAdditionalIncome}
                    onOpenAddExpenseModal={() => {
                      setSelectedQuickSpendCategory(undefined);
                      setIsExpenseModalOpen(true);
                    }}
                    onOpenAddIncomeModal={() => setIsAddIncomeModalOpen(true)}
                    onOpenEditExpense={(expense) => {
                      setSelectedExpenseForEdit(expense);
                      setIsEditExpenseModalOpen(true);
                    }}
                    onOpenEditIncome={(income) => {
                      setSelectedIncomeForEdit(income);
                      setIsEditIncomeModalOpen(true);
                    }}
                    onBulkDelete={handleBulkDeleteTransactions}
                    onBulkUpdateCategory={handleBulkUpdateExpenseCategory}
                    onBulkUpdateDate={handleBulkUpdateDate}
                    onOpenExportModal={() => setIsExportModalOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* View Tab 2: Pos Anggaran Only */}
            {activeNavTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Pos Anggaran Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 bg-[#111C30] p-5 rounded-3xl border border-slate-800">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-950/70 text-indigo-400 border border-indigo-800/60">
                        <Layers className="w-5 h-5" />
                      </div>
                      Daftar Pos Alokasi Anggaran ({currentMonthData.categories.length})
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Kelola pembagian pos, atur persentase, dan pantau pengeluaran per kategori.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-950/60 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Kelola & Tambah Pos
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Semua Pos' },
                    { id: 'pokok', label: 'Kebutuhan Pokok' },
                    { id: 'kewajiban', label: 'Kewajiban & Tagihan' },
                    { id: 'keinginan', label: 'Keinginan & Lifestyle' },
                    { id: 'tabungan', label: 'Tabungan & Investasi' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveGroupFilter(tab.id)}
                      className={`text-xs px-4 py-2.5 rounded-2xl font-semibold transition-all shrink-0 ${
                        activeGroupFilter === tab.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60 ring-1 ring-indigo-400/30'
                          : 'bg-[#111C30] text-slate-400 border border-slate-800 hover:bg-[#16233B] hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      expenses={currentMonthData.expenses}
                      onQuickSpend={handleQuickSpendCategory}
                      onEditCategory={() => setIsCategoryModalOpen(true)}
                      onDeleteCategory={handleDeleteCategory}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* View Tab 3: Transaksi & Struk Only */}
            {activeNavTab === 'transactions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <ExpenseList
                  expenses={currentMonthData.expenses}
                  categories={currentMonthData.categories}
                  additionalIncomes={currentMonthData.additionalIncomes || []}
                  onDeleteExpense={handleDeleteExpense}
                  onDeleteIncome={handleDeleteAdditionalIncome}
                  onOpenAddExpenseModal={() => {
                    setSelectedQuickSpendCategory(undefined);
                    setIsExpenseModalOpen(true);
                  }}
                  onOpenAddIncomeModal={() => setIsAddIncomeModalOpen(true)}
                  onOpenEditExpense={(expense) => {
                    setSelectedExpenseForEdit(expense);
                    setIsEditExpenseModalOpen(true);
                  }}
                  onOpenEditIncome={(income) => {
                    setSelectedIncomeForEdit(income);
                    setIsEditIncomeModalOpen(true);
                  }}
                  onBulkDelete={handleBulkDeleteTransactions}
                  onBulkUpdateCategory={handleBulkUpdateExpenseCategory}
                  onBulkUpdateDate={handleBulkUpdateDate}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                />
              </div>
            )}

            {/* View Tab 4: Target Impian Only */}
            {activeNavTab === 'goals' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <FinancialGoalsSection
                  goals={financialGoals}
                  categories={currentMonthData.categories}
                  currentMonth={currentMonth}
                  onOpenCreateGoalModal={() => {
                    setEditingGoal(null);
                    setIsGoalModalOpen(true);
                  }}
                  onOpenEditGoalModal={(goal) => {
                    setEditingGoal(goal);
                    setIsGoalModalOpen(true);
                  }}
                  onOpenContributionModal={(goal) => {
                    setSelectedGoalForContribution(goal);
                    setIsContributionModalOpen(true);
                  }}
                  onDeleteGoal={handleDeleteGoal}
                  onDeleteContribution={handleDeleteContribution}
                  onBulkDeleteGoals={handleBulkDeleteGoals}
                  onBulkCompleteGoals={handleBulkCompleteGoals}
                />
              </div>
            )}

            {/* View Tab: Tagihan Rutin (Bills) */}
            {activeNavTab === 'bills' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <BillManagerSection
                  bills={recurringBills}
                  categories={currentMonthData.categories}
                  wallets={wallets}
                  currentMonthKey={currentMonth}
                  onAddBillClick={() => {
                    setEditingBill(null);
                    setIsAddBillModalOpen(true);
                  }}
                  onEditBill={(bill) => {
                    setEditingBill(bill);
                    setIsAddBillModalOpen(true);
                  }}
                  onDeleteBill={handleDeleteBill}
                  onPayBill={handlePayBill}
                  onUnpayBill={handleUnpayBill}
                />
              </div>
            )}

            {/* View Tab: Multi-Rekening & Dompet (Wallets) */}
            {activeNavTab === 'wallets' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <WalletManagerSection
                  wallets={wallets}
                  transfers={transfers}
                  allExpenses={(Object.values(allMonthsData) as MonthlyData[]).flatMap((m) => m.expenses || [])}
                  allIncomes={(Object.values(allMonthsData) as MonthlyData[]).flatMap((m) => m.additionalIncomes || [])}
                  monthlyBaseSalary={currentMonthData.monthlyIncome}
                  onAddWalletClick={() => {
                    setEditingWallet(null);
                    setIsAddWalletModalOpen(true);
                  }}
                  onTransferClick={() => setIsWalletTransferModalOpen(true)}
                  onEditWallet={(wallet) => {
                    setEditingWallet(wallet);
                    setIsAddWalletModalOpen(true);
                  }}
                  onDeleteWallet={handleDeleteWallet}
                  onDeleteTransfer={handleDeleteTransfer}
                />
              </div>
            )}

            {/* View Tab: Analisis & Perbandingan Bulanan (Comparison) */}
            {activeNavTab === 'comparison' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <MonthlyComparisonSection
                  allMonthlyData={allMonthsData}
                  currentMonthKey={currentMonth}
                />
              </div>
            )}

            {/* View Tab: Kalkulator & Simulator Finansial (Simulators) */}
            {activeNavTab === 'simulators' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <FinancialSimulatorsSection
                  monthlyExpensesAverage={
                    currentMonthData.expenses.reduce((acc, e) => acc + e.amount, 0) ||
                    currentMonthData.monthlyIncome * 0.7 ||
                    5000000
                  }
                />
              </div>
            )}

            {/* View Tab: Asisten AI Only */}
            {activeNavTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <AiFinancialAdvisorSection
                  monthKey={currentMonth}
                  monthlyIncome={currentMonthData.monthlyIncome}
                  additionalIncomes={currentMonthData.additionalIncomes || []}
                  categories={currentMonthData.categories}
                  expenses={currentMonthData.expenses}
                  goals={financialGoals}
                  onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
                  onQuickSpendCategory={handleQuickSpendCategory}
                />
              </div>
            )}

          </>
        )}
      </main>
      </div>

      {/* Modals & Drawers */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={currentMonthData.categories}
        totalIncome={totalCombinedIncome}
        onSaveCategories={handleSaveCategories}
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setSelectedQuickSpendCategory(undefined);
        }}
        categories={currentMonthData.categories}
        expenses={currentMonthData.expenses}
        wallets={wallets}
        onAddExpense={handleAddExpense}
        preselectedCategoryId={selectedQuickSpendCategory}
      />

      {/* Smart AI Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        categories={currentMonthData.categories}
        wallets={wallets}
        onSaveScannedExpense={handleSaveScannedExpense}
      />

      {/* Add / Edit Recurring Bill Modal */}
      <AddBillModal
        isOpen={isAddBillModalOpen}
        onClose={() => {
          setIsAddBillModalOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
        categories={currentMonthData.categories}
        wallets={wallets}
        editingBill={editingBill}
      />

      {/* Add / Edit Wallet Modal */}
      <AddWalletModal
        isOpen={isAddWalletModalOpen}
        onClose={() => {
          setIsAddWalletModalOpen(false);
          setEditingWallet(null);
        }}
        onSave={(walletData) => {
          if (editingWallet) {
            handleEditWallet(walletData);
          } else {
            handleAddWallet(walletData);
          }
          setIsAddWalletModalOpen(false);
        }}
        editingWallet={editingWallet}
      />

      {/* Inter-Wallet Transfer Modal */}
      <WalletTransferModal
        isOpen={isWalletTransferModalOpen}
        onClose={() => setIsWalletTransferModalOpen(false)}
        wallets={wallets}
        onSaveTransfer={(transferData) => {
          handleAddTransfer(transferData);
          setIsWalletTransferModalOpen(false);
        }}
      />


      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        categories={currentMonthData.categories}
        currentMonth={currentMonth}
        onAddIncome={handleAddAdditionalIncome}
      />

      <IncomeManagerModal
        isOpen={isIncomeManagerModalOpen}
        onClose={() => setIsIncomeManagerModalOpen(false)}
        baseSalary={currentMonthData.monthlyIncome}
        additionalIncomes={currentMonthData.additionalIncomes || []}
        monthKey={currentMonth}
        categories={currentMonthData.categories}
        onOpenAddIncomeModal={() => {
          setIsIncomeManagerModalOpen(false);
          setIsAddIncomeModalOpen(true);
        }}
        onOpenSalaryEditModal={() => {
          setIsIncomeManagerModalOpen(false);
          setIsSalaryModalOpen(true);
        }}
        onOpenEditIncome={(income) => {
          setSelectedIncomeForEdit(income);
          setIsEditIncomeModalOpen(true);
        }}
        onDeleteIncome={handleDeleteAdditionalIncome}
        onBulkDeleteIncomes={handleBulkDeleteIncomes}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={isEditExpenseModalOpen}
        onClose={() => {
          setIsEditExpenseModalOpen(false);
          setSelectedExpenseForEdit(null);
        }}
        expense={selectedExpenseForEdit}
        categories={currentMonthData.categories}
        expenses={currentMonthData.expenses}
        onSaveExpense={handleSaveEditedExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* Edit Income Modal */}
      <EditIncomeModal
        isOpen={isEditIncomeModalOpen}
        onClose={() => {
          setIsEditIncomeModalOpen(false);
          setSelectedIncomeForEdit(null);
        }}
        income={selectedIncomeForEdit}
        categories={currentMonthData.categories}
        onSaveIncome={handleSaveEditedIncome}
        onDeleteIncome={handleDeleteAdditionalIncome}
      />

      <SalaryEditModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        currentIncome={currentMonthData.monthlyIncome}
        onUpdateSalary={handleUpdateSalary}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearNotifications={() => setNotifications([])}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        monthlyData={currentMonthData}
        allMonthsData={allMonthsData}
        financialGoals={financialGoals}
        onImportBackup={handleImportBackup}
        onImportTransactions={handleImportTransactions}
      />

      {/* Financial Goals Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSaveGoal={handleSaveGoal}
        editingGoal={editingGoal}
        categories={currentMonthData.categories}
      />

      <GoalContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => {
          setIsContributionModalOpen(false);
          setSelectedGoalForContribution(null);
        }}
        goal={selectedGoalForContribution}
        categories={currentMonthData.categories}
        currentMonth={currentMonth}
        onAddContribution={handleAddGoalContribution}
      />

      {/* Next Month Budget Planner Modal */}
      <NextMonthPlannerModal
        isOpen={isNextMonthPlannerOpen}
        onClose={() => setIsNextMonthPlannerOpen(false)}
        currentMonth={currentMonth}
        currentMonthData={currentMonthData}
        allMonthsData={allMonthsData}
        goals={financialGoals}
        onSaveNextMonthPlan={handleSaveNextMonthPlan}
      />

      {/* Global Confirmation Modal */}
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
}
