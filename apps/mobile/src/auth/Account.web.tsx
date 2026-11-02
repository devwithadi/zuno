import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth, useClerk } from '@clerk/react';
import { colors, font } from '../theme';

function ConfiguredAccount() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn, signOut } = useClerk();
  const [busy, setBusy] = useState(false);

  async function activate() {
    setBusy(true);
    try {
      if (isSignedIn) await signOut();
      else await openSignIn();
    } catch {
      // Keep guest session operational on auth error
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isSignedIn ? 'Sign out' : 'Sign in'}
      disabled={!isLoaded || busy}
      onPress={() => void activate()}
      style={({ pressed }) => [styles.btn, (!isLoaded || busy) && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.btnText}>{isSignedIn ? 'Sign out' : 'Sign in'}</Text>
    </Pressable>
  );
}

export function Account() {
  if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <View style={styles.guestBadge}>
        <Text style={styles.guestText}>Guest</Text>
      </View>
    );
  }
  return <ConfiguredAccount />;
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.lilac,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: font,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  guestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.lilac,
  },
  guestText: {
    fontFamily: font,
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
