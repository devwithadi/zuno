import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/react';

const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
export function AuthProvider({ children }: { children: ReactNode }) {
  return key ? <ClerkProvider publishableKey={key}>{children}</ClerkProvider> : <>{children}</>;
}
