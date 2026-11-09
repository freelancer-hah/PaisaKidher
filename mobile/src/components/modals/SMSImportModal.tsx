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
import { parsePakistaniSMS, ParsedSMSResult } from '../../lib/smsParser';
import { Transaction, Language } from '../../types';
import { X, MessageSquare, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react-native';

interface SMSImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransaction: (tx: Omit<Transaction, 'id'>) => void;
  lang: Language;
}

export const SMSImportModal: React.FC<SMSImportModalProps> = ({
  isOpen,
  onClose,
  onImportTransaction,
  lang,
}) => {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState<ParsedSMSResult | null>(null);

  const SAMPLE_SMS = [
    {
      label: 'JazzCash Sent',
      text: 'Dear Customer, Rs. 2,450.00 has been paid to K-Electric for Bill Payment from your JazzCash Account. Balance: Rs. 8,200. TID: 99482104.',
    },
    {
      label: 'Easypaisa Received',
      text: 'You have received Rs. 15,000.00 from ALI KHAN in your Easypaisa Account. New Balance: Rs. 27,400.00. Trx ID: 29018471.',
    },
    {
      label: 'Meezan Bank Debit',
      text: 'Your Meezan Bank A/C ending 4910 has been debited by PKR 4,500.00 at IMTIAZ SUPER MARKET on 25-OCT. Available Balance PKR 64,000.00.',
    },
  ];

  const handleSelectSample = (sample: string) => {
    setSmsText(sample);
    const result = parsePakistaniSMS(sample);
    setParsed(result);
  };

  const handleTextChange = (val: string) => {
    setSmsText(val);
    const result = parsePakistaniSMS(val);
    setParsed(result);
  };

  const handleConfirm = () => {
    if (parsed) {
      onImportTransaction({
        type: parsed.type,
        amount: parsed.amount,
        category: parsed.category,
        account: parsed.account,
        date: parsed.date,
        note: parsed.note,
        source: 'sms',
        externalRef: parsed.externalRef,
      });
      setSmsText('');
      setParsed(null);
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <MessageSquare size={20} color="#047857" />
              </View>
              <View>
                <Text style={styles.title}>
                  {lang === 'ur' ? 'ایس ایم ایس آٹو کیپچر' : 'Pakistani SMS Auto-Capture'}
                </Text>
                <Text style={styles.subtitle}>
                  {lang === 'ur' ? 'جاز کیش، ایزی پیسہ یا بینک میسج پیسٹ کریں' : 'Simulate on-device SMS parsing'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Privacy Badge */}
            <View style={styles.privacyBadge}>
              <ShieldCheck size={18} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={styles.privacyText}>
                {lang === 'ur'
                  ? 'مکمل پروسیسنگ ڈیوائس پر ہوتی ہے، بینک ایس ایم ایس سرور پر نہیں جاتا۔'
                  : '100% On-device regex parser. Bank SMS is never uploaded to any server.'}
              </Text>
            </View>

            {/* Sample SMS Buttons */}
            <View style={styles.sectionHeader}>
              <Sparkles size={14} color="#d97706" />
              <Text style={styles.sectionTitle}>Select Sample Pakistani SMS:</Text>
            </View>
            <View style={styles.sampleRow}>
              {SAMPLE_SMS.map((sample, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectSample(sample.text)}
                  style={styles.sampleBtn}
                >
                  <Text style={styles.sampleBtnLabel}>{sample.label}</Text>
                  <Text style={styles.sampleBtnPreview} numberOfLines={1}>
                    {sample.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Text Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'اپنا بینک میسج یہاں پیسٹ کریں' : 'Or Paste Bank / Wallet SMS Here:'}
              </Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="Paste SMS here e.g. 'Rs. 4,500 has been debited from Meezan Bank A/C...'"
                value={smsText}
                onChangeText={handleTextChange}
              />
            </View>

            {/* Parsed Result Preview */}
            {parsed && (
              <View style={styles.parsedCard}>
                <View style={styles.parsedHeader}>
                  <View style={styles.parsedHeaderLeft}>
                    <CheckCircle2 size={16} color="#047857" />
                    <Text style={styles.parsedTitle}>Auto Detected Transaction</Text>
                  </View>
                  <View style={styles.senderPill}>
                    <Text style={styles.senderPillText}>{parsed.sender}</Text>
                  </View>
                </View>

                <View style={styles.parsedGrid}>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>Amount / رقم</Text>
                    <Text style={styles.parsedItemValue}>Rs. {parsed.amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>Type / کھاتہ</Text>
                    <Text
                      style={[
                        styles.parsedItemValue,
                        { color: parsed.type === 'income' ? '#059669' : '#e11d48' },
                      ]}
                    >
                      {parsed.type} ({parsed.account})
                    </Text>
                  </View>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>Category</Text>
                    <Text style={styles.parsedItemValue} numberOfLines={1}>
                      {parsed.category}
                    </Text>
                  </View>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>Ref / TID</Text>
                    <Text style={[styles.parsedItemValue, { fontFamily: 'monospace' }]}>
                      {parsed.externalRef}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!parsed}
              onPress={handleConfirm}
              style={[styles.confirmBtn, !parsed && styles.btnDisabled]}
            >
              <Text style={styles.confirmBtnText}>Confirm & Add</Text>
              <ArrowRight size={16} color="#ffffff" style={{ marginLeft: 6 }} />
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
  privacyBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: '#1e40af',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  sampleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sampleBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 8,
  },
  sampleBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 2,
  },
  sampleBtnPreview: {
    fontSize: 9,
    color: '#64748b',
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
  textArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    fontSize: 12,
    color: '#0f172a',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  parsedCard: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 16,
    padding: 12,
  },
  parsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  parsedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  parsedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  senderPill: {
    backgroundColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  senderPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  parsedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  parsedItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  parsedItemLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  parsedItemValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});

