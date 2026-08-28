import React, { useState } from 'react';
import { RecurringBill, Category, Wallet, Expense } from '../types';
import { DynamicIcon } from './DynamicIcon';
import {
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Check,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface BillManagerSectionProps {
  bills: RecurringBill[];
  categories: Category[];
  wallets: Wallet[];
  currentMonthKey: string; // '2026-08'
  onAddBillClick: () => void;
  onEditBill: (bill: RecurringBill) => void;
  onDeleteBill: (billId: string) => void;
  onPayBill: (bill: RecurringBill) => void;
  onUnpayBill: (billId: string) => void;
}

export const BillManagerSection: React.FC<BillManagerSectionProps> = ({
  bills,
  categories,
  wallets,
  currentMonthKey,
  onAddBillClick,
  onEditBill,
  onDeleteBill,
  onPayBill,
  onUnpayBill,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const today = new Date();
  const currentDay = today.getDate();

  // Calculate bill stats for current month
  const totalBillsAmount = bills.reduce((acc, b) => acc + b.amount, 0);
  const paidBills = bills.filter((b) => b.paidMonthKeys.includes(currentMonthKey));
  const unpaidBills = bills.filter((b) => !b.paidMonthKeys.includes(currentMonthKey));
  const paidAmount = paidBills.reduce((acc, b) => acc + b.amount, 0);
  const unpaidAmount = unpaidBills.reduce((acc, b) => acc + b.amount, 0);

  // Categorize unpaid bills by urgency
  const overdueBills = unpaidBills.filter((b) => b.dueDateDay < currentDay);
  const dueTodayBills = unpaidBills.filter((b) => b.dueDateDay === currentDay);
  const upcomingBills = unpaidBills.filter((b) => b.dueDateDay > currentDay);

  // Group bills by day for calendar grid
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Kalender Tagihan Rutin & Pengingat Jatuh Tempo
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {bills.length} Tagihan
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pantau tanggal jatuh tempo WiFi, listrik, asuransi, cicilan, dan langganan tanpa takut kena denda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kalender
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar List
              </button>
            </div>

            <button
              id="add-bill-btn"
              type="button"
              onClick={onAddBillClick}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-950/40 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tagihan</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Tagihan Bulan Ini</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <p className="text-base font-extrabold text-white font-mono">
              Rp {totalBillsAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-2xs text-slate-500 mt-1">{bills.length} layanan terdaftar</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
              <span>Sudah Dibayar (Lunas)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-base font-extrabold text-emerald-300 font-mono">
              Rp {paidAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-2xs text-emerald-400/70 mt-1">{paidBills.length} tagihan beres</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
              <span>Sisa Belum Dibayar</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-base font-extrabold text-rose-300 font-mono">
              Rp {unpaidAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-2xs text-rose-400/70 mt-1">{unpaidBills.length} tagihan menunggu</p>
          </div>
        </div>

        {/* Urgent Alerts Banner (if any overdue or due today) */}
        {(overdueBills.length > 0 || dueTodayBills.length > 0) && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 block mb-0.5">
                Perhatian Jatuh Tempo:
              </span>
              {overdueBills.length > 0 && (
                <p className="text-rose-300">
                  • Ada {overdueBills.length} tagihan telah melewati tanggal jatuh tempo ({overdueBills.map(b => b.name).join(', ')}).
                </p>
              )}
              {dueTodayBills.length > 0 && (
                <p className="text-amber-200">
                  • Ada {dueTodayBills.length} tagihan jatuh tempo <strong>HARI INI</strong> ({dueTodayBills.map(b => b.name).join(', ')}).
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Calendar vs List */}
      {bills.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400">
          <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">Belum Ada Tagihan Rutin Ditambahkan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Tambahkan tagihan bulanan seperti Listrik PLN, WiFi, BPJS, Sewa Rumah, atau Langganan untuk melacak jatuh tempo secara otomatis.
          </p>
          <button
            type="button"
            onClick={onAddBillClick}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tagihan Pertama</span>
          </button>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Kalender Jatuh Tempo Bulan Ini</span>
            </h3>
            <div className="flex items-center gap-3 text-2xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Lunas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Menunggu
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Terlambat
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dayBills = bills.filter((b) => b.dueDateDay === day);
              const isToday = day === currentDay;
              const isPast = day < currentDay;

              return (
                <div
                  key={day}
                  className={`min-h-[88px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-sky-950/30 border-sky-500/60 ring-1 ring-sky-500/40'
                      : dayBills.length > 0
                      ? 'bg-[#162032]/80 border-slate-700/80 hover:border-slate-600'
                      : 'bg-slate-900/30 border-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? 'bg-sky-500 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      Tgl {day}
                    </span>
                    {dayBills.length > 0 && (
                      <span className="text-2xs text-slate-500 font-semibold">
                        {dayBills.length} tagihan
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1.5 flex-1">
                    {dayBills.map((b) => {
                      const isPaid = b.paidMonthKeys.includes(currentMonthKey);
                      const isOverdue = !isPaid && isPast;

                      return (
                        <div
                          key={b.id}
                          className={`p-1.5 rounded-lg text-2xs border flex items-center justify-between gap-1 ${
                            isPaid
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                              : isOverdue
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                              : 'bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <DynamicIcon name={b.icon} className="w-3 h-3 shrink-0" style={{ color: b.color }} />
                            <span className="truncate font-semibold">{b.name}</span>
                          </div>
                          {isPaid ? (
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => onPayBill(b)}
                              className="px-1 py-0.5 bg-sky-500/30 hover:bg-sky-500/50 text-sky-300 rounded text-2xs font-bold shrink-0 transition-colors"
                              title="Bayar & Catat Pengeluaran Otomatis"
                            >
                              Bayar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* List View / Detail Table */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-sky-400" />
          <span>Daftar Rincian Tagihan & Status Pembayaran</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {bills.map((bill) => {
            const isPaid = bill.paidMonthKeys.includes(currentMonthKey);
            const isOverdue = !isPaid && bill.dueDateDay < currentDay;
            const isDueToday = !isPaid && bill.dueDateDay === currentDay;
            const daysLeft = bill.dueDateDay - currentDay;
            const category = categories.find((c) => c.id === bill.categoryId);
            const wallet = wallets.find((w) => w.id === bill.walletId);

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPaid
                    ? 'bg-slate-900/40 border-emerald-500/20'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : isDueToday
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-[#162032]/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: bill.color }}
                    >
                      <DynamicIcon name={bill.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{bill.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-2xs text-slate-400">
                          Tgl {bill.dueDateDay} tiap bulan
                        </span>
                        {category && (
                          <span className="text-2xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {category.name}
                          </span>
                        )}
                        {wallet && (
                          <span className="text-2xs px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-300 font-medium">
                            {wallet.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-white font-mono">
                      Rp {bill.amount.toLocaleString('id-ID')}
                    </p>
                    <span
                      className={`inline-block text-2xs font-bold px-2 py-0.5 rounded-full mt-1 ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isDueToday
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPaid
                        ? '✓ Lunas Bulan Ini'
                        : isOverdue
                        ? 'Lewat Jatuh Tempo'
                        : isDueToday
                        ? 'Jatuh Tempo Hari Ini'
                        : `${daysLeft} hari lagi`}
                    </span>
                  </div>
                </div>

                {bill.notes && (
                  <p className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{bill.notes}</span>
                  </p>
                )}

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditBill(bill)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Tagihan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBill(bill.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Hapus Tagihan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => onUnpayBill(bill.id)}
                      className="text-2xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Batalkan Status Lunas
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPayBill(bill)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Bayar & Catat Pengeluaran</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
