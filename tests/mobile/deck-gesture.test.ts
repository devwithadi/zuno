import { expect, it } from 'vitest';
import { captureGesture, gestureIntent } from '../../apps/mobile/src/deck/gesture';

const motion = { dx: 0, dy: 0, vx: 0, vy: 0, index: 1, count: 3 };
it('maps clear horizontal and vertical swipes to adjacent cards', () => {
  expect(gestureIntent({ ...motion, dx: -100 })).toBe('next');
  expect(gestureIntent({ ...motion, dy: -100 })).toBe('next');
  expect(gestureIntent({ ...motion, dx: 100 })).toBe('previous');
  expect(gestureIntent({ ...motion, dy: 100 })).toBe('previous');
});
it('reserves inner scrolling until its directional reading boundary', () => {
  expect(captureGesture(8, 8, { top: true, bottom: true })).toBe(false);
  expect(captureGesture(100, 10, { top: false, bottom: false })).toBe(true);
  expect(captureGesture(0, -100, { top: true, bottom: false })).toBe(false);
  expect(captureGesture(0, 100, { top: true, bottom: false })).toBe(true);
  expect(captureGesture(0, -100, { top: false, bottom: true })).toBe(true);
  expect(captureGesture(0, 100, { top: false, bottom: true })).toBe(false);
});
it('requires deliberate movement and uses flick velocity after a minimum distance', () => {
  expect(gestureIntent({ ...motion, dx: -9, vx: -1 })).toBe('stay');
  expect(gestureIntent({ ...motion, dx: -30, vx: -0.8 })).toBe('next');
  expect(gestureIntent({ ...motion, dx: -30, vx: -0.1 })).toBe('stay');
});
it('pulls to refresh only at the first card and respects the deck boundaries', () => {
  expect(gestureIntent({ ...motion, index: 0, dy: 110 })).toBe('refresh');
  expect(gestureIntent({ ...motion, index: 0, dy: 40, vy: 1 })).toBe('stay');
  expect(gestureIntent({ ...motion, index: 0, dx: 110 })).toBe('stay');
  expect(gestureIntent({ ...motion, index: 2, dy: -110 })).toBe('stay');
  expect(gestureIntent({ ...motion, count: 0, dy: -110 })).toBe('stay');
});
