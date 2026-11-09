'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Mic,
  Plus,
  MessageSquareCode,
  Globe,
  Cloud,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ReceiptText,
  Users2,
  Coins,
  BarChart3,
  FolderKanban,
  ChevronRight,
  User,
} from 'lucide-react';
import { Language } from '@/types';
import { getUserMonogram } from '@/lib/userMonogram';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenVoice: () => void;
  onOpenAddModal: () => void;
  onOpenSMSImport: () => void;
  userEmail: string | null;
  userName?: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  onOpenVoice,
  onOpenAddModal,
  onOpenSMSImport,
  userEmail,
  userName,
  onOpenAuth,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { displayName, initials } = getUserMonogram(userName, userEmail);

  const navItems = [
    {
      id: 'dashboard',
      label: lang === 'ur' ? 'ڈیش بورڈ' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      label: lang === 'ur' ? 'لین دین' : 'Transactions',
      icon: ReceiptText,
    },
    {
      id: 'udhaar',
      label: lang === 'ur' ? 'ادھار' : 'Udhaar',
      icon: Users2,
    },
    {
      id: 'kameti',
      label: lang === 'ur' ? 'کمیٹی' : 'Kameti',
      icon: Coins,
    },
    {
      id: 'projects',
      label: lang === 'ur' ? 'پروجیکٹس' : 'Projects',
      icon: FolderKanban,
    },
    {
      id: 'analytics',
      label: lang === 'ur' ? 'رپورٹس' : 'Reports',
      icon: BarChart3,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem]">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 select-none py-1 group"
            onClick={() => handleSelectTab('dashboard')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200/60 shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight whitespace-nowrap">
                  Paisa Kidhar
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80 whitespace-nowrap">
                  {lang === 'ur' ? 'پیسہ کدھر' : 'PKR'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden 2xl:block leading-none mt-1 whitespace-nowrap">
                {lang === 'ur' ? 'آپ کے ہر روپے کا حساب' : 'Aapke har rupaye ka hisaab'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on Laptop & Desktop) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shadow-inner">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`px-2.5 py-1.5 xl:px-3 xl:py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Add Button */}
            <button
              onClick={onOpenAddModal}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{lang === 'ur' ? 'اندراج' : 'Add'}</span>
            </button>

            {/* Voice Input Button */}
            <button
              onClick={onOpenVoice}
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/90 transition shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{lang === 'ur' ? 'آواز' : 'Voice'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition active:scale-95 whitespace-nowrap cursor-pointer"
              title={lang === 'ur' ? 'Switch to English' : 'اردو میں تبدیل کریں'}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{lang === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            {/* Simulated SMS Import (Only on ultra wide 2xl screens) */}
            <button
              onClick={onOpenSMSImport}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition active:scale-95 whitespace-nowrap cursor-pointer"
              title="Test JazzCash / Easypaisa SMS auto capture"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>SMS</span>
            </button>

            {/* Prominent & Clear Logout / Sign In Button */}
            {userEmail ? (
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition active:scale-95 shadow-xs cursor-pointer shrink-0"
                title={lang === 'ur' ? `اکاؤنٹ سے لاگ آؤٹ کریں (${userEmail})` : `Sign Out (${userEmail})`}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{lang === 'ur' ? 'لاگ آؤٹ' : 'Logout'}</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95 shadow-xs shrink-0"
                title={lang === 'ur' ? 'لاگ ان' : 'Sign In'}
                aria-label="Sign In"
              >
                <User className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{lang === 'ur' ? 'لاگ ان' : 'Sign In'}</span>
              </Link>
            )}

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition active:scale-95"
              aria-label="Toggle navigation menu"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-xl px-4 py-4 shadow-xl transition-all animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Profile Monogram Card in Mobile Drawer */}
          {userEmail && (
            <div className="p-3.5 mb-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-700 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">
                    {lang === 'ur' ? 'فعال اکاؤنٹ' : 'Active Account'}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 truncate">{displayName}</h4>
                  <p className="text-xs text-slate-600 truncate font-mono">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shrink-0 cursor-pointer"
              >
                {lang === 'ur' ? 'لاگ آؤٹ' : 'Sign Out'}
              </button>
            </div>
          )}

          <div className="space-y-1 mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              {lang === 'ur' ? 'صفحات و کھاتہ' : 'Navigation'}
            </div>
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 opacity-60 rtl:rotate-180" />
                </button>
              );
            })}
          </div>

          {/* Quick Tools & Auth in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!userEmail && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm shadow-emerald-200"
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-white" />
                  <span>{lang === 'ur' ? 'کلاؤڈ لاگ ان / نیا اکاؤنٹ' : 'Cloud Login / Sign Up'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Sync
                </span>
              </Link>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSMSImport();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquareCode className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ur' ? 'جاز کیش / ایزی پیسہ SMS خودکار درآمد' : 'JazzCash / Easypaisa SMS Import'}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Auto
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
