import type { AppDispatch } from 'src/redux/store';

import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { librarySettingsApi, useGetLibraryTimingQuery } from 'src/redux/library/settingApi';

import type { LibraryHoursResponse } from './library-hours-model';

export function useLibraryHoursRead(academicYearId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const query = useGetLibraryTimingQuery({ academicYearId }, { skip: !academicYearId });
  const [source, setSource] = useState<LibraryHoursResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(academicYearId));
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!academicYearId) return undefined;
    let current = true;
    setSource(null);
    setLoading(true);
    setError('');
    const pending = dispatch(
      librarySettingsApi.endpoints.getLibraryTiming.initiate(
        { academicYearId },
        { subscribe: false, forceRefetch: true }
      )
    );
    pending
      .unwrap()
      .then((data: LibraryHoursResponse) => {
        if (!Array.isArray(data?.items))
          throw new Error('The saved opening hours are unavailable.');
        if (current) setSource(data);
      })
      .catch((failure: unknown) => {
        if (current) setError(parseApiProblemDetail(failure).detail);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      pending.abort();
    };
  }, [academicYearId, attempt, dispatch]);
  return { source, loading, error, query, retry: () => setAttempt((value) => value + 1) };
}
