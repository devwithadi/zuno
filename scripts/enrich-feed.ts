import 'dotenv/config';
import { connectStorage } from '@zuno/storage';
import type { Evidence } from '@zuno/shared';
import { enrichEvidence } from '../services/worker/enrich.js';
import { extractStory, verifyStory } from '../services/worker/editor.js';

const requested = Number(process.argv[2] ?? 100);
const reparse = process.argv.includes('--reparse');
if (!Number.isInteger(requested) || requested < 1 || requested > 3000) {
  throw Error('Choose a refresh count between 1 and 3000');
}
const storage = await connectStorage();
try {
  if (!storage.db) throw Error('Refreshing published content requires MongoDB');
  const cards = await storage.db.collection('stories').find({
    'sources.name': { $in: ['GitHub discovery', 'DEV Community'] },
  }).sort({ publishedAt: -1, id: -1 }).limit(requested).toArray();
  let refreshed = 0;
  let withImages = 0;
  let withDetails = 0;
  for (const card of cards) {
    const row = await storage.db.collection<{ evidence: Evidence }>('evidenceInbox')
      .findOne({ 'evidence.id': card.id }, { sort: { queuedAt: -1 } });
    if (!row) continue;
    const evidence = await enrichEvidence(row.evidence);
    const candidate = verifyStory(extractStory([evidence]), [evidence]);
    const richerEvidence = evidence.text.length > row.evidence.text.length;
    if (candidate.bullets.length < card.bullets.length && !(reparse && richerEvidence)) continue;
    const keepImage = !reparse && card.image.url && (!candidate.image.url ||
      (candidate.image.credit?.includes('owner avatar') && !card.image.credit?.includes('owner avatar')));
    const story = { ...candidate, image: keepImage ? card.image : candidate.image };
    if (await storage.repository.refresh(story)) refreshed += 1;
    if (story.image.url) withImages += 1;
    if (story.bullets.length >= 3) withDetails += 1;
    if (refreshed % 10 === 0) console.info({ refreshed, withImages, withDetails });
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  console.info('Published content refreshed', { refreshed, withImages, withDetails });
} finally { await storage.close(); }
