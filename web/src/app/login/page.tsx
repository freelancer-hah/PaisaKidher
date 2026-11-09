'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Coins,
  RefreshCw,
  Send,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { BankLogo } from '@/components/BankLogo';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [isUnconfirmedEmail, setIsUnconfirmedEmail] = useState(false);
  const [resending, setResending] = useState(false);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);

  // Check if user is already logged in (offline or online)
  useEffect(() => {
    const cachedEmail = localStorage.getItem('paisa_user_email');
    if (cachedEmail) {
      router.push('/');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        localStorage.setItem('paisa_user_email', session.user.email);
        const authName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
        if (authName) localStorage.setItem('paisa_user_name', authName);
        if (session.user.id) localStorage.setItem('paisa_user_id', session.user.id);
        router.push('/');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setIsUnconfirmedEmail(false);

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg(
        lang === 'ur'
          ? 'پاس ورڈز آپس میں میل نہیں کھاتے۔ براہ کرم دوبارہ چیک کریں۔'
          : 'Passwords do not match. Please verify.'
      );
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          if (data.session) {
            // Instant sign in when email confirmation is disabled in Supabase
            const authEmail = data.user.email || email.trim();
            const authName = data.user.user_metadata?.full_name || name.trim();
            localStorage.setItem('paisa_user_email', authEmail);
            if (authName) localStorage.setItem('paisa_user_name', authName);
            if (data.user.id) localStorage.setItem('paisa_user_id', data.user.id);

            setSuccessMsg(
              lang === 'ur'
                ? 'اکاؤنٹ کامیابی سے بن گیا! ڈیش بورڈ لوڈ ہو رہا ہے...'
                : 'Account created successfully! Syncing to your dashboard...'
            );
            setTimeout(() => {
              router.push('/');
            }, 1000);
          } else {
            // Supabase requires email confirmation
            setIsUnconfirmedEmail(true);
            setSuccessMsg(
              lang === 'ur'
                ? `اکاؤنٹ بن گیا ہے! تصدیقی ای میل ${email.trim()} پر بھیجی گئی ہے۔ برائے مہربانی اپنا ان باکس یا اسپیم فولڈر چیک کر کے لنک پر کلک کریں، یا Supabase ڈیش بورڈ میں 'Confirm email' آف کریں۔`
                : `Account created! Verification email sent to ${email.trim()}. Please verify your email before signing in (or disable "Confirm email" in Supabase settings).`
            );
            setIsSignUp(false); // Switch to sign in tab
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (data.user) {
          const authEmail = data.user.email || email.trim();
          const authName = data.user.user_metadata?.full_name || '';
          localStorage.setItem('paisa_user_email', authEmail);
          if (authName) localStorage.setItem('paisa_user_name', authName);
          if (data.user.id) localStorage.setItem('paisa_user_id', data.user.id);

          setSuccessMsg(
            lang === 'ur'
              ? 'لاگ ان کامیاب! ڈیش بورڈ لوڈ ہو رہا ہے...'
              : 'Login successful! Redirecting to dashboard...'
          );
          setTimeout(() => {
            router.push('/');
          }, 600);
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      const isUnconfirmed =
        msg.toLowerCase().includes('email not confirmed') ||
        msg.toLowerCase().includes('email not verified');

      if (isUnconfirmed) {
        setIsUnconfirmedEmail(true);
        setErrorMsg(
          lang === 'ur'
            ? 'آپ کے ای میل کی تصدیق (Email Confirmation) ابھی تک نہیں ہوئی۔ براہ کرم اپنے ای میل ان باکس (اور اسپیم فولڈر) میں تصدیقی لنک چیک کریں، یا نیچے سے دوبارہ ای میل بھیجیں، یا Supabase سیٹنگز میں "Confirm email" آف کر دیں۔'
            : 'Email not confirmed yet! Please check your email inbox (and spam folder) for the verification link, click resend below, or disable "Confirm email" in your Supabase dashboard.'
        );
      } else {
        setErrorMsg(
          msg ||
            (lang === 'ur'
              ? 'لاگ ان کرنے میں خرابی پیش آئی۔ براہ کرم اپنی معلومات چیک کریں۔'
              : 'Authentication failed. Please verify your email and password.')
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
          ? 'برائے مہربانی پہلے اپنی ای میل درج کریں'
          : 'Please enter your email address first'
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
          ? `تصدیقی ای میل کامیابی سے ${email.trim()} پر دوبارہ بھیج دی گئی ہے۔ اپنا ان باکس یا اسپیم فولڈر چیک کریں۔`
          : `Verification email has been resent to ${email.trim()}! Please check inbox and spam folder.`
      );
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          (lang === 'ur'
            ? 'ای میل دوبارہ بھیجنے میں مسئلہ آیا'
            : 'Failed to resend confirmation email')
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-slate-50 flex flex-col justify-between ${
        lang === 'ur' ? 'font-urdu' : 'font-sans'
      }`}
    >
      {/* Top Simple Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight">
            PaisaKidhar
          </span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === 'ur' ? 'English' : 'اردو'}</span>
        </button>
      </header>

      {/* Main Auth Split Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Left Decorative & Features Pane (Desktop) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-emerald-400/15 blur-xl pointer-events-none" />

            <div className="relative z-10">
              {/* Brand Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-2xl tracking-tight">Paisa Kidhar</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100 border border-emerald-400/30">
                      PKR
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/80 mt-0.5">
                    {lang === 'ur' ? 'آپ کے ہر روپے کا حساب' : 'Aapke har rupaye ka hisaab'}
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <h2 className="text-xl font-bold text-white mb-2 leading-snug">
                {lang === 'ur'
                  ? 'پاکستان کا سب سے جدید اور آسان فنانس اور اخراجات ٹریکر'
                  : 'Smart Expense Tracking for Every Pakistani Household'}
              </h2>
              <p className="text-xs text-emerald-100/80 mb-6 leading-relaxed">
                {lang === 'ur'
                  ? 'تمام بینک اکاؤنٹس، ادھار کھاتہ، کمیٹی کا ریکارڈ اور اردو آواز اندراج ایک جگہ پر۔'
                  : 'Track Meezan, HBL, UBL, JazzCash, Udhaar ledger, and monthly Kameti records in one unified place.'}
              </p>

              {/* Feature Points */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  </div>
                  <span>
                    {lang === 'ur'
                      ? 'تمام پاکستانی بینکوں کے الگ لوگوز اور کھاتے'
                      : 'Meezan, HBL, UBL, Alfalah & Digital Wallets'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/40 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4 text-teal-200" />
                  </div>
                  <span>
                    {lang === 'ur'
                      ? 'اردو وائس اسسٹنٹ اور SMS خودکار اندراج'
                      : 'Urdu Voice Expense Logging & SMS Import'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/40 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4 text-emerald-200" />
                  </div>
                  <span>
                    {lang === 'ur'
                      ? 'ادھار کھاتہ اور کمیٹی بی سی کی فوری ٹریکنگ'
                      : 'Udhaar WhatsApp Reminders & Kameti Tracker'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Logos Preview Row */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80 block mb-2.5">
                Supported Pakistani Banks & Wallets
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['meezan', 'hbl', 'ubl', 'alfalah', 'sadapay', 'jazzcash', 'easypaisa'].map((b) => (
                  <BankLogo key={b} bankKey={b} size="sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Form Pane */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {/* Tabs: Sign In vs Sign Up */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  !isSignUp
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'لاگ ان کریں' : 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isSignUp
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'نیا اکاؤنٹ بنائیں' : 'Create Account'}</span>
              </button>
            </div>

            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                {isSignUp
                  ? lang === 'ur'
                    ? 'نیا مفت اکاؤنٹ بنائیں'
                    : 'Get started for free'
                  : lang === 'ur'
                  ? 'اپنے اکاؤنٹ میں لاگ ان کریں'
                  : 'Welcome back'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUp
                  ? lang === 'ur'
                    ? 'اپنے اخراجات اور مالیات کو کلاؤڈ پر محفوظ رکھیں'
                    : 'Create your account to sync transactions and bank balances safely.'
                  : lang === 'ur'
                  ? 'اپنی ای میل اور پاس ورڈ کے ساتھ لاگ ان کریں'
                  : 'Enter your credentials to access your synced finances.'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3.5 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Unconfirmed Email Action Box */}
            {isUnconfirmedEmail && (
              <div className="p-4 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span>
                      {lang === 'ur'
                        ? 'ای میل تصدیق کا حل'
                        : 'Email Confirmation Options'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSupabaseGuide(!showSupabaseGuide)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>
                      {showSupabaseGuide
                        ? (lang === 'ur' ? 'گائیڈ چھپائیں' : 'Hide Guide')
                        : (lang === 'ur' ? 'سپابیس میں آف کیسے کریں؟' : 'Turn off in Supabase')}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>
                      {resending
                        ? (lang === 'ur' ? 'بھیجا جا رہا ہے...' : 'Resending...')
                        : (lang === 'ur' ? 'تصدیقی ای میل دوبارہ بھیجیں' : 'Resend Verification Email')}
                    </span>
                  </button>
                </div>

                {showSupabaseGuide && (
                  <div className="mt-2 pt-2.5 border-t border-amber-200/80 text-[11px] text-amber-950 space-y-1.5 bg-amber-100/60 p-2.5 rounded-xl">
                    <p className="font-bold">
                      {lang === 'ur'
                        ? 'بغیر ای میل ویریفکیشن لاگ ان فعال کرنے کا طریقہ (10 سیکنڈ):'
                        : 'How to allow immediate login without email verification (10 sec):'}
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700">
                      <li>
                        <b>Supabase Dashboard</b> &gt; <b>Authentication</b> &gt; <b>Providers</b> &gt; <b>Email</b>
                      </li>
                      <li>
                        <b>&quot;Confirm email&quot;</b> toggle ko <b>OFF</b> kar ke <b>Save</b> karein.
                      </li>
                      <li>
                        Is user ko verify karne ke liye: <b>Authentication</b> &gt; <b>Users</b> &gt; User ke sath <b>&quot;...&quot;</b> par click kar ke <b>&quot;Auto Confirm User&quot;</b> dabayein!
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'ur' ? 'آپ کا مکمل نام' : 'Full Name'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ur' ? 'ای میل ایڈریس' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'ur' ? 'پاس ورڈ' : 'Password'}</span>
                  </span>
                  {!isSignUp && (
                    <span className="text-[11px] text-emerald-600 font-semibold cursor-pointer hover:underline">
                      {lang === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'ur' ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm Password'}</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{lang === 'ur' ? 'رابطہ ہو رہا ہے...' : 'Connecting...'}</span>
                  </span>
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'مفت اکاؤنٹ بنائیں' : 'Create Free Account'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'لاگ ان اور کلاؤڈ سائن ان' : 'Sign In & Sync'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Offline Local Mode Option */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
              >
                {lang === 'ur'
                  ? 'بغیر لاگ ان کے استعمال کریں (آف لائن موڈ) &larr;'
                  : 'Continue in Local Offline Mode &rarr;'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        Paisa Kidhar &copy; {new Date().getFullYear()} — Made for Pakistan with ❤️
      </footer>
    </div>
  );
}
