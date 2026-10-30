'use client';

import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';
import type { IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOfferingListInput } from 'src/redux/student/admissions/admission-offerings-api';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';
import {
  useGetAdmissionCycleQuery,
  useGetAdmissionCyclesQuery,
} from 'src/redux/student/admissions/admission-cycles-api';

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

import type { BulkOfferingValues } from './bulk-admission-offering-model';

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
  const selectedCycleId = filterState.filters.admissionCycleId;
  const updateFilters = filterState.update;
  const [selectedCycleHint, setSelectedCycleHint] = useState<AdmissionCycle | null>(null);
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const cycleListQuery = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 });
  const listedCycles = (cycleListQuery.data?.items ?? []).filter((item) => item.status !== 3);
  const defaultCandidates = listedCycles.filter(
    (item) => !academicYearId || item.academicYearId === academicYearId
  );
  const listedDefault = defaultCandidates.find(
    (item) => item.status === 1 && item.windowStatus === 1
  );
  const needsDefaultLookup =
    !filterState.filters.admissionCycleId && Boolean(cycleListQuery.data) && !listedDefault;
  const defaultCycleQuery = useGetAdmissionCyclesQuery(
    {
      academicYearId: academicYearId || undefined,
      status: 1,
      windowStatus: 1,
      maxResultCount: 1,
      skipCount: 0,
    },
    { skip: !needsDefaultLookup }
  );
  const lookedUpDefault = defaultCycleQuery.data?.items.find(
    (item) =>
      item.status === 1 &&
      item.windowStatus === 1 &&
      (!academicYearId || item.academicYearId === academicYearId)
  );
  const knownDefault =
    lookedUpDefault &&
    (needsDefaultLookup || lookedUpDefault.id === filterState.filters.admissionCycleId)
      ? lookedUpDefault
      : undefined;
  const availableCycles =
    knownDefault && !listedCycles.some((item) => item.id === knownDefault.id)
      ? [...listedCycles, knownDefault]
      : listedCycles;
  const needsSelectedCycle = Boolean(
    filterState.filters.admissionCycleId &&
    !availableCycles.some((item) => item.id === filterState.filters.admissionCycleId)
  );
  const selectedCycleQuery = useGetAdmissionCycleQuery(filterState.filters.admissionCycleId, {
    skip: !needsSelectedCycle,
  });
  const selectedCycle =
    selectedCycleQuery.currentData?.id === filterState.filters.admissionCycleId
      ? selectedCycleQuery.currentData
      : selectedCycleHint?.id === filterState.filters.admissionCycleId
        ? selectedCycleHint
        : undefined;
  const cycles =
    needsSelectedCycle &&
    selectedCycle?.id === filterState.filters.admissionCycleId &&
    selectedCycle.status !== 3
      ? [selectedCycle, ...availableCycles]
      : availableCycles;
  const cyclesQuery = {
    ...cycleListQuery,
    isLoading:
      cycleListQuery.isLoading ||
      (needsSelectedCycle && selectedCycleQuery.isLoading) ||
      (needsDefaultLookup && defaultCycleQuery.isLoading),
    isFetching:
      cycleListQuery.isFetching ||
      (needsSelectedCycle && selectedCycleQuery.isFetching) ||
      (needsDefaultLookup && defaultCycleQuery.isFetching),
    isError:
      cycleListQuery.isError ||
      (needsSelectedCycle && selectedCycleQuery.isError) ||
      (needsDefaultLookup && defaultCycleQuery.isError),
    refetch:
      needsDefaultLookup && defaultCycleQuery.isError
        ? defaultCycleQuery.refetch
        : needsSelectedCycle && selectedCycleQuery.isError
          ? selectedCycleQuery.refetch
          : cycleListQuery.refetch,
  };
  const cycle =
    (filterState.filters.admissionCycleId
      ? cycles.find((item) => item.id === filterState.filters.admissionCycleId)
      : (listedDefault ??
        (!defaultCycleQuery.isFetching && !defaultCycleQuery.isError && defaultCycleQuery.data
          ? (lookedUpDefault ?? defaultCandidates[0])
          : undefined))) ?? null;
  useEffect(() => {
    if (!selectedCycleId && cycle && !cyclesQuery.isError) {
      updateFilters({ admissionCycleId: cycle.id, page: 0 });
    }
  }, [selectedCycleId, updateFilters, cycle, cyclesQuery.isError]);
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
      if (field === 'boardId' || field === 'mediumId') return [];
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
  const selectCycle = (selected: AdmissionCycle) => {
    // Keep the authenticated picker result mounted while an older cycle loads by ID.
    setSelectedCycleHint(selected);
    filterState.update({ admissionCycleId: selected.id, page: 0 });
  };
  const offeringsQuery = useGetAdmissionOfferingsQuery(
    toListInput(cycle?.id, filterState.filters),
    { skip: !cycle || !filterState.filters.boardId || !filterState.filters.mediumId }
  );
  const revealOfferings = (scope: {
    admissionCycleId: string;
    boardId: string;
    mediumId: string;
    campusId?: string | null;
    standardIds: string[];
  }) => {
    filterState.update({
      admissionCycleId: scope.admissionCycleId,
      boardId: scope.boardId,
      mediumId: scope.mediumId,
      campusId: scope.campusId ?? '',
      standardId: scope.standardIds.join(','),
      stageId: '',
      isActive: '',
      availabilityStatus: '',
      configurationStatus: '',
      search: '',
      columnFilters: '',
      sorting: '',
      page: 0,
    });
  };
  const actions = useAdmissionOfferingActions(cycle, false, (saved) =>
    revealOfferings({ ...saved, standardIds: [saved.standardId] })
  );
  const showCreatedOfferings = (values: BulkOfferingValues) => {
    if (!values.admissionCycle) return;
    revealOfferings({ ...values, admissionCycleId: values.admissionCycle.id });
    actions.closeBulk();
  };
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
    selectCycle,
    ...actions,
    showCreatedOfferings,
    bulkActivation,
    bulkActivationDisabled,
  };
}
