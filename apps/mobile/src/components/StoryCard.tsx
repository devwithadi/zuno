import { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import type { Story } from '@zuno/shared';
import { topicNames, topicThemes } from '../theme';
import { isDesktopSplit } from '../feed/presentation';
import { StoryVisual } from './StoryVisual';
import { StoryPoints } from './StoryPoints';
import { StoryEvidence } from './StoryEvidence';
import { storyStyles as styles } from './StoryCard.styles';

export function StoryCard({ story }: { story: Story; featured?: boolean }) {
  const [linkError, setLinkError] = useState(false);
  const { width } = useWindowDimensions();
  const split = isDesktopSplit(width);
  const theme = topicThemes[story.topic] || topicThemes.all;
  const date = new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const failLink = () => setLinkError(true);

  return (
    <View style={[styles.card, split && styles.splitCard]}>
      {split ? (
        <View style={[styles.leftPane, { borderRightColor: theme.border }]}>
          <StoryVisual story={story} split={split} />
          <StoryEvidence sources={story.sources} mode={story.mode} onError={failLink} desktop topic={story.topic} />
        </View>
      ) : (
        <StoryVisual story={story} />
      )}
      <View style={[styles.content, split && styles.splitContent]}>
        <View style={styles.meta}>
          <View style={styles.origin}>
            <View style={[styles.topicBadge, { backgroundColor: theme.light }]}>
              <Text style={[styles.topic, { color: theme.text }]}>{topicNames[story.topic]}</Text>
            </View>
            <Text style={styles.detail}>{story.sources[0]?.name}</Text>
          </View>
          <Text style={styles.detail}>{date} · {Math.max(1, Math.ceil(story.readingSeconds / 60))} min read</Text>
        </View>
        <Text accessibilityRole="header" style={[styles.title, split && styles.splitTitle]}>{story.title}</Text>
        {story.bullets.length > 1 && <Text style={styles.pointsLabel}>Key points</Text>}
        <StoryPoints bullets={story.bullets} sources={story.sources} onError={failLink} topic={story.topic} />
        {!split && <StoryEvidence sources={story.sources} mode={story.mode} onError={failLink} topic={story.topic} />}
        {linkError && (
          <Text accessibilityRole="alert" style={styles.alert}>
            Could not open the source. Please try the link again.
          </Text>
        )}
      </View>
    </View>
  );
}
