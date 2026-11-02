import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Story } from '@zuno/shared';
import { colors, font, topicNames } from '../theme';

export function MobileStoryImage({ story, height }: { story: Story; height: number }) {
  return <Cover key={story.image.url ?? 'missing'} story={story} height={height} />;
}

function Cover({ story, height }: { story: Story; height: number }) {
  const [failed, setFailed] = useState(false);
  const avatar = story.image.credit?.startsWith('Repository owner avatar');
  const repositoryImage = story.image.credit === 'Repository README';

  if (!story.image.url || failed) {
    return (
      <View style={styles.fallback}>
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>{topicNames[story.topic]}</Text>
        </View>
        <Text style={styles.credit}>No cover image</Text>
      </View>
    );
  }

  return (
    <View style={avatar ? styles.identity : styles.coverWrap}>
      <Image
        accessible
        accessibilityRole="image"
        accessibilityLabel={story.image.alt}
        source={{ uri: story.image.url }}
        onError={() => setFailed(true)}
        resizeMode={repositoryImage ? 'contain' : 'cover'}
        style={avatar ? styles.avatar : { height, width: '100%', backgroundColor: colors.lilac }}
      />
      {!!story.image.credit && (
        <Text style={[styles.credit, avatar ? styles.avatarCredit : styles.imageCredit]}>
          {story.image.credit}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  coverWrap: { overflow: 'hidden' },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  avatar: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.line },
  fallback: {
    minHeight: 46,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lilac,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  topicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  topicText: { fontFamily: font, fontSize: 11, lineHeight: 14, color: colors.ink, fontWeight: '700' },
  credit: { fontFamily: font, fontSize: 11, lineHeight: 14, color: colors.muted },
  imageCredit: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 2 },
  avatarCredit: { flex: 1, fontSize: 12, lineHeight: 16 },
});
