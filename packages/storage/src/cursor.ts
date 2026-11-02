import { z } from 'zod';

const positionSchema = z.object({
  publishedAt: z.string().datetime().refine((value) => new Date(value).toISOString() === value),
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/),
}).strict();
type Position = z.infer<typeof positionSchema>;

export function encodeCursor(value: Position): string {
  const position = positionSchema.parse({ publishedAt: value.publishedAt, id: value.id });
  return Buffer.from(JSON.stringify(position)).toString('base64url');
}
export function decodeCursor(value: string): Position {
  try {
    if (value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error();
    const position = positionSchema.parse(JSON.parse(Buffer.from(value, 'base64url').toString()));
    if (encodeCursor(position) !== value) throw new Error();
    return position;
  } catch {
    throw new Error('Invalid cursor');
  }
}
