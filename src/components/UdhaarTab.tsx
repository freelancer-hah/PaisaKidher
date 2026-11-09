'use client';

import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertCircle,
  MessageSquare,
  FileText,
  Trash2,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { UdhaarEntry, AccountBalance, Language } from '@/types';
import { generateSingleUdhaarPDF, generateAllUdhaarPDF, getAccountDisplayName } from '@/lib/pdfGenerator';
import { BankLogo } from '@/components/BankLogo';

interface UdhaarTabProps {
  udhaarList: UdhaarEntry[];
  accounts?: AccountBalance[];
  onOpenUdhaarModal: () => void;
  onRecordPayment: (id: string, amount: number, accountId?: string) => void;
  onDeleteUdhaar?: (id: string) => void;
  lang: Language;
}

export const UdhaarTab: React.FC<UdhaarTabProps> = ({
  udhaarList,
  accounts = [],
  onOpenUdhaarModal,
  onRecordPayment,
  onDeleteUdhaar,
  lang,
}) => {
  const [filterDirection, setFilterDirection] = useState<'all' | 'given' | 'taken'>('all');
  const [activePartialId, setActivePartialId] = useState<string | null>(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const filtered = udhaarList.filter(
    (u) => filterDirection === 'all' || u.direction === filterDirection
  );

  const totalLena = udhaarList
    .filter((u) => u.direction === 'given')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const totalDena = udhaarList
    .filter((u) => u.direction === 'taken')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const handleSendWhatsAppReminder = (entry: UdhaarEntry) => {
    const remaining = entry.totalAmount - entry.paidAmount;
    const message =
      lang === 'ur'
        ? `السلام علیکم ${entry.contactName} بھائی! امید ہے آپ خیریت سے ہوں گے۔ یاد دہانی کے لیے عرض ہے کہ بقایا ادھار رقم Rs. ${remaining.toLocaleString()} واجب الادا ہے۔ جب سہولت ہو ادا فرمائیے گا۔ شکریہ!`
        : `Assalam-o-Alaikum ${entry.contactName} bhai, hope you are well. A gentle reminder regarding the remaining udhaar balance of Rs. ${remaining.toLocaleString()}. Please clear it when convenient. JazakAllah!`;

    const cleanPhone = entry.contactPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  const handleStartPartialPayment = (entry: UdhaarEntry) => {
    setActivePartialId(entry.id);
    setPartialAmount('');
    setSelectedAccountId(entry.accountId || accounts[0]?.id || 'cash');
  };

  const handleConfirmPartial = (entry: UdhaarEntry) => {
    const amt = parseFloat(partialAmount);
    if (!isNaN(amt) && amt > 0) {
      const chosenAcc = selectedAccountId || entry.accountId || accounts[0]?.id || 'cash';
      onRecordPayment(entry.id, amt, chosenAcc);
      setPartialAmount('');
      setActivePartialId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {lang === 'ur' ? 'ادھار اور کھاتہ رجسٹر' : 'Udhaar (Lend/Borrow) Ledger'}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ur'
              ? 'کس سے لینا ہے، کس کو دینا ہے اور بینک والیٹ کے ساتھ بیلنس کا اندراج'
              : 'Track who owes you, whom you owe, with live wallet & bank sync'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {udhaarList.length > 0 && (
            <button
              onClick={() => generateAllUdhaarPDF(udhaarList, lang)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
              title="Download Full Udhaar Register PDF"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>{lang === 'ur' ? 'کھاتہ پی ڈی ایف' : 'Register PDF'}</span>
            </button>
          )}

          <button
            onClick={onOpenUdhaarModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold transition shadow-md shadow-amber-200 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ur' ? 'نیا ادھار درج کریں' : 'Add Udhaar Entry'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
              {lang === 'ur' ? 'کل لینا ہے (Maine Diya)' : 'Total Receivable (Maine Diya)'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
              Receivable
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950">
            Rs. {totalLena.toLocaleString()}
          </div>
          <p className="text-xs text-amber-700/80 mt-1">
            {lang === 'ur' ? 'دوستوں یا رشتہ داروں سے واپس آنے والی رقم' : 'Money you lent out to others'}
          </p>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-indigo-600" />
              {lang === 'ur' ? 'کل دینا ہے (Maine Liya)' : 'Total Payable (Maine Liya)'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900">
              Payable
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950">
            Rs. {totalDena.toLocaleString()}
          </div>
          <p className="text-xs text-indigo-700/80 mt-1">
            {lang === 'ur' ? 'دکانداروں یا دوستوں کو واپس دینے والی رقم' : 'Money you borrowed and have to pay back'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setFilterDirection('all')}
          className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
            filterDirection === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          All ({udhaarList.length})
        </button>
        <button
          onClick={() => setFilterDirection('given')}
          className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
            filterDirection === 'given' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Maine Diya (Lena hai)
        </button>
        <button
          onClick={() => setFilterDirection('taken')}
          className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
            filterDirection === 'taken' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Maine Liya (Dena hai)
        </button>
      </div>

      {/* Udhaar Entries Grid */}
      {filtered.length === 0 ? (
        <div className="light-card p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
          {lang === 'ur'
            ? 'کوئی ادھار کھاتہ موجود نہیں ہے۔ "نیا ادھار درج کریں" کا بٹن دبا کر کھاتہ شروع کریں۔'
            : 'No Udhaar records found. Tap "Add Udhaar Entry" to track lent or borrowed money.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => {
            const remaining = entry.totalAmount - entry.paidAmount;
            const isSettled = remaining <= 0;
            const progress = Math.min(100, Math.round((entry.paidAmount / entry.totalAmount) * 100));
            const isEditingPayment = activePartialId === entry.id;
            const linkedAcc = accounts.find((a) => a.id === entry.accountId);

            return (
              <div
                key={entry.id}
                className={`light-card p-5 rounded-3xl flex flex-col justify-between border transition shadow-xs hover:shadow-md ${
                  entry.direction === 'given' ? 'border-amber-100 bg-white' : 'border-indigo-100 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        entry.direction === 'given'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {entry.direction === 'given' ? 'Lena Hai (Lent)' : 'Dena Hai (Borrowed)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isSettled
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.paidAmount > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSettled ? 'Settled / بے باق' : `${progress}% Paid`}
                      </span>
                      {onDeleteUdhaar && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                lang === 'ur'
                                  ? 'کیا آپ واقعی اس ادھار کھاتے کو ڈیلیٹ کرنا چاہتے ہیں؟'
                                  : `Delete Udhaar record for ${entry.contactName}?`
                              )
                            ) {
                              onDeleteUdhaar(entry.id);
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{entry.contactName}</h4>
                  {entry.contactPhone && (
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{entry.contactPhone}</p>
                  )}

                  {/* Linked Wallet Info */}
                  {linkedAcc && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg w-fit border border-slate-100">
                      <BankLogo bankKey={linkedAcc.bankKey || linkedAcc.id} size="sm" className="w-4 h-4 rounded-sm" />
                      <span>{linkedAcc.name}</span>
                    </div>
                  )}

                  {/* Amount Details */}
                  <div className="my-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Baqi (Remaining):</span>
                      <span
                        className={`font-extrabold text-base ${
                          entry.direction === 'given' ? 'text-amber-800' : 'text-indigo-800'
                        }`}
                      >
                        Rs. {remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total: Rs. {entry.totalAmount.toLocaleString()}</span>
                      <span>Paid: Rs. {entry.paidAmount.toLocaleString()}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          entry.direction === 'given' ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {entry.note && (
                    <p className="text-xs text-slate-500 italic mb-2.5">&ldquo;{entry.note}&rdquo;</p>
                  )}

                  {entry.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {entry.dueDate}</span>
                    </div>
                  )}
                </div>

                {/* Actions / Payment Box */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {isEditingPayment ? (
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>
                          {entry.direction === 'given'
                            ? lang === 'ur'
                              ? 'وصولی درج کریں (Deposit In)'
                              : 'Record Recovery'
                            : lang === 'ur'
                            ? 'ادائیگی درج کریں (Paid From)'
                            : 'Record Repayment'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Max: Rs. {remaining.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Amount (PKR)"
                          max={remaining}
                          value={partialAmount}
                          onChange={(e) => setPartialAmount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Account selector for payment */}
                      {accounts.length > 0 && (
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                            {entry.direction === 'given'
                              ? lang === 'ur'
                                ? 'رقم کس اکاؤنٹ میں وصول ہوئی؟'
                                : 'Received into wallet:'
                              : lang === 'ur'
                              ? 'رقم کس اکاؤنٹ سے ادا کی؟'
                              : 'Paid from wallet:'}
                          </label>
                          <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                          >
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name} (Rs. {acc.balance.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleConfirmPartial(entry)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                        >
                          {lang === 'ur' ? 'محفوظ کریں' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setActivePartialId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                        >
                          {lang === 'ur' ? 'منسوخ' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!isSettled && (
                        <button
                          onClick={() => handleStartPartialPayment(entry)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition text-center cursor-pointer active:scale-95"
                        >
                          + {entry.direction === 'given' ? 'وصولی / Recovery' : 'ادائیگی / Pay'}
                        </button>
                      )}

                      {entry.direction === 'given' && !isSettled && (
                        <button
                          onClick={() => handleSendWhatsAppReminder(entry)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                          title="Send WhatsApp Reminder Message"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      <button
                        onClick={() => generateSingleUdhaarPDF(entry, lang)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-200 text-xs font-bold transition cursor-pointer"
                        title="Download Party Khata Statement PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
