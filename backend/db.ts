import mysql, { type Connection, type ConnectionOptions } from 'mysql2/promise';
export type Database = Connection;
export type DbFactory = () => Promise<Database>;
export interface RuntimeConfig { database: DbFactory; secureCookies: boolean; origin?: string; aiKey?: string; timezone?: string; }
export function localConnectionOptions(): ConnectionOptions {
  const config: ConnectionOptions = process.env.DATABASE_URL ? { uri: process.env.DATABASE_URL } : {
    host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME || 'pharma_sh_center'
  };
  if (process.env.DB_SSL === 'true') config.ssl = { rejectUnauthorized: true, ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}) };
  return { ...config, charset: 'utf8mb4', timezone: 'Z', decimalNumbers: true, connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS)||30000 };
}
export function localDatabase(): Promise<Database> { return mysql.createConnection(localConnectionOptions()); }
export async function rows(db: Database, sql: string, args: any[] = []): Promise<any[]> {
  const [result] = await db.execute(sql, args); return result as any[];
}
export const COLLECTIONS = ['medicines', 'batches', 'dispense_records', 'residents', 'doctors', 'pharmaceutical_companies', 'behavior_logs', 'custom_side_effects', 'stock_audit_logs', 'security_settings', 'system_settings', 'settings', 'item_units', 'therapeutic_categories', 'user_sessions'] as const;
export type Collection = typeof COLLECTIONS[number];
export function collectionName(value: string): Collection {
  if (!COLLECTIONS.includes(value as Collection)) throw new ApiError(400, 'مجموعة بيانات غير معروفة', 'INVALID_COLLECTION');
  return value as Collection;
}
export class ApiError extends Error { constructor(public status: number, message: string, public code = 'INVALID_REQUEST') { super(message); } }
export function decode(row: any) {
  const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  const data = { ...payload, id: row.id, _version: Number(row.version) };
  if ('quantity' in row) Object.assign(data, { quantity: Number(row.quantity), price: Number(row.price), expiryDate: row.expiry_date instanceof Date ? row.expiry_date.toISOString().slice(0, 10) : row.expiry_date, isControlled: !!row.is_controlled });
  return data;
}
export async function list(db: Database, table: Collection) { return (await rows(db, `SELECT * FROM \`${table}\` ORDER BY updated_at DESC, id`)).map(decode); }
export async function one(db: Database, table: Collection, id: string, lock = false) {
  const result = await rows(db, `SELECT * FROM \`${table}\` WHERE id=?${lock ? ' FOR UPDATE' : ''}`, [id]); return result[0] ? decode(result[0]) : null;
}
export function cleanPayload(input: any) { const data = { ...input }; delete data._version; delete data.passwordHash; delete data.password_hash; delete data.password; return data; }
export function validId(id: unknown): string {
  if (typeof id !== 'string' || !id || id.length > 191 || /[\x00-\x1f]/.test(id)) throw new ApiError(400, 'معرف السجل غير صالح'); return id;
}
export function numberValue(value: any, name: string, positive = false): number {
  const n = Number(value); if (value === null || value === '' || !Number.isFinite(n) || n < 0 || (positive && n <= 0) || n > 9999999999 || Math.abs(n * 10000 - Math.round(n * 10000)) > .001) throw new ApiError(400, `${name}: قيمة غير صالحة (حتى أربع خانات عشرية)`); return n;
}
export async function save(db: Database, table: Collection, input: any, expected?: number, create = false) {
  const id = validId(input.id || crypto.randomUUID());
  const data = cleanPayload({ ...input, id });
  if (table === 'medicines') {
    numberValue(data.quantity, 'الكمية'); numberValue(data.price, 'السعر');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.expiryDate || '') || !data.commercialName || !data.unit || !data.category) throw new ApiError(400, 'أكمل بيانات الدواء وتاريخ الصلاحية');
  }
  const extra = table === 'medicines' ? [Number(data.quantity), Number(data.price), data.expiryDate, data.isControlled ? 1 : 0] : [];
  const manualLookup = ['item_units','therapeutic_categories'].includes(table) && await usesStoredLookupName(db);
  if(manualLookup){if(typeof data.name!=='string'||!data.name.trim())throw new ApiError(400,'اسم الوحدة أو الفئة مطلوب');extra.push(data.name.trim());}
  const cols = (table === 'medicines' ? ',quantity,price,expiry_date,is_controlled' : '')+(manualLookup?',lookup_name':'');
  if (create) {
    await db.execute(`INSERT INTO \`${table}\` (id,payload${cols}) VALUES (?,?${extra.map(() => ',?').join('')})`, [id, JSON.stringify(data), ...extra]);
  } else {
    if (!Number.isInteger(expected) || expected! < 1) throw new ApiError(409, 'أعد تحميل السجل قبل تعديله', 'VERSION_REQUIRED');
    const assignments = (table === 'medicines' ? ',quantity=?,price=?,expiry_date=?,is_controlled=?' : '')+(manualLookup?',lookup_name=?':'');
    const [r]: any = await db.execute(`UPDATE \`${table}\` SET payload=?,version=version+1${assignments} WHERE id=? AND version=?`, [JSON.stringify(data), ...extra, id, expected]);
    if (!r.affectedRows) throw new ApiError(409, 'تغير السجل على جهاز آخر. حدّث البيانات وأعد المحاولة', 'CONFLICT');
  }
  return one(db, table, id);
}
export async function transaction<T>(db: Database, fn: () => Promise<T>): Promise<T> {
  await db.beginTransaction(); try { const result = await fn(); await db.commit(); return result; } catch (e) { await db.rollback(); throw e; }
}

// Schema capabilities are cached per connection, supporting existing MySQL 8 installations
// and the legacy schema without a process-wide "current database" switch.
const capabilities = new WeakMap<Database, Map<string, Promise<any>>>();
async function columnMetadata(db: Database, table: string, column: string) {
  let cache = capabilities.get(db); if (!cache) { cache = new Map(); capabilities.set(db, cache); }
  const key = table + '.' + column;
  if (!cache.has(key)) cache.set(key, rows(db, 'SELECT EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?', [table,column]).then(r=>r[0]));
  return cache.get(key)!;
}
export async function usesStoredLookupName(db: Database) {
  const col = await columnMetadata(db,'item_units','lookup_name');
  return !!col && !String(col.EXTRA || '').toUpperCase().includes('GENERATED');
}
export async function recordAdministration(db: Database, resident: string, dose: string, day: string, dispense: string) {
  const col = await columnMetadata(db,'dose_administrations','administration_key');
  if (col) {
    const key = Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([resident,dose,day])))).toString('hex');
    await db.execute('INSERT INTO dose_administrations(resident_id,dose_id,administration_date,dispense_id,administration_key) VALUES(?,?,?,?,?)',[resident,dose,day,dispense,key]);
  } else await db.execute('INSERT INTO dose_administrations(resident_id,dose_id,administration_date,dispense_id) VALUES(?,?,?,?)',[resident,dose,day,dispense]);
}
export async function replaceMedicineLookup(db: Database, field: 'unit'|'category', oldName: string, newName: string) {
  const medicines = (await rows(db,'SELECT * FROM medicines ORDER BY id FOR UPDATE')).map(decode);
  for (const med of medicines) if (med[field]===oldName) await save(db,'medicines',{...med,[field]:newName},med._version);
}
