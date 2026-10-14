'use client';

import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material';
import type { IParams } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import {
  readAcademicFilterIds,
  academicClassFilterInput,
} from 'src/utils/student-academic-filter-query';
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
import { useStudentSetupAssignment } from './use-student-setup-assignment';
import StudentSetupAssignmentToolbar from './student-setup-assignment-toolbar';
import StudentIdentifierLockControls from './student-identifier-lock-controls';
import StudentOnboardingOperationDialog from './student-onboarding-operation-dialog';
import StudentSetupAutoAssignmentDialog from './student-setup-auto-assignment-dialog';
import { mapOnboardingCaseToItem, type StudentOnboardingItem } from './student-onboarding-model';
import { studentSetupSortFields, studentSetupStatusOptions } from './student-setup-worklist-config';
import {
  studentSetupTaskHref,
  type StudentSetupView,
  parseStudentSetupView,
  type StudentSetupTaskScope,
  parseStudentSetupTaskScope,
} from './student-setup-view';

import type { StudentAssignmentType } from './student-onboarding-operation-dialog';

const studentSetupTooltip = (
  <Box sx={{ p: 1.5, maxWidth: 340 }}>
    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
      Onboarding worklist
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
      Review each admitted student&apos;s placement, identifiers, documents, accounts, and
      activation readiness in one workspace.
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
        Open a student to resolve blockers and review activation readiness.
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
    title: 'App credentials',
    pendingEmptyText:
      'No students have pending app access or credential emails. Switch to All students to review app access.',
  },
  'gr-number': {
    title: 'GR number assignment',
    pendingEmptyText:
      'No students are waiting for a GR number. Switch to All students to review existing GR numbers.',
  },
  'roll-number': {
    title: 'Roll number assignment',
    pendingEmptyText:
      'No students are waiting for a Roll number. Switch to All students to review existing Roll numbers.',
  },
  division: {
    title: 'Division assignment',
    pendingEmptyText:
      'No students are without a division. Switch to All students to review existing placements.',
  },
};

