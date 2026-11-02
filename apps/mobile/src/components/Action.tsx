import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font } from '../theme';

type Props = { label: string; onPress: () => void; disabled?: boolean; subtle?: boolean };
export function Action({ label, onPress, disabled, subtle }: Props) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => [styles.button, subtle && styles.subtle,
      focused && styles.focused, pressed && styles.pressed, disabled && styles.disabled]}>
    <Text style={[styles.label, subtle && styles.subtleLabel]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 44, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 2,
    borderColor: 'transparent', borderRadius: 10, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center' },
  subtle: { backgroundColor: colors.lilac },
  focused: { borderColor: colors.violet },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  label: { color: colors.paper, fontFamily: font, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  subtleLabel: { color: colors.ink },
});
