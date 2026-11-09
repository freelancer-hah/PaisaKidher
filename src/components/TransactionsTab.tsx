'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Trash2, ArrowUpRight, ArrowDownLeft, Calendar, FileText } from 'lucide-react';
import { Transaction, PaymentMethod, Language, AccountBalance } from '@/types';
import { generateTransactionsPDF } from '@/lib/pdfGenerator';

interface TransactionsTabProps {
  transactions: Transaction[];
  accounts?: AccountBalance[];
  onDeleteTransaction: (id: string) => void;
  lang: Language;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  accounts = [],
  onDeleteTransaction,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesAccount = accountFilter === 'all' || t.account === accountFilter;
    return matchesSearch && matchesType && matchesAccount;
  });

  const exportCSV = () => {
    const headers = 'ID,Date,Type,Category,Account,Amount (PKR),Note,Source\n';
    const rows = filtered
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.type}","${t.category}","${t.account}",${t.amount},"${t.note.replace(/"/g, '""')}","${t.source || 'manual'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PaisaKidhar_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {lang === 'ur' ? 'مکمل کھاتہ و لین دین' : 'Transactions Ledger'}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ur'
              ? `کل ${filtered.length} اندراجات موجود ہیں`
              : `Showing ${filtered.length} entries with filters`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => generateTransactionsPDF(filtered, accounts, lang)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Download Official PDF Statement"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>{lang === 'ur' ? 'پی ڈی ایف اسٹیٹمنٹ' : 'Download PDF'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="light-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'ur' ? 'تلاش کریں...' : 'Search by category or note...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                typeFilter === 'expense' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                typeFilter === 'income' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Income
            </button>
          </div>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">{lang === 'ur' ? 'تمام کھاتے' : 'All Accounts'}</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="light-card rounded-2xl overflow-hidden border border-slate-200">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No transactions found matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
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
                  <div className="min-w-0">
                    <h5 className="font-semibold text-xs text-slate-900 truncate">{t.category}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{t.date}</span>
                      <span>•</span>
                      <span className="capitalize font-medium text-slate-600">{t.account}</span>
                      {t.source && (
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] text-slate-600">
                          {t.source}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{t.note}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold block ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {t.type}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