export default function StudentSetupScreen() {
  const [drawerTaskView, setDrawerTaskView] = useState<StudentSetupView | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManageOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const canCancelOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.Delete');
  const { settings } = useOnboardingSettings();
  const activeView = parseStudentSetupView(searchParams.get('view'));
  const activeTaskScope = parseStudentSetupTaskScope(searchParams.get('scope'), activeView);
  const focusedCaseId = searchParams.get('case');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(focusedCaseId);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [autoAssignment, setAutoAssignment] = useState<{
    type: StudentAssignmentType;
    students: StudentOnboardingItem[];
  } | null>(null);
  const [lockInteraction, setLockInteraction] = useState(false);
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
        ({ label }) => label === latest('statusLabel')?.value
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
      academicYearId: currentYear?.id || '',
      boardId: selectedBoardId || undefined,
      mediumId: selectedMediumId || undefined,
      ...academicClassFilterInput(selectedStandardId),
      ...(readAcademicFilterIds(selectedDivisionId).length > 1
        ? { divisionIds: readAcademicFilterIds(selectedDivisionId) }
        : { divisionId: readAcademicFilterIds(selectedDivisionId)[0] }),
      placementDivisionId: placementFilterApplicable ? placementDivisionId || undefined : undefined,
      status: selectedStatusOption?.status,
      pendingTask:
        activeView !== 'readiness' && activeTaskScope === 'pending' ? activeView : undefined,
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
      currentYear?.id,
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
    skip: !currentYear?.id || !selectedBoardId || !selectedMediumId,
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
        !currentYear?.id ||
        !selectedBoardId ||
        !selectedMediumId ||
        activeView === 'readiness' ||
        activeTaskScope === 'pending',
    }
  );
  const filterOptionsQuery = useGetStudentOnboardingFilterOptionsQuery(currentYear?.id ?? '', {
    skip: !currentYear?.id,
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
            label: activeView === 'division' ? 'Current placement' : 'Placement',
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
            value: selectedStatusOption.label,
            valueType: 'enum',
            label: 'Status',
            displayValue: selectedStatusOption.label,
          },
        ]
      : []),
  ];
  useEffect(() => {
    const options = filterOptionsQuery.currentData;
    if (!options) return;
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
  const sourceRows = liveRows;
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
      currentYear?.id ?? '',
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
  const interactionBusy = assignment.busy || lockInteraction;
  const { requestNavigation, confirmation } = useUnsavedNavigation(assignment.form.dirty, {
    blockNavigation: interactionBusy || Boolean(autoAssignment),
    push: (href) => {
      assignment.cancel();
      router.push(href);
    },
  });
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
  const manualTargets = assignment.eligible('manual', assignmentTargets);
  const pendingCount =
    activeTaskScope === 'pending'
      ? (onboardingQuery.currentData?.totalCount ?? 0)
      : (pendingCountQuery.currentData?.totalCount ?? 0);
  const selectedRow = sourceRows.find((student) => student.id === selectedStudentId);
  const focusedCaseQuery = useGetStudentOnboardingCaseQuery(focusedCaseId ?? '', {
    skip: !focusedCaseId || Boolean(sourceRows.find((student) => student.id === focusedCaseId)),
  });
  const selectedStudent =
    selectedRow ||
    (focusedCaseQuery.currentData &&
    focusedCaseQuery.currentData.id === focusedCaseId &&
    focusedCaseId === selectedStudentId
      ? mapOnboardingCaseToItem(focusedCaseQuery.currentData)
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
    setSelectedStudentId((current) =>
      current && (current === focusedCaseId || sourceRows.some((student) => student.id === current))
        ? current
        : null
    );
  }, [sourceRows, focusedCaseId]);

  useEffect(() => {
    setSelectedStudentIds([]);
    setSelectedStudentId(focusedCaseId);
  }, [activeTaskScope, activeView, focusedCaseId]);

  const getViewHref = (view: StudentSetupView) => {
    const next = new URLSearchParams(searchParams.toString());
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
    action: 'refresh' | 'activate' = 'refresh'
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
        }).unwrap();
        shikshaMitraToast.success({
          message: `${student.studentName} is active and available in Student Records. Complete Credentials if app access is pending.`,
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
    } catch {
      shikshaMitraToast.error({
        message:
          action === 'activate' || student.backendStatus === 2
            ? 'Student activation could not be completed. Refresh the case and resolve any new blockers.'
            : 'Readiness could not be refreshed. Please retry with the latest case data.',
      });
    }
  };

  return (
    <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, height: { xs: 'auto', md: '100%' } }}>
      <CustomBreadcrumbs
        heading="Student Setup"
        description=" "
        tooltipProps={{ title: studentSetupTooltip, sx: { textAlign: 'left' } } as TooltipProps}
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Onboarding' },
          { name: 'Student Setup' },
        ]}
      />

      <StudentSetupTaskNavigation activeView={activeView} getViewHref={getViewHref} />
      {focusedCaseId && !selectedRow && focusedCaseQuery.isFetching && (
        <LinearProgress aria-label="Loading selected onboarding student" />
      )}
      {focusedCaseId && !selectedRow && focusedCaseQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => focusedCaseQuery.refetch()}>
              Retry
            </Button>
          }
        >
          The selected onboarding case could not be loaded.
        </Alert>
      )}
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
        <StudentSetupFilters
          options={filterOptionsQuery.currentData}
          isLoading={filterOptionsQuery.isFetching}
          disabled={!currentYear?.id || filterOptionsQuery.isError || interactionBusy}
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
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => filterOptionsQuery.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load academic filter options.
          </Alert>
        )}

        {!currentYear?.id && showFilterAlert ? (
          <Alert severity="info" onClose={() => setShowFilterAlert(false)}>
            Select an academic year to load onboarding cases.
          </Alert>
        ) : null}
        {assignment.contextChanged && (
          <Alert
            severity="warning"
            action={
              <Button size="small" disabled={interactionBusy} onClick={() => navigate(() => {})}>
                Cancel editing
              </Button>
            }
          >
            The academic scope or task changed. Your previous edits are kept for review, but cannot
            be saved here. Cancel editing to load the current worklist.
          </Alert>
        )}

        <Box sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex' }}>
          <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, flex: 1 }}>
            {activeView !== 'readiness' && (
              <StudentSetupAssignmentToolbar
                view={activeView}
                title={assignmentViewMeta[activeView].title}
                scope={activeTaskScope}
                pendingCount={pendingCount}
                onScopeChange={(scope) =>
                  navigate(() => {
                    setTablePage(1);
                    setSelectedStudentIds([]);
                    router.replace(getScopeHref(scope), { scroll: false });
                  })
                }
                busy={interactionBusy}
                unavailable={
                  onboardingQuery.isFetching ||
                  onboardingQuery.isError ||
                  !onboardingQuery.currentData
                }
                automaticCount={
                  activeView === 'division' && !showDivisionSelection ? 0 : automaticTargets.length
                }
                manualCount={manualTargets.length}
                manualEditing={assignment.manualEditing}
                changedCount={
                  assignment.contextChanged || !canManageOnboarding ? 0 : assignment.changedCount
                }
                onAuto={() => {
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
                    <StudentIdentifierLockControls
                      academicYearId={currentYear?.id}
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
                        assignment.manualEditing || assignment.busy || onboardingQuery.isFetching
                      }
                      onInteractionChange={setLockInteraction}
                    />
                  ) : undefined
                }
              />
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
                  ? 'Onboarding readiness'
                  : assignmentViewMeta[activeView].title
              }
              noDataText={
                !currentYear?.id
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
                currentYear?.id && !hasWorklistFilters && activeView === 'readiness'
                  ? 'Students appear here after an admission is accepted.'
                  : undefined
              }
              onClearWorklistFilters={
                hasWorklistFilters && currentYear?.id ? clearWorklistFilters : undefined
              }
              onOpen={(id) =>
                navigate(() => {
                  setDrawerTaskView(null);
                  setSelectedStudentId(id);
                })
              }
              onOpenTask={(id, view) =>
                navigate(() => {
                  setDrawerTaskView(null);
                  setSelectedStudentId(id);
                  router.replace(
                    studentSetupTaskHref(pathname, searchParams.toString(), id, view),
                    {
                      scroll: false,
                    }
                  );
                })
              }
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

      <StudentSetupDrawer
        taskView={drawerTaskView ?? activeView}
        open={Boolean(selectedStudent)}
        student={selectedStudent}
        onClose={() => {
          setSelectedStudentId(null);
          const next = new URLSearchParams(searchParams.toString());
          next.delete('case');
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }}
        onAssignDivision={() => selectedStudent && openAssignment('division', [selectedStudent.id])}
        onAssignGrNumber={() =>
          selectedStudent && openAssignment('gr-number', [selectedStudent.id])
        }
        onAssignRollNumber={() =>
          selectedStudent && openAssignment('roll-number', [selectedStudent.id])
        }
        onPrimaryAction={runPrimaryCaseAction}
        primaryActionLoading={refreshReadinessState.isLoading || activateOnboardingState.isLoading}
        canManage={canManageOnboarding}
        canCancel={canCancelOnboarding}
      />
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
    </Stack>
  );
}
