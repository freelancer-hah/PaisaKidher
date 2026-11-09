'use client';

import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Calendar,
  FileText,
  Building2,
  HeartHandshake,
  Paintbrush,
  Activity,
  Briefcase,
  FolderKanban,
} from 'lucide-react';
import { ProjectEntry, ProjectType, Language } from '@/types';
import { PROJECT_TYPES_LIST } from '@/lib/storage';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (
    project: Omit<ProjectEntry, 'id' | 'totalSpent' | 'status'>
  ) => void;
  lang: Language;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  lang,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ProjectType>('construction');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateProject({
      title: title.trim(),
      type,
      startDate: startDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setType('construction');
    setNotes('');
    onClose();
  };

  const getIcon = (typeKey: ProjectType) => {
    switch (typeKey) {
      case 'construction':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'wedding':
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case 'renovation':
        return <Paintbrush className="w-4 h-4 text-indigo-600" />;
      case 'medical':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'business':
        return <Briefcase className="w-4 h-4 text-cyan-600" />;
      default:
        return <FolderKanban className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'ur' ? 'نیا پراجیکٹ کھاتہ بنائیں' : 'Create Special Project'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'ur'
                  ? 'مکان تعمیر، شادی، مرمت یا خاص ایونٹ کا الگ کھاتہ'
                  : 'Independent sub-ledger with custom itemized categories'}
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
          <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Project Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ur' ? 'پراجیکٹ کا نام / عنوان' : 'Project Title / Name'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  lang === 'ur'
                    ? 'مثلاً مکان تعمیر G-11، حمزہ کی شادی، دکان رینوویشن'
                    : 'e.g. Dream House Construction, Hamza Wedding, Shop Setup'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Project Type Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'ur' ? 'پراجیکٹ کی نوعیت منتخب کریں' : 'Select Project Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROJECT_TYPES_LIST.map((p) => {
                  const isSelected = type === p.type;
                  return (
                    <button
                      key={p.type}
                      type="button"
                      onClick={() => setType(p.type)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="shrink-0">{getIcon(p.type)}</div>
                      <div className="truncate">
                        <p className="text-xs truncate">{lang === 'ur' ? p.labelUrdu : p.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ur' ? 'آغاز کی تاریخ' : 'Start Date'}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Notes / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ur' ? 'تفصیل / نوٹ (اختیاری)' : 'Description / Notes (Optional)'}
              </label>
              <textarea
                rows={2}
                placeholder={
                  lang === 'ur'
                    ? 'کوئی خاص تفصیل، پلاٹ نمبر، یا مقام...'
                    : 'Any location, contractor details, or notes...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              💡 {lang === 'ur'
                ? 'اس پراجیکٹ کے تمام اخراجات آپ کے بینک اور کیش والیٹ سے براہ راست ادا ہوں گے اور الگ پی ڈی ایف رپورٹ بھی بن سکے گی۔'
                : 'All expenses logged under this project will deduct from your chosen wallet and can be exported as an independent executive PDF report.'}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70">
          <button
            type="submit"
            form="create-project-form"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition active:scale-[0.99] cursor-pointer"
          >
            {lang === 'ur' ? 'پراجیکٹ کھاتہ شروع کریں' : 'Create Project Ledger'}
          </button>
        </div>
      </div>
    </div>
  );
};

