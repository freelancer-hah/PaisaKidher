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
import { KametiEntry, Language } from '../../types';
import { X, Users } from 'lucide-react-native';

interface KametiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKameti: (entry: Omit<KametiEntry, 'id' | 'paidMonthsCount' | 'isPayoutReceived' | 'status'>) => void;
  lang: Language;
}

export const KametiModal: React.FC<KametiModalProps> = ({
  isOpen,
  onClose,
  onAddKameti,
  lang,
}) => {
  const [title, setTitle] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [totalMembers, setTotalMembers] = useState('10');
  const [myTurnMonth, setMyTurnMonth] = useState('5');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const parsedAmount = parseFloat(monthlyAmount);
    const parsedMembers = parseInt(totalMembers, 10);
    const parsedTurn = parseInt(myTurnMonth, 10);

    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddKameti({
      title: title.trim(),
      monthlyAmount: parsedAmount,
      totalMembers: parsedMembers || 10,
      currentMonth: 1,
      myTurnMonth: parsedTurn || 1,
      startDate,
      notes: notes.trim(),
    });

    setTitle('');
    setMonthlyAmount('');
    onClose();
  };

  const pool = (parseFloat(monthlyAmount) || 0) * (parseInt(totalMembers, 10) || 0);

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Users size={20} color="#7e22ce" />
              </View>
              <View>
                <Text style={styles.title}>
                  {lang === 'ur' ? 'نئی کمیٹی / بی سی بنائیں' : 'Create New Kameti (BC)'}
                </Text>
                <Text style={styles.subtitle}>
                  {lang === 'ur' ? 'ماہانہ قسط اور اپنی باری کا ریکارڈ رکھیں' : 'Track monthly installment and payout turn'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'کمیٹی کا نام' : 'Kameti Title'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Mohalla Kameti, Office Friends BC"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>
                  {lang === 'ur' ? 'ماہانہ رقم' : 'Monthly (PKR)'}
                </Text>
                <TextInput
                  style={[styles.textInput, { fontWeight: '800' }]}
                  placeholder="10000"
                  keyboardType="numeric"
                  value={monthlyAmount}
                  onChangeText={setMonthlyAmount}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>
                  {lang === 'ur' ? 'کل ممبران' : 'Total Members'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10"
                  keyboardType="numeric"
                  value={totalMembers}
                  onChangeText={setTotalMembers}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>
                  {lang === 'ur' ? 'میری باری کا مہینہ' : 'My Payout Month'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 5"
                  keyboardType="numeric"
                  value={myTurnMonth}
                  onChangeText={setMyTurnMonth}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>
                  {lang === 'ur' ? 'شروع ہونے کی تاریخ' : 'Start Date'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
            </View>

            {/* Calculated Pool Preview */}
            <View style={styles.poolCard}>
              <Text style={styles.poolLabel}>
                {lang === 'ur' ? 'کل وصولی پول (Payout Pool):' : 'Total Payout Pool:'}
              </Text>
              <Text style={styles.poolValue}>Rs. {pool.toLocaleString()}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'اضافی نوٹس' : 'Notes (Optional)'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Organizer Asif Bhai, payment on 5th"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>
                {lang === 'ur' ? 'کمیٹی محفوظ کریں' : 'Save Kameti'}
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
    backgroundColor: '#faf5ff',
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
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
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
  rowInputs: {
    flexDirection: 'row',
  },
  poolCard: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  poolLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b21a8',
  },
  poolValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7e22ce',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  submitBtn: {
    backgroundColor: '#9333ea',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

