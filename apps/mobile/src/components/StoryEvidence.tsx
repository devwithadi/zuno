import { StyleSheet, Text, View } from 'react-native';
import type { Story, Topic } from '@zuno/shared';
import { colors, font, topicThemes } from '../theme';
import { SourceLink } from './SourceLink';

type Props = {
  sources: Story['sources'];
  mode: Story['mode'];
  onError: () => void;
  desktop?: boolean;
  topic?: Topic;
};

export function StoryEvidence({ sources, mode, onError, desktop = false, topic = 'ai' }: Props) {
  const theme = topicThemes[topic] || topicThemes.all;

  return (
    <View style={[styles.container, desktop && [styles.desktopContainer, { backgroundColor: theme.light, borderColor: theme.border }]]}>
      <View style={styles.heading}>
        <Text style={styles.sourceLabel}>Original sources</Text>
        <Text style={styles.detail}>{mode === 'extractive' ? 'Source excerpt' : 'Edited brief'}</Text>
      </View>
      <View style={styles.links}>
        {sources.map((source, index) => (
          <SourceLink
            key={source.id}
            label={`[${index + 1}] ${source.name} ↗`}
            url={source.url}
            onError={onError}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderColor: colors.line },
  desktopContainer: {
    marginTop: 0,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
  },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceLabel: { fontFamily: font, fontSize: 12, lineHeight: 16, fontWeight: '700', color: colors.ink },
  detail: { fontFamily: font, color: colors.muted, fontSize: 12, lineHeight: 16 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
