import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { parseVoiceInput, ParsedVoiceResult } from '../../lib/voiceParser';
import { Language } from '../../types';
import { Mic, MicOff, X, Sparkles, Check, ArrowRight } from 'lucide-react-native';

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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);

  const SAMPLE_VOICE_PROMPTS = [
    '800 ka petrol dalwaya cash pe',
    'Ali ko 5000 udhaar diya',
    'Hamza se 3000 udhaar liya',
    'Salary 85000 aayi Meezan bank mein',
    'Bijli ka bill 6500 JazzCash se diya',
    'Chai aur lunch 950 kharch hua',
  ];

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setParsedResult(null);
    }
  }, [isOpen]);

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText);
    const parsed = parseVoiceInput(sampleText);
    setParsedResult(parsed);
  };

  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate listening and picking random sample if no speech recognition engine hooked up yet
      setTimeout(() => {
        const randomSample = SAMPLE_VOICE_PROMPTS[Math.floor(Math.random() * SAMPLE_VOICE_PROMPTS.length)];
        handleSelectSample(randomSample);
        setIsListening(false);
      }, 2000);
    }
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
                  {lang === 'ur' ? 'آواز سے انٹری کریں' : 'Voice Entry (Urdu / Roman Urdu)'}
                </Text>
                <Text style={styles.subtitle}>
                  {lang === 'ur' ? 'مائیک دبائیں یا مثال پر کلک کریں' : 'Speak or tap an instant voice prompt'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Mic Circle */}
            <View style={styles.micContainer}>
              <TouchableOpacity
                onPress={handleToggleMic}
                style={[styles.micBtn, isListening ? styles.micBtnActive : styles.micBtnIdle]}
              >
                {isListening ? <MicOff size={32} color="#ffffff" /> : <Mic size={32} color="#ffffff" />}
              </TouchableOpacity>
              <Text style={styles.micStatus}>
                {isListening
                  ? lang === 'ur' ? 'سن رہا ہے... بولیں' : 'Listening... Speak now'
                  : lang === 'ur' ? 'مائیک پر کلک کریں' : 'Tap microphone to speak'}
              </Text>
            </View>

            {/* Sample Prompts */}
            <View style={styles.sectionHeader}>
              <Sparkles size={14} color="#d97706" />
              <Text style={styles.sectionTitle}>
                {lang === 'ur' ? 'تیز رفتار مثالیں (Click to Test):' : 'Instant Pakistani Voice Prompts:'}
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

            {/* Parsed Result Preview */}
            {parsedResult && (
              <View style={styles.parsedCard}>
                <View style={styles.parsedHeader}>
                  <View style={styles.parsedHeaderLeft}>
                    <Check size={14} color="#047857" />
                    <Text style={styles.parsedTitle}>
                      {lang === 'ur' ? 'سمجھا گیا اندراج' : 'AI Parsed Entry'}
                    </Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {parsedResult.type === 'udhaar' ? 'Udhaar Ledger' : parsedResult.type.toUpperCase()}
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
  micContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    marginBottom: 16,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  micBtnIdle: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  micBtnActive: {
    backgroundColor: '#f43f5e',
    shadowColor: '#f43f5e',
  },
  micStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
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
  promptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  promptChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  promptChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
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
  typeBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
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

