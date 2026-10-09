import type { InitialSetup } from 'src/redux/initial-setup/types';

import { useState, useEffect } from 'react';
import { useLazyGetInitialSetupQuery } from 'src/redux/initial-setup/initial-setup-api';

// Begin every mount with a fresh backend snapshot. Background cache updates never reset a form draft.
export function useInitialSetupSnapshot() {
  const [initial, setInitial] = useState<InitialSetup>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [read] = useLazyGetInitialSetupQuery();
  useEffect(() => {
    let active = true;
    read(undefined, false)
      .unwrap()
      .then((response) => {
        if (active) setInitial(response);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [read, retry]);
  return {
    initial,
    error,
    retry: () => {
      setError(false);
      setRetry((value) => value + 1);
    },
    reload: () => read(undefined, false).unwrap(),
  };
}
