'use client';

import { LazyMotion } from 'framer-motion';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

const loadFeaturesAsync = async () => {
  const res = await import('./features');
  return res.default;
};

export function MotionLazy({ children }: Props) {
  return (
    <LazyMotion strict features={loadFeaturesAsync}>
      {children}
    </LazyMotion>
  );
}
