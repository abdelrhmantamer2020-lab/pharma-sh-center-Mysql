import React from 'react';
export const RECORD_PAGE_SIZE=50;
export function pageIndex(page:number,total:number){return Math.min(page,Math.max(0,Math.ceil(total/RECORD_PAGE_SIZE)-1));}
export function pageRows<T>(rows:T[],page:number){const p=pageIndex(page,rows.length);return rows.slice(p*RECORD_PAGE_SIZE,(p+1)*RECORD_PAGE_SIZE);}
export function RecordPager({page,total,onChange,lang}:{page:number;total:number;onChange:(page:number)=>void;lang:string}){
  if(total<=RECORD_PAGE_SIZE)return null;const current=pageIndex(page,total),pages=Math.ceil(total/RECORD_PAGE_SIZE);
  return <nav aria-label={lang==='ar'?'صفحات السجلات':'Record pages'} className="flex items-center justify-center gap-4 py-3 text-xs print:hidden">
    <button type="button" disabled={current===0} onClick={()=>onChange(current-1)} className="rounded-lg px-3 py-2 bg-slate-700 text-white disabled:opacity-40">{lang==='ar'?'السابق':'Previous'}</button>
    <span>{current+1} / {pages} · {total} {lang==='ar'?'سجل':'records'}</span>
    <button type="button" disabled={current+1>=pages} onClick={()=>onChange(current+1)} className="rounded-lg px-3 py-2 bg-slate-700 text-white disabled:opacity-40">{lang==='ar'?'التالي':'Next'}</button>
  </nav>;
}
