import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, useWindowDimensions, View } from 'react-native';
import type { Story } from '@zuno/shared';
import { MobileStory } from '../components/MobileStory';
import { FeedStatus } from '../components/FeedStatus';
import { Action } from '../components/Action';
import { useDeckMotion } from './useDeckMotion';
import { PullIndicator } from './PullIndicator';
import { deckStyles as styles } from './MobileDeck.styles';
import type { Intent, ScrollBoundary } from './gesture';

type Props = {
  items: Story[]; loading: boolean; error: string; nextCursor: string | null;
  refresh: () => Promise<void>; loadMore: () => Promise<void> | undefined;
};

export function MobileDeck({ items, loading, error, nextCursor, refresh, loadMore }: Props) {
  const [activeId, setActiveId] = useState<string>();
  const [operationError, setOperationError] = useState('');
  const [scroll, setScroll] = useState<ScrollBoundary & { id?: string }>({ top: true, bottom: true });
  const requested = useRef<string | null>(null);
  const { width, height } = useWindowDimensions();
  const index = Math.max(0, items.findIndex((story) => story.id === activeId));
  const current = items[index];

  const reportBoundary = useCallback((value: ScrollBoundary) => setScroll((old) =>
    old.id === current?.id && old.top === value.top && old.bottom === value.bottom
      ? old : { ...value, id: current?.id }), [current?.id]);

  const run = (operation: () => Promise<void> | undefined) => {
    setOperationError('');
    void Promise.resolve().then(operation)
      .catch(() => setOperationError('Could not update stories. Please try again.'));
  };

  const move = (intent: Intent) => {
    if (intent === 'refresh') { if (!loading) run(refresh); return; }
    const next = index + (intent === 'next' ? 1 : intent === 'previous' ? -1 : 0);
    if (items[next]) setActiveId(items[next].id);
  };

  const boundary = scroll.id === current?.id ? scroll : { top: true, bottom: true };
  const motion = useDeckMotion({ index, count: items.length, width, height, boundary, onIntent: move });

  useEffect(() => {
    if (current && activeId !== current.id) setActiveId(current.id);
  }, [activeId, current?.id]);

  useEffect(() => {
    if (loading || !nextCursor || index < items.length - 3 || requested.current === nextCursor) return;
    requested.current = nextCursor;
    run(loadMore);
  }, [index, items.length, loading, nextCursor]);

  if (!current) {
    return <FeedStatus loading={loading} error={error || operationError} empty retry={() => run(refresh)} />;
  }

  return (
    <View testID="mobile-story-deck" style={styles.deck}>
      <View style={styles.toolbar}>
        <View style={styles.leftGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Undo to previous card"
            accessibilityState={{ disabled: index === 0 }}
            disabled={index === 0}
            onPress={() => move('previous')}
            style={({ pressed }) => [
              styles.undoBtn,
              index === 0 && styles.undoDisabled,
              pressed && index > 0 && styles.undoPressed,
            ]}
          >
            <Text style={styles.undoIcon}>↶</Text>
            <Text style={styles.undoText}>Undo</Text>
          </Pressable>
          <View style={styles.pill}>
            <View style={[styles.dot, loading && styles.dotActive]} />
            <Text style={styles.counter}>{index + 1}<Text style={styles.counterTotal}> / {items.length}</Text></Text>
          </View>
        </View>
        <Action label="Refresh" onPress={() => run(refresh)} disabled={loading} subtle />
      </View>
      {!!(error || operationError) && (
        <Text accessibilityRole="alert" style={styles.error}>{error || operationError}</Text>
      )}
      <View style={styles.stage}>
        {index === 0 && <PullIndicator translateY={motion.position.y} loading={loading} />}
        {index < items.length - 1 && <View pointerEvents="none" style={styles.back} />}
        <Animated.View testID="swipe-card" {...motion.panHandlers} style={[styles.card, motion.style]}>
          <MobileStory key={current.id} story={current} onScrollBoundary={reportBoundary} />
        </Animated.View>
      </View>
    </View>
  );
}
