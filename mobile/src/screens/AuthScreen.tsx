import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Wallet,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  AlertCircle,
  Globe,
  CheckCircle2,
  Cloud,
  RotateCw,
  Info,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface AuthScreenProps {
  lang: Language;
  setLang: (l: Language) => void;
  onAuthSuccess: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  lang,
  setLang,
  onAuthSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMsg(
        lang === 'ur'
          ? 'برائے مہربانی ای میل اور پاس ورڈ درج کریں'
          : 'Please enter email and password'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        lang === 'ur'
          ? 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setIsUnconfirmed(false);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        if (data.user) {
          if (data.session) {
            // Confirm email is disabled in Supabase - instant login!
            const userEmail = data.user.email || email.trim();
            await AsyncStorage.setItem('paisa_user_email', userEmail);
            if (data.user.id) await AsyncStorage.setItem('paisa_user_id', data.user.id);
            onAuthSuccess(userEmail);
          } else {
            // Supabase requires email verification
            setIsUnconfirmed(true);
            setSuccessMsg(
              lang === 'ur'
                ? `اکاؤنٹ بن گیا! برائے مہربانی ${email.trim()} پر بھیجا گیا تصدیقی لنک چیک کریں، یا Supabase ڈیش بورڈ میں 'Confirm email' آف کریں۔`
                : `Account created! Verification link sent to ${email.trim()}. Please verify before signing in (or disable "Confirm email" in Supabase settings).`
            );
            setIsSignUp(false);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        if (data.user) {
          const userEmail = data.user.email || email.trim();
          await AsyncStorage.setItem('paisa_user_email', userEmail);
          if (data.user.id) await AsyncStorage.setItem('paisa_user_id', data.user.id);
          onAuthSuccess(userEmail);
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      const unconfirmed =
        msg.toLowerCase().includes('email not confirmed') ||
        msg.toLowerCase().includes('email not verified');

      if (unconfirmed) {
        setIsUnconfirmed(true);
        setErrorMsg(
          lang === 'ur'
            ? 'ای میل کی تصدیق (Confirmation) ابھی باقی ہے! اپنے ای میل ان باکس یا اسپیم میں ویریفکیشن لنک چیک کریں، یا Supabase میں "Confirm email" آف کر دیں۔'
            : 'Email not confirmed yet! Check your inbox or spam folder for verification link, or disable "Confirm email" in your Supabase dashboard.'
        );
      } else {
        setErrorMsg(
          msg ||
            (lang === 'ur'
              ? 'لاگ ان کرنے میں خرابی پیش آئی۔ براہ کرم اپنی معلومات چیک کریں۔'
              : 'Authentication failed. Please verify your credentials.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setErrorMsg(
        lang === 'ur'
          ? 'برائے مہربانی پہلے ای میل درج کریں'
          : 'Please enter your email above first'
      );
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
      setSuccessMsg(
        lang === 'ur'
          ? `تصدیقی ای میل ${email.trim()} پر دوبارہ بھیج دی گئی ہے۔ اپنا ان باکس یا اسپیم چیک کریں۔`
          : `Verification email resent to ${email.trim()}! Please check inbox and spam.`
      );
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 36) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header with Language Switcher */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Wallet size={18} color="#ffffff" />
            </View>
            <Text style={styles.brandName}>PaisaKidhar</Text>
          </View>

          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLang(lang === 'en' ? 'ur' : 'en')}
          >
            <Globe size={14} color="#047857" />
            <Text style={styles.langBtnText}>{lang === 'en' ? 'اردو' : 'EN'}</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Hero Banner */}
        <View style={styles.heroBox}>
          <Text style={styles.welcomeTitle}>
            {isSignUp
              ? lang === 'ur'
                ? 'اپنا اکاؤنٹ بنائیں'
                : 'Create Your Account'
              : lang === 'ur'
              ? 'خوش آمدید! لاگ ان کریں'
              : 'Welcome Back!'}
          </Text>
          <Text style={styles.welcomeSub}>
            {isSignUp
              ? lang === 'ur'
                ? 'اپنے اخراجات، ادھار اور کمیٹی کا مکمل حساب رکھیں'
                : 'Sign up to track your expenses, udhaar & kameti securely'
              : lang === 'ur'
              ? 'اپنے مالیاتی ڈیش بورڈ تک رسائی کے لیے لاگ ان کریں'
              : 'Log in to access your personal finance dashboard'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#b91c1c" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color="#047857" />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {isUnconfirmed ? (
            <View style={styles.unconfirmedBox}>
              <View style={styles.unconfirmedHeader}>
                <Info size={14} color="#b45309" />
                <Text style={styles.unconfirmedTitle}>
                  {lang === 'ur' ? 'ای میل تصدیق کا حل' : 'Email Verification Action'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendEmail}
                disabled={resending}
              >
                {resending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <RotateCw size={13} color="#ffffff" />
                    <Text style={styles.resendBtnText}>
                      {lang === 'ur'
                        ? 'تصدیقی ای میل دوبارہ بھیجیں'
                        : 'Resend Verification Email'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.tipText}>
                {lang === 'ur'
                  ? 'ٹپ: بغیر ای میل ویریفکیشن لاگ ان کرنے کے لیے Supabase Dashboard > Authentication > Providers > Email میں "Confirm email" کو آف کر دیں۔'
                  : 'Tip: To allow instant login without email confirmation, turn off "Confirm email" in Supabase Dashboard > Authentication > Providers > Email.'}
              </Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Mail size={14} color="#64748b" />
              <Text style={styles.labelText}>
                {lang === 'ur' ? 'ای میل ایڈریس' : 'Email Address'}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Lock size={14} color="#64748b" />
              <Text style={styles.labelText}>
                {lang === 'ur' ? 'پاس ورڈ (کم از کم 6 حروف)' : 'Password (Min 6 chars)'}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : isSignUp ? (
              <View style={styles.btnContent}>
                <UserPlus size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>
                  {lang === 'ur' ? 'نیا اکاؤنٹ بنائیں' : 'Create Account'}
                </Text>
              </View>
            ) : (
              <View style={styles.btnContent}>
                <LogIn size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>
                  {lang === 'ur' ? 'لاگ ان کریں' : 'Sign In'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Toggle Button */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? lang === 'ur'
                  ? 'پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں'
                  : 'Already have an account? Sign In'
                : lang === 'ur'
                ? 'اکاؤنٹ نہیں ہے؟ نیا اکاؤنٹ بنائیں'
                : "Don't have an account? Create One"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Offline Reassurance Badge */}
        <View style={styles.offlineBadge}>
          <CheckCircle2 size={16} color="#059669" />
          <Text style={styles.offlineBadgeText}>
            {lang === 'ur'
              ? 'لاگ ان کے بعد ایپ مکمل طور پر آف لائن بھی چلے گی'
              : 'Works 100% offline once logged in. Auto-syncs when online.'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#047857',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  heroBox: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#991b1b',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#047857',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  toggleBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '700',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 12,
    color: '#065f46',
    flex: 1,
  },
  unconfirmedBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  unconfirmedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unconfirmedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#d97706',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 10,
    color: '#78350f',
    lineHeight: 14,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: 14,
  },
  offlineBadgeText: {
    flex: 1,
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
  },
});

