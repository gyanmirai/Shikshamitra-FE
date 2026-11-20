import type { AppDispatch } from 'src/redux/store';

import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { booksApi } from 'src/redux/library/bookList/bookList-api';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { readCatalogueRevisions } from 'src/redux/library/catalogue-revisions';

import type { BookSource } from './book-form-model';

export function useBookDetailSnapshot(bookId?: string) {
  const dispatch = useDispatch<AppDispatch>();
  const [snapshot, setSnapshot] = useState<BookSource | null>(null);
  const [loading, setLoading] = useState(Boolean(bookId));
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!bookId) return undefined;
    let current = true;
    setLoading(true);
    setError('');
    setSnapshot(null);
    const pending = dispatch(
      booksApi.endpoints.getBookById.initiate({ bookId }, { subscribe: false, forceRefetch: true })
    );
    pending
      .unwrap()
      .then((source) => {
        readCatalogueRevisions(source);
        if (current) setSnapshot(source);
      })
      .catch((failure) => {
        if (current)
          setError(
            parseApiProblemDetail(failure).detail ||
              (failure instanceof Error ? failure.message : 'Could not load current book details.')
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      pending.abort();
    };
  }, [bookId, attempt, dispatch]);
  return {
    snapshot: snapshot?.id === bookId ? snapshot : null,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}
