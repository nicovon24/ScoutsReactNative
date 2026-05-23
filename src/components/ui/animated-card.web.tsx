'use client';

import { motion } from 'framer-motion';

interface AnimatedCardProps {
  index: number;
  children: React.ReactNode;
}

export function AnimatedCard({ index, children }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: 'easeOut',
        delay: (index % 20) * 0.04,
      }}
      style={{ display: 'contents' }}
    >
      {children}
    </motion.div>
  );
}
