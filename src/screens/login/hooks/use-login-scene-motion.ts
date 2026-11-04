import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

export function useLoginSceneMotion() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.visibilityState === 'hidden');
    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return {
    reducedMotion,
    motionPaused: reducedMotion || hidden,
  };
}

export type LoginSceneMotion = ReturnType<typeof useLoginSceneMotion>;
