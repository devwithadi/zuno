import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Story } from '@zuno/shared';
import { StoryPoints } from './StoryPoints';
import { SourceLink } from './SourceLink';
import { sheetStyles as styles } from './MobileStorySheet.styles';

type Props = { story: Story; visible: boolean; close: () => void };

export function MobileStorySheet({ story, visible, close }: Props) {
  const [linkError, setLinkError] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}
      presentationStyle="overFullScreen">
      <View style={styles.backdrop}>
        <View role="dialog" accessibilityViewIsModal accessibilityLabel="Full story brief"
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.handleBar}><View style={styles.handle} /></View>
          <View style={styles.toolbar}>
            <Text style={styles.label}>Full Brief</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close full brief"
              onPress={close} style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
          <ScrollView accessibilityLabel="Complete story details"
            contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text accessibilityRole="header" style={styles.title}>{story.title}</Text>
            <StoryPoints bullets={story.bullets} sources={story.sources} onError={() => setLinkError(true)} />
            <View style={styles.sources}>
              <Text style={styles.sourcesTitle}>Original sources</Text>
              <View style={styles.sourceList}>
                {story.sources.map((source, index) => <SourceLink key={source.id}
                  label={`[${index + 1}] ${source.name} ↗`} url={source.url}
                  onError={() => setLinkError(true)} />)}
              </View>
              <Text style={styles.note}>{story.mode === 'extractive' ? 'Source excerpt' : 'Edited brief'}</Text>
            </View>
            {linkError && <Text accessibilityRole="alert" style={styles.errorText}>
              Could not open the source. Please try again.
            </Text>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
