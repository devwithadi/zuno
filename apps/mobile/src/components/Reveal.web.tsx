import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function Reveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
    transition={{ duration: 0.18 }}>{children}</motion.div>;
}
