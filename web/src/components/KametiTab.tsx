'use client';

import React from 'react';
import {
  Coins,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Award,
} from 'lucide-react';
import { KametiEntry, Language } from '@/types';
import confetti from 'canvas-confetti';

interface KametiTabProps {
  kametis: KametiEntry[];
  onOpenKametiModal: () => void;
  onPayInstallment: (id: string) => void;
  onClaimPayout: (id: string) => void;
  lang: Language;
}

export const KametiTab: React.FC<KametiTabProps> = ({
  kametis,
  onOpenKametiModal,
  onPayInstallment,
  onClaimPayout,
  lang,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleClaim = (id: string) => {
    triggerConfetti();
    onClaimPayout(id);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn">
      {/* Header and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {lang === 'ur' ? 'کمیٹی / بی سی مینجر' : 'Kameti (BC / Committee) Manager'}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ur'
              ? 'ماہانہ اقساط، باری کا مہینہ اور پول رقم کی وصولی کا ریکارڈ'
              : 'Track Rotating Savings Committees (ROSCA), payouts and monthly dues'}
          </p>
        </div>

        <button
          onClick={onOpenKametiModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold transition shadow-md shadow-purple-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ur' ? 'نئی کمیٹی بنائیں' : 'Create New Kameti'}</span>
        </button>
      </div>

      {/* Kameti List Cards */}
      {kametis.length === 0 ? (
        <div className="light-card p-12 text-center rounded-3xl border border-purple-100 bg-white text-slate-400 text-xs">
          {lang === 'ur'
            ? 'کوئی کمیٹی فعال نہیں ہے۔ "نئی کمیٹی بنائیں" پر کلک کر کے آغاز کریں۔'
            : 'No active Kameti found. Tap "Create New Kameti" to start tracking your rotating savings.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kametis.map((kam) => {
          const totalPool = kam.monthlyAmount * kam.totalMembers;
          const isMyTurnNow = kam.currentMonth === kam.myTurnMonth;
          const progress = Math.min(100, Math.round((kam.currentMonth / kam.totalMembers) * 100));

          return (
            <div
              key={kam.id}
              className="light-card p-6 rounded-3xl flex flex-col justify-between border border-purple-100 bg-white shadow-sm hover:shadow-md transition relative overflow-hidden"
            >
              {/* Subtle accent highlight */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      <Coins className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{kam.title}</h3>
                  </div>

                  {kam.isPayoutReceived ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Payout Received
                    </span>
                  ) : isMyTurnNow ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Your Turn Month!
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                      Active
                    </span>
                  )}
                </div>

                {/* Pool & Installment Details */}
                <div className="grid grid-cols-2 gap-3 my-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100/70">
                  <div>
                    <span className="text-[11px] text-purple-700 font-semibold block">
                      Total Payout Pool:
                    </span>
                    <span className="text-xl font-extrabold text-purple-950 block">
                      Rs. {totalPool.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-purple-600">
                      {kam.totalMembers} Members × Rs. {kam.monthlyAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-purple-700 font-semibold block">
                      Monthly Installment:
                    </span>
                    <span className="text-lg font-bold text-slate-800 block">
                      Rs. {kam.monthlyAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">per month</span>
                  </div>
                </div>

                {/* Month Progress & Turn */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">
                      Cycle Progress: Month {kam.currentMonth} of {kam.totalMembers}
                    </span>
                    <span className="text-purple-700 font-bold">
                      Your Turn: Month {kam.myTurnMonth}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {kam.notes && (
                  <p className="text-xs text-slate-500 italic mb-4">&ldquo;{kam.notes}&rdquo;</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onPayInstallment(kam.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition text-center"
                >
                  Pay Installment (Rs. {kam.monthlyAmount.toLocaleString()})
                </button>

                {!kam.isPayoutReceived && (
                  <button
                    onClick={() => handleClaim(kam.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-teal-700 transition shadow-sm"
                  >
                    <Award className="w-4 h-4" />
                    <span>Claim Payout (Rs. {totalPool.toLocaleString()})</span>
                  </button>
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
