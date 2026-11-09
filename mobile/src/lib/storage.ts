import {
  AccountBalance,
  Transaction,
  UdhaarEntry,
  KametiEntry,
  ProjectEntry,
  ProjectExpenseItem,
  ProjectType,
} from '../types';

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
}

export const PROJECT_TYPES_LIST: ProjectTypeMeta[] = [
  {
    type: 'construction',
    label: 'Makaan Tameer / Construction',
    labelUrdu: 'تعمیر مکان / عمارت',
    iconName: 'Building2',
  },
  {
    type: 'wedding',
    label: 'Wedding / Shadi Event',
    labelUrdu: 'شادی بیاہ',
    iconName: 'HeartHandshake',
  },
  {
    type: 'renovation',
    label: 'Home Renovation & Repair',
    labelUrdu: 'گھر کی تزئین و مرمت',
    iconName: 'Paintbrush',
  },
  {
    type: 'medical',
    label: 'Medical & Healthcare Treatment',
    labelUrdu: 'طبی علاج معالجہ',
    iconName: 'Activity',
  },
  {
    type: 'business',
    label: 'New Business / Startup Venture',
    labelUrdu: 'نیا کاروبار / پراجیکٹ',
    iconName: 'Briefcase',
  },
  {
    type: 'other',
    label: 'Special Event / Sub-Ledger',
    labelUrdu: 'خاص ایونٹ / دیگر کھاتہ',
    iconName: 'FolderKanban',
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
  { id: 'groceries', name: 'Groceries & Rashan / راشن', icon: 'ShoppingCart', color: '#d97706' },
  { id: 'bills', name: 'Bills & Utilities / بلز', icon: 'Zap', color: '#e11d48' },
  { id: 'fuel', name: 'Fuel & Travel / سفر', icon: 'Car', color: '#2563eb' },
  { id: 'food', name: 'Food & Chai / کھانا', icon: 'Coffee', color: '#ea580c' },
  { id: 'health', name: 'Health & Medical / علاج', icon: 'HeartPulse', color: '#059669' },
  { id: 'rent', name: 'House Rent / کرایہ', icon: 'Home', color: '#4f46e5' },
  { id: 'education', name: 'Education / فیس', icon: 'GraduationCap', color: '#0891b2' },
  { id: 'shopping', name: 'Shopping / خریداری', icon: 'ShoppingBag', color: '#db2777' },
  { id: 'kameti', name: 'Kameti Payment / کمیٹی', icon: 'Users', color: '#9333ea' },
  { id: 'salary', name: 'Salary / تنخواہ', icon: 'Briefcase', color: '#047857' },
  { id: 'freelance', name: 'Freelance & Business', icon: 'Laptop', color: '#0f766e' },
  { id: 'other', name: 'Other / متفرق', icon: 'MoreHorizontal', color: '#64748b' },
];

