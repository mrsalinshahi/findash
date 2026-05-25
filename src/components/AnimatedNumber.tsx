/**
 * AnimatedNumber smoothly tweens a numeric value using framer-motion's
 * imperative animate() function, then formats it via the caller-supplied
 * formatter on every frame.
 *
 * prevRef stores the value from the last render as the animation start point.
 * Without it every re-render would restart the tween from 0 instead of from
 * wherever the previous animation stopped.
 */
import { animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatter: (n: number) => string;
  duration?: number;
}

export function AnimatedNumber({ value, formatter, duration = 1 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    const controls = animate(from, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return controls.stop;
  }, [value, duration]);

  return <>{formatter(display)}</>;
}
