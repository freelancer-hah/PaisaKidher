'use client';

import React, { useState, useEffect } from 'react';
import { X, PlusCircle, ArrowDownLeft, ArrowUpRight, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, Language, AccountBalance } from '@/types';
import { CATEGORIES } from '@/lib/storage';
import { BankLogo } from './BankLogo';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  accounts?: AccountBalance[];
  onOpenAddAccountModal?: () => void;
  lang: Language;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  accounts = [],
  onOpenAddAccountModal,
  lang,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [account, setAccount] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Sync selected account when accounts change or modal opens
  useEffect(() => {
    if (accounts.length > 0) {
      if (!account || !accounts.some((a) => a.id === account)) {
        setAccount(accounts[0].id);
      }
    } else {
      setAccount('');
    }
  }, [accounts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      type,
      amount: parsedAmount,
      category,
      account: account || (accounts[0]?.id || 'cash'),
      date,
      note: note.trim() || (type === 'expense' ? 'Kharch' : 'Aamdan'),
      source: 'manual',
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header - Fixed & Clean */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {lang === 'ur' ? 'نیا اندراج کریں' : 'Add New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto modal-scrollbar flex-1">
          <form id="add-transaction-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Type Switcher: Expense vs Income */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{lang === 'ur' ? 'خرچہ (Expense)' : 'Expense (خرچہ)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{lang === 'ur' ? 'آمدن (Income)' : 'Income (آمدن)'}</span>
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'ur' ? 'رقم (PKR / روپے)' : 'Amount (PKR)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rs.
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ur' ? 'کیٹیگری منتخب کریں' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account / Wallet Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'کھاتہ / والیٹ' : 'Paid From / Received To'}
                </label>
                {onOpenAddAccountModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddAccountModal();
                    }}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    {lang === 'ur' ? '+ نیا اکاؤنٹ' : '+ Add Account'}
                  </button>
                )}
              </div>

              {accounts.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 text-center">
                  <p className="text-xs text-amber-800 font-semibold mb-1.5">
                    {lang === 'ur'
                      ? 'کوئی اکاؤنٹ شامل نہیں ہے۔ براہ کرم پہلے اکاؤنٹ شامل کریں۔'
                      : 'No accounts added yet. Please add a bank or wallet.'}
                  </p>
                  {onOpenAddAccountModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAddAccountModal();
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      {lang === 'ur' ? '+ اکاؤنٹ شامل کریں' : '+ Add Account'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs max-h-36 overflow-y-auto modal-scrollbar pr-1">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccount(acc.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-semibold border transition text-left truncate ${
                        account === acc.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <BankLogo bankKey={acc.bankKey || acc.id} size="sm" />
                      <span className="truncate">{acc.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'تاریخ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'تفصیل / نوٹ' : 'Note (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'ur' ? 'مثال: پیٹرول، دودھ' : 'e.g. Petrol, Groceries'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed Action Button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70">
          <button
            type="submit"
            form="add-transaction-form"
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-200 transition"
          >
            {type === 'expense'
              ? lang === 'ur'
                ? 'خرچہ شامل کریں'
                : 'Record Expense'
              : lang === 'ur'
              ? 'آمدن شامل کریں'
              : 'Record Income'}
          </button>
        </div>
      </div>
    </div>
  );
};
