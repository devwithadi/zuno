import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Story } from '@zuno/shared';
import { colors, font, topicNames } from '../theme';

type Props = { story: Story; split?: boolean };

export function StoryVisual({ story, split = false }: Props) {
  return <SourceCover key={story.image.url || 'no-cover'} story={story} split={split} />;
}

function SourceCover({ story, split }: Props) {
  const [failed, setFailed] = useState(false);
  const ownerAvatar = story.image.credit?.startsWith('Repository owner avatar');
  const repositoryImage = story.image.credit === 'Repository README';

  if (story.image.url && !failed) {
    return (
      <View style={[styles.container, split && styles.split, ownerAvatar && styles.identity]}>
        <Image
          source={{ uri: story.image.url }}
          accessible
          accessibilityRole="image"
          accessibilityLabel={story.image.alt}
          style={ownerAvatar ? styles.avatar : [styles.image, split && styles.splitImage]}
          onError={() => setFailed(true)}
          resizeMode={repositoryImage || split ? 'contain' : 'cover'}
        />
        {!!story.image.credit && (
          <Text style={[styles.credit, ownerAvatar && styles.identityCredit]}>
            {story.image.credit}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`${topicNames[story.topic]} story. No cover image available.`}
      style={[styles.fallback, (story.topic === 'business' || story.topic === 'markets') && styles.mint]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{topicNames[story.topic]}</Text>
      </View>
      <Text style={styles.caption}>No cover image</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.background },
  split: { width: '100%' },
  splitImage: { aspectRatio: 16 / 9 },
  identity: {
    minHeight: 72,
    paddingHorizontal: 22,
    paddingVertical: 14,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.paper },
  credit: {
    fontFamily: font,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  identityCredit: { flex: 1, fontSize: 12, lineHeight: 18, paddingHorizontal: 0, paddingVertical: 0 },
  fallback: {
    minHeight: 52,
    backgroundColor: colors.lilac,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  mint: { backgroundColor: colors.mint },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.paper,
  },
  badgeText: { fontFamily: font, fontSize: 11, fontWeight: '700', color: colors.ink, textTransform: 'uppercase' },
  caption: { fontFamily: font, fontSize: 12, color: colors.muted, fontWeight: '500' },
});
