'use client';

import React, { useState } from 'react';
import {
  FolderPlus,
  Plus,
  Building2,
  HeartHandshake,
  Paintbrush,
  Activity,
  Briefcase,
  FolderKanban,
  FileText,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ProjectEntry,
  ProjectExpenseItem,
  AccountBalance,
  ProjectType,
  Language,
} from '@/types';
import { generateProjectPDF, getAccountDisplayName } from '@/lib/pdfGenerator';
import { BankLogo } from '@/components/BankLogo';

interface ProjectsTabProps {
  projects: ProjectEntry[];
  projectExpenses: ProjectExpenseItem[];
  accounts: AccountBalance[];
  onOpenCreateModal: () => void;
  onOpenAddExpenseModal: (projectId?: string) => void;
  onToggleProjectStatus: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onDeleteExpenseItem: (id: string) => void;
  lang: Language;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  projectExpenses,
  accounts,
  onOpenCreateModal,
  onOpenAddExpenseModal,
  onToggleProjectStatus,
  onDeleteProject,
  onDeleteExpenseItem,
  lang,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const filteredProjects = projects.filter(
    (p) => filterStatus === 'all' || p.status === filterStatus
  );

  const totalSpentAll = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'construction':
        return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'wedding':
        return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 'renovation':
        return <Paintbrush className="w-5 h-5 text-indigo-600" />;
      case 'medical':
        return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'business':
        return <Briefcase className="w-5 h-5 text-cyan-600" />;
      default:
        return <FolderKanban className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeBadge = (type: ProjectType) => {
    switch (type) {
      case 'construction':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          label: lang === 'ur' ? 'تعمیر مکان' : 'Construction',
        };
      case 'wedding':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          label: lang === 'ur' ? 'شادی بیاہ' : 'Wedding',
        };
      case 'renovation':
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          label: lang === 'ur' ? 'مرمت و رینوویشن' : 'Renovation',
        };
      case 'medical':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: lang === 'ur' ? 'علاج معالجہ' : 'Medical',
        };
      case 'business':
        return {
          bg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          label: lang === 'ur' ? 'بزنس و منصوبہ' : 'Business',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          label: lang === 'ur' ? 'خاص کھاتہ' : 'Special Project',
        };
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {lang === 'ur'
              ? 'خاص پروجیکٹس اور سب لیجرز (Projects Sub-Ledger)'
              : 'Special Projects & Sub-Ledgers'}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ur'
              ? 'تعمیر مکان، مزدوری، میٹریل، شادی، یا مرمت کے مد وائز اخراجات کا تفصیلی ریکارڈ'
              : 'Track itemized expenses for construction, weddings, renovations & major life events'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {projects.length > 0 && (
            <button
              onClick={() => onOpenAddExpenseModal()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'ur' ? '+ خرچہ درج کریں' : '+ Add Expense'}</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-200 active:scale-95 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>{lang === 'ur' ? 'نیا پراجیکٹ بنائیں' : 'New Project'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            {lang === 'ur' ? 'تمام پروجیکٹس کا کل خرچ' : 'Total Spent (All Projects)'}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Rs. {totalSpentAll.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-700/80 mt-1">
            {lang === 'ur' ? 'بینک اور کیش سے ادا شدہ رقم' : 'Paid directly from active accounts'}
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            {lang === 'ur' ? 'زیرِ تکمیل پروجیکٹس' : 'Active Projects'}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950">
            {activeCount}
          </div>
          <p className="text-xs text-amber-700/80 mt-1">
            {lang === 'ur' ? 'جن کے اخراجات جاری ہیں' : 'Ongoing expenditure trackings'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            {lang === 'ur' ? 'مکمل شدہ منصوبے' : 'Completed Projects'}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {completedCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ur' ? 'جن کا کھاتہ محفوظ ہے' : 'Archived statement records'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
            filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
            filterStatus === 'active' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
            filterStatus === 'completed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="light-card p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 text-sm mb-1">
            {lang === 'ur'
              ? 'کوئی پروجیکٹ کھاتہ موجود نہیں ہے'
              : 'No project sub-ledgers found'}
          </p>
          <p className="max-w-md mx-auto mb-4 text-slate-400">
            {lang === 'ur'
              ? 'اگر آپ مکان بنوا رہے ہیں، شادی یا کوئی خاص تقریب ہے تو "نیا پراجیکٹ بنائیں" پر کلک کریں تاکہ مزدوری، میٹریل اور تمام اشیاء کا الگ حساب رہے۔'
              : 'Start a dedicated ledger for Construction, Wedding, or Home Renovation to track labor, materials, and purchases with full PDF reports.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition cursor-pointer"
          >
            {lang === 'ur' ? '+ پہلا پروجیکٹ شروع کریں' : '+ Start First Project'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const expenses = projectExpenses.filter((e) => e.projectId === project.id);
            const totalProjectSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
            const badge = getTypeBadge(project.type);
            const isExpanded = expandedProjectId === project.id;

            // Compute subcategory totals
            const subCategoryTotals: Record<string, number> = {};
            expenses.forEach((e) => {
              subCategoryTotals[e.subCategory] = (subCategoryTotals[e.subCategory] || 0) + e.amount;
            });
            const topSubCategories = Object.entries(subCategoryTotals)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4);

            return (
              <div
                key={project.id}
                className="light-card rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition hover:border-slate-300"
              >
                {/* Main Project Card Banner */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Title and metadata */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          onClick={() => onToggleProjectStatus(project.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                            project.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active / Completed"
                        >
                          {project.status === 'active' ? '● Active' : '✓ Completed'}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {project.startDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          {getTypeIcon(project.type)}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {project.title}
                        </h3>
                      </div>

                      {project.notes && (
                        <p className="text-xs text-slate-500 italic max-w-xl">
                          &ldquo;{project.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Spend Counter and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl sm:text-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {lang === 'ur' ? 'کل خرچہ (Total Spent)' : 'Total Spent'}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                          Rs. {totalProjectSpent.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenAddExpenseModal(project.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{lang === 'ur' ? 'خرچہ' : 'Add'}</span>
                        </button>

                        <button
                          onClick={() => generateProjectPDF(project, expenses, accounts, lang)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition active:scale-95 cursor-pointer"
                          title="Download Executive Project Statement PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedProjectId(isExpanded ? null : project.id)
                          }
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition cursor-pointer"
                          title={isExpanded ? 'Collapse Ledger' : 'View Detailed Ledger'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                lang === 'ur'
                                  ? `کیا آپ واقعی پراجیکٹ "${project.title}" کو حذف کرنا چاہتے ہیں؟`
                                  : `Delete project "${project.title}" and its ledger items?`
                              )
                            ) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Top Subcategories Breakdown Chips */}
                  {topSubCategories.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {lang === 'ur' ? 'نمایاں اخراجات:' : 'Major Breakdowns:'}
                      </span>
                      {topSubCategories.map(([catName, amt], idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium flex items-center gap-1.5"
                        >
                          <span className="truncate max-w-[140px]">{catName}</span>
                          <span className="font-bold text-slate-900">
                            Rs. {amt.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collapsible Itemized Ledger Table */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {lang === 'ur'
                            ? `تفصیلی کھاتہ (${project.title})`
                            : `Itemized Sub-Ledger (${project.title})`}
                        </span>
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        {expenses.length} records
                      </span>
                    </div>

                    {expenses.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                        {lang === 'ur'
                          ? 'ابھی تک اس پراجیکٹ میں کوئی خرچ درج نہیں ہوا۔ اوپر "+ خرچہ" کا بٹن دبائیں۔'
                          : 'No expenses recorded for this project yet. Tap "+ Add" above.'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">{lang === 'ur' ? 'تاریخ' : 'Date'}</th>
                              <th className="py-2.5 px-3">{lang === 'ur' ? 'مَد / کیٹیگری' : 'Category / Mad'}</th>
                              <th className="py-2.5 px-3">{lang === 'ur' ? 'کس کو دیا (مستری/دکان)' : 'Paid To (Vendor)'}</th>
                              <th className="py-2.5 px-3">{lang === 'ur' ? 'بینک/والٹ' : 'Paid Via'}</th>
                              <th className="py-2.5 px-3">{lang === 'ur' ? 'نوٹ' : 'Note / Bill'}</th>
                              <th className="py-2.5 px-3 text-end">{lang === 'ur' ? 'رقم' : 'Amount'}</th>
                              <th className="py-2.5 px-2 text-center w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {expenses.map((item) => {
                              const accName = getAccountDisplayName(item.accountId, accounts);
                              const acc = accounts.find((a) => a.id === item.accountId);
                              return (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                    {item.date}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                                    {item.subCategory}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600">
                                    {item.vendorOrPerson ? (
                                      <span className="flex items-center gap-1">
                                        <UserCheck className="w-3 h-3 text-slate-400" />
                                        {item.vendorOrPerson}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <BankLogo
                                        bankKey={acc?.bankKey || item.accountId}
                                        size="sm"
                                        className="w-4 h-4 rounded-xs"
                                      />
                                      <span className="text-[11px] truncate max-w-[100px]">
                                        {accName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                    {item.note || '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-end font-extrabold text-slate-900 whitespace-nowrap">
                                    Rs. {item.amount.toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      onClick={() => onDeleteExpenseItem(item.id)}
                                      className="p-1 text-slate-300 hover:text-rose-500 rounded hover:bg-rose-50 transition cursor-pointer"
                                      title="Delete Expense Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

