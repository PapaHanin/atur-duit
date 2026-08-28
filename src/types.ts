export interface Category {
  id: string;
  name: string;
  group: 'kewajiban' | 'pokok' | 'keinginan' | 'tabungan' | 'lainnya';
  icon: string;
  description: string;
  percentage: number; // e.g. 30 for 30%
  allocatedAmount: number; // e.g. 3000000
  color: string; // Tailwind color theme identifier or hex
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  receiptImage?: string; // Base64 data URL of receipt / photo proof
  createdAt: number;
  linkedGoalId?: string; // Optional: if this expense is a deposit into a financial goal
  walletId?: string; // ID of the wallet/bank account used
  linkedBillId?: string; // ID of recurring bill if paid through bill manager
}

export type BudgetHealth = 'safe' | 'warning' | 'danger' | 'overbudget';

export interface Wallet {
  id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'cash' | 'investment' | 'other';
  initialBalance: number;
  accountNumber?: string;
  color: string;
  icon: string;
  isDefault?: boolean;
  notes?: string;
}

export interface WalletTransfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  fee?: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDateDay: number; // 1 to 31
  categoryId: string;
  walletId?: string;
  frequency: 'monthly' | 'yearly' | 'weekly';
  paidMonthKeys: string[]; // e.g. ['2026-08', '2026-07']
  icon: string;
  color: string;
  reminderDaysBefore?: number;
  notes?: string;
  createdAt: number;
}

export interface OcrReceiptResult {
  merchantName: string;
  date: string; // YYYY-MM-DD
  totalAmount: number;
  suggestedCategoryName: string;
  items: {
    name: string;
    price: number;
    qty?: number;
  }[];
  taxAmount?: number;
  notes?: string;
}

export interface BudgetPreset {
  id: string;
  name: string;
  description: string;
  allocations: {
    name: string;
    group: 'kewajiban' | 'pokok' | 'keinginan' | 'tabungan' | 'lainnya';
    icon: string;
    description: string;
    percentage: number;
    color: string;
  }[];
}

export interface BudgetNotification {
  id: string;
  categoryId: string;
  categoryName: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  percentage: number;
  timestamp: number;
  read: boolean;
}

export interface AdditionalIncome {
  id: string;
  sourceName: string; // e.g. "Freelance Web Design", "Bonus Kinerja", "Dividen Saham", "Hasil Jualan"
  incomeType: 'freelance' | 'bonus' | 'bisnis' | 'investasi' | 'hadiah' | 'lembur' | 'lainnya';
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  receiptImage?: string; // Base64 data URL of receipt / invoice / transfer proof
  allocationMode: 'proportional' | 'specific_category' | 'unallocated_surplus';
  targetCategoryId?: string;
  targetCategoryName?: string;
  walletId?: string;
  createdAt: number;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  monthKey: string; // '2026-08'
  sourceType: 'category_savings' | 'direct_deposit' | 'surplus_rollover';
  sourceCategoryName?: string;
  notes?: string;
  receiptImage?: string; // Base64 data URL of deposit proof / slip
  createdAt: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  linkedCategoryId?: string;
  categoryName?: string;
  icon: string;
  color: string;
  description?: string;
  createdAt: number;
  contributions: GoalContribution[];
}

export interface MonthlyData {
  monthKey: string; // '2026-08'
  monthlyIncome: number; // Base Salary / Gaji Pokok
  additionalIncomes?: AdditionalIncome[]; // Pemasukan tambahan selain gaji
  activePresetId?: string;
  categories: Category[];
  expenses: Expense[];
  lastUpdated: number;
  surplusRolloverFromPrevMonth?: number;
  notesForMonth?: string;
}

export interface AiDetectedPattern {
  title: string;
  type: 'warning' | 'positive' | 'opportunity';
  description: string;
  categoryName?: string;
  impactAmount?: number;
}

export interface AiCategorySavingTip {
  categoryId?: string;
  categoryName: string;
  savingTip: string;
  potentialMonthlySaving: number;
  priority: 'tinggi' | 'sedang' | 'rendah';
  actionItem: string;
}

export interface AiFinancialAdvice {
  healthScore: number;
  healthStatus: string;
  summary: string;
  detectedPatterns: AiDetectedPattern[];
  categorySavingTips: AiCategorySavingTip[];
  actionPlan: string[];
  monthlySavingsPotentialTotal: number;
  smartInsight: string;
  generatedAt?: number;
}

