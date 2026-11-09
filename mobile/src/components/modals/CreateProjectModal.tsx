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
import { ProjectEntry, ProjectType, Language } from '../../types';
import { PROJECT_TYPES_LIST } from '../../lib/storage';
import {
  X,
  Building2,
  HeartHandshake,
  Paintbrush,
  Activity,
  Briefcase,
  FolderKanban,
  Calendar,
  FileText,
} from 'lucide-react-native';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (
    project: Omit<ProjectEntry, 'id' | 'totalSpent' | 'status'>
  ) => void;
  lang: Language;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  lang,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ProjectType>('construction');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;

    onCreateProject({
      title: title.trim(),
      type,
      startDate: startDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setType('construction');
    setNotes('');
    onClose();
  };

  const getIcon = (typeKey: ProjectType, isSelected: boolean) => {
    const color = isSelected ? '#047857' : '#64748b';
    switch (typeKey) {
      case 'construction':
        return <Building2 size={16} color={color} />;
      case 'wedding':
        return <HeartHandshake size={16} color={color} />;
      case 'renovation':
        return <Paintbrush size={16} color={color} />;
      case 'medical':
        return <Activity size={16} color={color} />;
      case 'business':
        return <Briefcase size={16} color={color} />;
      default:
        return <FolderKanban size={16} color={color} />;
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {lang === 'ur' ? 'نیا پراجیکٹ بنائیں' : 'Create Special Project'}
              </Text>
              <Text style={styles.subtitle}>
                {lang === 'ur'
                  ? 'مکان تعمیر، شادی یا خاص ایونٹ کا الگ کھاتہ'
                  : 'Independent sub-ledger with custom itemized categories'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'پراجیکٹ کا نام / عنوان' : 'Project Title / Name'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  lang === 'ur'
                    ? 'مثلاً مکان تعمیر G-11، حمزہ کی شادی...'
                    : 'e.g. Dream House Construction, Hamza Wedding'
                }
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Type Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'ur' ? 'نوعیت منتخب کریں' : 'Select Project Type'}
              </Text>
              <View style={styles.typesGrid}>
                {PROJECT_TYPES_LIST.map((p) => {
                  const isSelected = type === p.type;
                  return (
                    <TouchableOpacity
                      key={p.type}
                      onPress={() => setType(p.type)}
                      style={[styles.typeBtn, isSelected && styles.typeBtnSelected]}
                    >
                      {getIcon(p.type, isSelected)}
                      <Text
                        style={[styles.typeBtnText, isSelected && styles.typeBtnTextSelected]}
                        numberOfLines={1}
                      >
                        {lang === 'ur' ? p.labelUrdu : p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Calendar size={13} color="#64748b" /> {lang === 'ur' ? 'شروع کرنے کی تاریخ' : 'Start Date'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <FileText size={13} color="#64748b" />{' '}
                {lang === 'ur' ? 'تفصیل / نوٹ (اختیاری)' : 'Description / Notes (Optional)'}
              </Text>
              <TextInput
                style={[styles.textInput, { height: 60 }]}
                placeholder={
                  lang === 'ur'
                    ? 'کوئی خاص تفصیل، پلاٹ نمبر، یا مقام...'
                    : 'Any location, contractor details, or notes...'
                }
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                💡 {lang === 'ur'
                  ? 'اس پراجیکٹ کا خرچ آپ کے منتخب والٹ سے براہ راست کم ہوگا اور علیحدہ پی ڈی ایف رپورٹ بھی بن سکے گی۔'
                  : 'All project expenses will deduct from your chosen wallet and can be exported as an independent PDF report.'}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>
                {lang === 'ur' ? 'پراجیکٹ کھاتہ شروع کریں' : 'Create Project'}
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
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    width: '48%',
    gap: 6,
  },
  typeBtnSelected: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  typeBtnTextSelected: {
    color: '#065f46',
    fontWeight: '800',
  },
  tipBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
  },
  tipText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
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

