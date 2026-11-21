import type { CopyIdentity, LibraryCopyState } from 'src/redux/library/copy-lifecycle-types';

import { useState, useEffect } from 'react';
import { useLazyGetLibraryCopyStateQuery } from 'src/redux/library/copy-lifecycle-api';

export function useCopyStateSession({ bookId, copyId }: CopyIdentity, enabled: boolean) {
  const identity = `${bookId}:${copyId}`;
  const [opened, setOpened] = useState<{ identity: string; state: LibraryCopyState } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [load, query] = useLazyGetLibraryCopyStateQuery();
  useEffect(() => {
    let active = true;
    if (enabled && bookId && copyId) {
      load({ bookId, copyId }, false)
        .unwrap()
        .then((state) => {
          if (active)
            setOpened((current) =>
              current?.identity === identity ? current : { identity, state }
            );
        })
        .catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, [attempt, bookId, enabled, copyId, identity, load]);
  return {
    query,
    snapshot: opened?.identity === identity ? opened.state : undefined,
    retry: () => setAttempt((value) => value + 1),
  };
}
