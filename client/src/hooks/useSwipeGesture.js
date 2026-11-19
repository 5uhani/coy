import { useRef, useState } from 'react';

export const SWIPE_THRESHOLD = 110; // px
const FLICK_VELOCITY = 0.5; // px per ms

// Pointer-based drag (touch, mouse and pen). Reports a decision once the card
// is dragged far enough or flicked fast enough, otherwise lets it snap back.
export function useSwipeGesture({ disabled, onDecide }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef(null);

  const reset = () => { start.current = null; setDragging(false); setOffset({ x: 0, y: 0 }); };

  const bind = {
    onPointerDown(e) {
      if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      setDragging(true);
    },
    onPointerMove(e) {
      if (!start.current) return;
      setOffset({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
    },
    onPointerUp(e) {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.current.t);
      start.current = null;
      setDragging(false);
      if (Math.abs(dx) > SWIPE_THRESHOLD || (velocity > FLICK_VELOCITY && Math.abs(dx) > 40)) {
        onDecide(dx > 0 ? 'like' : 'pass'); // card keeps its offset and flies out from there
      } else {
        setOffset({ x: 0, y: 0 });
      }
    },
    onPointerCancel: reset,
  };

  return { offset, dragging, bind };
}
