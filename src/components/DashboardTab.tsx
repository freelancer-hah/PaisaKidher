'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users2,
  Coins,
  Sparkles,
  ChevronRight,
  Smartphone,
  Building2,
  CreditCard,
  Banknote,
  Zap,
  Plus,
  Trash2,
} from 'lucide-react';
import { Transaction, AccountBalance, UdhaarEntry, KametiEntry, Language } from '@/types';
import { BankLogo } from './BankLogo';
import { getUserMonogram } from '@/lib/userMonogram';

interface DashboardTabProps {
  transactions: Transaction[];
  accounts: AccountBalance[];
  udhaarList: UdhaarEntry[];
  kametis: KametiEntry[];
  lang: Language;
  userEmail?: string | null;
  userName?: string | null;
  onOpenVoice: () => void;
  onOpenAddModal: () => void;
  onOpenAddAccountModal: () => void;
  onDeleteAccount?: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  transactions,
  accounts,
  udhaarList,
  kametis,
  lang,
  userEmail,
  userName,
  onOpenVoice,
  onOpenAddModal,
  onOpenAddAccountModal,
  onDeleteAccount,
  onNavigateTab,
}) => {
  const { displayName, initials } = getUserMonogram(userName, userEmail);
  // Calculations
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Udhaar totals
  const totalLena = udhaarList
    .filter((u) => u.direction === 'given')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const totalDena = udhaarList
    .filter((u) => u.direction === 'taken')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const getAccountIcon = (id: string) => {
    switch (id) {
      case 'cash':
        return <Banknote className="w-5 h-5 text-emerald-600" />;
      case 'jazzcash':
        return <Smartphone className="w-5 h-5 text-red-500" />;
      case 'easypaisa':
        return <Zap className="w-5 h-5 text-green-600" />;
      case 'bank':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn">
      {/* Hero Financial Health Overview Card */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                {lang === 'ur' ? 'کل دستیاب بیلنس' : 'Total Net Balance (All Wallets)'}
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
                Rs. {totalBalance.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-100/90 mt-1">
                {lang === 'ur'
                  ? 'کیش، جیز کیش، ایزی پیسہ اور بینک اکاؤنٹس ملا کر'
                  : 'Cash in hand + JazzCash + Easypaisa + Banks'}
              </p>
            </div>

            {/* High-Visibility Corner Monogram Account Badge on Hero Card */}
            <div className="flex items-center gap-3 bg-white text-slate-900 py-2.5 px-4 rounded-2xl self-start md:self-auto shadow-lg shadow-emerald-950/20 border-2 border-white ring-2 ring-emerald-400/40">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-800 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-700/30 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {lang === 'ur' ? 'اکاؤنٹ ہولڈر' : 'Account Owner'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-black text-slate-900 truncate max-w-[170px] mt-0.5">
                  {displayName}
                </h4>
                <p className="text-[11px] font-bold text-slate-500 truncate max-w-[170px] font-mono">
                  {userEmail || (lang === 'ur' ? 'آف لائن والٹ' : 'Local Wallet')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{lang === 'ur' ? 'بول کر لکھیں' : 'Voice Assistant'}</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition shadow-md cursor-pointer"
            >
              <span>{lang === 'ur' ? '+ اندراج کریں' : '+ Quick Entry'}</span>
            </button>
          </div>

          {/* Income & Expense Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-emerald-200">
                <TrendingUp className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-100 block">
                  {lang === 'ur' ? 'ماہانہ آمدن' : 'Monthly Income'}
                </span>
                <span className="text-base sm:text-lg font-bold">Rs. {totalIncome.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-rose-200">
                <TrendingDown className="w-5 h-5 text-rose-200" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-100 block">
                  {lang === 'ur' ? 'ماہانہ خرچہ' : 'Monthly Expense'}
                </span>
                <span className="text-base sm:text-lg font-bold">Rs. {totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Wallets & Bank Accounts */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'ur' ? 'آپ کے بینک اکاؤنٹس اور بٹوے' : 'Wallets & Bank Accounts'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {lang === 'ur'
                ? `کل ${accounts.length} فعال اکاؤنٹس`
                : `${accounts.length} Active Account${accounts.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={onOpenAddAccountModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ur' ? 'نیا اکاؤنٹ شامل کریں' : '+ Add Account'}</span>
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-white/70 shadow-xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              {lang === 'ur' ? 'ابھی کوئی اکاؤنٹ شامل نہیں ہے' : 'No accounts added yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              {lang === 'ur'
                ? 'اپنی مرضی کا بینک (میزان، HBL، وغیرہ)، ڈیجیٹل والیٹ (جیز کیش، سادہ پے) یا نقد رقم (کیش) شامل کریں۔'
                : 'Add your own bank account, digital wallet (JazzCash, SadaPay), or cash in hand to get started.'}
            </p>
            <button
              onClick={onOpenAddAccountModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ur' ? 'نیا اکاؤنٹ شامل کریں' : '+ Add First Account'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="light-card light-card-hover p-4 rounded-2xl flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 pr-1">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {acc.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {acc.accountNumber ? `•••• ${acc.accountNumber.slice(-4)}` : acc.nameUrdu}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <BankLogo bankKey={acc.bankKey || acc.id} size="sm" />
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100/80">
                  <div className="text-base font-extrabold text-slate-900 tracking-tight">
                    Rs. {acc.balance.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span className="capitalize">{acc.bankKey || 'bank'}</span>
                    {onDeleteAccount && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAccount(acc.id);
                        }}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                        title={lang === 'ur' ? 'اکاؤنٹ حذف کریں' : 'Remove Account'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Add Bank Card Button */}
            <button
              onClick={onOpenAddAccountModal}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 flex flex-col items-center justify-center text-center transition group cursor-pointer min-h-[110px]"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200/80 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center transition mb-1.5">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800 transition">
                {lang === 'ur' ? 'نیا اکاؤنٹ' : '+ Add Account'}
              </span>
              <span className="text-[10px] text-slate-400">
                {lang === 'ur' ? 'بینک یا والیٹ' : 'Bank, Wallet, Cash'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Pakistan Specific Features Callout (Udhaar + Kameti) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Udhaar Ledger Card */}
        <div
          onClick={() => onNavigateTab('udhaar')}
          className="light-card light-card-hover p-5 rounded-3xl cursor-pointer bg-white relative overflow-hidden group border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {lang === 'ur' ? 'ادھار کھاتہ (Udhaar)' : 'Udhaar Ledger'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'ur' ? 'کس سے لینا ہے، کس کو دینا ہے' : 'Lend & Borrow Tracker with WhatsApp reminder'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
              <span className="text-amber-700 text-[11px] block font-semibold">
                {lang === 'ur' ? 'لینا ہے (Receivable)' : 'Lena Hai (Lent Out)'}
              </span>
              <span className="text-base font-extrabold text-amber-900 mt-0.5 block">
                Rs. {totalLena.toLocaleString()}
              </span>
            </div>
            <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100">
              <span className="text-indigo-700 text-[11px] block font-semibold">
                {lang === 'ur' ? 'دینا ہے (Payable)' : 'Dena Hai (Borrowed)'}
              </span>
              <span className="text-base font-extrabold text-indigo-900 mt-0.5 block">
                Rs. {totalDena.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Kameti (BC) Card */}
        <div
          onClick={() => onNavigateTab('kameti')}
          className="light-card light-card-hover p-5 rounded-3xl cursor-pointer bg-white relative overflow-hidden group border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {lang === 'ur' ? 'کمیٹی / بی سی (Kameti)' : 'Kameti (BC) Tracker'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'ur' ? 'باری، قسط اور وصولی کا ریکارڈ' : 'Rotating Savings (ROSCA) & Payout Turn'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition" />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {kametis.length === 0 ? (
              <div className="py-3 text-center text-slate-400 text-xs">
                {lang === 'ur' ? 'ابھی کوئی کمیٹی فعال نہیں ہے۔' : 'No active Kameti. Tap to create one.'}
              </div>
            ) : (
              kametis.slice(0, 2).map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-2.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs"
                >
                  <div>
                    <span className="font-bold text-purple-950 block">{k.title}</span>
                    <span className="text-[10px] text-purple-700">
                      Month {k.currentMonth} of {k.totalMembers} • My Turn: Month {k.myTurnMonth}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-900 block">
                      Rs. {k.monthlyAmount.toLocaleString()}/mo
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                      Pool: Rs. {(k.monthlyAmount * k.totalMembers).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List Preview */}
      <div className="light-card p-5 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            {lang === 'ur' ? 'حالیہ لین دین' : 'Recent Transactions'}
          </h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            {lang === 'ur' ? 'تمام دیکھیں' : 'View All'} &rarr;
          </button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              {lang === 'ur'
                ? 'ابھی کوئی لین دین درج نہیں ہے۔ + بٹن دبا کر خرچ یا آمدن کا اندراج کریں۔'
                : 'No transactions recorded yet. Tap + Add or Voice to record your first entry.'}
            </div>
          ) : (
            transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      t.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {t.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-900">{t.category}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{t.date}</span>
                      <span>•</span>
                      <span className="capitalize">{t.account}</span>
                      {t.source && (
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] text-slate-600">
                          {t.source}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                  </span>
                  <span className="block text-[11px] text-slate-400 truncate max-w-[130px]">
                    {t.note}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
