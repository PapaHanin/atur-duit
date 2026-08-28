import React, { useState, useRef } from 'react';
import { Category, Wallet, OcrReceiptResult } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  Check,
  FileText,
  DollarSign,
  Calendar,
  Store,
  Tag,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  wallets?: Wallet[];
  onSaveScannedExpense: (expenseData: {
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    notes?: string;
    receiptImage?: string;
    walletId?: string;
  }) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  categories,
  wallets = [],
  onSaveScannedExpense,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrData, setOcrData] = useState<OcrReceiptResult | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [merchantName, setMerchantName] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 8MB');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      await runOcrScan(base64);
    };
    reader.readAsDataURL(file);
  };

  const runOcrScan = async (base64Data: string) => {
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          categories: categories.map((c) => ({ id: c.id, name: c.name })),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result: OcrReceiptResult = json.data;
        setOcrData(result);
        setMerchantName(result.merchantName || 'Struk Belanja');
        setTotalAmount(result.totalAmount ? result.totalAmount.toString() : '0');
        setTransactionDate(result.date || new Date().toISOString().slice(0, 10));
        setNotes(result.notes || (result.items?.length ? result.items.map(i => `${i.name} (${i.qty || 1}x)`).join(', ') : ''));

        // Match suggested category
        const matched = categories.find(
          (c) =>
            c.name.toLowerCase().includes(result.suggestedCategoryName?.toLowerCase() || '') ||
            result.suggestedCategoryName?.toLowerCase().includes(c.name.toLowerCase())
        );
        setSelectedCategoryId(matched ? matched.id : categories[0]?.id || '');
        if (wallets.length > 0 && !selectedWalletId) {
          setSelectedWalletId(wallets[0].id);
        }
      } else {
        throw new Error(json.error || 'Gagal memproses gambar');
      }
    } catch (err: any) {
      console.error('OCR scanning error:', err);
      // Fallback default
      setMerchantName('Struk Belanja');
      setTotalAmount('50000');
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setSelectedCategoryId(categories[0]?.id || '');
      setErrorMsg('Pindai AI otomatis mengalami gangguan, namun Anda tetap dapat mengisi data secara instan di bawah ini.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    const amountNum = parseFloat(totalAmount.replace(/\D/g, ''));
    if (!amountNum || amountNum <= 0) {
      setErrorMsg('Nominal pengeluaran harus lebih dari 0');
      return;
    }

    onSaveScannedExpense({
      amount: amountNum,
      categoryId: selectedCategoryId || categories[0]?.id || '',
      description: merchantName.trim() || 'Struk Belanja',
      date: transactionDate || new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
      receiptImage: imagePreview || undefined,
      walletId: selectedWalletId || undefined,
    });

    onClose();
  };

  const handleReset = () => {
    setImagePreview(null);
    setOcrData(null);
    setMerchantName('');
    setTotalAmount('');
    setNotes('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Scanner Struk & Bukti Transfer AI</span>
                <span className="text-2xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> AI OCR
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Unggah foto struk belanja/transfer, AI otomatis membaca toko, nominal, tanggal, dan pos anggaran
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

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!imagePreview ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-950/60 group-hover:bg-indigo-900/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-all">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              Klik untuk Pilih Gambar atau Tarik Foto Struk ke Sini
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Mendukung foto struk kasir Indomaret/Alfamart, bill resto, invoice, atau screenshot bukti transfer m-banking
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-semibold">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Format JPG, PNG, WEBP (Maks. 8MB)</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Image Preview & Scanning Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-64 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Struk Preview"
                  className="max-h-60 w-auto object-contain"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                    <p className="text-xs font-bold text-indigo-300">
                      Menganalisis Struk dengan AI Vision...
                    </p>
                    <p className="text-2xs text-slate-400 mt-1">
                      Mengekstrak nama toko, nominal, tanggal, dan rincian belanja
                    </p>
                  </div>
                )}
              </div>

              {/* Extracted Data Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Hasil Ekstraksi OCR:
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-2xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Ganti Gambar
                  </button>
                </div>

                <div>
                  <label className="text-2xs font-medium text-slate-400 mb-1 block">
                    Nama Toko / Keterangan
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="Nama Merchant / Kasir"
                    className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs font-medium text-slate-400 mb-1 block">
                      Total Nominal (Rp)
                    </label>
                    <input
                      type="text"
                      value={totalAmount ? parseInt(totalAmount.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                      onChange={(e) => setTotalAmount(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-2xs font-medium text-slate-400 mb-1 block">
                      Tanggal Transaksi
                    </label>
                    <input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs font-medium text-slate-400 mb-1 block">
                      Pos Anggaran
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-2xs font-medium text-slate-400 mb-1 block">
                      Dompet / Akun (Opsional)
                    </label>
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="">Pilih Dompet...</option>
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-2xs font-medium text-slate-400 mb-1 block">
                    Catatan / Rincian Barang
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Rincian item belanja..."
                    className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Line items if extracted */}
            {ocrData?.items && ocrData.items.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-2xs font-bold text-slate-400 block mb-1.5">
                  Item Terdeteksi ({ocrData.items.length} item):
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {ocrData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-2xs text-slate-300">
                      <span>• {item.name} {item.qty ? `(${item.qty}x)` : ''}</span>
                      <span className="font-mono text-slate-400">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isScanning}
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 transition-all shadow-md shadow-indigo-950/50 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Simpan ke Pengeluaran</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
