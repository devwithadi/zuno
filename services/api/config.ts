import { z } from 'zod';

const originSchema = z.string().url().refine((value) => {
  const url = new URL(value);
  return ['https:', 'http:'].includes(url.protocol) && url.origin === value;
});
const originsSchema = z.array(originSchema).min(1);
const splitOrigins = (value: string) => value.split(',').map((origin) => origin.trim());

export function readApiConfig(environment: Record<string, string | undefined>) {
  const production = environment.NODE_ENV === 'production';
  const secretKey = environment.CLERK_SECRET_KEY || undefined;
  if (production && (!secretKey || !environment.CORS_ORIGINS)) {
    throw new Error('Production requires CLERK_SECRET_KEY and CORS_ORIGINS');
  }
  if (secretKey && !environment.CLERK_AUTHORIZED_PARTIES) {
    throw new Error('Clerk requires CLERK_AUTHORIZED_PARTIES');
  }
  return {
    port: z.coerce.number().int().min(1).max(65535).parse(environment.PORT ?? 3001),
    origins: originsSchema.parse(splitOrigins(environment.CORS_ORIGINS ?? 'http://localhost:8081')),
    authorizedParties: environment.CLERK_AUTHORIZED_PARTIES
      ? originsSchema.parse(splitOrigins(environment.CLERK_AUTHORIZED_PARTIES)) : [],
    secretKey,
    demo: environment.DEMO_MODE === 'true',
  };
}
