import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Story } from '@zuno/shared';
import { colors, font, topicNames, topicThemes } from '../theme';

type Props = { story: Story; active: boolean; onSelect: () => void };

export function DesktopFeedItem({ story, active, onSelect }: Props) {
  const theme = topicThemes[story.topic] || topicThemes.all;
  const date = new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const readTime = `${Math.max(1, Math.ceil(story.readingSeconds / 60))} min read`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Select story: ${story.title}`}
      accessibilityState={{ selected: active }}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.item,
        active && [styles.activeItem, { backgroundColor: theme.light, borderColor: theme.accent }],
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.meta}>
        <View style={[styles.topicBadge, { backgroundColor: theme.light }]}>
          <Text style={[styles.topicText, { color: theme.text }]}>{topicNames[story.topic]}</Text>
        </View>
        <Text style={styles.sourceText} numberOfLines={1}>{story.sources[0]?.name}</Text>
        <Text style={styles.metaText}>{readTime}</Text>
      </View>
      <Text style={[styles.title, active && styles.activeTitle]} numberOfLines={2}>
        {story.title}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.pointsCount, { color: theme.accent }]}>{story.bullets.length} key points</Text>
        <Text style={styles.metaText}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  activeItem: {
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  pressed: { opacity: 0.75 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  topicBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  topicText: { fontFamily: font, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  sourceText: { fontFamily: font, fontSize: 11, color: colors.muted, flexShrink: 1 },
  metaText: { fontFamily: font, fontSize: 11, color: colors.subtle },
  title: { fontFamily: font, fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.ink },
  activeTitle: { color: colors.ink, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  pointsCount: { fontFamily: font, fontSize: 11, fontWeight: '600' },
});
