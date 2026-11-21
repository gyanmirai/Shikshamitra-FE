import type { ChargeEditorContext } from 'src/redux/library/charges-management/charge-editor-types';

import { useState, useEffect } from 'react';
import { useLazyGetLibraryChargeEditorContextQuery } from 'src/redux/library/charges-management/charges-get-api';

export function useOpenedChargeContext(open: boolean, chargeId: string) {
  const [load, query] = useLazyGetLibraryChargeEditorContextQuery();
  const [opened, setOpened] = useState<ChargeEditorContext | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setOpened(null);
    if (!open || !chargeId) return undefined;
    let current = true;
    // A normal subscription can expose fulfilled cached data before its mount
    // refetch starts. Snapshot only this forced request's fulfilled result.
    const request = load({ chargeId }, false);
    request
      .unwrap()
      .then((context) => {
        if (current) setOpened(context);
      })
      .catch(() => undefined);
    return () => {
      current = false;
      request.unsubscribe();
    };
  }, [open, chargeId, load, attempt]);
  // Later cache/tag refreshes deliberately do not rebind an unsaved form.
  return {
    context: opened?.assessment.id === chargeId ? opened : null,
    query,
    retry: () => setAttempt((previous) => previous + 1),
  };
}
