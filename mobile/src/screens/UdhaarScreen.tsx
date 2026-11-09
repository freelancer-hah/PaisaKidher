import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import {
  Users2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Phone,
  FileText,
} from 'lucide-react-native';
import { UdhaarEntry, AccountBalance, Language } from '../types';
import { exportSingleUdhaarPDFMobile, exportAllUdhaarPDFMobile } from '../lib/pdfGenerator';
import { BankLogo } from '../components/BankLogo';

interface UdhaarScreenProps {
  udhaarList: UdhaarEntry[];
  accounts?: AccountBalance[];
  onOpenUdhaarModal: () => void;
  onRecordPayment: (id: string, amount: number, accountId?: string) => void;
  onDeleteUdhaar?: (id: string) => void;
  lang: Language;
}

export const UdhaarScreen: React.FC<UdhaarScreenProps> = ({
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
  const [selectedPayAccountId, setSelectedPayAccountId] = useState<string>('');

  const filtered = udhaarList.filter(
    (u) => filterDirection === 'all' || u.direction === filterDirection
  );

  const totalLena = udhaarList
    .filter((u) => u.direction === 'given')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const totalDena = udhaarList
    .filter((u) => u.direction === 'taken')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const handleSendWhatsAppReminder = async (entry: UdhaarEntry) => {
    const remaining = entry.totalAmount - entry.paidAmount;
    const message =
      lang === 'ur'
        ? `السلام علیکم ${entry.contactName} بھائی! امید ہے آپ خیریت سے ہوں گے۔ یاد دہانی کے لیے عرض ہے کہ بقایا ادھار رقم Rs. ${remaining.toLocaleString()} واجب الادا ہے۔ جب سہولت ہو ادا فرمائیے گا۔ شکریہ!`
        : `Assalam-o-Alaikum ${entry.contactName} bhai, hope you are well. A gentle reminder regarding the remaining udhaar balance of Rs. ${remaining.toLocaleString()}. Please clear it when convenient. JazakAllah!`;

    const cleanPhone = (entry.contactPhone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to web link
        const webUrl = cleanPhone
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        await Linking.openURL(webUrl);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to open WhatsApp on your device.');
    }
  };

  const handleConfirmPartial = (entry: UdhaarEntry) => {
    const amt = parseFloat(partialAmount);
    if (!isNaN(amt) && amt > 0) {
      const chosenAcc = selectedPayAccountId || entry.accountId || accounts[0]?.id || 'cash';
      onRecordPayment(entry.id, amt, chosenAcc);
      setPartialAmount('');
      setActivePartialId(null);
    } else {
      Alert.alert(lang === 'ur' ? 'غلط رقم' : 'Invalid Amount', 'Please enter a valid amount.');
    }
  };

  const confirmDelete = (entry: UdhaarEntry) => {
    if (!onDeleteUdhaar) return;
    Alert.alert(
      lang === 'ur' ? 'ادھار حذف کریں' : 'Delete Udhaar Record',
      `Delete entry for ${entry.contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteUdhaar(entry.id),
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
            {lang === 'ur' ? 'ادھار کھاتہ رجسٹر' : 'Udhaar Ledger'}
          </Text>
          <Text style={styles.headerSub}>
            {lang === 'ur' ? 'کس سے لینا ہے، کس کو دینا ہے' : 'Lend & borrow tracker'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {udhaarList.length > 0 && (
            <TouchableOpacity
              style={styles.allPdfBtn}
              onPress={() => exportAllUdhaarPDFMobile(udhaarList, lang)}
            >
              <FileText size={15} color="#b45309" />
              <Text style={styles.allPdfBtnText}>PDF</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.addBtn} onPress={onOpenUdhaarModal}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addBtnText}>{lang === 'ur' ? '+ نیا ادھار' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {/* Lena Hai */}
        <View style={styles.lenaCard}>
          <View style={styles.cardHeader}>
            <View style={styles.directionRow}>
              <ArrowUpRight size={14} color="#d97706" />
              <Text style={styles.lenaLabel}>
                {lang === 'ur' ? 'لینا ہے (Diya)' : 'Receivable'}
              </Text>
            </View>
          </View>
          <Text style={styles.lenaAmount}>Rs. {totalLena.toLocaleString()}</Text>
          <Text style={styles.cardSub}>
            {lang === 'ur' ? 'جو پیسے وصول کرنے ہیں' : 'Lent out to others'}
          </Text>
        </View>

        {/* Dena Hai */}
        <View style={styles.denaCard}>
          <View style={styles.cardHeader}>
            <View style={styles.directionRow}>
              <ArrowDownLeft size={14} color="#4f46e5" />
              <Text style={styles.denaLabel}>
                {lang === 'ur' ? 'دینا ہے (Liya)' : 'Payable'}
              </Text>
            </View>
          </View>
          <Text style={styles.denaAmount}>Rs. {totalDena.toLocaleString()}</Text>
          <Text style={styles.cardSub}>
            {lang === 'ur' ? 'جو پیسے واپس دینے ہیں' : 'Borrowed to pay'}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tabBtn, filterDirection === 'all' && styles.tabBtnActive]}
          onPress={() => setFilterDirection('all')}
        >
          <Text style={[styles.tabText, filterDirection === 'all' && styles.tabTextActive]}>
            All ({udhaarList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterDirection === 'given' && styles.tabBtnActive]}
          onPress={() => setFilterDirection('given')}
        >
          <Text style={[styles.tabText, filterDirection === 'given' && styles.tabTextActive]}>
            {lang === 'ur' ? 'لینا ہے (Lent)' : 'Lent (Receivable)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterDirection === 'taken' && styles.tabBtnActive]}
          onPress={() => setFilterDirection('taken')}
        >
          <Text style={[styles.tabText, filterDirection === 'taken' && styles.tabTextActive]}>
            {lang === 'ur' ? 'دینا ہے (Borrowed)' : 'Borrowed'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Entry Cards */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {lang === 'ur' ? 'کوئی ادھار کھاتہ نہیں ملا' : 'No udhaar records'}
          </Text>
          <Text style={styles.emptySub}>
            {lang === 'ur'
              ? 'نیا ادھار شامل کرنے کے لیے اوپر بٹن دبائیں۔'
              : 'Tap "+ Add" to log lent or borrowed amounts.'}
          </Text>
        </View>
      ) : (
        <View style={styles.entriesList}>
          {filtered.map((entry) => {
            const remaining = entry.totalAmount - entry.paidAmount;
            const isSettled = remaining <= 0;
            const progress = Math.min(100, Math.round((entry.paidAmount / entry.totalAmount) * 100));

            return (
              <View
                key={entry.id}
                style={[
                  styles.entryCard,
                  entry.direction === 'given' ? styles.entryCardGiven : styles.entryCardTaken,
                ]}
              >
                {/* Badge & Settled status */}
                <View style={styles.entryTopRow}>
                  <View
                    style={[
                      styles.directionBadge,
                      entry.direction === 'given' ? styles.badgeGiven : styles.badgeTaken,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        entry.direction === 'given' ? styles.badgeTextGiven : styles.badgeTextTaken,
                      ]}
                    >
                      {entry.direction === 'given' ? 'Lena Hai (Lent)' : 'Dena Hai (Borrowed)'}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {isSettled ? 'Settled / بے باق' : `${progress}% Paid`}
                    </Text>
                  </View>
                </View>

                {/* Contact Name & Phone */}
                <View style={styles.contactRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{entry.contactName}</Text>
                    {entry.contactPhone ? (
                      <Text style={styles.contactPhone}>{entry.contactPhone}</Text>
                    ) : null}
                  </View>
                  {onDeleteUdhaar && (
                    <TouchableOpacity onPress={() => confirmDelete(entry)} style={{ padding: 4 }}>
                      <Trash2 size={16} color="#cbd5e1" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Amount Box */}
                <View style={styles.amountBox}>
                  <View style={styles.amountLine}>
                    <Text style={styles.amountLabel}>Remaining Balance:</Text>
                    <Text
                      style={[
                        styles.remainingValue,
                        entry.direction === 'given' ? styles.textAmber : styles.textIndigo,
                      ]}
                    >
                      Rs. {remaining.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.subAmountLine}>
                    <Text style={styles.subAmountText}>
                      Total: Rs. {entry.totalAmount.toLocaleString()}
                    </Text>
                    <Text style={styles.subAmountText}>
                      Paid: Rs. {entry.paidAmount.toLocaleString()}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: entry.direction === 'given' ? '#f59e0b' : '#6366f1',
                        },
                      ]}
                    />
                  </View>
                </View>

                {entry.note ? <Text style={styles.noteText}>"{entry.note}"</Text> : null}

                {entry.dueDate ? (
                  <View style={styles.dateMeta}>
                    <Calendar size={12} color="#94a3b8" />
                    <Text style={styles.dateMetaText}>Due: {entry.dueDate}</Text>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionsBox}>
                  {activePartialId === entry.id ? (
                    <View style={{ width: '100%' }}>
                      <View style={styles.partialInputRow}>
                        <TextInput
                          style={styles.partialInput}
                          placeholder="Amount (PKR)"
                          keyboardType="numeric"
                          value={partialAmount}
                          onChangeText={setPartialAmount}
                        />
                        <TouchableOpacity
                          style={styles.savePartialBtn}
                          onPress={() => handleConfirmPartial(entry)}
                        >
                          <Text style={styles.savePartialBtnText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelPartialBtn}
                          onPress={() => setActivePartialId(null)}
                        >
                          <Text style={styles.cancelPartialBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Account selector chips */}
                      {accounts.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>
                            {entry.direction === 'given' ? 'Deposit into wallet:' : 'Pay from wallet:'}
                          </Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {accounts.map((acc) => {
                              const isSelected = (selectedPayAccountId || entry.accountId || accounts[0]?.id) === acc.id;
                              return (
                                <TouchableOpacity
                                  key={acc.id}
                                  onPress={() => setSelectedPayAccountId(acc.id)}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: isSelected ? '#059669' : '#e2e8f0',
                                    backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                                    marginRight: 6,
                                  }}
                                >
                                  <BankLogo bankKey={acc.bankKey || acc.id} size="sm" />
                                  <Text style={{ fontSize: 10, fontWeight: '700', marginLeft: 4, color: isSelected ? '#047857' : '#334155' }}>
                                    {acc.name}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.actionBtnsRow}>
                      {!isSettled && (
                        <TouchableOpacity
                          style={styles.recordPayBtn}
                          onPress={() => setActivePartialId(entry.id)}
                        >
                          <Text style={styles.recordPayBtnText}>+ Record Payment</Text>
                        </TouchableOpacity>
                      )}

                      {entry.direction === 'given' && !isSettled && (
                        <TouchableOpacity
                          style={styles.whatsappBtn}
                          onPress={() => handleSendWhatsAppReminder(entry)}
                        >
                          <MessageSquare size={14} color="#047857" />
                          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.cardPdfBtn}
                        onPress={() => exportSingleUdhaarPDFMobile(entry, lang)}
                      >
                        <FileText size={14} color="#b45309" />
                        <Text style={styles.cardPdfBtnText}>PDF</Text>
                      </TouchableOpacity>
                    </View>
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
    backgroundColor: '#d97706',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  allPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  allPdfBtnText: {
    color: '#b45309',
    fontWeight: '700',
    fontSize: 12,
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
  lenaCard: {
    flex: 1,
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  denaCard: {
    flex: 1,
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  cardHeader: {
    marginBottom: 6,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lenaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    textTransform: 'uppercase',
  },
  denaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
    textTransform: 'uppercase',
  },
  lenaAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#78350f',
  },
  denaAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#312e81',
  },
  cardSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  entryCardGiven: {
    borderColor: '#fef3c7',
  },
  entryCardTaken: {
    borderColor: '#e0e7ff',
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  directionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGiven: {
    backgroundColor: '#fef3c7',
  },
  badgeTaken: {
    backgroundColor: '#e0e7ff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextGiven: {
    color: '#b45309',
  },
  badgeTextTaken: {
    color: '#4338ca',
  },
  statusBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  contactPhone: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  amountBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  amountLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  textAmber: {
    color: '#b45309',
  },
  textIndigo: {
    color: '#4338ca',
  },
  subAmountLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subAmountText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#64748b',
    marginBottom: 8,
  },
  dateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  dateMetaText: {
    fontSize: 11,
    color: '#64748b',
  },
  actionsBox: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recordPayBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  recordPayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  whatsappBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  cardPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  cardPdfBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  partialInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partialInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  savePartialBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  savePartialBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
  },
  cancelPartialBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cancelPartialBtnText: {
    color: '#64748b',
    fontSize: 11,
  },
});

