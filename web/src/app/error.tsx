'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Automatically recover from Webpack chunk cache mismatch / stale bundle errors
    if (
      error?.message?.includes("reading 'call'") ||
      error?.message?.includes('ChunkLoadError') ||
      error?.name === 'ChunkLoadError'
    ) {
      if (typeof window !== 'undefined') {
        const lastReload = sessionStorage.getItem('paisa_auto_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload) > 5000) {
          sessionStorage.setItem('paisa_auto_reload', now.toString());
          window.location.reload();
          return;
        }
      }
    }
    console.error('Application Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
        Kuch Masla Pesh Aaya (Something went wrong)
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        Application cache ya network connection refresh ki zaroorat hai. Neeche button daba kar page reload karein.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-200 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload &amp; Refresh</span>
        </button>
      </div>
    </div>
  );
}

