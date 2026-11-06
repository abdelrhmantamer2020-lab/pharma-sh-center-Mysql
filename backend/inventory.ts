import { digest } from './auth';
import { ApiError, one, rows, save, transaction, numberValue, validId, recordAdministration, type Database } from './db';
export async function audit(db: Database, actor: any, action: string, data: any = {}) {
  return save(db, 'stock_audit_logs', { ...data, id: crypto.randomUUID(), actionType: action,
    performedById: actor.uid, performedByName: actor.name, performedByEmail: actor.email, timestamp: new Date().toISOString() }, undefined, true);
}
export function centerDate(timezone: string) { return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
export async function dispense(db: Database, actor: any, input: any, idempotencyKey: string, timezone: string) {
  validId(idempotencyKey);
  const id = await digest(actor.uid+'|'+idempotencyKey);
  const qty = numberValue(input.actualQuantityDispensed, 'الكمية المصروفة', true);
  validId(input.medicineId);
  return transaction(db, async () => {
    let resident: any = null; let dose: any = null;
    if (input.residentId) {
      resident = await one(db, 'residents', validId(input.residentId), true);
      if (!resident) throw new ApiError(404, 'المستفيد غير موجود');
    }
    if (input.doseId) {
      dose = resident?.dosageSchedule?.find((d: any) => d.id === input.doseId);
      if (!dose || dose.medicineId !== input.medicineId) throw new ApiError(400, 'الجرعة لا تطابق الدواء أو المستفيد');
      const scheduled = dose.quantity ?? dose.qty;
      if (scheduled === undefined) throw new ApiError(400, 'حدد كمية الجرعة الرقمية في جدول المستفيد قبل الصرف');
      if (numberValue(scheduled, 'كمية الجرعة', true) !== qty) throw new ApiError(400, 'كمية الصرف لا تطابق الجرعة المسجلة');
    }
    const med = await one(db, 'medicines', input.medicineId, true);
    if (!med) throw new ApiError(404, 'الدواء غير موجود');
    const existing = await one(db, 'dispense_records', id);
    if (existing) {
      if (existing.medicineId !== input.medicineId || existing.actualQuantityDispensed !== qty || (existing.residentId || '') !== (input.residentId || '') || (existing.doseId || '') !== (input.doseId || '')) throw new ApiError(409, 'مفتاح الطلب مستخدم لعملية أخرى');
      return { record: existing, medicine: med, resident, replayed: true };
    }
    if (actor.role === 'technician' && med.isControlled) throw new ApiError(403, 'لا يسمح للفني بصرف دواء خاضع للرقابة');
    const day = centerDate(timezone);
    if (med.expiryDate < day) throw new ApiError(409, 'لا يمكن صرف دواء منتهي الصلاحية', 'EXPIRED');
    if (qty > med.quantity) throw new ApiError(409, 'الرصيد المتاح لا يكفي للصرف', 'INSUFFICIENT_STOCK');
    if (dose) {
      const done = await rows(db, 'SELECT dispense_id FROM dose_administrations WHERE resident_id=? AND dose_id=? AND administration_date=?', [resident.id, dose.id, day]);
      if (done.length || dose.lastDispensedDate === day || (dose.checkedToday && (dose.checkedAt || '').slice(0,10) === day)) throw new ApiError(409, 'تم صرف هذه الجرعة اليوم بالفعل', 'DUPLICATE_DOSE');
    }
    const now = new Date().toISOString();
    const record = await save(db, 'dispense_records', {
      id, medicineId: med.id, medicineName: med.commercialName, medicineNameEn: med.commercialNameEn || '',
      residentId: resident?.id || '', residentName: resident?.nameAr || resident?.name || input.residentName || '', residentNameEn: resident?.nameEn || '',
      quantityDispensed: numberValue(input.quantityDispensed??qty,'الكمية المطلوبة',true), actualQuantityDispensed: qty, unit: med.unit, totalPrice: Math.round(qty * med.price * 10000) / 10000,
      dispensedBy: actor.name, dispensedById: actor.uid, dispensedAt: now, doseId: dose?.id || '',
      doctorId: input.doctorId || '', doctorName: input.doctorName || '', doctorNameEn: input.doctorNameEn || '', doctorSpecialty: input.doctorSpecialty || ''
    }, undefined, true);
    const updated = await save(db, 'medicines', { ...med, quantity: Math.round((med.quantity - qty)*10000)/10000, updatedAt: now }, med._version);
    if (dose) {
      await recordAdministration(db,resident.id,dose.id,day,id);
      resident = await save(db, 'residents', { ...resident, dosageSchedule: resident.dosageSchedule.map((d: any) => d.id === dose.id ? { ...d, checkedToday: true, checkedAt: now, checkedBy: actor.name, lastDispensedDate: day, dispensedQty: qty } : d) }, resident._version);
    }
    await audit(db, actor, 'صرف دواء لمستفيد', { medicineId: med.id, medicineName: med.commercialName, quantityChanged: -qty, previousQuantity: med.quantity, newQuantity: updated.quantity, notes: `صرف للمستفيد: ${record.residentName}`, dispenseId: id });
    return { record, medicine: updated, resident, replayed: false };
  });
}
