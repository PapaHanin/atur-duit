import React from 'react';
import { X, Bell, AlertTriangle, AlertCircle, CheckCheck, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { BudgetNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BudgetNotification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111C30] h-full shadow-2xl flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Notifikasi & Peringatan
              </h2>
              <p className="text-xs text-slate-400">
                Peringatan dini kebocoran & status anggaran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar */}
        {(notifications || []).length > 0 && (
          <div className="px-5 py-2.5 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 font-medium transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
            </button>
            <button
              onClick={onClearNotifications}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
            </button>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Semua Pos Anggaran Terkendali
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Belum ada peringatan boncos. Aplikasi akan memberitahu Anda segera saat ada pos yang menyentuh batas waspada (≥70%).
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isDanger = notif.type === 'danger';
              const isWarning = notif.type === 'warning';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    !notif.read ? 'ring-1 ring-indigo-500/30' : ''
                  } ${
                    isDanger
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                      : isWarning
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 shadow-2xs ${
                        isDanger
                          ? 'bg-rose-500 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isDanger ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
