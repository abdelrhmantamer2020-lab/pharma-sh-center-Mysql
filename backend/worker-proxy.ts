// MySQL 5.5 deployments use an HTTPS Express origin rather than Hyperdrive.
export interface ProxyEnvironment { API_ORIGIN: string; ASSETS?: {fetch:(request:Request)=>Promise<Response>}; }
export function createProxyWorker(forward: typeof fetch = fetch) {
  return {
    async fetch(request:Request,env:ProxyEnvironment):Promise<Response> {
      const incoming=new URL(request.url);
      if(!incoming.pathname.startsWith('/api/')) return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found',{status:404});
      let origin:URL;
      try { origin=new URL(env.API_ORIGIN); if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw new Error(); }
      catch {return Response.json({error:'عنوان خادم Express غير مضبوط. يلزم أصل HTTPS فقط.'},{status:503,headers:{'Cache-Control':'no-store'}});}
      const target=new URL(incoming.pathname+incoming.search,origin);
      const headers=new Headers(request.headers);headers.delete('host');headers.set('X-Forwarded-Proto','https');
      try {
        const response=await forward(target,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'manual'});
        const output=new Headers(response.headers);output.set('Cache-Control','no-store');output.set('X-Content-Type-Options','nosniff');
        return new Response(response.body,{status:response.status,headers:output});
      } catch {return Response.json({error:'تعذر الاتصال بخادم Express. تحقق من تشغيله ورابط HTTPS.'},{status:502,headers:{'Cache-Control':'no-store'}});}
    }
  };
}
export default createProxyWorker();
