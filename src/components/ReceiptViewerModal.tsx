import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
  amount?: number;
  date?: string;
  categoryName?: string;
  isIncome?: boolean;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Struk Transaksi',
  amount,
  date,
  categoryName,
  isIncome = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `struk_${(title || 'transaksi').toLowerCase().replace(/\s+/g, '_')}_${date || 'foto'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#111C30] rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B1120] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-indigo-600/90 text-white shrink-0 shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                {categoryName && (
                  <span className="font-medium text-indigo-300 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {categoryName}
                  </span>
                )}
                {date && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatIndonesianDate(date)}
                    </span>
                  </>
                )}
                {amount !== undefined && (
                  <>
                    <span>•</span>
                    <span className={`font-bold font-mono ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{formatRupiah(amount)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              handleResetZoom();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="px-4 py-2 bg-[#0B1120]/80 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Perbesar Foto"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Perkecil Foto"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="hidden sm:inline">Perkecil</span>
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Putar 90 Derajat"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">Putar</span>
            </button>
            {(zoomLevel !== 1 || rotation !== 0) && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2.5 py-1 rounded-xl bg-slate-800 text-indigo-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Foto
          </button>
        </div>

        {/* Image Preview Canvas Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px] max-h-[65vh] bg-slate-950/60 select-none">
          <div
            className="transition-transform duration-150 ease-out origin-center"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0B1120] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Skala: {Math.round(zoomLevel * 100)}% · Rotasi: {rotation}°</span>
          <button
            type="button"
            onClick={() => {
              handleResetZoom();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
