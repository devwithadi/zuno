import { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, Platform, type PanResponderGestureState } from 'react-native';
import { captureGesture, gestureIntent, type Intent, type ScrollBoundary } from './gesture';
import { useReducedMotion } from './useReducedMotion';

type Options = { index: number; count: number; width: number; height: number;
  boundary: ScrollBoundary; onIntent: (intent: Intent) => void };
export function useDeckMotion(options: Options) {
  const position = useRef(new Animated.ValueXY()).current;
  const latest = useRef(options);
  latest.current = options;
  const reduced = useReducedMotion();
  const reduce = useRef(reduced);
  reduce.current = reduced;
  const driver = Platform.OS !== 'web';
  useEffect(() => () => position.stopAnimation(), [position]);
  const responder = useMemo(() => {
    const settle = () => Animated.spring(position, { toValue: { x: 0, y: 0 },
      stiffness: 300, damping: 28, mass: 0.8, useNativeDriver: driver }).start();
    const release = (_: unknown, gesture: PanResponderGestureState) => {
      position.flattenOffset();
      const current = latest.current;
      const intent = gestureIntent({ ...gesture, index: current.index, count: current.count });
      if (intent === 'stay' || intent === 'refresh') {
        settle();
        if (intent === 'refresh') current.onIntent(intent);
        return;
      }
      if (reduce.current) {
        position.setValue({ x: 0, y: 0 });
        current.onIntent(intent);
        return;
      }
      const horizontal = Math.abs(gesture.dx) >= Math.abs(gesture.dy);
      const direction = intent === 'next' ? -1 : 1;
      const toValue = horizontal ? { x: direction * current.width * 1.2, y: gesture.dy }
        : { x: gesture.dx, y: direction * current.height * 1.2 };
      Animated.spring(position, { toValue, stiffness: 380, damping: 34, mass: 0.7,
        velocity: { x: gesture.vx, y: gesture.vy }, useNativeDriver: driver }).start(({ finished }) => {
        if (!finished) return;
        latest.current.onIntent(intent);
        position.setValue({ x: 0, y: 0 });
      });
    };
    const capture = (_: unknown, { dx, dy }: PanResponderGestureState) =>
      captureGesture(dx, dy, latest.current.boundary);
    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: capture,
      onMoveShouldSetPanResponder: capture,
      onPanResponderGrant: () => position.stopAnimation((value) => {
        position.setOffset(value);
        position.setValue({ x: 0, y: 0 });
      }),
      onPanResponderMove: (_, { dx, dy }) => position.setValue(reduce.current ? { x: 0, y: 0 } : { x: dx, y: dy }),
      onPanResponderRelease: release,
      onPanResponderTerminate: () => { position.flattenOffset(); settle(); },
      onPanResponderTerminationRequest: () => false,
    });
  }, [driver, position]);
  return { position, panHandlers: responder.panHandlers, style: { transform: [
    { translateX: position.x }, { translateY: position.y },
    { rotate: position.x.interpolate({ inputRange: [-300, 0, 300],
      outputRange: ['-6deg', '0deg', '6deg'], extrapolate: 'clamp' }) },
  ] } };
}
