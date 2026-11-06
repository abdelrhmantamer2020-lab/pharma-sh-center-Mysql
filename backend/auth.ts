import { ApiError, rows, type Database } from './db';
export const PRIVILEGED = ['developer', 'admin'];
const hex = (a: ArrayBuffer | Uint8Array) => Buffer.from(a instanceof Uint8Array ? a : new Uint8Array(a)).toString('hex');
export async function digest(value: string) { return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))); }
// Plaintext database passwords are an explicit deployment requirement.
// This validation applies to new passwords; imports preserve existing values unchanged.
export function validatePassword(password: string): string {
  if(typeof password !== 'string' || password.length < 4 || password.length > 256)throw new ApiError(400,'كلمة المرور يجب أن تكون من 4 إلى 256 حرفًا');
  return password;
}
export function verifyPassword(password: unknown, stored: string): boolean {
  if(typeof password !== 'string' || password.length > 256 || typeof stored !== 'string')return false;
  let diff=password.length ^ stored.length;
  for(let i=0;i<stored.length;i++)diff|=(password.charCodeAt(i)||0)^stored.charCodeAt(i);
  return diff===0;
}
export function publicUser(row: any) {
  const p = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload || {};
  delete p.password; delete p.passwordHash; delete p.password_hash;
  return { ...p, id: row.id, uid: row.id, name: row.name, email: row.email, role: row.role, isActive: !!row.is_active, _version: Number(row.version) };
}
export function requireRole(user: any, roles: string[]) { if (!user || !roles.includes(user.role)) throw new ApiError(403, 'ليست لديك صلاحية لتنفيذ هذا الإجراء', 'FORBIDDEN'); }
export function cookieToken(cookie = '') { return cookie.split(';').map(s => s.trim()).find(s => s.startsWith('pharma_session='))?.slice(15) || ''; }
export async function authenticate(db: Database, cookie: string) {
  const token = cookieToken(cookie); if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await rows(db, 'SELECT u.*,s.token_hash,s.client_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP() AND u.is_active=1', [await digest(token)]);
  return result[0] ? { ...publicUser(result[0]), tokenHash: result[0].token_hash, clientId: result[0].client_id } : null;
}
export function sessionCookie(token: string, secure: boolean, remember: boolean) {
  return `pharma_session=${token}; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}${remember ? '; Max-Age=2592000' : ''}`;
}
