import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConnected } from '../firebase';

export interface Medicine {
  id: string;
  commercialName: string; // الاسم التجاري العام (للتوافق)
  commercialNameAr?: string; // الاسم التجاري باللغة العربية
  commercialNameEn?: string; // الاسم التجاري باللغة الإنجليزية
  scientificName: string; // الاسم العلمي
  quantity: number; // الكمية المتوفرة
  entryDate?: string; // تاريخ إدخال الدواء
  expiryDate: string; // تاريخ انتهاء الصلاحية
  price: number; // السعر
  unit: 'علبة' | 'شريط' | 'حبة' | string; // الوحدة
  category: string; // الفئة العلاجية
  createdAt: string;
  updatedAt: string;
  manufacturer?: string; // الشركة المصنعة
  isControlled?: boolean; // دواء مقيد ومراقب (أدوية كنترول / خاضعة للرقابة لا يصرفها فني الصيدلة)
}

export interface DispenseRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineNameEn?: string;
  residentId?: string;
  residentName: string; // اسم المستفيد
  residentNameEn?: string; // اسم المستفيد بالإنجليزي
  quantityDispensed: number; // الكمية المطلوبة
  unit: string;
  totalPrice: number;
  actualQuantityDispensed: number; // الكمية المصروفة فعلياً للمراجعة
  dispensedBy: string; // اسم الصيدلي الصارف
  dispensedById: string;
  dispensedAt: string; // تاريخ الصرف
  doctorId?: string; // معرف الطبيب المعالج
  doctorName?: string; // اسم الطبيب بالعربي
  doctorNameEn?: string; // اسم الطبيب بالإنجليزي
  doctorSpecialty?: string; // تخصص الطبيب
}

export interface Doctor {
  id: string;
  nameAr: string;       // اسم الطبيب بالعربي
  nameEn: string;       // اسم الطبيب باللغة الإنجليزية
  specialty: string;    // التخصص
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  name: string;
  email: string;
  ipAddress: string;
  deviceToken: string;
  loginTime: string;
}

export interface ActiveSessionRecord {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastHeartbeat: string;
}

export interface StockAuditLog {
  id: string;
  medicineId: string;
  medicineName: string;
  actionType: 'إضافة دواء جديد' | 'تحديث كمية' | 'تعديل يدوي' | 'حذف دواء' | 'صرف دواء لمستفيد' | 'شطب ملف مستفيد' | 'إلغاء حساب مستخدم' | 'حذف شركة أدوية' | 'حذف سجل سلوكي' | string;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  performedByName: string;
  performedByEmail: string;
  performedById: string;
  notes: string;
  timestamp: string;
}

export interface SecuritySettings {
  id: string;
  emailEnabled: boolean;
  appsScriptUrl: string;
  notificationEmail: string;
  whatsAppEnabled: boolean;
  whatsAppMode: 'manual' | 'callmebot' | 'ultramsg' | 'wautopilot' | string;
  whatsAppNumber: string;
  callMeBotApiKey?: string;
  ultraMsgInstance?: string;
  ultraMsgToken?: string;
  waPilotBaseUrl?: string;
  waPilotApiKey?: string;
  waPilotType?: string;
  waPilotDevice?: string;
  waPilotPath?: string;
  alertDays?: number;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  id: "config",
  emailEnabled: true,
  appsScriptUrl: "AKfycbwES7mkB6q2gKtiKDbUOHIBZeLruWaE8zROrFasOHjtWXcsklq8yZZDRCDYQJVJVru4og/exec",
  notificationEmail: "tmrbe2006@gmail.com, rooq113@gmail.com, abdelrahim.mahjob@gmail.com",
  whatsAppEnabled: true,
  whatsAppMode: "manual",
  whatsAppNumber: "966502792157+, 201111256095",
  callMeBotApiKey: "",
  ultraMsgInstance: "",
  ultraMsgToken: "",
  waPilotBaseUrl: "https://wapilot.net",
  waPilotApiKey: "",
  waPilotType: "personal",
  waPilotDevice: "",
  waPilotPath: "/api/v1/api/messages",
  alertDays: 30,
  updatedAt: new Date().toISOString(),
  updatedBy: "م. تامر (المبرمج)"
};

// Initial realistic Arabic medicine inventory for a disability care center
const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    commercialName: "بنادول اكسترا",
    commercialNameAr: "بنادول اكسترا",
    commercialNameEn: "Panadol Extra",
    scientificName: "Paracetamol + Caffeine",
    quantity: 120,
    entryDate: "2026-09-20",
    expiryDate: "2026-10-15", // Expiring soon in ~20 days from current date (2026-09-23)
    price: 15.5,
    unit: "علبة",
    category: "مسكنات وآلام",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة الخليج للصناعات الدوائية (جلفار)"
  },
  {
    id: "med-2",
    commercialName: "أوجمنتين 1 جم",
    commercialNameAr: "أوجمنتين 1 جم",
    commercialNameEn: "Augmentin 1g",
    scientificName: "Amoxicillin + Clavulanic Acid",
    quantity: 45,
    entryDate: "2026-09-18",
    expiryDate: "2026-10-05", // Expiring very soon! ~12 days
    price: 85.0,
    unit: "علبة",
    category: "مضادات حيوية",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة نوفارتس العالمية (Novartis)"
  },
  {
    id: "med-3",
    commercialName: "بروفين 400 ملجم",
    commercialNameAr: "بروفين 400 ملجم",
    commercialNameEn: "Brufen 400mg",
    scientificName: "Ibuprofen",
    quantity: 80,
    entryDate: "2026-09-15",
    expiryDate: "2027-05-20",
    price: 18.0,
    unit: "شريط",
    category: "مضادات الالتهاب",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "الشركة السعودية للصناعات الدوائية (سبيماكو الدوائية)"
  },
  {
    id: "med-4",
    commercialName: "فنتولين بخاخ",
    commercialNameAr: "فنتولين بخاخ",
    commercialNameEn: "Ventolin Inhaler",
    scientificName: "Salbutamol Inhaler",
    quantity: 15,
    entryDate: "2026-09-10",
    expiryDate: "2026-11-30", // Near expiry ~2 months
    price: 24.5,
    unit: "علبة",
    category: "الجهاز التنفسي والأزمات",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة الخليج للصناعات الدوائية (جلفار)"
  },
  {
    id: "med-5",
    commercialName: "ديباكين كرونو 500 ملجم",
    commercialNameAr: "ديباكين كرونو 500 ملجم",
    commercialNameEn: "Depakine Chrono 500mg",
    scientificName: "Sodium Valproate",
    quantity: 60,
    entryDate: "2026-09-12",
    expiryDate: "2027-08-12",
    price: 110.0,
    unit: "علبة",
    category: "مضادات الصرع والتشنج",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "الشركة السعودية للصناعات الدوائية (سبيماكو الدوائية)",
    isControlled: true
  },
  {
    id: "med-6",
    commercialName: "لوراتادين 10 ملجم",
    commercialNameAr: "لوراتادين 10 ملجم",
    commercialNameEn: "Loratadine 10mg",
    scientificName: "Loratadine",
    quantity: 200,
    entryDate: "2026-09-22",
    expiryDate: "2026-10-22", // Expiring soon! ~30 days
    price: 12.0,
    unit: "حبة",
    category: "الحساسية ومضادات الهستامين",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة الخليج للصناعات الدوائية (جلفار)",
    isControlled: false
  },
  {
    id: "med-7",
    commercialName: "ريسبيردال 2 ملجم",
    commercialNameAr: "ريسبيردال 2 ملجم",
    commercialNameEn: "Risperdal 2mg",
    scientificName: "Risperidone",
    quantity: 35,
    entryDate: "2026-09-14",
    expiryDate: "2027-12-01",
    price: 150.0,
    unit: "علبة",
    category: "الرعاية النفسية والسلوكية",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة نوفارتس العالمية (Novartis)",
    isControlled: true
  },
  {
    id: "med-supply-1",
    commercialName: "شاش طبي معقم 10×10 سم",
    commercialNameAr: "شاش طبي معقم 10×10 سم",
    commercialNameEn: "Sterile Medical Gauze 10x10 cm",
    scientificName: "Sterile Absorbent Gauze Pad",
    quantity: 120,
    entryDate: "2026-09-10",
    expiryDate: "2028-12-30",
    price: 12.0,
    unit: "علبة",
    category: "Medical supplies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة الشرق الأوسط للمستلزمات الطبية"
  },
  {
    id: "med-supply-2",
    commercialName: "حقن طبية معقمة 5 مل",
    commercialNameAr: "حقن طبية معقمة 5 مل",
    commercialNameEn: "Disposable Syringes 5ml",
    scientificName: "Single-Use Sterile Syringe",
    quantity: 200,
    entryDate: "2026-09-12",
    expiryDate: "2028-06-15",
    price: 35.0,
    unit: "عبوة",
    category: "Medical supplies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "الشركة السعودية للصناعات الدوائية والمستلزمات (سبيماكو)"
  },
  {
    id: "med-supply-3",
    commercialName: "قفازات فحص طبية نيتريل معقمة",
    commercialNameAr: "قفازات فحص طبية نيتريل معقمة",
    commercialNameEn: "Nitrile Medical Exam Gloves",
    scientificName: "Powder-Free Nitrile Examination Gloves",
    quantity: 90,
    entryDate: "2026-09-08",
    expiryDate: "2029-01-20",
    price: 45.0,
    unit: "علبة",
    category: "Medical supplies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة الرياض للمستلزمات الطبية"
  },
  {
    id: "med-supply-4",
    commercialName: "قطن طبي ماص فائق النقاء",
    commercialNameAr: "قطن طبي ماص فائق النقاء",
    commercialNameEn: "Absorbent Medical Cotton Roll",
    scientificName: "100% Pure Absorbent Cotton",
    quantity: 75,
    entryDate: "2026-09-15",
    expiryDate: "2029-08-30",
    price: 18.0,
    unit: "لفة",
    category: "Medical supplies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "مصنع الرعاية الطبية الحديثة"
  },
  {
    id: "med-supply-5",
    commercialName: "لواصق جروح جراحية مضادة للميكروبات",
    commercialNameAr: "لواصق جروح جراحية مضادة للميكروبات",
    commercialNameEn: "Antimicrobial Surgical Plasters",
    scientificName: "Hypoallergenic Adhesive Bandage",
    quantity: 110,
    entryDate: "2026-09-05",
    expiryDate: "2028-10-10",
    price: 22.0,
    unit: "باكت",
    category: "Medical supplies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    manufacturer: "شركة الخليج للمستلزمات الطبية"
  }
];

const INITIAL_DISPENSES: DispenseRecord[] = [
  {
    id: "disp-1",
    medicineId: "med-1",
    medicineName: "بنادول اكسترا",
    medicineNameEn: "Panadol Extra",
    residentName: "أحمد عبد الله المري",
    residentNameEn: "Ahmed Abdullah Al-Marri",
    quantityDispensed: 2,
    unit: "علبة",
    totalPrice: 31.0,
    actualQuantityDispensed: 2,
    dispensedBy: "د. طارق اليوسف",
    dispensedById: "pharmacist-1",
    dispensedAt: "2026-09-22T10:30:00.000Z",
    doctorId: "doc-1",
    doctorName: "د. خالد السبيعي",
    doctorNameEn: "Dr. Khaled Al-Subaie",
    doctorSpecialty: "استشاري طب نفسي وعصبي"
  },
  {
    id: "disp-2",
    medicineId: "med-1",
    medicineName: "بنادول اكسترا",
    medicineNameEn: "Panadol Extra",
    residentName: "عبد الرحمن بن سليمان",
    residentNameEn: "Abdulrahman Bin Sulaiman",
    quantityDispensed: 1,
    unit: "علبة",
    totalPrice: 0.0,
    actualQuantityDispensed: 1,
    dispensedBy: "د. عبد الرحيم محمد محجوب",
    dispensedById: "pharmacist-2",
    dispensedAt: "2026-09-29T16:29:24.000Z",
    doctorId: "doc-2",
    doctorName: "د. عبد الله الشمري",
    doctorNameEn: "Dr. Abdullah Al-Shammari",
    doctorSpecialty: "استشاري باطنة وأمراض مزمنة"
  },
  {
    id: "disp-3",
    medicineId: "med-supply-1",
    medicineName: "شاش طبي معقم 10×10 سم",
    medicineNameEn: "Sterile Medical Gauze 10x10 cm",
    residentName: "أحمد عبد الله المري",
    residentNameEn: "Ahmed Abdullah Al-Marri",
    quantityDispensed: 15,
    unit: "علبة",
    totalPrice: 180.0,
    actualQuantityDispensed: 15,
    dispensedBy: "صيدلي المركز",
    dispensedById: "pharmacist-1",
    dispensedAt: "2026-10-01T09:15:00.000Z",
    doctorId: "doc-3",
    doctorName: "د. سارة المنصور",
    doctorNameEn: "Dr. Sara Al-Mansoor",
    doctorSpecialty: "أخصائية طب الأسرة ورعاية المستفيدين"
  },
  {
    id: "disp-4",
    medicineId: "med-supply-2",
    medicineName: "حقن طبية معقمة 5 مل",
    residentName: "سارة محمد العتيبي",
    residentNameEn: "Sara Mohammed Al-Otaibi",
    quantityDispensed: 25,
    unit: "عبوة",
    totalPrice: 875.0,
    actualQuantityDispensed: 25,
    dispensedBy: "صيدلي المركز",
    dispensedById: "pharmacist-1",
    dispensedAt: "2026-10-02T11:45:00.000Z",
    doctorId: "doc-1",
    doctorName: "د. خالد السبيعي",
    doctorNameEn: "Dr. Khaled Al-Subaie",
    doctorSpecialty: "استشاري طب نفسي وعصبي"
  }
];

