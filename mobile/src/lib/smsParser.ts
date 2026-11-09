import { PaymentMethod } from '../types';

export interface ParsedSMSResult {
  amount: number;
  type: 'expense' | 'income';
  account: PaymentMethod;
  note: string;
  category: string;
  externalRef: string;
  sender: string;
  date: string;
}

export function parsePakistaniSMS(smsText: string): ParsedSMSResult | null {
  const text = smsText.trim();
  const lower = text.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  // 1. Detect Sender / Wallet
  let account: PaymentMethod = 'bank';
  let sender = 'Bank/Wallet';

  if (lower.includes('jazzcash') || lower.includes('8558')) {
    account = 'jazzcash';
    sender = 'JazzCash';
  } else if (lower.includes('easypaisa') || lower.includes('3737')) {
    account = 'easypaisa';
    sender = 'Easypaisa';
  } else if (lower.includes('sadapay')) {
    account = 'sadapay';
    sender = 'SadaPay';
  } else if (lower.includes('nayapay')) {
    account = 'nayapay';
    sender = 'NayaPay';
  } else if (lower.includes('meezan')) {
    account = 'bank';
    sender = 'Meezan Bank';
  } else if (lower.includes('hbl')) {
    account = 'bank';
    sender = 'HBL';
  }

  // 2. Detect Debit / Credit
  const isCredit = lower.includes('received') || lower.includes('credited') || lower.includes('deposit') || lower.includes('wasul');
  const type: 'income' | 'expense' = isCredit ? 'income' : 'expense';

  // 3. Extract Amount (Rs. 1,500.00 or PKR 2500)
  const amountRegex = /(?:rs\.?|pkr|inr)?\s*([\d,]+(?:\.\d{1,2})?)/i;
  const match = text.match(amountRegex);
  let amount = 0;
  if (match) {
    amount = parseFloat(match[1].replace(/,/g, ''));
  }

  // 4. Extract TID / Ref
  const tidMatch = text.match(/(?:tid|trx|txn|ref|transaction\s*id)[\s:#]+([a-zA-Z0-9]+)/i);
  const externalRef = tidMatch ? tidMatch[1] : `SMS-${Date.now().toString().slice(-6)}`;

  // 5. Category inference
  let category = type === 'income' ? 'Received Transfer' : 'Wallet Payment';
  if (lower.includes('bill') || lower.includes('k-electric') || lower.includes('lesco') || lower.includes('sngpl')) {
    category = 'Bills & Utilities / بلز';
  } else if (lower.includes('foodpanda') || lower.includes('restaurant')) {
    category = 'Food & Dining';
  } else if (lower.includes('careem') || lower.includes('indrive') || lower.includes('fuel') || lower.includes('petrol')) {
    category = 'Fuel & Travel';
  }

  if (amount <= 0) return null;

  return {
    amount,
    type,
    account,
    note: `${sender} SMS: ${text.slice(0, 70)}...`,
    category,
    externalRef,
    sender,
    date: today,
  };
}

