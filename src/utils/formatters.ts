import { Category, Expense, BudgetHealth } from '../types';

export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatNumberOnly(amount: number): string {
  if (!amount || isNaN(amount)) return '0';
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function calculateCategorySpent(categoryId: string, expenses: Expense[]): number {
  if (!expenses || !Array.isArray(expenses)) return 0;
  return expenses
    .filter((e) => e && e.categoryId === categoryId)
    .reduce((sum, e) => sum + (e?.amount || 0), 0);
}

export function getCategoryHealth(spent: number, budget: number): {
  health: BudgetHealth;
  percentage: number;
  remaining: number;
  label: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
  borderColor: string;
} {
  if (budget <= 0) {
    return {
      health: spent > 0 ? 'overbudget' : 'safe',
      percentage: spent > 0 ? 100 : 0,
      remaining: -spent,
      label: spent > 0 ? 'Melebihi Budget (0)' : 'Belum Ada Alokasi',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-600 dark:text-rose-400',
      barColor: 'bg-rose-500',
      borderColor: 'border-rose-500/40',
    };
  }

  const percentage = (spent / budget) * 100;
  const remaining = budget - spent;

  if (percentage >= 100) {
    return {
      health: 'overbudget',
      percentage: Math.min(percentage, 100),
      remaining,
      label: 'Habis / Overbudget!',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-700 dark:text-rose-400',
      barColor: 'bg-rose-500',
      borderColor: 'border-rose-400/50',
    };
  }

  if (percentage >= 85) {
    return {
      health: 'danger',
      percentage,
      remaining,
      label: 'Kritis (>85%)',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-700 dark:text-rose-400',
      barColor: 'bg-rose-500',
      borderColor: 'border-rose-400/40',
    };
  }

  if (percentage >= 70) {
    return {
      health: 'warning',
      percentage,
      remaining,
      label: 'Waspada (70-84%)',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-700 dark:text-amber-400',
      barColor: 'bg-amber-500',
      borderColor: 'border-amber-400/40',
    };
  }

  return {
    health: 'safe',
    percentage,
    remaining,
    label: 'Aman (<70%)',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    barColor: 'bg-emerald-500',
    borderColor: 'border-emerald-400/30',
  };
}

export function getRemainingDaysInMonth(monthKey?: string): number {
  const now = new Date();
  const year = monthKey ? parseInt(monthKey.split('-')[0], 10) : now.getFullYear();
  const month = monthKey ? parseInt(monthKey.split('-')[1], 10) - 1 : now.getMonth();
  
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  
  if (isCurrentMonth) {
    const today = now.getDate();
    return Math.max(1, lastDayOfMonth - today + 1);
  }
  return lastDayOfMonth;
}

export function formatIndonesianDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getNextMonthKey(currentMonthKey: string): string {
  try {
    const [yearStr, monthStr] = currentMonthKey.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  } catch {
    return currentMonthKey;
  }
}

export function getPreviousMonthKey(currentMonthKey: string): string {
  try {
    const [yearStr, monthStr] = currentMonthKey.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  } catch {
    return currentMonthKey;
  }
}

export function formatMonthYearTitle(monthKey: string): string {
  try {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
  } catch {
    return monthKey;
  }
}

export function calculateGoalStats(currentAmount: number, targetAmount: number, targetDateStr: string) {
  const percentage = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  
  // Calculate remaining months until target date
  const now = new Date();
  const targetDate = new Date(targetDateStr + 'T00:00:00');
  
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let remainingMonths = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
  if (remainingMonths < 1) remainingMonths = diffDays > 0 ? 1 : 0;
  
  const monthlyRecommendation = remainingMonths > 0 && remainingAmount > 0 
    ? Math.ceil(remainingAmount / remainingMonths) 
    : remainingAmount;

  return {
    percentage,
    remainingAmount,
    diffDays,
    remainingMonths: Math.max(0, remainingMonths),
    monthlyRecommendation,
    isCompleted: currentAmount >= targetAmount,
    isOverdue: diffDays < 0 && currentAmount < targetAmount,
  };
}
