import type { CopyIdentity, LibraryCopyMoveOptions } from 'src/redux/library/copy-lifecycle-types';

import { useState, useEffect } from 'react';
import { useLazyGetLibraryCopyMoveOptionsQuery } from 'src/redux/library/copy-lifecycle-api';

export function useCopyMoveSession(
  { bookId, copyId, academicYearId }: CopyIdentity & { academicYearId?: string },
  enabled: boolean
) {
  const identity = `${bookId}:${copyId}:${academicYearId}`;
  const [opened, setOpened] = useState<{
    identity: string;
    options: LibraryCopyMoveOptions;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [load, query] = useLazyGetLibraryCopyMoveOptionsQuery();
  useEffect(() => {
    let active = true;
    if (enabled && bookId && copyId) {
      load({ bookId, copyId, academicYearId }, false)
        .unwrap()
        .then((options) => {
          if (active)
            setOpened((current) =>
              current?.identity === identity ? current : { identity, options }
            );
        })
        .catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, [attempt, academicYearId, bookId, enabled, copyId, identity, load]);
  return {
    query,
    options: opened?.identity === identity ? opened.options : undefined,
    retry: () => setAttempt((value) => value + 1),
  };
}
