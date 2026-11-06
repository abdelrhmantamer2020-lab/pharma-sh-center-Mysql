declare module 'cloudflare:workers' {
  export const env: { HYPERDRIVE: { host:string;port:number;user:string;password:string;database:string }; CENTER_TIMEZONE?:string; APP_ORIGIN?:string; GEMINI_API_KEY?:string };
}
declare module 'cloudflare:node' {
  export function httpServerHandler(options:{port:number}):{fetch:(request:Request,env?:unknown,ctx?:unknown)=>Promise<Response>};
}
