import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { colors, font } from '../theme';

type Props = {
  label: string;
  url: string;
  onError: () => void;
  compact?: boolean;
  accessibilityLabel?: string;
};

export function SourceLink({ label, url, onError, compact, accessibilityLabel }: Props) {
  async function open() {
    try {
      await Linking.openURL(url);
    } catch {
      onError();
    }
  }

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? `Open source: ${label}`}
      onPress={() => void open()}
      style={({ pressed }) => [styles.link, compact && styles.citation, pressed && styles.pressed]}
    >
      <Text style={[styles.text, compact && styles.compact]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    minHeight: 38,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.violetLight,
    alignSelf: 'flex-start',
  },
  citation: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: colors.lilac,
  },
  pressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
  text: {
    fontFamily: font,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.violet,
  },
  compact: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.muted,
  },
});
