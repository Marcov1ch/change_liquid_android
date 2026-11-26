import { useRef, type MouseEvent, type TouchEvent } from 'react';

interface Options {
  onSwipe: () => void;
  threshold?: number;
  edgeMargin?: number;
  maxDurationMs?: number;
  enabled?: boolean;
  ignoreSelector?: string;
}

interface GestureStart {
  x: number;
  y: number;
  time: number;
}

const CLICK_SUPPRESS_MS = 400;

export function useHorizontalSwipe({
  onSwipe,
  threshold = 50,
  edgeMargin = 24,
  maxDurationMs = 700,
  enabled = true,
  ignoreSelector = '[role="dialog"], [role="presentation"], [role="menu"]',
}: Options) {
  const start = useRef<GestureStart | null>(null);
  const swipedAt = useRef(0);

  const onTouchStart = (event: TouchEvent<HTMLElement>) => {
    if (!enabled || event.touches.length !== 1) {
      start.current = null;
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(ignoreSelector)) {
      start.current = null;
      return;
    }
    const touch = event.touches[0];
    if (touch.clientX < edgeMargin || touch.clientX > window.innerWidth - edgeMargin) {
      start.current = null;
      return;
    }
    start.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const gesture = start.current;
    start.current = null;
    if (!enabled || !gesture) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - gesture.x;
    const dy = touch.clientY - gesture.y;
    if (Date.now() - gesture.time > maxDurationMs) return;
    if (Math.abs(dx) < threshold) return;
    if (Math.abs(dx) <= Math.abs(dy) * 1.2) return;

    swipedAt.current = Date.now();
    onSwipe();
  };

  const onTouchCancel = () => {
    start.current = null;
  };

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (Date.now() - swipedAt.current > CLICK_SUPPRESS_MS) return;
    swipedAt.current = 0;
    event.preventDefault();
    event.stopPropagation();
  };

  return { onTouchStart, onTouchEnd, onTouchCancel, onClickCapture };
}
