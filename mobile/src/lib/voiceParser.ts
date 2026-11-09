import { TransactionType, PaymentMethod } from '../types';

export interface ParsedVoiceResult {
  rawTranscript: string;
  type: TransactionType | 'udhaar';
  amount: number;
  category: string;
  note: string;
  account: PaymentMethod;
  contactName?: string;
  udhaarDirection?: 'given' | 'taken';
  confidence: number;
}

// Convert Urdu/Arabic digits (۰۱۲۳۴۵۶۷۸۹) to standard ASCII 0-9
function normalizeUrduDigits(text: string): string {
  const urduDigits: { [key: string]: string } = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return text.replace(/[۰-۹٠-٩]/g, (char) => urduDigits[char] || char);
}

// Spoken word numbers dictionary
const NUMBER_WORDS: { [key: string]: number } = {
  'ek': 1, 'aik': 1, 'ایک': 1, 'one': 1,
  'do': 2, 'دو': 2, 'two': 2,
  'teen': 3, 'تین': 3, 'three': 3,
  'char': 4, 'chaar': 4, 'چار': 4, 'four': 4,
  'panch': 5, 'paanch': 5, 'پانچ': 5, 'five': 5,
  'chhe': 6, 'che': 6, 'چھ': 6, 'six': 6,
  'saat': 7, 'سات': 7, 'seven': 7,
  'aath': 8, 'آٹھ': 8, 'eight': 8,
  'nau': 9, 'نو': 9, 'nine': 9,
  'das': 10, 'دس': 10, 'ten': 10,
  'bees': 20, 'بیس': 20, 'twenty': 20,
  'tees': 30, 'تیس': 30, 'thirty': 30,
  'chalis': 40, 'چالیس': 40, 'forty': 40,
  'pachas': 50, 'pachaas': 50, 'پچاس': 50, 'fifty': 50,
  'saath': 60, 'ساٹھ': 60, 'sixty': 60,
  'sattar': 70, 'ستر': 70, 'seventy': 70,
  'assi': 80, 'اسی': 80, 'eighty': 80,
  'navve': 90, 'نوے': 90, 'ninety': 90,
  'sau': 100, 'سو': 100, 'hundred': 100,
  'dedh sau': 150, 'ڈیڑھ سو': 150,
  'dhai sau': 250, 'ڈھائی سو': 250,
};

