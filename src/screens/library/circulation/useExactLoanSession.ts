import type { AppDispatch } from 'src/redux/store';
import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { libraryLoansApi, useGetLibraryLoanQuery } from 'src/redux/library/loans-api';

import type { LibraryReturnTarget } from './return-target';

export function useExactLoanSession(target: LibraryReturnTarget | undefined, enabled: boolean) {
  const dispatch = useDispatch<AppDispatch>();
  const [snapshot, setSnapshot] = useState<LibraryLoan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const validTarget = Boolean(target?.loanId && target.copyId);
  const query = useGetLibraryLoanQuery(enabled && validTarget ? target!.loanId : skipToken);
  const matches = (loan?: LibraryLoan | null) =>
    Boolean(loan && loan.id === target?.loanId && loan.copyId === target?.copyId && loan.revision);
  useEffect(() => {
    if (!enabled || !target?.loanId || !target.copyId) return undefined;
    let current = true;
    setLoading(true);
    setError('');
    const pending = dispatch(
      libraryLoansApi.endpoints.getLibraryLoan.initiate(target.loanId, {
        subscribe: false,
        forceRefetch: true,
      })
    );
    pending
      .unwrap()
      .then((source) => {
        if (!source.revision || source.id !== target.loanId || source.copyId !== target.copyId)
          throw new Error(
            'The saved loan or copy does not match the selected record. Open the correct record before continuing.'
          );
        if (current)
          setSnapshot((opened) =>
            opened?.id === source.id && opened.copyId === source.copyId ? opened : source
          );
      })
      .catch((cause) => {
        if (current)
          setError(
            parseApiProblemDetail(cause).detail ||
              (cause instanceof Error ? cause.message : 'The saved loan could not be loaded.')
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      pending.abort();
    };
  }, [enabled, target?.loanId, target?.copyId, attempt, dispatch]);
  const opened = matches(snapshot) ? snapshot : null;
  const latest = matches(query.currentData) ? query.currentData : undefined;
  return {
    snapshot: opened,
    latest,
    opening: enabled && validTarget && !opened && (loading || query.isFetching),
    fetching: query.isFetching,
    changed: Boolean(opened && latest && opened.revision !== latest.revision),
    error: !validTarget
      ? 'A saved loan and copy identity are required.'
      : error ||
        (query.isError
          ? parseApiProblemDetail(query.error).detail || 'The current loan could not be verified.'
          : ''),
    retry: () => setAttempt((value) => value + 1),
    verify: async () => {
      if (!enabled || !opened || !target)
        throw new Error('Review the selected saved loan before submitting.');
      const fresh = await dispatch(
        libraryLoansApi.endpoints.getLibraryLoan.initiate(target.loanId, {
          subscribe: false,
          forceRefetch: true,
        })
      ).unwrap();
      if (!matches(fresh) || fresh.revision !== opened.revision)
        throw new Error(
          'The saved loan changed. Your draft is retained; reload the record for review.'
        );
      return fresh;
    },
  };
}
export type ExactLoanSession = ReturnType<typeof useExactLoanSession>;
