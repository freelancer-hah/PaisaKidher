import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { UdhaarEntry, UdhaarDirection, AccountBalance, Language } from '../../types';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { BankLogo } from '../BankLogo';

interface UdhaarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUdhaar: (
    entry: Omit<UdhaarEntry, 'id' | 'paidAmount' | 'payments' | 'status'>
  ) => void;
  accounts?: AccountBalance[];
  onOpenAddAccountModal?: () => void;
  lang: Language;
}

export const UdhaarModal: React.FC<UdhaarModalProps> = ({
  isOpen,
  onClose,
  onAddUdhaar,
  accounts = [],
  onOpenAddAccountModal,
  lang,
}) => {
  const [direction, setDirection] = useState<UdhaarDirection>('given');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [syncWallet, setSyncWallet] = useState<boolean>(true);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId, isOpen]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!contactName.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const chosenAccount = selectedAccountId || accounts[0]?.id || 'cash';

    onAddUdhaar({
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      direction,
      totalAmount: parsedAmount,
      dueDate: dueDate || undefined,
      createdDate: new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
      accountId: chosenAccount,
      syncWallet,
    });

    setContactName('');
    setContactPhone('');
    setAmount('');
    setDueDate('');
    setNote('');
    setSyncWallet(true);
    onClose();
  };

  const selectedAcc = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {lang === 'ur' ? 'نیا ادھار کھاتہ (Unified Khata)' : 'New Udhaar (Khata) Entry'}
              </Text>
              <Text style={styles.subtitle}>
                {lang === 'ur'
                  ? 'بینک و کیش والیٹ کے ساتھ براہ راست لنک'
                  : 'Live sync with your wallet balance'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Direction Switcher */}
            <View style={styles.directionSwitcher}>
              <TouchableOpacity
                onPress={() => setDirection('given')}
                style={[styles.dirBtn, direction === 'given' && styles.givenActive]}
              >
                <ArrowUpRight
                  size={16}
                  color={direction === 'given' ? '#ffffff' : '#64748b'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.dirBtnText, direction === 'given' && styles.dirBtnTextActive]}>
                  {lang === 'ur' ? 'میں نے دیا (لینا ہے)' : 'Maine Diya (Lena)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDirection('taken')}
                style={[styles.dirBtn, direction === 'taken' && styles.takenActive]}
              >
                <ArrowDownLeft
                  size={16}
                  color={direction === 'taken' ? '#ffffff' : '#64748b'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.dirBtnText, direction === 'taken' && styles.dirBtnTextActive]}>
                  {lang === 'ur' ? 'میں نے لیا (دینا ہے)' : 'Maine Liya (Dena)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Person Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <User size={13} color="#64748b" /> {lang === 'ur' ? 'شخص / پارٹی کا نام' : "Person's Name"}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={lang === 'ur' ? 'مثال: علی خان' : 'e.g. Ali Khan'}
                value={contactName}
                onChangeText={setContactName}
              />
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'رقم درج کریں (روپے)' : 'Amount (PKR)'}
              </Text>
              <TextInput
                style={[styles.textInput, styles.amountInput]}
                placeholder="5000"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Account / Wallet Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <CreditCard size={13} color="#64748b" />{' '}
                {direction === 'given'
                  ? lang === 'ur'
                    ? 'کس اکاؤنٹ سے رقم دی؟ (Paid From)'
                    : 'Paid From (Wallet)'
                  : lang === 'ur'
                  ? 'کس اکاؤنٹ میں رقم آئی؟ (Deposit To)'
                  : 'Deposit To (Wallet)'}
              </Text>
              {accounts.length === 0 ? (
                <Text style={styles.noAccText}>
                  {lang === 'ur'
                    ? 'پہلے کیش یا بینک اکاؤنٹ شامل کریں۔'
                    : 'No accounts available. Defaulting to Cash.'}
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accList}>
                  {accounts.map((acc) => {
                    const isSelected = (selectedAccountId || accounts[0]?.id) === acc.id;
                    return (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setSelectedAccountId(acc.id)}
                        style={[styles.accChip, isSelected && styles.accChipSelected]}
                      >
                        <BankLogo bankKey={acc.bankKey || acc.id} size="sm" />
                        <View style={{ marginLeft: 6 }}>
                          <Text style={[styles.accChipName, isSelected && styles.accChipNameSelected]}>
                            {acc.name}
                          </Text>
                          <Text style={styles.accChipBal}>Rs. {acc.balance.toLocaleString()}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Sync Wallet Toggle */}
            <TouchableOpacity
              onPress={() => setSyncWallet(!syncWallet)}
              style={styles.syncBox}
              activeOpacity={0.8}
            >
              <View style={{ marginRight: 8, marginTop: 2 }}>
                {syncWallet ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : (
                  <Circle size={18} color="#94a3b8" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncTitle}>
                  {lang === 'ur' ? 'والیٹ بیلنس سے لنک کریں' : 'Sync with Wallet Balance'}
                </Text>
                <Text style={styles.syncSubtitle}>
                  {syncWallet
                    ? direction === 'given'
                      ? lang === 'ur'
                        ? `منتخب اکاؤنٹ (${selectedAcc?.name || 'Wallet'}) سے رقم کٹے گی اور خرچ درج ہوگا۔`
                        : `Will deduct from ${selectedAcc?.name || 'Wallet'} and log transaction.`
                      : lang === 'ur'
                      ? `منتخب اکاؤنٹ (${selectedAcc?.name || 'Wallet'}) میں رقم آئے گی اور آمدن درج ہوگی۔`
                      : `Will deposit into ${selectedAcc?.name || 'Wallet'} and log transaction.`
                    : lang === 'ur'
                    ? 'والیٹ کا بیلنس تبدیل نہیں ہوگا (پچھلا ادھار ریکارڈ کرنے کے لیے)۔'
                    : 'Wallet balance will not change (for past debts).'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* WhatsApp Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Phone size={13} color="#64748b" />{' '}
                {lang === 'ur' ? 'واٹس ایپ نمبر (یاد دہانی کے لیے)' : 'WhatsApp Phone'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="03001234567"
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
            </View>

            {/* Due Date & Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Calendar size={13} color="#64748b" /> {lang === 'ur' ? 'واپسی کی تاریخ' : 'Return Due Date'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <FileText size={13} color="#64748b" /> {lang === 'ur' ? 'تفصیل' : 'Description / Reason'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Emergency loan..."
                value={note}
                onChangeText={setNote}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>
                {direction === 'given'
                  ? lang === 'ur'
                    ? 'ادھار دینا درج کریں (لینا ہے)'
                    : 'Save Lend Record (Receivable)'
                  : lang === 'ur'
                  ? 'ادھار لینا درج کریں (دینا ہے)'
                  : 'Save Borrow Record (Payable)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
  },
  body: {
    flexGrow: 1,
  },
  bodyContent: {
    padding: 20,
  },
  directionSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  dirBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  givenActive: {
    backgroundColor: '#f59e0b',
  },
  takenActive: {
    backgroundColor: '#4f46e5',
  },
  dirBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  dirBtnTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  amountInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  accList: {
    flexDirection: 'row',
    marginTop: 2,
  },
  accChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  accChipSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  accChipName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  accChipNameSelected: {
    color: '#b45309',
  },
  accChipBal: {
    fontSize: 9,
    color: '#94a3b8',
  },
  noAccText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  syncBox: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  syncTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  syncSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
