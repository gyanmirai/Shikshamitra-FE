'use client';

import type { AdmissionOfferingListInput } from 'src/redux/student/admissions/admission-offerings-api';

import { useSearchParams } from 'next/navigation';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';

import { useAdmissionOfferingActions } from './use-admission-offering-actions';
import { useAdmissionOfferingFilters } from './use-admission-offering-filters';

const toListInput = (
  cycleId: string | undefined,
  filters: ReturnType<typeof useAdmissionOfferingFilters>['filters']
): AdmissionOfferingListInput => ({
  admissionCycleId: cycleId,
  campusId: filters.campusId || undefined,
  boardId: filters.boardId || undefined,
  mediumId: filters.mediumId || undefined,
  stageId: filters.stageId || undefined,
  standardId: filters.standardId || undefined,
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
  const searchParams = useSearchParams();
  const initialIntakeSetupId = searchParams.get('intakeSetupId');
  const filterState = useAdmissionOfferingFilters();
  const cyclesQuery = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 });
  const cycles = (cyclesQuery.data?.items ?? []).filter((cycle) => cycle.status !== 3);
  const cycle =
    cycles.find((item) => item.id === filterState.filters.admissionCycleId) ?? cycles[0] ?? null;
  const offeringsQuery = useGetAdmissionOfferingsQuery(
    toListInput(cycle?.id, filterState.filters),
    { skip: !cycle }
  );
  const actions = useAdmissionOfferingActions(cycle, Boolean(initialIntakeSetupId));
  return {
    ...filterState,
    cyclesQuery,
    cycles,
    cycle,
    offeringsQuery,
    initialIntakeSetupId,
    ...actions,
  };
}
