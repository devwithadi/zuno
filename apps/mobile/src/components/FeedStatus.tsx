import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Action } from './Action';
import { colors, font } from '../theme';

type Props = { loading: boolean; error: string; empty: boolean; retry: () => void };

export function FeedStatus({ loading, error, empty, retry }: Props) {
  if (loading) {
    return (
      <View style={styles.status} accessibilityLabel="Loading stories">
        <ActivityIndicator color={colors.violet} size="small" />
        <Text style={styles.body}>Curating the latest briefs…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.status}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Notice</Text>
        </View>
        <Text accessibilityRole="alert" style={styles.heading}>Unable to load stories</Text>
        <Text style={styles.body}>{error}</Text>
        <Action label="Try again" onPress={retry} subtle />
      </View>
    );
  }

  if (!empty) return null;

  return (
    <View style={styles.status}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Fresh Feed</Text>
      </View>
      <Text style={styles.heading}>All caught up</Text>
      <Text style={styles.body}>No stories here yet. Try another topic or check back in a few minutes.</Text>
      <Action label="Refresh feed" onPress={retry} subtle />
    </View>
  );
}

const styles = StyleSheet.create({
  status: { paddingVertical: 44, paddingHorizontal: 24, alignItems: 'center', gap: 14 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.lilac,
  },
  badgeText: { fontFamily: font, fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  heading: { fontFamily: font, fontSize: 20, lineHeight: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  body: {
    fontFamily: font,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.muted,
    maxWidth: 320,
  },
});
