import { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import type { Story } from '@zuno/shared';
import { Action } from '../components/Action';
import { FeedStatus } from '../components/FeedStatus';
import { Reveal } from '../components/Reveal';
import { StoryCard } from '../components/StoryCard';
import { DesktopFeedItem } from './DesktopFeedItem';
import { desktopStyles as styles } from './DesktopDesk.styles';

type Props = {
  items: Story[];
  loading: boolean;
  error: string;
  nextCursor: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void> | undefined;
};

export function DesktopDesk({ items, loading, error, nextCursor, refresh, loadMore }: Props) {
  const [activeId, setActiveId] = useState<string>();
  const activeStory = items.find((story) => story.id === activeId) ?? items[0];

  useEffect(() => {
    if (items.length > 0 && (!activeId || !items.some((story) => story.id === activeId))) {
      setActiveId(items[0].id);
    }
  }, [items, activeId]);

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text accessibilityRole="header" style={styles.sidebarTitle}>Curated briefs.</Text>
          <Action label="Refresh" onPress={() => void refresh()} disabled={loading} subtle />
        </View>
        <FlatList
          data={items}
          keyExtractor={(story) => `side-${story.id}`}
          style={styles.sidebarList}
          contentContainerStyle={styles.sidebarListContent}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <DesktopFeedItem
              story={item}
              active={item.id === activeStory?.id}
              onSelect={() => setActiveId(item.id)}
            />
          )}
          ListFooterComponent={
            <View style={styles.sidebarFooter}>
              <FeedStatus loading={loading} error={error} empty={!items.length} retry={() => void refresh()} />
              {!loading && !error && nextCursor && (
                <Action label="More stories" onPress={() => void loadMore()} subtle />
              )}
              {!!items.length && !nextCursor && !loading && !error && (
                <Text style={styles.end}>You're caught up. Check back for new stories.</Text>
              )}
            </View>
          }
        />
      </View>
      <ScrollView style={styles.readingRoom} contentContainerStyle={styles.readingRoomContent}>
        {activeStory ? (
          <Reveal key={activeStory.id}><StoryCard story={activeStory} /></Reveal>
        ) : (
          <View style={styles.emptyPrompt}>
            <Text style={styles.emptyText}>Select a story to read the full brief.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
