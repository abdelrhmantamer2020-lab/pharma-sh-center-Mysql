// Compatibility facade: all authoritative reads/writes now go through the authenticated MySQL API.
import { api, clearCache, cache, cachedList, rememberList } from './api';
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


export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {id:'config',emailEnabled:false,appsScriptUrl:'',notificationEmail:'',whatsAppEnabled:false,whatsAppMode:'manual',whatsAppNumber:'',alertDays:30};
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

// Session-only memory caches; medical records and credentials are never persisted in browser storage.
export const getLocalMedicines=():Medicine[]=>cachedList('medicines');
export const getLocalDispenses=():DispenseRecord[]=>cachedList('dispense_records');
export const getLocalSessions=():UserSession[]=>cachedList('user_sessions');
export const getLocalStockLogs=():StockAuditLog[]=>cachedList('stock_audit_logs');
export const getLocalResidents=()=>cachedList('residents');
export const saveLocalResidents=(data:any[])=>{};
export const getLocalCompanies=()=>cachedList('pharmaceutical_companies');
export const saveLocalCompanies=(data:any[])=>{};
export const getLocalBehaviorLogs=()=>cachedList('behavior_logs');
export const saveLocalBehaviorLogs=(data:any[])=>{};
export const getLocalDoctors=():Doctor[]=>cachedList('doctors');
export const getLocalBatches=()=>cachedList('batches');
export const getLocalCustomSideEffects=():{key:string;label:string}[]=>cachedList('custom_side_effects');
export const saveLocalCustomSideEffects=(data:any[])=>{};
export const getLocalUnits=():string[]=>cachedList('item_units').map(x=>x.name);
export const getLocalCategories=():string[]=>cachedList('therapeutic_categories').map(x=>x.name);
export const getLocalSecuritySettings=():SecuritySettings=>cachedList('security_settings')[0]||DEFAULT_SECURITY_SETTINGS;
export const saveLocalSecuritySettings=(d:SecuritySettings)=>{};
async function fetchList(table:string){return rememberList(table,await api(`/api/data/${table}`));}
function remember(table:string,d:any){const old=cachedList(table);rememberList(table,[d,...old.filter(x=>x.id!==d.id)]);return d;}
async function create(table:string,d:any){return remember(table,await api(`/api/data/${table}`,'POST',d));}
async function update(table:string,id:string,d:any){
  const old=cachedList(table).find(x=>x.id===id);
  return remember(table,await api(`/api/data/${table}/${encodeURIComponent(id)}`,'PUT',{...old,...d,id,_version:d._version??old?._version}));
}
async function upsert(table:string,d:any){return cachedList(table).some(x=>x.id===d.id)?update(table,d.id,d):create(table,d);}
async function remove(table:string,id:string){const old=cachedList(table).find(x=>x.id===id);await api(`/api/data/${table}/${encodeURIComponent(id)}`,'DELETE',{_version:old?._version});rememberList(table,cachedList(table).filter(x=>x.id!==id));return true;}
async function syncList(table:string,items:any[]){
  for(const item of items){const old=cachedList(table).find(x=>x.id===item.id);if(JSON.stringify(old)!==JSON.stringify(item))await upsert(table,item);}
}
async function lookupAdd(table:string,name:string){const existing=cachedList(table).find(x=>x.name===name.trim());if(!existing)await create(table,{name:name.trim()});return cachedList(table).map(x=>x.name);}
async function lookupUpdate(table:string,name:string,newName:string){const old=cachedList(table).find(x=>x.name===name);if(!old)throw new Error('السجل غير موجود');await update(table,old.id,{name:newName.trim()});return cachedList(table).map(x=>x.name);}
async function lookupDelete(table:string,name:string){const old=cachedList(table).find(x=>x.name===name);if(old)await remove(table,old.id);return cachedList(table).map(x=>x.name);}
// Reuse a request key after a network error so a retry cannot deduct stock twice.
const pendingDispenses=new Map<string,string>();
export const DbService={
  bootstrap:async(scopes:string[],known:Record<string,string>={})=>{
    const result=await api('/api/bootstrap','POST',{scopes,known});
    for(const [table,data] of Object.entries(result.collections))rememberList(table,data as any[]);
    return result;
  },
  login:async(email:string,password:string,clientId:string,remember=false,force=false)=>api('/api/auth/login','POST',{email,password,clientId,remember,force}),
  me:async()=>api('/api/auth/me'),
  changePassword:async(currentPassword:string,newPassword:string)=>api('/api/auth/password','POST',{currentPassword,newPassword}),
  clearCache,
  fetchMedicines:():Promise<Medicine[]>=>fetchList('medicines'),
  addMedicine:async(d:any,_actor?:any):Promise<Medicine>=>create('medicines',d),
  updateMedicine:async(id:string,d:any,_actor?:any):Promise<Medicine>=>update('medicines',id,d),
  deleteMedicine:async(id:string,_actor?:any)=>remove('medicines',id),
  fetchDispenseRecords:():Promise<DispenseRecord[]>=>fetchList('dispense_records'),
  addDispenseRecord:async(d:any):Promise<DispenseRecord>=>{
    const signature=JSON.stringify(d);const key=pendingDispenses.get(signature)||crypto.randomUUID();pendingDispenses.set(signature,key);
    try {
      const r=await api('/api/dispenses','POST',d,{'Idempotency-Key':key});
      remember('dispense_records',r.record);remember('medicines',r.medicine);if(r.resident)remember('residents',r.resident);
      pendingDispenses.delete(signature);return r.record;
    }catch(e:any){if(e.status&&e.status<500)pendingDispenses.delete(signature);throw e;}
  },
  fetchSessions:():Promise<UserSession[]>=>fetchList('user_sessions'),
  logSession:async(d:any)=>d, // Login audit is created by the server, never by the caller.
  claimActiveSession:async(_d:ActiveSessionRecord,_force=false)=>api('/api/sessions/claim','POST',{}),
  heartbeatActiveSession:async(_email:string,_id:string)=>api('/api/sessions/heartbeat','POST',{}),
  releaseActiveSession:async(_email:string,_id:string)=>{try{await api('/api/auth/logout','POST',{});}finally{clearCache();pendingDispenses.clear();}},
  subscribeToActiveSession:(_email:string,_id:string,onDisplaced:(message:string)=>void)=>{
    const listener=()=>onDisplaced('انتهت جلسة الدخول. سجل الدخول مرة أخرى.');window.addEventListener('pharma-session-ended',listener);return()=>window.removeEventListener('pharma-session-ended',listener);
  },
  fetchStockLogs:():Promise<StockAuditLog[]>=>fetchList('stock_audit_logs'),
  addStockLog:async(d:any):Promise<StockAuditLog>=>remember('stock_audit_logs',await api('/api/audit/notes','POST',d)),
  fetchUsers:async()=>rememberList('users',await api('/api/users')),
  addUser:async(d:any)=>remember('users',await api('/api/users','POST',d)),
  updateUser:async(d:any)=>{const old=cachedList('users').find(x=>x.uid===d.uid);return remember('users',await api(`/api/users/${encodeURIComponent(d.uid)}`,'PUT',{...old,...d,_version:d._version??old?._version}));},
  deleteUser:async(id:string,_actor?:any)=>{await api(`/api/users/${encodeURIComponent(id)}`,'DELETE',{});return rememberList('users',cachedList('users').filter(x=>x.uid!==id));},
  fetchSecuritySettings:async():Promise<SecuritySettings>=>{const all=await fetchList('security_settings');return all.find(x=>x.id==='config')||DEFAULT_SECURITY_SETTINGS;},
  saveSecuritySettings:async(d:Partial<SecuritySettings>,_actor?:any):Promise<SecuritySettings>=>upsert('security_settings',{...getLocalSecuritySettings(),...d,id:'config'}),
  fetchUnits:async()=>{await fetchList('item_units');return getLocalUnits();},
  addUnit:async(name:string)=>lookupAdd('item_units',name),
  updateUnit:async(old:string,name:string)=>lookupUpdate('item_units',old,name),
  deleteUnit:async(name:string)=>lookupDelete('item_units',name),
  fetchCategories:async()=>{await fetchList('therapeutic_categories');return getLocalCategories();},
  addCategory:async(name:string)=>lookupAdd('therapeutic_categories',name),
  updateCategory:async(old:string,name:string)=>lookupUpdate('therapeutic_categories',old,name),
  deleteCategory:async(name:string)=>lookupDelete('therapeutic_categories',name),
  fetchResidents:async()=>fetchList('residents'),
  saveResident:async(d:any)=>upsert('residents',d),
  deleteResident:async(id:string,_actor?:any)=>remove('residents',id),
  syncSingleResident:async(d:any)=>upsert('residents',d),
  syncAllResidents:async(d:any[])=>syncList('residents',d),
  fetchDoctors:():Promise<Doctor[]>=>fetchList('doctors'),
  addDoctor:async(d:any):Promise<Doctor>=>create('doctors',d),
  updateDoctor:async(id:string,d:any):Promise<Doctor>=>update('doctors',id,d),
  deleteDoctor:async(id:string)=>remove('doctors',id),
  fetchCompanies:async()=>fetchList('pharmaceutical_companies'),
  saveCompany:async(d:any)=>upsert('pharmaceutical_companies',d),
  deleteCompany:async(id:string,_actor?:any)=>remove('pharmaceutical_companies',id),
  syncAllCompanies:async(d:any[])=>syncList('pharmaceutical_companies',d),
  fetchBehaviorLogs:async()=>fetchList('behavior_logs'),
  addBehaviorLog:async(d:any)=>create('behavior_logs',d),
  deleteBehaviorLog:async(id:string,_actor?:any)=>remove('behavior_logs',id),
  syncAllBehaviorLogs:async(d:any[])=>syncList('behavior_logs',d),
  fetchCustomSideEffects:async()=>fetchList('custom_side_effects'),
  saveCustomSideEffects:async(d:{key:string;label:string}[])=>{
    for(const item of d)await upsert('custom_side_effects',{...item,id:item.key});
    for(const old of [...cachedList('custom_side_effects')])if(!d.some(x=>x.key===old.key))await remove('custom_side_effects',old.id);
    return d;
  },
  createFullBackup:async(_actor?:any)=>api('/api/backup'),
  restoreFullBackup:async(d:any,_actor?:any)=>{const result=await api('/api/restore','POST',d);clearCache();return result;}
};
