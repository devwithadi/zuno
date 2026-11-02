import 'dotenv/config';
import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { verifyToken } from '@clerk/backend';
import { connectStorage } from '@zuno/storage';
import { createApp } from './app.js';
import { readApiConfig } from './config.js';

const config = readApiConfig(process.env);
const storage = await connectStorage();
const app = createApp({
  repository: storage.repository,
  origins: config.origins,
  demo: config.demo,
  verifyToken: config.secretKey ? (token) => verifyToken(token, {
    secretKey: config.secretKey, authorizedParties: config.authorizedParties,
  }) : undefined,
  rateKey: (context) => getConnInfo(context).remote.address ?? 'unknown',
  onError: (error) => console.error('API request failed:', error.name),
});
const server = serve({ fetch: app.fetch, port: config.port }, () => {
  console.log(`Zuno API listening on http://localhost:${config.port}`);
});
const stop = () => server.close(() => {
  void storage.close().then(() => process.exit(0), () => process.exit(1));
});
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
