import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import mysql from 'mysql2/promise';
import { createApp } from './app';
// Hyperdrive bindings are resolved per request; never keep a connection across invocations.
const app = createApp({
  database: () => mysql.createConnection({
    host: env.HYPERDRIVE.host, port: env.HYPERDRIVE.port, user: env.HYPERDRIVE.user,
    password: env.HYPERDRIVE.password, database: env.HYPERDRIVE.database,
    charset:'utf8mb4', timezone:'Z', decimalNumbers:true, disableEval:true
  }),
  secureCookies:true, origin:env.APP_ORIGIN, aiKey:env.GEMINI_API_KEY, timezone:env.CENTER_TIMEZONE
});
app.listen(3000);
export default httpServerHandler({port:3000});
