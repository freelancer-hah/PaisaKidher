import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { parseVoiceInput, ParsedVoiceResult } from '../../lib/voiceParser';
import { Language } from '../../types';
import { Mic, MicOff, X, Sparkles, Check, ArrowRight, Edit3 } from 'lucide-react-native';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmVoiceEntry: (parsed: ParsedVoiceResult) => void;
  lang: Language;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onConfirmVoiceEntry,
  lang,
}) => {
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);
  const inputRef = useRef<any>(null);

  const SAMPLE_VOICE_PROMPTS = [
    '800 ka petrol dalwaya cash pe',
    'Ali ko 5000 udhaar diya',
    'Hamza se 3000 udhaar liya',
    'Salary 85000 aayi Meezan bank mein',
    'Bijli ka bill 6500 JazzCash se diya',
    'Chai aur lunch 950 kharch hua',
    'پانچ سو روپے کا پٹرول ڈلوایا',
    'عمر کو تین ہزار ادھار دیے',
  ];

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setParsedResult(null);
    }
  }, [isOpen]);

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText);
    const parsed = parseVoiceInput(sampleText);
    setParsedResult(parsed);
  };

  const handleTextChange = (text: string) => {
    setTranscript(text);
    if (text.trim()) {
      const parsed = parseVoiceInput(text);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  };

  const handleFocusMic = () => {
    inputRef.current?.focus();
  };

  const handleSave = () => {
    if (parsedResult) {
      onConfirmVoiceEntry(parsedResult);
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
                <Mic size={20} color="#047857" />
              </View>
              <View>
                <Text style={styles.title}>
                  {lang === 'ur' ? 'آواز سے فوری اندراج' : 'Voice Entry (Urdu / Roman Urdu)'}
                </Text>
                <Text style={styles.subtitle}>
                  {lang === 'ur'
                    ? 'کی بورڈ مائیک سے بولیں یا فوری مثال منتخب کریں'
                    : 'Speak via keyboard mic or tap an instant phrase'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Mic Hero & Instruction */}
            <View style={styles.micContainer}>
              <TouchableOpacity onPress={handleFocusMic} style={styles.micBtn}>
                <Mic size={34} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.micStatus}>
                {lang === 'ur'
                  ? 'مائیک دبائیں اور بولیں یا کی بورڈ مائیک استعمال کریں'
                  : 'Tap below and use keyboard mic to speak naturally'}
              </Text>
            </View>

            {/* Editable Voice Input Box */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputHeader}>
                <Edit3 size={13} color="#64748b" />
                <Text style={styles.inputLabel}>
                  {lang === 'ur' ? 'سنا گیا کلام (Voice / Text):' : 'Spoken or Typed Text:'}
                </Text>
              </View>
              <TextInput
                ref={inputRef}
                value={transcript}
                onChangeText={handleTextChange}
                placeholder={
                  lang === 'ur'
                    ? 'مثلاً: 500 کا پٹرول ڈلوایا کیش سے...'
                    : 'e.g. 800 ka petrol dalwaya cash pe...'
                }
                placeholderTextColor="#94a3b8"
                style={styles.textInput}
                multiline
              />
            </View>

            {/* Parsed Result Preview */}
            {parsedResult && (
              <View style={styles.parsedCard}>
                <View style={styles.parsedHeader}>
                  <View style={styles.parsedHeaderLeft}>
                    <Check size={14} color="#047857" />
                    <Text style={styles.parsedTitle}>
                      {lang === 'ur' ? 'خودکار حساب و درجہ بندی' : 'Smart Parsed Entry'}
                    </Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {parsedResult.type === 'udhaar' ? 'UDHAAR' : parsedResult.type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.parsedGrid}>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>Amount / رقم</Text>
                    <Text style={styles.parsedItemValue}>
                      Rs. {parsedResult.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>Category / کیٹیگری</Text>
                    <Text style={styles.parsedItemValue} numberOfLines={1}>
                      {parsedResult.category}
                    </Text>
                  </View>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>Account / کھاتہ</Text>
                    <Text style={[styles.parsedItemValue, { textTransform: 'uppercase' }]}>
                      {parsedResult.account}
                    </Text>
                  </View>
                  <View style={styles.parsedItem}>
                    <Text style={styles.parsedItemLabel}>
                      {parsedResult.type === 'udhaar' ? 'Person' : 'Note'}
                    </Text>
                    <Text style={styles.parsedItemValue} numberOfLines={1}>
                      {parsedResult.type === 'udhaar'
                        ? `${parsedResult.contactName} (${parsedResult.udhaarDirection === 'given' ? 'Lena hai' : 'Dena hai'})`
                        : parsedResult.note}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Sample Voice Prompts */}
            <View style={styles.sectionHeader}>
              <Sparkles size={14} color="#d97706" />
              <Text style={styles.sectionTitle}>
                {lang === 'ur' ? 'تیز رفتار پاکستانی مثالیں (Click to Test):' : 'Instant Voice Prompts:'}
              </Text>
            </View>
            <View style={styles.promptsContainer}>
              {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectSample(prompt)}
                  style={styles.promptChip}
                >
                  <Text style={styles.promptChipText}>&ldquo;{prompt}&rdquo;</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>{lang === 'ur' ? 'منسوخ کریں' : 'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!parsedResult || parsedResult.amount <= 0}
              onPress={handleSave}
              style={[
                styles.confirmBtn,
                (!parsedResult || parsedResult.amount <= 0) && styles.btnDisabled,
              ]}
            >
              <Text style={styles.confirmBtnText}>
                {lang === 'ur' ? 'محفوظ کریں' : 'Confirm & Save'}
              </Text>
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
    fontSize: 15,
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
  },
  body: {
    maxHeight: 460,
  },
  bodyContent: {
    padding: 18,
    gap: 14,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  micBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    minHeight: 52,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  promptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  promptChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  promptChipText: {
    fontSize: 11,
    color: '#334155',
  },
  parsedCard: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    borderRadius: 18,
    padding: 12,
  },
  parsedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#d1fae5',
  },
  parsedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  parsedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065f46',
  },
  typeBadge: {
    backgroundColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065f46',
  },
  parsedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  parsedItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  parsedItemLabel: {
    fontSize: 9,
    fontWeight: '700',
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
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
