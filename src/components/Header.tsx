import React from 'react';
import {
  Wallet,
  Bell,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Menu,
} from 'lucide-react';
import { BudgetNotification } from '../types';
import {
  formatMonthYearTitle,
  getPreviousMonthKey,
  getNextMonthKey,
} from '../utils/formatters';

export type ActiveNavTab =
  | 'all'
  | 'bills'
  | 'wallets'
  | 'comparison'
  | 'simulators'
  | 'categories'
  | 'transactions'
  | 'goals'
  | 'ai';

interface HeaderProps {
  currentMonth: string;
  onChangeMonth: (month: string) => void;
  onToggleMobileSidebar: () => void;
  onOpenSalaryModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenAddIncomeModal: () => void;
  onOpenNotificationDrawer: () => void;
  onOpenNextMonthPlanner: () => void;
  onOpenGoalModal: () => void;
  onOpenCategoryManager: () => void;
  onOpenReceiptScanner: () => void;
  onOpenAddBill: () => void;
  onOpenAddWallet: () => void;
  notifications: BudgetNotification[];
  onResetData: () => void;
  onExportData: () => void;
  totalIncome: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onChangeMonth,
  onToggleMobileSidebar,
  onOpenNotificationDrawer,
  notifications = [],
}) => {
  const unreadAlerts = (notifications || []).filter((n) => n && !n.read).length;

  const handlePrevMonth = () => {
    onChangeMonth(getPreviousMonthKey(currentMonth));
  };

  const handleNextMonth = () => {
    onChangeMonth(getNextMonthKey(currentMonth));
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Hamburger Toggle + Branding (Mobile) & Month Capsule (Desktop & Mobile) */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile Drawer */}
            <button
              type="button"
              id="header-sidebar-toggle-btn"
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 md:hidden border border-slate-800 transition-colors"
              title="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile-only Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-white">
                AturDuit
              </span>
            </div>

            {/* Month Stepper Capsule */}
            <div className="flex items-center gap-1 bg-[#111C30] border border-slate-800 rounded-2xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex items-center px-2 sm:px-3">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide cursor-pointer hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-400 hidden sm:inline" />
                  {formatMonthYearTitle(currentMonth)}
                </span>
                <input
                  type="month"
                  id="header-month-picker"
                  value={currentMonth}
                  onChange={(e) => e.target.value && onChangeMonth(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Pilih Bulan Spesifik"
                />
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Controls: Only Notification Bell */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Bell */}
            <button
              id="header-notification-btn"
              onClick={onOpenNotificationDrawer}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors"
              title="Notifikasi & Peringatan Boncos"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
