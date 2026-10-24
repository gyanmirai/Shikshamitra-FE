'use client';

import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material';
import type { IParams } from 'src/components/customizabaleTable/types';
import type { RollNumberScope } from 'src/redux/student/onboarding/student-roll-number-batches-api';
import type { StudentSiblingParentSelection } from 'src/redux/student/onboarding/student-onboarding-types';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { readOnboardingDashboardQueue } from 'src/utils/student-dashboard-drilldown';
import { Box, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import {
  readAcademicFilterIds,
  academicClassFilterInput,
} from 'src/utils/student-academic-filter-query';
import { useGetRollNumberBatchContextQuery } from 'src/redux/student/onboarding/student-roll-number-batches-api';
import {
  useGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingCasesQuery,
  useActivateStudentOnboardingMutation,
  useGetStudentOnboardingFilterOptionsQuery,
  useRefreshStudentOnboardingReadinessMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import StudentSetupTable from './student-setup-table';
import StudentSetupDrawer from './student-setup-drawer';
import { StudentSetupFilters } from './student-setup-academic-filters';
import { useOnboardingSettings } from '../onboarding-settings-context';
import StudentSetupTaskNavigation from './student-setup-task-navigation';
import StudentRollNumberWorkspace from './student-roll-number-workspace';
import { useStudentSetupAssignment } from './use-student-setup-assignment';
import StudentSetupAssignmentToolbar from './student-setup-assignment-toolbar';
import StudentIdentifierLockControls from './student-identifier-lock-controls';
import { getStudentSetupRollAutoTargets } from './student-setup-assignment-model';
import StudentOnboardingOperationDialog from './student-onboarding-operation-dialog';
import StudentSetupAutoAssignmentDialog from './student-setup-auto-assignment-dialog';
import { mapOnboardingCaseToItem, type StudentOnboardingItem } from './student-onboarding-model';
import { studentSetupSortFields, studentSetupStatusOptions } from './student-setup-worklist-config';
import StudentQuickSetupPage, { type StudentQuickSetupPageState } from './student-quick-setup-page';
import {
  type StudentSetupView,
  parseStudentSetupView,
  type StudentSetupTaskScope,
  parseStudentSetupTaskScope,
} from './student-setup-view';

import type { StudentAssignmentType } from './student-onboarding-operation-dialog';

const studentSetupTooltip = (
  <Box sx={{ p: 1.5, maxWidth: 340 }}>
    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
      Student setup
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
      Check what is pending for each student: class and division, GR and roll numbers, documents,
      and app login.
    </Typography>
    <Typography variant="caption" fontWeight={700} color="text.primary">
      Recommended flow
    </Typography>
    <Box component="ol" sx={{ m: 0, pl: 2, '& li': { mt: 0.25 } }}>
      <Typography component="li" variant="caption" color="text.secondary">
        Choose a task view to focus the worklist.
      </Typography>
      <Typography component="li" variant="caption" color="text.secondary">
        Use academic filters to narrow the student group.
      </Typography>
      <Typography component="li" variant="caption" color="text.secondary">
        Use the next-step button to finish pending work, or open the student to review their setup.
      </Typography>
    </Box>
  </Box>
);

const ALL_STANDARDS = '__all__';

const textFilterOperators = ['contains', 'equals', 'startsWith', 'endsWith'] as const;
const numberFilterOperators = ['equals', 'greaterThan', 'lessThan', 'between'] as const;

function getTextFilterOperator(value: string | null) {
  return textFilterOperators.find((operator) => operator === value) ?? 'contains';
}

function getNumberFilterOperator(value: string | null) {
  return numberFilterOperators.find((operator) => operator === value) ?? 'equals';
}

type StudentSetupAssignmentView = Exclude<StudentSetupView, 'readiness'>;

const assignmentViewMeta: Record<
  StudentSetupAssignmentView,
  {
    title: string;
    pendingEmptyText: string;
  }
> = {
  fees: {
    title: 'Fee structure confirmation',
    pendingEmptyText:
      'No students are waiting for fee structure confirmation. Switch to All students to review confirmed fee structures.',
  },
  credentials: {
    title: 'App login',
    pendingEmptyText:
      'No students have pending app login setup or emails. Switch to All students to review app access.',
  },
  'gr-number': {
    title: 'GR Number',
    pendingEmptyText: 'No remaining GR assignments.',
  },
  'roll-number': {
    title: 'Roll Number',
    pendingEmptyText: 'No remaining Roll assignments.',
  },
  division: {
    title: 'Division',
    pendingEmptyText: 'No remaining Division assignments.',
  },
};

export default function StudentSetupScreen() {
  const [drawerTaskView, setDrawerTaskView] = useState<StudentSetupView | null>(null);
  const [reviewingCaseDetails, setReviewingCaseDetails] = useState(false);
  const [quickSetupState, setQuickSetupState] = useState<StudentQuickSetupPageState>({
    dirty: false,
    busy: false,
  });
  const selectedSnapshot = useRef<StudentOnboardingItem | null>(null);
  const setupReturnFocus = useRef<HTMLElement | null>(null);
  const setupWasOpen = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const dashboardQueue = readOnboardingDashboardQueue(searchParams.get('dashboard'));
  const academicYearId = dashboardQueue
    ? searchParams.get('year') || currentYear?.id
    : currentYear?.id;
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManageOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const canCancelOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const { settings } = useOnboardingSettings();
  const activeView = parseStudentSetupView(searchParams.get('view') || dashboardQueue || null);
  const activeTaskScope = parseStudentSetupTaskScope(
    searchParams.get('scope') || (dashboardQueue && activeView !== 'readiness' ? 'pending' : null),
    activeView
  );
  const focusedCaseId = searchParams.get('case');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(focusedCaseId);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [autoAssignment, setAutoAssignment] = useState<{
    type: StudentAssignmentType;
    students: StudentOnboardingItem[];
  } | null>(null);
  const [lockInteraction, setLockInteraction] = useState(false);
  const [rollWorkspace, setRollWorkspace] = useState<{
    scope: RollNumberScope;
    caseIds?: string[];
    batchId?: string;
  } | null>(null);
  const navigationRef = useRef<(action: () => void) => void>((action) => action());
  const navigate = useCallback((action: () => void) => navigationRef.current(action), []);
  const [assignmentRequest, setAssignmentRequest] = useState<{
    type: StudentAssignmentType;
    studentIds: string[];
  } | null>(null);
  const [showFilterAlert, setShowFilterAlert] = useState(true);
  const selectedBoardId = readAcademicFilterIds(searchParams.get('board'))[0] ?? '';
  const selectedMediumId = readAcademicFilterIds(searchParams.get('medium'))[0] ?? '';
  const [selectedStandardId, setSelectedStandardId] = useUrlFilterValue(
    searchParams.get('class') ?? ALL_STANDARDS
  );
  const [selectedDivisionId, setSelectedDivisionId] = useUrlFilterValue(
    searchParams.get('division') ?? ALL_STANDARDS
  );
  const placementDivisionId = searchParams.get('placementDivision') ?? '';
  const selectedStatusOption = studentSetupStatusOptions.find(
    ({ status }) => String(status) === searchParams.get('status')
  );
  const studentNameFilter = searchParams.get('studentName')?.trim() ?? '';
  const ownerNameFilter = searchParams.get('ownerName')?.trim() ?? '';
  const studentNameOperator = getTextFilterOperator(searchParams.get('studentNameOp'));
  const ownerNameOperator = getTextFilterOperator(searchParams.get('ownerNameOp'));
  const rollNumberOperator = getNumberFilterOperator(searchParams.get('rollOp'));
  const rollNumberFilter = Number(searchParams.get('rollNumber'));
  const rollNumberMin = Number(searchParams.get('rollMin'));
  const rollNumberMax = Number(searchParams.get('rollMax'));
  const hasRollNumberFilter = searchParams.has('rollNumber') && Number.isFinite(rollNumberFilter);
  const hasRollNumberRange =
    searchParams.has('rollMin') &&
    searchParams.has('rollMax') &&
    Number.isFinite(rollNumberMin) &&
    Number.isFinite(rollNumberMax);
  const rollFilterApplicable =
    activeTaskScope === 'all' && (activeView === 'roll-number' || activeView === 'division');
  const placementFilterApplicable = activeView !== 'division' || activeTaskScope === 'all';
  const selectedSortColumn = searchParams.get('sort');
  const selectedSortDirection = searchParams.get('direction') === 'desc' ? 'desc' : 'asc';
  const sortAppliesToView =
    (selectedSortColumn !== 'rollNumberTask' || rollFilterApplicable) &&
    (selectedSortColumn !== 'divisionTask' || activeTaskScope === 'all');
  const sorts: IParams['sorts'] =
    selectedSortColumn &&
    sortAppliesToView &&
    Object.prototype.hasOwnProperty.call(studentSetupSortFields, selectedSortColumn)
      ? [{ column: selectedSortColumn, direction: selectedSortDirection }]
      : [];
  const sortOrder = sorts[0]
    ? `${studentSetupSortFields[sorts[0].column]} ${sorts[0].direction}`
    : undefined;
  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const searchTerm = searchParams.get('search') ?? '';
  const [refreshReadiness, refreshReadinessState] = useRefreshStudentOnboardingReadinessMutation();
  const [activateOnboarding, activateOnboardingState] = useActivateStudentOnboardingMutation();
  const hasWorklistFilters =
    Boolean(
      readAcademicFilterIds(selectedStandardId).length ||
      readAcademicFilterIds(selectedDivisionId).length
    ) || Boolean(placementDivisionId);

  const changeAcademicFilter = useCallback(
    (key: 'board' | 'medium' | 'class' | 'division', value: string) =>
      navigate(() => {
        const next = new URLSearchParams(searchParams.toString());
        [
          ['class', selectedStandardId],
          ['division', selectedDivisionId],
        ].forEach(([selectionKey, selectionValue]) => {
          if (selectionValue && selectionValue !== ALL_STANDARDS)
            next.set(selectionKey, selectionValue);
          else next.delete(selectionKey);
        });
        if (key === 'class') setSelectedStandardId(value);
        if (key === 'division') setSelectedDivisionId(value);
        else setSelectedDivisionId(ALL_STANDARDS);
        if (key === 'board' || key === 'medium') setSelectedStandardId(ALL_STANDARDS);
        if (!value || value === ALL_STANDARDS) next.delete(key);
        else next.set(key, value);
        if (key === 'board') ['medium', 'class', 'division'].forEach((item) => next.delete(item));
        if (key === 'medium') ['class', 'division'].forEach((item) => next.delete(item));
        if (key === 'class') next.delete('division');
        next.delete('placementDivision');
        setTablePage(1);
        setSelectedStudentIds([]);
        const query = next.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      }),
    [
      navigate,
      pathname,
      router,
      searchParams,
      selectedStandardId,
      selectedDivisionId,
      setSelectedStandardId,
      setSelectedDivisionId,
    ]
  );

  const clearWorklistFilters = () =>
    navigate(() => {
      setSelectedStandardId(ALL_STANDARDS);
      setSelectedDivisionId(ALL_STANDARDS);
      const next = new URLSearchParams(searchParams.toString());
      ['class', 'division', 'placementDivision'].forEach((key) => next.delete(key));
      setTablePage(1);
      setSelectedStudentIds([]);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });

  const handleColumnFilterChange = (filters: IParams['filters']) =>
    navigate(() => {
      const latest = (column: string) =>
        filters.filter((filter) => filter.column === column).at(-1);
      const statusOption = studentSetupStatusOptions.find(
        ({ label, setupLabel }) =>
          (activeView === 'readiness' ? setupLabel : label) === latest('statusLabel')?.value
      );
      const placementFilter = latest(activeView === 'division' ? 'divisionTask' : 'placement');
      const studentFilter = latest('studentName');
      const ownerFilter = latest('ownerName');
      const rollFilter = latest('rollNumberTask');
      const next = new URLSearchParams(searchParams.toString());
      [
        'status',
        'placementDivision',
        'studentName',
        'studentNameOp',
        'ownerName',
        'ownerNameOp',
        'rollNumber',
        'rollMin',
        'rollMax',
        'rollOp',
      ].forEach((key) => next.delete(key));
      if (statusOption) next.set('status', String(statusOption.status));
      if (placementFilter?.value) next.set('placementDivision', String(placementFilter.value));
      if (studentFilter?.value) {
        next.set('studentName', String(studentFilter.value));
        next.set('studentNameOp', getTextFilterOperator(studentFilter.type));
      }
      if (ownerFilter?.value) {
        next.set('ownerName', String(ownerFilter.value));
        next.set('ownerNameOp', getTextFilterOperator(ownerFilter.type));
      }
      if (rollFilter) {
        const operator = getNumberFilterOperator(rollFilter.type);
        if (operator === 'between' && rollFilter.value && typeof rollFilter.value === 'object') {
          next.set('rollMin', String(rollFilter.value.min));
          next.set('rollMax', String(rollFilter.value.max));
          next.set('rollOp', operator);
        } else if (Number.isFinite(Number(rollFilter.value))) {
          next.set('rollNumber', String(rollFilter.value));
          next.set('rollOp', operator);
        }
      }
      setTablePage(1);
      setSelectedStudentIds([]);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });

  const handleSortChange = (nextSorts: IParams['sorts']) =>
    navigate(() => {
      const sort = nextSorts.at(-1);
      const next = new URLSearchParams(searchParams.toString());
      if (sort && Object.prototype.hasOwnProperty.call(studentSetupSortFields, sort.column)) {
        next.set('sort', sort.column);
        next.set('direction', sort.direction);
      } else {
        next.delete('sort');
        next.delete('direction');
      }
      setTablePage(1);
      setSelectedStudentIds([]);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });

  const queryArgs = useMemo(
    () => ({
      academicYearId: academicYearId || '',
      dashboardQueue,
      boardId: selectedBoardId || undefined,
      mediumId: selectedMediumId || undefined,
      ...academicClassFilterInput(selectedStandardId),
      ...(readAcademicFilterIds(selectedDivisionId).length > 1
        ? { divisionIds: readAcademicFilterIds(selectedDivisionId) }
        : { divisionId: readAcademicFilterIds(selectedDivisionId)[0] }),
      placementDivisionId: placementFilterApplicable ? placementDivisionId || undefined : undefined,
      status: selectedStatusOption?.status,
      pendingTask:
        (!dashboardQueue || dashboardQueue === 'unfinished') &&
        activeView !== 'readiness' &&
        activeTaskScope === 'pending'
          ? activeView
          : undefined,
      enteredToday:
        activeView === 'readiness' && searchParams.get('today') === 'true' ? true : undefined,
      studentNameFilter: studentNameFilter || undefined,
      studentNameOperator: studentNameFilter ? studentNameOperator : undefined,
      ownerNameFilter: ownerNameFilter || undefined,
      ownerNameOperator: ownerNameFilter ? ownerNameOperator : undefined,
      rollNumberFilter:
        rollFilterApplicable && hasRollNumberFilter && rollNumberOperator !== 'between'
          ? rollNumberFilter
          : undefined,
      rollNumberMin:
        rollFilterApplicable && hasRollNumberRange && rollNumberOperator === 'between'
          ? rollNumberMin
          : undefined,
      rollNumberMax:
        rollFilterApplicable && hasRollNumberRange && rollNumberOperator === 'between'
          ? rollNumberMax
          : undefined,
      rollNumberOperator:
        rollFilterApplicable && (hasRollNumberFilter || hasRollNumberRange)
          ? rollNumberOperator
          : undefined,
      sorting: sortOrder,
      search: searchTerm.trim() || undefined,
      skipCount: (tablePage - 1) * rowsPerPage,
      maxResultCount: rowsPerPage,
    }),
    [
      academicYearId,
      dashboardQueue,
      searchParams,
      activeView,
      activeTaskScope,
      selectedBoardId,
      selectedMediumId,
      selectedDivisionId,
      placementDivisionId,
      placementFilterApplicable,
      selectedStatusOption?.status,
      studentNameFilter,
      studentNameOperator,
      ownerNameFilter,
      ownerNameOperator,
      rollNumberFilter,
      rollNumberMin,
      rollNumberMax,
      rollNumberOperator,
      hasRollNumberFilter,
      hasRollNumberRange,
      rollFilterApplicable,
      sortOrder,
      rowsPerPage,
      searchTerm,
      selectedStandardId,
      tablePage,
    ]
  );

  const onboardingQuery = useGetStudentOnboardingCasesQuery(queryArgs, {
    skip: !academicYearId || (!dashboardQueue && (!selectedBoardId || !selectedMediumId)),
  });
  const pendingCountQuery = useGetStudentOnboardingCasesQuery(
    {
      ...queryArgs,
      pendingTask: activeView === 'readiness' ? undefined : activeView,
      sorting: undefined,
      skipCount: 0,
      maxResultCount: 1,
    },
    {
      skip:
        !academicYearId ||
        (!dashboardQueue && (!selectedBoardId || !selectedMediumId)) ||
        activeView === 'readiness' ||
        activeTaskScope === 'pending',
    }
  );
  const filterOptionsQuery = useGetStudentOnboardingFilterOptionsQuery(academicYearId ?? '', {
    skip: !academicYearId,
  });
  const placementOptions = useMemo(() => {
    const options = filterOptionsQuery.currentData;
    if (!options) return [];
    const mediumIds = new Set(
      options.mediums
        .filter((medium) => medium.parentId === selectedBoardId)
        .map((medium) => medium.id)
    );
    const standards = options.standards.filter(
      (standard) =>
        standard.parentId === selectedMediumId &&
        mediumIds.has(String(standard.parentId)) &&
        (!readAcademicFilterIds(selectedStandardId).length ||
          readAcademicFilterIds(selectedStandardId).includes(standard.id))
    );
    const standardNames = new Map(standards.map((standard) => [standard.id, standard.name]));
    return options.divisions
      .filter((division) => standardNames.has(String(division.parentId)))
      .map((division) => ({
        value: division.id,
        label: `${standardNames.get(String(division.parentId))} / ${division.name}`,
      }));
  }, [filterOptionsQuery.currentData, selectedBoardId, selectedMediumId, selectedStandardId]);
  const columnFilters: IParams['filters'] = [
    ...(studentNameFilter
      ? [
          {
            column: 'studentName',
            type: studentNameOperator,
            value: studentNameFilter,
            valueType: 'string',
            label: 'Student',
          },
        ]
      : []),
    ...(placementFilterApplicable && placementDivisionId
      ? [
          {
            column: activeView === 'division' ? 'divisionTask' : 'placement',
            type: 'equals',
            value: placementDivisionId,
            valueType: 'enum',
            label:
              activeView === 'division'
                ? 'Current placement'
                : activeView === 'readiness'
                  ? 'Class & Division'
                  : 'Placement',
            displayValue:
              placementOptions.find((option) => option.value === placementDivisionId)?.label ??
              'Selected division',
          },
        ]
      : []),
    ...(ownerNameFilter
      ? [
          {
            column: 'ownerName',
            type: ownerNameOperator,
            value: ownerNameFilter,
            valueType: 'string',
            label: 'Owner',
          },
        ]
      : []),
    ...(rollFilterApplicable && (hasRollNumberFilter || hasRollNumberRange)
      ? [
          {
            column: 'rollNumberTask',
            type: rollNumberOperator,
            value:
              rollNumberOperator === 'between'
                ? { min: rollNumberMin, max: rollNumberMax }
                : rollNumberFilter,
            valueType: 'number',
            label: 'Roll number',
          },
        ]
      : []),
    ...(selectedStatusOption
      ? [
          {
            column: 'statusLabel',
            type: 'equals',
            value:
              activeView === 'readiness'
                ? selectedStatusOption.setupLabel
                : selectedStatusOption.label,
            valueType: 'enum',
            label: 'Status',
            displayValue:
              activeView === 'readiness'
                ? selectedStatusOption.setupLabel
                : selectedStatusOption.label,
          },
        ]
      : []),
  ];
  useEffect(() => {
    const options = filterOptionsQuery.currentData;
    if (!options || dashboardQueue) return;
    const board = options.boards.find((item) => item.id === selectedBoardId);
    const mediums = options.mediums.filter((item) => item.parentId === selectedBoardId);
    const standards = options.standards.filter((item) => item.parentId === selectedMediumId);
    const classIds = readAcademicFilterIds(selectedStandardId);
    const validClasses = classIds.filter((id) => standards.some((item) => item.id === id));
    const validDivisions = readAcademicFilterIds(selectedDivisionId).filter((id) =>
      options.divisions.some(
        (item) =>
          item.id === id &&
          (validClasses.length
            ? validClasses.includes(String(item.parentId))
            : standards.some((standard) => standard.id === item.parentId))
      )
    );
    if (!board) {
      if (options.boards[0]) changeAcademicFilter('board', options.boards[0].id);
    } else if (!mediums.some((item) => item.id === selectedMediumId)) {
      if (mediums[0]) changeAcademicFilter('medium', mediums[0].id);
    } else if (validClasses.join(',') !== classIds.join(','))
      changeAcademicFilter('class', validClasses.join(','));
    else if (validDivisions.join(',') !== readAcademicFilterIds(selectedDivisionId).join(','))
      changeAcademicFilter('division', validDivisions.join(','));
    else if (
      placementDivisionId &&
      !placementOptions.some((option) => option.value === placementDivisionId)
    ) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('placementDivision');
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [
    changeAcademicFilter,
    filterOptionsQuery.currentData,
    dashboardQueue,
    selectedBoardId,
    selectedMediumId,
    selectedStandardId,
    selectedDivisionId,
    placementDivisionId,
    placementOptions,
    searchParams,
    router,
    pathname,
  ]);
  const liveRows = useMemo(
    () => (onboardingQuery.currentData?.items ?? []).map(mapOnboardingCaseToItem),
    [onboardingQuery.currentData?.items]
  );
  const assignmentType =
    activeView === 'division' || activeView === 'gr-number' || activeView === 'roll-number'
      ? activeView
      : undefined;
  const assignment = useStudentSetupAssignment({
    rows: liveRows,
    type: assignmentType,
    canManage: canManageOnboarding,
    grAssignmentMode: settings.grNumber.assignmentMode,
    contextKey: [
      academicYearId ?? '',
      selectedBoardId,
      selectedMediumId,
      selectedStandardId,
      selectedDivisionId,
      activeView,
      activeTaskScope,
      searchParams.toString(),
      tablePage,
      rowsPerPage,
    ].join(':'),
    totalCount: onboardingQuery.currentData?.totalCount ?? 0,
  });
  const { displayedRows } = assignment;
  const sourceRows = displayedRows;
  const rollClassIds = readAcademicFilterIds(selectedStandardId);
  const rollDivisionIds = readAcademicFilterIds(selectedDivisionId);
  const rollScope =
    academicYearId && rollClassIds.length === 1 && rollDivisionIds.length === 1
      ? { academicYearId, standardId: rollClassIds[0], divisionId: rollDivisionIds[0] }
      : undefined;
  const rollContext = useGetRollNumberBatchContextQuery(rollScope!, {
    skip: activeView !== 'roll-number' || !rollScope,
  });
  const interactionBusy =
    assignment.busy || lockInteraction || quickSetupState.busy || Boolean(rollWorkspace);
  const { requestNavigation, confirmation } = useUnsavedNavigation(
    assignment.form.dirty || quickSetupState.dirty,
    {
      blockNavigation: interactionBusy || Boolean(autoAssignment) || Boolean(rollWorkspace),
      push: (href) => {
        assignment.cancel();
        router.push(href);
      },
    }
  );
  navigationRef.current = (action) =>
    requestNavigation(() => {
      assignment.cancel();
      action();
    });
  const showDivisionSelection =
    activeView === 'division' && readAcademicFilterIds(selectedStandardId).length === 1;
  const selectableStudents = displayedRows.filter(
    (row) =>
      row.source === 'onboarding-case' &&
      !row.studentEnrollmentId &&
      ![4, 5, 6].includes(row.backendStatus ?? -1) &&
      !['completed', 'cancelled', 'provisioning'].includes(row.status)
  );
  const assignmentTargets =
    showDivisionSelection && selectedStudentIds.length
      ? displayedRows.filter((row) => selectedStudentIds.includes(row.id))
      : displayedRows;
  const automaticTargets = assignment.eligible('automatic', assignmentTargets);
  const rollAutomaticTargets = rollScope
    ? getStudentSetupRollAutoTargets(displayedRows, rollScope)
    : [];
  const pendingRollBatches = (rollContext.currentData?.batches ?? []).filter(
    (batch) =>
      (batch.status === 'PendingApproval' || batch.status === 'Approved') &&
      Boolean(batch.caseIds?.length) &&
      batch.caseIds!.every((id) => displayedRows.some((row) => row.id === id))
  );
  const reviewRollBatch =
    pendingRollBatches.find((batch) => batch.canDecide || batch.canApply) ?? pendingRollBatches[0];
  const manualTargets = assignment.eligible('manual', assignmentTargets);
  const pendingCount =
    activeTaskScope === 'pending'
      ? (onboardingQuery.currentData?.totalCount ?? 0)
      : (pendingCountQuery.currentData?.totalCount ?? 0);
  const assignmentScopeLoading = Boolean(
    assignmentType &&
    academicYearId &&
    ((filterOptionsQuery.isFetching && !filterOptionsQuery.currentData) ||
      (!dashboardQueue &&
        ((!selectedBoardId && filterOptionsQuery.currentData?.boards.length) ||
          (!selectedMediumId &&
            filterOptionsQuery.currentData?.mediums.some(
              (medium) => medium.parentId === selectedBoardId
            )))))
  );
  const automaticDisabledReason = !assignmentType
    ? undefined
    : !canManageOnboarding
      ? 'Read-only access.'
      : activeView === 'division' && !showDivisionSelection
        ? 'Select one class for Auto.'
        : activeView === 'roll-number'
          ? !rollScope
            ? 'Select one class and division for Auto.'
            : undefined
          : undefined;
  const selectedRow = sourceRows.find((student) => student.id === selectedStudentId);
  if (selectedRow) selectedSnapshot.current = selectedRow;
  const focusedCaseQuery = useGetStudentOnboardingCaseQuery(focusedCaseId ?? '', {
    skip: !focusedCaseId || Boolean(sourceRows.find((student) => student.id === focusedCaseId)),
  });
  const selectedStudent =
    selectedRow ||
    (focusedCaseQuery.currentData &&
    focusedCaseQuery.currentData.id === focusedCaseId &&
    focusedCaseId === selectedStudentId
      ? mapOnboardingCaseToItem(focusedCaseQuery.currentData)
      : selectedSnapshot.current?.id === selectedStudentId
        ? selectedSnapshot.current
        : null);
  const assignmentStudents = useMemo(
    () =>
      assignmentRequest
        ? sourceRows.filter((student) => assignmentRequest.studentIds.includes(student.id))
        : [],
    [assignmentRequest, sourceRows]
  );
  const operationalAssignmentStudent =
    assignmentRequest?.studentIds[0] === selectedStudent?.id
      ? selectedStudent
      : assignmentStudents.length === 1 && assignmentStudents[0].source === 'onboarding-case'
        ? assignmentStudents[0]
        : null;
  const allStudentsSelected =
    selectableStudents.length > 0 &&
    selectableStudents.every((student) => selectedStudentIds.includes(student.id));
  const someStudentsSelected =
    selectableStudents.some((student) => selectedStudentIds.includes(student.id)) &&
    !allStudentsSelected;

  useEffect(() => {
    setSelectedStudentIds((current) =>
      current.filter((id) => sourceRows.some((student) => student.id === id))
    );
    // A completed assignment/activation can remove a row from the pending list.
    // Keep its open workspace until staff explicitly closes it or chooses another case.
  }, [sourceRows, focusedCaseId]);

  useEffect(() => {
    setSelectedStudentIds([]);
    setSelectedStudentId(focusedCaseId);
    setReviewingCaseDetails(false);
    if (!focusedCaseId) selectedSnapshot.current = null;
  }, [activeTaskScope, activeView, focusedCaseId]);

  const openStudentSetup = (id: string, section: StudentSetupView | null = null) => {
    if (!selectedStudentId && document.activeElement instanceof HTMLElement) {
      setupReturnFocus.current = document.activeElement;
    }
    setDrawerTaskView(section);
    setReviewingCaseDetails(false);
    setSelectedStudentId(id);
    const next = new URLSearchParams(searchParams.toString());
    next.set('case', id);
    // Keep the worklist, filters and task tab in place while opening the unified drawer.
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const closeStudentSetup = () =>
    navigate(() => {
      setSelectedStudentId(null);
      setReviewingCaseDetails(false);
      selectedSnapshot.current = null;
      const next = new URLSearchParams(searchParams.toString());
      next.delete('case');
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  const nextSetupStudent = sourceRows.find(
    (row) =>
      row.source === 'onboarding-case' &&
      row.id !== selectedStudentId &&
      ![4, 5].includes(row.backendStatus ?? -1)
  );

  const getViewHref = (view: StudentSetupView) => {
    const next = new URLSearchParams(searchParams.toString());
    if (dashboardQueue && view !== activeView) next.set('dashboard', 'unfinished');
    next.set('view', view);
    next.delete('case');
    if (view !== activeView) next.delete('scope');
    if (view !== 'readiness') next.delete('stage');
    if (view !== activeView) {
      next.delete('status');
      if (view !== 'roll-number' && view !== 'division') {
        ['rollNumber', 'rollMin', 'rollMax', 'rollOp'].forEach((key) => next.delete(key));
      }
      if (next.get('sort') === 'divisionTask') next.set('sort', 'placement');
      if (view === 'division' && next.get('sort') === 'placement') next.set('sort', 'divisionTask');
      if (next.get('sort') === 'rollNumberTask' && view !== 'roll-number' && view !== 'division') {
        next.delete('sort');
        next.delete('direction');
      }
    }
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const getScopeHref = (scope: StudentSetupTaskScope) => {
    const next = new URLSearchParams(searchParams.toString());
    if (dashboardQueue) next.set('dashboard', 'unfinished');
    next.set('view', activeView);
    next.set('scope', scope);
    next.delete('stage');
    if (scope === 'pending') {
      ['rollNumber', 'rollMin', 'rollMax', 'rollOp'].forEach((key) => next.delete(key));
      if (activeView === 'division') next.delete('placementDivision');
      if (next.get('sort') === 'rollNumberTask' || next.get('sort') === 'divisionTask') {
        next.delete('sort');
        next.delete('direction');
      }
    }
    return `${pathname}?${next.toString()}`;
  };

  const toggleStudent = (studentId: string) =>
    navigate(() => {
      setSelectedStudentIds((current) =>
        current.includes(studentId)
          ? current.filter((id) => id !== studentId)
          : [...current, studentId]
      );
    });

  const toggleAll = () =>
    navigate(() => {
      const visibleIds = selectableStudents.map((student) => student.id);
      setSelectedStudentIds((current) =>
        allStudentsSelected
          ? current.filter((id) => !visibleIds.includes(id))
          : Array.from(new Set([...current, ...visibleIds]))
      );
    });

  const openAssignment = (type: StudentAssignmentType, studentIds: string[]) => {
    if (!canManageOnboarding) {
      shikshaMitraToast.error({
        message: 'You do not have permission to change onboarding cases.',
      });
      return;
    }
    if (studentIds.length !== 1) {
      shikshaMitraToast.error({
        message: 'Select one student to review and save placement or identifiers.',
      });
      return;
    }
    setAssignmentRequest({ type, studentIds });
  };

  const runPrimaryCaseAction = async (
    student: StudentOnboardingItem,
    latestConcurrencyStamp?: string,
    action: 'refresh' | 'activate' = 'refresh',
    siblingParentSelection?: StudentSiblingParentSelection
  ) => {
    if (student.source !== 'onboarding-case') return;
    if (!canManageOnboarding) {
      shikshaMitraToast.error({
        message: 'You do not have permission to update or activate this onboarding case.',
      });
      return;
    }

    try {
      if (action === 'activate' || student.backendStatus === 2) {
        await activateOnboarding({
          id: student.id,
          concurrencyStamp: latestConcurrencyStamp ?? student.concurrencyStamp,
          idempotencyKey: crypto.randomUUID(),
          ...(siblingParentSelection ? { siblingParentSelection } : {}),
        }).unwrap();
        shikshaMitraToast.success({
          message: `${student.studentName} is active and available in Student Records. Open App Login if app access is pending.`,
        });
        setSelectedStudentId(null);
        return;
      }

      await refreshReadiness({
        id: student.id,
        concurrencyStamp: student.concurrencyStamp,
      }).unwrap();
      shikshaMitraToast.success({
        message: `Readiness refreshed for ${student.studentName}.`,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message:
          parseApiProblemDetail(error).detail ||
          (action === 'activate' || student.backendStatus === 2
            ? 'Student activation could not be completed. Refresh the case and resolve any new blockers.'
            : 'Readiness could not be refreshed. Please retry with the latest case data.'),
      });
    }
  };

  const singleStudentMode =
    selectedStudent?.source === 'onboarding-case' ||
    Boolean(focusedCaseId && selectedStudentId && !selectedStudent);

  useEffect(() => {
    if (singleStudentMode) {
      setupWasOpen.current = true;
      return undefined;
    }
    if (!setupWasOpen.current) return undefined;
    setupWasOpen.current = false;
    // The ?case transition can outlive the page unmount. Restore focus only after
    // the retained worklist is visible again, including returns from deep links.
    const frame = window.requestAnimationFrame(() => {
      const opener = setupReturnFocus.current;
      const target =
        opener?.isConnected && !opener.matches(':disabled') && opener.getClientRects().length
          ? opener
          : document.querySelector<HTMLElement>('input[aria-label="Search table"]');
      target?.focus({ preventScroll: true });
      setupReturnFocus.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [singleStudentMode]);

  return (
    <Stack
      spacing={1}
      sx={{
        minWidth: 0,
        minHeight: 0,
        height: singleStudentMode ? '100%' : { xs: 'auto', md: '100%' },
      }}
    >
      <Box
        component="fieldset"
        disabled={singleStudentMode && interactionBusy}
        inert={singleStudentMode && interactionBusy}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0, flexShrink: 0 }}
      >
        <CustomBreadcrumbs
          heading="Student Setup"
          description="Assign class details, confirm fees and prepare app login."
          tooltipProps={
            {
              title: singleStudentMode
                ? 'Complete the student setup, then send credentials manually from App Login.'
                : studentSetupTooltip,
              sx: { textAlign: 'left' },
            } as TooltipProps
          }
          isBack={singleStudentMode}
          onBack={closeStudentSetup}
          links={[
            { name: 'Student', href: studentPaths.dashboard },
            { name: 'Onboarding' },
            { name: 'Student Setup' },
          ]}
        />
      </Box>

      {singleStudentMode && focusedCaseId && !selectedRow && focusedCaseQuery.isFetching && (
        <LinearProgress aria-label="Loading selected onboarding student" />
      )}
      {singleStudentMode && !selectedStudent && !focusedCaseQuery.isError && (
        <Stack spacing={1.5} role="status" aria-label="Loading student setup">
          <Skeleton variant="rounded" height={64} />
          <Skeleton variant="rounded" height={220} />
          <Skeleton variant="rounded" height={240} />
        </Stack>
      )}
      {singleStudentMode && focusedCaseId && !selectedRow && focusedCaseQuery.isError && (
        <StudentFeedback
          notificationKey="STU-0958"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={() => focusedCaseQuery.refetch()}>
              Retry
            </Button>
          }
        >
          The selected onboarding case could not be loaded.
        </StudentFeedback>
      )}
      <Box
        data-testid="student-setup-worklist"
        sx={{
          display: singleStudentMode ? 'none' : 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 0,
          minHeight: 0,
          flex: 1,
        }}
      >
        <StudentSetupTaskNavigation activeView={activeView} getViewHref={getViewHref} />
        <Box
          role="tabpanel"
          id={`student-setup-${activeView}-panel`}
          aria-labelledby={`student-setup-${activeView}-tab`}
          sx={{
            minWidth: 0,
            minHeight: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {dashboardQueue && (
            <>
              <StudentFeedback notificationKey="STU-0959" presentation="toast" severity="info">
                Dashboard worklist: {dashboardQueue.replaceAll('-', ' ')}. Counts follow the
                selected academic scope.
              </StudentFeedback>
              <Label sx={{ alignSelf: 'flex-start' }}>
                Worklist: {dashboardQueue.replaceAll('-', ' ')}
              </Label>
            </>
          )}
          <StudentSetupFilters
            allowAllScope={Boolean(dashboardQueue)}
            options={filterOptionsQuery.currentData}
            isLoading={filterOptionsQuery.isFetching}
            disabled={!academicYearId || filterOptionsQuery.isError || interactionBusy}
            todayOnly={searchParams.get('today') === 'true'}
            onTodayChange={
              activeView === 'readiness'
                ? (checked) =>
                    navigate(() => {
                      const next = new URLSearchParams(searchParams.toString());
                      if (checked) next.set('today', 'true');
                      else next.delete('today');
                      setTablePage(1);
                      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
                    })
                : undefined
            }
            selectedBoardId={selectedBoardId}
            selectedMediumId={selectedMediumId}
            selectedStandardId={selectedStandardId}
            selectedDivisionId={selectedDivisionId}
            onBoardChange={(value) => changeAcademicFilter('board', value)}
            onMediumChange={(value) => changeAcademicFilter('medium', value)}
            onStandardChange={(value) => changeAcademicFilter('class', value)}
            onDivisionChange={(value) => changeAcademicFilter('division', value)}
          />

          {filterOptionsQuery.isError && (
            <StudentFeedback
              notificationKey="STU-0960"
              presentation="toast"
              severity="error"
              action={
                <Button size="small" onClick={() => filterOptionsQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load academic filter options.
            </StudentFeedback>
          )}

          {!academicYearId && showFilterAlert ? (
            <StudentFeedback
              notificationKey="STU-0961"
              presentation="inline"
              severity="info"
              onClose={() => setShowFilterAlert(false)}
            >
              Select an academic year to load onboarding cases.
            </StudentFeedback>
          ) : null}
          {assignment.contextChanged && (
            <StudentFeedback
              notificationKey="STU-0962"
              presentation="persistent"
              severity="warning"
              action={
                <Button size="small" disabled={interactionBusy} onClick={() => navigate(() => {})}>
                  Cancel editing
                </Button>
              }
            >
              The academic scope or task changed. Your previous edits are kept for review, but
              cannot be saved here. Cancel editing to load the current worklist.
            </StudentFeedback>
          )}

          <Box sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex' }}>
            <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, flex: 1 }}>
              {activeView !== 'readiness' && (
                <StudentSetupAssignmentToolbar
                  view={activeView}
                  title={assignmentViewMeta[activeView].title}
                  scope={activeTaskScope}
                  pendingCount={
                    assignmentType &&
                    (activeTaskScope === 'pending'
                      ? onboardingQuery.isError
                      : pendingCountQuery.isError)
                      ? undefined
                      : pendingCount
                  }
                  pendingLoading={Boolean(
                    assignmentType &&
                    (assignmentScopeLoading ||
                      (activeTaskScope === 'pending'
                        ? onboardingQuery.isFetching && !onboardingQuery.currentData
                        : pendingCountQuery.isFetching && !pendingCountQuery.currentData))
                  )}
                  selectedCount={showDivisionSelection ? selectedStudentIds.length : 0}
                  onClearSelection={() => setSelectedStudentIds([])}
                  automaticDisabledReason={automaticDisabledReason}
                  onScopeChange={(scope) =>
                    navigate(() => {
                      setTablePage(1);
                      setSelectedStudentIds([]);
                      router.replace(getScopeHref(scope), { scroll: false });
                    })
                  }
                  busy={interactionBusy}
                  automaticLoading={
                    assignment.busy || Boolean(rollWorkspace && !rollWorkspace.batchId)
                  }
                  unavailable={
                    onboardingQuery.isFetching ||
                    onboardingQuery.isError ||
                    !onboardingQuery.currentData
                  }
                  automaticCount={
                    activeView === 'roll-number'
                      ? rollContext.currentData && !rollContext.isFetching && !rollContext.isError
                        ? rollAutomaticTargets.length
                        : 0
                      : activeView === 'division' && !showDivisionSelection
                        ? 0
                        : automaticTargets.length
                  }
                  manualCount={manualTargets.length}
                  manualEditing={assignment.manualEditing}
                  changedCount={
                    assignment.contextChanged || !canManageOnboarding ? 0 : assignment.changedCount
                  }
                  onAuto={async () => {
                    if (
                      interactionBusy ||
                      !canManageOnboarding ||
                      onboardingQuery.isFetching ||
                      onboardingQuery.isError
                    )
                      return;
                    if (
                      activeView === 'roll-number' &&
                      rollScope &&
                      rollAutomaticTargets.length &&
                      rollContext.currentData &&
                      !rollContext.isFetching &&
                      !rollContext.isError
                    ) {
                      navigate(() => {
                        assignment.retainAutomaticPage();
                        setRollWorkspace({
                          scope: rollScope,
                          caseIds: rollAutomaticTargets.map((student) => student.id),
                        });
                      });
                      return;
                    }
                    if (activeView === 'gr-number' && automaticTargets.length) {
                      const completed = await assignment.runAutomatic(automaticTargets);
                      if (completed.length) {
                        const failed = completed.filter(
                          (result) => result.status === 'failed'
                        ).length;
                        const saved = completed.filter(
                          (result) => result.status === 'saved'
                        ).length;
                        const message = `${saved} GR numbers assigned${failed ? `; ${failed} need attention in the table` : ''}.`;
                        if (failed) shikshaMitraToast.warning({ message });
                        else shikshaMitraToast.success({ message });
                      }
                      return;
                    }
                    if (activeView !== 'division') return;
                    if (assignmentType && automaticTargets.length) {
                      assignment.clearResults();
                      setAutoAssignment({ type: assignmentType, students: automaticTargets });
                    }
                  }}
                  onManual={() => assignment.startManual(assignmentTargets)}
                  onSave={() => assignment.form.submitForm()}
                  onCancel={() => navigate(() => {})}
                  needsReason={assignment.needsReason}
                  reason={assignment.form.values.reason}
                  reasonError={
                    assignment.form.touched.reason || assignment.form.submitCount > 0
                      ? assignment.form.errors.reason
                      : undefined
                  }
                  onReasonChange={(reason) => assignment.form.setFieldValue('reason', reason)}
                  onReasonBlur={() => assignment.form.setFieldTouched('reason')}
                  locks={
                    activeView === 'gr-number' || activeView === 'roll-number' ? (
                      <>
                        {activeView === 'roll-number' && reviewRollBatch && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            disabled={!rollScope || interactionBusy || assignment.manualEditing}
                            onClick={() =>
                              rollScope &&
                              navigate(() => {
                                assignment.retainAutomaticPage();
                                setRollWorkspace({
                                  scope: rollScope,
                                  batchId: reviewRollBatch.id,
                                  caseIds: reviewRollBatch.caseIds ?? undefined,
                                });
                              })
                            }
                          >
                            {reviewRollBatch.status === 'Approved'
                              ? 'Apply approved'
                              : 'Review approval'}
                          </Button>
                        )}
                        <StudentIdentifierLockControls
                          academicYearId={academicYearId}
                          divisionId={
                            readAcademicFilterIds(selectedDivisionId).length === 1
                              ? readAcademicFilterIds(selectedDivisionId)[0]
                              : undefined
                          }
                          identifierType={activeView === 'gr-number' ? 'gr' : 'roll'}
                          canLock={canManageOnboarding}
                          canUnlock={
                            canManageOnboarding &&
                            !filterOptionsQuery.isError &&
                            filterOptionsQuery.currentData?.canUnlockIdentifiers === true
                          }
                          disabled={
                            assignment.manualEditing ||
                            assignment.busy ||
                            onboardingQuery.isFetching
                          }
                          onInteractionChange={setLockInteraction}
                        />
                      </>
                    ) : undefined
                  }
                />
              )}
              {activeView === 'roll-number' && rollScope && rollContext.isError && (
                <StudentFeedback
                  notificationKey="STU-0963"
                  presentation="toast"
                  severity="error"
                  action={
                    <Button
                      size="small"
                      disabled={interactionBusy}
                      onClick={() => rollContext.refetch()}
                    >
                      Retry
                    </Button>
                  }
                >
                  Could not load roll numbering.
                </StudentFeedback>
              )}
              <StudentSetupTable
                rows={displayedRows}
                showSelection={showDivisionSelection && canManageOnboarding}
                manualEditing={assignment.manualEditing}
                editableIds={assignment.editableIds}
                manualValues={assignment.form.values.values}
                manualErrors={assignment.manualErrors}
                manualBlockers={assignment.manualBlockers}
                assignmentMessages={assignment.messages}
                assignmentBusy={interactionBusy}
                onManualChange={(id, value) => assignment.form.setFieldValue(`values.${id}`, value)}
                onManualBlur={(id) => assignment.form.setFieldTouched(`values.${id}`)}
                isLoading={
                  assignmentScopeLoading ||
                  onboardingQuery.isLoading ||
                  (onboardingQuery.isFetching &&
                    !onboardingQuery.currentData &&
                    !assignment.manualEditing)
                }
                isError={onboardingQuery.isError}
                onRetry={() => onboardingQuery.refetch()}
                view={activeView}
                taskScope={activeTaskScope}
                tableId={`student-onboarding-${activeView}-worklist`}
                tableTitle={
                  activeView === 'readiness'
                    ? 'Student setup status'
                    : assignmentViewMeta[activeView].title
                }
                noDataText={
                  !academicYearId
                    ? 'Select an academic year to view onboarding students.'
                    : activeView === 'readiness'
                      ? hasWorklistFilters
                        ? 'No students match the selected filters.'
                        : 'No students are in onboarding for this academic year.'
                      : activeTaskScope === 'pending'
                        ? assignmentViewMeta[activeView].pendingEmptyText
                        : hasWorklistFilters
                          ? 'No students match the selected filters.'
                          : 'No students are in onboarding for this academic year.'
                }
                noDataDescription={
                  academicYearId && !hasWorklistFilters && activeView === 'readiness'
                    ? 'Students appear here after an admission is accepted.'
                    : undefined
                }
                onViewAllStudents={
                  assignmentType && activeTaskScope === 'pending'
                    ? () =>
                        navigate(() => {
                          setTablePage(1);
                          setSelectedStudentIds([]);
                          router.replace(getScopeHref('all'), { scroll: false });
                        })
                    : undefined
                }
                onClearWorklistFilters={
                  hasWorklistFilters && academicYearId ? clearWorklistFilters : undefined
                }
                onOpen={(id) => navigate(() => openStudentSetup(id))}
                onOpenTask={(id, view) => navigate(() => openStudentSetup(id, view))}
                selectedStudentIds={selectedStudentIds}
                onToggleSelection={toggleStudent}
                allStudentsSelected={allStudentsSelected}
                someStudentsSelected={someStudentsSelected}
                onToggleAll={toggleAll}
                totalCount={
                  assignment.displayedTotalCount ?? onboardingQuery.currentData?.totalCount ?? 0
                }
                page={tablePage}
                rowsPerPage={rowsPerPage}
                searchTerm={searchTerm}
                onPaginationChange={(page, nextRowsPerPage) =>
                  navigate(() => {
                    setTablePage(page);
                    setRowsPerPage(nextRowsPerPage);
                    setSelectedStudentIds([]);
                  })
                }
                onSearchChange={(value) =>
                  navigate(() => {
                    const next = new URLSearchParams(searchParams.toString());
                    if (value.trim()) next.set('search', value.trim());
                    else next.delete('search');
                    setTablePage(1);
                    const query = next.toString();
                    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
                    setSelectedStudentIds([]);
                  })
                }
                columnFilters={columnFilters}
                onColumnFilterChange={handleColumnFilterChange}
                sorts={sorts}
                onSortChange={handleSortChange}
                placementOptions={placementOptions}
                isServerBacked
              />
            </Stack>
          </Box>
        </Box>
      </Box>

      {selectedStudent?.source === 'onboarding-case' && (
        <Box
          inert={reviewingCaseDetails}
          sx={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}
        >
          <StudentQuickSetupPage
            key={selectedStudent.id}
            student={selectedStudent}
            academicYearId={academicYearId}
            initialSection={drawerTaskView ?? activeView}
            canManage={canManageOnboarding}
            onClose={closeStudentSetup}
            onShowDetails={() => {
              if (!interactionBusy) setReviewingCaseDetails(true);
            }}
            onNext={
              nextSetupStudent
                ? () => navigate(() => openStudentSetup(nextSetupStudent.id))
                : undefined
            }
            onStateChange={setQuickSetupState}
          />
        </Box>
      )}
      {(selectedStudent?.source !== 'onboarding-case' || reviewingCaseDetails) && (
        <StudentSetupDrawer
          presentation={reviewingCaseDetails ? 'details' : 'workflow'}
          initialView={reviewingCaseDetails ? 'details' : undefined}
          taskView={reviewingCaseDetails ? 'readiness' : (drawerTaskView ?? activeView)}
          open={Boolean(selectedStudent)}
          student={selectedStudent}
          onClose={reviewingCaseDetails ? () => setReviewingCaseDetails(false) : closeStudentSetup}
          onAssignDivision={() =>
            selectedStudent && openAssignment('division', [selectedStudent.id])
          }
          onAssignGrNumber={() =>
            selectedStudent && openAssignment('gr-number', [selectedStudent.id])
          }
          onAssignRollNumber={() =>
            selectedStudent && openAssignment('roll-number', [selectedStudent.id])
          }
          onPrimaryAction={runPrimaryCaseAction}
          primaryActionLoading={
            refreshReadinessState.isLoading || activateOnboardingState.isLoading
          }
          canManage={canManageOnboarding}
          canCancel={canCancelOnboarding}
        />
      )}
      {operationalAssignmentStudent ? (
        <StudentOnboardingOperationDialog
          assignmentType={assignmentRequest?.type ?? null}
          student={operationalAssignmentStudent}
          onClose={() => setAssignmentRequest(null)}
        />
      ) : null}
      {autoAssignment && (
        <StudentSetupAutoAssignmentDialog
          type={autoAssignment.type}
          students={autoAssignment.students}
          busy={assignment.busy}
          results={assignment.results}
          onAssign={(divisionId) => assignment.runAutomatic(autoAssignment.students, divisionId)}
          onClose={() => {
            if (!assignment.busy) setAutoAssignment(null);
          }}
        />
      )}
      {confirmation}
      {rollWorkspace && (
        <StudentRollNumberWorkspace
          key={`${rollWorkspace.scope.academicYearId}:${rollWorkspace.scope.standardId}:${rollWorkspace.scope.divisionId}:${rollWorkspace.batchId ?? 'auto'}`}
          scope={rollWorkspace.scope}
          presentation="quick"
          caseIds={rollWorkspace.caseIds}
          batchId={rollWorkspace.batchId}
          operation={rollWorkspace.batchId ? undefined : 'assign-missing'}
          onClose={() => setRollWorkspace(null)}
          onApplied={assignment.applyRollBatchRows}
          onInteractionChange={setLockInteraction}
        />
      )}
    </Stack>
  );
}
