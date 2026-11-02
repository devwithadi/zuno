import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Story } from '@zuno/shared';
import { topicNames } from '../theme';
import { StoryPoints } from './StoryPoints';
import { SourceLink } from './SourceLink';
import { MobileStoryImage } from './MobileStoryImage';
import { MobileStorySheet } from './MobileStorySheet';
import { mobileStoryStyles as styles } from './MobileStory.styles';
import { storyScrollBoundary, type ScrollBoundary } from './MobileStoryScroll';

type Props = { story: Story; onScrollBoundary?: (boundary: ScrollBoundary) => void };

export function MobileStory({ story, onScrollBoundary }: Props) {
  const [height, setHeight] = useState(600);
  const [fullBrief, setFullBrief] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const metrics = useRef({ offset: 0, viewport: 0, content: 0 });

  const updateScroll = (patch: Partial<typeof metrics.current>) => {
    metrics.current = { ...metrics.current, ...patch };
    onScrollBoundary?.(storyScrollBoundary(metrics.current));
  };

  useEffect(() => { updateScroll({}); }, [onScrollBoundary]);

  const date = new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const source = story.sources[0];

  return (
    <View style={styles.card} onLayout={(event) => setHeight(event.nativeEvent.layout.height)}>
      <MobileStoryImage story={story} height={Math.min(180, Math.max(96, height * 0.25))} />
      <ScrollView
        style={styles.details}
        contentContainerStyle={styles.content}
        accessibilityLabel="Story details"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(event) => updateScroll({ viewport: event.nativeEvent.layout.height })}
        onContentSizeChange={(_width, content) => updateScroll({ content })}
        onScroll={(event) => updateScroll({ offset: Math.max(0, event.nativeEvent.contentOffset.y) })}
      >
        <View style={styles.meta}>
          <Text style={styles.topic}>{topicNames[story.topic]}</Text>
          <Text style={styles.detail}>{story.mode === 'extractive' ? 'Source excerpt' : 'Edited brief'}</Text>
          <Text style={styles.detail}>{date} · {Math.max(1, Math.ceil(story.readingSeconds / 60))} min read</Text>
        </View>
        <Text accessibilityRole="header" style={styles.title}>{story.title}</Text>
        <Text style={styles.label}>Key points</Text>
        <StoryPoints bullets={story.bullets.slice(0, 3)} sources={story.sources} onError={() => setLinkError(true)} />
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          {source && (
            <SourceLink label={`[1] ${source.name} ↗`} url={source.url} onError={() => setLinkError(true)} />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Read full brief"
            onPress={() => setFullBrief(true)}
            style={({ pressed }) => [styles.expand, pressed && styles.pressed]}
          >
            <Text style={styles.expandText}>Full brief →</Text>
          </Pressable>
        </View>
        {linkError && (
          <Text accessibilityRole="alert" style={styles.detail}>
            Could not open the source. Please try again.
          </Text>
        )}
      </View>
      <MobileStorySheet story={story} visible={fullBrief} close={() => setFullBrief(false)} />
    </View>
  );
}
