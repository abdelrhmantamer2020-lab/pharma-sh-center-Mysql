import mysql, {type ConnectionOptions, type PoolConnection} from 'mysql2/promise';
import {ApiError,type Database} from './db';
// Node/Express only. Workers keep their request-scoped Hyperdrive connection.
export function createPooledDatabase(options:ConnectionOptions,limit=2){
  const size=Math.max(1,Math.min(6,Math.floor(limit)||2));
  const pool=mysql.createPool({...options,connectionLimit:size,maxIdle:size,idleTimeout:60000,waitForConnections:true,queueLimit:32,enableKeepAlive:true,keepAliveInitialDelay:0});
  async function acquire(){
    let expired=false;
    return new Promise<PoolConnection>((resolve,reject)=>{
      const timer=setTimeout(()=>{expired=true;reject(new ApiError(503,'الخادم مشغول. حاول بعد لحظات.','POOL_BUSY'));},Number(options.connectTimeout)||30000);
      pool.getConnection().then(c=>{clearTimeout(timer);if(expired)c.release();else resolve(c);},e=>{clearTimeout(timer);reject(e);});
    });
  }
  return {close:()=>pool.end(),database:async():Promise<Database>=>{
    const connection=await acquire();let pending=0,transaction=false,closing=false,released=false;
    let done:()=>void;const closed=new Promise<void>(resolve=>{done=resolve;});
    function releaseIfIdle(){if(closing&&!pending&&!transaction&&!released){released=true;connection.release();done();}}
    const operations=new Set(['execute','query','beginTransaction','commit','rollback']);
    return new Proxy(connection,{get(target,key){
      if(key==='end')return()=>{closing=true;releaseIfIdle();return closed;};
      if(operations.has(String(key)))return async(...args:any[])=>{
        if(released||(closing&&!transaction))throw new ApiError(503,'انتهى طلب الاتصال','CONNECTION_RELEASED');
        pending++;
        try {const result=await (target[key as keyof PoolConnection] as any).apply(target,args);if(key==='beginTransaction')transaction=true;if(key==='commit'||key==='rollback')transaction=false;return result;}
        catch(e){if(key==='commit'||key==='rollback')transaction=false;throw e;}
        finally{pending--;releaseIfIdle();}
      };
      const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
    }}) as unknown as Database;
  }};
}
