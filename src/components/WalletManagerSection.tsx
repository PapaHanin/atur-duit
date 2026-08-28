import React from 'react';
import { Wallet, WalletTransfer, Expense, AdditionalIncome } from '../types';
import { DynamicIcon } from './DynamicIcon';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowRightLeft,
  Landmark,
  Smartphone,
  Banknote,
  TrendingUp,
  CreditCard,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WalletManagerSectionProps {
  wallets: Wallet[];
  transfers: WalletTransfer[];
  allExpenses: Expense[];
  allIncomes: AdditionalIncome[];
  monthlyBaseSalary: number;
  onAddWalletClick: () => void;
  onTransferClick: () => void;
  onEditWallet: (wallet: Wallet) => void;
  onDeleteWallet: (walletId: string) => void;
  onDeleteTransfer: (transferId: string) => void;
}

export const WalletManagerSection: React.FC<WalletManagerSectionProps> = ({
  wallets,
  transfers,
  allExpenses,
  allIncomes,
  monthlyBaseSalary,
  onAddWalletClick,
  onTransferClick,
  onEditWallet,
  onDeleteWallet,
  onDeleteTransfer,
}) => {
  // Compute calculated balance for each wallet
  const computeWalletBalance = (wallet: Wallet) => {
    let balance = wallet.initialBalance || 0;

    // Add incomes targeted or assigned to this wallet
    const incomeTotal = allIncomes
      .filter((inc) => inc.walletId === wallet.id)
      .reduce((sum, inc) => sum + inc.amount, 0);

    // If this is default or bank type, it might receive base salary if no specific wallet
    // (assigned via walletId)
    balance += incomeTotal;

    // Deduct expenses paid through this wallet
    const expenseTotal = allExpenses
      .filter((exp) => exp.walletId === wallet.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    balance -= expenseTotal;

    // Apply transfers
    transfers.forEach((t) => {
      if (t.fromWalletId === wallet.id) {
        balance -= t.amount + (t.fee || 0);
      }
      if (t.toWalletId === wallet.id) {
        balance += t.amount;
      }
    });

    return {
      currentBalance: balance,
      incomeTotal,
      expenseTotal,
    };
  };

  const walletBalances = wallets.map((w) => ({
    wallet: w,
    ...computeWalletBalance(w),
  }));

  const totalNetWorth = walletBalances.reduce((sum, item) => sum + item.currentBalance, 0);

  const getWalletTypeBadge = (type: Wallet['type']) => {
    switch (type) {
      case 'bank':
        return { label: 'Bank', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'ewallet':
        return { label: 'E-Wallet', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'cash':
        return { label: 'Tunai', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'investment':
        return { label: 'Investasi', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default:
        return { label: 'Akun', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <WalletIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Manajemen Multi-Dompet & Rekening Bank
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {wallets.length} Akun
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pantau sebaran uang Anda di rekening bank, e-wallet, uang tunai, dan akun investasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {wallets.length >= 2 && (
              <button
                type="button"
                onClick={onTransferClick}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
                <span>Transfer Antar Dompet</span>
              </button>
            )}

            <button
              id="add-wallet-btn"
              type="button"
              onClick={onAddWalletClick}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Dompet / Bank</span>
            </button>
          </div>
        </div>

        {/* Total Net Worth Card */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-[#162238] to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Total Saldo Likuid & Gabungan Seluruh Akun:
            </span>
            <p className="text-2xl font-black text-white font-mono mt-1">
              Rp {totalNetWorth.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-2xs text-slate-400 max-w-xs">
            Saldo riil terkalkulasi dari saldo awal, pemasukan tercatat, mutasi pengeluaran, dan transfer antar-rekening.
          </div>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      {wallets.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400">
          <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500">
            <WalletIcon className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">Belum Ada Dompet Ditambahkan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Tambahkan rekening BCA, Mandiri, GoPay, OVO, atau uang tunai untuk melacak dari mana setiap pengeluaran Anda dibayarkan.
          </p>
          <button
            type="button"
            onClick={onAddWalletClick}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dompet Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {walletBalances.map(({ wallet, currentBalance, incomeTotal, expenseTotal }) => {
            const badge = getWalletTypeBadge(wallet.type);

            return (
              <div
                key={wallet.id}
                className="bg-[#0F172A] border border-slate-800/80 hover:border-slate-700/90 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                        style={{ backgroundColor: wallet.color }}
                      >
                        <DynamicIcon name={wallet.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{wallet.name}</h4>
                        <span className={`inline-block text-2xs px-2 py-0.5 rounded-full font-bold border mt-0.5 ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditWallet(wallet)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Dompet"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteWallet(wallet.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Hapus Dompet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {wallet.accountNumber && (
                    <p className="text-2xs text-slate-400 font-mono mb-2">
                      No. Rek: <span className="text-slate-200">{wallet.accountNumber}</span>
                    </p>
                  )}

                  {wallet.notes && (
                    <p className="text-2xs text-slate-400 mb-3 line-clamp-1">
                      {wallet.notes}
                    </p>
                  )}

                  {/* Current Balance */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 my-2">
                    <span className="text-2xs text-slate-400 font-medium block mb-0.5">
                      Saldo Saat Ini:
                    </span>
                    <p
                      className={`text-lg font-black font-mono ${
                        currentBalance < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      Rp {currentBalance.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Sub stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-2xs text-slate-400">
                  <div>
                    <span>Masuk: </span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      +Rp {incomeTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span>Keluar: </span>
                    <span className="text-rose-400 font-mono font-semibold">
                      -Rp {expenseTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer History */}
      {transfers.length > 0 && (
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-teal-400" />
            <span>Riwayat Transfer Antar Dompet</span>
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {transfers.map((t) => {
              const fromW = wallets.find((w) => w.id === t.fromWalletId);
              const toW = wallets.find((w) => w.id === t.toWalletId);

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{fromW?.name || 'Dompet Asal'}</span>
                        <span className="text-slate-500">➔</span>
                        <span className="text-teal-300">{toW?.name || 'Dompet Tujuan'}</span>
                      </div>
                      <div className="text-2xs text-slate-500 flex items-center gap-2">
                        <span>{t.date}</span>
                        {t.fee && t.fee > 0 && <span>(Biaya admin: Rp {t.fee.toLocaleString('id-ID')})</span>}
                        {t.notes && <span>• {t.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-white">
                      Rp {t.amount.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteTransfer(t.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Hapus Catatan Transfer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
