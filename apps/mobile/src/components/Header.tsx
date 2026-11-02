import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Account } from '../auth/Account';
import { headerStyles as styles } from './Header.styles';

type Props = {
  activeTopicName?: string;
  onToggleTopics?: () => void;
  topicsOpen?: boolean;
};

export function Header({ activeTopicName, onToggleTopics, topicsOpen }: Props) {
  const compact = useWindowDimensions().width < 720;
  return (
    <View style={styles.border}>
      <View style={[styles.header, compact && styles.compact]}>
        <View style={styles.brand}>
          <View accessible={false} style={styles.mark}>
            <View style={[styles.stroke, styles.top]} />
            <View style={[styles.stroke, styles.diagonal]} />
            <View style={[styles.stroke, styles.bottom]} />
          </View>
          <Text accessibilityRole="header" style={styles.name}>zuno</Text>
          {!compact && (
            <View style={styles.taglineBadge}>
              <Text style={styles.tagline}>Curated Briefs</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {compact && onToggleTopics && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Category menu: ${activeTopicName || 'All'}. ${topicsOpen ? 'Collapse' : 'Expand'}`}
              onPress={onToggleTopics}
              style={({ pressed }) => [styles.toggleBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.toggleText}>{activeTopicName || 'All'}</Text>
              <Text style={styles.toggleChevron}>{topicsOpen ? '▲' : '▼'}</Text>
            </Pressable>
          )}
          <Account />
        </View>
      </View>
    </View>
  );
}
