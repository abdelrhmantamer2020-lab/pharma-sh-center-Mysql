import { useEffect, useState } from 'react';
export const databaseInfo={projectId:'MySQL',authDomain:'Session authentication',storageBucket:'MySQL',appId:'pharma-sh-center',measurementId:'Local / Cloudflare'};
export function useDatabaseStatus(){
  const [connected,setConnected]=useState(false);
  useEffect(()=>{
    let active=true,pending=false;
    const check=async()=>{if(pending||document.visibilityState!=='visible')return;pending=true;try{const r=await fetch('/api/health',{cache:'no-store'});if(active)setConnected(r.ok);}catch{if(active)setConnected(false);}finally{pending=false;}};
    const update=(e:Event)=>{if(active)setConnected(!!(e as CustomEvent).detail);};
    void check();const timer=setInterval(check,120000);window.addEventListener('pharma-api-status',update);
    return()=>{active=false;clearInterval(timer);window.removeEventListener('pharma-api-status',update);};
  },[]);
  return connected;
}
