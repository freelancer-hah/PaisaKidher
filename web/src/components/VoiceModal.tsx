'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Check,
  ArrowRight,
  Globe,
  AlertCircle,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { parseVoiceInput, ParsedVoiceResult } from '@/lib/voiceParser';
import { Language, PaymentMethod } from '@/types';

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
  const [speechLang, setSpeechLang] = useState<'ur-PK' | 'en-PK'>('ur-PK');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Quick Pakistani Sample Voice Prompts
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);
      setTranscript('');
      setParsedResult(null);
      setSpeechError(null);
    } else {
      // Default speech language to Urdu if Urdu is active
      setSpeechLang(lang === 'ur' ? 'ur-PK' : 'en-PK');
    }
  }, [isOpen, lang]);

  const handleStartSpeech = () => {
    setSpeechError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError(
        lang === 'ur'
          ? 'آپ کا براؤزر مائیکروفون اسپیچ کو سپورٹ نہیں کرتا۔ آپ نیچے جملہ ٹائپ کر سکتے ہیں یا مثال منتخب کر سکتے ہیں۔'
          : 'Speech recognition is not supported in this browser. Please use Chrome/Edge or type below.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
          const parsed = parseVoiceInput(currentTranscript);
          setParsedResult(parsed);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            lang === 'ur'
              ? 'مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر میں مائیک کی اجازت دیں۔'
              : 'Microphone permission denied. Please allow microphone access in your browser settings.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError(
            lang === 'ur'
              ? 'کوئی آواز نہیں سنی گئی۔ براہ کرم مائیک کے قریب بولیں۔'
              : 'No speech detected. Please speak closer to the microphone and try again.'
          );
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setSpeechError(e.message || 'Error starting microphone');
    }
  };

  const handleStopSpeech = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
    if (text.trim()) {
      const parsed = parseVoiceInput(text);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText);
    const parsed = parseVoiceInput(sampleText);
    setParsedResult(parsed);
  };

  const handleSave = () => {
    if (parsedResult) {
      onConfirmVoiceEntry(parsedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {lang === 'ur' ? 'آواز سے فوری اندراج' : 'Pakistani Smart Voice Entry'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'ur'
                  ? 'اردو یا رومن اردو میں بولیں، خودکار حساب لگ جائے گا'
                  : 'Speak naturally in Urdu or Roman Urdu (e.g. 500 ka petrol)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto modal-scrollbar flex-1 space-y-4">
          {/* Speech Language Mode Switcher */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 ps-1">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'ur' ? 'بولنے کی زبان:' : 'Speaking Language:'}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSpeechLang('ur-PK')}
                className={`px-3 py-1 rounded-xl font-bold transition text-xs ${
                  speechLang === 'ur-PK'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اردو (Urdu)
              </button>
              <button
                type="button"
                onClick={() => setSpeechLang('en-PK')}
                className={`px-3 py-1 rounded-xl font-bold transition text-xs ${
                  speechLang === 'en-PK'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Roman Urdu / Eng
              </button>
            </div>
          </div>

          {/* Large Microphone Hero */}
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-slate-50 to-emerald-50/30 rounded-3xl border-2 border-dashed border-emerald-200 text-center relative overflow-hidden">
            <button
              type="button"
              onClick={isListening ? handleStopSpeech : handleStartSpeech}
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white voice-recording-pulse scale-105 ring-8 ring-rose-200'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105 active:scale-95 shadow-emerald-500/25 ring-4 ring-emerald-100'
              }`}
            >
              {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
            </button>

            <p className="text-xs font-bold text-slate-800 mt-3">
              {isListening
                ? lang === 'ur'
                  ? '🎙️ سن رہا ہے... اب بولیں!'
                  : '🎙️ Listening... Speak now!'
                : lang === 'ur'
                ? 'مائیک پر کلک کریں اور بولیں'
                : 'Click microphone and speak naturally'}
            </p>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {speechLang === 'ur-PK' ? 'Google Urdu Engine (ur-PK)' : 'Pakistani English / Roman (en-PK)'}
            </span>

            {speechError && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 max-w-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{speechError}</span>
              </div>
            )}
          </div>

          {/* Spoken Text Display & Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'ur' ? 'سنا گیا کلام (Editable):' : 'Captured Voice Text:'}</span>
              </span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => handleTranscriptChange('')}
                  className="text-[10px] text-slate-400 hover:text-rose-600"
                >
                  {lang === 'ur' ? 'صاف کریں' : 'Clear'}
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => handleTranscriptChange(e.target.value)}
              placeholder={
                lang === 'ur'
                  ? 'مثلاً: 500 کا پٹرول ڈلوایا کیش سے...'
                  : 'e.g. 800 ka petrol dalwaya cash pe or Ali ko 5000 udhaar diya...'
              }
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Parsed Result Preview Card */}
          {parsedResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 animate-in fade-in duration-150 shadow-xs">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-emerald-200/70">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'ur' ? 'خودکار حساب و درجہ بندی' : 'Smart Parsed Details'}</span>
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  {parsedResult.type === 'udhaar'
                    ? 'UDHAAR'
                    : parsedResult.type === 'income'
                    ? 'INCOME'
                    : 'EXPENSE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Amount */}
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-slate-400 block">
                    {lang === 'ur' ? 'رقم (Amount)' : 'Amount (PKR)'}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs font-bold text-emerald-700">Rs.</span>
                    <input
                      type="number"
                      value={parsedResult.amount || ''}
                      onChange={(e) =>
                        setParsedResult({
                          ...parsedResult,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="font-black text-slate-900 text-base w-full focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-slate-400 block">
                    {lang === 'ur' ? 'کیٹیگری' : 'Category'}
                  </span>
                  <input
                    type="text"
                    value={parsedResult.category}
                    onChange={(e) =>
                      setParsedResult({ ...parsedResult, category: e.target.value })
                    }
                    className="font-bold text-slate-800 text-xs w-full focus:outline-none bg-transparent mt-1"
                  />
                </div>

                {/* Account */}
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-slate-400 block">
                    {lang === 'ur' ? 'اکاؤنٹ / والیٹ' : 'Paid From / To'}
                  </span>
                  <select
                    value={parsedResult.account}
                    onChange={(e) =>
                      setParsedResult({
                        ...parsedResult,
                        account: e.target.value as PaymentMethod,
                      })
                    }
                    className="font-bold text-slate-800 text-xs w-full focus:outline-none bg-transparent mt-1 uppercase"
                  >
                    <option value="cash">Cash (کیش)</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="sadapay">SadaPay</option>
                    <option value="nayapay">NayaPay</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>

                {/* Note or Udhaar Contact */}
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-slate-400 block">
                    {parsedResult.type === 'udhaar'
                      ? lang === 'ur'
                        ? 'شخص (Contact)'
                        : 'Contact Person'
                      : lang === 'ur'
                      ? 'تفصیل (Note)'
                      : 'Note'}
                  </span>
                  <input
                    type="text"
                    value={
                      parsedResult.type === 'udhaar'
                        ? parsedResult.contactName || ''
                        : parsedResult.note
                    }
                    onChange={(e) => {
                      if (parsedResult.type === 'udhaar') {
                        setParsedResult({ ...parsedResult, contactName: e.target.value });
                      } else {
                        setParsedResult({ ...parsedResult, note: e.target.value });
                      }
                    }}
                    className="font-semibold text-slate-800 text-xs w-full focus:outline-none bg-transparent mt-1 truncate"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Voice Prompt Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'ur' ? 'تیز رفتار مثالیں (Click to Test):' : 'Click to test Pakistani voice phrases:'}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(prompt)}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition cursor-pointer"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            {lang === 'ur' ? 'منسوخ کریں' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={!parsedResult || parsedResult.amount <= 0}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200 transition active:scale-95 cursor-pointer"
          >
            <span>{lang === 'ur' ? 'اندراج محفوظ کریں' : 'Save Voice Entry'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
