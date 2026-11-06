import { ApiError } from './db';
const HOSTS=new Set(['api.ultramsg.com','api.callmebot.com','script.google.com','script.googleusercontent.com','api.wapilot.io','wapilot.net','api.wapilot.net','wautopilot.com','api.wautopilot.com']);
// External messaging must never turn the server into an unrestricted HTTP proxy.
export function validateOutboundUrl(value:string|URL){
  let url:URL;try{url=new URL(String(value));}catch{throw new ApiError(400,'رابط الخدمة غير صالح');}
  if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443'||!HOSTS.has(url.hostname))throw new ApiError(400,'استخدم رابط HTTPS لبوابة الإشعارات المعتمدة');return url;
}
export function serviceFetch(value:string|URL,init:RequestInit={}){return fetch(validateOutboundUrl(value),{...init,redirect:'manual',signal:init.signal||AbortSignal.timeout(20000)});}
