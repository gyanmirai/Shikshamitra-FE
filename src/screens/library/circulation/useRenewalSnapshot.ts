import type { RenewalPlan } from 'src/redux/library/loans-api';
import type { LibraryLoan } from 'src/redux/library/circulation-types';
import type { LibraryRenewalPlanRequest } from 'src/redux/library/circulation-commands';

import { useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useLazyGetLibraryRenewalPlanQuery } from 'src/redux/library/loans-api';

export function renewalMatches(
  plan: RenewalPlan,
  loan: LibraryLoan,
  input: LibraryRenewalPlanRequest
) {
  return Boolean(
    plan.revision &&
    plan.loan.id === loan.id &&
    plan.loan.copyId === loan.copyId &&
    plan.loan.memberId === loan.memberId &&
    plan.loan.revision === loan.revision &&
    plan.schoolRenewalDate === input.schoolRenewalDate &&
    (!input.academicYearId || plan.currentAcademicYearId === input.academicYearId) &&
    (!input.requestedDueDate || plan.newSchoolDueDate === input.requestedDueDate)
  );
}
export function useRenewalSnapshot(loan: LibraryLoan, input: LibraryRenewalPlanRequest | null) {
  const [load, query] = useLazyGetLibraryRenewalPlanQuery();
  const [snapshot, setSnapshot] = useState<{ key: string; plan: RenewalPlan } | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const key = input ? JSON.stringify(input) : '';
  useEffect(() => {
    if (!input) {
      setSnapshot(null);
      return undefined;
    }
    let current = true;
    setSnapshot(null);
    setError('');
    const pending = load({ loanId: loan.id, body: input }, false);
    pending
      .unwrap()
      .then((plan) => {
        if (!renewalMatches(plan, loan, input))
          throw new Error(
            'The renewal preview does not match the opened loan and current dates. Reload the record for review.'
          );
        if (current) setSnapshot({ key, plan });
      })
      .catch((cause) => {
        if (current)
          setError(
            parseApiProblemDetail(cause).detail ||
              (cause instanceof Error ? cause.message : 'The renewal preview could not be loaded.')
          );
      });
    return () => {
      current = false;
      pending.abort();
    };
  }, [loan, input, key, load, refresh]);
  const opened = snapshot?.key === key ? snapshot.plan : undefined;
  return {
    plan: opened,
    hasInput: Boolean(input),
    error,
    fetching: query.isFetching,
    changed: Boolean(opened && query.currentData && query.currentData.revision !== opened.revision),
    refresh: () => {
      setSnapshot(null);
      setRefresh((value) => value + 1);
    },
    verify: async () => {
      if (!input || !opened) throw new Error('Review a current renewal preview before submitting.');
      const fresh = await load({ loanId: loan.id, body: input }, false).unwrap();
      if (!renewalMatches(fresh, loan, input) || fresh.revision !== opened.revision)
        throw new Error(
          'The renewal preview changed. Your draft is retained; refresh the preview to review it.'
        );
      return opened;
    },
  };
}
