'use client';

import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';
import type { IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionOfferingListInput } from 'src/redux/student/admissions/admission-offerings-api';

import { useSelector } from 'react-redux';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { availabilityLabels } from './admission-offering-model';
import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';
import { useAdmissionOfferingActions } from './use-admission-offering-actions';
import { useAdmissionOfferingFilters } from './use-admission-offering-filters';
import { useBulkAdmissionOfferingActivation } from './use-bulk-admission-offering-activation';
import {
  offeringScopeChanges,
  offeringScopeColumns,
  offeringColumnFilters,
  serializeOfferingColumnFilters,
} from './admission-offering-column-filters';

const scopeColumnLabels: Record<keyof typeof offeringScopeColumns, string> = {
  boardName: 'Board',
  mediumName: 'Medium',
  stageName: 'School level',
  standardName: 'Class',
  availabilityStatus: 'Availability',
  configurationStatus: 'Configuration',
};

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
  columnFilters: filters.columnFilters || undefined,
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
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle?.academicYearId ?? '' },
    { skip: !cycle }
  );
  const standardsQuery = useGetClassByMediumQuery(filterState.filters.mediumId, {
    skip: !filterState.filters.mediumId,
  });
  const hierarchy = getAdmissionHierarchyOptions(
    hierarchyQuery.currentData?.items ?? [],
    filterState.filters.boardId,
    filterState.filters.mediumId
  );
  const options = (items: { id: string; name: string }[]) =>
    items.map((item) => ({ value: item.id, label: item.name }));
  const columnOptions = {
    boardName: options(hierarchy.boards),
    mediumName: options(hierarchy.mediums),
    stageName: options(hierarchy.stages),
    standardName: options(
      ((standardsQuery.currentData ?? []) as Standards[]).filter(
        (item) =>
          !filterState.filters.stageId ||
          item.educationMediumStageId === filterState.filters.stageId
      )
    ),
    availabilityStatus: Object.entries(availabilityLabels).map(([value, label]) => ({
      value,
      label,
    })),
    configurationStatus: [
      { value: '0', label: 'Missing config' },
      { value: '1', label: 'Ready' },
    ],
  };
  const tableFilters: IParams['filters'] = [
    ...offeringColumnFilters(filterState.filters.columnFilters ?? ''),
    ...Object.entries(offeringScopeColumns).flatMap(([column, field]) => {
      const value = filterState.filters[field];
      if (!value) return [];
      return [
        {
          column,
          type: 'equals',
          value,
          valueType: 'enum',
          label: scopeColumnLabels[column as keyof typeof offeringScopeColumns],
          displayValue: value
            .split(',')
            .map(
              (id) =>
                columnOptions[column as keyof typeof columnOptions].find(
                  (option) => String(option.value) === id
                )?.label ?? id
            )
            .join(', '),
        },
      ];
    }),
  ];
  const applyTableFilters = (criteria: IParams['filters']) =>
    filterState.update({
      ...offeringScopeChanges(criteria, filterState.filters),
      columnFilters: serializeOfferingColumnFilters(criteria),
    });
  const offeringsQuery = useGetAdmissionOfferingsQuery(
    toListInput(cycle?.id, filterState.filters),
    { skip: !cycle || !filterState.filters.boardId || !filterState.filters.mediumId }
  );
  const actions = useAdmissionOfferingActions(cycle);
  const currentData =
    cycle && filterState.filters.boardId && filterState.filters.mediumId
      ? offeringsQuery.currentData
      : undefined;
  const rows = currentData?.items ?? [];
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
    rows,
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
    rows,
    currentData,
    columnOptions,
    tableFilters,
    applyTableFilters,
    ...actions,
    bulkActivation,
    bulkActivationDisabled,
  };
}
