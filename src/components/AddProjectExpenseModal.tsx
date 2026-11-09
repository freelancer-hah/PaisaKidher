'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  FileText,
  UserCheck,
  Tag,
  Building2,
  PlusCircle,
} from 'lucide-react';
import {
  ProjectEntry,
  ProjectExpenseItem,
  AccountBalance,
  Language,
} from '@/types';
import { PROJECT_SUBCATEGORIES } from '@/lib/storage';
import { BankLogo } from '@/components/BankLogo';

interface AddProjectExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectEntry[];
  accounts: AccountBalance[];
  initialProjectId?: string;
  onAddExpense: (
    expense: Omit<ProjectExpenseItem, 'id' | 'linkedTransactionId'>
  ) => void;
  onOpenAddAccountModal?: () => void;
  lang: Language;
}

export const AddProjectExpenseModal: React.FC<AddProjectExpenseModalProps> = ({
  isOpen,
  onClose,
  projects,
  accounts,
  initialProjectId,
  onAddExpense,
  onOpenAddAccountModal,
  lang,
}) => {
  const [projectId, setProjectId] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [customSubCategory, setCustomSubCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [vendorOrPerson, setVendorOrPerson] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // Sync default project and account
  useEffect(() => {
    if (initialProjectId) {
      setProjectId(initialProjectId);
    } else if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [initialProjectId, projects, projectId, isOpen]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId, isOpen]);

  const activeProject = projects.find((p) => p.id === projectId) || projects[0];

  // Reset or preset subcategory when project changes
  useEffect(() => {
    if (activeProject) {
      const presets = PROJECT_SUBCATEGORIES[activeProject.type] || [];
      if (presets.length > 0) {
        setSubCategory(presets[0]);
      }
    }
  }, [activeProject?.id, activeProject?.type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const finalSubCat =
      subCategory === 'custom'
        ? customSubCategory.trim() || (lang === 'ur' ? 'دیگر خرچ' : 'Other Expense')
        : subCategory;

    const chosenAccount = accountId || (accounts[0]?.id ?? 'cash');

    onAddExpense({
      projectId: activeProject?.id || projectId,
      subCategory: finalSubCat,
      amount: parsedAmount,
      accountId: chosenAccount,
      vendorOrPerson: vendorOrPerson.trim() || undefined,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
    });

    setAmount('');
    setCustomSubCategory('');
    setVendorOrPerson('');
    setNote('');
    onClose();
  };

  const presetSubCategories = activeProject
    ? PROJECT_SUBCATEGORIES[activeProject.type] || []
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'ur' ? 'پراجیکٹ خرچہ درج کریں' : 'Add Project Expense'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeProject ? activeProject.title : 'Itemized Project Sub-Ledger'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto modal-scrollbar flex-1">
          <form id="add-project-expense-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Project Picker if more than 1 project exists */}
            {projects.length > 1 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'ur' ? 'پراجیکٹ منتخب کریں' : 'Select Project'}
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.status === 'active' ? 'Active' : 'Completed'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sub-Category Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ur' ? 'اخراجات کی مد / سب کیٹیگری' : 'Expense Category / Mad'}
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {presetSubCategories.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="custom">
                  {lang === 'ur' ? '+ نئی کیٹیگری خود لکھیں...' : '+ Custom Sub-Category...'}
                </option>
              </select>

              {subCategory === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    placeholder={
                      lang === 'ur'
                        ? 'کیٹیگری کا نام لکھیں مثلاً شیشے کا کام، بورنگ...'
                        : 'Enter custom category name (e.g. Glass Work, Water Boring)'
                    }
                    value={customSubCategory}
                    onChange={(e) => setCustomSubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ur' ? 'رقم (روپے / PKR)' : 'Amount (PKR)'}
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

            {/* Vendor / Person / Receiver Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ur' ? 'کس کو ادا کیا؟ (مستری، مزدور، دکاندار، ٹھیکیدار)' : 'Paid To (Vendor / Person Name)'}
              </label>
              <input
                type="text"
                placeholder={
                  lang === 'ur'
                    ? 'مثلاً مستری اسلم، چناب ہارڈویئر، رحمان کیٹرنگ'
                    : 'e.g. Mistri Aslam, Chenab Hardware, Al-Madina Catering'
                }
                value={vendorOrPerson}
                onChange={(e) => setVendorOrPerson(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Account / Wallet Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'کس اکاؤنٹ / والیٹ سے ادا کیا؟' : 'Paid From Account / Wallet'}
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
                    ? 'کوئی اکاؤنٹ موجود نہیں، براہ کرم پہلے اکاؤنٹ شامل کریں۔'
                    : 'No accounts found. Please add Cash or Bank account first.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs max-h-36 overflow-y-auto modal-scrollbar pr-1">
                  {accounts.map((acc) => {
                    const isSelected = (accountId || accounts[0]?.id) === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAccountId(acc.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-semibold border transition text-left truncate cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-500/30'
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

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'تاریخ' : 'Date'}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'ur' ? 'بل نمبر / نوٹ' : 'Bill No / Note'}
                </label>
                <input
                  type="text"
                  placeholder="Bill # 1420..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70">
          <button
            type="submit"
            form="add-project-expense-form"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition active:scale-[0.99] cursor-pointer"
          >
            {lang === 'ur' ? 'خرچہ پراجیکٹ میں محفوظ کریں' : 'Save Project Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

