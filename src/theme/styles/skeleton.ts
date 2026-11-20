/** Apply to a loading region without changing the global Skeleton theme. */
export const skeletonReducedMotionSx = {
  '@media (prefers-reduced-motion: reduce)': {
    '& .MuiSkeleton-root, & .MuiSkeleton-root::after': { animation: 'none' },
  },
} as const;
