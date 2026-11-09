'use client';

import React from 'react';
import { ToastNotification } from '@/types';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
        let borderColor = 'border-emerald-200 bg-emerald-50/90 text-emerald-950';

        if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
          borderColor = 'border-amber-200 bg-amber-50/90 text-amber-950';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
          borderColor = 'border-rose-200 bg-rose-50/90 text-rose-950';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
          borderColor = 'border-blue-200 bg-blue-50/90 text-blue-950';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${borderColor}`}
            style={{ animation: 'slideIn 0.25s ease-out' }}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
              <p className="text-xs mt-1 text-slate-600 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