export function parseVoiceInput(rawText: string): ParsedVoiceResult {
  if (!rawText || !rawText.trim()) {
    return {
      rawTranscript: '',
      type: 'expense',
      amount: 0,
      category: 'Kharch (General)',
      note: '',
      account: 'cash',
      confidence: 0,
    };
  }

  // Normalize numbers and lowercase
  const normalizedText = normalizeUrduDigits(rawText);
  const lower = normalizedText.toLowerCase().trim();

  // 1. EXTRACT AMOUNT
  let amount = 0;

  // Pattern A: Lakhs (e.g. "2 lakh", "1.5 لاکھ", "پانچ لاکھ")
  const lakhMatch = lower.match(/(?:([0-9]+(?:\.[0-9]+)?)|([a-z\u0600-\u06FF]+))\s*(?:lakh|lac|لاکھ)/i);
  if (lakhMatch) {
    if (lakhMatch[1]) {
      amount = parseFloat(lakhMatch[1]) * 100000;
    } else if (lakhMatch[2] && NUMBER_WORDS[lakhMatch[2].trim()]) {
      amount = NUMBER_WORDS[lakhMatch[2].trim()] * 100000;
    } else {
      amount = 100000;
    }
  }

  // Pattern B: Hazars / Thousands (e.g. "50k", "5 hazar", "تین ہزار", "50000")
  if (amount === 0) {
    const kMatch = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*k\b/i);
    const hazarMatch = lower.match(/(?:([0-9]+(?:\.[0-9]+)?)|([a-z\u0600-\u06FF]+))\s*(?:hazar|hazaar|hazār|ہزار)/i);

    if (kMatch) {
      amount = parseFloat(kMatch[1]) * 1000;
    } else if (hazarMatch) {
      if (hazarMatch[1]) {
        amount = parseFloat(hazarMatch[1]) * 1000;
      } else if (hazarMatch[2] && NUMBER_WORDS[hazarMatch[2].trim()]) {
        amount = NUMBER_WORDS[hazarMatch[2].trim()] * 1000;
      } else {
        amount = 1000;
      }
    }
  }

  // Pattern C: Hundreds (e.g. "پانچ سو", "8 sau", "سو روپے")
  if (amount === 0) {
    const sauMatch = lower.match(/(?:([0-9]+)|([a-z\u0600-\u06FF]+))\s*(?:sau|so|سو)/i);
    if (sauMatch) {
      if (sauMatch[1]) {
        amount = parseInt(sauMatch[1], 10) * 100;
      } else if (sauMatch[2] && NUMBER_WORDS[sauMatch[2].trim()]) {
        amount = NUMBER_WORDS[sauMatch[2].trim()] * 100;
      } else {
        amount = 100;
      }
    }
  }

  // Pattern D: Direct digits (e.g. "800 ka petrol", "Rs 1500", "5000 دیے")
  if (amount === 0) {
    const digitMatches = lower.match(/\b\d+(?:,\d+)*(?:\.\d+)?\b/g);
    if (digitMatches && digitMatches.length > 0) {
      for (const rawNum of digitMatches) {
        const clean = parseFloat(rawNum.replace(/,/g, ''));
        if (clean > 0 && clean !== 2024 && clean !== 2025 && clean !== 2026 && clean < 10000000) {
          amount = clean;
          break;
        }
      }
    }
  }

  // 2. IDENTIFY ACCOUNT / WALLET
  let account: PaymentMethod = 'cash';
  if (
    lower.includes('jazzcash') ||
    lower.includes('jazz cash') ||
    lower.includes('جیز کیش') ||
    lower.includes('جیزکیش')
  ) {
    account = 'jazzcash';
  } else if (
    lower.includes('easypaisa') ||
    lower.includes('easy paisa') ||
    lower.includes('ایزی پیسہ') ||
    lower.includes('ایزیپیسہ')
  ) {
    account = 'easypaisa';
  } else if (
    lower.includes('sadapay') ||
    lower.includes('sada pay') ||
    lower.includes('سادہ پے')
  ) {
    account = 'sadapay';
  } else if (
    lower.includes('nayapay') ||
    lower.includes('naya pay') ||
    lower.includes('نیا پے')
  ) {
    account = 'nayapay';
  } else if (
    lower.includes('bank') ||
    lower.includes('بینک') ||
    lower.includes('meezan') ||
    lower.includes('میزان') ||
    lower.includes('hbl') ||
    lower.includes('ubl') ||
    lower.includes('mcb') ||
    lower.includes('alfalah') ||
    lower.includes('allied') ||
    lower.includes('faysal') ||
    lower.includes('askari')
  ) {
    account = 'bank';
  } else {
    account = 'cash';
  }

  // 3. CHECK FOR UDHAAR (LEND / BORROW)
  const isUdhaar =
    lower.includes('udhaar') ||
    lower.includes('udhar') ||
    lower.includes('ادھار') ||
    lower.includes('qarz') ||
    lower.includes('قرض') ||
    lower.includes('udhar diya') ||
    lower.includes('udhar liya');

  if (isUdhaar) {
    let direction: 'given' | 'taken' = 'given';
    if (
      lower.includes('liya') ||
      lower.includes('li') ||
      lower.includes('liye') ||
      lower.includes('لے لیا') ||
      lower.includes('لیا') ||
      lower.includes('لیے') ||
      lower.includes('borrow') ||
      lower.includes('borrowed')
    ) {
      direction = 'taken';
    }

    let contactName = 'Dost / Relative';
    const nameMatch = normalizedText.match(/([A-Z\u0600-\u06FF][a-zA-Z\u0600-\u06FF]+)\s*(?:ko|se|say|کو|سے)/i);
    if (nameMatch && !['Udhaar', 'Paisa', 'Bank', 'Cash', 'JazzCash'].includes(nameMatch[1])) {
      contactName = nameMatch[1];
    }

    return {
      rawTranscript: rawText,
      type: 'udhaar',
      amount,
      category: direction === 'given' ? 'Udhaar Given / ادھار دیا' : 'Udhaar Taken / ادھار لیا',
      note: rawText,
      account,
      contactName,
      udhaarDirection: direction,
      confidence: 0.95,
    };
  }

  // 4. IDENTIFY INCOME VS EXPENSE
  let type: TransactionType = 'expense';
  let category = 'Kharch (General)';

  const isIncome =
    lower.includes('salary') ||
    lower.includes('tankhwa') ||
    lower.includes('tankhah') ||
    lower.includes('تنخواہ') ||
    lower.includes('aayi') ||
    lower.includes('aaye') ||
    lower.includes('kamai') ||
    lower.includes('کمائی') ||
    lower.includes('received') ||
    lower.includes('wasool') ||
    lower.includes('وصول') ||
    lower.includes('freelance') ||
    lower.includes('profit') ||
    lower.includes('munafa') ||
    lower.includes('منافع') ||
    lower.includes('آمدن') ||
    lower.includes('gift mila') ||
    lower.includes('inaam');

  if (isIncome) {
    type = 'income';
    if (lower.includes('salary') || lower.includes('tankhwa') || lower.includes('تنخواہ')) {
      category = 'Salary / تنخواہ';
    } else if (lower.includes('freelance') || lower.includes('project') || lower.includes('client')) {
      category = 'Freelance / Business';
    } else if (lower.includes('profit') || lower.includes('munafa') || lower.includes('منافع')) {
      category = 'Profit / منافع';
    } else {
      category = 'Other Income / آمدن';
    }
  } else {
    // EXPENSE CATEGORIES
    if (
      lower.includes('petrol') ||
      lower.includes('diesel') ||
      lower.includes('پٹرول') ||
      lower.includes('fuel') ||
      lower.includes('ride') ||
      lower.includes('careem') ||
      lower.includes('indrive') ||
      lower.includes('bykea') ||
      lower.includes('rickshaw') ||
      lower.includes('rikshaw') ||
      lower.includes('taxi') ||
      lower.includes('cng')
    ) {
      category = 'Fuel & Travel / سفر';
    } else if (
      lower.includes('khana') ||
      lower.includes('food') ||
      lower.includes('chai') ||
      lower.includes('چائے') ||
      lower.includes('roti') ||
      lower.includes('hotel') ||
      lower.includes('lunch') ||
      lower.includes('dinner') ||
      lower.includes('biryani') ||
      lower.includes('nashta') ||
      lower.includes('کھانا') ||
      lower.includes('ناشتہ')
    ) {
      category = 'Food & Chai / کھانا';
    } else if (
      lower.includes('rashan') ||
      lower.includes('grocery') ||
      lower.includes('راشن') ||
      lower.includes('sauda') ||
      lower.includes('doodh') ||
      lower.includes('sabzi') ||
      lower.includes('meat') ||
      lower.includes('gosht') ||
      lower.includes('chicken') ||
      lower.includes('oil') ||
      lower.includes('ghee') ||
      lower.includes('atta') ||
      lower.includes('دودھ') ||
      lower.includes('سبزی')
    ) {
      category = 'Groceries & Rashan / راشن';
    } else if (
      lower.includes('bill') ||
      lower.includes('bijli') ||
      lower.includes('gas') ||
      lower.includes('pani') ||
      lower.includes('بل') ||
      lower.includes('بجلی') ||
      lower.includes('گیس') ||
      lower.includes('internet') ||
      lower.includes('wifi') ||
      lower.includes('load') ||
      lower.includes('easyload') ||
      lower.includes('ptcl')
    ) {
      category = 'Bills & Utilities / بلز';
    } else if (
      lower.includes('rent') ||
      lower.includes('kiraya') ||
      lower.includes('کرایہ')
    ) {
      category = 'House Rent / کرایہ';
    } else if (
      lower.includes('school') ||
      lower.includes('fees') ||
      lower.includes('college') ||
      lower.includes('academy') ||
      lower.includes('فیس')
    ) {
      category = 'Education / فیس';
    } else if (
      lower.includes('dawai') ||
      lower.includes('doctor') ||
      lower.includes('hospital') ||
      lower.includes('medicine') ||
      lower.includes('صحت') ||
      lower.includes('دوائی') ||
      lower.includes('ڈاکٹر')
    ) {
      category = 'Health & Medical / علاج';
    } else if (
      lower.includes('mazdoor') ||
      lower.includes('mazdoori') ||
      lower.includes('mistri') ||
      lower.includes('cement') ||
      lower.includes('bajri') ||
      lower.includes('sarya') ||
      lower.includes('مزدوری') ||
      lower.includes('مستری')
    ) {
      category = 'Labor & Construction / مزدوری';
    } else if (
      lower.includes('shadi') ||
      lower.includes('wedding') ||
      lower.includes('catering') ||
      lower.includes('venue') ||
      lower.includes('شادی')
    ) {
      category = 'Wedding & Functions / شادی';
    } else if (
      lower.includes('shopping') ||
      lower.includes('kapre') ||
      lower.includes('shoes') ||
      lower.includes('کپڑے') ||
      lower.includes('خریداری')
    ) {
      category = 'Shopping / خریداری';
    } else if (
      lower.includes('kameti') ||
      lower.includes('کمیٹی') ||
      lower.includes('bc')
    ) {
      category = 'Kameti Payment / کمیٹی';
    } else {
      category = 'General Expense / متفرق خرچ';
    }
  }

  return {
    rawTranscript: rawText,
    type,
    amount,
    category,
    note: rawText,
    account,
    confidence: amount > 0 ? 0.95 : 0.6,
  };
}
