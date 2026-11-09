import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  MessageSquare,
  Users2,
  Coins,
  ChevronRight,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react-native';
import { Transaction, AccountBalance, UdhaarEntry, KametiEntry, Language } from '../types';
import { BankLogo } from '../components/BankLogo';

interface DashboardScreenProps {
  transactions: Transaction[];
  accounts: AccountBalance[];
  udhaarList: UdhaarEntry[];
  kametis: KametiEntry[];
  lang: Language;
  onOpenVoice: () => void;
  onOpenAddModal: () => void;
  onOpenAddAccountModal: () => void;
  onOpenSMSModal: () => void;
  onDeleteAccount: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  transactions,
  accounts,
  udhaarList,
  kametis,
  lang,
  onOpenVoice,
  onOpenAddModal,
  onOpenAddAccountModal,
  onOpenSMSModal,
  onDeleteAccount,
  onDeleteTransaction,
  navigation,
}) => {
  // Calculations
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalLena = udhaarList
    .filter((u) => u.direction === 'given')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const totalDena = udhaarList
    .filter((u) => u.direction === 'taken')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const recentTransactions = transactions.slice(0, 5);

  const confirmDeleteAccount = (acc: AccountBalance) => {
    Alert.alert(
      lang === 'ur' ? 'اکاؤنٹ حذف کریں' : 'Delete Account',
      lang === 'ur'
        ? `کیا آپ واقعی ${acc.name} کو حذف کرنا چاہتے ہیں؟`
        : `Are you sure you want to remove ${acc.name}?`,
      [
        { text: lang === 'ur' ? 'منسوخ' : 'Cancel', style: 'cancel' },
        {
          text: lang === 'ur' ? 'حذف کریں' : 'Delete',
          style: 'destructive',
          onPress: () => onDeleteAccount(acc.id),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Hero Financial Health Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.balanceLabelRow}>
            <Wallet size={16} color="#d1fae5" />
            <Text style={styles.balanceLabel}>
              {lang === 'ur' ? 'کل دستیاب بیلنس' : 'Total Net Balance'}
            </Text>
          </View>
          <Text style={styles.balanceAmount}>Rs. {totalBalance.toLocaleString()}</Text>
          <Text style={styles.balanceSubtext}>
            {lang === 'ur'
              ? 'کیش، بینک اور تمام والٹس کا مجموعہ'
              : 'Across all wallets, banks & cash'}
          </Text>
        </View>

        {/* Quick Voice / Entry Actions on Hero */}
        <View style={styles.heroActionRow}>
          <TouchableOpacity style={styles.heroSecondaryBtn} onPress={onOpenVoice}>
            <Sparkles size={16} color="#a7f3d0" />
            <Text style={styles.heroSecondaryBtnText}>
              {lang === 'ur' ? 'بول کر لکھیں' : 'Voice Entry'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroPrimaryBtn} onPress={onOpenAddModal}>
            <Plus size={16} color="#065f46" />
            <Text style={styles.heroPrimaryBtnText}>
              {lang === 'ur' ? '+ اندراج کریں' : '+ Quick Entry'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Income & Expense Bar */}
        <View style={styles.heroStatsRow}>
          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <TrendingUp size={16} color="#a7f3d0" />
            </View>
            <View>
              <Text style={styles.statLabel}>{lang === 'ur' ? 'آمدن' : 'Income'}</Text>
              <Text style={styles.statValue}>Rs. {totalIncome.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <TrendingDown size={16} color="#fecdd3" />
            </View>
            <View>
              <Text style={styles.statLabel}>{lang === 'ur' ? 'خرچہ' : 'Expense'}</Text>
              <Text style={styles.statValue}>Rs. {totalExpense.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Action Buttons Grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={onOpenVoice}>
          <View style={[styles.quickIconCircle, { backgroundColor: '#fef3c7' }]}>
            <Sparkles size={20} color="#d97706" />
          </View>
          <Text style={styles.quickCardTitle}>{lang === 'ur' ? 'آواز' : 'Voice'}</Text>
          <Text style={styles.quickCardSub}>{lang === 'ur' ? 'اردو میں بولیں' : 'AI Speech'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={onOpenSMSModal}>
          <View style={[styles.quickIconCircle, { backgroundColor: '#e0e7ff' }]}>
            <MessageSquare size={20} color="#4f46e5" />
          </View>
          <Text style={styles.quickCardTitle}>{lang === 'ur' ? 'SMS امپورٹ' : 'Bank SMS'}</Text>
          <Text style={styles.quickCardSub}>{lang === 'ur' ? 'آٹو پارس' : 'OTP & Alerts'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={onOpenAddAccountModal}>
          <View style={[styles.quickIconCircle, { backgroundColor: '#dcfce7' }]}>
            <Plus size={20} color="#16a34a" />
          </View>
          <Text style={styles.quickCardTitle}>{lang === 'ur' ? 'نیا بینک' : 'Add Bank'}</Text>
          <Text style={styles.quickCardSub}>{lang === 'ur' ? 'والٹ شامل کریں' : 'Custom Wallet'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('Udhaar')}>
          <View style={[styles.quickIconCircle, { backgroundColor: '#ffedd5' }]}>
            <Users2 size={20} color="#ea580c" />
          </View>
          <Text style={styles.quickCardTitle}>{lang === 'ur' ? 'ادھار' : 'Udhaar'}</Text>
          <Text style={styles.quickCardSub}>{lang === 'ur' ? 'کھاتہ اور یاد دہانی' : 'WhatsApp'}</Text>
        </TouchableOpacity>
      </View>

      {/* Accounts & Wallets Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {lang === 'ur' ? 'بینک اکاؤنٹس اور بٹوے' : 'Wallets & Bank Accounts'}
          </Text>
          <Text style={styles.sectionSub}>
            {lang === 'ur'
              ? `کل ${accounts.length} فعال اکاؤنٹس`
              : `${accounts.length} Active Accounts`}
          </Text>
        </View>
        <TouchableOpacity style={styles.addSmallBtn} onPress={onOpenAddAccountModal}>
          <Plus size={14} color="#047857" />
          <Text style={styles.addSmallBtnText}>{lang === 'ur' ? 'نیا اکاؤنٹ' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyAccountsCard}>
          <View style={styles.emptyIconCircle}>
            <Wallet size={24} color="#047857" />
          </View>
          <Text style={styles.emptyTitle}>
            {lang === 'ur' ? 'کوئی اکاؤنٹ شامل نہیں' : 'No accounts added yet'}
          </Text>
          <Text style={styles.emptyDesc}>
            {lang === 'ur'
              ? 'اپنی مرضی کا بینک (میزان، HBL)، سادہ پے یا کیش شامل کریں۔'
              : 'Add your custom bank account, digital wallet or cash to track balances.'}
          </Text>
          <TouchableOpacity style={styles.primaryActionBtn} onPress={onOpenAddAccountModal}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.primaryActionBtnText}>
              {lang === 'ur' ? 'پہلا اکاؤنٹ شامل کریں' : 'Add First Account'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountsScroll}>
          {accounts.map((acc) => (
            <View key={acc.id} style={styles.accountCard}>
              <View style={styles.accTop}>
                <View style={styles.accInfo}>
                  <Text style={styles.accName} numberOfLines={1}>{acc.name}</Text>
                  <Text style={styles.accSub} numberOfLines={1}>
                    {acc.accountNumber ? `•••• ${acc.accountNumber.slice(-4)}` : acc.nameUrdu || acc.bankKey || 'Wallet'}
                  </Text>
                </View>
                <BankLogo bankKey={acc.bankKey || acc.id} size="sm" />
              </View>
              <View style={styles.accBottom}>
                <Text style={styles.accBalance}>Rs. {acc.balance.toLocaleString()}</Text>
                <TouchableOpacity onPress={() => confirmDeleteAccount(acc)} style={styles.accDeleteBtn}>
                  <Trash2 size={13} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Udhaar & Kameti Highlights */}
      <View style={styles.highlightsContainer}>
        {/* Udhaar Ledger Card */}
        <TouchableOpacity
          style={styles.highlightCard}
          onPress={() => navigation.navigate('Udhaar')}
        >
          <View style={styles.hlHeader}>
            <View style={[styles.hlIcon, { backgroundColor: '#fef3c7' }]}>
              <Users2 size={18} color="#b45309" />
            </View>
            <View style={styles.hlTitleCol}>
              <Text style={styles.hlTitle}>{lang === 'ur' ? 'ادھار کھاتہ' : 'Udhaar Ledger'}</Text>
              <Text style={styles.hlSub}>{lang === 'ur' ? 'لینا اور دینا' : 'Receivables & Payables'}</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </View>
          <View style={styles.hlValuesRow}>
            <View style={[styles.hlValueCol, { backgroundColor: '#fffbeb' }]}>
              <Text style={[styles.hlValueLabel, { color: '#b45309' }]}>
                {lang === 'ur' ? 'لینا ہے (Lent)' : 'To Receive'}
              </Text>
              <Text style={[styles.hlValueNum, { color: '#78350f' }]}>
                Rs. {totalLena.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.hlValueCol, { backgroundColor: '#eef2ff' }]}>
              <Text style={[styles.hlValueLabel, { color: '#4338ca' }]}>
                {lang === 'ur' ? 'دینا ہے (Payable)' : 'To Pay'}
              </Text>
              <Text style={[styles.hlValueNum, { color: '#312e81' }]}>
                Rs. {totalDena.toLocaleString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Kameti BC Card */}
        <TouchableOpacity
          style={styles.highlightCard}
          onPress={() => navigation.navigate('Kameti')}
        >
          <View style={styles.hlHeader}>
            <View style={[styles.hlIcon, { backgroundColor: '#f3e8ff' }]}>
              <Coins size={18} color="#7e22ce" />
            </View>
            <View style={styles.hlTitleCol}>
              <Text style={styles.hlTitle}>{lang === 'ur' ? 'کمیٹی / بی سی' : 'Kameti (BC) Tracker'}</Text>
              <Text style={styles.hlSub}>
                {kametis.length} {lang === 'ur' ? 'فعال کمیٹیاں' : 'Active Pools'}
              </Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </View>
          <View style={styles.hlValuesRow}>
            <View style={[styles.hlValueCol, { backgroundColor: '#faf5ff', flex: 1 }]}>
              <Text style={[styles.hlValueLabel, { color: '#6b21a8' }]}>
                {lang === 'ur' ? 'ماہانہ کل قسط' : 'Total Monthly Pool'}
              </Text>
              <Text style={[styles.hlValueNum, { color: '#581c87' }]}>
                Rs. {kametis.reduce((acc, k) => acc + (k.monthlyAmount * k.totalMembers), 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {lang === 'ur' ? 'حالیہ لین دین' : 'Recent Transactions'}
          </Text>
          <Text style={styles.sectionSub}>
            {lang === 'ur' ? 'آخری درج کردہ اندراجات' : 'Latest activity'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addSmallBtn}
          onPress={() => navigation.navigate('Transactions')}
        >
          <Text style={styles.addSmallBtnText}>{lang === 'ur' ? 'سب دیکھیں' : 'View All'}</Text>
          <ChevronRight size={14} color="#047857" />
        </TouchableOpacity>
      </View>

      {recentTransactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {lang === 'ur' ? 'ابھی کوئی لین دین نہیں ہے' : 'No transactions yet'}
          </Text>
          <Text style={styles.emptyDesc}>
            {lang === 'ur' ? 'پہلا خرچہ یا آمدن درج کرنے کے لیے نیچے بٹن دبائیں۔' : 'Tap the entry button to log your first transaction.'}
          </Text>
        </View>
      ) : (
        <View style={styles.txList}>
          {recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txIconBox,
                    tx.type === 'income' ? styles.txIconIncome : styles.txIconExpense,
                  ]}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft size={16} color="#047857" />
                  ) : (
                    <ArrowUpRight size={16} color="#e11d48" />
                  )}
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.note || tx.category}</Text>
                  <View style={styles.txMeta}>
                    <Text style={styles.txCategory}>{tx.category}</Text>
                    <Text style={styles.txDot}>•</Text>
                    <Text style={styles.txAccount}>{tx.account}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    tx.type === 'income' ? styles.incomeText : styles.expenseText,
                  ]}
                >
                  {tx.type === 'income' ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
                </Text>
                <TouchableOpacity
                  onPress={() => onDeleteTransaction(tx.id)}
                  style={styles.txDeleteBtn}
                >
                  <Trash2 size={13} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Extra Bottom Padding for Navigation Bar */}
      <View style={{ height: 40 }} />
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
  },
  heroCard: {
    backgroundColor: '#047857',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroHeader: {
    marginBottom: 16,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d1fae5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  balanceSubtext: {
    fontSize: 11,
    color: '#a7f3d0',
    marginTop: 2,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  heroSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroSecondaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  heroPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 14,
  },
  heroPrimaryBtnText: {
    color: '#065f46',
    fontWeight: '800',
    fontSize: 12,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 14,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#d1fae5',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  quickCardSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  addSmallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  emptyAccountsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#047857',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  accountsScroll: {
    marginBottom: 20,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
    width: 150,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  accTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  accInfo: {
    flex: 1,
    marginRight: 6,
  },
  accName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  accSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  accBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 8,
  },
  accBalance: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  accDeleteBtn: {
    padding: 3,
  },
  highlightsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  highlightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  hlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hlIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  hlTitleCol: {
    flex: 1,
  },
  hlTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  hlSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  hlValuesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hlValueCol: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
  },
  hlValueLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  hlValueNum: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  txList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconIncome: {
    backgroundColor: '#ecfdf5',
  },
  txIconExpense: {
    backgroundColor: '#fff1f2',
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  txCategory: {
    fontSize: 11,
    color: '#64748b',
  },
  txDot: {
    fontSize: 10,
    color: '#cbd5e1',
  },
  txAccount: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  incomeText: {
    color: '#047857',
  },
  expenseText: {
    color: '#e11d48',
  },
  txDeleteBtn: {
    padding: 2,
  },
});
