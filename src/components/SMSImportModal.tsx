'use client';

import React, { useState } from 'react';
import { X, MessageSquare, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { parsePakistaniSMS, ParsedSMSResult } from '@/lib/smsParser';
import { Transaction, Language } from '@/types';

interface SMSImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransaction: (tx: Omit<Transaction, 'id'>) => void;
  lang: Language;
}

export const SMSImportModal: React.FC<SMSImportModalProps> = ({
  isOpen,
  onClose,
  onImportTransaction,
  lang,
}) => {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState<ParsedSMSResult | null>(null);

  const SAMPLE_SMS = [
    {
      label: 'JazzCash Sent',
      text: 'Dear Customer, Rs. 2,450.00 has been paid to K-Electric for Bill Payment from your JazzCash Account. Balance: Rs. 8,200. TID: 99482104.',
    },
    {
      label: 'Easypaisa Received',
      text: 'You have received Rs. 15,000.00 from ALI KHAN in your Easypaisa Account. New Balance: Rs. 27,400.00. Trx ID: 29018471.',
    },
    {
      label: 'Meezan Bank Debit',
      text: 'Your Meezan Bank A/C ending 4910 has been debited by PKR 4,500.00 at IMTIAZ SUPER MARKET on 25-OCT. Available Balance PKR 64,000.00.',
    },
  ];

  if (!isOpen) return null;

  const handleSelectSample = (sample: string) => {
    setSmsText(sample);
    const result = parsePakistaniSMS(sample);
    setParsed(result);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSmsText(val);
    const result = parsePakistaniSMS(val);
    setParsed(result);
  };

  const handleConfirm = () => {
    if (parsed) {
      onImportTransaction({
        type: parsed.type,
        amount: parsed.amount,
        category: parsed.category,
        account: parsed.account,
        date: parsed.date,
        note: parsed.note,
        source: 'sms',
        externalRef: parsed.externalRef,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header - Fixed & Clean */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'ur' ? 'ایس ایم ایس آٹو کیپچر سمولیٹر' : 'Pakistani SMS Auto-Capture'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'ur'
                  ? 'جاز کیش، ایزی پیسہ یا بینک ایس ایم ایس کو خودکار انٹری میں تبدیل کریں'
                  : 'Simulate on-device SMS parsing for JazzCash, Easypaisa & Banks'}
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

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto modal-scrollbar flex-1 space-y-4">

        {/* Security / Privacy badge from doc */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 mb-4">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            {lang === 'ur'
              ? 'مکمل پروسیسنگ ڈیوائس پر ہوتی ہے، بینک ایس ایم ایس سرور پر نہیں جاتا۔'
              : '100% On-device regex parser. Bank SMS is never uploaded to any server.'}
          </span>
        </div>

        {/* Sample SMS Buttons */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Sample Pakistani SMS:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_SMS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.text)}
                className="p-2 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-slate-700 transition"
              >
                <div className="font-bold text-[11px] text-emerald-700">{sample.label}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{sample.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* SMS Text Area */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'ur' ? 'یا ایس ایم ایس ٹیکسٹ یہاں پیسٹ کریں:' : 'Or Paste SMS Text Here:'}
          </label>
          <textarea
            rows={3}
            value={smsText}
            onChange={handleTextChange}
            placeholder="Paste raw bank / wallet SMS text here..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Parsed Output */}
        {parsed && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Parsed Transaction
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                parsed.type === 'expense' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {parsed.type.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Amount</span>
                <span className="font-bold text-slate-900 text-sm">Rs. {parsed.amount.toLocaleString()}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Account</span>
                <span className="font-bold text-slate-900 uppercase">{parsed.account}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800">{parsed.category}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Transaction Ref</span>
                <span className="font-mono text-xs text-slate-700">{parsed.externalRef}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed Action Buttons */}
      <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button
          disabled={!parsed}
          onClick={handleConfirm}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200 transition"
        >
          <span>Confirm & Add Entry</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);
};
