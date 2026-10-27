import { createContext, useContext } from 'react';
import type { HrSetupReview, HrSetupReviewArgs } from '../../../src/redux/hr/hr-setup-review-api';

export const FixtureContext = createContext({
  mode: 'valid',
  setMode: (_mode: string) => {},
  reviewed: [] as string[],
  setReviewed: (_sections: string[]) => {},
});
export function useGetHrSetupReviewQuery(args: HrSetupReviewArgs) {
  const { mode, reviewed, setMode } = useContext(FixtureContext);
  const data: HrSetupReview = {
    ...args,
    configurationState:
      mode === 'missing'
        ? 'missing'
        : mode === 'no staff' && args.section === 'sample'
          ? 'no_staff'
          : 'valid',
    reviewState:
      mode === 'stale'
        ? 'stale'
        : reviewed.includes(args.section)
          ? 'reviewed'
          : 'record_not_present',
    fingerprint: 'a'.repeat(64),
    concurrencyStamp: 'synthetic-revision',
    canReview: !['missing', 'no staff'].includes(mode),
    starterInitialized: true,
    tenantStarterEnabled: true,
    reviewedBy: mode === 'stale' ? 'synthetic-actor' : undefined,
    reviewedByName: 'Synthetic reviewer',
    reviewedAt: mode === 'stale' ? '2026-10-26T10:00:00Z' : undefined,
    details: [
      args.section === 'sample'
        ? 'Synthetic staff on 2026-10-26: source default'
        : 'Synthetic school settings',
    ],
    notices:
      args.section === 'leave'
        ? ['Zero leave allocation needs review. Recording does not add leave days.']
        : mode === 'no staff' && args.section === 'sample'
          ? ['No staff exists yet. Complete the sample check after adding staff.']
          : [],
  };
  return {
    currentData: mode === 'loading' ? undefined : data,
    isFetching: mode === 'loading',
    isError: mode === 'error',
    refetch: () => setMode('valid'),
  };
}
export function useRecordHrSetupReviewMutation() {
  const { mode, reviewed, setReviewed } = useContext(FixtureContext);
  return [
    (args: HrSetupReviewArgs) => ({
      unwrap: async () => {
        if (mode === 'conflict') throw new Error('Synthetic conflict');
        setReviewed([...reviewed, args.section]);
      },
    }),
    { isLoading: mode === 'saving' },
  ] as const;
}
