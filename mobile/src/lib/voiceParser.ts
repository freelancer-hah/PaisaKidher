import { TransactionType, PaymentMethod } from '../types';

export interface ParsedVoiceResult {
  rawTranscript: string;
  type: TransactionType | 'udhaar';
  amount: number;
  category: string;
  note: string;
  account: PaymentMethod;
  udhaarDirection?: 'given' | 'taken';
  contactName?: string;
}

export function parseVoiceInput(transcript: string): ParsedVoiceResult {
  const text = transcript.trim();
  const lower = text.toLowerCase();

  // 1. Extract Amount
  let amount = 0;
  const numRegex = /(\d+)\s*(?:hazaar|hazar|k|sau|so)?/i;
  const directNumMatch = text.match(/(\d[\d,]*)/);

  if (lower.includes('hazaar') || lower.includes('hazar') || lower.includes('ہزار')) {
    const m = text.match(/(\d+)\s*(?:hazaar|hazar|ہزار)/i);
    if (m) amount = parseInt(m[1], 10) * 1000;
  } else if (lower.includes('sau') || lower.includes('سو')) {
    const m = text.match(/(\d+)\s*(?:sau|سو)/i);
    if (m) amount = parseInt(m[1], 10) * 100;
  } else if (directNumMatch) {
    const cleanNum = directNumMatch[1].replace(/,/g, '');
    amount = parseInt(cleanNum, 10);
  }

  // 2. Identify Account / Payment Method
  let account: PaymentMethod = 'cash';
  if (lower.includes('jazzcash') || lower.includes('جیز کیش') || lower.includes('jazz cash')) {
    account = 'jazzcash';
  } else if (lower.includes('easypaisa') || lower.includes('ایزی پیسہ') || lower.includes('easy paisa')) {
    account = 'easypaisa';
  } else if (lower.includes('sadapay') || lower.includes('سادہ پے')) {
    account = 'sadapay';
  } else if (lower.includes('nayapay') || lower.includes('نیا پے')) {
    account = 'nayapay';
  } else if (lower.includes('bank') || lower.includes('بینک') || lower.includes('meezan') || lower.includes('hbl') || lower.includes('ubl')) {
    account = 'bank';
  }

  // 3. Check for Udhaar (Lend / Borrow)
  const isUdhaar = lower.includes('udhaar') || lower.includes('ادھار') || lower.includes('qarz') || lower.includes('قرض');
  if (isUdhaar) {
    let direction: 'given' | 'taken' = 'given';
    if (lower.includes('liya') || lower.includes('li') || lower.includes('لے لیا') || lower.includes('لیا')) {
      direction = 'taken';
    }

    let contactName = 'Dost / Relative';
    const nameMatch = lower.match(/([a-zA-Z\u0600-\u06FF]+)(?:\s*(?:ko|se|say|کو|سے))/i);
    if (nameMatch && !['udhaar', 'paisa', 'paise', 'bank'].includes(nameMatch[1].toLowerCase())) {
      contactName = nameMatch[1];
    }

    return {
      rawTranscript: text,
      type: 'udhaar',
      amount,
      category: 'Udhaar',
      note: text,
      account,
      udhaarDirection: direction,
      contactName,
    };
  }

  // 4. Check for Income vs Expense
  const isIncome =
    lower.includes('salary') ||
    lower.includes('tankhwah') ||
    lower.includes('تنخواہ') ||
    lower.includes('aaye') ||
    lower.includes('aayi') ||
    lower.includes('aaya') ||
    lower.includes('miley') ||
    lower.includes('mila') ||
    lower.includes('profit') ||
    lower.includes('kamai');

  const type: TransactionType = isIncome ? 'income' : 'expense';

  // 5. Categorization
  let category = 'Other / متفرق';
  if (lower.includes('petrol') || lower.includes('fuel') || lower.includes('diesel') || lower.includes('پیٹرول') || lower.includes('ride') || lower.includes('indrive') || lower.includes('careem')) {
    category = 'Fuel & Travel / سفر';
  } else if (lower.includes('rashan') || lower.includes('grocery') || lower.includes('sauda') || lower.includes('سودا') || lower.includes('راشن')) {
    category = 'Groceries & Rashan / راشن';
  } else if (lower.includes('chai') || lower.includes('roti') || lower.includes('khana') || lower.includes('biryani') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('nashta')) {
    category = 'Food & Chai / کھانا';
  } else if (lower.includes('bijli') || lower.includes('bill') || lower.includes('gas') || lower.includes('pani') || lower.includes('بل')) {
    category = 'Bills & Utilities / بلز';
  } else if (lower.includes('dawai') || lower.includes('doctor') || lower.includes('medical') || lower.includes('علاج')) {
    category = 'Health & Medical / علاج';
  } else if (lower.includes('salary') || lower.includes('تنخواہ')) {
    category = 'Salary / تنخواہ';
  }

  return {
    rawTranscript: text,
    type,
    amount,
    category,
    note: text,
    account,
  };
}

