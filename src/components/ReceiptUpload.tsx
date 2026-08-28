import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Eye, RefreshCw, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { processReceiptFile } from '../utils/imageUtils';

interface ReceiptUploadProps {
  receiptImage?: string;
  onChange: (imageUri?: string) => void;
  label?: string;
  sublabel?: string;
  onPreviewFull?: () => void;
  compact?: boolean;
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  receiptImage,
  onChange,
  label = 'Unggah Struk / Bukti Foto Transaksi',
  sublabel = 'Foto struk, bukti transfer, atau nota belanja untuk arsip aman (JPG, PNG)',
  onPreviewFull,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const compressedUri = await processReceiptFile(file);
      onChange(compressedUri);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-2">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        {receiptImage && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Struk Terlampir
          </span>
        )}
      </div>

      {/* Upload Box / Image Preview State */}
      {receiptImage ? (
        <div className="relative rounded-2xl border border-indigo-500/40 bg-[#0B1120] p-3 flex items-center gap-3.5 group transition-all hover:border-indigo-400">
          {/* Thumbnail preview */}
          <div
            onClick={onPreviewFull}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 cursor-pointer shadow-md group/thumb"
            title="Klik untuk perbesar foto struk"
          >
            <img
              src={receiptImage}
              alt="Struk Transaksi"
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          {/* Info & Action buttons */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              Bukti Struk Tersimpan
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Foto struk telah dikompresi dan siap disimpan dengan aman.
            </p>

            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              {onPreviewFull && (
                <button
                  type="button"
                  onClick={onPreviewFull}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 hover:bg-indigo-900 text-[11px] font-bold border border-indigo-800/80 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Lihat Foto
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3 h-3" />
                Ganti Foto
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-rose-800/60"
              >
                <Trash2 className="w-3 h-3" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`rounded-2xl border-2 border-dashed p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 scale-[0.99]'
              : 'border-slate-800 bg-[#0B1120] hover:border-slate-700 hover:bg-[#0f172a]'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-indigo-300">Memproses & mengompresi struk...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-[#111C30] border border-slate-800 text-indigo-400 flex items-center justify-center mb-2 shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-200">
                Pilih atau seret foto struk ke sini
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                {sublabel}
              </div>

              {/* Action Buttons: Galeri & Kamera */}
              <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Pilih Gambar
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  Buka Kamera
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs font-medium text-rose-400">{errorMsg}</p>
      )}
    </div>
  );
};
