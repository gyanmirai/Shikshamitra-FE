import { useEffect } from 'react';

export function useCirculationBusy(busy: boolean, onBusyChange?: (busy: boolean) => void) {
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
}
