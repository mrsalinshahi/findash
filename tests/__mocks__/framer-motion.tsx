import React from 'react';

type AnyProps = Record<string, unknown>;

// Strip framer-motion-specific props and render a plain element
function makeMotion(tag: string) {
  const Component = React.forwardRef<HTMLElement, AnyProps>(
    (
      {
        children,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        variants: _v,
        whileHover: _wh,
        whileTap: _wt,
        layout: _l,
        layoutId: _lid,
        ...rest
      },
      ref,
    ) => React.createElement(tag, { ...rest, ref }, children),
  );
  Component.displayName = `motion.${tag}`;
  return Component;
}

export const motion = new Proxy(
  {},
  {
    get: (_target, prop: string) => makeMotion(prop),
  },
) as Record<string, ReturnType<typeof makeMotion>>;

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const animate = jest.fn();

export const useMotionValue = (initial: number) => ({ get: () => initial, set: jest.fn() });
export const useTransform = (_v: unknown, _from: unknown, to: unknown[]) => ({
  get: () => to[0],
});
