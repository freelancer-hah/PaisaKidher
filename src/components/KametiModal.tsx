'use client';

import React, { useState } from 'react';
import { X, Users, DollarSign, Calendar, Info } from 'lucide-react';
import { KametiEntry, Language } from '@/types';

interface KametiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKameti: (entry: Omit<KametiEntry, 'id' | 'paidMonthsCount' | 'isPayoutReceived' | 'status'>) => void;
  lang: Language;
}

export const KametiModal: React.FC<KametiModalProps> = ({
  isOpen,
  onClose,
  onAddKameti,
  lang,
}) => {
  const [title, setTitle] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [totalMembers, setTotalMembers] = useState('10');
  const [myTurnMonth, setMyTurnMonth] = useState('5');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(monthlyAmount);
    const members = parseInt(totalMembers, 10);
    const turn = parseInt(myTurnMonth, 10);

    if (isNaN(amount) || amount <= 0 || !title.trim() || isNaN(members) || isNaN(turn)) return;

    onAddKameti({
      title: title.trim(),
      monthlyAmount: amount,
      totalMembers: members,
      currentMonth: 1,
      myTurnMonth: turn,
      startDate,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setMonthlyAmount('');
    setNotes('');
    onClose();
  };

  const pool = (parseFloat(monthlyAmount) || 0) * (parseInt(totalMembers, 10) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header - Fixed & Clean */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'ur' ? 'نئی کمیٹی / بی سی بنائیں' : 'Create New Kameti (BC)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'ur' ? 'ماہانہ قسط اور اپنی باری کا ریکارڈ رکھیں' : 'Track monthly installment and your payout turn'}
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
          <form id="add-kameti-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ur' ? 'کمیٹی کا نام' : 'Kameti Title'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mohalla Kameti, Office Friends BC"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ur' ? 'ماہانہ قسط (روپے)' : 'Monthly Installment (PKR)'}
              </label>
              <input
                type="number"
                required
                placeholder="10000"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ur' ? 'کل ممبرز' : 'Total Members'}
              </label>
              <input
                type="number"
                required
                min="2"
                max="50"
                value={totalMembers}
                onChange={(e) => setTotalMembers(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ur' ? 'آپ کی باری کا مہینہ' : 'Your Turn (Month #)'}
              </label>
              <input
                type="number"
                required
                min="1"
                max={totalMembers || 50}
                value={myTurnMonth}
                onChange={(e) => setMyTurnMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ur' ? 'شروع ہونے کی تاریخ' : 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Calculated Pool preview */}
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
            <span className="text-purple-900 font-medium">
              {lang === 'ur' ? 'کل وصولی پول (Payout Pool):' : 'Total Pool Amount:'}
            </span>
            <span className="font-bold text-purple-700 text-sm">
              Rs. {pool.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ur' ? 'اضافی نوٹس' : 'Notes (Optional)'}
            </label>
            <input
              type="text"
              placeholder="e.g. Organizer Asif Bhai, payment on 5th"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          </form>
        </div>

        {/* Footer - Fixed Action Button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70">
          <button
            type="submit"
            form="add-kameti-form"
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md shadow-purple-200 transition"
          >
            {lang === 'ur' ? 'کمیٹی محفوظ کریں' : 'Save Kameti'}
          </button>
        </div>
      </div>
    </div>
  );
};
