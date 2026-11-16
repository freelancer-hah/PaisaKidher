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
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  Tag,
  Building2,
  Calendar,
  FileText,
  Key,
  Sparkles,
  RefreshCw,
  Wallet,
} from 'lucide-react-native';

import { AccountBalance, Language, Transaction } from '../../types';
import { CATEGORIES } from '../../lib/storage';
import { BankLogo } from '../BankLogo';
import {
  getStoredGeminiKey,
  saveStoredGeminiKey,
  parseReceiptWithGemini,
} from '../../lib/receiptParser';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountBalance[];
  lang: Language;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onOpenAddAccountModal: () => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  accounts = [],
  lang,
  onAddTransaction,
  onOpenAddAccountModal,
}) => {
  // Image & Loading State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Extracted Fields
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');

  // Load saved API key on mount/open
  useEffect(() => {
    if (isOpen) {
      getStoredGeminiKey().then((key) => {
        setApiKey(key);
        if (!key) {
          setShowKeyInput(true);
        }
      });
      // Set default account
      if (accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accounts[0].id);
      }
    } else {
      // Reset state on close
      resetForm();
    }
  }, [isOpen, accounts]);

  const resetForm = () => {
    setImageUri(null);
    setImageBase64(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setAmount('');
    setMerchant('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(CATEGORIES[0].name);
  };

  const handleSaveApiKey = async (newKey: string) => {
    setApiKey(newKey);
    await saveStoredGeminiKey(newKey);
  };

  const processImage = async (uri: string, base64: string | undefined) => {
    setImageUri(uri);
    setImageBase64(base64 || null);
    setAnalysisError(null);

    if (!base64) {
      setAnalysisError(lang === 'ur' ? 'تصویر کا ڈیٹا درست نہیں ہے۔' : 'Could not read image data.');
      return;
    }

    const currentKey = apiKey.trim();
    if (!currentKey) {
      setShowKeyInput(true);
      setAnalysisError(
        lang === 'ur'
          ? 'آٹو اسکین کے لیے نیچے Google Gemini API Key درج کریں۔ آپ رقم دستی بھی لکھ سکتے ہیں۔'
          : 'Please enter a Google Gemini API Key below for AI auto-scan, or review details manually.'
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await parseReceiptWithGemini(base64, currentKey);
      if (result.amount > 0) {
        setAmount(result.amount.toString());
      }
      if (result.merchant) {
        setMerchant(result.merchant);
      }
      if (result.category) {
        const matched = CATEGORIES.find(
          (c) => c.name.toLowerCase().includes(result.category.toLowerCase()) || c.id === result.category.toLowerCase()
        );
        if (matched) {
          setCategory(matched.name);
        }
      }
      if (result.date) {
        setDate(result.date);
      }
      if (result.description) {
        setDescription(result.description);
      }
    } catch (err: any) {
      console.warn('AI Receipt parse failed:', err);
      setAnalysisError(err.message || 'Could not parse receipt automatically. You can enter details below.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          lang === 'ur' ? 'اجازت درکار ہے' : 'Permission Required',
          lang === 'ur'
            ? 'رسید کی تصویر لینے کے لیے کیمرہ کی اجازت درکار ہے۔'
            : 'Camera permission is required to capture receipts.'
        );
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        await processImage(asset.uri, asset.base64 || undefined);
      }
    } catch (err) {
      console.error('Camera launch error:', err);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          lang === 'ur' ? 'اجازت درکار ہے' : 'Permission Required',
          lang === 'ur'
            ? 'رسید منتخب کرنے کے لیے گیلری کی اجازت درکار ہے۔'
            : 'Media gallery permission is required to select receipts.'
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        await processImage(asset.uri, asset.base64 || undefined);
      }
    } catch (err) {
      console.error('Gallery launch error:', err);
    }
  };

  const handleConfirmDeduct = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(
        lang === 'ur' ? 'درست رقم درج کریں' : 'Invalid Amount',
        lang === 'ur' ? 'براہ کرم بل کی درست رقم درج کریں۔' : 'Please provide a valid bill amount.'
      );
      return;
    }

    if (!selectedAccountId) {
      Alert.alert(
        lang === 'ur' ? 'اکاؤنٹ منتخب کریں' : 'Select Account',
        lang === 'ur' ? 'براہ کرم وہ اکاؤنٹ منتخب کریں جس سے رقم ادا کی گئی۔' : 'Please select the payment wallet/account.'
      );
      return;
    }

    const noteText = [
      merchant.trim() ? `[${merchant.trim()}]` : '',
      description.trim() ? description.trim() : (lang === 'ur' ? 'انوائس خرچہ' : 'Receipt expense'),
    ]
      .filter(Boolean)
      .join(' ');

    onAddTransaction({
      type: 'expense',
      amount: numAmount,
      category,
      account: selectedAccountId,
      date,
      note: noteText,
      source: 'scan',
      receiptUrl: imageUri || undefined,
    });

    onClose();
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const parsedNumAmount = parseFloat(amount) || 0;
  const remainingBalance = selectedAccount ? selectedAccount.balance - parsedNumAmount : 0;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIcon}>
                <Camera size={18} color="#047857" />
              </View>
              <View>
                <Text style={styles.title}>
                  {lang === 'ur' ? 'رسید / انوائس اسکین کریں' : 'Scan Bill & Invoice'}
                </Text>
                <Text style={styles.subtitle}>
                  {lang === 'ur' ? 'AI سے رقم اور اکاؤنٹ خودکار کٹوتی' : 'Smart AI auto-detection & wallet deduction'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            {/* Step 1: Image Capture / Select */}
            {!imageUri ? (
              <View style={styles.uploadContainer}>
                <Text style={styles.stepTitle}>
                  {lang === 'ur' ? '1. رسید یا بل کی تصویر لیں' : '1. Capture or Select Receipt'}
                </Text>
                <Text style={styles.stepDesc}>
                  {lang === 'ur'
                    ? 'گروسری، پیٹرول، ریسٹورنٹ یا یوٹیلیٹی بل کی صاف تصویر لگائیں۔'
                    : 'Clear photo of grocery, fuel, restaurant or store invoice.'}
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.captureBtn} onPress={handleTakePhoto}>
                    <Camera size={26} color="#ffffff" />
                    <Text style={styles.captureBtnText}>
                      {lang === 'ur' ? 'کیمرہ کھولیں' : 'Take Photo'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.galleryBtn} onPress={handlePickFromGallery}>
                    <ImageIcon size={26} color="#047857" />
                    <Text style={styles.galleryBtnText}>
                      {lang === 'ur' ? 'گیلری سے چنیں' : 'From Gallery'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Gemini API Key Box */}
                <View style={styles.apiKeyBox}>
                  <TouchableOpacity
                    style={styles.apiKeyHeader}
                    onPress={() => setShowKeyInput(!showKeyInput)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Sparkles size={16} color="#047857" style={{ marginRight: 6 }} />
                      <Text style={styles.apiKeyTitle}>
                        {apiKey
                          ? (lang === 'ur' ? 'AI ویژن فعال ہے ✓' : 'AI Vision Active ✓')
                          : (lang === 'ur' ? 'Gemini AI سیٹ اپ کریں (مفت)' : 'Configure Gemini AI (Free)')}
                      </Text>
                    </View>
                    <Key size={14} color="#64748b" />
                  </TouchableOpacity>

                  {showKeyInput && (
                    <View style={styles.apiKeyInputContainer}>
                      <Text style={styles.apiKeyHelp}>
                        {lang === 'ur'
                          ? 'Google AI Studio سے مفت Gemini API Key لے کر یہاں پیسٹ کریں۔'
                          : 'Paste free Gemini API key from Google AI Studio for automated OCR.'}
                      </Text>
                      <TextInput
                        style={styles.keyInput}
                        placeholder="AIzaSy..."
                        placeholderTextColor="#94a3b8"
                        value={apiKey}
                        onChangeText={handleSaveApiKey}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              /* Step 2: Image Preview & Extracted Details */
              <View>
                {/* Thumbnail Preview Bar */}
                <View style={styles.previewBar}>
                  <Image source={{ uri: imageUri }} style={styles.receiptThumbnail} />
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewTitle} numberOfLines={1}>
                      {merchant || (lang === 'ur' ? 'رسید کی تفصیل' : 'Receipt Document')}
                    </Text>
                    <Text style={styles.previewSub}>
                      {isAnalyzing
                        ? (lang === 'ur' ? 'AI ڈیٹا نکال رہا ہے...' : 'AI is reading bill...')
                        : (lang === 'ur' ? 'تصویر کامیابی سے لوڈ ہوئی' : 'Ready for review')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => {
                      if (imageBase64 && apiKey) {
                        processImage(imageUri, imageBase64);
                      } else {
                        handleTakePhoto();
                      }
                    }}
                  >
                    <RefreshCw size={14} color="#047857" />
                    <Text style={styles.retakeText}>{lang === 'ur' ? 'دوبارہ' : 'Retake'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Loading Indicator */}
                {isAnalyzing && (
                  <View style={styles.analyzingCard}>
                    <ActivityIndicator size="small" color="#047857" />
                    <Text style={styles.analyzingText}>
                      {lang === 'ur'
                        ? 'بل سے رقم، دکان کا نام اور اشیاء پڑھی جا رہی ہیں...'
                        : 'Extracting amount, vendor name and purchased items...'}
                    </Text>
                  </View>
                )}

                {/* Analysis Error / Tip */}
                {analysisError && !isAnalyzing && (
                  <View style={styles.errorBanner}>
                    <AlertCircle size={16} color="#d97706" style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{analysisError}</Text>
                  </View>
                )}

                {/* Form Fields: Editable */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionHeading}>
                    {lang === 'ur' ? '2. خرچے کی تفصیلات کی تصدیق' : '2. Verified Bill Details'}
                  </Text>

                  {/* Amount Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>
                      {lang === 'ur' ? 'بل کی کل رقم (روپے) *' : 'Total Amount (PKR) *'}
                    </Text>
                    <View style={styles.amountInputRow}>
                      <Text style={styles.currencyPrefix}>Rs.</Text>
                      <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Merchant / Vendor */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>
                      {lang === 'ur' ? 'دکان / وینڈر کا نام' : 'Store / Merchant Name'}
                    </Text>
                    <View style={styles.inputWithIcon}>
                      <Building2 size={16} color="#64748b" style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.textInput}
                        value={merchant}
                        onChangeText={setMerchant}
                        placeholder={lang === 'ur' ? 'مثلاً امتیاز، شیل، الفتح' : 'e.g. Imtiaz Super Market, Shell'}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  {/* Category Picker */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>
                      {lang === 'ur' ? 'کیٹیگری منتخب کریں' : 'Category'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                      {CATEGORIES.map((cat) => {
                        const isSelected = category === cat.name;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                            onPress={() => setCategory(cat.name)}
                          >
                            <Tag size={12} color={isSelected ? '#ffffff' : '#64748b'} style={{ marginRight: 4 }} />
                            <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                              {cat.name.split('/')[0].trim()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Date Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>{lang === 'ur' ? 'تاریخ' : 'Date'}</Text>
                    <View style={styles.inputWithIcon}>
                      <Calendar size={16} color="#64748b" style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.textInput}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  {/* Description / Items Note */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>
                      {lang === 'ur' ? 'اشیاء کی تفصیل / نوٹ' : 'Purchased Items / Note'}
                    </Text>
                    <View style={styles.inputWithIcon}>
                      <FileText size={16} color="#64748b" style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.textInput}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={lang === 'ur' ? 'دودھ، راشن، پیٹرول وغیرہ' : 'Items list or memo'}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  {/* Step 3: CHOOSE ACCOUNT TO DEDUCT FROM */}
                  <View style={styles.accountSelectionSection}>
                    <View style={styles.accountHeaderRow}>
                      <View>
                        <Text style={styles.accountSectionTitle}>
                          {lang === 'ur' ? '3. کس اکاؤنٹ سے رقم کٹوتی کی جائے؟' : '3. Which account did you pay from?'}
                        </Text>
                        <Text style={styles.accountSectionSub}>
                          {lang === 'ur'
                            ? 'منتخب کردہ والٹ سے یہ رقم خودکار کم ہو جائے گی'
                            : 'This amount will be deducted from your selected wallet'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={onOpenAddAccountModal} style={styles.addAccountLink}>
                        <Text style={styles.addAccountLinkText}>
                          {lang === 'ur' ? '+ نیا' : '+ Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {accounts.length === 0 ? (
                      <View style={styles.noAccountsCard}>
                        <Text style={styles.noAccountsText}>
                          {lang === 'ur'
                            ? 'کوئی فعال اکاؤنٹ موجود نہیں ہے۔ پہلے اکاؤنٹ بنائیں'
                            : 'No active accounts found. Please add an account first.'}
                        </Text>
                        <TouchableOpacity style={styles.createAccountBtn} onPress={onOpenAddAccountModal}>
                          <Text style={styles.createAccountBtnText}>
                            {lang === 'ur' ? '+ اکاؤنٹ بنائیں' : '+ Add Wallet/Account'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.accountsGrid}>
                        {accounts.map((acc) => {
                          const isSelected = selectedAccountId === acc.id;
                          const hasSufficient = acc.balance >= parsedNumAmount;
                          return (
                            <TouchableOpacity
                              key={acc.id}
                              style={[
                                styles.accountCard,
                                isSelected && styles.accountCardSelected,
                                !hasSufficient && styles.accountCardInsufficient,
                              ]}
                              onPress={() => setSelectedAccountId(acc.id)}
                            >
                              <View style={styles.accountCardHeader}>
                                <BankLogo bankKey={acc.bankKey} size="sm" />
                                {isSelected ? (
                                  <View style={styles.checkCircle}>
                                    <Check size={12} color="#ffffff" />
                                  </View>
                                ) : (
                                  <View style={styles.uncheckCircle} />
                                )}
                              </View>

                              <Text style={styles.accountName} numberOfLines={1}>
                                {lang === 'ur' ? acc.nameUrdu || acc.name : acc.name}
                              </Text>

                              <Text style={styles.accountBalance}>
                                Rs. {acc.balance.toLocaleString()}
                              </Text>

                              {isSelected && parsedNumAmount > 0 && (
                                <Text
                                  style={[
                                    styles.remainingText,
                                    remainingBalance < 0 ? styles.remainingNegative : styles.remainingPositive,
                                  ]}
                                >
                                  {lang === 'ur'
                                    ? `باقی: Rs. ${remainingBalance.toLocaleString()}`
                                    : `Rem: Rs. ${remainingBalance.toLocaleString()}`}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Action */}
          {imageUri && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>{lang === 'ur' ? 'دوبارہ اسکین' : 'Reset'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, (isAnalyzing || !amount || !selectedAccountId) && styles.submitBtnDisabled]}
                onPress={handleConfirmDeduct}
                disabled={isAnalyzing || !amount || !selectedAccountId}
              >
                <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>
                  {lang === 'ur'
                    ? `خرچہ درج کریں (Rs. ${parsedNumAmount.toLocaleString()})`
                    : `Confirm & Deduct (Rs. ${parsedNumAmount.toLocaleString()})`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 20,
  },
  uploadContainer: {
    paddingVertical: 10,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  captureBtn: {
    flex: 1,
    backgroundColor: '#047857',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  captureBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  galleryBtn: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryBtnText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  apiKeyBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apiKeyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  apiKeyInputContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  apiKeyHelp: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 15,
  },
  keyInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  receiptThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#cbd5e1',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  previewSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
  },
  retakeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
    marginLeft: 4,
  },
  analyzingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  analyzingText: {
    fontSize: 12,
    color: '#065f46',
    marginLeft: 10,
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  errorText: {
    fontSize: 12,
    color: '#b45309',
    flex: 1,
  },
  formSection: {
    paddingTop: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#047857',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 22,
    fontWeight: '700',
    color: '#065f46',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#047857',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  accountSelectionSection: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  accountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  accountSectionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  addAccountLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ecfdf5',
  },
  addAccountLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
  },
  accountCardSelected: {
    borderColor: '#047857',
    backgroundColor: '#f0fdf4',
  },
  accountCardInsufficient: {
    borderColor: '#fecdd3',
  },
  accountCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#047857',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  accountName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  accountBalance: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  remainingText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  remainingPositive: {
    color: '#059669',
  },
  remainingNegative: {
    color: '#dc2626',
  },
  noAccountsCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noAccountsText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    textAlign: 'center',
  },
  createAccountBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createAccountBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#047857',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
