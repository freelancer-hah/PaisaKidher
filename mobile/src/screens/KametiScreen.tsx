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
  Coins,
  Plus,
  Calendar,
  CheckCircle2,
  Sparkles,
  Award,
  Trash2,
} from 'lucide-react-native';
import { KametiEntry, Language } from '../types';

interface KametiScreenProps {
  kametis: KametiEntry[];
  onOpenKametiModal: () => void;
  onPayInstallment: (id: string) => void;
  onClaimPayout: (id: string) => void;
  onDeleteKameti?: (id: string) => void;
  lang: Language;
}

export const KametiScreen: React.FC<KametiScreenProps> = ({
  kametis,
  onOpenKametiModal,
  onPayInstallment,
  onClaimPayout,
  onDeleteKameti,
  lang,
}) => {
  const totalMonthlyCommitment = kametis.reduce((acc, k) => acc + k.monthlyAmount, 0);
  const totalPoolSum = kametis.reduce((acc, k) => acc + k.monthlyAmount * k.totalMembers, 0);

  const confirmDelete = (kam: KametiEntry) => {
    if (!onDeleteKameti) return;
    Alert.alert(
      lang === 'ur' ? 'کمیٹی حذف کریں' : 'Delete Kameti',
      `Delete ${kam.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteKameti(kam.id),
        },
      ]
    );
  };

  const handleClaim = (kam: KametiEntry) => {
    Alert.alert(
      lang === 'ur' ? 'کمیٹی وصول کریں' : 'Claim Kameti Payout',
      `Did you receive the payout pool of Rs. ${(kam.monthlyAmount * kam.totalMembers).toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Received',
          onPress: () => onClaimPayout(kam.id),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {lang === 'ur' ? 'کمیٹی / بی سی مینجر' : 'Kameti (BC) Manager'}
          </Text>
          <Text style={styles.headerSub}>
            {lang === 'ur' ? 'ماہانہ بچت اور قرعہ اندازی' : 'Rotating Savings (ROSCA) Tracker'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={onOpenKametiModal}>
          <Plus size={16} color="#ffffff" />
          <Text style={styles.addBtnText}>{lang === 'ur' ? '+ نئی کمیٹی' : '+ New Kameti'}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Active Pools</Text>
          <Text style={styles.summaryNumber}>{kametis.length}</Text>
          <Text style={styles.summarySub}>Total Committees</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Monthly Due</Text>
          <Text style={styles.summaryNumber}>Rs. {totalMonthlyCommitment.toLocaleString()}</Text>
          <Text style={styles.summarySub}>Total Monthly Outflow</Text>
        </View>
      </View>

      {/* Kameti List */}
      {kametis.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Coins size={24} color="#7e22ce" />
          </View>
          <Text style={styles.emptyTitle}>
            {lang === 'ur' ? 'کوئی کمیٹی فعال نہیں' : 'No active Kameti'}
          </Text>
          <Text style={styles.emptySub}>
            {lang === 'ur'
              ? 'نئی بی سی / کمیٹی شروع کرنے کے لیے بٹن دبائیں۔'
              : 'Tap "+ New Kameti" to manage your rotating savings and payout turn.'}
          </Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={onOpenKametiModal}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.emptyAddBtnText}>Create Kameti</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.kametiList}>
          {kametis.map((kam) => {
            const totalPool = kam.monthlyAmount * kam.totalMembers;
            const isMyTurnNow = kam.currentMonth === kam.myTurnMonth;
            const progress = Math.min(100, Math.round((kam.currentMonth / kam.totalMembers) * 100));

            return (
              <View key={kam.id} style={styles.kametiCard}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <View style={styles.iconCircle}>
                      <Coins size={16} color="#7e22ce" />
                    </View>
                    <Text style={styles.titleText}>{kam.title}</Text>
                  </View>

                  <View style={styles.headerRight}>
                    {kam.isPayoutReceived ? (
                      <View style={[styles.badge, { backgroundColor: '#ecfdf5' }]}>
                        <CheckCircle2 size={12} color="#047857" />
                        <Text style={[styles.badgeText, { color: '#047857' }]}>Received</Text>
                      </View>
                    ) : isMyTurnNow ? (
                      <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
                        <Sparkles size={12} color="#d97706" />
                        <Text style={[styles.badgeText, { color: '#d97706' }]}>Your Turn!</Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, { backgroundColor: '#faf5ff' }]}>
                        <Text style={[styles.badgeText, { color: '#7e22ce' }]}>Active</Text>
                      </View>
                    )}

                    {onDeleteKameti && (
                      <TouchableOpacity onPress={() => confirmDelete(kam)} style={styles.deleteBtn}>
                        <Trash2 size={14} color="#cbd5e1" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Pool & Installment details */}
                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Total Payout Pool:</Text>
                    <Text style={styles.poolAmount}>Rs. {totalPool.toLocaleString()}</Text>
                    <Text style={styles.statSub}>
                      {kam.totalMembers} Members × Rs. {kam.monthlyAmount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.statColRight}>
                    <Text style={styles.statLabel}>Monthly Installment:</Text>
                    <Text style={styles.installmentAmount}>
                      Rs. {kam.monthlyAmount.toLocaleString()}
                    </Text>
                    <Text style={styles.statSub}>per month</Text>
                  </View>
                </View>

                {/* Progress bar and turns */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>
                      Month {kam.currentMonth} of {kam.totalMembers}
                    </Text>
                    <Text style={styles.turnLabel}>
                      Your Turn: Month {kam.myTurnMonth}
                    </Text>
                  </View>

                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                </View>

                {kam.notes ? <Text style={styles.notesText}>"{kam.notes}"</Text> : null}

                {/* Action buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => onPayInstallment(kam.id)}
                  >
                    <Text style={styles.payBtnText}>
                      Pay Installment (Rs. {kam.monthlyAmount.toLocaleString()})
                    </Text>
                  </TouchableOpacity>

                  {!kam.isPayoutReceived && (
                    <TouchableOpacity
                      style={styles.claimBtn}
                      onPress={() => handleClaim(kam)}
                    >
                      <Award size={14} color="#ffffff" />
                      <Text style={styles.claimBtnText}>Claim Payout</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7e22ce',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 2,
  },
  summarySub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#faf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptySub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7e22ce',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  kametiList: {
    gap: 14,
  },
  kametiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#faf5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#faf5ff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  statCol: {
    flex: 1,
  },
  statColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7e22ce',
  },
  poolAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#581c87',
    marginTop: 2,
  },
  installmentAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  turnLabel: {
    fontSize: 11,
    color: '#7e22ce',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7e22ce',
    borderRadius: 3,
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#64748b',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 12,
  },
  payBtn: {
    flex: 1,
    backgroundColor: '#faf5ff',
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  payBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7e22ce',
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#047857',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  claimBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

