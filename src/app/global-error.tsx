'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
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
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#f8fafc] text-slate-900 font-sans min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-xs text-slate-500 mb-4">Please reload the page to refresh application bundles.</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

