'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionOfferingListInput } from 'src/redux/student/admissions/admission-offerings-api';

import { useSelector } from 'react-redux';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';

import { useAdmissionOfferingActions } from './use-admission-offering-actions';
import { useAdmissionOfferingFilters } from './use-admission-offering-filters';
import { useBulkAdmissionOfferingActivation } from './use-bulk-admission-offering-activation';

const toListInput = (
  cycleId: string | undefined,
  filters: ReturnType<typeof useAdmissionOfferingFilters>['filters']
): AdmissionOfferingListInput => ({
  admissionCycleId: cycleId,
  campusId: filters.campusId || undefined,
  boardId: filters.boardId || undefined,
  mediumId: filters.mediumId || undefined,
  stageId: filters.stageId || undefined,
  ...academicClassFilterInput(filters.standardId),
  isActive: filters.isActive === '' ? undefined : filters.isActive === 'true',
  availabilityStatus:
    filters.availabilityStatus === ''
      ? undefined
      : (Number(filters.availabilityStatus) as 0 | 1 | 2 | 3 | 4),
  configurationStatus:
    filters.configurationStatus === '' ? undefined : (Number(filters.configurationStatus) as 0 | 1),
  search: filters.search || undefined,
  sorting: filters.sorting || undefined,
  skipCount: filters.page * filters.rowsPerPage,
  maxResultCount: filters.rowsPerPage,
});

export function useAdmissionOfferingsScreen() {
  const filterState = useAdmissionOfferingFilters();
  const cyclesQuery = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 });
  const cycles = (cyclesQuery.data?.items ?? []).filter((cycle) => cycle.status !== 3);
  const cycle =
    cycles.find((item) => item.id === filterState.filters.admissionCycleId) ?? cycles[0] ?? null;
  const offeringsQuery = useGetAdmissionOfferingsQuery(
    toListInput(cycle?.id, filterState.filters),
    { skip: !cycle || !filterState.filters.boardId || !filterState.filters.mediumId }
  );
  const actions = useAdmissionOfferingActions(cycle);
  const tenantId = useSelector((state: RootState) => state.auth.sessionContext?.tenantId);
  const userId = useSelector((state: RootState) => state.auth.user?.sub);
  const bulkActivationDisabled = Boolean(
    !cycle ||
    !filterState.filters.boardId ||
    !filterState.filters.mediumId ||
    cyclesQuery.isFetching ||
    offeringsQuery.isFetching ||
    offeringsQuery.isError ||
    actions.commanding ||
    actions.pendingAction ||
    actions.dialogMode ||
    actions.bulkOpen ||
    actions.detailsOpen
  );
  const bulkActivation = useBulkAdmissionOfferingActivation({
    rows: offeringsQuery.data?.items ?? [],
    scopeKey: JSON.stringify([
      tenantId,
      userId,
      cycle?.id,
      cycle?.academicYearId,
      filterState.filters,
    ]),
    canActivate: actions.permissions.activate,
    disabled: bulkActivationDisabled,
  });
  return {
    ...filterState,
    cyclesQuery,
    cycles,
    cycle,
    offeringsQuery,
    ...actions,
    bulkActivation,
    bulkActivationDisabled,
  };
}
