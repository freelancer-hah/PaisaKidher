'use client';

import React, { useState } from 'react';
import {
  PieChart,
  BarChart3,
  Calendar,
  AlertTriangle,
  FileDown,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, Language } from '@/types';

interface AnalyticsTabProps {
  transactions: Transaction[];
  lang: Language;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ transactions, lang }) => {
  const [salaryStartDay, setSalaryStartDay] = useState(1);
  const [monthlyBudget, setMonthlyBudget] = useState(50000);

  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const categoryMap: { [cat: string]: number } = {};
  expenses.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Group by payment mode
  const accountMap: { [acc: string]: number } = {};
  expenses.forEach((t) => {
    accountMap[t.account] = (accountMap[t.account] || 0) + t.amount;
  });

  const budgetUsagePercent = Math.min(100, Math.round((totalExpense / monthlyBudget) * 100));

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {lang === 'ur' ? 'اخراجات کے تجزیات اور بجٹ' : 'Spending Analytics & Budget'}
        </h2>
        <p className="text-xs text-slate-500">
          {lang === 'ur'
            ? 'تنخواہ کے سائیکل اور کیٹیگری کے حساب سے تجزیہ'
            : 'Category-wise spending, payment channels and monthly budget tracker'}
        </p>
      </div>

      {/* Monthly Budget Card with Alerts (Doc section 5.1 E) */}
      <div className="light-card p-6 rounded-3xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Budget Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                Rs. {totalExpense.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">
                spent of Rs. {monthlyBudget.toLocaleString()} limit
              </span>
            </div>
          </div>

          {budgetUsagePercent >= 90 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Critical: 90%+ Budget Consumed!</span>
            </div>
          ) : budgetUsagePercent >= 75 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Warning: 75%+ Consumed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Within Safe Budget</span>
            </div>
          )}
        </div>

        {/* Budget Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              budgetUsagePercent > 85
                ? 'bg-rose-500'
                : budgetUsagePercent > 70
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${budgetUsagePercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>0%</span>
          <span>{budgetUsagePercent}% Spent</span>
          <span>100%</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="light-card p-6 rounded-3xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Category-wise Spending Breakdown</span>
          </h3>

          <div className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {lang === 'ur'
                  ? 'ابھی اخراجات کا کوئی ریکارڈ موجود نہیں ہے۔'
                  : 'No expense records found to generate category analytics.'}
              </div>
            ) : (
              categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-slate-900">
                        Rs. {item.amount.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spending Channels / Payment Modes */}
        <div className="light-card p-6 rounded-3xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Expenses by Payment Channel</span>
            </h3>

            <div className="space-y-3">
              {Object.keys(accountMap).length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {lang === 'ur'
                    ? 'چینل کے اخراجات کا ڈیٹا ابھی دستیاب نہیں ہے۔'
                    : 'No payment channel activity yet.'}
                </div>
              ) : (
                Object.entries(accountMap).map(([acc, amount], idx) => {
                  const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100"
                    >
                      <div>
                        <span className="font-bold text-xs uppercase text-slate-800 block">
                          {acc}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {percent}% of overall spending
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Rs. {amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Salary Cycle Setting Note */}
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
            <span className="font-bold text-emerald-950 block mb-1">
              {lang === 'ur' ? 'پاکستانی تنخواہ کا سائیکل' : 'Pakistani Salary Month Cycle'}
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              In Pakistan, expenses run from 1st or 5th of the month. Paisa Kidhar resets your monthly limits on your chosen salary credit date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
