import {
  Transaction,
  AccountBalance,
  UdhaarEntry,
  KametiEntry,
  ProjectEntry,
  ProjectExpenseItem,
  ProjectType,
} from '@/types';

export const INITIAL_ACCOUNTS: AccountBalance[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_UDHAAR: UdhaarEntry[] = [];

export const INITIAL_KAMETIS: KametiEntry[] = [];

export const INITIAL_PROJECTS: ProjectEntry[] = [];

export const INITIAL_PROJECT_EXPENSES: ProjectExpenseItem[] = [];

export interface ProjectTypeMeta {
  type: ProjectType;
  label: string;
  labelUrdu: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
}

export const PROJECT_TYPES_LIST: ProjectTypeMeta[] = [
  {
    type: 'construction',
    label: 'Makaan Tameer / Construction',
    labelUrdu: 'تعمیر مکان / عمارت',
    iconName: 'Building2',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
  },
  {
    type: 'wedding',
    label: 'Wedding / Shadi Event',
    labelUrdu: 'شادی بیاہ',
    iconName: 'HeartHandshake',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
  },
  {
    type: 'renovation',
    label: 'Home Renovation & Repair',
    labelUrdu: 'گھر کی تزئین و مرمت',
    iconName: 'Paintbrush',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
  },
  {
    type: 'medical',
    label: 'Medical & Healthcare Treatment',
    labelUrdu: 'طبی علاج معالجہ',
    iconName: 'Activity',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  {
    type: 'business',
    label: 'New Business / Startup Venture',
    labelUrdu: 'نیا کاروبار / پراجیکٹ',
    iconName: 'Briefcase',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
  },
  {
    type: 'other',
    label: 'Special Event / Sub-Ledger',
    labelUrdu: 'خاص ایونٹ / دیگر کھاتہ',
    iconName: 'FolderKanban',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
  },
];

export const PROJECT_SUBCATEGORIES: Record<ProjectType, string[]> = {
  construction: [
    'Mazdoori / Labour (مزدوری)',
    'Cement & Saria (سیمنٹ اور سریا)',
    'Bricks & Sand (اینٹیں، ریت اور بجری)',
    'Sanitary & Plumbing (سینیٹری اور پلمبنگ)',
    'Electrical & Wiring (بجلی کا سامان اور وائرنگ)',
    'Woodwork / Doors & Windows (لکڑی کا کام اور کھڑکیاں)',
    'Tiles & Marble (ٹائلز اور ماربل)',
    'Paint & Finishing (رنگ و روغن)',
    'Contractor & Architect Fee (ٹھیکیدار اور نقشہ فیس)',
    'Other Construction (متفرق تعمیراتی خرچ)',
  ],
  wedding: [
    'Venue & Hall (شادی ہال اور مارکی)',
    'Catering & Food (کھانا اور ڈیکوریشن)',
    'Clothes & Bari / Jahez (کپڑے اور جہیز)',
    'Jewelry & Gold (زیورات)',
    'Photography & Video (فوٹوگرافی و ویڈیو)',
    'Transport & Rent a Car (گاڑیاں اور کرایہ)',
    'Salon & Makeup (سیلون اور میک اپ)',
    'Salami & Gifts (سلامی اور تحائف)',
    'Other Wedding (دیگر شادی اخراجات)',
  ],
  renovation: [
    'Labour / Mistri (مزدوری اور مستری)',
    'Tiles & Flooring (ٹائلز اور فرش)',
    'Paint & Polish (رنگ و پالش)',
    'Carpentry & Wood (کارپینٹر اور فرنیچر)',
    'Curtains & Blinds (پردے اور سجاوٹ)',
    'Hardware & Sanitary Fitting (ہارڈویئر اور فٹنگ)',
    'Other Renovation (دیگر مرمتی کام)',
  ],
  medical: [
    'Hospital & Doctor Fees (ہسپتال اور ڈاکٹر فیس)',
    'Medicines & Pharmacy (ادویات اور فارمیسی)',
    'Surgery & Operation (آپریشن اخراجات)',
    'Lab Tests & Scans (ٹیسٹ، ایکس رے، ایم آر آئی)',
    'Ambulance & Travel (ایمبولینس اور سفر)',
    'Other Medical (دیگر طبی اخراجات)',
  ],
  business: [
    'Raw Materials & Stock (خام مال اور مالِ تجارت)',
    'Equipment & Machinery (مشینری اور اوزار)',
    'Shop / Office Setup & Rent (دکان یا دفتر سیٹ اپ)',
    'Marketing, Signs & Ads (مارکیٹنگ اور تشہیر)',
    'Licensing & Registration (رجسٹریشن اور قانونی فیس)',
    'Other Business (دیگر تجارتی اخراجات)',
  ],
  other: [
    'General Expenses (عام خرچہ)',
    'Labour & Services (خدمات و مزدوری)',
    'Items & Purchases (سامان کی خریداری)',
    'Transport & Delivery (کرایہ اور ڈلیوری)',
    'Food & Refreshment (کھانا پینا اور تواضع)',
    'Miscellaneous (متفرق اخراجات)',
  ],
};

export const CATEGORIES = [
  { id: 'groceries', name: 'Groceries & Rashan / راشن', icon: 'ShoppingCart', color: 'text-amber-600 bg-amber-50' },
  { id: 'bills', name: 'Bills & Utilities / بلز', icon: 'Zap', color: 'text-rose-600 bg-rose-50' },
  { id: 'fuel', name: 'Fuel & Travel / سفر', icon: 'Car', color: 'text-blue-600 bg-blue-50' },
  { id: 'food', name: 'Food & Chai / کھانا', icon: 'Coffee', color: 'text-orange-600 bg-orange-50' },
  { id: 'health', name: 'Health & Medical / علاج', icon: 'HeartPulse', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'rent', name: 'House Rent / کرایہ', icon: 'Home', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'education', name: 'Education / فیس', icon: 'GraduationCap', color: 'text-cyan-600 bg-cyan-50' },
  { id: 'shopping', name: 'Shopping / خریداری', icon: 'ShoppingBag', color: 'text-pink-600 bg-pink-50' },
  { id: 'kameti', name: 'Kameti Payment / کمیٹی', icon: 'Users', color: 'text-purple-600 bg-purple-50' },
  { id: 'salary', name: 'Salary / تنخواہ', icon: 'Briefcase', color: 'text-emerald-700 bg-emerald-100' },
  { id: 'freelance', name: 'Freelance & Business', icon: 'Laptop', color: 'text-teal-700 bg-teal-100' },
  { id: 'other', name: 'Other / متفرق', icon: 'MoreHorizontal', color: 'text-slate-600 bg-slate-100' },
];
