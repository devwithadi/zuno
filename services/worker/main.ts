import 'dotenv/config';
import { connectStorage } from '@zuno/storage';
import { createEditor } from './langchain-editor.js';
import { createInbox } from './inbox.js';
import { createJobs } from './jobs.js';
import { runPipeline } from './pipeline.js';
import { runScheduled } from './scheduler.js';

async function main() {
  const storage = await connectStorage();
  const controller = new AbortController();
  process.once('SIGINT', () => controller.abort());
  process.once('SIGTERM', () => controller.abort());
  try {
    const editor = await createEditor();
    const jobs = await createJobs(storage.db);
    const inbox = await createInbox(storage.db);
    await runScheduled(async () => {
      console.info('worker cycle', await runPipeline({ repository: storage.repository, editor, jobs, inbox }));
    }, { once: process.argv.includes('--once'), signal: controller.signal });
  } finally { await storage.close(); }
}
main().catch(() => {
  console.error('Worker failed; check source availability and local configuration.');
  process.exitCode = 1;
});
