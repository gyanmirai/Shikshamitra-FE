'use client';

import type { IData, IParams, IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Stack,
  Avatar,
  Button,
  Tooltip,
  Checkbox,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import StudentPendingTasks from './student-pending-tasks';
import StudentSetupDivisionEditor from './student-setup-division-editor';
import { getStudentPendingTasks, getStudentSetupSummary } from './student-setup-summary';
import { studentSetupSortFields, studentSetupStatusOptions } from './student-setup-worklist-config';
import {
  hasAssignedDivision,
  type StudentSetupView,
  type StudentSetupTaskScope,
} from './student-setup-view';
import {
  accountStatusMeta,
  onboardingStageMeta,
  type StudentOnboardingItem,
} from './student-onboarding-model';

export default function StudentSetupTable({
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
  onViewAllStudents,
  onOpen,
  onOpenTask,
  selectedStudentIds,
  onToggleSelection,
  allStudentsSelected,
  someStudentsSelected,
  onToggleAll,
  showSelection = false,
  manualEditing = false,
  editableIds = [],
  manualValues = {},
  manualErrors = {},
  manualBlockers = {},
  assignmentMessages = {},
  onManualChange,
  onManualBlur,
  assignmentBusy = false,
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
  onViewAllStudents?: () => void;
  onOpen: (studentId: string) => void;
  onOpenTask: (studentId: string, view: StudentSetupView) => void;
  selectedStudentIds: string[];
  onToggleSelection: (studentId: string) => void;
  allStudentsSelected: boolean;
  someStudentsSelected: boolean;
  onToggleAll: () => void;
  showSelection?: boolean;
  manualEditing?: boolean;
  editableIds?: string[];
  manualValues?: Record<string, string>;
  manualErrors?: Record<string, string | undefined>;
  manualBlockers?: Record<string, string>;
  assignmentMessages?: Record<string, { status: 'saved' | 'skipped' | 'failed'; message: string }>;
  onManualChange?: (id: string, value: string) => void;
  onManualBlur?: (id: string) => void;
  assignmentBusy?: boolean;
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
  const assignmentView = view === 'division' || view === 'gr-number' || view === 'roll-number';
  const tableData = useMemo(
    () =>
      rows.map((student) => {
        const setup = getStudentSetupSummary(student);
        const pendingTasks = getStudentPendingTasks(student);
        const assigned =
          view === 'division'
            ? hasAssignedDivision(student)
            : view === 'gr-number'
              ? student.grNo != null
              : student.rollNo != null;
        const baseline =
          view === 'division'
            ? student.divisionId
            : view === 'gr-number'
              ? student.grNo
              : student.rollNo;
        const changed =
          manualEditing &&
          editableIds.includes(student.id) &&
          String(manualValues[student.id] ?? '').trim() !== String(baseline ?? '');
        const locked =
          view === 'gr-number'
            ? student.grNumberLocked
            : view === 'roll-number' && student.rollNumberLocked;
        const hasError = Boolean(
          manualErrors[student.id] || assignmentMessages[student.id]?.status === 'failed'
        );
        return {
          ...student,
          assignmentStatus: hasError
            ? 'Needs attention'
            : changed
              ? 'Not saved'
              : assigned
                ? locked
                  ? 'Locked'
                  : 'Assigned'
                : view === 'gr-number' && student.grPreview
                  ? 'Preview only'
                  : 'Pending',
          assignmentStatusColor: hasError
            ? 'error'
            : changed
              ? 'warning'
              : assigned
                ? 'success'
                : 'warning',
          setup,
          pendingTasks,
          placement: `${student.standardName} / ${student.divisionName}`,
          identifiers: `GR ${student.grNo ?? student.grPreview ?? 'Pending'} · Roll ${student.rollNo ?? 0}`,
          grNumberTask: student.grNo ?? student.grPreview ?? 'Not assigned',
          rollNumberTask: student.rollNo ?? 0,
          divisionTask: `${student.standardName} / ${student.divisionName}`,
          pendingWork: pendingTasks.map((task) => task.label).join('; ') || setup.pendingText,
          accounts: `Student: ${accountStatusMeta[student.studentAccountStatus].label} · Parent / guardian: ${accountStatusMeta[student.guardianAccountStatus].label}`,
          statusLabel:
            view === 'readiness' ? setup.status.label : onboardingStageMeta[student.status].label,
        };
      }),
    [rows, view, manualEditing, editableIds, manualValues, manualErrors, assignmentMessages]
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
            disabled={
              assignmentBusy ||
              manualEditing ||
              !rows.some(
                (row) =>
                  row.source === 'onboarding-case' &&
                  !row.studentEnrollmentId &&
                  ![4, 5, 6].includes(row.backendStatus ?? -1) &&
                  !['completed', 'cancelled', 'provisioning'].includes(row.status)
              )
            }
            onChange={onToggleAll}
            inputProps={{ 'aria-label': 'Select all visible students' }}
          />
        ),
        render: (_value, row) => (
          <Checkbox
            checked={selectedStudentIds.includes(String(row.id))}
            disabled={
              assignmentBusy ||
              manualEditing ||
              row.source !== 'onboarding-case' ||
              Boolean(row.studentEnrollmentId) ||
              [4, 5, 6].includes(row.backendStatus ?? -1) ||
              ['completed', 'cancelled', 'provisioning'].includes(row.status)
            }
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
        stickyOnMobile: !['readiness', 'division', 'gr-number', 'roll-number'].includes(view),
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
              {['readiness', 'division', 'gr-number', 'roll-number'].includes(view) ? (
                <Button
                  variant="text"
                  color="inherit"
                  aria-label={`Review ${String(value)}`}
                  disabled={assignmentBusy}
                  onClick={() => onOpen(String(row.id))}
                  sx={{
                    p: 0,
                    justifyContent: 'flex-start',
                    minWidth: 0,
                    textAlign: 'left',
                    height: 'auto',
                    overflowWrap: 'anywhere',
                    typography: 'subtitle2',
                  }}
                >
                  {value}
                </Button>
              ) : (
                <Typography variant="subtitle2">{value}</Typography>
              )}
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
        label: view === 'readiness' || assignmentView ? 'Class & Division' : 'Placement',
        minWidth: 160,
        filterType: 'enum',
        enumOptions: placementOptions,
        cellSx: { whiteSpace: 'normal' },
      },
      {
        id: 'pendingWork',
        label: 'Pending work',
        minWidth: 240,
        cellSx: { whiteSpace: 'normal' },
        render: (_value, row) => (
          <StudentPendingTasks
            studentName={row.studentName}
            tasks={row.pendingTasks}
            emptyText={row.setup.pendingText}
            disabled={assignmentBusy}
            onOpenTask={(nextView) => onOpenTask(String(row.id), nextView)}
          />
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

          const rollText = `Roll: ${row.rollNo ?? 0}`;

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
              {view === 'gr-number' && manualEditing && editableIds.includes(String(row.id)) ? (
                <ShakingTextField error={Boolean(manualErrors[String(row.id)])}>
                  <TextField
                    size="small"
                    label="GR number"
                    value={manualValues[String(row.id)] ?? ''}
                    disabled={assignmentBusy}
                    onChange={(event) => onManualChange?.(String(row.id), event.target.value)}
                    onBlur={() => onManualBlur?.(String(row.id))}
                    error={Boolean(manualErrors[String(row.id)])}
                    helperText={manualErrors[String(row.id)]}
                    slotProps={{
                      htmlInput: { 'aria-label': `GR number for ${String(row.studentName)}` },
                    }}
                  />
                </ShakingTextField>
              ) : (
                <Typography variant="body2" fontWeight={hasCommittedValue ? 700 : 500}>
                  {value ?? 'Not assigned'}
                </Typography>
              )}
              {view !== 'gr-number' && (
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
              )}
              {view === 'gr-number' && manualEditing && manualBlockers[String(row.id)] && (
                <Typography variant="caption" color="text.secondary">
                  {manualBlockers[String(row.id)]}
                </Typography>
              )}
              {view === 'gr-number' && assignmentMessages[String(row.id)] && (
                <Typography
                  variant="caption"
                  role={assignmentMessages[String(row.id)].status === 'failed' ? 'alert' : 'status'}
                  color={
                    assignmentMessages[String(row.id)].status === 'failed'
                      ? 'error.main'
                      : 'text.secondary'
                  }
                >
                  {assignmentMessages[String(row.id)].message}
                </Typography>
              )}
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
              {view === 'roll-number' && manualEditing && editableIds.includes(String(row.id)) ? (
                <ShakingTextField error={Boolean(manualErrors[String(row.id)])}>
                  <NumericFormatCustom
                    size="small"
                    label="Roll number"
                    value={manualValues[String(row.id)] ?? ''}
                    placeholder="0"
                    disabled={assignmentBusy}
                    onValueChange={({ value }) => onManualChange?.(String(row.id), value)}
                    roundToWholeRupees={false}
                    prefix=""
                    thousandSeparator={false}
                    decimalScale={0}
                    isAllowed={({ floatValue }) =>
                      floatValue === undefined || floatValue <= 2147483647
                    }
                    onBlur={() => onManualBlur?.(String(row.id))}
                    error={Boolean(manualErrors[String(row.id)])}
                    helperText={manualErrors[String(row.id)]}
                    slotProps={{
                      htmlInput: {
                        'aria-label': `Roll number for ${String(row.studentName)}`,
                        inputMode: 'numeric',
                      },
                    }}
                  />
                </ShakingTextField>
              ) : (
                <Typography variant="body2" fontWeight={hasCommittedValue ? 700 : 500}>
                  {row.rollNo ?? 0}
                </Typography>
              )}
              {view !== 'roll-number' && (
                <Label variant="soft" color={hasCommittedValue ? 'success' : 'warning'}>
                  {hasCommittedValue ? (row.rollNumberLocked ? 'Locked' : 'Assigned') : 'Pending'}
                </Label>
              )}
              {view === 'roll-number' && manualEditing && manualBlockers[String(row.id)] && (
                <Typography variant="caption" color="text.secondary">
                  {manualBlockers[String(row.id)]}
                </Typography>
              )}
              {view === 'roll-number' && assignmentMessages[String(row.id)] && (
                <Typography
                  variant="caption"
                  role={assignmentMessages[String(row.id)].status === 'failed' ? 'alert' : 'status'}
                  color={
                    assignmentMessages[String(row.id)].status === 'failed'
                      ? 'error.main'
                      : 'text.secondary'
                  }
                >
                  {assignmentMessages[String(row.id)].message}
                </Typography>
              )}
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
        render: (_value, row) => (
          <Stack spacing={0.5} alignItems="flex-start">
            {view === 'division' && manualEditing && editableIds.includes(String(row.id)) ? (
              <StudentSetupDivisionEditor
                caseId={String(row.id)}
                currentDivisionId={row.divisionId}
                studentName={String(row.studentName)}
                value={manualValues[String(row.id)] ?? ''}
                disabled={assignmentBusy}
                onChange={(value) => onManualChange?.(String(row.id), String(value))}
                onBlur={() => onManualBlur?.(String(row.id))}
                error={Boolean(manualErrors[String(row.id)])}
                helperText={manualErrors[String(row.id)]}
              />
            ) : (
              <Typography variant="body2" fontWeight={600}>
                {row.standardName} / {row.divisionName || '—'}
              </Typography>
            )}
            {view === 'division' && manualEditing && manualBlockers[String(row.id)] && (
              <Typography variant="caption" color="text.secondary">
                {manualBlockers[String(row.id)]}
              </Typography>
            )}
            {view === 'division' && assignmentMessages[String(row.id)] && (
              <Typography
                variant="caption"
                role={assignmentMessages[String(row.id)].status === 'failed' ? 'alert' : 'status'}
                color={
                  assignmentMessages[String(row.id)].status === 'failed'
                    ? 'error.main'
                    : 'text.secondary'
                }
              >
                {assignmentMessages[String(row.id)].message}
              </Typography>
            )}
          </Stack>
        ),
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
        id: 'assignmentStatus',
        label: 'Status',
        width: 140,
        minWidth: 140,
        isFilter: false,
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        render: (value, row) => <Label color={row.assignmentStatusColor}>{value}</Label>,
      },
      {
        id: 'statusLabel',
        label: assignmentView ? 'Setup status' : 'Status',
        width: 156,
        minWidth: 156,
        filterType: 'enum',
        enumOptions: studentSetupStatusOptions.map(({ label, setupLabel }) => ({
          label: view === 'readiness' ? setupLabel : label,
          value: view === 'readiness' ? setupLabel : label,
        })),
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        render: (_value, row) => (
          <Label
            variant="soft"
            color={
              view === 'readiness'
                ? row.setup.status.color
                : onboardingStageMeta[row.status as StudentOnboardingItem['status']].color
            }
          >
            {row.statusLabel}
          </Label>
        ),
      },
      {
        id: 'actions',
        align: 'left',
        label: view === 'readiness' ? 'Action' : 'Actions',
        width: view === 'readiness' ? 180 : 88,
        minWidth: view === 'readiness' ? 180 : 88,
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row: IData) =>
          view === 'readiness' ? (
            <Button
              size="small"
              color="inherit"
              variant={row.setup.action.primary ? 'contained' : 'outlined'}
              aria-label={`${row.setup.action.label} for ${row.studentName}`}
              disabled={assignmentBusy}
              onClick={(event) => {
                event.stopPropagation();
                if (row.setup.action.view) onOpenTask(String(row.id), row.setup.action.view);
                else onOpen(String(row.id));
              }}
              sx={{ width: 1, whiteSpace: 'nowrap' }}
            >
              {row.setup.action.label}
            </Button>
          ) : (
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
        'pendingWork',
        'identifiers',
        'accounts',
        'statusLabel',
        'actions',
      ],
      'gr-number': [
        'selection',
        'studentName',
        'placement',
        'grNumberTask',
        'assignmentStatus',
        'statusLabel',
      ],
      'roll-number': [
        'selection',
        'studentName',
        'placement',
        'rollNumberTask',
        'assignmentStatus',
        'statusLabel',
      ],
      division: [
        'selection',
        'studentName',
        'divisionTask',
        'rollNumberTask',
        'assignmentStatus',
        'statusLabel',
      ],
      fees: ['selection', 'studentName', 'placement', 'feesTask', 'statusLabel', 'actions'],
      credentials: ['selection', 'studentName', 'placement', 'accounts', 'statusLabel', 'actions'],
    };

    const filterableColumns = new Set(['studentName', 'statusLabel']);
    if (taskScope === 'all') filterableColumns.add('rollNumberTask');
    if (placementOptions.length > 0 && (view !== 'division' || taskScope === 'all')) {
      filterableColumns.add('placement');
      filterableColumns.add('divisionTask');
    }

    return allColumns
      .filter(
        (column) =>
          visibleColumns[view].includes(column.id) &&
          (column.id !== 'selection' || (showSelection && view === 'division'))
      )
      .map((column) => ({
        ...column,
        defaultHidden:
          (view === 'readiness' &&
            ['admissionRoute', 'identifiers', 'accounts'].includes(column.id)) ||
          (assignmentView && ['statusLabel'].includes(column.id)) ||
          (view === 'division' && column.id === 'rollNumberTask'),
        isSort:
          column.id in studentSetupSortFields &&
          (taskScope === 'all' || (column.id !== 'rollNumberTask' && column.id !== 'divisionTask')),
        isFilter: filterableColumns.has(column.id),
      }));
  }, [
    allStudentsSelected,
    onOpen,
    onOpenTask,
    onToggleAll,
    onToggleSelection,
    placementOptions,
    rows,
    selectedStudentIds,
    someStudentsSelected,
    showSelection,
    manualEditing,
    editableIds,
    manualValues,
    manualErrors,
    manualBlockers,
    assignmentMessages,
    onManualChange,
    onManualBlur,
    assignmentBusy,
    taskScope,
    view,
    assignmentView,
  ]);

  return (
    <CustomizableTable
      key={view === 'readiness' ? 'setup-status' : 'assignment'}
      tableId={tableId}
      tableTitle={tableTitle}
      exportLabel="Export"
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
          {onViewAllStudents && (
            <Button size="small" variant="outlined" onClick={onViewAllStudents}>
              View all students
            </Button>
          )}
        </Stack>
      }
      errorContent={
        isError ? (
          <StudentFeedback
            notificationKey="STU-1055"
            presentation="toast"
            severity="error"
            action={
              <Button color="inherit" onClick={onRetry}>
                Retry
              </Button>
            }
          >
            The student setup list could not be loaded. Refresh the page.
          </StudentFeedback>
        ) : undefined
      }
      searchFieldProps={{
        placeholder: view === 'readiness' ? 'Search name or application no.' : 'Search...',
      }}
      wrapperProps={{ sx: { minWidth: 0, minHeight: { xs: 360, md: 0 }, flex: 1 } }}
      tableContainerProps={{ sx: { minWidth: 0, minHeight: 0, height: 1 } }}
    />
  );
}
