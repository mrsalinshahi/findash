/**
 * AnimatedPage wraps each route's content with an enter/exit transition.
 *
 * It must be a direct child of AnimatePresence (via AnimatedRoutes in App.tsx)
 * so framer-motion can coordinate the outgoing page's exit animation with the
 * incoming page's enter animation in "wait" mode — i.e. exit finishes before
 * enter starts.
 */
import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const variants: Variants = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: 'easeIn' } },
};

export function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={variants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  );
}
