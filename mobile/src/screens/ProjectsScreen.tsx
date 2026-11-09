import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  ProjectEntry,
  ProjectExpenseItem,
  AccountBalance,
  ProjectType,
  Language,
} from '../types';
import { exportProjectPDFMobile, getAccountDisplayName } from '../lib/pdfGenerator';
import { BankLogo } from '../components/BankLogo';
import {
  Building2,
  HeartHandshake,
  Paintbrush,
  Activity,
  Briefcase,
  FolderKanban,
  Plus,
  FileText,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react-native';

interface ProjectsScreenProps {
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

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
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
        return <Building2 size={16} color="#d97706" />;
      case 'wedding':
        return <HeartHandshake size={16} color="#e11d48" />;
      case 'renovation':
        return <Paintbrush size={16} color="#4f46e5" />;
      case 'medical':
        return <Activity size={16} color="#059669" />;
      case 'business':
        return <Briefcase size={16} color="#0891b2" />;
      default:
        return <FolderKanban size={16} color="#64748b" />;
    }
  };

  const getTypeLabel = (type: ProjectType) => {
    switch (type) {
      case 'construction':
        return lang === 'ur' ? 'تعمیر مکان' : 'Construction';
      case 'wedding':
        return lang === 'ur' ? 'شادی بیاہ' : 'Wedding';
      case 'renovation':
        return lang === 'ur' ? 'مرمت و رینوویشن' : 'Renovation';
      case 'medical':
        return lang === 'ur' ? 'علاج معالجہ' : 'Medical';
      case 'business':
        return lang === 'ur' ? 'بزنس و منصوبہ' : 'Business';
      default:
        return lang === 'ur' ? 'خاص کھاتہ' : 'Project';
    }
  };

  const confirmDeleteProject = (project: ProjectEntry) => {
    Alert.alert(
      lang === 'ur' ? 'پراجیکٹ حذف کریں' : 'Delete Project',
      `Delete "${project.title}" and its expenses?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteProject(project.id),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {lang === 'ur' ? 'خاص پروجیکٹس کھاتہ' : 'Special Projects Ledger'}
          </Text>
          <Text style={styles.headerSub}>
            {lang === 'ur' ? 'تعمیر مکان، شادی، مرمت وغیرہ کا الگ ریکارڈ' : 'Construction, wedding & event ledgers'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {projects.length > 0 && (
            <TouchableOpacity
              style={styles.addExpBtn}
              onPress={() => onOpenAddExpenseModal()}
            >
              <Plus size={15} color="#047857" />
              <Text style={styles.addExpBtnText}>{lang === 'ur' ? 'خرچہ' : 'Expense'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.newProjBtn} onPress={onOpenCreateModal}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.newProjBtnText}>{lang === 'ur' ? 'نیا پراجیکٹ' : 'New'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.spentCard}>
          <Text style={styles.spentLabel}>{lang === 'ur' ? 'تمام پروجیکٹس کا کل خرچ' : 'Total Spent'}</Text>
          <Text style={styles.spentAmount}>Rs. {totalSpentAll.toLocaleString()}</Text>
          <Text style={styles.spentSub}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</Text>
        </View>
        <View style={styles.statusCountCard}>
          <Text style={styles.statusCountLabel}>{lang === 'ur' ? 'زیرِ تکمیل' : 'Active'}</Text>
          <Text style={styles.statusCountVal}>{activeCount}</Text>
          <Text style={styles.statusCountSub}>Completed: {completedCount}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tabBtn, filterStatus === 'all' && styles.tabBtnActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.tabText, filterStatus === 'all' && styles.tabTextActive]}>
            All ({projects.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filterStatus === 'active' && styles.tabBtnActive]}
          onPress={() => setFilterStatus('active')}
        >
          <Text style={[styles.tabText, filterStatus === 'active' && styles.tabTextActive]}>
            Active ({activeCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filterStatus === 'completed' && styles.tabBtnActive]}
          onPress={() => setFilterStatus('completed')}
        >
          <Text style={[styles.tabText, filterStatus === 'completed' && styles.tabTextActive]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyCard}>
          <FolderKanban size={40} color="#cbd5e1" style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={styles.emptyTitle}>
            {lang === 'ur' ? 'کوئی پروجیکٹ کھاتہ موجود نہیں ہے' : 'No projects found'}
          </Text>
          <Text style={styles.emptySub}>
            {lang === 'ur'
              ? 'مکان تعمیر، شادی یا مرمت کے لیے نیا پروجیکٹ بنائیں تاکہ تمام اخراجات کا تفصیلی ریکارڈ محفوظ رہے۔'
              : 'Create a dedicated sub-ledger for construction, wedding, or renovation.'}
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={onOpenCreateModal}>
            <Text style={styles.startBtnText}>{lang === 'ur' ? '+ پراجیکٹ شروع کریں' : '+ Start Project'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filteredProjects.map((project) => {
          const expenses = projectExpenses.filter((e) => e.projectId === project.id);
          const totalProjectSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
          const isExpanded = expandedProjectId === project.id;

          // Compute subcategory totals
          const subCategoryTotals: Record<string, number> = {};
          expenses.forEach((e) => {
            subCategoryTotals[e.subCategory] = (subCategoryTotals[e.subCategory] || 0) + e.amount;
          });
          const topSubCats = Object.entries(subCategoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

          return (
            <View key={project.id} style={styles.projectCard}>
              {/* Card Header */}
              <View style={styles.projHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <View style={styles.typeBadge}>
                      {getTypeIcon(project.type)}
                      <Text style={styles.typeBadgeText}>{getTypeLabel(project.type)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onToggleProjectStatus(project.id)}
                      style={[styles.statusBadge, project.status === 'completed' && styles.statusCompleted]}
                    >
                      <Text style={[styles.statusText, project.status === 'completed' && styles.statusTextCompleted]}>
                        {project.status === 'active' ? '● Active' : '✓ Completed'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.projTitle}>{project.title}</Text>
                  {project.notes ? (
                    <Text style={styles.projNotes} numberOfLines={2}>
                      "{project.notes}"
                    </Text>
                  ) : null}
                  <Text style={styles.projDate}>Started: {project.startDate}</Text>
                </View>

                <TouchableOpacity onPress={() => confirmDeleteProject(project)} style={styles.trashBtn}>
                  <Trash2 size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Total Spend banner */}
              <View style={styles.spendBanner}>
                <View>
                  <Text style={styles.spendBannerLabel}>TOTAL SPENT</Text>
                  <Text style={styles.spendBannerAmount}>Rs. {totalProjectSpent.toLocaleString()}</Text>
                </View>
                <Text style={styles.spendCountText}>{expenses.length} entries</Text>
              </View>

              {/* Subcategories Breakdown Chips */}
              {topSubCats.length > 0 && (
                <View style={styles.subCatRow}>
                  {topSubCats.map(([catName, amt], idx) => (
                    <View key={idx} style={styles.subCatPill}>
                      <Text style={styles.subCatPillText} numberOfLines={1}>{catName}: </Text>
                      <Text style={styles.subCatPillAmt}>Rs. {amt.toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions row */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.addExpenseActionBtn}
                  onPress={() => onOpenAddExpenseModal(project.id)}
                >
                  <Plus size={14} color="#ffffff" />
                  <Text style={styles.addExpenseActionText}>{lang === 'ur' ? '+ خرچہ' : '+ Add Expense'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pdfActionBtn}
                  onPress={() => exportProjectPDFMobile(project, expenses, accounts, lang)}
                >
                  <FileText size={14} color="#047857" />
                  <Text style={styles.pdfActionText}>PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.expandActionBtn}
                  onPress={() => setExpandedProjectId(isExpanded ? null : project.id)}
                >
                  {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </TouchableOpacity>
              </View>

              {/* Expanded Itemized Ledger */}
              {isExpanded && (
                <View style={styles.expandedLedger}>
                  <Text style={styles.expandedHeader}>
                    {lang === 'ur' ? 'تفصیلی اخراجات کھاتہ' : 'Itemized Sub-Ledger'} ({expenses.length})
                  </Text>
                  {expenses.length === 0 ? (
                    <Text style={styles.noExpText}>
                      {lang === 'ur' ? 'ابھی کوئی خرچہ درج نہیں ہوا' : 'No expenses recorded yet'}
                    </Text>
                  ) : (
                    expenses.map((item) => {
                      const accName = getAccountDisplayName(item.accountId, accounts);
                      return (
                        <View key={item.id} style={styles.expenseItemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.expSubCat}>{item.subCategory}</Text>
                            <Text style={styles.expMeta}>
                              {item.date} • {item.vendorOrPerson ? `Paid to: ${item.vendorOrPerson} • ` : ''}{accName}
                            </Text>
                            {item.note ? <Text style={styles.expNote}>"{item.note}"</Text> : null}
                          </View>
                          <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                            <Text style={styles.expAmount}>Rs. {item.amount.toLocaleString()}</Text>
                            <TouchableOpacity
                              onPress={() => onDeleteExpenseItem(item.id)}
                              style={{ padding: 4 }}
                            >
                              <Trash2 size={13} color="#cbd5e1" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  addExpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 4,
  },
  addExpBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  newProjBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#059669',
    gap: 4,
  },
  newProjBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  spentCard: {
    flex: 2,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  spentLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    textTransform: 'uppercase',
  },
  spentAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#064e3b',
    marginTop: 4,
  },
  spentSub: {
    fontSize: 10,
    color: '#059669',
    marginTop: 2,
  },
  statusCountCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  statusCountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  statusCountVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  statusCountSub: {
    fontSize: 9.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  emptyCard: {
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  startBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#059669',
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  projHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
  },
  statusCompleted: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  statusTextCompleted: {
    color: '#64748b',
  },
  projTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  projNotes: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  projDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  trashBtn: {
    padding: 6,
  },
  spendBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  spendBannerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
  },
  spendBannerAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 1,
  },
  spendCountText: {
    fontSize: 10,
    color: '#64748b',
  },
  subCatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  subCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  subCatPillText: {
    fontSize: 10,
    color: '#475569',
  },
  subCatPillAmt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  addExpenseActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#059669',
    gap: 4,
  },
  addExpenseActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  pdfActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  pdfActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  expandActionBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  expandedLedger: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  expandedHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  noExpText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  expenseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  expSubCat: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  expMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  expNote: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 1,
  },
  expAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },
});

