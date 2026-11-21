import type { LibraryBookEditorOptions } from 'src/redux/library/book-editor-api';

import { useState, useEffect, useCallback } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useLazyGetLibraryBookEditorOptionsQuery } from 'src/redux/library/book-editor-api';

export function useBookEditorSnapshot(academicYearId: string | undefined, canRead: boolean) {
  const [year, setYear] = useState(academicYearId || '');
  const [generation, setGeneration] = useState(0);
  const [snapshot, setSnapshot] = useState<LibraryBookEditorOptions | null>(null);
  const [loading, setLoading] = useState(Boolean(academicYearId && canRead));
  const [error, setError] = useState('');
  const [read, request] = useLazyGetLibraryBookEditorOptionsQuery();
  useEffect(() => {
    if (!year && academicYearId) setYear(academicYearId);
  }, [year, academicYearId]);
  useEffect(() => {
    if (!year || !canRead) return undefined;
    let current = true;
    setLoading(true);
    setError('');
    // Await this forced request's fulfilment; a warm currentData value cannot open a new session.
    const pending = read({ academicYearId: year }, false);
    pending
      .unwrap()
      .then((options) => {
        if (!options.catalogueConfiguration?.revision)
          throw new Error('The server did not return effective catalogue rules.');
        if (current) setSnapshot(options);
      })
      .catch((failure) => {
        if (current)
          setError(
            parseApiProblemDetail(failure).detail ||
              (failure instanceof Error ? failure.message : 'Could not load catalogue rules.')
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      pending.abort();
    };
  }, [year, canRead, generation, read]);
  const openedRevision = snapshot?.catalogueConfiguration?.revision;
  const returnedRevision = request.currentData?.catalogueConfiguration?.revision;
  const refresh = useCallback(() => setGeneration((value) => value + 1), []);
  return {
    year,
    snapshot,
    loading,
    error,
    contextChanged: Boolean(year && academicYearId && year !== academicYearId),
    changed: Boolean(openedRevision && returnedRevision && openedRevision !== returnedRevision),
    refresh,
  };
}
