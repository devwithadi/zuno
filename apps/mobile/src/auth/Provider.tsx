import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';

const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
export function AuthProvider({ children }: { children: ReactNode }) {
  return key ? <ClerkProvider publishableKey={key} tokenCache={tokenCache}>
    {children}
  </ClerkProvider> : <>{children}</>;
}
