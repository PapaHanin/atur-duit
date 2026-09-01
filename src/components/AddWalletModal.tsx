import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { X, CreditCard, DollarSign, Wallet as WalletIcon, Check, Landmark, Smartphone, Banknote, TrendingUp } from 'lucide-react';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (walletData: Omit<Wallet, 'id'>) => void;
  editingWallet?: Wallet | null;
}

const WALLET_PRESETS = [
  { name: 'BCA Utama', type: 'bank' as const, icon: 'Landmark', color: '#3b82f6', defaultAccount: 'Rekening Operasional' },
  { name: 'Mandiri', type: 'bank' as const, icon: 'Landmark', color: '#0284c7', defaultAccount: 'Rekening Payroll/Gaji' },
  { name: 'GoPay', type: 'ewallet' as const, icon: 'Smartphone', color: '#06b6d4', defaultAccount: 'E-Wallet Belanja & Transport' },
  { name: 'OVO', type: 'ewallet' as const, icon: 'Smartphone', color: '#8b5cf6', defaultAccount: 'E-Wallet' },
  { name: 'DANA', type: 'ewallet' as const, icon: 'Smartphone', color: '#0ea5e9', defaultAccount: 'E-Wallet Transaksi' },
  { name: 'ShopeePay', type: 'ewallet' as const, icon: 'Smartphone', color: '#f97316', defaultAccount: 'E-Wallet E-Commerce' },
  { name: 'Uang Tunai (Cash)', type: 'cash' as const, icon: 'Banknote', color: '#10b981', defaultAccount: 'Dompet Fisik Harian' },
  { name: 'Bibit / Reksadana', type: 'investment' as const, icon: 'TrendingUp', color: '#14b8a6', defaultAccount: 'Investasi & Tabungan' },
];

const WALLET_ICONS = ['Landmark', 'Smartphone', 'Banknote', 'CreditCard', 'TrendingUp', 'Wallet', 'PiggyBank', 'Shield'];
const WALLET_COLORS = ['#3b82f6', '#0284c7', '#06b6d4', '#8b5cf6', '#a855f7', '#ec4899', '#f97316', '#eab308', '#10b981', '#14b8a6', '#64748b'];

export const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingWallet,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Wallet['type']>('bank');
  const [initialBalance, setInitialBalance] = useState('0');
  const [accountNumber, setAccountNumber] = useState('');
  const [icon, setIcon] = useState('Landmark');
  const [color, setColor] = useState('#3b82f6');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});

  useEffect(() => {
    if (editingWallet) {
      setName(editingWallet.name || '');
      setType(editingWallet.type || 'bank');
      setInitialBalance(
        editingWallet.initialBalance !== undefined ? editingWallet.initialBalance.toString() : '0'
      );
      setAccountNumber(editingWallet.accountNumber || '');
      setIcon(editingWallet.icon || 'Landmark');
      setColor(editingWallet.color || '#3b82f6');
      setNotes(editingWallet.notes || '');
    } else {
      setName('');
      setType('bank');
      setInitialBalance('0');
      setAccountNumber('');
      setIcon('Landmark');
      setColor('#3b82f6');
      setNotes('');
    }
    setErrors({});
  }, [editingWallet, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof WALLET_PRESETS[0]) => {
    setName(preset.name);
    setType(preset.type);
    setIcon(preset.icon);
    setColor(preset.color);
    setNotes(preset.defaultAccount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; balance?: string } = {};

    if (!name.trim()) newErrors.name = 'Nama dompet/akun wajib diisi';
    const numBalance = parseFloat(initialBalance.replace(/\D/g, '')) || 0;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      type,
      initialBalance: numBalance,
      accountNumber: accountNumber.trim() || undefined,
      icon,
      color,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editingWallet ? 'Edit Dompet / Rekening' : 'Tambah Dompet, Rekening & E-Wallet'}
              </h3>
              <p className="text-xs text-slate-400">
                Pantau saldo riil di bank, e-wallet, uang tunai, dan akun investasi
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

        {/* Presets */}
        {!editingWallet && (
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-400 mb-2 block">
              Pilihan Cepat Akun Populer:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WALLET_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                >
                  <DynamicIcon name={preset.icon} className="w-3.5 h-3.5" style={{ color: preset.color }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Nama Akun / Dompet <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Contoh: BCA Utama, GoPay, Dompet Tunai"
              className={`w-full px-3.5 py-2.5 bg-[#162032] border rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 ${
                errors.name ? 'border-rose-500' : 'border-slate-700'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Tipe Akun
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="bank">Rekening Bank</option>
                <option value="ewallet">E-Wallet (GoPay, OVO, DANA)</option>
                <option value="cash">Uang Tunai (Cash)</option>
                <option value="investment">Investasi / Reksadana / Saham</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Saldo Awal (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={initialBalance ? parseInt(initialBalance.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setInitialBalance(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Nomor Rekening / No. HP E-Wallet (Opsional)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: 1234567890 (BCA) / 081234567890"
              className="w-full px-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Ikon & Warna Dompet
            </label>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1.5 flex-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
                {WALLET_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-lg transition-all ${
                      icon === ic
                        ? 'bg-sky-500/30 border border-sky-400 text-sky-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <DynamicIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 w-24">
                {WALLET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Catatan / Deskripsi Singkat
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rekening utama penerimaan gaji"
              className="w-full px-3.5 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 transition-all shadow-md shadow-indigo-950/50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingWallet ? 'Simpan Perubahan' : 'Tambah Dompet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
