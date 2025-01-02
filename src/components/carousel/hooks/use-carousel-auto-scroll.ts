import type { EmblaCarouselType } from 'embla-carousel';

import { useState, useEffect, useCallback } from 'react';

import type { UseCarouselAutoPlayReturn } from '../types';

// ----------------------------------------------------------------------

export function useCarouselAutoScroll(mainApi?: EmblaCarouselType): UseCarouselAutoPlayReturn {
  const [isPlaying, setIsPlaying] = useState(false);

  const onClickAutoplay = useCallback(
    (callback: () => void) => {
      const autoScroll = mainApi?.plugins()?.autoScroll;
      if (!autoScroll) return;

      const resetOrStop =
        (autoScroll.options as any)?.stopOnInteraction === false
          ? autoScroll.reset
          : autoScroll.stop;

      if (typeof resetOrStop === 'function') {
        resetOrStop();
      }
      callback();
    },
    [mainApi]
  );

  const onTogglePlay = useCallback(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    const playOrStop =
      autoScroll.isPlaying && typeof autoScroll.isPlaying === 'function'
        ? autoScroll.stop
        : autoScroll.play;
    if (typeof playOrStop === 'function') {
      playOrStop();
    }
  }, [mainApi]);

  useEffect(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    if (autoScroll.isPlaying && typeof autoScroll.isPlaying === 'function') {
      setIsPlaying(autoScroll.isPlaying());
    }
    mainApi
      ?.on('autoScrollPlay' as any, () => setIsPlaying(true))
      ?.on('autoScrollStop' as any, () => setIsPlaying(false))
      ?.on('reInit', () => setIsPlaying(false));
  }, [mainApi]);

  return { isPlaying, onTogglePlay, onClickAutoplay };
}
