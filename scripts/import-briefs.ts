import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { connectStorage } from '@zuno/storage';
import { storySchema, type Evidence } from '@zuno/shared';
import { reviewSchema } from '../services/worker/review.js';
import { verifyStory } from '../services/worker/editor.js';
import { hasBriefDepth } from '../services/worker/depth.js';

const schema = z.array(z.object({ id: z.string(), bullets: storySchema.shape.bullets,
  review: reviewSchema }).strict()).min(1).max(100);
const filename = process.argv[2];
if (!filename) throw Error('Provide a reviewed editorial batch JSON file');
const records = schema.parse(JSON.parse(await readFile(filename, 'utf8')));
const storage = await connectStorage();
try {
  if (!storage.db) throw Error('Editorial imports require persistent MongoDB storage');
  const prepared = [];
  for (const record of records) {
    const original = await storage.repository.find(record.id);
    if (!original) throw Error(`Story not found: ${record.id}`);
    const evidence = await Promise.all(original.sources.map(async (source) => {
      const row = await storage.db!.collection<{ evidence: Evidence }>('evidenceInbox')
        .findOne({ 'evidence.id': source.id }, { sort: { queuedAt: -1 } });
      if (!row) throw Error(`Evidence unavailable: ${source.id}`);
      return row.evidence;
    }));
    const readingSeconds = Math.ceil(record.bullets.map((point) => point.text).join(' ').length / 15);
    const story = verifyStory({ ...original, bullets: record.bullets, mode: 'reviewed',
      publishedAt: evidence[0].publishedAt, updatedAt: new Date().toISOString(),
      readingSeconds: Math.max(1, Math.min(300, readingSeconds)) }, evidence, record.review);
    if (!hasBriefDepth(story)) throw Error(`Brief lacks enough detail: ${record.id}`);
    prepared.push({ original, story, review: record.review });
  }
  for (const entry of prepared) {
    await storage.db.collection('editorialHistory').insertOne({
      ...entry, reviewedAt: new Date().toISOString(), source: 'agent-reviewed-import',
    });
    if (!await storage.repository.refresh(entry.story)) throw Error('Story changed during import');
  }
  console.info('Reviewed briefs imported', { count: prepared.length });
} finally { await storage.close(); }
