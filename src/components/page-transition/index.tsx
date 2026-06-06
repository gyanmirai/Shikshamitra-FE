'use client';

import { motion } from 'framer-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={false} animate={{ opacity: 1 }} style={{ height: '100%' }}>
      {children}
    </motion.div>
  );
}
