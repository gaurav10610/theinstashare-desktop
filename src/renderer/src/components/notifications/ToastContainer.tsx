import React, { useEffect } from 'react';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { usePeerStore } from '../../stores/usePeerStore';
import { MessageSquare, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();
  const { setActiveTab, setSelectedPeerId } = usePeerStore();

  useEffect(() => {
    if (toasts.length > 0) {
      const latest = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        removeToast(latest.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'chat':
              return <MessageSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
            case 'success':
              return <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
            case 'warning':
              return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
            case 'error':
              return <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
            default:
              return <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
          }
        };

        return (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.peerId) {
                setSelectedPeerId(toast.peerId);
                setActiveTab('talk');
              }
              removeToast(toast.id);
            }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl glass-panel-elevated border border-slate-200 dark:border-slate-700/80 shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform animate-slide-in text-slate-900 dark:text-slate-100"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{toast.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
