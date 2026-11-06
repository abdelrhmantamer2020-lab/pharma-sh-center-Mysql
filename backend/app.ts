import express, { type Request, type Response, type NextFunction } from 'express';
import { ApiError, COLLECTIONS, collectionName, list, one, rows, save, replaceMedicineLookup, recordAdministration, transaction, cleanPayload, validId, type Database, type RuntimeConfig } from './db';
import { authenticate, digest, validatePassword, verifyPassword, publicUser, requireRole, PRIVILEGED, sessionCookie } from './auth';
import { audit, dispense } from './inventory';
import {revisions,readCollections} from './bootstrap';
import { registerLegacyRoutes } from './legacy-routes';
export interface ApiRequest extends Request { db: Database; actor: any; }
const wrap = (fn: (req: ApiRequest, res: Response, next: NextFunction) => any) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req as ApiRequest, res, next)).catch(next);
const SECRET_KEYS=['ultraMsgToken','callMeBotApiKey','waPilotApiKey'];
function redactSettings(d:any){const safe={...d};for(const k of SECRET_KEYS){safe[k]='';safe[k+'Configured']=!!d[k];}return safe;}
const medical = ['developer','admin','pharmacist','technician'];
function permission(actor: any, table: string, write = false, remove = false) {
  if (['security_settings','system_settings','settings','user_sessions'].includes(table)) requireRole(actor, PRIVILEGED);
  if (write) {
    if (['dispense_records','stock_audit_logs','user_sessions'].includes(table)) throw new ApiError(403, 'هذا السجل يدار آليًا بواسطة الخادم');
    requireRole(actor, ['item_units','therapeutic_categories','security_settings','system_settings','settings'].includes(table) || (remove && !['doctors','behavior_logs'].includes(table)) ? PRIVILEGED : table==='behavior_logs'?medical:['developer','admin','pharmacist']);
  }
}
export function createApp(config: RuntimeConfig) {
  const app = express(); app.disable('x-powered-by');
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      if (req.headers['x-pharma-request'] !== '1') return res.status(403).json({error:'طلب غير مسموح',code:'CSRF'});
      const origin = req.headers.origin;
      const expected = config.origin || `${config.secureCookies?'https':req.protocol}://${req.get('host')}`;
      if (origin && origin !== expected) return res.status(403).json({error:'مصدر الطلب غير مسموح',code:'CSRF'});
    }
    next();
  });
  app.use(express.json({limit:'20mb'})); app.use(express.urlencoded({extended:false,limit:'20mb'}));
  app.get('/api/health', wrap(async (_req,res) => { const db=await config.database(); try { await db.query('SELECT 1'); res.json({ok:true,database:'mysql',timezone:config.timezone || 'Asia/Riyadh'}); } finally { await db.end(); } }));
  app.use('/api', wrap(async (req,res,next) => {
    req.db=await config.database(); let ended=false; const end=() => { if(!ended){ended=true;void req.db.end().catch(()=>{});} }; res.once('finish',end);res.once('close',end);
    if(req.path !== '/auth/login') { req.actor=await authenticate(req.db,req.headers.cookie || ''); if(!req.actor) throw new ApiError(401,'سجل الدخول أولًا','UNAUTHENTICATED'); }
    next();
  }));
  app.post('/api/auth/login',wrap(async(req,res)=>{
    const {email,password,force=false,remember=false,clientId}=req.body;
    if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>256) throw new ApiError(400,'بيانات الدخول غير صالحة');
    const normalized=email.trim().toLowerCase();
    const key=await digest(`${req.ip}|${normalized}`);
    // A database row serializes concurrent login attempts across Worker isolates.
    const result = await transaction(req.db,async()=>{
      await req.db.execute('INSERT IGNORE INTO login_attempts(attempt_key,failures,window_start) VALUES(?,0,UTC_TIMESTAMP())',[key]);
      let [a]=await rows(req.db,'SELECT *,TIMESTAMPDIFF(SECOND,window_start,UTC_TIMESTAMP()) AS age FROM login_attempts WHERE attempt_key=? FOR UPDATE',[key]);
      if(a.age>=900){await req.db.execute('UPDATE login_attempts SET failures=0,window_start=UTC_TIMESTAMP() WHERE attempt_key=?',[key]);a.failures=0;}
      if(a.failures>=5) return {error:new ApiError(429,'محاولات كثيرة. حاول بعد 15 دقيقة','RATE_LIMITED')};
      const [user]=await rows(req.db,'SELECT * FROM users WHERE email=? FOR UPDATE',[normalized]);
      // Password comparison is server-side; original textual values remain in MySQL.
      const ok=await verifyPassword(password,user?.password || 'invalid-password');
      if(!user||!user.is_active||!ok){await req.db.execute('UPDATE login_attempts SET failures=failures+1 WHERE attempt_key=?',[key]); return {error:new ApiError(401,'البريد أو كلمة المرور غير صحيحة','BAD_CREDENTIALS')};}
      const active=await rows(req.db,'SELECT *,TIMESTAMPDIFF(SECOND,last_heartbeat,UTC_TIMESTAMP()) AS age FROM sessions WHERE user_id=? AND expires_at>UTC_TIMESTAMP()',[user.id]);
      if(active.length&&active[0].age<90&&!force) return {error:new ApiError(409,'الحساب نشط على جهاز آخر. يمكنك إنهاء الجلسة السابقة بعد التحقق بكلمة المرور','SESSION_CONFLICT')};
      const token=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');
      await req.db.execute('DELETE FROM sessions WHERE user_id=?',[user.id]);
      await req.db.execute('INSERT INTO sessions(token_hash,user_id,client_id,ip_address,user_agent,created_at,last_heartbeat,expires_at) VALUES(?,?,?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP(),DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? DAY))',[await digest(token),user.id,validId(clientId || crypto.randomUUID()),req.ip || '',req.headers['user-agent'] || '',remember?30:1]);
      await req.db.execute('DELETE FROM login_attempts WHERE attempt_key=?',[key]);
      await save(req.db,'user_sessions',{id:crypto.randomUUID(),userId:user.id,name:user.name,email:user.email,ipAddress:req.ip || '',deviceToken:clientId || '',loginTime:new Date().toISOString()},undefined,true);
      return {token,user:publicUser(user)};
    });
    if(result.error) throw result.error;
    res.setHeader('Set-Cookie',sessionCookie(result.token!,config.secureCookies,!!remember));res.json({user:result.user});
  }));
  app.get('/api/auth/me',wrap(async(req,res)=>{const {tokenHash,clientId,...user}=req.actor;res.json({user});}));
  app.post('/api/auth/logout',wrap(async(req,res)=>{await req.db.execute('DELETE FROM sessions WHERE token_hash=?',[req.actor.tokenHash]);res.setHeader('Set-Cookie',sessionCookie('',config.secureCookies,false)+'; Max-Age=0');res.json({success:true});}));
  app.post('/api/auth/password',wrap(async(req,res)=>{
    await transaction(req.db,async()=>{
      const [u]=await rows(req.db,'SELECT * FROM users WHERE id=? FOR UPDATE',[req.actor.uid]);
      if(!await verifyPassword(req.body.currentPassword,u.password)) throw new ApiError(400,'كلمة المرور الحالية غير صحيحة');
      await req.db.execute('UPDATE users SET password=?,version=version+1 WHERE id=?',[validatePassword(req.body.newPassword),u.id]);
      await audit(req.db,req.actor,'تغيير كلمة المرور');
    });res.json({success:true});
  }));
  app.post('/api/sessions/heartbeat',wrap(async(req,res)=>{await req.db.execute('UPDATE sessions SET last_heartbeat=UTC_TIMESTAMP() WHERE token_hash=?',[req.actor.tokenHash]);res.json({active:true,success:true});}));
  app.post('/api/sessions/claim',wrap(async(_req,res)=>{res.json({success:true});}));
  app.get('/api/sessions/active',wrap(async(req,res)=>{requireRole(req.actor,PRIVILEGED);res.json(await rows(req.db,'SELECT user_id AS userId,client_id AS sessionId,ip_address AS ipAddress,last_heartbeat AS lastHeartbeat FROM sessions WHERE expires_at>UTC_TIMESTAMP()'));}));
  app.get('/api/ip',wrap(async(req,res)=>{res.json({ip:req.ip});}));
  app.get('/api/users',wrap(async(req,res)=>{
    requireRole(req.actor,PRIVILEGED);res.json((await rows(req.db,'SELECT * FROM users ORDER BY name')).map(publicUser));
  }));
  app.post('/api/users',wrap(async(req,res)=>{res.json(await writeUser(req,true));}));
  app.put('/api/users/:id',wrap(async(req,res)=>{res.json(await writeUser(req,false));}));
  async function writeUser(req:ApiRequest,create:boolean){
    requireRole(req.actor,PRIVILEGED);const d=req.body;
    if(!medical.includes(d.role)||!d.name||typeof d.email!=='string'||!/^\S+@\S+\.\S+$/.test(d.email)||d.email.length>191) throw new ApiError(400,'بيانات المستخدم غير مكتملة');
    const id=validId(create?(d.uid||d.id||crypto.randomUUID()):req.params.id);
    return transaction(req.db,async()=>{
      const [old]=await rows(req.db,'SELECT * FROM users WHERE id=? FOR UPDATE',[id]);
      if((d.role==='developer'||old?.role==='developer')&&req.actor.role!=='developer') throw new ApiError(403,'إدارة حسابات المبرمج للمبرمج فقط');
      if(id===req.actor.uid&&(d.role!==req.actor.role||d.isActive===false||d.status==='inactive')) throw new ApiError(400,'لا يمكن تعطيل حسابك الحالي أو تغيير دوره');
      const hash=d.password ? validatePassword(d.password) : old?.password;
      if(!hash) throw new ApiError(400,'حدد كلمة مرور قوية للمستخدم الجديد');
      const values=[d.email.trim().toLowerCase(),d.name,d.role,hash,d.isActive===false||d.status==='inactive'?0:1,JSON.stringify(cleanPayload(d))];
      if(create) await req.db.execute('INSERT INTO users(email,name,role,password,is_active,payload,id) VALUES(?,?,?,?,?,?,?)',[...values,id]);
      else {
        if(!old||Number(old.version)!==d._version) throw new ApiError(409,'حدّث بيانات المستخدم ثم أعد المحاولة');
        await req.db.execute('UPDATE users SET email=?,name=?,role=?,password=?,is_active=?,payload=?,version=version+1 WHERE id=?',[...values,id]);
        // Permission/password changes invalidate old sessions immediately.
        if(id!==req.actor.uid) await req.db.execute('DELETE FROM sessions WHERE user_id=?',[id]);
      }
      await audit(req.db,req.actor,create?'إضافة مستخدم':'تعديل مستخدم',{targetUserId:id});
      return publicUser((await rows(req.db,'SELECT * FROM users WHERE id=?',[id]))[0]);
    });
  }
  app.delete('/api/users/:id',wrap(async(req,res)=>{
    requireRole(req.actor,PRIVILEGED);if(req.params.id===req.actor.uid)throw new ApiError(400,'لا يمكن حذف حسابك الحالي');
    await transaction(req.db,async()=>{const [target]=await rows(req.db,'SELECT * FROM users WHERE id=? FOR UPDATE',[req.params.id]);
      if(!target)throw new ApiError(404,'المستخدم غير موجود');if(target.role==='developer'&&req.actor.role!=='developer')throw new ApiError(403,'لا يمكنك حذف المبرمج');
      await req.db.execute('UPDATE users SET is_active=0,version=version+1 WHERE id=?',[req.params.id]);await req.db.execute('DELETE FROM sessions WHERE user_id=?',[req.params.id]);await audit(req.db,req.actor,'إلغاء حساب مستخدم',{targetUserId:req.params.id});});res.json({success:true});
  }));
  app.post('/api/bootstrap',wrap(async(req,res)=>{
    const scopes=Array.isArray(req.body.scopes)?req.body.scopes:['core'];
    const groups:Record<string,string[]>={core:['medicines','residents','doctors','pharmaceutical_companies','custom_side_effects','item_units','therapeutic_categories'],history:['dispense_records','behavior_logs'],audit:['stock_audit_logs'],admin:['user_sessions']};
    if(PRIVILEGED.includes(req.actor.role))groups.core.push('security_settings');
    if(scopes.includes('admin'))requireRole(req.actor,PRIVILEGED);
    if(scopes.some((scope:any)=>!Object.hasOwn(groups,scope)))throw new ApiError(400,'مجموعة تحميل غير معروفة');
    const tables=[...new Set<string>(scopes.flatMap((scope:string)=>groups[scope]))].map(collectionName);
    const current=await revisions(req.db,tables);const known=req.body.known||{};
    const changed=tables.filter(t=>known[t]!==current[t]);
    const collections=await readCollections(req.db,changed);
    if(collections.security_settings)collections.security_settings=collections.security_settings.map(redactSettings);
    if(scopes.includes('admin')){
      // Users contain no passwords in browser responses. Small administrative list only.
      const users=(await rows(req.db,'SELECT * FROM users ORDER BY name')).map(publicUser);
      const revision=users.map(u=>u.uid+':'+u._version).join('|');
      current.users=revision;if(known.users!==revision)collections.users=users;
    }
    res.json({collections,revisions:current,serverTime:new Date().toISOString()});
  }));
  app.get('/api/data/:table',wrap(async(req,res)=>{const table=collectionName(req.params.table);permission(req.actor,table);const data=await list(req.db,table);res.json(table==='security_settings'?data.map(redactSettings):data);}));
  const write= (create:boolean)=>wrap(async(req,res)=>{
    const table=collectionName(req.params.table);permission(req.actor,table,true);
    const result=await transaction(req.db,async()=>{
      const id=validId(create?(req.body.id||crypto.randomUUID()):req.params.id);
      const old=await one(req.db,table,id,true);
      if(req.actor.role==='technician'&&table==='medicines'&&(old?.isControlled||req.body.isControlled))throw new ApiError(403,'إدارة الأدوية المقيدة للصيدلي أو المدير');
      const data={...req.body,id,updatedAt:new Date().toISOString(),...(create?{createdAt:new Date().toISOString()}:{})};
      if(table==='residents'&&old) {
        // Administration status is server-owned; stale schedule saves cannot undo a dose.
        const oldMap=new Map((old.dosageSchedule||[]).map((d:any)=>[d.id,d]));
        data.dosageSchedule=(data.dosageSchedule||[]).map((d:any)=>{const prev:any=oldMap.get(d.id);return prev?{...d,checkedToday:prev.checkedToday,checkedAt:prev.checkedAt,checkedBy:prev.checkedBy,lastDispensedDate:prev.lastDispensedDate,dispensedQty:prev.dispensedQty}:d;});
      }
      if(table==='security_settings'&&old)for(const k of SECRET_KEYS)if(!data[k])data[k]=old[k];
      if(['item_units','therapeutic_categories'].includes(table)) {
        if(typeof data.name!=='string'||!data.name.trim()||data.name.trim().length>191)throw new ApiError(400,'اسم الوحدة أو الفئة غير صالح');data.name=data.name.trim();
        if(old&&old.name!==data.name){const field=table==='item_units'?'unit':'category';await replaceMedicineLookup(req.db,field,old.name,data.name);}
      }
      const updated=await save(req.db,table,data,req.body._version,create);
      await audit(req.db,req.actor,table==='medicines'?(create?'إضافة دواء جديد':'تعديل دواء'):`تعديل ${table}`,{medicineId:table==='medicines'?id:'',medicineName:updated.commercialName||'',quantityChanged:table==='medicines'?updated.quantity-(old?.quantity||0):0,previousQuantity:old?.quantity||0,newQuantity:updated.quantity||0,targetId:id});return updated;
    });res.json(table==='security_settings'?redactSettings(result):result);
  });
  app.post('/api/data/:table',write(true));app.put('/api/data/:table/:id',write(false));
  app.delete('/api/data/:table/:id',wrap(async(req,res)=>{
    const table=collectionName(req.params.table);permission(req.actor,table,true,true);
    await transaction(req.db,async()=>{const old=await one(req.db,table,req.params.id,true);if(!old)throw new ApiError(404,'السجل غير موجود');if(old._version!==req.body._version)throw new ApiError(409,'تغير السجل. حدّث البيانات قبل الحذف');
      if(['item_units','therapeutic_categories'].includes(table)) {
        const remaining=await rows(req.db,`SELECT * FROM \`${table}\` WHERE id<>? ORDER BY updated_at DESC,id FOR UPDATE`,[req.params.id]);
        if(!remaining.length)throw new ApiError(409,'يجب الإبقاء على وحدة أو فئة واحدة على الأقل');
        const replacement=typeof remaining[0].payload==='string'?JSON.parse(remaining[0].payload):remaining[0].payload;
        const field=table==='item_units'?'unit':'category';await replaceMedicineLookup(req.db,field,old.name,replacement.name);
      }
      await req.db.execute(`DELETE FROM \`${table}\` WHERE id=?`,[req.params.id]);await audit(req.db,req.actor,`حذف ${table}`,{targetId:req.params.id,previousQuantity:old.quantity||0,newQuantity:0});});res.json({success:true});
  }));
  app.post('/api/dispenses',wrap(async(req,res)=>{
    requireRole(req.actor,medical);res.json(await dispense(req.db,req.actor,req.body,String(req.headers['idempotency-key']||''),config.timezone||'Asia/Riyadh'));
  }));
  app.post('/api/audit/notes',wrap(async(req,res)=>{res.json(await audit(req.db,req.actor,'ملاحظة مستخدم',{notes:String(req.body.notes||req.body.actionType||'').slice(0,4000)}));}));
  app.get('/api/backup',wrap(async(req,res)=>{
    requireRole(req.actor,PRIVILEGED);
    const result=await transaction(req.db,async()=>{
      const collections:any={};for(const table of COLLECTIONS)collections[table]=(await list(req.db,table)).map(d=>table==='security_settings'?redactSettings(d):d);
      collections.users=(await rows(req.db,'SELECT * FROM users')).map(publicUser);
      const doseAdministrations=(await rows(req.db,'SELECT * FROM dose_administrations')).map(d=>({...d,administration_date:d.administration_date instanceof Date?d.administration_date.toISOString().slice(0,10):d.administration_date}));
      return {appId:'care-center-pharmacy-v2',backupVersion:'mysql-1',createdAt:new Date().toISOString(),collections,doseAdministrations,counts:Object.fromEntries(Object.entries(collections).map(([k,v]:any)=>[k,v.length])),notice:'User passwords and active sessions are excluded. Use db:export for a complete server backup.'};
    });res.json(result);
  }));
  app.post('/api/restore',wrap(async(req,res)=>{
    requireRole(req.actor,['developer']);
    // Deliberately additive restore: never clears stock history or creates accounts from an uploaded document.
    const source=req.body.collections;if(!source||typeof source!=='object')throw new ApiError(400,'ملف النسخة غير صالح');
    const counts:any={};await transaction(req.db,async()=>{
      for(const table of COLLECTIONS){const data=source[table];if(!Array.isArray(data))continue;
        let added=0;for(const item of data){if(await one(req.db,table,item.id))throw new ApiError(409,`يوجد سجل بنفس المعرف في ${table}. استخدم أداة الاستيراد إلى قاعدة فارغة`);await save(req.db,table,item,undefined,true);added++;}counts[table]=added;}
      for(const d of req.body.doseAdministrations||[])await recordAdministration(req.db,d.resident_id,d.dose_id,d.administration_date,d.dispense_id);
      await audit(req.db,req.actor,'استيراد نسخة احتياطية');
    });res.json({success:true,counts,notice:'لم يتم استيراد حسابات المستخدمين أو الجلسات. استخدم أداة الاستيراد للنسخة الكاملة.'});
  }));
  // Secrets stay server-side and are merged only for notification endpoints.
  app.use('/api/notifications',wrap(async(req,_res,next)=>{
    requireRole(req.actor,PRIVILEGED);const settings=await one(req.db,'security_settings','config');
    if(settings)for(const key of ['ultraMsgToken','callMeBotApiKey','waPilotApiKey','ultraMsgInstance','appsScriptUrl','notificationEmail','whatsAppNumber','waPilotBaseUrl','waPilotType','waPilotDevice','waPilotPath'])if(settings[key])req.body[key]=settings[key];
    if(settings){
      if(req.path==='/send-whatsapp'){req.body.token=settings.ultraMsgToken;req.body.instanceId=settings.ultraMsgInstance;}
      if(req.path==='/send-callmebot')req.body.apiKey=settings.callMeBotApiKey;
      if(req.path==='/send-wapilot'){req.body.apiKey=settings.waPilotApiKey;req.body.baseUrl=settings.waPilotBaseUrl;req.body.type=settings.waPilotType;req.body.deviceId=settings.waPilotDevice;req.body.endpointPath=settings.waPilotPath;}
      if(req.path==='/send-email'){req.body.scriptUrl=settings.appsScriptUrl;req.body.to=settings.notificationEmail;}
    }
    next();
  }));
  registerLegacyRoutes(app,config.aiKey);
  app.use('/api',(_req,res)=>res.status(404).json({error:'المسار غير موجود'}));
  app.use((err:any,_req:Request,res:Response,_next:NextFunction)=>{
    const duplicate=err.code==='ER_DUP_ENTRY';const foreign=err.code==='ER_ROW_IS_REFERENCED_2'||err.code==='ER_NO_REFERENCED_ROW_2';
    const status=err instanceof ApiError?err.status:duplicate||foreign?409:err.type==='entity.too.large'?413:err.status===400?400:500;
    if(status===500)console.error('API failure:',err.code||err.name);
    res.status(status).json({error:err instanceof ApiError?err.message:duplicate?'سجل مكرر':foreign?'السجل مرتبط ببيانات أخرى':status===413?'حجم الطلب أكبر من الحد المسموح':'تعذر إتمام الطلب',code:err instanceof ApiError?err.code:duplicate?'CONFLICT':'SERVER_ERROR'});
  });
  return app;
}
