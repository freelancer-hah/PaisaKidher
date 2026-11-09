export type TransactionType = 'expense' | 'income';

export type PaymentMethod = string;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  categoryIcon?: string;
  note: string;
  date: string; // ISO string YYYY-MM-DD
  account: string;
  source?: 'manual' | 'voice' | 'sms';
  externalRef?: string;
  receiptUrl?: string;
  projectId?: string;
  projectSubCategory?: string;
  udhaarId?: string;
}

export interface AccountBalance {
  id: string;
  bankKey?: string;
  name: string;
  nameUrdu: string;
  accountNumber?: string;
  balance: number;
  color: string;
  icon: string;
}

export type UdhaarDirection = 'given' | 'taken'; // 'given' = Lena hai, 'taken' = Dena hai

export interface UdhaarPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
  linkedTransactionId?: string;
}

export interface UdhaarEntry {
  id: string;
  contactName: string;
  contactPhone: string;
  direction: UdhaarDirection;
  totalAmount: number;
  paidAmount: number;
  dueDate?: string;
  createdDate: string;
  note?: string;
  status: 'pending' | 'partially_paid' | 'settled';
  payments: UdhaarPayment[];
  accountId?: string;
  syncWallet?: boolean;
  linkedTransactionId?: string;
}

export type ProjectType =
  | 'construction'
  | 'wedding'
  | 'renovation'
  | 'medical'
  | 'business'
  | 'other';

export interface ProjectEntry {
  id: string;
  title: string;
  type: ProjectType;
  startDate: string;
  status: 'active' | 'completed';
  totalSpent: number;
  notes?: string;
}

export interface ProjectExpenseItem {
  id: string;
  projectId: string;
  subCategory: string;
  amount: number;
  accountId: string;
  vendorOrPerson?: string;
  date: string;
  note?: string;
  linkedTransactionId?: string;
}

export interface KametiEntry {
  id: string;
  title: string;
  monthlyAmount: number;
  totalMembers: number;
  currentMonth: number;
  myTurnMonth: number;
  startDate: string;
  status: 'active' | 'completed';
  paidMonthsCount: number;
  isPayoutReceived: boolean;
  notes?: string;
}

export type Language = 'en' | 'ur' | 'roman_ur';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

