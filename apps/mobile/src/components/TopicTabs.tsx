import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { Filter } from '../feed/client';
import { colors, font, topicNames, topicThemes } from '../theme';

export function TopicTabs({ topic, onChange }: { topic: Filter; onChange: (topic: Filter) => void }) {
  const [focused, setFocused] = useState<Filter | null>(null);
  return <ScrollView horizontal showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row} accessibilityLabel="Filter stories by topic">
    {(Object.keys(topicNames) as Filter[]).map((key) => {
      const theme = topicThemes[key];
      const selected = topic === key;
      return (
        <Pressable key={key}
          accessibilityRole="tab" accessibilityState={{ selected }}
          onPress={() => onChange(key)} onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
          style={({ pressed }) => [styles.tab, selected && [styles.active, theme && { backgroundColor: theme.accent, borderColor: theme.accent }],
            focused === key && styles.focused, pressed && styles.pressed]}>
          <Text style={[styles.label, selected && styles.selected]}>{topicNames[key]}</Text>
        </Pressable>
      );
    })}
  </ScrollView>;
}
const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 8, paddingHorizontal: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 38, borderRadius: 20,
    borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper,
    justifyContent: 'center', alignItems: 'center' },
  active: { backgroundColor: colors.ink, borderColor: colors.ink },
  focused: { borderColor: colors.violet },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  label: { color: colors.muted, fontFamily: font, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  selected: { color: colors.paper },
});
