'use client';

import React from 'react';
import { LayoutDashboard, ReceiptText, Users2, Coins, FolderKanban, Plus, Mic } from 'lucide-react';
import { Language } from '@/types';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  onOpenAddModal: () => void;
  onOpenVoice: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  onOpenAddModal,
  onOpenVoice,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 pt-2 pb-3 shadow-xl">
      <div className="flex items-center justify-around relative">
        {/* Dashboard */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer ${
            currentTab === 'dashboard' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">{lang === 'ur' ? 'ہوم' : 'Home'}</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => setCurrentTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer ${
            currentTab === 'transactions' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-1">{lang === 'ur' ? 'کھاتہ' : 'Entries'}</span>
        </button>

        {/* Center Floating Action Buttons (Add + Voice) */}
        <div className="flex items-center gap-1.5 px-1">
          <button
            onClick={onOpenVoice}
            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer"
            title="Voice Entry"
          >
            <Mic className="w-5 h-5 text-emerald-600" />
          </button>
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-300 active:scale-95 transition -mt-3 border-2 border-white cursor-pointer"
            title="Quick Add"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Udhaar */}
        <button
          onClick={() => setCurrentTab('udhaar')}
          className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer ${
            currentTab === 'udhaar' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Users2 className="w-5 h-5" />
          <span className="text-[10px] mt-1">{lang === 'ur' ? 'ادھار' : 'Udhaar'}</span>
        </button>

        {/* Projects */}
        <button
          onClick={() => setCurrentTab('projects')}
          className={`flex flex-col items-center justify-center py-1 flex-1 cursor-pointer ${
            currentTab === 'projects' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px] mt-1">{lang === 'ur' ? 'پروجیکٹس' : 'Projects'}</span>
        </button>
      </div>
    </div>
  );
};

