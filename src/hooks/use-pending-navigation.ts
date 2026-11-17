'use client';

import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useState, useEffect, useCallback, useTransition } from 'react';

type NavigationOptions = { scroll?: boolean };
type Push = (href: string, options?: NavigationOptions) => void | Promise<unknown>;

/** Own the complete App Router transition, including the interval before its route mounts. */
export function usePendingNavigation(push: Push, onError?: (error: unknown) => void) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [transitionPending, startTransition] = useTransition();
  const pending = useRef<string | null>(null);

  useEffect(() => {
    if (!transitionPending) {
      pending.current = null;
      setPendingKey(null);
    }
  }, [transitionPending]);

  const navigate = useCallback(
    (key: string, href: string, options?: NavigationOptions) => {
      if (pending.current) return;
      pending.current = key;
      setPendingKey(key);
      startTransition(async () => {
        try {
          await push(href, options);
        } catch (error) {
          if (onError) onError(error);
          else shikshaMitraToast.error({ message: 'Unable to Open the Selected Page.' });
        }
      });
    },
    [push, onError]
  );

  return { pendingKey, isPending: pendingKey !== null, navigate };
}
