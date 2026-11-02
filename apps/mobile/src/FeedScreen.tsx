import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useFeed } from './feed/useFeed';
import type { Filter } from './feed/client';
import { Header } from './components/Header';
import { TopicTabs } from './components/TopicTabs';
import { colors, topicNames } from './theme';
import { MobileDeck } from './deck/MobileDeck';
import { DesktopDesk } from './desktop/DesktopDesk';

export function FeedScreen() {
  const [topic, setTopic] = useState<Filter>('all');
  const [topicsOpen, setTopicsOpen] = useState(false);
  const feed = useFeed(topic);
  const mobile = useWindowDimensions().width < 760;

  const selectTopic = (next: Filter) => {
    setTopic(next);
    if (mobile) setTopicsOpen(false);
  };

  return (
    <View style={styles.screen}>
      <Header
        activeTopicName={topicNames[topic]}
        topicsOpen={topicsOpen}
        onToggleTopics={() => setTopicsOpen(!topicsOpen)}
      />
      {(!mobile || topicsOpen) && (
        <View style={styles.navigation}>
          <View style={styles.tabs}><TopicTabs topic={topic} onChange={selectTopic} /></View>
        </View>
      )}
      {mobile ? <MobileDeck key={topic} {...feed} /> : <DesktopDesk key={topic} {...feed} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  navigation: { backgroundColor: colors.paper, borderBottomWidth: 1, borderColor: colors.line },
  tabs: { width: '100%', paddingHorizontal: 20 },
});
