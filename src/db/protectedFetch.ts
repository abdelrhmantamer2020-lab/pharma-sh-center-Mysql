// All application APIs are same-origin for both LAN and Cloudflare deployments.
export function protectedFetch(input:RequestInfo|URL,init:RequestInit={}){
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(!url.startsWith('/api/'))throw new Error('إرسال الإشعارات يتم عبر الخادم فقط. اضبط القناة من إعدادات النظام.');
  const headers=new Headers(init.headers);headers.set('X-Pharma-Request','1');
  return fetch(input,{...init,headers,credentials:'same-origin'});
}
