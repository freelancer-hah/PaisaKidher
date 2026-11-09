'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Check, ArrowRight, Volume2 } from 'lucide-react';
import { parseVoiceInput, ParsedVoiceResult } from '@/lib/voiceParser';
import { Language } from '@/types';

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
  const [speechSupported, setSpeechSupported] = useState(true);

  // Quick Pakistani Sample Voice Prompts
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

  const handleStartSpeech = () => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        setTranscript(speechText);
        const parsed = parseVoiceInput(speechText);
        setParsedResult(parsed);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechSupported(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header - Fixed & Clean */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'ur' ? 'آواز سے انٹری کریں' : 'Voice Entry (Urdu / Roman Urdu)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'ur'
                  ? 'مائیک دبائیں یا نیچے دیے گئے جملوں پر کلک کریں'
                  : 'Speak naturally in Urdu or English or click a quick prompt below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto modal-scrollbar flex-1 space-y-4">
          {/* Mic Circle */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <button
              onClick={handleStartSpeech}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white voice-recording-pulse scale-105'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
              }`}
            >
              {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
            </button>
            <p className="text-xs font-semibold text-slate-600 mt-3">
              {isListening
                ? lang === 'ur'
                  ? 'سن رہا ہے... بولیں'
                  : 'Listening... Speak now'
                : lang === 'ur'
                ? 'مائیک پر کلک کریں اور بولیں'
                : 'Tap microphone to speak'}
            </p>
            {!speechSupported && (
              <p className="text-[11px] text-amber-600 mt-1">
                Browser mic access is restricted or unsupported. You can click any sample below!
              </p>
            )}
          </div>

          {/* Sample Voice Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {lang === 'ur' ? 'تیز رفتار مثالیں (Click to Test):' : 'Instant Pakistani Voice Prompts:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(prompt)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === 'ur' ? 'سمجھا گیا اندراج (Parsed):' : 'AI & Rule Parsed Entry'}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  {parsedResult.type === 'udhaar' ? 'Udhaar Ledger' : parsedResult.type.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Amount / رقم</span>
                  <span className="font-bold text-slate-900 text-base">
                    Rs. {parsedResult.amount.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Category / کیٹیگری</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {parsedResult.category}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Account / کھاتہ</span>
                  <span className="font-semibold text-slate-800 uppercase">{parsedResult.account}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">
                    {parsedResult.type === 'udhaar' ? 'Person / شخص' : 'Note'}
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {parsedResult.type === 'udhaar'
                      ? `${parsedResult.contactName} (${parsedResult.udhaarDirection === 'given' ? 'Lena hai' : 'Dena hai'})`
                      : parsedResult.note}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            {lang === 'ur' ? 'منسوخ کریں' : 'Cancel'}
          </button>
          <button
            disabled={!parsedResult || parsedResult.amount <= 0}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200 transition"
          >
            <span>{lang === 'ur' ? 'محفوظ کریں' : 'Confirm & Save'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
