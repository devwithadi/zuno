import type { Story } from '@zuno/shared';

export function richerStory(existing: Story, candidate: Story): Story | undefined {
  if (!sameSourceVersion(existing, candidate)) return undefined;
  const before = existing.bullets.map((bullet) => bullet.text).join(' ').length;
  const after = candidate.bullets.map((bullet) => bullet.text).join(' ').length;
  const edited = existing.mode === 'extractive' && candidate.mode !== 'extractive';
  const preserveEdit = existing.mode !== 'extractive' && candidate.mode === 'extractive';
  const contentImproved = !preserveEdit && (edited ||
    (candidate.bullets.length >= existing.bullets.length && after > before));
  const candidateIsAvatar = candidate.image.credit?.includes('owner avatar');
  const existingIsAvatar = existing.image.credit?.includes('owner avatar');
  const keepCover = existing.image.url && (!candidate.image.url ||
    (candidateIsAvatar && !existingIsAvatar));
  const image = keepCover ? existing.image : candidate.image;
  const imageImproved = !!image.url && image.url !== existing.image.url;
  if (!imageImproved && !contentImproved) return undefined;
  return { ...existing, title: contentImproved ? candidate.title : existing.title,
    bullets: contentImproved ? candidate.bullets : existing.bullets,
    readingSeconds: contentImproved ? candidate.readingSeconds : existing.readingSeconds,
    mode: contentImproved ? candidate.mode : existing.mode, image,
    updatedAt: candidate.updatedAt, publishedAt: existing.publishedAt };
}
function sameSourceVersion(existing: Story, candidate: Story): boolean {
  if (existing.id !== candidate.id || (existing.title !== candidate.title && existing.mode === 'extractive' && candidate.mode === 'extractive') || existing.topic !== candidate.topic ||
      existing.sources.length !== candidate.sources.length) return false;
  return existing.sources.every((source) => candidate.sources.some((entry) =>
    source.id === entry.id && source.name === entry.name && source.url === entry.url));
}
