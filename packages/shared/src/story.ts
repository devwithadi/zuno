import { z } from 'zod';

export const topicSchema = z.enum(['ai', 'technology', 'business', 'markets']);
export type Topic = z.infer<typeof topicSchema>;
export const publicUrlSchema = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password;
}, 'Expected a public HTTPS URL');
export const citationSchema = z.object({
  id: z.string().min(1).max(128),
  name: z.string().min(1).max(120),
  url: publicUrlSchema,
});
export const storySchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/),
  title: z.string().min(8).max(160),
  topic: topicSchema,
  bullets: z.array(z.object({
    text: z.string().min(8).max(650),
    sourceIds: z.array(z.string()).min(1).max(5),
  })).min(1).max(5),
  sources: z.array(citationSchema).min(1).max(10),
  image: z.object({
    url: publicUrlSchema.optional(),
    alt: z.string().min(1).max(240),
    credit: z.string().max(160).optional(),
  }),
  publishedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  readingSeconds: z.number().int().min(1).max(300),
  mode: z.enum(['extractive', 'langchain', 'deepagents', 'reviewed']),
}).superRefine((story, context) => {
  const ids = new Set(story.sources.map((source) => source.id));
  if (story.bullets.some((bullet) => bullet.sourceIds.some((id) => !ids.has(id)))) {
    context.addIssue({ code: 'custom', message: 'Every citation must reference supplied evidence' });
  }
});
export type Story = z.infer<typeof storySchema>;
