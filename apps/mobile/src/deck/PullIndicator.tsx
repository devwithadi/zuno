import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';

type Props = {
  translateY: Animated.Value;
  loading: boolean;
};

export function PullIndicator({ translateY, loading }: Props) {
  const opacity = translateY.interpolate({
    inputRange: [0, 40, 96],
    outputRange: [0, 0.4, 1],
    extrapolate: 'clamp',
  });

  const scale = translateY.interpolate({
    inputRange: [0, 96],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity, transform: [{ scale }] }]}>
      <View style={styles.pill}>
        <Text style={styles.icon}>{loading ? '⏳' : '↓'}</Text>
        <Text style={styles.label}>{loading ? 'Refreshing...' : 'Pull to refresh'}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  icon: {
    fontFamily: font,
    fontSize: 12,
    color: colors.violet,
    fontWeight: '700',
  },
  label: {
    fontFamily: font,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
});
