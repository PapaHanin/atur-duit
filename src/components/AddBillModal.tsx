import React, { useState, useEffect } from 'react';
import { RecurringBill, Category, Wallet } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { X, Calendar, DollarSign, Tag, Clock, Bell, Check, Zap } from 'lucide-react';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (billData: Omit<RecurringBill, 'id' | 'createdAt' | 'paidMonthKeys'>) => void;
  categories: Category[];
  wallets?: Wallet[];
  editingBill?: RecurringBill | null;
}

const PRESET_BILLS = [
  { name: 'Listrik PLN', categoryKeyword: 'listrik', icon: 'Zap', color: '#eab308', defaultDay: 5 },
  { name: 'Internet / WiFi', categoryKeyword: 'internet', icon: 'Wifi', color: '#06b6d4', defaultDay: 10 },
  { name: 'BPJS Kesehatan', categoryKeyword: 'kesehatan', icon: 'HeartPulse', color: '#10b981', defaultDay: 10 },
  { name: 'Sewa Kos / Kontrakan', categoryKeyword: 'sewa', icon: 'Home', color: '#8b5cf6', defaultDay: 1 },
  { name: 'Spotify / YouTube Music', categoryKeyword: 'hiburan', icon: 'Music', color: '#22c55e', defaultDay: 15 },
  { name: 'Netflix / Disney+', categoryKeyword: 'hiburan', icon: 'Film', color: '#ef4444', defaultDay: 20 },
  { name: 'Cicilan / Pinjaman', categoryKeyword: 'cicilan', icon: 'CreditCard', color: '#f97316', defaultDay: 25 },
  { name: 'Air PDAM', categoryKeyword: 'air', icon: 'Droplet', color: '#3b82f6', defaultDay: 8 },
];

const BILL_ICONS = [
  'Zap', 'Wifi', 'Droplet', 'Home', 'Music', 'Film', 'CreditCard', 'HeartPulse',
  'Shield', 'Phone', 'Tv', 'Car', 'BookOpen', 'ShoppingCart', 'Coffee', 'Package'
];

const BILL_COLORS = [
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#10b981', '#14b8a6', '#64748b'
];

export const AddBillModal: React.FC<AddBillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  wallets = [],
  editingBill,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDateDay, setDueDateDay] = useState(10);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [icon, setIcon] = useState('Zap');
  const [color, setColor] = useState('#06b6d4');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  useEffect(() => {
    if (editingBill) {
      setName(editingBill.name || '');
      setAmount(editingBill.amount !== undefined ? editingBill.amount.toString() : '');
      setDueDateDay(editingBill.dueDateDay || 10);
      setCategoryId(editingBill.categoryId || categories[0]?.id || '');
      setWalletId(editingBill.walletId || wallets[0]?.id || '');
      setFrequency(editingBill.frequency || 'monthly');
      setIcon(editingBill.icon || 'Zap');
      setColor(editingBill.color || '#06b6d4');
      setReminderDaysBefore(editingBill.reminderDaysBefore || 3);
      setNotes(editingBill.notes || '');
    } else {
      setName('');
      setAmount('');
      setDueDateDay(10);
      setCategoryId(categories[0]?.id || '');
      setWalletId(wallets[0]?.id || '');
      setFrequency('monthly');
      setIcon('Zap');
      setColor('#06b6d4');
      setReminderDaysBefore(3);
      setNotes('');
    }
    setErrors({});
  }, [editingBill, isOpen, categories, wallets]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_BILLS[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
    setDueDateDay(preset.defaultDay);

    const matchingCat = categories.find(
      (c) =>
        c.name.toLowerCase().includes(preset.categoryKeyword) ||
        c.group === 'kewajiban' ||
        c.group === 'pokok'
    );
    if (matchingCat) {
      setCategoryId(matchingCat.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; amount?: string } = {};

    if (!name.trim()) newErrors.name = 'Nama tagihan wajib diisi';
    const numAmount = parseFloat(amount.replace(/\D/g, ''));
    if (!numAmount || numAmount <= 0) newErrors.amount = 'Nominal tagihan harus lebih dari 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      amount: numAmount,
      dueDateDay: Math.min(31, Math.max(1, dueDateDay)),
      categoryId: categoryId || categories[0]?.id || '',
      walletId: walletId || undefined,
      frequency,
      icon,
      color,
      reminderDaysBefore,
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
                {editingBill ? 'Edit Tagihan Rutin' : 'Tambah Tagihan & Langganan Rutin'}
              </h3>
              <p className="text-xs text-slate-400">
                Pengingat otomatis jatuh tempo & pencatatan pengeluaran sekali klik
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

        {/* Quick Presets */}
        {!editingBill && (
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-400 mb-2 block">
              Pilih Cepat Tagihan Populer:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_BILLS.map((preset) => (
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
          {/* Bill Name */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Nama Tagihan / Layanan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Contoh: WiFi Biznet, PLN Pascabayar, Kosan"
              className={`w-full px-3.5 py-2.5 bg-[#162032] border rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all ${
                errors.name ? 'border-rose-500' : 'border-slate-700'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Amount & Due Date Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Nominal Tagihan (Rp) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={amount ? parseInt(amount.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setAmount(raw);
                    if (errors.amount) setErrors({ ...errors, amount: undefined });
                  }}
                  placeholder="0"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-[#162032] border rounded-xl text-sm text-white font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all ${
                    errors.amount ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Tanggal Jatuh Tempo (Setiap Tgl) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDateDay}
                  onChange={(e) => setDueDateDay(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  per bulan
                </span>
              </div>
            </div>
          </div>

          {/* Category & Wallet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Pos Anggaran Terkait
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Metode / Dompet Bayar (Opsional)
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all"
              >
                <option value="">Pilih Dompet...</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reminder & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Ingatkan Sebelum
              </label>
              <select
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all"
              >
                <option value={1}>1 Hari Sebelumnya</option>
                <option value={2}>2 Hari Sebelumnya</option>
                <option value={3}>3 Hari Sebelumnya</option>
                <option value={5}>5 Hari Sebelumnya</option>
                <option value={7}>1 Minggu Sebelumnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Frekuensi Pembayaran
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all"
              >
                <option value="monthly">Bulanan (Setiap Bulan)</option>
                <option value="yearly">Tahunan (1x per Tahun)</option>
                <option value="weekly">Mingguan</option>
              </select>
            </div>
          </div>

          {/* Icon & Color Selection */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Ikon & Warna Penanda
            </label>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1.5 flex-1 max-h-20 overflow-y-auto p-1 bg-slate-900/60 rounded-xl border border-slate-800">
                {BILL_ICONS.map((ic) => (
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
                {BILL_COLORS.map((c) => (
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

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Catatan Tambahan (Nomor Pelanggan / ID Tagihan)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: No. Meter 54210089221 / ID Pelanggan Biznet"
              className="w-full px-3.5 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all"
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
              <span>{editingBill ? 'Simpan Perubahan' : 'Tambah Tagihan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
