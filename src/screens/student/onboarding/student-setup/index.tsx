'use client';

import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material';
import type { IData, IParams, IColumn } from 'src/components/customizabaleTable/types';
import type { StudentOnboardingStatus } from 'src/redux/student/onboarding/student-onboarding-types';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  readAcademicFilterIds,
  academicClassFilterInput,
} from 'src/utils/student-academic-filter-query';
import {
  Box,
  Menu,
  Alert,
  Paper,
  Stack,
  Avatar,
  Button,
  Switch,
  Tooltip,
  Divider,
  Checkbox,
  MenuItem,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingCasesQuery,
  useActivateStudentOnboardingMutation,
  useGetStudentOnboardingFilterOptionsQuery,
  useRefreshStudentOnboardingReadinessMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import StudentSetupDrawer from './student-setup-drawer';
import StudentPendingTasks from './student-pending-tasks';
import { StudentSetupFilters } from './student-setup-academic-filters';
import { useOnboardingSettings } from '../onboarding-settings-context';
import StudentSetupTaskNavigation from './student-setup-task-navigation';
import StudentIdentifierLockControls from './student-identifier-lock-controls';
import StudentOnboardingOperationDialog from './student-onboarding-operation-dialog';
import OnboardingBulkActionDialog, {
  type BulkOnboardingAction,
} from './onboarding-bulk-action-dialog';
import {
  accountStatusMeta,
  getReadinessSummary,
  onboardingStageMeta,
  mapOnboardingCaseToItem,
  type StudentOnboardingItem,
} from './student-onboarding-model';
import {
  hasAssignedDivision,
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

const studentSetupStatusOptions: Array<{ status: StudentOnboardingStatus; label: string }> = [
  { status: 0, label: onboardingStageMeta['to-prepare'].label },
  { status: 1, label: onboardingStageMeta['awaiting-approval'].label },
  { status: 2, label: onboardingStageMeta['ready-to-activate'].label },
  { status: 3, label: onboardingStageMeta['action-required'].label },
  { status: 4, label: onboardingStageMeta.completed.label },
  { status: 5, label: onboardingStageMeta.cancelled.label },
  { status: 6, label: onboardingStageMeta.provisioning.label },
];

const studentSetupSortFields: Record<string, string> = {
  studentName: 'StudentName',
  placement: 'Placement',
  divisionTask: 'Placement',
  rollNumberTask: 'RollNumber',
  ownerName: 'OwnerName',
  statusLabel: 'Status',
};

const textFilterOperators = ['contains', 'equals', 'startsWith', 'endsWith'] as const;
const numberFilterOperators = ['equals', 'greaterThan', 'lessThan', 'between'] as const;

function getTextFilterOperator(value: string | null) {
  return textFilterOperators.find((operator) => operator === value) ?? 'contains';
}

function getNumberFilterOperator(value: string | null) {
  return numberFilterOperators.find((operator) => operator === value) ?? 'equals';
}

function StudentSetupTable({
  rows,
  isLoading,
  isError,
  onRetry,
  view,
  taskScope,
  tableId,
  tableTitle,
  noDataText,
  noDataDescription,
  onClearWorklistFilters,
  onOpen,
  onOpenTask,
  selectedStudentIds,
  onToggleSelection,
  allStudentsSelected,
  someStudentsSelected,
  onToggleAll,
  totalCount,
  page,
  rowsPerPage,
  searchTerm,
  onPaginationChange,
  onSearchChange,
  columnFilters,
  onColumnFilterChange,
  sorts,
  onSortChange,
  placementOptions,
  isServerBacked,
}: {
  rows: StudentOnboardingItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  view: StudentSetupView;
  taskScope: StudentSetupTaskScope;
  tableId: string;
  tableTitle: string;
  noDataText: string;
  noDataDescription?: string;
  onClearWorklistFilters?: () => void;
  onOpen: (studentId: string) => void;
  onOpenTask: (studentId: string, view: StudentSetupView) => void;
  selectedStudentIds: string[];
  onToggleSelection: (studentId: string) => void;
  allStudentsSelected: boolean;
  someStudentsSelected: boolean;
  onToggleAll: () => void;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  onPaginationChange: (page: number, rowsPerPage: number) => void;
  onSearchChange: (searchTerm: string) => void;
  columnFilters: IParams['filters'];
  onColumnFilterChange: (filters: IParams['filters']) => void;
  sorts: IParams['sorts'];
  onSortChange: (sorts: IParams['sorts']) => void;
  placementOptions: Array<{ label: string; value: string }>;
  isServerBacked: boolean;
}) {
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepPendingOpen = useCallback((id: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredStudentId(id);
  }, []);
  const closePending = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoveredStudentId(null), 200);
  }, []);
  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    },
    []
  );
  const tableData = useMemo(
    () =>
      rows.map((student) => {
        const readiness = getReadinessSummary(student);
        return {
          ...student,
          placement: `${student.standardName} / ${student.divisionName}`,
          identifiers: `GR ${student.grNo ?? student.grPreview ?? 'Pending'} · Roll ${student.rollNo ?? 'Pending'}`,
          grNumberTask: student.grNo ?? student.grPreview ?? 'Not assigned',
          rollNumberTask: student.rollNo ?? 'Not assigned',
          divisionTask: `${student.standardName} / ${student.divisionName}`,
          readinessProgress: readiness.progress,
          readinessText: `${readiness.passedCount}/${readiness.requiredCount} checks`,
          blockerCount: readiness.blockingCount,
          accounts: `Student: ${accountStatusMeta[student.studentAccountStatus].label} · Guardian: ${accountStatusMeta[student.guardianAccountStatus].label}`,
          statusLabel: onboardingStageMeta[student.status].label,
        };
      }),
    [rows]
  );

  const columns = useMemo<IColumn[]>(() => {
    const allColumns: IColumn[] = [
      {
        id: 'selection',
        label: '',
        width: 48,
        sticky: true,
        stickyPosition: 'left',
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
        renderColumn: () => (
          <Checkbox
            checked={allStudentsSelected}
            indeterminate={someStudentsSelected}
            disabled={rows.length === 0}
            onChange={onToggleAll}
            inputProps={{ 'aria-label': 'Select all visible students' }}
          />
        ),
        render: (_value, row) => (
          <Checkbox
            checked={selectedStudentIds.includes(String(row.id))}
            onChange={() => onToggleSelection(String(row.id))}
            inputProps={{ 'aria-label': `Select ${String(row.studentName)}` }}
          />
        ),
      },
      {
        id: 'studentName',
        label: 'Student',
        filterType: 'string',
        minWidth: 230,
        sticky: true,
        stickyPosition: 'left',
        render: (value, row) => (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, py: 0.25 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.lighter',
                color: 'primary.dark',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {String(value)
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
            </Avatar>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {row.applicationNumber}
              </Typography>
            </Stack>
          </Stack>
        ),
      },
      {
        id: 'admissionRoute',
        label: 'Admission route',
        minWidth: 160,
        cellSx: { whiteSpace: 'normal' },
      },
      {
        id: 'placement',
        label: 'Placement',
        minWidth: 160,
        filterType: 'enum',
        enumOptions: placementOptions,
        cellSx: { whiteSpace: 'normal' },
      },
      {
        id: 'readinessProgress',
        label: 'Readiness',
        minWidth: 170,
        render: (value, row) => (
          <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography variant="caption" color="text.secondary">
                {row.readinessText}
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {value}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Number(value)}
              color={row.blockerCount ? 'warning' : 'success'}
              aria-label={`${String(row.studentName)} readiness ${String(value)} percent`}
              sx={{ height: 5, borderRadius: 1 }}
            />
            <StudentPendingTasks
              student={rows.find((student) => student.id === row.id)!}
              hovered={hoveredStudentId === row.id}
              onKeepOpen={() => keepPendingOpen(String(row.id))}
              onLeave={closePending}
              onOpenTask={(nextView) => onOpenTask(String(row.id), nextView)}
            />
          </Stack>
        ),
      },
      {
        id: 'identifiers',
        label: 'Identifiers',
        minWidth: 190,
        isFilter: false,
        render: (_value, row) => {
          const grText =
            row.grNo !== undefined && row.grNo !== null
              ? `GR: ${row.grNo}`
              : row.grPreview
                ? `GR: ${row.grPreview} (preview)`
                : 'GR: Pending';

          const rollText =
            row.rollNo !== undefined && row.rollNo !== null
              ? `Roll: ${row.rollNo}`
              : 'Roll: Pending';

          return (
            <Stack spacing={0.5} alignItems="flex-start">
              <Label
                variant="soft"
                color="default"
                sx={{
                  px: 0.75,
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 0.75,
                }}
              >
                {grText}
              </Label>
              <Label
                variant="soft"
                color="default"
                sx={{
                  px: 0.75,
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 0.75,
                }}
              >
                {rollText}
              </Label>
            </Stack>
          );
        },
      },
      {
        id: 'feesTask',
        label: 'Fee structure',
        minWidth: 170,
        render: (_value, row) => (
          <Label color={row.feeStructureConfirmed ? 'success' : 'warning'}>
            {row.feeStructureConfirmed ? 'Confirmed' : 'Pending'}
          </Label>
        ),
      },
      {
        id: 'grNumberTask',
        label: 'GR number',
        minWidth: 180,
        isFilter: false,
        render: (_value, row) => {
          const hasCommittedValue = row.grNo !== undefined && row.grNo !== null;
          const value = hasCommittedValue ? row.grNo : row.grPreview;

          return (
            <Stack spacing={0.5} alignItems="flex-start">
              <Typography variant="body2" fontWeight={hasCommittedValue ? 700 : 500}>
                {value ?? 'Not assigned'}
              </Typography>
              <Label
                variant="soft"
                color={hasCommittedValue ? 'success' : row.grPreview ? 'info' : 'warning'}
              >
                {hasCommittedValue
                  ? row.grNumberLocked
                    ? 'Locked'
                    : 'Assigned'
                  : row.grPreview
                    ? 'Preview only'
                    : 'Pending'}
              </Label>
            </Stack>
          );
        },
      },
      {
        id: 'rollNumberTask',
        label: 'Roll number',
        minWidth: 150,
        filterType: 'number',
        render: (_value, row) => {
          const hasCommittedValue = row.rollNo !== undefined && row.rollNo !== null;

          return (
            <Stack spacing={0.5} alignItems="flex-start">
              <Typography variant="body2" fontWeight={hasCommittedValue ? 700 : 500}>
                {hasCommittedValue ? row.rollNo : 'Not assigned'}
              </Typography>
              <Label variant="soft" color={hasCommittedValue ? 'success' : 'warning'}>
                {hasCommittedValue ? (row.rollNumberLocked ? 'Locked' : 'Assigned') : 'Pending'}
              </Label>
            </Stack>
          );
        },
      },
      {
        id: 'divisionTask',
        label: 'Current placement',
        minWidth: 180,
        filterType: 'enum',
        enumOptions: placementOptions,
        render: (_value, row) => {
          const divisionAssigned = hasAssignedDivision(row as StudentOnboardingItem);

          return (
            <Stack spacing={0.5} alignItems="flex-start">
              <Typography variant="body2" fontWeight={600}>
                {row.standardName} / {row.divisionName || '—'}
              </Typography>
              <Label variant="soft" color={divisionAssigned ? 'default' : 'warning'}>
                {divisionAssigned ? 'Placed' : 'Unassigned'}
              </Label>
            </Stack>
          );
        },
      },
      {
        id: 'accounts',
        label: 'Account access',
        minWidth: 210,
        render: (_value, row) => (
          <Stack spacing={0.5} alignItems="flex-start">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 54 }}>
                Student
              </Typography>
              <Label
                variant="soft"
                color={
                  accountStatusMeta[
                    row.studentAccountStatus as StudentOnboardingItem['studentAccountStatus']
                  ].color
                }
              >
                {
                  accountStatusMeta[
                    row.studentAccountStatus as StudentOnboardingItem['studentAccountStatus']
                  ].label
                }
              </Label>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 54 }}>
                Guardian
              </Typography>
              <Label
                variant="soft"
                color={
                  accountStatusMeta[
                    row.guardianAccountStatus as StudentOnboardingItem['guardianAccountStatus']
                  ].color
                }
              >
                {
                  accountStatusMeta[
                    row.guardianAccountStatus as StudentOnboardingItem['guardianAccountStatus']
                  ].label
                }
              </Label>
            </Stack>
          </Stack>
        ),
      },
      {
        id: 'ownerName',
        label: 'Owner',
        minWidth: 150,
        filterType: 'string',
        render: (value: string) =>
          value === 'Not assigned' ? (
            <Label variant="soft" color="default">
              Not assigned
            </Label>
          ) : (
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {value}
            </Typography>
          ),
      },
      {
        id: 'statusLabel',
        label: 'Status',
        width: 156,
        minWidth: 156,
        filterType: 'enum',
        enumOptions: studentSetupStatusOptions.map(({ label }) => ({ label, value: label })),
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row) => (
          <Label
            variant="soft"
            color={onboardingStageMeta[row.status as StudentOnboardingItem['status']].color}
          >
            {onboardingStageMeta[row.status as StudentOnboardingItem['status']].label}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        width: 88,
        minWidth: 88,
        align: 'right',
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row: IData) => (
          <Tooltip title={`Review ${String(row.studentName)}`}>
            <IconButton
              aria-label={`Review ${String(row.studentName)}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(String(row.id));
              }}
              sx={{ color: 'text.secondary' }}
            >
              <Iconify icon="mdi:eye-outline" width={20} />
            </IconButton>
          </Tooltip>
        ),
      },
    ];

    const visibleColumns: Record<StudentSetupView, string[]> = {
      readiness: [
        'selection',
        'studentName',
        'admissionRoute',
        'placement',
        'readinessProgress',
        'identifiers',
        'accounts',
        'ownerName',
        'statusLabel',
        'actions',
      ],
      'gr-number': [
        'selection',
        'studentName',
        'placement',
        'grNumberTask',
        'ownerName',
        'statusLabel',
        'actions',
      ],
      'roll-number': [
        'selection',
        'studentName',
        'placement',
        'rollNumberTask',
        'ownerName',
        'statusLabel',
        'actions',
      ],
      division: [
        'selection',
        'studentName',
        'divisionTask',
        'rollNumberTask',
        'ownerName',
        'statusLabel',
        'actions',
      ],
      fees: [
        'selection',
        'studentName',
        'placement',
        'feesTask',
        'ownerName',
        'statusLabel',
        'actions',
      ],
      credentials: [
        'selection',
        'studentName',
        'placement',
        'accounts',
        'ownerName',
        'statusLabel',
        'actions',
      ],
    };

    const filterableColumns = new Set(['studentName', 'ownerName', 'statusLabel']);
    if (taskScope === 'all') filterableColumns.add('rollNumberTask');
    if (placementOptions.length > 0 && (view !== 'division' || taskScope === 'all')) {
      filterableColumns.add('placement');
      filterableColumns.add('divisionTask');
    }

    return allColumns
      .filter((column) => visibleColumns[view].includes(column.id))
      .map((column) => ({
        ...column,
        isSort:
          column.id in studentSetupSortFields &&
          (taskScope === 'all' || (column.id !== 'rollNumberTask' && column.id !== 'divisionTask')),
        isFilter: filterableColumns.has(column.id),
      }));
  }, [
    allStudentsSelected,
    onOpen,
    onOpenTask,
    hoveredStudentId,
    keepPendingOpen,
    closePending,
    onToggleAll,
    onToggleSelection,
    placementOptions,
    rows,
    selectedStudentIds,
    someStudentsSelected,
    taskScope,
    view,
  ]);

  return (
    <CustomizableTable
      rowProps={
        view === 'readiness'
          ? (row) => ({
              onMouseEnter: () => keepPendingOpen(String(row.id)),
              onMouseLeave: closePending,
            })
          : undefined
      }
      tableId={tableId}
      tableTitle={tableTitle}
      exportLabel="Export current page"
      columns={columns}
      data={tableData}
      isLoading={isLoading}
      isFilter
      isSearch
      serverSide={isServerBacked}
      serverSidePagination={isServerBacked}
      serverSideSearch={isServerBacked}
      serverSideFilter={isServerBacked}
      serverSideSort={isServerBacked}
      serverSideSortMode="single"
      filters={columnFilters}
      onServerFilter={onColumnFilterChange}
      sorts={sorts}
      onServerSort={(_column, nextSorts) => onSortChange(nextSorts)}
      totalCount={totalCount}
      page={page - 1}
      rowsPerPage={rowsPerPage}
      searchTerm={searchTerm}
      rowsPerPageOptions={[10, 25, 100]}
      onServerPagination={onPaginationChange}
      onServerSearch={onSearchChange}
      noDataText={
        <Stack component="span" alignItems="center" spacing={1}>
          <Box component="span">{noDataText}</Box>
          {noDataDescription && (
            <Typography component="span" variant="caption" color="text.secondary">
              {noDataDescription}
            </Typography>
          )}
          {onClearWorklistFilters && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onClearWorklistFilters}
            >
              Clear filters
            </Button>
          )}
        </Stack>
      }
      errorContent={
        isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={onRetry}>
                Retry
              </Button>
            }
          >
            Onboarding cases could not be loaded.
          </Alert>
        ) : undefined
      }
      searchFieldProps={{ placeholder: 'Search...' }}
      wrapperProps={{ sx: { minWidth: 0, minHeight: 0, flex: 1 } }}
      tableContainerProps={{ sx: { minWidth: 0, minHeight: 0, height: 1 } }}
    />
  );
}

type StudentSetupAssignmentView = Exclude<StudentSetupView, 'readiness'>;

const assignmentViewMeta: Record<
  StudentSetupAssignmentView,
  {
    title: string;
    description: string;
    icon: string;
    actionLabel: string;
    pendingScopeLabel: string;
    allScopeLabel: string;
    pendingEmptyText: string;
  }
> = {
  fees: {
    title: 'Fee structure confirmation',
    description: 'Confirm the published fee structure for each student.',
    icon: 'mdi:receipt-text-outline',
    actionLabel: 'Confirm Fees',
    pendingScopeLabel: 'Remaining',
    allScopeLabel: 'All students',
    pendingEmptyText:
      'No students are waiting for fee structure confirmation. Switch to All students to review confirmed fee structures.',
  },
  credentials: {
    title: 'App credentials',
    description: 'Prepare app access and send login details after activation.',
    icon: 'mdi:account-key-outline',
    actionLabel: 'Manage Credentials',
    pendingScopeLabel: 'Remaining',
    allScopeLabel: 'All students',
    pendingEmptyText:
      'No students have pending app access or credential emails. Switch to All students to review app access.',
  },
  'gr-number': {
    title: 'GR number assignment',
    description:
      'Assign committed GR numbers to remaining students, or open all students for an authorized change.',
    icon: 'mdi:identifier',
    actionLabel: 'Assign GR No.',
    pendingScopeLabel: 'Remaining',
    allScopeLabel: 'All students',
    pendingEmptyText:
      'No students are waiting for a GR number. Switch to All students to review existing GR numbers.',
  },
  'roll-number': {
    title: 'Roll number assignment',
    description: 'Assign Roll numbers starting at 1 within each Class and Division.',
    icon: 'mdi:format-list-numbered',
    actionLabel: 'Assign Roll No.',
    pendingScopeLabel: 'Remaining',
    allScopeLabel: 'All students',
    pendingEmptyText:
      'No students are waiting for a Roll number. Switch to All students to review existing Roll numbers.',
  },
  division: {
    title: 'Division assignment',
    description:
      'Place students without a division or select existing placements that need an authorized change.',
    icon: 'mdi:google-classroom',
    actionLabel: 'Assign / Change Division',
    pendingScopeLabel: 'Unassigned',
    allScopeLabel: 'All students',
    pendingEmptyText:
      'No students are without a division. Switch to All students to review existing placements.',
  },
};

const assignmentModeLabel = (mode: 'automatic' | 'manual' | 'both') => {
  if (mode === 'both') return 'Automatic + manual';
  return mode === 'automatic' ? 'Automatic only' : 'Manual only';
};

function StudentSetupAssignmentBar({
  view,
  scope,
  scopeHref,
  pendingCount,
  visibleCount,
  selectedCount,
  assignmentMode,
  onSelectAll,
  onAssign,
  onClear,
}: {
  view: StudentSetupAssignmentView;
  scope: StudentSetupTaskScope;
  scopeHref: (scope: StudentSetupTaskScope) => string;
  pendingCount: number;
  visibleCount: number;
  selectedCount: number;
  assignmentMode?: 'automatic' | 'manual' | 'both';
  onSelectAll: () => void;
  onAssign: () => void;
  onClear: () => void;
}) {
  const meta = assignmentViewMeta[view];

  return (
    <Paper variant="outlined" sx={{ p: 1.25, flexShrink: 0 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} spacing={1.25}>
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'action.hover',
              color: 'text.primary',
              flexShrink: 0,
            }}
          >
            <Iconify icon={meta.icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <Typography variant="subtitle2">{meta.title}</Typography>
              <Label variant="soft" color={pendingCount ? 'warning' : 'success'}>
                {pendingCount} pending
              </Label>
              {view === 'gr-number' && assignmentMode && (
                <Label variant="soft" color="default">
                  {assignmentModeLabel(assignmentMode)}
                </Label>
              )}
              {view === 'roll-number' && (
                <Label variant="soft" color="default">
                  Uses student numbering rules
                </Label>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {meta.description}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          <Button
            component={Link}
            href={scopeHref('pending')}
            prefetch={false}
            size="small"
            variant={scope === 'pending' ? 'contained' : 'outlined'}
            color={scope === 'pending' ? 'primary' : 'inherit'}
          >
            {meta.pendingScopeLabel} ({pendingCount})
          </Button>
          <Button
            component={Link}
            href={scopeHref('all')}
            prefetch={false}
            size="small"
            variant={scope === 'all' ? 'contained' : 'outlined'}
            color={scope === 'all' ? 'primary' : 'inherit'}
          >
            {meta.allScopeLabel}
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
          <Button size="small" variant="outlined" onClick={onSelectAll} disabled={!visibleCount}>
            Select all visible ({visibleCount})
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={meta.icon} width={17} />}
            onClick={onAssign}
            disabled={!selectedCount}
          >
            {meta.actionLabel}
            {selectedCount ? ` (${selectedCount})` : ''}
          </Button>
          {selectedCount ? (
            <Button size="small" color="inherit" onClick={onClear}>
              Clear
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}

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
  const [bulkAction, setBulkAction] = useState<BulkOnboardingAction | null>(null);
  const [bulkActionStudents, setBulkActionStudents] = useState<StudentOnboardingItem[]>([]);
  const [assignmentRequest, setAssignmentRequest] = useState<{
    type: StudentAssignmentType;
    studentIds: string[];
  } | null>(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState<HTMLElement | null>(null);
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
    (key: 'board' | 'medium' | 'class' | 'division', value: string) => {
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
    },
    [
      pathname,
      router,
      searchParams,
      selectedStandardId,
      selectedDivisionId,
      setSelectedStandardId,
      setSelectedDivisionId,
    ]
  );

  const clearWorklistFilters = () => {
    setSelectedStandardId(ALL_STANDARDS);
    setSelectedDivisionId(ALL_STANDARDS);
    const next = new URLSearchParams(searchParams.toString());
    ['class', 'division', 'placementDivision'].forEach((key) => next.delete(key));
    setTablePage(1);
    setSelectedStudentIds([]);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleColumnFilterChange = (filters: IParams['filters']) => {
    const latest = (column: string) => filters.filter((filter) => filter.column === column).at(-1);
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
  };

  const handleSortChange = (nextSorts: IParams['sorts']) => {
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
  };

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
  const displayedRows = sourceRows;
  const pendingCount =
    activeTaskScope === 'pending'
      ? (onboardingQuery.currentData?.totalCount ?? 0)
      : (pendingCountQuery.currentData?.totalCount ?? 0);
  const selectedStudents = useMemo(
    () => sourceRows.filter((student) => selectedStudentIds.includes(student.id)),
    [selectedStudentIds, sourceRows]
  );
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
    displayedRows.length > 0 &&
    displayedRows.every((student) => selectedStudentIds.includes(student.id));
  const someStudentsSelected =
    displayedRows.some((student) => selectedStudentIds.includes(student.id)) &&
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

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const toggleAll = () => {
    const visibleIds = displayedRows.map((student) => student.id);
    setSelectedStudentIds((current) =>
      allStudentsSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  };

  const selectAllVisible = () => {
    const visibleIds = displayedRows.map((student) => student.id);
    setSelectedStudentIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

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

  const openBulkWorkflowAction = (action: BulkOnboardingAction) => {
    setMoreActionsAnchor(null);
    setBulkActionStudents(selectedStudents);
    setBulkAction(action);
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
    <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
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
      {activeView === 'readiness' && (
        <FormControlLabel
          sx={{ px: 1, m: 0 }}
          control={
            <Switch
              size="small"
              checked={searchParams.get('today') === 'true'}
              onChange={(_event, checked) => {
                const next = new URLSearchParams(searchParams.toString());
                if (checked) next.set('today', 'true');
                else next.delete('today');
                setTablePage(1);
                router.replace(`${pathname}?${next.toString()}`, { scroll: false });
              }}
            />
          }
          label="Entered onboarding today"
        />
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
          disabled={!currentYear?.id || filterOptionsQuery.isError}
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

        <Box sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex' }}>
          <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, flex: 1 }}>
            {(activeView === 'gr-number' || activeView === 'roll-number') && (
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
              />
            )}
            {activeView !== 'readiness' ? (
              <StudentSetupAssignmentBar
                view={activeView}
                scope={activeTaskScope}
                scopeHref={getScopeHref}
                pendingCount={pendingCount}
                visibleCount={displayedRows.length}
                selectedCount={selectedStudentIds.length}
                assignmentMode={
                  activeView === 'gr-number' ? settings.grNumber.assignmentMode : undefined
                }
                onSelectAll={selectAllVisible}
                onAssign={() => {
                  if (activeView === 'fees' || activeView === 'credentials') {
                    if (selectedStudentIds.length === 1)
                      setSelectedStudentId(selectedStudentIds[0]);
                    else
                      shikshaMitraToast.error({
                        message: 'Select one student to review this task.',
                      });
                  } else openAssignment(activeView, selectedStudentIds);
                }}
                onClear={() => setSelectedStudentIds([])}
              />
            ) : selectedStudentIds.length ? (
              <Paper variant="outlined" sx={{ px: 1.25, py: 1, flexShrink: 0 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ md: 'center' }}
                  spacing={1}
                  sx={{ flexWrap: { md: 'wrap' } }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
                    <Iconify
                      icon="mdi:checkbox-marked-circle-outline"
                      width={20}
                      color="primary.main"
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {selectedStudentIds.length} student(s) selected
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:google-classroom" width={17} />}
                    onClick={() => openAssignment('division', selectedStudentIds)}
                    disabled={!canManageOnboarding}
                  >
                    Assign Division
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:identifier" width={17} />}
                    onClick={() => openAssignment('gr-number', selectedStudentIds)}
                    disabled={!canManageOnboarding}
                  >
                    Assign GR No.
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:format-list-numbered" width={17} />}
                    onClick={() => openAssignment('roll-number', selectedStudentIds)}
                    disabled={!canManageOnboarding}
                  >
                    Assign Roll No.
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    endIcon={<Iconify icon="mdi:chevron-down" width={17} />}
                    onClick={(event) => setMoreActionsAnchor(event.currentTarget)}
                    aria-controls={
                      moreActionsAnchor ? 'student-onboarding-bulk-more-menu' : undefined
                    }
                    aria-haspopup="menu"
                    aria-expanded={Boolean(moreActionsAnchor)}
                  >
                    More
                  </Button>
                  <Button size="small" color="inherit" onClick={() => setSelectedStudentIds([])}>
                    Clear
                  </Button>
                </Stack>
                <Menu
                  id="student-onboarding-bulk-more-menu"
                  anchorEl={moreActionsAnchor}
                  open={Boolean(moreActionsAnchor)}
                  onClose={() => setMoreActionsAnchor(null)}
                  slotProps={{
                    paper: {
                      sx: {
                        '& .MuiListItemIcon-root': {
                          minWidth: 10,
                        },
                      },
                    },
                  }}
                >
                  <MenuItem
                    disabled={!canManageOnboarding}
                    onClick={() => openBulkWorkflowAction('review-readiness')}
                  >
                    <ListItemIcon sx={{ minWidth: 10 }}>
                      <Iconify icon="mdi:clipboard-check-outline" width={22} />
                    </ListItemIcon>
                    <ListItemText>Review readiness</ListItemText>
                  </MenuItem>
                  <MenuItem
                    disabled={!canManageOnboarding}
                    onClick={() => openBulkWorkflowAction('activate')}
                  >
                    <ListItemIcon sx={{ minWidth: 10 }}>
                      <Iconify icon="mdi:account-arrow-right-outline" width={22} />
                    </ListItemIcon>
                    <ListItemText>Activate ready students</ListItemText>
                  </MenuItem>
                </Menu>
              </Paper>
            ) : null}
            <StudentSetupTable
              rows={displayedRows}
              isLoading={onboardingQuery.isLoading}
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
              onOpen={(id) => {
                setDrawerTaskView(null);
                setSelectedStudentId(id);
              }}
              onOpenTask={(id, view) => {
                setDrawerTaskView(null);
                setSelectedStudentId(id);
                router.replace(studentSetupTaskHref(pathname, searchParams.toString(), id, view), {
                  scroll: false,
                });
              }}
              selectedStudentIds={selectedStudentIds}
              onToggleSelection={toggleStudent}
              allStudentsSelected={allStudentsSelected}
              someStudentsSelected={someStudentsSelected}
              onToggleAll={toggleAll}
              totalCount={onboardingQuery.currentData?.totalCount ?? 0}
              page={tablePage}
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              onPaginationChange={(page, nextRowsPerPage) => {
                setTablePage(page);
                setRowsPerPage(nextRowsPerPage);
              }}
              onSearchChange={(value) => {
                const next = new URLSearchParams(searchParams.toString());
                if (value.trim()) next.set('search', value.trim());
                else next.delete('search');
                setTablePage(1);
                const query = next.toString();
                router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
              }}
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
      <OnboardingBulkActionDialog
        action={bulkAction}
        students={bulkActionStudents}
        onClose={() => {
          setBulkAction(null);
          setBulkActionStudents([]);
        }}
      />
    </Stack>
  );
}
