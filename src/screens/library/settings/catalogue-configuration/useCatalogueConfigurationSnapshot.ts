import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useLazyGetCatalogueConfigurationQuery } from 'src/redux/library/catalogue-configuration-api';

export function useCatalogueConfigurationSnapshot(canRead: boolean) {
  const [opened, setOpened] = useState<CatalogueConfiguration | null>(null);
  const [loading, setLoading] = useState(canRead);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [read, request] = useLazyGetCatalogueConfigurationQuery();
  useEffect(() => {
    if (!canRead) {
      setOpened(null);
      setLoading(false);
      return undefined;
    }
    let current = true;
    setLoading(true);
    setError('');
    const pending = read(undefined, false);
    pending
      .unwrap()
      .then((response) => {
        if (current) setOpened(response);
      })
      .catch((failure) => {
        if (current)
          setError(
            parseApiProblemDetail(failure).detail || 'Could not load catalogue configuration.'
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      pending.abort();
    };
  }, [canRead, read, attempt]);
  return {
    opened: canRead ? opened : null,
    current: request.currentData,
    loading,
    error:
      error ||
      (request.isError
        ? parseApiProblemDetail(request.error).detail ||
          'Could not refresh catalogue configuration.'
        : ''),
    isError: request.isError,
    retry: () => setAttempt((value) => value + 1),
    reload: () => read(undefined, false).unwrap(),
  };
}
