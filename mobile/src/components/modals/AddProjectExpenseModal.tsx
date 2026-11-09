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
import {
  ProjectEntry,
  ProjectExpenseItem,
  AccountBalance,
  Language,
} from '../../types';
import { PROJECT_SUBCATEGORIES } from '../../lib/storage';
import { BankLogo } from '../BankLogo';
import {
  X,
  Building2,
  Tag,
  CreditCard,
  UserCheck,
  Calendar,
  FileText,
} from 'lucide-react-native';

interface AddProjectExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectEntry[];
  accounts: AccountBalance[];
  initialProjectId?: string;
  onAddExpense: (
    expense: Omit<ProjectExpenseItem, 'id' | 'linkedTransactionId'>
  ) => void;
  onOpenAddAccountModal?: () => void;
  lang: Language;
}

export const AddProjectExpenseModal: React.FC<AddProjectExpenseModalProps> = ({
  isOpen,
  onClose,
  projects,
  accounts,
  initialProjectId,
  onAddExpense,
  onOpenAddAccountModal,
  lang,
}) => {
  const [projectId, setProjectId] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [customSubCategory, setCustomSubCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [vendorOrPerson, setVendorOrPerson] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (initialProjectId) {
      setProjectId(initialProjectId);
    } else if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [initialProjectId, projects, projectId, isOpen]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId, isOpen]);

  const activeProject = projects.find((p) => p.id === projectId) || projects[0];

  useEffect(() => {
    if (activeProject) {
      const presets = PROJECT_SUBCATEGORIES[activeProject.type] || [];
      if (presets.length > 0) {
        setSubCategory(presets[0]);
      }
    }
  }, [activeProject?.id, activeProject?.type]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const finalSubCat =
      subCategory === 'custom'
        ? customSubCategory.trim() || (lang === 'ur' ? 'دیگر خرچ' : 'Other Expense')
        : subCategory;

    const chosenAccount = accountId || accounts[0]?.id || 'cash';

    onAddExpense({
      projectId: activeProject?.id || projectId,
      subCategory: finalSubCat,
      amount: parsedAmount,
      accountId: chosenAccount,
      vendorOrPerson: vendorOrPerson.trim() || undefined,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
    });

    setAmount('');
    setCustomSubCategory('');
    setVendorOrPerson('');
    setNote('');
    onClose();
  };

  const presetSubCategories = activeProject
    ? PROJECT_SUBCATEGORIES[activeProject.type] || []
    : [];

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {lang === 'ur' ? 'پراجیکٹ خرچہ درج کریں' : 'Add Project Expense'}
              </Text>
              <Text style={styles.subtitle}>
                {activeProject ? activeProject.title : 'Itemized Project Sub-Ledger'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Project Picker if multiple */}
            {projects.length > 1 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {lang === 'ur' ? 'پراجیکٹ منتخب کریں' : 'Select Project'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {projects.map((p) => {
                    const isSelected = p.id === (activeProject?.id || projectId);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setProjectId(p.id)}
                        style={[styles.projChip, isSelected && styles.projChipSelected]}
                      >
                        <Text style={[styles.projChipText, isSelected && styles.projChipTextSelected]}>
                          {p.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Sub-Category Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Tag size={13} color="#64748b" />{' '}
                {lang === 'ur' ? 'اخراجات کی مد / کیٹیگری' : 'Expense Category / Mad'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {presetSubCategories.map((sub, idx) => {
                  const isSelected = subCategory === sub;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSubCategory(sub)}
                      style={[styles.subCatChip, isSelected && styles.subCatChipSelected]}
                    >
                      <Text style={[styles.subCatChipText, isSelected && styles.subCatChipTextSelected]}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() => setSubCategory('custom')}
                  style={[styles.subCatChip, subCategory === 'custom' && styles.subCatChipSelected]}
                >
                  <Text style={[styles.subCatChipText, subCategory === 'custom' && styles.subCatChipTextSelected]}>
                    + {lang === 'ur' ? 'دیگر مد' : 'Custom'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {subCategory === 'custom' && (
                <TextInput
                  style={[styles.textInput, { marginTop: 8 }]}
                  placeholder={
                    lang === 'ur'
                      ? 'کیٹیگری کا نام لکھیں مثلاً بورنگ، گلاس کا کام...'
                      : 'Enter category name (e.g. Glass Work, Water Boring)'
                  }
                  value={customSubCategory}
                  onChangeText={setCustomSubCategory}
                />
              )}
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'رقم درج کریں (PKR / روپے)' : 'Amount (PKR)'}
              </Text>
              <TextInput
                style={[styles.textInput, styles.amountInput]}
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Vendor / Person */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <UserCheck size={13} color="#64748b" />{' '}
                {lang === 'ur' ? 'کس کو ادا کیا؟ (مستری، دکاندار، کیٹرنگ)' : 'Paid To (Vendor / Person)'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  lang === 'ur'
                    ? 'مثلاً مستری اسلم، چناب ہارڈویئر...'
                    : 'e.g. Mistri Aslam, Chenab Hardware'
                }
                value={vendorOrPerson}
                onChangeText={setVendorOrPerson}
              />
            </View>

            {/* Wallet / Account Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <CreditCard size={13} color="#64748b" />{' '}
                {lang === 'ur' ? 'کس اکاؤنٹ سے ادا کیا؟' : 'Paid From Account'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {accounts.map((acc) => {
                  const isSelected = (accountId || accounts[0]?.id) === acc.id;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setAccountId(acc.id)}
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
            </View>

            {/* Date & Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Calendar size={13} color="#64748b" /> {lang === 'ur' ? 'تاریخ' : 'Date'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <FileText size={13} color="#64748b" /> {lang === 'ur' ? 'بل نمبر / نوٹ' : 'Bill No / Note'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Bill # 104..."
                value={note}
                onChangeText={setNote}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>
                {lang === 'ur' ? 'خرچہ محفوظ کریں' : 'Save Project Expense'}
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
  projChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  projChipSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  projChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  projChipTextSelected: {
    color: '#047857',
    fontWeight: '800',
  },
  subCatChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  subCatChipSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  subCatChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  subCatChipTextSelected: {
    color: '#047857',
    fontWeight: '800',
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
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  accChipName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  accChipNameSelected: {
    color: '#047857',
  },
  accChipBal: {
    fontSize: 9,
    color: '#94a3b8',
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#059669',
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

