import { StyleSheet, Text, View } from 'react-native';
import type { Story, Topic } from '@zuno/shared';
import { colors, font, topicThemes } from '../theme';
import { SourceLink } from './SourceLink';

type Props = {
  bullets: Story['bullets'];
  sources: Story['sources'];
  onError: () => void;
  topic?: Topic;
};

export function StoryPoints({ bullets, sources, onError, topic = 'ai' }: Props) {
  const theme = topicThemes[topic] || topicThemes.all;
  const citedIds = Array.from(new Set(bullets.flatMap((bullet) => bullet.sourceIds)));

  return (
    <View style={styles.points}>
      {bullets.map((bullet, index) => (
        <View key={index} style={styles.point}>
          <View style={[styles.numBadge, { backgroundColor: theme.light }]}>
            <Text style={[styles.numText, { color: theme.text }]}>{index + 1}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.text}>{bullet.text}</Text>
          </View>
        </View>
      ))}
      {citedIds.length > 0 && (
        <View style={styles.consolidatedRow}>
          <Text style={styles.consolidatedLabel}>Cited sources</Text>
          <View style={styles.citations}>
            {citedIds.map((id) => {
              const sourceIndex = sources.findIndex((source) => source.id === id);
              const source = sources[sourceIndex];
              return (
                source && (
                  <SourceLink
                    key={id}
                    label={`[${sourceIndex + 1}]`}
                    accessibilityLabel={`Open citation ${sourceIndex + 1}: ${source.name}`}
                    url={source.url}
                    compact
                    onError={onError}
                  />
                )
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  points: { gap: 14 },
  point: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  numBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  numText: { fontFamily: font, fontSize: 11, fontWeight: '800' },
  body: { flex: 1, minWidth: 0 },
  text: { fontFamily: font, color: colors.ink, fontSize: 15, lineHeight: 24, fontWeight: '400' },
  consolidatedRow: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  consolidatedLabel: {
    fontFamily: font,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  citations: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
