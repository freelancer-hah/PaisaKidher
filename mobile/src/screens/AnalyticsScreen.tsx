import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  PieChart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wallet,
} from 'lucide-react-native';
import { Transaction, Language } from '../types';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  lang: Language;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ transactions, lang }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(50000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [customBudgetInput, setCustomBudgetInput] = useState('50000');

  const expenses = transactions.filter((t) => t.type === 'expense');
  const incomes = transactions.filter((t) => t.type === 'income');

  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

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

  // Group by account
  const accountMap: { [acc: string]: number } = {};
  expenses.forEach((t) => {
    accountMap[t.account] = (accountMap[t.account] || 0) + t.amount;
  });

  const accountBreakdown = Object.entries(accountMap)
    .map(([acc, amount]) => ({
      account: acc,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const budgetUsagePercent = Math.min(100, Math.round((totalExpense / monthlyBudget) * 100));

  const handleSaveBudget = () => {
    const val = parseFloat(customBudgetInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
      setIsEditingBudget(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {lang === 'ur' ? 'اخراجات کے تجزیات اور بجٹ' : 'Spending Analytics'}
        </Text>
        <Text style={styles.headerSub}>
          {lang === 'ur' ? 'ماہانہ بجٹ اور زمرہ وار تفاصیل' : 'Budget tracking & category breakdown'}
        </Text>
      </View>

      {/* Financial Health Summary */}
      <View style={styles.healthGrid}>
        <View style={styles.healthBox}>
          <Text style={styles.healthLabel}>{lang === 'ur' ? 'آمدن' : 'Income'}</Text>
          <Text style={[styles.healthNum, { color: '#047857' }]}>
            Rs. {totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={styles.healthBox}>
          <Text style={styles.healthLabel}>{lang === 'ur' ? 'خرچہ' : 'Expense'}</Text>
          <Text style={[styles.healthNum, { color: '#e11d48' }]}>
            Rs. {totalExpense.toLocaleString()}
          </Text>
        </View>

        <View style={styles.healthBox}>
          <Text style={styles.healthLabel}>{lang === 'ur' ? 'بچت' : 'Savings'}</Text>
          <Text
            style={[
              styles.healthNum,
              { color: netSavings >= 0 ? '#047857' : '#e11d48' },
            ]}
          >
            Rs. {netSavings.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Monthly Budget Card */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View>
            <Text style={styles.budgetTitle}>Monthly Budget Progress</Text>
            <Text style={styles.budgetAmount}>
              Rs. {totalExpense.toLocaleString()}{' '}
              <Text style={styles.budgetSub}>of Rs. {monthlyBudget.toLocaleString()}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editBudgetBtn}
            onPress={() => setIsEditingBudget(!isEditingBudget)}
          >
            <Text style={styles.editBudgetBtnText}>
              {isEditingBudget ? 'Cancel' : 'Set Limit'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingBudget && (
          <View style={styles.editBudgetRow}>
            <TextInput
              style={styles.budgetInput}
              keyboardType="numeric"
              value={customBudgetInput}
              onChangeText={setCustomBudgetInput}
              placeholder="Budget Limit (PKR)"
            />
            <TouchableOpacity style={styles.saveBudgetBtn} onPress={handleSaveBudget}>
              <Text style={styles.saveBudgetBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Badge */}
        <View style={styles.statusBadgeRow}>
          {budgetUsagePercent >= 90 ? (
            <View style={[styles.statusBadge, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
              <AlertTriangle size={14} color="#b91c1c" />
              <Text style={[styles.statusBadgeText, { color: '#b91c1c' }]}>
                Critical: 90%+ Consumed!
              </Text>
            </View>
          ) : budgetUsagePercent >= 75 ? (
            <View style={[styles.statusBadge, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
              <AlertTriangle size={14} color="#b45309" />
              <Text style={[styles.statusBadgeText, { color: '#b45309' }]}>
                Warning: 75%+ Consumed
              </Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
              <CheckCircle2 size={14} color="#047857" />
              <Text style={[styles.statusBadgeText, { color: '#047857' }]}>
                Within Safe Budget
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${budgetUsagePercent}%`,
                backgroundColor:
                  budgetUsagePercent >= 90
                    ? '#e11d48'
                    : budgetUsagePercent >= 75
                    ? '#f59e0b'
                    : '#047857',
              },
            ]}
          />
        </View>
        <View style={styles.progressPercentRow}>
          <Text style={styles.progressPercentText}>0%</Text>
          <Text style={styles.progressPercentText}>{budgetUsagePercent}% Spent</Text>
          <Text style={styles.progressPercentText}>100%</Text>
        </View>
      </View>

      {/* Category Spending Breakdown */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <PieChart size={16} color="#047857" />
          <Text style={styles.sectionTitle}>Category Spending Breakdown</Text>
        </View>

        {categoryBreakdown.length === 0 ? (
          <Text style={styles.emptyText}>No expense transactions recorded yet.</Text>
        ) : (
          <View style={styles.breakdownList}>
            {categoryBreakdown.map((item, idx) => (
              <View key={idx} style={styles.breakdownItem}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemLabel}>{item.category}</Text>
                  <View style={styles.itemValues}>
                    <Text style={styles.itemAmount}>Rs. {item.amount.toLocaleString()}</Text>
                    <Text style={styles.itemPercent}>({item.percentage}%)</Text>
                  </View>
                </View>
                <View style={styles.itemBarBg}>
                  <View
                    style={[
                      styles.itemBarFill,
                      { width: `${item.percentage}%`, backgroundColor: '#047857' },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Payment Channel Breakdown */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Wallet size={16} color="#4f46e5" />
          <Text style={styles.sectionTitle}>Payment Channels (Wallets & Banks)</Text>
        </View>

        {accountBreakdown.length === 0 ? (
          <Text style={styles.emptyText}>No channel data available.</Text>
        ) : (
          <View style={styles.breakdownList}>
            {accountBreakdown.map((item, idx) => (
              <View key={idx} style={styles.breakdownItem}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemLabel}>{item.account}</Text>
                  <View style={styles.itemValues}>
                    <Text style={styles.itemAmount}>Rs. {item.amount.toLocaleString()}</Text>
                    <Text style={styles.itemPercent}>({item.percentage}%)</Text>
                  </View>
                </View>
                <View style={styles.itemBarBg}>
                  <View
                    style={[
                      styles.itemBarFill,
                      { width: `${item.percentage}%`, backgroundColor: '#4f46e5' },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

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
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  healthGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  healthBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  healthLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  healthNum: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  budgetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  budgetSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  editBudgetBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editBudgetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  editBudgetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  budgetInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  saveBudgetBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
  },
  saveBudgetBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadgeRow: {
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressPercentText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    paddingVertical: 12,
    textAlign: 'center',
  },
  breakdownList: {
    gap: 12,
  },
  breakdownItem: {
    gap: 4,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemPercent: {
    fontSize: 11,
    color: '#94a3b8',
  },
  itemBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  itemBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

