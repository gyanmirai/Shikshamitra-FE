import type {
  LibraryIssuePlan,
  LibraryIssuePlanRequest,
} from 'src/redux/library/circulation-types';

import { skipToken } from '@reduxjs/toolkit/query';
import { useGetCirculationIssuePlanQuery } from 'src/redux/library/circulation-api';

const sameFrame = (plan: LibraryIssuePlan | undefined, request: LibraryIssuePlanRequest | null) =>
  Boolean(
    plan &&
    request &&
    plan.copyId === request.copyId &&
    plan.memberId === request.memberId &&
    plan.academicYearId === request.academicYearId &&
    plan.issueDate === request.issueDate &&
    plan.revision
  );

export function useIssuePlan(request: LibraryIssuePlanRequest | null) {
  const base = useGetCirculationIssuePlanQuery(
    request ? { ...request, requestedDueDate: null } : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  const manual =
    sameFrame(base.currentData, request) &&
    Boolean(
      base.currentData?.policy.isLegacyManualDate ||
      base.currentData?.policy.terms.dueDateMode === 0
    );
  const explicit = useGetCirculationIssuePlanQuery(
    manual && request?.requestedDueDate ? request : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  const query = manual && request?.requestedDueDate ? explicit : base;
  const matches =
    sameFrame(query.currentData, request) &&
    (!manual ||
      !request?.requestedDueDate ||
      query.currentData?.dueDate === request.requestedDueDate);
  return {
    ...query,
    manual,
    currentData: matches && !query.isError && !query.isFetching ? query.currentData : undefined,
    error:
      query.error ||
      (query.isSuccess && !matches
        ? {
            error:
              'The checkout preview does not match the current copy, borrower and school dates. Reload it for review.',
          }
        : undefined),
    refetch: () => {
      if (!base.isUninitialized) base.refetch();
      if (!explicit.isUninitialized) explicit.refetch();
    },
  };
}
