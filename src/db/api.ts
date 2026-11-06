let cacheEpoch=0;
export const cache: Record<string, any[]> = Object.create(null);
export function cachedList(table:string):any[]{return cache[table] || [];}
export function rememberList(table:string,data:any[]){cache[table]=data;return data;}
export function clearCache(){cacheEpoch++;for(const key of Object.keys(cache))delete cache[key];}
export class ApiClientError extends Error {constructor(public status:number,public code:string,message:string){super(message);}}
export async function api<T=any>(path:string,method='GET',body?:any,headers:Record<string,string>={}):Promise<T>{
  const requestEpoch=cacheEpoch;
  let response:Response;
  try {response=await fetch(path,{method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Pharma-Request':'1',...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});}
  catch {window.dispatchEvent(new CustomEvent('pharma-api-status',{detail:false}));throw new ApiClientError(0,'NETWORK','تعذر الاتصال بالخادم. لم يتم تأكيد الحفظ؛ حدّث البيانات قبل إعادة المحاولة.');}
  if(response.ok)window.dispatchEvent(new CustomEvent('pharma-api-status',{detail:true}));
  const result=await response.json();
  if(!response.ok){
    if(response.status===401&&path!=='/api/auth/login'){clearCache();window.dispatchEvent(new Event('pharma-session-ended'));}
    const error=new ApiClientError(response.status,result.code,result.error||'تعذر إتمام الطلب');
    if(method!=='GET'&&path!=='/api/bootstrap')window.dispatchEvent(new CustomEvent('pharma-write-error',{detail:error.message}));
    throw error;
  }
  if(requestEpoch!==cacheEpoch&&!path.startsWith('/api/auth/'))throw new ApiClientError(0,'CANCELLED','انتهت جلسة الطلب');
  return result;
}
