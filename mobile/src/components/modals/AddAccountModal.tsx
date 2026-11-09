import React, { useState } from 'react';
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
import { AccountBalance, Language } from '../../types';
import { PAKISTANI_BANKS_PRESETS, getBankPreset } from '../../lib/bankPresets';
import { BankLogo } from '../BankLogo';
import { X, Building2, Check, CreditCard, Hash } from 'lucide-react-native';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (acc: AccountBalance) => void;
  lang: Language;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  lang,
}) => {
  const [selectedBankKey, setSelectedBankKey] = useState<string>('meezan');
  const [customName, setCustomName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [filterCategory, setFilterCategory] = useState<'all' | 'bank' | 'wallet' | 'cash'>('all');

  const currentPreset = getBankPreset(selectedBankKey);

  const filteredBanks = PAKISTANI_BANKS_PRESETS.filter((p) => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  const handleSubmit = () => {
    const finalName = customName.trim() || currentPreset.name;
    const finalNameUrdu = currentPreset.nameUrdu;
    const parsedBalance = parseFloat(initialBalance) || 0;

    const newAccount: AccountBalance = {
      id: `acc-${Date.now()}-${selectedBankKey}`,
      bankKey: selectedBankKey,
      name: finalName,
      nameUrdu: finalNameUrdu,
      accountNumber: accountNumber.trim(),
      balance: parsedBalance,
      color: currentPreset.bgColor,
      icon: 'Building2',
    };

    onAddAccount(newAccount);

    setCustomName('');
    setAccountNumber('');
    setInitialBalance('0');
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Building2 size={20} color="#047857" />
              </View>
              <View>
                <Text style={styles.title}>
                  {lang === 'ur' ? 'نیا بینک اکاؤنٹ شامل کریں' : 'Add Bank or Wallet'}
                </Text>
                <Text style={styles.subtitle}>
                  {lang === 'ur'
                    ? 'بینک، سادہ پے، جیز کیش یا نقد رقم'
                    : 'Manage banks, digital wallets or cash'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Category Filter Pills */}
            <Text style={styles.sectionLabel}>
              {lang === 'ur' ? 'بینک یا سروس منتخب کریں' : 'Select Bank / FinTech'}
            </Text>
            <View style={styles.pillsRow}>
              {(['all', 'bank', 'wallet', 'cash'] as const).map((cat) => {
                const isSelected = filterCategory === cat;
                const label =
                  cat === 'all'
                    ? lang === 'ur' ? 'سب' : 'All'
                    : cat === 'bank'
                    ? lang === 'ur' ? 'بینک' : 'Banks'
                    : cat === 'wallet'
                    ? lang === 'ur' ? 'والیٹس' : 'Wallets'
                    : lang === 'ur' ? 'نقد رقم' : 'Cash';

                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFilterCategory(cat)}
                    style={[styles.pill, isSelected && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bank Grid */}
            <View style={styles.bankGrid}>
              {filteredBanks.map((bank) => {
                const isSelected = selectedBankKey === bank.id;
                return (
                  <TouchableOpacity
                    key={bank.id}
                    onPress={() => {
                      setSelectedBankKey(bank.id);
                      if (!customName || customName === currentPreset.name) {
                        setCustomName(bank.name);
                      }
                    }}
                    style={[styles.bankItem, isSelected && styles.bankItemActive]}
                  >
                    <BankLogo bankKey={bank.id} size="sm" />
                    <View style={styles.bankItemTexts}>
                      <Text style={styles.bankShortCode} numberOfLines={1}>
                        {bank.shortCode}
                      </Text>
                      <Text style={styles.bankNameUrdu} numberOfLines={1}>
                        {bank.nameUrdu}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Check size={10} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Account Title Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <CreditCard size={13} color="#64748b" /> {lang === 'ur' ? 'اکاؤنٹ کا نام / ٹائٹل' : 'Account Title / Nickname'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={currentPreset.name}
                value={customName}
                onChangeText={setCustomName}
              />
            </View>

            {/* Last 4 Digits & Balance */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>
                  <Hash size={13} color="#64748b" /> {lang === 'ur' ? 'آخری ہندسے (اختیاری)' : 'Last 4 Digits'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9842"
                  keyboardType="numeric"
                  maxLength={4}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.inputLabel}>
                  {lang === 'ur' ? 'ابتدائی بیلنس (روپے)' : 'Starting Balance (PKR)'}
                </Text>
                <View style={styles.currencyInputWrap}>
                  <Text style={styles.currencyPrefix}>Rs.</Text>
                  <TextInput
                    style={[styles.textInput, styles.currencyInput]}
                    placeholder="0"
                    keyboardType="numeric"
                    value={initialBalance}
                    onChangeText={setInitialBalance}
                  />
                </View>
              </View>
            </View>

            {/* Live Preview Card */}
            <View style={styles.previewCard}>
              <View style={styles.previewLeft}>
                <BankLogo bankKey={selectedBankKey} size="md" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.previewName}>{customName || currentPreset.name}</Text>
                  <Text style={styles.previewSub}>
                    {accountNumber ? `•••• ${accountNumber}` : currentPreset.nameUrdu}
                  </Text>
                </View>
              </View>
              <View style={styles.previewRight}>
                <Text style={styles.previewBalance}>
                  Rs. {(parseFloat(initialBalance) || 0).toLocaleString()}
                </Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
              <Building2 size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>
                {lang === 'ur' ? 'اکاؤنٹ محفوظ کریں' : 'Save Account'}
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
    maxHeight: '88%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  pillActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#047857',
    fontWeight: '700',
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bankItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  bankItemActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  bankItemTexts: {
    marginLeft: 8,
    flex: 1,
  },
  bankShortCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  bankNameUrdu: {
    fontSize: 9,
    color: '#64748b',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  currencyInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
    fontWeight: '700',
    fontSize: 12,
    color: '#94a3b8',
  },
  currencyInput: {
    paddingLeft: 34,
    fontWeight: '800',
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  previewSub: {
    fontSize: 10,
    color: '#64748b',
  },
  previewRight: {
    alignItems: 'flex-end',
  },
  previewBalance: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  activePill: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#047857',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

