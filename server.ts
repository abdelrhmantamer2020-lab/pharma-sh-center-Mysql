import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './backend/app';
import { localConnectionOptions } from './backend/db';
import {createPooledDatabase} from './backend/pool';
const databasePool=createPooledDatabase(localConnectionOptions(),Number(process.env.DB_CONNECTION_LIMIT)||2);
process.once('SIGINT',()=>{void databasePool.close().finally(()=>process.exit(0));});
process.once('SIGTERM',()=>{void databasePool.close().finally(()=>process.exit(0));});
const root=path.dirname(fileURLToPath(import.meta.url));
const app=createApp({database:databasePool.database,secureCookies:process.env.COOKIE_SECURE==='true',origin:process.env.APP_ORIGIN,aiKey:process.env.GEMINI_API_KEY,timezone:process.env.CENTER_TIMEZONE});
if(process.env.NODE_ENV==='production') {
  app.use(express.static(path.join(root,'dist'),{index:false}));
  app.get('*',(_req,res)=>res.sendFile(path.join(root,'dist/index.html')));
} else {
  const {createServer}=await import('vite');
  const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
  app.use(vite.middlewares);
  app.get('*',async(req,res,next)=>{try {res.type('html').send(await vite.transformIndexHtml(req.originalUrl,fs.readFileSync(path.join(root,'index.html'),'utf8')));}catch(e){next(e);}});
}
const port=Number(process.env.PORT||3000);
app.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`Pharma MySQL: http://localhost:${port}`));