export const getLocalMedicines = (): Medicine[] => {
  const data = localStorage.getItem('care_pharmacy_medicines');
  if (data === null) {
    // In production with Firebase or after clearing, never re-seed fake sample medicines
    return [];
  }
  try {
    const list: Medicine[] = JSON.parse(data);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalMedicines = (medicines: Medicine[]) => {
  localStorage.setItem('care_pharmacy_medicines', JSON.stringify(medicines));
};

export const getLocalDispenses = (): DispenseRecord[] => {
  const data = localStorage.getItem('care_pharmacy_dispenses');
  if (!data) {
    return [];
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveLocalDispenses = (dispenses: DispenseRecord[]) => {
  localStorage.setItem('care_pharmacy_dispenses', JSON.stringify(dispenses));
};

export const getLocalSessions = (): UserSession[] => {
  const data = localStorage.getItem('care_pharmacy_sessions');
  return data ? JSON.parse(data) : [];
};

export const saveLocalSessions = (sessions: UserSession[]) => {
  localStorage.setItem('care_pharmacy_sessions', JSON.stringify(sessions));
};

const INITIAL_STOCK_LOGS: StockAuditLog[] = [
  {
    id: "log-1",
    medicineId: "med-1",
    medicineName: "بنادول اكسترا (Paracetamol + Caffeine)",
    actionType: "إضافة دواء جديد",
    quantityChanged: 122,
    previousQuantity: 0,
    newQuantity: 122,
    performedByName: "مدير النظام",
    performedByEmail: "admin@carecenter.org",
    performedById: "admin-1",
    notes: "رصيد افتتاح لتهيئة مخزن الصيدلية",
    timestamp: "2026-09-20T08:00:00.000Z"
  },
  {
    id: "log-2",
    medicineId: "med-1",
    medicineName: "بنادول اكسترا (Paracetamol + Caffeine)",
    actionType: "صرف دواء لمستفيد",
    quantityChanged: -2,
    previousQuantity: 122,
    newQuantity: 120,
    performedByName: "صيدلي المركز",
    performedByEmail: "pharmacist@carecenter.org",
    performedById: "pharmacist-1",
    notes: "صرف علاج مجدول للمستفيد: أحمد عبد الله المري",
    timestamp: "2026-09-22T10:30:00.000Z"
  },
  {
    id: "log-3",
    medicineId: "med-5",
    medicineName: "ديباكين كرونو 500 ملجم (Sodium Valproate)",
    actionType: "إضافة دواء جديد",
    quantityChanged: 61,
    previousQuantity: 0,
    newQuantity: 61,
    performedByName: "مدير النظام",
    performedByEmail: "admin@carecenter.org",
    performedById: "admin-1",
    notes: "تغذية أصلية لمخزن أدوية الصرع والتشنجات",
    timestamp: "2026-09-20T08:15:00.000Z"
  },
  {
    id: "log-4",
    medicineId: "med-5",
    medicineName: "ديباكين كرونو 500 ملجم (Sodium Valproate)",
    actionType: "صرف دواء لمستفيد",
    quantityChanged: -1,
    previousQuantity: 61,
    newQuantity: 60,
    performedByName: "صيدلي المركز",
    performedByEmail: "pharmacist@carecenter.org",
    performedById: "pharmacist-1",
    notes: "صرف علاج مجدول للمستفيد: سارة محمد العتيبي",
    timestamp: "2026-09-23T08:15:00.000Z"
  }
];

export const getLocalStockLogs = (): StockAuditLog[] => {
  const data = localStorage.getItem('care_pharmacy_stock_logs');
  if (!data) {
    return [];
  }
  try {
    const list: StockAuditLog[] = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    return list.map(l => {
      if (l.performedByName === 'د. طارق اليوسف' || l.performedByName === 'دكتور يوسف طارق اليوسف') {
        return { ...l, performedByName: 'مدير سابق', performedByEmail: '' };
      }
      return l;
    });
  } catch {
    return [];
  }
};

export const saveLocalStockLogs = (logs: StockAuditLog[]) => {
  localStorage.setItem('care_pharmacy_stock_logs', JSON.stringify(logs));
};

export const getLocalSecuritySettings = (): SecuritySettings => {
  const localAlertDays = localStorage.getItem('care_pharmacy_alert_days');
  const data = localStorage.getItem('care_pharmacy_security_settings');
  let result = { ...DEFAULT_SECURITY_SETTINGS };
  if (data) {
    try {
      result = { ...result, ...JSON.parse(data) };
    } catch (e) {}
  }
  if (localAlertDays && !isNaN(Number(localAlertDays)) && Number(localAlertDays) >= 5) {
    result.alertDays = Number(localAlertDays);
  }
  return result;
};

export const saveLocalSecuritySettings = (settings: SecuritySettings) => {
  localStorage.setItem('care_pharmacy_security_settings', JSON.stringify(settings));
  // Keep legacy individual keys in sync for backward compatibility
  localStorage.setItem('emailEnabled', String(settings.emailEnabled));
  localStorage.setItem('appsScriptUrl', settings.appsScriptUrl);
  localStorage.setItem('notificationEmail', settings.notificationEmail);
  localStorage.setItem('whatsAppEnabled', String(settings.whatsAppEnabled));
  localStorage.setItem('whatsAppMode', settings.whatsAppMode);
  localStorage.setItem('whatsAppNumber', settings.whatsAppNumber);
  localStorage.setItem('callMeBotApiKey', settings.callMeBotApiKey || '');
  localStorage.setItem('ultraMsgInstance', settings.ultraMsgInstance || '');
  localStorage.setItem('ultraMsgToken', settings.ultraMsgToken || '');
  localStorage.setItem('waPilotBaseUrl', settings.waPilotBaseUrl || '');
  localStorage.setItem('waPilotApiKey', settings.waPilotApiKey || '');
  localStorage.setItem('waPilotType', settings.waPilotType || '');
  localStorage.setItem('waPilotDevice', settings.waPilotDevice || '');
  localStorage.setItem('waPilotPath', settings.waPilotPath || '');
  if (settings.alertDays && !isNaN(Number(settings.alertDays)) && Number(settings.alertDays) >= 5) {
    localStorage.setItem('care_pharmacy_alert_days', String(settings.alertDays));
  }
};

export const DEFAULT_UNITS: string[] = [
  'علبة',
  'شريط',
  'حبة',
  'قرص',
  'كبسولة',
  'أمبولة',
  'قارورة شراب',
  'بخاخ',
  'أنبوب مرهم',
  'قطرة',
  'تحميلة',
  'كيس فوار',
  'ملل'
];

export const DEFAULT_CATEGORIES: string[] = [
  'مسكنات وآلام',
  'أدوية نفسية وعصبية',
  'مضادات حيوية',
  'أمراض مزمنة',
  'جهاز هضمي',
  'جهاز تنفسي',
  'فيتامينات ومكملات',
  'أدوية صرع وتشنجات',
  'مراهم ومستحضرات موضعية',
  'Medical supplies',
  'أخرى'
];

export const isMedicalSuppliesCategory = (categoryName?: string): boolean => {
  if (!categoryName) return false;
  const clean = categoryName.trim().toLowerCase();
  return clean === 'medical supplies' || 
         clean === 'medical supply' || 
         clean === 'medical_supplies' || 
         clean === 'medicalsupplies' || 
         clean.includes('medical supplies') ||
         clean === 'مستلزمات طبية' || 
         clean === 'المستلزمات الطبية' ||
         clean.includes('مستلزمات طبية') ||
         clean.includes('مستلزمات');
};

export const getLocalUnits = (): string[] => {
  const saved = localStorage.getItem('care_pharmacy_custom_units');
  return saved ? JSON.parse(saved) : DEFAULT_UNITS;
};

export const saveLocalUnits = (units: string[]): void => {
  localStorage.setItem('care_pharmacy_custom_units', JSON.stringify(units));
};

export const getLocalCategories = (): string[] => {
  const saved = localStorage.getItem('care_pharmacy_custom_categories');
  return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
};

export const saveLocalCategories = (categories: string[]): void => {
  localStorage.setItem('care_pharmacy_custom_categories', JSON.stringify(categories));
};

export const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    nameAr: "د. خالد السبيعي",
    nameEn: "Dr. Khaled Al-Subaie",
    specialty: "استشاري طب نفسي وعصبي",
    phone: "+966501112233",
    email: "dr.khaled@carecenter.org",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "doc-2",
    nameAr: "د. عبد الله الشمري",
    nameEn: "Dr. Abdullah Al-Shammari",
    specialty: "استشاري باطنة وأمراض مزمنة",
    phone: "+966502223344",
    email: "dr.abdullah@carecenter.org",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "doc-3",
    nameAr: "د. سارة المنصور",
    nameEn: "Dr. Sara Al-Mansoor",
    specialty: "أخصائية طب الأسرة ورعاية المستفيدين",
    phone: "+966503334455",
    email: "dr.sara@carecenter.org",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "doc-4",
    nameAr: "د. محمد القحطاني",
    nameEn: "Dr. Mohammed Al-Qahtani",
    specialty: "استشاري أطفال وتأهيل حركي",
    phone: "+966504445566",
    email: "dr.mohammed@carecenter.org",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z"
  }
];

export const getLocalDoctors = (): Doctor[] => {
  const saved = localStorage.getItem('care_pharmacy_doctors');
  return saved ? JSON.parse(saved) : DEFAULT_DOCTORS;
};

export const saveLocalDoctors = (doctors: Doctor[]): void => {
  localStorage.setItem('care_pharmacy_doctors', JSON.stringify(doctors));
};

export const INITIAL_RESIDENTS = [
  {
    id: "res-0",
    name: "أحمد عبد الله المري",
    nameAr: "أحمد عبد الله المري",
    nameEn: "Ahmed Abdullah Al-Marri",
    birthDate: "1960-03-12",
    referralDate: "2025-01-15",
    referralFacility: "مستشفى شقراء العام - عيادة الرعاية المتخصصة",
    referralReason: "متابعة دورية وتأهيل شامل وتنسيق صرف العلاج",
    roomNumber: "غرفة 101 - جناح أ",
    nationalId: "1076543219",
    age: 66,
    notes: "مستفيد يحتاج رعاية ومتابعة منتظمة لجرعات الصرف",
    allergies: "لا توجد حساسية معروفة",
    bloodGroup: "A+",
    attendingPhysician: "د. طارق اليوسف",
    chronicDiseases: "آلام المفاصل المزمنة",
    dosageSchedule: []
  },
  {
    id: "res-1",
    name: "عبد الرحمن بن سليمان",
    nameAr: "عبد الرحمن بن سليمان",
    nameEn: "Abdulrahman Bin Sulaiman",
    birthDate: "1954-05-14",
    referralDate: "2026-10-11",
    referralFacility: "مستشفى شقراء العام - عيادة الرعاية المتخصصة",
    referralReason: "متابعة استشارية دورية وفحص سريري شامل وتنسيق صرف الأدوية",
    roomNumber: "غرفة 102 - جناح أ",
    nationalId: "1098234812",
    age: 72,
    notes: "يعاني من ضغط الدم المرتفع وحساسية خفيفة من البنسلين",
    allergies: "البنسلين، المكسرات",
    bloodGroup: "O+",
    attendingPhysician: "طبيب المركز المشرف",
    chronicDiseases: "ارتفاع ضغط الدم المزمن",
    dosageSchedule: [
      {
        id: "dose-1",
        timeSlot: "08:00",
        medicineId: "med-1",
        medicineName: "بنادول اكسترا",
        dosage: "حبة واحدة بعد الإفطار لآلام الظهر",
        checkedToday: false
      },
      {
        id: "dose-2",
        timeSlot: "21:00",
        medicineId: "med-5",
        medicineName: "ديباكين كرونو 500 ملجم",
        dosage: "حبة واحدة قبل النوم لضبط نوبات الصرع والتشنج",
        checkedToday: true,
        checkedBy: "طبيب المركز المشرف",
        checkedAt: "2026-09-24T08:30:00Z"
      }
    ]
  },
  {
    id: "res-2",
    name: "سارة محمد الشمري",
    nameAr: "سارة محمد الشمري",
    nameEn: "Sara Mohammed Al-Shammari",
    birthDate: "1958-08-20",
    referralDate: "2024-04-10",
    roomNumber: "غرفة 105 - جناح أ",
    nationalId: "1087452391",
    age: 68,
    notes: "بحاجة لمراقبة نسبة السكر بانتظام",
    allergies: "لا توجد عوارض حساسية معروفة",
    dosageSchedule: [
      {
        id: "dose-3",
        timeSlot: "13:00",
        medicineId: "med-3",
        medicineName: "بروفين 400 ملجم",
        dosage: "حبة واحدة بعد الغداء عند اللزوم لتخفيف الالتهاب",
        checkedToday: false
      }
    ]
  },
  {
    id: "res-3",
    name: "خالد عبد الله العتيبي",
    nameAr: "خالد عبد الله العتيبي",
    nameEn: "Khalid Abdullah Al-Otaibi",
    birthDate: "1946-10-18",
    referralDate: "2023-11-20",
    roomNumber: "غرفة 201 - جناح ب",
    nationalId: "1034981273",
    age: 80,
    notes: "صعوبة في بلع الأقراص الكبيرة - يفضل الشراب أو المسحوق",
    allergies: "مضادات السلفا (Sulfa Drugs)",
    dosageSchedule: [
      {
        id: "dose-4",
        timeSlot: "08:00",
        medicineId: "med-4",
        medicineName: "فنتولين بخاخ",
        dosage: "بختان صباحاً عند حدوث ضيق بالتنفس لتوسيع الشعب الهوائية",
        checkedToday: false
      }
    ]
  }
];

export const INITIAL_COMPANIES = [
  {
    id: "comp-1",
    name: "شركة الخليج للصناعات الدوائية (جلفار)",
    country: "الإمارات العربية المتحدة",
    contactPerson: "أ. عمر الحوسني",
    phone: "+97172461461",
    email: "info@julphar.net",
    notes: "الوكيل الرئيسي لمسكنات الآلام والمضادات الحيوية بالشرق الأوسط"
  },
  {
    id: "comp-2",
    name: "الشركة السعودية للصناعات الدوائية (سبيماكو الدوائية)",
    country: "المملكة العربية السعودية",
    contactPerson: "د. فيصل العتيبي",
    phone: "+966114774481",
    email: "contact@spimaco.com.sa",
    notes: "المصنع الوطني الأساسي للأدوية المضادة للصرع والاضطرابات السلوكية"
  },
  {
    id: "comp-3",
    name: "شركة نوفارتس العالمية (Novartis)",
    country: "سويسرا",
    contactPerson: "م. سيمون لوران",
    phone: "+41613241111",
    email: "swiss.support@novartis.com",
    notes: "الشركة المصنعة لعقارات ريسبيردال والعلاجات النفسية التخصصية المستوردة"
  }
];

export const INITIAL_BEHAVIOR_LOGS = [
  {
    id: "blog-1",
    residentId: "res-1",
    residentName: "عبد الرحمن بن سليمان",
    loggedAt: "2026-09-24T14:30:00Z",
    loggedBy: "أخصائي الرعاية",
    behaviorRating: "stable",
    sideEffects: ["drowsiness"],
    severity: "mild",
    recentMedicineId: "med-5",
    recentMedicineName: "ديباكين كرونو 500 ملجم",
    notes: "خمول خفيف بعد تناول الجرعة المسائية من الديباكين، لكن السلوك العام مستقر والمريض هادئ."
  },
  {
    id: "blog-2",
    residentId: "res-2",
    residentName: "سارة محمد الشمري",
    loggedAt: "2026-09-24T18:00:00Z",
    loggedBy: "صيدلي. كريم القحطاني",
    behaviorRating: "anxious",
    sideEffects: ["insomnia"],
    severity: "moderate",
    recentMedicineId: "med-3",
    recentMedicineName: "بروفين 400 ملجم",
    notes: "قلق وصعوبة في النوم بعد تناول البروفين، تم توجيه الممرض بتقديمه مبكراً بعد الغداء مباشرة."
  }
];

export const INITIAL_CUSTOM_SIDE_EFFECTS = [
  { key: 'drowsiness', label: 'خمول ونعاس حاد 😴' },
  { key: 'appetite_loss', label: 'فقدان شهية واهتمام 🍽️' },
  { key: 'tremors', label: 'ارتعاش ورجفة بالأطراف 🫨' },
  { key: 'rash', label: 'طفح جلدي وحساسية 🔴' },
  { key: 'nausea', label: 'غثيان واضطراب معدة 🤢' },
  { key: 'insomnia', label: 'أرق وصعوبة نوم حادة ⏰' }
];

export const getLocalResidents = (): any[] => {
  const saved = localStorage.getItem('care_pharmacy_residents');
  if (saved === null) {
    if (localStorage.getItem('care_pharmacy_seeded')) return [];
    return INITIAL_RESIDENTS;
  }
  try {
    const list = JSON.parse(saved);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveLocalResidents = (residents: any[]): void => {
  localStorage.setItem('care_pharmacy_residents', JSON.stringify(residents));
};

export const getLocalCompanies = (): any[] => {
  const saved = localStorage.getItem('care_pharmacy_companies');
  if (saved === null) {
    if (localStorage.getItem('care_pharmacy_seeded')) return [];
    return INITIAL_COMPANIES;
  }
  try {
    const list = JSON.parse(saved);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveLocalCompanies = (companies: any[]): void => {
  localStorage.setItem('care_pharmacy_companies', JSON.stringify(companies));
};

export const getLocalBehaviorLogs = (): any[] => {
  const saved = localStorage.getItem('care_pharmacy_behavior_logs');
  if (saved === null) {
    if (localStorage.getItem('care_pharmacy_seeded')) return [];
    return INITIAL_BEHAVIOR_LOGS;
  }
  try {
    const list = JSON.parse(saved);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveLocalBehaviorLogs = (logs: any[]): void => {
  localStorage.setItem('care_pharmacy_behavior_logs', JSON.stringify(logs));
};

export const getLocalCustomSideEffects = (): { key: string; label: string }[] => {
  const saved = localStorage.getItem('care_pharmacy_custom_side_effects');
  return saved ? JSON.parse(saved) : INITIAL_CUSTOM_SIDE_EFFECTS;
};

export const saveLocalCustomSideEffects = (effects: { key: string; label: string }[]): void => {
  localStorage.setItem('care_pharmacy_custom_side_effects', JSON.stringify(effects));
};

export const getLocalBatches = (): any[] => {
  const saved = localStorage.getItem('care_pharmacy_batches');
  if (!saved) return [];
  try {
    const list = JSON.parse(saved);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveLocalBatches = (batches: any[]): void => {
  localStorage.setItem('care_pharmacy_batches', JSON.stringify(batches));
};

// Helper to prevent Firestore operations from hanging indefinitely
export const withTimeout = <T>(promise: Promise<T>, ms: number = 10000): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// Unified CRUD Service with Firebase support and clean LocalStorage fallback
export const DbService = {
  // --- Medicines CRUD ---
  async fetchMedicines(): Promise<Medicine[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "medicines")), 10000);
        const list: Medicine[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Medicine);
        });
        
        saveLocalMedicines(list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetchMedicines failed/timed out, returning offline cache:", e);
    }
    return getLocalMedicines();
  },

  async addMedicine(med: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>, actor?: { name: string; email: string; id: string; notes?: string }): Promise<Medicine> {
    const commercialAr = (med.commercialNameAr || med.commercialName || '').trim();
    const commercialEn = (med.commercialNameEn || '').trim();
    const primaryName = commercialAr || commercialEn || med.commercialName || '';
    const entryDate = med.entryDate || new Date().toISOString().split('T')[0];

    const newMed: Medicine = {
      ...med,
      id: "med-" + Math.random().toString(36).substr(2, 9),
      commercialName: primaryName,
      commercialNameAr: commercialAr || primaryName,
      commercialNameEn: commercialEn,
      entryDate: entryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Attempt Firebase write
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "medicines", newMed.id), {
          commercialName: newMed.commercialName,
          commercialNameAr: newMed.commercialNameAr,
          commercialNameEn: newMed.commercialNameEn,
          scientificName: newMed.scientificName,
          quantity: newMed.quantity,
          entryDate: newMed.entryDate,
          expiryDate: newMed.expiryDate,
          price: newMed.price,
          unit: newMed.unit,
          category: newMed.category || "عام",
          createdAt: newMed.createdAt,
          updatedAt: newMed.updatedAt,
          manufacturer: newMed.manufacturer || '',
          isControlled: !!newMed.isControlled
        });
      }
    } catch (e) {
      console.warn("Firestore addMedicine failed, falling back to LocalStorage:", e);
    }

    // Always keep LocalStorage in sync
    const list = getLocalMedicines();
    list.unshift(newMed);
    saveLocalMedicines(list);

    // Create Audit Log
    const displayMedName = newMed.commercialNameEn 
      ? `${newMed.commercialName} / ${newMed.commercialNameEn} (${newMed.scientificName})`
      : `${newMed.commercialName} (${newMed.scientificName})`;

    await this.addStockLog({
      medicineId: newMed.id,
      medicineName: displayMedName,
      actionType: 'إضافة دواء جديد',
      quantityChanged: newMed.quantity,
      previousQuantity: 0,
      newQuantity: newMed.quantity,
      performedByName: actor?.name || "مستخدم النظام",
      performedByEmail: actor?.email || "",
      performedById: actor?.id || "",
      notes: actor?.notes || "إدخال صنف دواء جديد للمخزن"
    });

    return newMed;
  },

  async updateMedicine(id: string, updatedFields: Partial<Medicine>, actor?: { name: string; email: string; id: string; notes?: string }): Promise<Medicine> {
    const list = getLocalMedicines();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) throw new Error("الدواء غير موجود");

    const previousQuantity = list[index].quantity;
    const commercialAr = updatedFields.commercialNameAr !== undefined 
      ? updatedFields.commercialNameAr 
      : (updatedFields.commercialName || list[index].commercialNameAr || list[index].commercialName);
    const commercialEn = updatedFields.commercialNameEn !== undefined
      ? updatedFields.commercialNameEn
      : (list[index].commercialNameEn || '');
    const primaryName = commercialAr || updatedFields.commercialName || list[index].commercialName;

    const updatedMed: Medicine = {
      ...list[index],
      ...updatedFields,
      commercialName: primaryName,
      commercialNameAr: commercialAr,
      commercialNameEn: commercialEn,
      entryDate: updatedFields.entryDate || list[index].entryDate || (list[index].createdAt ? list[index].createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      isControlled: updatedFields.isControlled !== undefined ? updatedFields.isControlled : list[index].isControlled,
      updatedAt: new Date().toISOString()
    };

    // Attempt Firebase write
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "medicines", id), {
          commercialName: updatedMed.commercialName,
          commercialNameAr: updatedMed.commercialNameAr || '',
          commercialNameEn: updatedMed.commercialNameEn || '',
          scientificName: updatedMed.scientificName,
          quantity: updatedMed.quantity,
          entryDate: updatedMed.entryDate || '',
          expiryDate: updatedMed.expiryDate,
          price: updatedMed.price,
          unit: updatedMed.unit,
          category: updatedMed.category || "عام",
          createdAt: updatedMed.createdAt,
          updatedAt: updatedMed.updatedAt,
          manufacturer: updatedMed.manufacturer || '',
          isControlled: !!updatedMed.isControlled
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore updateMedicine failed, falling back to LocalStorage:", e);
    }

    list[index] = updatedMed;
    saveLocalMedicines(list);

    // Log quantity change if any
    const quantityDifference = updatedMed.quantity - previousQuantity;
    if (quantityDifference !== 0) {
      await this.addStockLog({
        medicineId: updatedMed.id,
        medicineName: `${updatedMed.commercialName} (${updatedMed.scientificName})`,
        actionType: 'تعديل يدوي',
        quantityChanged: quantityDifference,
        previousQuantity,
        newQuantity: updatedMed.quantity,
        performedByName: actor?.name || "مستخدم النظام",
        performedByEmail: actor?.email || "",
        performedById: actor?.id || "",
        notes: actor?.notes || "تعديل كمية المخزون يدوياً"
      });
    } else if (actor?.notes) {
      await this.addStockLog({
        medicineId: updatedMed.id,
        medicineName: `${updatedMed.commercialName} (${updatedMed.scientificName})`,
        actionType: 'تعديل يدوي',
        quantityChanged: 0,
        previousQuantity,
        newQuantity: updatedMed.quantity,
        performedByName: actor?.name || "مستخدم النظام",
        performedByEmail: actor?.email || "",
        performedById: actor?.id || "",
        notes: actor.notes
      });
    }

    return updatedMed;
  },

  async deleteMedicine(id: string, actor?: { name: string; email: string; id: string; notes?: string }): Promise<boolean> {
    const list = getLocalMedicines();
    const targetMed = list.find(m => m.id === id);

    // Attempt Firebase delete
    try {
      if (isFirebaseConnected) {
        await withTimeout(deleteDoc(doc(db, "medicines", id)), 8000);
      }
    } catch (e) {
      console.warn("Firestore deleteMedicine failed, falling back to LocalStorage:", e);
    }

    const filtered = list.filter(m => m.id !== id);
    saveLocalMedicines(filtered);

    if (targetMed) {
      // Create Audit Log
      await this.addStockLog({
        medicineId: targetMed.id,
        medicineName: targetMed.commercialNameEn ? `${targetMed.commercialName} / ${targetMed.commercialNameEn} (${targetMed.scientificName})` : `${targetMed.commercialName} (${targetMed.scientificName})`,
        actionType: 'حذف دواء',
        quantityChanged: -targetMed.quantity,
        previousQuantity: targetMed.quantity,
        newQuantity: 0,
        performedByName: actor?.name || "مستخدم النظام",
        performedByEmail: actor?.email || "",
        performedById: actor?.id || "",
        notes: actor?.notes || "شطب الصنف نهائياً وحذفه من السجلات"
      });
    }

    return true;
  },

  // --- Dispense Records ---
  async fetchDispenseRecords(): Promise<DispenseRecord[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "dispense_records")), 10000);
        const list: DispenseRecord[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as DispenseRecord);
        });

        saveLocalDispenses(list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetchDispenseRecords failed/timed out, returning offline cache:", e);
    }
    return getLocalDispenses();
  },

  async addDispenseRecord(rec: Omit<DispenseRecord, 'id' | 'dispensedAt'>): Promise<DispenseRecord> {
    const newRec: DispenseRecord = {
      ...rec,
      id: "disp-" + Math.random().toString(36).substr(2, 9),
      dispensedAt: new Date().toISOString()
    };

    // 1. Subtract from inventory quantity immediately in local storage (inventory integrity!)
    const medList = getLocalMedicines();
    const medIndex = medList.findIndex(m => m.id === rec.medicineId);
    let previousQuantity = 0;
    let newQty = 0;
    let targetMed: Medicine | null = null;

    if (medIndex !== -1) {
      targetMed = medList[medIndex];
      previousQuantity = targetMed.quantity;
      // Safeguard quantity subtraction with precision rounding to 4 decimal places
      newQty = Math.max(0, Math.round((previousQuantity - rec.actualQuantityDispensed) * 10000) / 10000);
      medList[medIndex].quantity = newQty;
      medList[medIndex].updatedAt = new Date().toISOString();
      saveLocalMedicines(medList);

      // Attempt syncing medicine reduction to Firebase in non-blocking background
      if (isFirebaseConnected) {
        withTimeout(
          setDoc(doc(db, "medicines", rec.medicineId), {
            quantity: newQty,
            updatedAt: medList[medIndex].updatedAt
          }, { merge: true }),
          2500
        ).catch(e => {
          console.warn("Firestore inventory sync background warning:", e);
        });
      }
    }

    // 2. Immediately save dispense record locally
    const list = getLocalDispenses();
    list.unshift(newRec);
    saveLocalDispenses(list);

    // 3. Attempt syncing dispense record to Firebase in non-blocking background
    if (isFirebaseConnected) {
      withTimeout(
        setDoc(doc(db, "dispense_records", newRec.id), {
          medicineId: newRec.medicineId,
          medicineName: newRec.medicineName,
          medicineNameEn: newRec.medicineNameEn || '',
          residentId: newRec.residentId || '',
          residentName: newRec.residentName,
          residentNameEn: newRec.residentNameEn || '',
          quantityDispensed: newRec.quantityDispensed,
          unit: newRec.unit,
          totalPrice: newRec.totalPrice,
          actualQuantityDispensed: newRec.actualQuantityDispensed,
          dispensedBy: newRec.dispensedBy,
          dispensedById: newRec.dispensedById,
          dispensedAt: newRec.dispensedAt
        }),
        2500
      ).catch(e => {
        console.warn("Firestore addDispenseRecord background warning:", e);
      });
    }

    // 4. Automatically record an Audit Log for the dispensing
    if (targetMed) {
      this.addStockLog({
        medicineId: targetMed.id,
        medicineName: `${targetMed.commercialName} (${targetMed.scientificName})`,
        actionType: 'صرف دواء لمستفيد',
        quantityChanged: -rec.actualQuantityDispensed,
        previousQuantity,
        newQuantity: newQty,
        performedByName: rec.dispensedBy,
        performedByEmail: "pharmacist@carecenter.com",
        performedById: rec.dispensedById,
        notes: `صرف علاج للمستفيد: ${rec.residentName}`
      }).catch(err => console.warn("Stock log warning:", err));
    }

    return newRec;
  },

  // --- Security Sessions CRUD ---
  async fetchSessions(): Promise<UserSession[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "user_sessions")), 10000);
        if (!querySnapshot.empty) {
          const list: UserSession[] = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as UserSession);
          });
          saveLocalSessions(list);
          return list;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchSessions failed/timed out, returning local storage:", e);
    }
    return getLocalSessions();
  },

  async logSession(session: Omit<UserSession, 'id'>): Promise<UserSession> {
    const newSession: UserSession = {
      ...session,
      id: "sess-" + Math.random().toString(36).substr(2, 9)
    };

    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "user_sessions", newSession.id), {
          userId: newSession.userId,
          name: newSession.name,
          email: newSession.email,
          ipAddress: newSession.ipAddress,
          deviceToken: newSession.deviceToken,
          loginTime: newSession.loginTime
        });
      }
    } catch (e) {
      console.warn("Firestore logSession failed, saving locally:", e);
    }

    const list = getLocalSessions();
    list.unshift(newSession);
    saveLocalSessions(list);
    return newSession;
  },

  // --- Single Active Session Enforcement (منع تسجيل الدخول المتزامن لنفس الحساب) ---
  getLocalActiveSessions(): Record<string, ActiveSessionRecord> {
    try {
      const raw = localStorage.getItem('care_pharmacy_active_sessions');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  saveActiveSessionLocally(session: ActiveSessionRecord) {
    const sessions = this.getLocalActiveSessions();
    sessions[session.userEmail.trim().toLowerCase()] = session;
    try {
      localStorage.setItem('care_pharmacy_active_sessions', JSON.stringify(sessions));
    } catch (e) {}
  },

  async claimActiveSession(session: ActiveSessionRecord, force: boolean = false): Promise<{ success: boolean; conflict?: boolean; activeSession?: ActiveSessionRecord; session?: ActiveSessionRecord }> {
    const cleanEmail = session.userEmail.trim().toLowerCase();
    const now = Date.now();
    const EXPIRY_MS = 90000; // 90 seconds timeout for stale sessions

    // Authoritative bypass for Developer and Admin:
    // Developer (tmrbe2006@gmail.com) and Admin have instant takeover rights to terminate any stale/lingering sessions
    const isPrivileged = cleanEmail === 'tmrbe2006@gmail.com' || session.userRole === 'developer' || session.userRole === 'admin';
    const effectiveForce = force || isPrivileged;

    const fullSessionRecord = {
      ...session,
      userEmail: cleanEmail,
      lastHeartbeat: new Date().toISOString(),
      lastHeartbeatMs: now,
      displaced: false
    };

    // FAST PATH: For privileged users (Developer & Admin) or forced takeover, never block UI or wait for remote network!
    if (effectiveForce) {
      // 1. Immediately register locally
      const localSessions = this.getLocalActiveSessions();
      localSessions[cleanEmail] = fullSessionRecord;
      try {
        localStorage.setItem('care_pharmacy_active_sessions', JSON.stringify(localSessions));
      } catch (e) {}

      // 2. Fire-and-forget sync to Firestore in background
      if (isFirebaseConnected) {
        withTimeout(setDoc(doc(db, "active_sessions", cleanEmail), fullSessionRecord), 4000)
          .catch(e => console.warn("Background Firestore session sync:", e));
      }

      // 3. Fire-and-forget sync to server in background
      try {
        fetch('/api/sessions/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            userId: session.userId,
            userName: session.userName,
            userRole: session.userRole,
            sessionId: session.sessionId,
            force: true
          }),
          signal: (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) ? (AbortSignal as any).timeout(2500) : undefined
        }).catch(() => {});
      } catch (e) {}

      return { success: true, session: fullSessionRecord };
    }

    // REGULAR PATH (for non-privileged roles): check conflicts with strict 2-second timeout
    if (isFirebaseConnected) {
      try {
        const sessionRef = doc(db, "active_sessions", cleanEmail);
        const snap = await withTimeout(getDoc(sessionRef), 2000);
        if (snap && snap.exists()) {
          const remoteData = snap.data() as any;
          if (remoteData && remoteData.sessionId && remoteData.sessionId !== session.sessionId) {
            const lastHb = typeof remoteData.lastHeartbeatMs === 'number'
              ? remoteData.lastHeartbeatMs
              : (remoteData.lastHeartbeat ? new Date(remoteData.lastHeartbeat).getTime() : 0);

            if (now - lastHb < EXPIRY_MS) {
              return {
                success: false,
                conflict: true,
                activeSession: {
                  sessionId: remoteData.sessionId,
                  userId: remoteData.userId || '',
                  userName: remoteData.userName || cleanEmail,
                  userEmail: cleanEmail,
                  userRole: remoteData.userRole || '',
                  ipAddress: remoteData.ipAddress || '127.0.0.1',
                  userAgent: remoteData.userAgent || 'متصفح / جهاز آخر',
                  loginTime: remoteData.loginTime || new Date().toISOString(),
                  lastHeartbeat: remoteData.lastHeartbeat || new Date().toISOString()
                }
              };
            }
          }
        }
      } catch (err) {
        console.warn("Firestore session check error:", err);
      }
    }

    // Server API check with 2s timeout
    try {
      const res = await fetch('/api/sessions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          userId: session.userId,
          userName: session.userName,
          userRole: session.userRole,
          sessionId: session.sessionId,
          force: false
        }),
        signal: (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) ? (AbortSignal as any).timeout(2000) : undefined
      });
      if (!res.ok && res.status === 409) {
        const data = await res.json();
        return { success: false, conflict: true, activeSession: data.activeSession };
      }
    } catch (e) {}

    // LocalStorage check
    const localSessions = this.getLocalActiveSessions();
    const existing = localSessions[cleanEmail];
    if (existing && existing.sessionId !== session.sessionId) {
      const lastHb = new Date(existing.lastHeartbeat).getTime();
      if (now - lastHb < EXPIRY_MS) {
        return {
          success: false,
          conflict: true,
          activeSession: existing
        };
      }
    }

    // Register locally
    localSessions[cleanEmail] = fullSessionRecord;
    try {
      localStorage.setItem('care_pharmacy_active_sessions', JSON.stringify(localSessions));
    } catch (e) {}

    // Firestore registration in background
    if (isFirebaseConnected) {
      withTimeout(setDoc(doc(db, "active_sessions", cleanEmail), fullSessionRecord), 4000)
        .catch(e => console.warn("Failed background setDoc in Firestore:", e));
    }

    return { success: true, session: fullSessionRecord };
  },

  async heartbeatActiveSession(email: string, sessionId: string): Promise<{ active: boolean; displaced?: boolean; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();

    // 1. Authoritative Firestore check & heartbeat
    if (isFirebaseConnected) {
      try {
        const sessionRef = doc(db, "active_sessions", cleanEmail);
        const snap = await getDoc(sessionRef);
        if (snap.exists()) {
          const remote = snap.data() as any;
          if (remote.sessionId !== sessionId || remote.displaced) {
            return {
              active: false,
              displaced: true,
              message: 'تم تسجيل الدخول لهذا الحساب من متصفح أو جهاز آخر، وتم إنهاء هذه الجلسة تلقائياً لحماية سرية البيانات الدوائية.'
            };
          }
          // Update remote heartbeat
          await setDoc(sessionRef, {
            lastHeartbeat: new Date().toISOString(),
            lastHeartbeatMs: now
          }, { merge: true });
        } else {
          // Document does not exist, re-register active session
          await setDoc(sessionRef, {
            sessionId,
            userEmail: cleanEmail,
            lastHeartbeat: new Date().toISOString(),
            lastHeartbeatMs: now,
            displaced: false
          }, { merge: true });
        }
      } catch (e) {
        console.warn("Firestore heartbeat check failed:", e);
      }
    }

    // 2. Try server
    try {
      const res = await fetch('/api/sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, sessionId })
      });
      const data = await res.json();
      if (data && data.reason === 'displaced') {
        return { active: false, displaced: true, message: data.message };
      }
      if (data && data.active) {
        return { active: true };
      }
    } catch (e) {}

    // 3. Local fallback
    const localSessions = this.getLocalActiveSessions();
    const existing = localSessions[cleanEmail];
    if (existing && existing.sessionId === sessionId) {
      existing.lastHeartbeat = new Date().toISOString();
      localSessions[cleanEmail] = existing;
      try {
        localStorage.setItem('care_pharmacy_active_sessions', JSON.stringify(localSessions));
      } catch (e) {}
      return { active: true };
    } else if (existing && existing.sessionId !== sessionId) {
      return { active: false, displaced: true, message: 'تم فتح الحساب من جهاز أو نافذة أخرى.' };
    }
    return { active: true };
  },

  async releaseActiveSession(email: string, sessionId: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Delete from Firestore
    if (isFirebaseConnected) {
      try {
        const sessionRef = doc(db, "active_sessions", cleanEmail);
        const snap = await getDoc(sessionRef);
        if (snap.exists()) {
          const data = snap.data();
          if (!sessionId || data.sessionId === sessionId) {
            await deleteDoc(sessionRef);
          }
        }
      } catch (e) {}
    }

    // 2. Server release
    try {
      fetch('/api/sessions/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, sessionId })
      }).catch(() => {});
    } catch (e) {}

    // 3. Local release
    const localSessions = this.getLocalActiveSessions();
    if (localSessions[cleanEmail] && (!sessionId || localSessions[cleanEmail].sessionId === sessionId)) {
      delete localSessions[cleanEmail];
      try {
        localStorage.setItem('care_pharmacy_active_sessions', JSON.stringify(localSessions));
      } catch (e) {}
    }
  },

  // Real-time listener for instant cross-browser displacement with Grace Period
  subscribeToActiveSession(email: string, currentSessionId: string, onDisplaced: (msg: string) => void): (() => void) {
    const cleanEmail = email.trim().toLowerCase();
    if (!isFirebaseConnected) return () => {};

    const subscriptionTime = Date.now();
    let hasAcknowledgedCurrent = false;

    try {
      const unsub = onSnapshot(doc(db, "active_sessions", cleanEmail), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.sessionId) {
            if (data.sessionId === currentSessionId) {
              // Current session is verified and active in Firestore
              hasAcknowledgedCurrent = true;
            } else {
              // Different session ID detected
              const elapsed = Date.now() - subscriptionTime;
              // Grace period: within 4 seconds of subscription, if current session has not been acknowledged yet,
              // ignore stale/cached snapshots from prior sessions to allow new session registration to settle.
              if (!hasAcknowledgedCurrent && elapsed < 4000) {
                return;
              }
              onDisplaced('تم تسجيل الدخول لهذا الحساب من متصفح أو جهاز آخر، وتم إنهاء هذه الجلسة تلقائياً لمنع ازدواجية الدخول.');
            }
          }
        }
      }, (err) => {
        console.warn("Session snapshot listener warning:", err);
      });
      return unsub;
    } catch (e) {
      return () => {};
    }
  },

  // --- Stock Audit Logs CRUD ---
  async fetchStockLogs(): Promise<StockAuditLog[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "stock_audit_logs")), 10000);
        if (!querySnapshot.empty) {
          let list: StockAuditLog[] = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as StockAuditLog);
          });
          // Sanitize legacy entries
          list = list.map(l => {
            if (l.performedByName && (l.performedByName.includes('طارق') || l.performedByName.includes('يوسف طارق'))) {
              return { ...l, performedByName: 'مدير سابق', performedByEmail: '' };
            }
            return l;
          });
          // Sort by timestamp descending
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          saveLocalStockLogs(list);
          return list;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchStockLogs failed/timed out, returning local storage:", e);
    }
    return getLocalStockLogs();
  },

  async addStockLog(log: Omit<StockAuditLog, 'id' | 'timestamp'>): Promise<StockAuditLog> {
    const newLog: StockAuditLog = {
      ...log,
      id: "log-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    // 1. Immediately save to local storage
    const list = getLocalStockLogs();
    list.unshift(newLog);
    saveLocalStockLogs(list);

    // 2. Sync to Firestore in non-blocking background
    if (isFirebaseConnected) {
      withTimeout(
        setDoc(doc(db, "stock_audit_logs", newLog.id), {
          medicineId: newLog.medicineId,
          medicineName: newLog.medicineName,
          actionType: newLog.actionType,
          quantityChanged: newLog.quantityChanged,
          previousQuantity: newLog.previousQuantity,
          newQuantity: newLog.newQuantity,
          performedByName: newLog.performedByName,
          performedByEmail: newLog.performedByEmail,
          performedById: newLog.performedById,
          notes: newLog.notes,
          timestamp: newLog.timestamp
        }),
        2500
      ).catch(e => {
        console.warn("Firestore addStockLog background warning:", e);
      });
    }

    return newLog;
  },

  // --- Users CRUD ---
  async fetchUsers(): Promise<any[]> {
    const DEFAULT_USERS = [
      {
        uid: "user-tmrbe",
        name: "م. تامر (المبرمج)",
        email: "tmrbe2006@gmail.com",
        role: "developer",
        phone: "+966500001122",
        password: "tmrbe2006"
      },
      {
        uid: "user-100",
        name: "م. عبد الرحمن (المبرمج)",
        email: "dev@carecenter.org",
        role: "developer",
        phone: "+966500001122",
        password: "dev"
      },
      {
        uid: "user-101",
        name: "مدير النظام",
        email: "admin@carecenter.org",
        role: "admin",
        phone: "+966501234567",
        password: "admin"
      },
      {
        uid: "user-102",
        name: "صيدلي. كريم القحطاني",
        email: "kareem.q@carecenter.org",
        role: "pharmacist",
        phone: "+966507654321",
        password: "pharm"
      },
      {
        uid: "user-103",
        name: "فني. ماجد الرويلي",
        email: "majed.r@carecenter.org",
        role: "technician",
        phone: "+966509998887",
        password: "tech"
      }
    ];

    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "users")), 10000);
        if (!querySnapshot.empty) {
          let list: any[] = [];
          querySnapshot.forEach((doc) => {
            list.push({ uid: doc.id, ...doc.data() });
          });
          // Filter out any removed legacy accounts
          list = list.filter(u => u.email?.toLowerCase() !== 'yousef.t@carecenter.org');
          const tmrbeIdx = list.findIndex(u => u.email?.toLowerCase() === 'tmrbe2006@gmail.com');
          if (tmrbeIdx !== -1) {
            list[tmrbeIdx].role = 'developer';
            if (list[tmrbeIdx].password === 'dev' || !list[tmrbeIdx].password) {
              list[tmrbeIdx].password = 'tmrbe2006';
              // Update in Firestore
              setDoc(doc(db, "users", list[tmrbeIdx].uid || "user-tmrbe"), {
                password: 'tmrbe2006',
                role: 'developer'
              }, { merge: true }).catch(() => {});
            }
          } else {
            list.unshift(DEFAULT_USERS[0]);
          }
          localStorage.setItem('care_pharmacy_all_users', JSON.stringify(list));
          return list;
        } else {
          // Seed initial users into Firestore in background
          Promise.allSettled(
            DEFAULT_USERS.map(u => setDoc(doc(db, "users", u.uid), {
              name: u.name,
              email: u.email,
              role: u.role,
              phone: u.phone,
              password: u.password
            }))
          ).catch(() => {});
          localStorage.setItem('care_pharmacy_all_users', JSON.stringify(DEFAULT_USERS));
          return DEFAULT_USERS;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchUsers failed/timed out, returning local storage:", e);
    }
    
    const saved = localStorage.getItem('care_pharmacy_all_users');
    let list = saved ? JSON.parse(saved) : DEFAULT_USERS;
    if (Array.isArray(list)) {
      list = list.filter((u: any) => u.email?.toLowerCase() !== 'yousef.t@carecenter.org');
      const tmrbeIdx = list.findIndex((u: any) => u.email?.toLowerCase() === 'tmrbe2006@gmail.com');
      if (tmrbeIdx !== -1) {
        list[tmrbeIdx].role = 'developer';
        if (list[tmrbeIdx].password === 'dev' || !list[tmrbeIdx].password) {
          list[tmrbeIdx].password = 'tmrbe2006';
        }
      } else {
        list.unshift(DEFAULT_USERS[0]);
      }
      try { localStorage.setItem('care_pharmacy_all_users', JSON.stringify(list)); } catch (e) {}
      return list;
    }
    return DEFAULT_USERS;
  },

  async addUser(newUser: any): Promise<any> {
    const userWithId = {
      ...newUser,
      uid: newUser.uid || "user-" + Math.random().toString(36).substr(2, 9)
    };

    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "users", userWithId.uid), {
          name: userWithId.name,
          email: userWithId.email,
          role: userWithId.role,
          phone: userWithId.phone,
          password: userWithId.password
        });
      }
    } catch (e) {
      console.warn("Firestore addUser failed, saving locally:", e);
    }

    const saved = localStorage.getItem('care_pharmacy_all_users');
    const list = saved ? JSON.parse(saved) : [];
    list.push(userWithId);
    localStorage.setItem('care_pharmacy_all_users', JSON.stringify(list));
    return userWithId;
  },

  async updateUser(updatedUser: any): Promise<any> {
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "users", updatedUser.uid), {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          password: updatedUser.password
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore updateUser failed, saving locally:", e);
    }

    const saved = localStorage.getItem('care_pharmacy_all_users');
    let list = saved ? JSON.parse(saved) : [];
    list = list.map((u: any) => u.uid === updatedUser.uid ? updatedUser : u);
    localStorage.setItem('care_pharmacy_all_users', JSON.stringify(list));
    return updatedUser;
  },

  async deleteUser(userId: string, actor?: { name: string; email: string; id: string }): Promise<void> {
    const saved = localStorage.getItem('care_pharmacy_all_users');
    let list = saved ? JSON.parse(saved) : [];
    const targetUser = list.find((u: any) => u.uid === userId);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "users", userId));
      }
    } catch (e) {
      console.warn("Firestore deleteUser failed, saving locally:", e);
    }

    list = list.filter((u: any) => u.uid !== userId);
    localStorage.setItem('care_pharmacy_all_users', JSON.stringify(list));

    await this.addStockLog({
      medicineId: userId,
      medicineName: targetUser?.name ? `حساب: ${targetUser.name}` : `مستخدم #${userId}`,
      actionType: 'إلغاء حساب مستخدم',
      quantityChanged: 0,
      previousQuantity: 0,
      newQuantity: 0,
      performedByName: actor?.name || "مستخدم النظام",
      performedByEmail: actor?.email || "",
      performedById: actor?.id || "",
      notes: targetUser?.name ? `إلغاء حساب "${targetUser.name}" وحظر وصوله إلى النظام` : "حذف حساب مستخدم"
    });
  },

  // --- Security & Channel Settings CRUD with Firestore persistence ---
  async fetchSecuritySettings(): Promise<SecuritySettings> {
    try {
      if (isFirebaseConnected) {
        const snap = await withTimeout(getDoc(doc(db, "security_settings", "config")), 10000);
        if (snap.exists()) {
          const data = snap.data() as Partial<SecuritySettings>;
          const localSettings = getLocalSecuritySettings();
          const localDays = localStorage.getItem('care_pharmacy_alert_days');

          // Prioritize non-default alertDays if data has it, otherwise local user preference
          let effectiveDays = DEFAULT_SECURITY_SETTINGS.alertDays;
          if (typeof data?.alertDays === 'number' && data.alertDays >= 5) {
            effectiveDays = data.alertDays;
          } else if (localDays && !isNaN(Number(localDays)) && Number(localDays) >= 5) {
            effectiveDays = Number(localDays);
          } else if (localSettings.alertDays && localSettings.alertDays >= 5) {
            effectiveDays = localSettings.alertDays;
          }

          const merged: SecuritySettings = {
            ...DEFAULT_SECURITY_SETTINGS,
            ...localSettings,
            ...data,
            alertDays: effectiveDays,
            id: "config"
          };
          saveLocalSecuritySettings(merged);
          return merged;
        } else {
          // Initialize Firestore with current settings in background
          const current = getLocalSecuritySettings();
          console.log("Firestore security_settings is empty. Seeding settings into Firestore in background...");
          setDoc(doc(db, "security_settings", "config"), current).catch(() => {});
          saveLocalSecuritySettings(current);
          return current;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchSecuritySettings failed/timed out, falling back to local storage:", e);
    }
    return getLocalSecuritySettings();
  },

  async saveSecuritySettings(settings: Partial<SecuritySettings>, actor?: { name?: string; email?: string }): Promise<SecuritySettings> {
    const current = getLocalSecuritySettings();
    const targetAlertDays = typeof settings.alertDays === 'number' && settings.alertDays >= 5
      ? settings.alertDays
      : (current.alertDays || 30);

    const updated: SecuritySettings = {
      ...current,
      ...settings,
      alertDays: targetAlertDays,
      id: "config",
      updatedAt: new Date().toISOString(),
      updatedBy: actor?.name || "مدير النظام"
    };

    localStorage.setItem('care_pharmacy_alert_days', String(targetAlertDays));
    saveLocalSecuritySettings(updated);

    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "security_settings", "config"), {
          emailEnabled: updated.emailEnabled,
          appsScriptUrl: updated.appsScriptUrl,
          notificationEmail: updated.notificationEmail,
          whatsAppEnabled: updated.whatsAppEnabled,
          whatsAppMode: updated.whatsAppMode,
          whatsAppNumber: updated.whatsAppNumber,
          callMeBotApiKey: updated.callMeBotApiKey || '',
          ultraMsgInstance: updated.ultraMsgInstance || '',
          ultraMsgToken: updated.ultraMsgToken || '',
          waPilotBaseUrl: updated.waPilotBaseUrl || '',
          waPilotApiKey: updated.waPilotApiKey || '',
          waPilotType: updated.waPilotType || '',
          waPilotDevice: updated.waPilotDevice || '',
          waPilotPath: updated.waPilotPath || '',
          alertDays: targetAlertDays,
          updatedAt: updated.updatedAt,
          updatedBy: updated.updatedBy
        }, { merge: true });

        // Redundancy doc for direct settings query
        await setDoc(doc(db, "settings", "expiry_alerts"), {
          alertDays: targetAlertDays,
          updatedAt: updated.updatedAt,
          updatedBy: updated.updatedBy
        }, { merge: true });

        console.log("Security settings & alertDays saved successfully to Firestore");
      }
    } catch (e) {
      console.warn("Firestore saveSecuritySettings failed, saving locally:", e);
    }

    return updated;
  },

  // --- Units CRUD with Firestore Database Persistence ---
  async fetchUnits(): Promise<string[]> {
    try {
      if (isFirebaseConnected) {
        const snap = await withTimeout(getDoc(doc(db, "settings", "units_and_categories")), 10000);
        if (snap.exists() && Array.isArray(snap.data()?.units) && snap.data()?.units.length > 0) {
          const loadedUnits = snap.data()?.units as string[];
          saveLocalUnits(loadedUnits);
          return loadedUnits;
        } else {
          // Seed Firestore with DEFAULT_UNITS in parallel background
          console.log("Seeding DEFAULT_UNITS into Firestore in background...");
          Promise.allSettled([
            setDoc(doc(db, "settings", "units_and_categories"), {
              units: DEFAULT_UNITS,
              updatedAt: new Date().toISOString()
            }, { merge: true }),
            ...DEFAULT_UNITS.map(u => setDoc(doc(db, "item_units", u), {
              name: u,
              createdAt: new Date().toISOString()
            }))
          ]).catch(() => {});

          saveLocalUnits(DEFAULT_UNITS);
          return DEFAULT_UNITS;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchUnits failed/timed out, falling back to local storage:", e);
    }
    return getLocalUnits();
  },

  async saveUnits(units: string[]): Promise<string[]> {
    saveLocalUnits(units);
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "settings", "units_and_categories"), {
          units: units,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        for (const u of units) {
          await setDoc(doc(db, "item_units", u), {
            name: u,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn("Firestore saveUnits failed, saved locally:", e);
    }
    return units;
  },

  async addUnit(name: string): Promise<string[]> {
    const cleaned = name.trim();
    if (!cleaned) return getLocalUnits();
    const current = await this.fetchUnits();
    if (current.includes(cleaned)) return current;
    const updated = [...current, cleaned];
    await this.saveUnits(updated);
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "item_units", cleaned), {
          name: cleaned,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firestore addUnit doc failed:", e);
    }
    return updated;
  },

  async updateUnit(oldName: string, newName: string): Promise<string[]> {
    const cleaned = newName.trim();
    if (!cleaned || cleaned === oldName) return getLocalUnits();
    const current = await this.fetchUnits();
    const updated = current.map(u => u === oldName ? cleaned : u);
    await this.saveUnits(updated);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "item_units", oldName));
        await setDoc(doc(db, "item_units", cleaned), {
          name: cleaned,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firestore updateUnit failed:", e);
    }
    return updated;
  },

  async deleteUnit(name: string): Promise<string[]> {
    const current = await this.fetchUnits();
    const updated = current.filter(u => u !== name);
    await this.saveUnits(updated);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "item_units", name));
      }
    } catch (e) {
      console.warn("Firestore deleteUnit failed:", e);
    }
    return updated;
  },

  // --- Therapeutic Categories CRUD with Firestore Database Persistence ---
  async fetchCategories(): Promise<string[]> {
    try {
      if (isFirebaseConnected) {
        const snap = await withTimeout(getDoc(doc(db, "settings", "units_and_categories")), 10000);
        if (snap.exists() && Array.isArray(snap.data()?.categories) && snap.data()?.categories.length > 0) {
          const loadedCats = snap.data()?.categories as string[];
          saveLocalCategories(loadedCats);
          return loadedCats;
        } else {
          // Seed Firestore with DEFAULT_CATEGORIES in parallel background
          console.log("Seeding DEFAULT_CATEGORIES into Firestore in background...");
          Promise.allSettled([
            setDoc(doc(db, "settings", "units_and_categories"), {
              categories: DEFAULT_CATEGORIES,
              updatedAt: new Date().toISOString()
            }, { merge: true }),
            ...DEFAULT_CATEGORIES.map(c => setDoc(doc(db, "therapeutic_categories", c), {
              name: c,
              createdAt: new Date().toISOString()
            }))
          ]).catch(() => {});

          saveLocalCategories(DEFAULT_CATEGORIES);
          return DEFAULT_CATEGORIES;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchCategories failed/timed out, falling back to local storage:", e);
    }
    return getLocalCategories();
  },

  async saveCategories(categories: string[]): Promise<string[]> {
    saveLocalCategories(categories);
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "settings", "units_and_categories"), {
          categories: categories,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        for (const c of categories) {
          await setDoc(doc(db, "therapeutic_categories", c), {
            name: c,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn("Firestore saveCategories failed, saved locally:", e);
    }
    return categories;
  },

  async addCategory(name: string): Promise<string[]> {
    const cleaned = name.trim();
    if (!cleaned) return getLocalCategories();
    const current = await this.fetchCategories();
    if (current.includes(cleaned)) return current;
    const updated = [...current, cleaned];
    await this.saveCategories(updated);
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "therapeutic_categories", cleaned), {
          name: cleaned,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firestore addCategory doc failed:", e);
    }
    return updated;
  },

  async updateCategory(oldName: string, newName: string): Promise<string[]> {
    const cleaned = newName.trim();
    if (!cleaned || cleaned === oldName) return getLocalCategories();
    const current = await this.fetchCategories();
    const updated = current.map(c => c === oldName ? cleaned : c);
    await this.saveCategories(updated);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "therapeutic_categories", oldName));
        await setDoc(doc(db, "therapeutic_categories", cleaned), {
          name: cleaned,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firestore updateCategory failed:", e);
    }
    return updated;
  },

  async deleteCategory(name: string): Promise<string[]> {
    const current = await this.fetchCategories();
    const updated = current.filter(c => c !== name);
    await this.saveCategories(updated);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "therapeutic_categories", name));
      }
    } catch (e) {
      console.warn("Firestore deleteCategory failed:", e);
    }
    return updated;
  },

  // --- Residents CRUD & Cloud Sync ---
  async fetchResidents(): Promise<any[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "residents")), 7000);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        saveLocalResidents(list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetchResidents failed/timed out, returning offline cache:", e);
    }
    return getLocalResidents();
  },

  async saveResident(resident: any): Promise<any> {
    const resWithId = {
      ...resident,
      id: resident.id || "res-" + Math.random().toString(36).substr(2, 9)
    };
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "residents", resWithId.id), resWithId);
      }
    } catch (e) {
      console.warn("Firestore saveResident failed, saving locally:", e);
    }
    const current = getLocalResidents();
    const idx = current.findIndex(r => r.id === resWithId.id);
    if (idx !== -1) {
      current[idx] = resWithId;
    } else {
      current.push(resWithId);
    }
    saveLocalResidents(current);
    return resWithId;
  },

  async deleteResident(id: string, actor?: { name: string; email: string; id: string }): Promise<void> {
    const current = getLocalResidents();
    const target = current.find(r => r.id === id);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "residents", id));
      }
    } catch (e) {
      console.warn("Firestore deleteResident failed, updating locally:", e);
    }
    const filtered = current.filter(r => r.id !== id);
    saveLocalResidents(filtered);

    await this.addStockLog({
      medicineId: id,
      medicineName: target ? (target.name || target.fullName || id) : id,
      actionType: 'شطب ملف مستفيد',
      quantityChanged: 0,
      previousQuantity: 0,
      newQuantity: 0,
      performedByName: actor?.name || "مستخدم النظام",
      performedByEmail: actor?.email || "",
      performedById: actor?.id || "",
      notes: target ? `شطب ملف المستفيد "${target.name || target.fullName}" نهائياً من سجلات المركز` : "شطب مستفيد"
    });
  },

  async syncSingleResident(resident: any): Promise<void> {
    const resWithId = {
      ...resident,
      id: resident.id || "res-" + Math.random().toString(36).substr(2, 9)
    };
    const current = getLocalResidents();
    const idx = current.findIndex(r => r.id === resWithId.id);
    if (idx !== -1) {
      current[idx] = resWithId;
    } else {
      current.push(resWithId);
    }
    saveLocalResidents(current);

    // Sync only this single resident doc to Firestore in background
    if (isFirebaseConnected) {
      withTimeout(
        setDoc(doc(db, "residents", resWithId.id), resWithId),
        2500
      ).catch(e => {
        console.warn("Firestore single resident sync background warning:", e);
      });
    }
  },

  async syncAllResidents(list: any[]): Promise<void> {
    saveLocalResidents(list);
    if (isFirebaseConnected) {
      withTimeout(
        Promise.allSettled(list.map(r => setDoc(doc(db, "residents", r.id), r))),
        3000
      ).catch(e => {
        console.warn("Firestore syncAllResidents background warning:", e);
      });
    }
  },

  // --- Doctors CRUD & Cloud Firestore Sync ---
  async fetchDoctors(): Promise<Doctor[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "doctors")), 10000);
        if (!querySnapshot.empty) {
          const list: Doctor[] = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Doctor);
          });
          saveLocalDoctors(list);
          return list;
        } else {
          // Seed Firestore with DEFAULT_DOCTORS in background
          DEFAULT_DOCTORS.forEach((docItem) => {
            setDoc(doc(db, "doctors", docItem.id), docItem).catch(() => {});
          });
          saveLocalDoctors(DEFAULT_DOCTORS);
          return DEFAULT_DOCTORS;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchDoctors failed, using offline fallback:", e);
    }
    return getLocalDoctors();
  },

  async addDoctor(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
    const id = "doc-" + Date.now();
    const now = new Date().toISOString();
    const newDoc: Doctor = {
      ...doctor,
      id,
      createdAt: now,
      updatedAt: now
    };

    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "doctors", id), newDoc);
      }
    } catch (e) {
      console.warn("Firestore addDoctor failed, saving locally:", e);
    }

    const current = getLocalDoctors();
    const updated = [newDoc, ...current];
    saveLocalDoctors(updated);
    return newDoc;
  },

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor> {
    const current = getLocalDoctors();
    const index = current.findIndex(d => d.id === id);
    const existing = index !== -1 ? current[index] : null;
    const now = new Date().toISOString();

    const updatedDoc: Doctor = {
      ...(existing || { id, nameAr: '', nameEn: '', specialty: '', createdAt: now, updatedAt: now }),
      ...updates,
      id,
      updatedAt: now
    };

    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "doctors", id), updatedDoc, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore updateDoctor failed, saving locally:", e);
    }

    if (index !== -1) {
      current[index] = updatedDoc;
    } else {
      current.push(updatedDoc);
    }
    saveLocalDoctors(current);
    return updatedDoc;
  },

  async deleteDoctor(id: string): Promise<boolean> {
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "doctors", id));
      }
    } catch (e) {
      console.warn("Firestore deleteDoctor failed, deleting locally:", e);
    }

    const current = getLocalDoctors();
    const updated = current.filter(d => d.id !== id);
    saveLocalDoctors(updated);
    return true;
  },

  // --- Pharmaceutical Companies CRUD & Cloud Sync ---
  async fetchCompanies(): Promise<any[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "pharmaceutical_companies")), 10000);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        saveLocalCompanies(list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetchCompanies failed, returning offline cache:", e);
    }
    return getLocalCompanies();
  },

  async saveCompany(company: any): Promise<any> {
    const compWithId = {
      ...company,
      id: company.id || "comp-" + Math.random().toString(36).substr(2, 9)
    };
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "pharmaceutical_companies", compWithId.id), compWithId);
      }
    } catch (e) {
      console.warn("Firestore saveCompany failed:", e);
    }
    const current = getLocalCompanies();
    const idx = current.findIndex(c => c.id === compWithId.id);
    if (idx !== -1) current[idx] = compWithId;
    else current.push(compWithId);
    saveLocalCompanies(current);
    return compWithId;
  },

  async deleteCompany(id: string, actor?: { name: string; email: string; id: string }): Promise<void> {
    const current = getLocalCompanies();
    const target = current.find(c => c.id === id);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "pharmaceutical_companies", id));
      }
    } catch (e) {
      console.warn("Firestore deleteCompany failed:", e);
    }
    saveLocalCompanies(current.filter(c => c.id !== id));

    await this.addStockLog({
      medicineId: id,
      medicineName: target?.name || id,
      actionType: 'حذف شركة أدوية',
      quantityChanged: 0,
      previousQuantity: 0,
      newQuantity: 0,
      performedByName: actor?.name || "مستخدم النظام",
      performedByEmail: actor?.email || "",
      performedById: actor?.id || "",
      notes: `شطب شركة "${target?.name || id}" من دليل الشركات الموردة`
    });
  },

  async syncAllCompanies(list: any[]): Promise<void> {
    saveLocalCompanies(list);
    try {
      if (isFirebaseConnected) {
        await Promise.allSettled(list.map(c => setDoc(doc(db, "pharmaceutical_companies", c.id), c)));
      }
    } catch (e) {}
  },

  // --- Behavior Logs CRUD & Cloud Sync ---
  async fetchBehaviorLogs(): Promise<any[]> {
    try {
      if (isFirebaseConnected) {
        const querySnapshot = await withTimeout(getDocs(collection(db, "behavior_logs")), 10000);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => new Date(b.loggedAt || 0).getTime() - new Date(a.loggedAt || 0).getTime());
        saveLocalBehaviorLogs(list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetchBehaviorLogs failed:", e);
    }
    return getLocalBehaviorLogs();
  },

  async addBehaviorLog(log: any): Promise<any> {
    const logWithId = {
      ...log,
      id: log.id || "blog-" + Math.random().toString(36).substr(2, 9),
      loggedAt: log.loggedAt || new Date().toISOString()
    };
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "behavior_logs", logWithId.id), logWithId);
      }
    } catch (e) {
      console.warn("Firestore addBehaviorLog failed:", e);
    }
    const current = getLocalBehaviorLogs();
    current.unshift(logWithId);
    saveLocalBehaviorLogs(current);
    return logWithId;
  },

  async deleteBehaviorLog(id: string, actor?: { name: string; email: string; id: string }): Promise<void> {
    const current = getLocalBehaviorLogs();
    const target = current.find(b => b.id === id);
    try {
      if (isFirebaseConnected) {
        await deleteDoc(doc(db, "behavior_logs", id));
      }
    } catch (e) {}
    saveLocalBehaviorLogs(current.filter(b => b.id !== id));

    await this.addStockLog({
      medicineId: id,
      medicineName: target?.residentName ? `ملاحظة: ${target.residentName}` : id,
      actionType: 'حذف سجل سلوكي',
      quantityChanged: 0,
      previousQuantity: 0,
      newQuantity: 0,
      performedByName: actor?.name || "مستخدم النظام",
      performedByEmail: actor?.email || "",
      performedById: actor?.id || "",
      notes: `حذف الملاحظة السلوكية والطبية`
    });
  },

  async syncAllBehaviorLogs(list: any[]): Promise<void> {
    saveLocalBehaviorLogs(list);
    try {
      if (isFirebaseConnected) {
        await Promise.allSettled(list.map(b => setDoc(doc(db, "behavior_logs", b.id), b)));
      }
    } catch (e) {}
  },

  // --- Custom Side Effects Cloud Sync ---
  async fetchCustomSideEffects(): Promise<{ key: string; label: string }[]> {
    try {
      if (isFirebaseConnected) {
        const docSnap = await withTimeout(getDoc(doc(db, "settings", "custom_side_effects")), 10000);
        if (docSnap.exists() && docSnap.data().items) {
          const items = docSnap.data().items;
          saveLocalCustomSideEffects(items);
          return items;
        } else {
          const items = getLocalCustomSideEffects();
          setDoc(doc(db, "settings", "custom_side_effects"), {
            items,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
          return items;
        }
      }
    } catch (e) {
      console.warn("Firestore fetchCustomSideEffects failed:", e);
    }
    return getLocalCustomSideEffects();
  },

  async saveCustomSideEffects(effects: { key: string; label: string }[]): Promise<{ key: string; label: string }[]> {
    saveLocalCustomSideEffects(effects);
    try {
      if (isFirebaseConnected) {
        await setDoc(doc(db, "settings", "custom_side_effects"), {
          items: effects,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {}
    return effects;
  },

  // --- Helper to fetch any Firestore collection with exact document IDs and ISO timestamps ---
  async fetchCollectionRaw(colName: string, timeoutMs: number = 12000): Promise<any[]> {
    if (!isFirebaseConnected) return [];
    try {
      const qSnap = await withTimeout(getDocs(collection(db, colName)), timeoutMs);
      const items: any[] = [];
      qSnap.forEach(docSnap => {
        const raw = docSnap.data();
        const cleaned: any = {};
        for (const [k, v] of Object.entries(raw)) {
          if (v && typeof v === 'object' && typeof (v as any).toDate === 'function') {
            cleaned[k] = (v as any).toDate().toISOString();
          } else {
            cleaned[k] = v;
          }
        }
        items.push({ id: docSnap.id, ...cleaned });
      });
      return items;
    } catch (e) {
      console.warn(`Firestore fetchCollectionRaw '${colName}' failed/timed out:`, e);
      return [];
    }
  },

  // --- Developer Backup & Restore Suite (Complete backup of ALL Firebase Firestore Collections) ---
  async createFullBackup(actor?: { name: string; email: string }): Promise<any> {
    // 1. Concurrently fetch all 13 Firestore collections shown in the Firebase Console
    const [
      batchesRaw,
      behaviorLogsRaw,
      dispenseRecordsRaw,
      itemUnitsRaw,
      residentsRaw,
      securitySettingsRaw,
      settingsRaw,
      stockLogsRaw,
      therapeuticCategoriesRaw,
      userSessionsRaw,
      usersRaw,
      medicinesRaw,
      companiesRaw
    ] = await Promise.all([
      this.fetchCollectionRaw("batches", 10000),
      this.fetchCollectionRaw("behavior_logs", 10000),
      this.fetchCollectionRaw("dispense_records", 12000),
      this.fetchCollectionRaw("item_units", 10000),
      this.fetchCollectionRaw("residents", 15000),
      this.fetchCollectionRaw("security_settings", 8000),
      this.fetchCollectionRaw("settings", 8000),
      this.fetchCollectionRaw("stock_audit_logs", 15000),
      this.fetchCollectionRaw("therapeutic_categories", 10000),
      this.fetchCollectionRaw("user_sessions", 15000),
      this.fetchCollectionRaw("users", 10000),
      this.fetchCollectionRaw("medicines", 10000),
      this.fetchCollectionRaw("pharmaceutical_companies", 8000)
    ]);

    // 2. High-fidelity fallbacks to local cache if any collection was empty or device was offline
    const batches = batchesRaw.length > 0 ? batchesRaw : getLocalBatches();
    const behavior_logs = behaviorLogsRaw.length > 0 ? behaviorLogsRaw : getLocalBehaviorLogs();
    const dispense_records = dispenseRecordsRaw.length > 0 ? dispenseRecordsRaw : getLocalDispenses();
    const residents = residentsRaw.length > 0 ? residentsRaw : getLocalResidents();
    const stock_audit_logs = stockLogsRaw.length > 0 ? stockLogsRaw : getLocalStockLogs();
    const users = usersRaw.length > 0 ? usersRaw : (() => {
      try { return JSON.parse(localStorage.getItem('care_pharmacy_all_users') || '[]'); } catch { return []; }
    })();
    const user_sessions = userSessionsRaw.length > 0 ? userSessionsRaw : getLocalSessions();
    const medicines = medicinesRaw.length > 0 ? medicinesRaw : getLocalMedicines();
    const companies = companiesRaw.length > 0 ? companiesRaw : getLocalCompanies();

    // item_units: either from item_units collection or local units array
    const item_units = itemUnitsRaw.length > 0 ? itemUnitsRaw : getLocalUnits().map(u => ({ id: u, name: u }));

    // therapeutic_categories: either from therapeutic_categories collection or local categories array
    const therapeutic_categories = therapeuticCategoriesRaw.length > 0 
      ? therapeuticCategoriesRaw 
      : getLocalCategories().map(c => ({ id: c, name: c }));

    // security_settings
    const security_settings = securitySettingsRaw.length > 0 
      ? securitySettingsRaw 
      : [{ ...getLocalSecuritySettings() }];

    // settings documents (units_and_categories, custom_side_effects, etc.)
    const settings = settingsRaw.length > 0 
      ? settingsRaw 
      : [
          { id: "custom_side_effects", items: getLocalCustomSideEffects() },
          { id: "units_and_categories", units: getLocalUnits(), categories: getLocalCategories() }
        ];

    // Compute exact counts for every single collection
    const counts = {
      batches: batches.length,
      behavior_logs: behavior_logs.length,
      dispense_records: dispense_records.length,
      item_units: item_units.length,
      residents: residents.length,
      security_settings: security_settings.length,
      settings: settings.length,
      stock_audit_logs: stock_audit_logs.length,
      therapeutic_categories: therapeutic_categories.length,
      user_sessions: user_sessions.length,
      users: users.length,
      medicines: medicines.length,
      companies: companies.length,
      totalDocuments: (
        batches.length +
        behavior_logs.length +
        dispense_records.length +
        item_units.length +
        residents.length +
        security_settings.length +
        settings.length +
        stock_audit_logs.length +
        therapeutic_categories.length +
        user_sessions.length +
        users.length +
        medicines.length +
        companies.length
      )
    };

    const backupPayload = {
      appId: "care-center-pharmacy-v2",
      appName: "صيدلية مركز التأهيل الشامل للذكور بشقراء",
      backupVersion: "3.0.0",
      createdAt: new Date().toISOString(),
      exportedBy: {
        name: actor?.name || "المبرمج",
        email: actor?.email || "tmrbe2006@gmail.com",
        role: "developer"
      },
      counts,
      // Full collection map reflecting exact Firebase Firestore tables
      collections: {
        batches,
        behavior_logs,
        dispense_records,
        item_units,
        residents,
        security_settings,
        settings,
        stock_audit_logs,
        therapeutic_categories,
        user_sessions,
        users,
        medicines,
        pharmaceutical_companies: companies
      },
      // Convenience data payload supporting legacy formats
      data: {
        batches,
        medicines,
        dispenseRecords: dispense_records,
        residents,
        companies,
        stockLogs: stock_audit_logs,
        users,
        userSessions: user_sessions,
        behaviorLogs: behavior_logs,
        itemUnits: item_units,
        therapeuticCategories: therapeutic_categories,
        units: item_units.map((u: any) => u.name || u.id).filter(Boolean),
        categories: therapeutic_categories.map((c: any) => c.name || c.id).filter(Boolean),
        customSideEffects: settings.find((s: any) => s.id === 'custom_side_effects')?.items || getLocalCustomSideEffects(),
        securitySettings: security_settings.find((s: any) => s.id === 'config') || security_settings[0] || getLocalSecuritySettings(),
        settings
      }
    };

    return backupPayload;
  },

  async restoreFullBackup(backupData: any, actor?: { name: string; email: string; id: string }): Promise<{ success: boolean; counts: any }> {
    if (!backupData) {
      throw new Error("ملف النسخة الاحتياطية فارغ أو غير صالح");
    }

    // Support both new `collections` format, `data` wrapper, or raw object
    const collectionsSource = backupData.collections || {};
    const dataSource = backupData.data || backupData;

    const batches = collectionsSource.batches || dataSource.batches || [];
    const behavior_logs = collectionsSource.behavior_logs || dataSource.behaviorLogs || dataSource.behavior_logs || [];
    const dispense_records = collectionsSource.dispense_records || dataSource.dispenseRecords || dataSource.dispense_records || [];
    const item_units = collectionsSource.item_units || dataSource.itemUnits || dataSource.item_units || [];
    const residents = collectionsSource.residents || dataSource.residents || [];
    const security_settings = collectionsSource.security_settings || (dataSource.securitySettings ? [dataSource.securitySettings] : []);
    const settings = collectionsSource.settings || dataSource.settings || [];
    const stock_audit_logs = collectionsSource.stock_audit_logs || dataSource.stockLogs || dataSource.stock_audit_logs || [];
    const therapeutic_categories = collectionsSource.therapeutic_categories || dataSource.therapeuticCategories || dataSource.therapeutic_categories || [];
    const user_sessions = collectionsSource.user_sessions || dataSource.userSessions || dataSource.user_sessions || [];
    const users = collectionsSource.users || dataSource.users || [];
    const medicines = collectionsSource.medicines || dataSource.medicines || [];
    const companies = collectionsSource.pharmaceutical_companies || collectionsSource.companies || dataSource.companies || dataSource.pharmaceutical_companies || [];

    // Extract units and categories lists
    const unitsList: string[] = item_units.length > 0 
      ? item_units.map((u: any) => (typeof u === 'string' ? u : u.name || u.id)).filter(Boolean)
      : Array.isArray(dataSource.units) ? dataSource.units : [];

    const categoriesList: string[] = therapeutic_categories.length > 0
      ? therapeutic_categories.map((c: any) => (typeof c === 'string' ? c : c.name || c.id)).filter(Boolean)
      : Array.isArray(dataSource.categories) ? dataSource.categories : [];

    // 1. Immediately persist to LocalStorage for instant hydration
    if (Array.isArray(batches)) saveLocalBatches(batches);
    if (Array.isArray(medicines)) saveLocalMedicines(medicines);
    if (Array.isArray(dispense_records)) saveLocalDispenses(dispense_records);
    if (Array.isArray(residents)) saveLocalResidents(residents);
    if (Array.isArray(companies)) saveLocalCompanies(companies);
    if (Array.isArray(stock_audit_logs)) saveLocalStockLogs(stock_audit_logs);
    if (Array.isArray(behavior_logs)) saveLocalBehaviorLogs(behavior_logs);
    if (Array.isArray(user_sessions)) localStorage.setItem('care_pharmacy_sessions', JSON.stringify(user_sessions));
    if (Array.isArray(users)) localStorage.setItem('care_pharmacy_all_users', JSON.stringify(users));
    if (unitsList.length > 0) localStorage.setItem('care_pharmacy_custom_units', JSON.stringify(unitsList));
    if (categoriesList.length > 0) localStorage.setItem('care_pharmacy_custom_categories', JSON.stringify(categoriesList));

    const secObj = Array.isArray(security_settings) ? (security_settings.find((s: any) => s.id === 'config') || security_settings[0]) : security_settings;
    if (secObj) saveLocalSecuritySettings(secObj);

    // 2. Write to Firebase Firestore in chunks of concurrent promises
    if (isFirebaseConnected) {
      const allWrites: Promise<any>[] = [];

      // Helper to batch setDoc
      const queueDoc = (col: string, docId: string, data: any) => {
        if (!docId) return;
        const docRef = doc(db, col, docId);
        // Remove undefined values
        const cleanData: any = {};
        for (const [k, v] of Object.entries(data)) {
          if (v !== undefined) cleanData[k] = v;
        }
        allWrites.push(setDoc(docRef, cleanData));
      };

      // Restore batches
      if (Array.isArray(batches)) {
        batches.forEach((b: any) => queueDoc("batches", b.id || b.batchNumber, b));
      }

      // Restore behavior_logs
      if (Array.isArray(behavior_logs)) {
        behavior_logs.forEach((b: any) => queueDoc("behavior_logs", b.id, b));
      }

      // Restore dispense_records
      if (Array.isArray(dispense_records)) {
        dispense_records.forEach((r: any) => queueDoc("dispense_records", r.id, r));
      }

      // Restore item_units
      if (Array.isArray(item_units)) {
        item_units.forEach((u: any) => {
          const uId = typeof u === 'string' ? u : (u.id || u.name);
          const uName = typeof u === 'string' ? u : (u.name || u.id);
          if (uId) queueDoc("item_units", uId, { name: uName, updatedAt: new Date().toISOString() });
        });
      }

      // Restore residents
      if (Array.isArray(residents)) {
        residents.forEach((r: any) => queueDoc("residents", r.id, r));
      }

      // Restore security_settings
      if (Array.isArray(security_settings)) {
        security_settings.forEach((s: any) => queueDoc("security_settings", s.id || "config", s));
      } else if (secObj) {
        queueDoc("security_settings", "config", secObj);
      }

      // Restore settings
      if (Array.isArray(settings)) {
        settings.forEach((s: any) => queueDoc("settings", s.id, s));
      }
      if (unitsList.length > 0 || categoriesList.length > 0) {
        queueDoc("settings", "units_and_categories", {
          units: unitsList,
          categories: categoriesList,
          updatedAt: new Date().toISOString()
        });
      }

      // Restore stock_audit_logs
      if (Array.isArray(stock_audit_logs)) {
        stock_audit_logs.forEach((l: any) => queueDoc("stock_audit_logs", l.id, l));
      }

      // Restore therapeutic_categories
      if (Array.isArray(therapeutic_categories)) {
        therapeutic_categories.forEach((c: any) => {
          const cId = typeof c === 'string' ? c : (c.id || c.name);
          const cName = typeof c === 'string' ? c : (c.name || c.id);
          if (cId) queueDoc("therapeutic_categories", cId, { name: cName, updatedAt: new Date().toISOString() });
        });
      }

      // Restore user_sessions
      if (Array.isArray(user_sessions)) {
        user_sessions.forEach((s: any) => queueDoc("user_sessions", s.id, s));
      }

      // Restore users
      if (Array.isArray(users)) {
        users.forEach((u: any) => queueDoc("users", u.uid || u.id, u));
      }

      // Restore medicines
      if (Array.isArray(medicines)) {
        medicines.forEach((m: any) => queueDoc("medicines", m.id, m));
      }

      // Restore companies
      if (Array.isArray(companies)) {
        companies.forEach((comp: any) => {
          queueDoc("pharmaceutical_companies", comp.id, comp);
          queueDoc("companies", comp.id, comp);
        });
      }

      // Execute all write promises in chunks of 50 to avoid network congestion
      const CHUNK_SIZE = 50;
      for (let i = 0; i < allWrites.length; i += CHUNK_SIZE) {
        const chunk = allWrites.slice(i, i + CHUNK_SIZE);
        await Promise.allSettled(chunk);
      }
    }

    // 3. Document restore action in audit trail
    await this.addStockLog({
      medicineId: "backup-restore-operation",
      medicineName: "استعادة قاعدة البيانات الشاملة لجميع الجداول",
      actionType: "استعادة نسخة احتياطية",
      quantityChanged: 0,
      previousQuantity: 0,
      newQuantity: 0,
      performedByName: actor?.name || "المبرمج",
      performedByEmail: actor?.email || "tmrbe2006@gmail.com",
      performedById: actor?.id || "user-tmrbe",
      notes: `تمت استعادة كافة جداول قاعدة البيانات (${batches.length} تشغيلة، ${residents.length} مستفيد، ${dispense_records.length} صرف، ${stock_audit_logs.length} تدقيق، ${user_sessions.length} جلسة، ${item_units.length} وحدة، ${therapeutic_categories.length} فئة)`
    });

    return {
      success: true,
      counts: {
        batches: batches.length,
        behavior_logs: behavior_logs.length,
        dispense_records: dispense_records.length,
        item_units: item_units.length,
        residents: residents.length,
        security_settings: security_settings.length,
        settings: settings.length,
        stock_audit_logs: stock_audit_logs.length,
        therapeutic_categories: therapeutic_categories.length,
        user_sessions: user_sessions.length,
        users: users.length,
        medicines: medicines.length,
        companies: companies.length,
        total: (
          batches.length +
          behavior_logs.length +
          dispense_records.length +
          item_units.length +
          residents.length +
          security_settings.length +
          settings.length +
          stock_audit_logs.length +
          therapeutic_categories.length +
          user_sessions.length +
          users.length +
          medicines.length +
          companies.length
        )
      }
    };
  }
};
