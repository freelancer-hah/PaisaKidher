'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  CreditCard,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react';
import { UdhaarEntry, UdhaarDirection, AccountBalance, Language } from '@/types';
import { BankLogo } from '@/components/BankLogo';

interface UdhaarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUdhaar: (
    entry: Omit<UdhaarEntry, 'id' | 'paidAmount' | 'payments' | 'status'>
  ) => void;
  accounts: AccountBalance[];
  onOpenAddAccountModal?: () => void;
  lang: Language;
}

export const UdhaarModal: React.FC<UdhaarModalProps> = ({
  isOpen,
  onClose,
  onAddUdhaar,
  accounts,
  onOpenAddAccountModal,
  lang,
}) => {
  const [direction, setDirection] = useState<UdhaarDirection>('given');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [syncWallet, setSyncWallet] = useState<boolean>(true);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  // Default to first account whenever accounts or modal opens
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !contactName.trim()) return;

    const chosenAccount = selectedAccountId || (accounts[0]?.id ?? 'cash');

    onAddUdhaar({
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      direction,
      totalAmount: parsedAmount,
      dueDate: dueDate || undefined,
      createdDate: new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
      accountId: chosenAccount,
      syncWallet,
    });

    setContactName('');
    setContactPhone('');
    setAmount('');
    setDueDate('');
    setNote('');
    setSyncWallet(true);
    onClose();
  };

  const selectedAccountObj = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {lang === 'ur' ? 'نیا ادھار کھاتہ (Unified Khata)' : 'New Udhaar (Khata) Entry'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {lang === 'ur'
                ? 'آمدن، خرچ اور والیٹ کے ساتھ خودکار لنک'
                : 'Directly synced with your cash & bank wallets'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto modal-scrollbar flex-1">
          <form id="add-udhaar-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Direction Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setDirection('given')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  direction === 'given'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{lang === 'ur' ? 'میں نے دیا (لینا ہے)' : 'Maine Diya (Lena hai)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection('taken')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  direction === 'taken'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{lang === 'ur' ? 'میں نے لیا (دینا ہے)' : 'Maine Liya (Dena hai)'}</span>
              </button>
            </div>

            {/* Person Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ur' ? 'شخص / پارٹی کا نام' : "Person's Name"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ali Raza, Hamza Bhai"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Amount & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'ur' ? 'رقم (روپے)' : 'Amount (PKR)'}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>WhatsApp / Phone</span>
                </label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Linked Wallet Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {direction === 'given'
                      ? lang === 'ur'
                        ? 'کس اکاؤنٹ سے رقم دی؟ (Deduct From)'
                        : 'Paid From (Wallet)'
                      : lang === 'ur'
                      ? 'کس اکاؤنٹ میں رقم آئی؟ (Deposit To)'
                      : 'Received In (Wallet)'}
                  </span>
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
                <div className="p-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 text-xs text-amber-800 text-center">
                  {lang === 'ur'
                    ? 'کوئی اکاؤنٹ موجود نہیں، براہ کرم پہلے کیش یا بینک اکاؤنٹ شامل کریں۔'
                    : 'No accounts found. Please add Cash or Bank account first.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs max-h-36 overflow-y-auto modal-scrollbar pr-1">
                  {accounts.map((acc) => {
                    const isSelected = (selectedAccountId || accounts[0]?.id) === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-semibold border transition text-left truncate cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-1 ring-amber-500/30'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <BankLogo bankKey={acc.bankKey || acc.id} size="sm" />
                        <div className="truncate">
                          <p className="truncate leading-tight">{acc.name}</p>
                          <p className="text-[9px] text-slate-400 font-normal">
                            Rs. {acc.balance.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sync with Wallet Balance Toggle */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2">
              <label
                onClick={() => setSyncWallet(!syncWallet)}
                className="flex items-start gap-2.5 cursor-pointer select-none"
              >
                <div className="mt-0.5 text-amber-600 shrink-0">
                  {syncWallet ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900">
                    {lang === 'ur'
                      ? 'والیٹ کے بیلنس اور لین دین سے منسلک کریں (Sync with Wallet)'
                      : 'Sync with Wallet & Ledger'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {syncWallet ? (
                      direction === 'given' ? (
                        lang === 'ur' ? (
                          <span className="text-rose-600 font-medium">
                            منتخب اکاؤنٹ ({selectedAccountObj?.name || 'Wallet'}) سے رقم کٹے گی اور
                            ٹرانزیکشن رجسٹر میں درج ہوگی۔
                          </span>
                        ) : (
                          <span className="text-rose-600 font-medium">
                            Will deduct from {selectedAccountObj?.name || 'Wallet'} and record as
                            an Outflow transaction.
                          </span>
                        )
                      ) : lang === 'ur' ? (
                        <span className="text-emerald-700 font-medium">
                          منتخب اکاؤنٹ ({selectedAccountObj?.name || 'Wallet'}) میں رقم جمع ہوگی اور
                          آمدن میں درج ہوگی۔
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          Will deposit into {selectedAccountObj?.name || 'Wallet'} and record as
                          an Inflow transaction.
                        </span>
                      )
                    ) : lang === 'ur' ? (
                      <span className="text-slate-500">
                        اکاؤنٹ بیلنس تبدیل نہیں ہوگا (پرانے / پچھلے ادھار کا ریکارڈ رکھنے کے لیے)۔
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Will NOT change wallet balance (useful for recording pre-existing debts).
                      </span>
                    )}
                  </p>
                </div>
              </label>
            </div>

            {/* Due Date & Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'واپسی کی تاریخ' : 'Return Due Date'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'تفصیل / نوٹ' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="Emergency loan..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70">
          <button
            type="submit"
            form="add-udhaar-form"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-200 transition active:scale-[0.99] cursor-pointer"
          >
            {direction === 'given'
              ? lang === 'ur'
                ? 'ادھار دینا درج کریں (لینا ہے)'
                : 'Save Lend Record (Receivable)'
              : lang === 'ur'
              ? 'ادھار لینا درج کریں (دینا ہے)'
              : 'Save Borrow Record (Payable)'}
          </button>
        </div>
      </div>
    </div>
  );
};
