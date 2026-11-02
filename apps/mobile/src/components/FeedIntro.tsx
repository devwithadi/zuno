import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Action } from './Action';
import { colors, font } from '../theme';

export function FeedIntro({ loading, refresh }: { loading: boolean; refresh: () => void }) {
  const compact = useWindowDimensions().width < 720;
  const date = new Date().toLocaleDateString(undefined,
    { weekday: 'long', month: 'long', day: 'numeric' });
  return <View style={[styles.intro, compact && styles.compact]}>
    <View style={styles.row}>
      <Text accessibilityRole="header" style={[styles.title, compact && styles.smallTitle]}>
        Your daily download.
      </Text>
      {!compact && <Text style={styles.date}>{date}</Text>}
    </View>
    <View style={styles.row}>
      <Text style={styles.description}>Big ideas. Clear points. A little more perspective.</Text>
      <Action label="Refresh" onPress={refresh} disabled={loading} subtle />
    </View>
  </View>;
}
const styles = StyleSheet.create({
  intro: { paddingTop: 40, paddingBottom: 28, gap: 10 },
  compact: { paddingTop: 28, paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  title: { flexShrink: 1, fontFamily: font, color: colors.ink, fontSize: 42,
    lineHeight: 50, fontWeight: '700', letterSpacing: -1.5 },
  smallTitle: { fontSize: 32, lineHeight: 38, letterSpacing: -0.9 },
  description: { flex: 1, fontFamily: font, color: colors.muted, fontSize: 15, lineHeight: 23 },
  date: { fontFamily: font, color: colors.muted, fontSize: 13, lineHeight: 20 },
});
