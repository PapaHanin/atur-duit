import React, { useState } from 'react';
import { Wallet, WalletTransfer } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { X, ArrowRightLeft, DollarSign, Calendar, Check, AlertCircle } from 'lucide-react';

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSaveTransfer: (transfer: Omit<WalletTransfer, 'id' | 'createdAt'>) => void;
}

export const WalletTransferModal: React.FC<WalletTransferModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onSaveTransfer,
}) => {
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || wallets[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || wallets.length < 2) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWalletId === toWalletId) {
      setError('Dompet asal dan dompet tujuan tidak boleh sama');
      return;
    }

    const numAmount = parseFloat(amount.replace(/\D/g, ''));
    if (!numAmount || numAmount <= 0) {
      setError('Nominal transfer harus lebih dari 0');
      return;
    }

    const numFee = parseFloat(fee.replace(/\D/g, '')) || 0;

    onSaveTransfer({
      fromWalletId,
      toWalletId,
      amount: numAmount,
      fee: numFee,
      date,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const fromWallet = wallets.find((w) => w.id === fromWalletId);
  const toWallet = wallets.find((w) => w.id === toWalletId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Transfer Antar Dompet</h3>
              <p className="text-xs text-slate-400">
                Pindah dana, tarik tunai ATM, atau top-up e-wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Dari (Sumber)
              </label>
              <select
                value={fromWalletId}
                onChange={(e) => {
                  setFromWalletId(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Ke (Tujuan)
              </label>
              <select
                value={toWalletId}
                onChange={(e) => {
                  setToWalletId(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Nominal Transfer (Rp) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={amount ? parseInt(amount.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Biaya Admin / Transfer (Rp)
              </label>
              <input
                type="text"
                value={fee ? parseInt(fee.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setFee(e.target.value.replace(/\D/g, ''))}
                placeholder="0 (Gratis)"
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Tanggal Transfer
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Top up GoPay untuk ongkos kerja mingguan"
              className="w-full px-3.5 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 transition-all shadow-md shadow-emerald-950/50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
