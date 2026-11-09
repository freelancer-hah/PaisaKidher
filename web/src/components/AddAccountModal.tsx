'use client';

import React, { useState } from 'react';
import { X, Building2, Check, CreditCard, Sparkles, Hash } from 'lucide-react';
import { AccountBalance, Language } from '@/types';
import { PAKISTANI_BANKS_PRESETS, BankPreset, getBankPreset } from '@/lib/bankPresets';
import { BankLogo } from './BankLogo';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (acc: AccountBalance) => void;
  lang: Language;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  lang,
}) => {
  const [selectedBankKey, setSelectedBankKey] = useState<string>('meezan');
  const [customName, setCustomName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [filterCategory, setFilterCategory] = useState<'all' | 'bank' | 'wallet' | 'cash'>('all');

  if (!isOpen) return null;

  const currentPreset = getBankPreset(selectedBankKey);

  const filteredBanks = PAKISTANI_BANKS_PRESETS.filter((p) => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = customName.trim() || currentPreset.name;
    const finalNameUrdu = currentPreset.nameUrdu;
    const parsedBalance = parseFloat(initialBalance) || 0;

    const newAccount: AccountBalance = {
      id: `acc-${Date.now()}-${selectedBankKey}`,
      bankKey: selectedBankKey,
      name: finalName,
      nameUrdu: finalNameUrdu,
      accountNumber: accountNumber.trim(),
      balance: parsedBalance,
      color: currentPreset.bgGradient,
      icon: 'Building2',
    };

    onAddAccount(newAccount);

    // Reset form
    setCustomName('');
    setAccountNumber('');
    setInitialBalance('0');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header - Fixed & Clean */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'ur' ? 'نیا بینک اکاؤنٹ یا والیٹ شامل کریں' : 'Add Bank or Wallet Account'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'ur'
                  ? 'اپنے تمام اکاؤنٹس، بینک یا کیش والیٹ الگ الگ رکھیں'
                  : 'Add and manage your bank accounts, digital wallets or cash in hand'}
              </p>
            </div>
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
          <form id="add-account-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Category Filter Pills for Bank List */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {lang === 'ur' ? 'بینک یا سروس منتخب کریں' : 'Select Bank / FinTech'}
              </label>
              <div className="flex items-center gap-1.5 mb-2 bg-slate-100 p-1 rounded-xl text-xs w-fit">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    filterCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {lang === 'ur' ? 'سب' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('bank')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    filterCategory === 'bank' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {lang === 'ur' ? 'کمرشل بینک' : 'Banks'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('wallet')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    filterCategory === 'wallet' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {lang === 'ur' ? 'والیٹس' : 'Wallets'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('cash')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    filterCategory === 'cash' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {lang === 'ur' ? 'نقد رقم' : 'Cash'}
                </button>
              </div>

              {/* Visual Bank Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto modal-scrollbar pr-1 border border-slate-100 p-2 rounded-2xl bg-slate-50/70">
                {filteredBanks.map((bank) => {
                  const isSelected = selectedBankKey === bank.id;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        setSelectedBankKey(bank.id);
                        if (!customName || customName === currentPreset.name) {
                          setCustomName(bank.name);
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left border transition relative ${
                        isSelected
                          ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white/60 border-slate-200/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <BankLogo bankKey={bank.id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-slate-900 truncate">
                          {bank.shortCode}
                        </span>
                        <span className="block text-[9px] text-slate-500 truncate">
                          {bank.nameUrdu}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Title / Nickname */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'ur' ? 'اکاؤنٹ کا نام / ٹائٹل' : 'Account Title / Nickname'}</span>
              </label>
              <input
                type="text"
                required
                placeholder={currentPreset.name}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                e.g., &quot;Meezan - Salary Account&quot; or &quot;HBL Savings&quot;
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account / IBAN Last 4 Digits */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ur' ? 'اکاؤنٹ یا کارڈ کے آخری ہندسے (اختیاری)' : 'Last 4 Digits / IBAN (Optional)'}</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9842"
                  maxLength={24}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'ur' ? 'ابتدائی بیلنس (روپے)' : 'Initial Balance (PKR)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BankLogo bankKey={selectedBankKey} size="md" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {customName || currentPreset.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {accountNumber ? `•••• ${accountNumber.slice(-4)}` : currentPreset.nameUrdu}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">
                  Rs. {(parseFloat(initialBalance) || 0).toLocaleString()}
                </span>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed Action Button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70">
          <button
            type="submit"
            form="add-account-form"
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'ur' ? 'بینک اکاؤنٹ محفوظ کریں' : 'Save Bank Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
