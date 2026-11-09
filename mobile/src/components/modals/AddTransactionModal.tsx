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
import { Transaction, TransactionType, AccountBalance, Language } from '../../types';
import { CATEGORIES } from '../../lib/storage';
import { BankLogo } from '../BankLogo';
import { X, ArrowDownLeft, ArrowUpRight, Tag, CreditCard, Calendar, FileText, Plus } from 'lucide-react-native';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  accounts: AccountBalance[];
  onOpenAddAccountModal: () => void;
  lang: Language;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  accounts = [],
  onOpenAddAccountModal,
  lang,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [account, setAccount] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (accounts.length > 0) {
      if (!account || !accounts.some((a) => a.id === account)) {
        setAccount(accounts[0].id);
      }
    } else {
      setAccount('');
    }
  }, [accounts, isOpen]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      type,
      amount: parsedAmount,
      category,
      account: account || (accounts[0]?.id || 'cash'),
      date,
      note: note.trim() || (type === 'expense' ? 'Kharch' : 'Aamdan'),
      source: 'manual',
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {lang === 'ur' ? 'نیا اندراج کریں' : 'Add New Transaction'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Type Switcher */}
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                onPress={() => setType('expense')}
                style={[styles.typeBtn, type === 'expense' && styles.expenseActive]}
              >
                <ArrowDownLeft
                  size={16}
                  color={type === 'expense' ? '#ffffff' : '#64748b'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                  {lang === 'ur' ? 'خرچہ (Expense)' : 'Expense'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('income')}
                style={[styles.typeBtn, type === 'income' && styles.incomeActive]}
              >
                <ArrowUpRight
                  size={16}
                  color={type === 'income' ? '#ffffff' : '#64748b'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                  {lang === 'ur' ? 'آمدن (Income)' : 'Income'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'رقم درج کریں (روپے)' : 'Amount (PKR)'}
              </Text>
              <View style={styles.amountInputWrap}>
                <Text style={styles.amountPrefix}>Rs.</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Tag size={13} color="#64748b" /> {lang === 'ur' ? 'کیٹیگری منتخب کریں' : 'Category'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.name)}
                      style={[styles.catChip, isSelected && styles.catChipActive]}
                    >
                      <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Account / Wallet Selector */}
            <View style={styles.inputGroup}>
              <View style={styles.accountLabelRow}>
                <Text style={styles.inputLabel}>
                  <CreditCard size={13} color="#64748b" /> {lang === 'ur' ? 'کھاتہ / والیٹ' : 'Paid From / Received To'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenAddAccountModal();
                  }}
                  style={styles.addAccountLink}
                >
                  <Plus size={12} color="#059669" />
                  <Text style={styles.addAccountLinkText}>
                    {lang === 'ur' ? 'نیا اکاؤنٹ' : 'Add Bank'}
                  </Text>
                </TouchableOpacity>
              </View>

              {accounts.length === 0 ? (
                <View style={styles.noAccountBox}>
                  <Text style={styles.noAccountText}>
                    {lang === 'ur'
                      ? 'کوئی اکاؤنٹ موجود نہیں ہے۔ پہلے اکاؤنٹ شامل کریں۔'
                      : 'No accounts added yet. Please add a bank or wallet.'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onOpenAddAccountModal();
                    }}
                    style={styles.noAccountBtn}
                  >
                    <Text style={styles.noAccountBtnText}>+ Add Account</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.accountGrid}>
                  {accounts.map((acc) => {
                    const isSelected = account === acc.id;
                    return (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setAccount(acc.id)}
                        style={[styles.accountChip, isSelected && styles.accountChipActive]}
                      >
                        <BankLogo bankKey={acc.bankKey || acc.id} size="sm" />
                        <Text style={styles.accountChipName} numberOfLines={1}>
                          {acc.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Note & Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <FileText size={13} color="#64748b" /> {lang === 'ur' ? 'تفصیل / نوٹ (اختیاری)' : 'Note / Description'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={lang === 'ur' ? 'مثال: پیٹرول، راشن' : 'e.g., Petrol, Groceries'}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, type === 'income' ? styles.submitBtnIncome : styles.submitBtnExpense]}
            >
              <Text style={styles.submitBtnText}>
                {type === 'expense'
                  ? lang === 'ur' ? 'خرچہ شامل کریں' : 'Record Expense'
                  : lang === 'ur' ? 'آمدن شامل کریں' : 'Record Income'}
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
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
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
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  expenseActive: {
    backgroundColor: '#f43f5e',
  },
  incomeActive: {
    backgroundColor: '#059669',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  typeBtnTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  amountInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  amountPrefix: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#94a3b8',
  },
  amountInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingLeft: 46,
    paddingRight: 16,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#047857',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  accountLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addAccountLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAccountLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 3,
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    width: '48%',
  },
  accountChipActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  accountChipName: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  noAccountBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#fcd34d',
    backgroundColor: '#fefce8',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 11,
    color: '#854d0e',
    textAlign: 'center',
    marginBottom: 8,
  },
  noAccountBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  noAccountBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnExpense: {
    backgroundColor: '#f43f5e',
    shadowColor: '#f43f5e',
  },
  submitBtnIncome: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

