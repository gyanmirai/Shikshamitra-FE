import { useState } from 'react';

export function useGetPfCoverageQuery() {
  const scenario = new URLSearchParams(window.location.search).get('scenario');
  const [retried, retry] = useState(false);
  const missing = scenario !== 'configured';
  return {
    isLoading: scenario === 'loading',
    isFetching: scenario === 'loading',
    isError: scenario === 'error' && !retried,
    refetch: () => retry(true),
    data:
      scenario === 'loading' || (scenario === 'error' && !retried)
        ? undefined
        : {
            hasSchoolWideScope: true,
            history: missing
              ? []
              : [
                  {
                    id: 'synthetic',
                    effectiveMonth: '2026-01-01',
                    isCovered: true,
                    isCancelled: false,
                  },
                ],
          },
  };
}
export function useSavePfCoverageMutation() {
  return [
    () => ({ unwrap: () => Promise.reject(new Error('Synthetic save failure')) }),
    { isLoading: false },
  ] as const;
}
