export type Intent = 'next' | 'previous' | 'refresh' | 'stay';
export type ScrollBoundary = { top: boolean; bottom: boolean };
type Motion = { dx: number; dy: number; vx: number; vy: number; index: number; count: number };

export function captureGesture(dx: number, dy: number, boundary: ScrollBoundary): boolean {
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= 10) return false;
  if (Math.abs(dx) >= Math.abs(dy)) return true;
  return dy < 0 ? boundary.bottom : boundary.top;
}

export function gestureIntent({ dx, dy, vx, vy, index, count }: Motion): Intent {
  if (!count) return 'stay';
  const vertical = Math.abs(dy) > Math.abs(dx);
  if (vertical && dy >= 96 && index === 0) return 'refresh';
  const distance = vertical ? dy : dx;
  const velocity = vertical ? vy : vx;
  if (Math.abs(distance) < 24 || (Math.abs(distance) < 72 && Math.abs(velocity) < 0.5)) return 'stay';
  if (distance < 0) return index < count - 1 ? 'next' : 'stay';
  return index > 0 ? 'previous' : 'stay';
}
