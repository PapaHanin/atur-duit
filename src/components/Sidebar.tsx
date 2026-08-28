import React from 'react';
import {
  Wallet,
  LayoutDashboard,
  Calendar,
  CreditCard,
  Target,
  Sparkles,
  TrendingUp,
  Calculator,
  Layers,
  Camera,
  Plus,
  SlidersHorizontal,
  Download,
  CalendarDays,
  X,
  RefreshCw,
  PieChart,
  DollarSign,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { ActiveNavTab } from './Header';
import { formatRupiah } from '../utils/formatters';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenExpenseModal: () => void;
  onOpenReceiptScanner: () => void;
  onOpenAddIncomeModal: () => void;
  onOpenSalaryModal: () => void;
  onOpenNextMonthPlanner: () => void;
  onOpenCategoryManager: () => void;
  onExportData: () => void;
  onResetData: () => void;
  totalIncome: number;
  categoriesCount?: number;
  expensesCount?: number;
  goalsCount?: number;
  billsCount?: number;
  walletsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onOpenExpenseModal,
  onOpenReceiptScanner,
  onOpenAddIncomeModal,
  onOpenSalaryModal,
  onOpenNextMonthPlanner,
  onOpenCategoryManager,
  onExportData,
  onResetData,
  totalIncome,
  categoriesCount = 0,
  expensesCount = 0,
  goalsCount = 0,
  billsCount = 0,
  walletsCount = 0,
}) => {
  const primaryNavItems = [
    {
      id: 'all' as ActiveNavTab,
      label: 'Ringkasan Dashboard',
      shortLabel: 'Ringkasan',
      icon: LayoutDashboard,
      description: 'Arus kas & statistik pos',
    },
    {
      id: 'categories' as ActiveNavTab,
      label: 'Pos Anggaran',
      shortLabel: 'Pos Anggaran',
      icon: Layers,
      count: categoriesCount,
      description: 'Kelola pos & anti-boncos',
    },
    {
      id: 'bills' as ActiveNavTab,
      label: 'Tagihan Rutin',
      shortLabel: 'Tagihan',
      icon: Calendar,
      count: billsCount,
      description: 'Jatuh tempo PLN, WiFi & BPJS',
    },
    {
      id: 'wallets' as ActiveNavTab,
      label: 'Dompet & Rekening',
      shortLabel: 'Rekening',
      icon: Wallet,
      count: walletsCount,
      description: 'Multi-bank, e-wallet & cash',
    },
    {
      id: 'transactions' as ActiveNavTab,
      label: 'Riwayat Transaksi',
      shortLabel: 'Transaksi',
      icon: CreditCard,
      count: expensesCount,
      description: 'Daftar pengeluaran & filter',
    },
    {
      id: 'goals' as ActiveNavTab,
      label: 'Target & Impian',
      shortLabel: 'Target',
      icon: Target,
      count: goalsCount,
      description: 'Dana darurat & investasi',
    },
  ];

  const analysisNavItems = [
    {
      id: 'comparison' as ActiveNavTab,
      label: 'Evaluasi & MoM',
      shortLabel: 'Evaluasi',
      icon: TrendingUp,
      description: 'Perbandingan antar bulan',
    },
    {
      id: 'simulators' as ActiveNavTab,
      label: 'Kalkulator Finansial',
      shortLabel: 'Kalkulator',
      icon: Calculator,
      description: 'Simulasi dana & bunga majemuk',
    },
    {
      id: 'ai' as ActiveNavTab,
      label: 'Asisten Konsultan AI',
      shortLabel: 'Asisten AI',
      icon: Sparkles,
      highlight: true,
      description: 'Audit & strategi finansial cerdas',
    },
  ];

  const handleSelectNav = (tab: ActiveNavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden transition-opacity animate-in fade-in"
        />
      )}

      {/* Fixed Sidebar Container */}
      <aside
        id="app-fixed-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-[#0B1120] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        }`}
      >
        {/* Top Branding & Fast Entry Section */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-950/60 ring-1 ring-indigo-400/30">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    AturDuit
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded-md border border-indigo-800/60">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Keuangan Cerdas & Terukur
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button Pills */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="sidebar-quick-expense-btn"
                onClick={() => {
                  onCloseMobile();
                  onOpenExpenseModal();
                }}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white p-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-950/60 transition-all flex items-center justify-center gap-1.5"
                title="Catat Pengeluaran Baru"
              >
                <Plus className="w-4 h-4" />
                <span>Pengeluaran</span>
              </button>

              <button
                type="button"
                id="sidebar-quick-ocr-btn"
                onClick={() => {
                  onCloseMobile();
                  onOpenReceiptScanner();
                }}
                className="bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/40 text-indigo-300 hover:text-white p-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                title="Pindai Struk dengan AI"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Scan Nota</span>
              </button>
            </div>

            {/* Dedicated Fast Add Income Button for Job Dadakan / Freelance / Bonus */}
            <button
              type="button"
              id="sidebar-quick-income-btn"
              onClick={() => {
                onCloseMobile();
                onOpenAddIncomeModal();
              }}
              className="w-full bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-600/50 text-emerald-300 hover:text-emerald-100 p-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 group"
              title="Tambah Penghasilan Dadakan, Freelance, Bonus, atau THR"
            >
              <div className="p-1 rounded-md bg-emerald-800/80 text-emerald-200 group-hover:scale-110 transition-transform">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span>+ Pemasukan / Job Dadakan</span>
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Menu Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {/* Group 1: Navigasi Utama */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Navigasi Utama
            </div>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/80 ring-1 ring-indigo-400/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 ${
                          isActive
                            ? 'bg-indigo-800 text-indigo-100'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Analisis & Alat */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Analisis & Simulasi
            </div>
            <nav className="space-y-1">
              {analysisNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/80 ring-1 ring-indigo-400/40 font-bold'
                        : item.highlight
                        ? 'text-indigo-300 bg-indigo-950/30 hover:bg-indigo-950/70 border border-indigo-800/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-indigo-400'
                            : 'text-slate-400 group-hover:text-indigo-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.highlight && !isActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 uppercase">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 3: Pengaturan & Menu Cepat */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Pengaturan & Data
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenSalaryModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">Atur Gaji & Alokasi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenNextMonthPlanner();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
              >
                <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">Rencana Bulan Depan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenCategoryManager();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
              >
                <PieChart className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">Kelola Pos Anggaran</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onExportData();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span className="truncate">Ekspor PDF & Laporan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onResetData();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate">Atur Ulang Data Bulan Ini</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Income Card / Status */}
        <div className="p-3.5 m-3 rounded-2xl bg-[#111C30]/90 border border-slate-800/90 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-300">Pemasukan Bulan Ini</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                onOpenAddIncomeModal();
              }}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/50 hover:bg-emerald-900 transition-colors"
              title="Tambah Penghasilan / Job Dadakan"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah</span>
            </button>
          </div>
          <div className="mt-1 text-sm font-black font-mono text-emerald-400 truncate">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Sistem Anti-Boncos Siap</p>
        </div>
      </aside>
    </>
  );
};
