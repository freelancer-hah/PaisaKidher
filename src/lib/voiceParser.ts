import { TransactionType, PaymentMethod } from '@/types';

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

export function parseVoiceInput(text: string): ParsedVoiceResult {
  const lower = text.toLowerCase().trim();

  // 1. Extract Amount (Handles numbers like 500, 1000, 5k, 5 hazar, 1 lakh, etc.)
  let amount = 0;
  
  // Check for lakh / hazar
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|لاکھ)/i);
  const hazarMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hazar|hazaar|hazār|k|ہزار)/i);
  const directNumMatch = lower.match(/(?:rs\.?|pkr|روپے)?\s*(\d+[\d,]*)(?:\s*(?:rupay|rupaye|rs|pkr))?/i);

  if (lakhMatch) {
    amount = parseFloat(lakhMatch[1]) * 100000;
  } else if (hazarMatch) {
    amount = parseFloat(hazarMatch[1]) * 1000;
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

    // Try to extract contact name (e.g. "Ali ko", "Hamza se")
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
      contactName,
      udhaarDirection: direction,
      confidence: 0.9,
    };
  }

  // 4. Identify Income vs Expense
  let type: TransactionType = 'expense';
  let category = 'Kharch (General)';

  if (
    lower.includes('salary') ||
    lower.includes('tankhwa') ||
    lower.includes('تنخواہ') ||
    lower.includes('aayi') ||
    lower.includes('aaye') ||
    lower.includes('kamai') ||
    lower.includes('received') ||
    lower.includes('freelance') ||
    lower.includes('gift mila') ||
    lower.includes('آمدن')
  ) {
    type = 'income';
    if (lower.includes('salary') || lower.includes('tankhwa') || lower.includes('تنخواہ')) {
      category = 'Salary / تنخواہ';
    } else if (lower.includes('freelance') || lower.includes('project') || lower.includes('client')) {
      category = 'Freelance / Business';
    } else {
      category = 'Other Income / آمدن';
    }
  } else {
    // Expense Categories
    if (lower.includes('petrol') || lower.includes('diesel') || lower.includes('پٹرول') || lower.includes('fuel') || lower.includes('ride') || lower.includes('careem') || lower.includes('indrive') || lower.includes('bykea')) {
      category = 'Fuel & Travel / سفر';
    } else if (lower.includes('khana') || lower.includes('food') || lower.includes('chai') || lower.includes('چائے') || lower.includes('roti') || lower.includes('hotel') || lower.includes('lunch') || lower.includes('dinner')) {
      category = 'Food & Chai / کھانا';
    } else if (lower.includes('rashan') || lower.includes('grocery') || lower.includes('راشن') || lower.includes('sauda') || lower.includes('doodh') || lower.includes('sabzi')) {
      category = 'Groceries & Rashan / راشن';
    } else if (lower.includes('bill') || lower.includes('bijli') || lower.includes('gas') || lower.includes('pani') || lower.includes('بل') || lower.includes('internet') || lower.includes('wifi') || lower.includes('load')) {
      category = 'Bills & Utilities / بلز';
    } else if (lower.includes('rent') || lower.includes('kiraya') || lower.includes('کرایہ')) {
      category = 'House Rent / کرایہ';
    } else if (lower.includes('school') || lower.includes('fees') || lower.includes('college') || lower.includes('academy')) {
      category = 'Education / فیس';
    } else if (lower.includes('dawai') || lower.includes('doctor') || lower.includes('hospital') || lower.includes('medicine') || lower.includes('صحت')) {
      category = 'Health & Medical / علاج';
    } else if (lower.includes('shopping') || lower.includes('kapre') || lower.includes('جوتے')) {
      category = 'Shopping / خریداری';
    } else if (lower.includes('kameti') || lower.includes('کمیٹی') || lower.includes('bc')) {
      category = 'Kameti Payment / کمیٹی';
    }
  }

  return {
    rawTranscript: text,
    type,
    amount,
    category,
    note: text,
    account,
    confidence: amount > 0 ? 0.95 : 0.6,
  };
}
