'use client';

import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';
import type { StudentOnboardingFilterOptions } from 'src/redux/student/onboarding/student-onboarding-types';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { usePathname, useSearchParams } from 'next/navigation';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetStudentOnboardingCasesQuery,
  useActivateStudentOnboardingMutation,
  useGetStudentOnboardingFilterOptionsQuery,
  useRefreshStudentOnboardingReadinessMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';
import {
  Box,
  Menu,
  Alert,
  Paper,
  Stack,
  Button,
  Tooltip,
  Divider,
  Checkbox,
  MenuItem,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import StudentSetupDrawer from './student-setup-drawer';
import { useOnboardingSettings } from '../onboarding-settings-context';
import StudentSetupTaskNavigation from './student-setup-task-navigation';
import { studentOnboardingPreviewData } from './student-onboarding-preview-data';
import StudentOnboardingOperationDialog from './student-onboarding-operation-dialog';
import StudentAssignmentDialog, { type StudentAssignmentType } from './student-assignment-dialog';
import {
  getDivisionAssignmentMode,
  isStudentApprovalRequired,
  getEffectiveReadinessRules,
} from '../onboarding-settings-model';
import {
  type StudentSetupView,
  parseStudentSetupView,
  getPendingStudentCount,
  type StudentSetupTaskScope,
  parseStudentSetupTaskScope,
  filterStudentsForSetupView,
} from './student-setup-view';
import {
  accountStatusMeta,
  getReadinessSummary,
  onboardingStageMeta,
  mapOnboardingCaseToItem,
  applyReadinessAccessRules,
  type StudentOnboardingItem,
  getStudentAcademicPathContext,
} from './student-onboarding-model';

import type { OnboardingSettingsConfiguration } from '../onboarding-settings-model';

const studentSetupTooltip = (
  <Box sx={{ p: 1.5, maxWidth: 340 }}>
    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
      Student Onboarding worklist
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

function StudentSetupFilters({
  options,
  selectedStandardId,
  overdueOnly,
  unassignedOnly,
  onStandardChange,
  onOverdueOnlyChange,
  onUnassignedOnlyChange,
}: {
  options?: StudentOnboardingFilterOptions;
  selectedStandardId: string;
  overdueOnly: boolean;
  unassignedOnly: boolean;
  onStandardChange: (value: string) => void;
  onOverdueOnlyChange: (value: boolean) => void;
  onUnassignedOnlyChange: (value: boolean) => void;
}) {
  const standards = [{ id: ALL_STANDARDS, name: 'All classes' }, ...(options?.standards ?? [])];

  return (
    <Paper variant="outlined" sx={{ p: 1.25, flexShrink: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(220px, 1fr) minmax(0, 2fr)',
          },
          gap: 1.25,
          alignItems: 'center',
        }}
      >
        <CustomSelect
          options={standards}
          label="Class"
          value={selectedStandardId}
          onChange={(value) => onStandardChange(value as string)}
          labelKey="name"
          valueKey="id"
          isSearch
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={overdueOnly}
                onChange={(event) => onOverdueOnlyChange(event.target.checked)}
              />
            }
            label="Overdue only"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={unassignedOnly}
                onChange={(event) => onUnassignedOnlyChange(event.target.checked)}
              />
            }
            label="Unassigned owner only"
          />
        </Stack>
      </Box>
    </Paper>
  );
}

function StudentSetupTable({
  rows,
  isLoading,
  view,
  tableId,
  tableTitle,
  noDataText,
  onOpen,
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
  isServerBacked,
}: {
  rows: StudentOnboardingItem[];
  isLoading: boolean;
  view: StudentSetupView;
  tableId: string;
  tableTitle: string;
  noDataText: string;
  onOpen: (studentId: string) => void;
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
  isServerBacked: boolean;
}) {
  const tableData = useMemo(
    () =>
      rows.map((student) => {
        const readiness = getReadinessSummary(student);
        return {
          ...student,
          placement: `${student.standardName} / ${student.divisionName}`,
          identifiers: `GR ${student.grNo ?? student.grPreview ?? 'Pending'} · Roll ${student.rollNo ?? 'Pending'}`,
          readinessProgress: readiness.progress,
          readinessText: `${readiness.passedCount}/${readiness.requiredCount} checks`,
          blockerCount: readiness.blockingCount,
          accounts: `${accountStatusMeta[student.studentAccountStatus].label} / ${accountStatusMeta[student.guardianAccountStatus].label}`,
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
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
        renderColumn: () => (
          <Checkbox
            checked={allStudentsSelected}
            indeterminate={someStudentsSelected}
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
        minWidth: 210,
        sticky: true,
        stickyPosition: 'left',
        render: (value, row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.applicationNumber}
            </Typography>
          </Stack>
        ),
      },
      { id: 'admissionRoute', label: 'Admission route', minWidth: 160, filterType: 'enum' },
      { id: 'placement', label: 'Placement', minWidth: 150, filterType: 'enum' },
      {
        id: 'readinessProgress',
        label: 'Readiness',
        minWidth: 170,
        filterType: 'number',
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
                {hasCommittedValue ? 'Assigned' : row.grPreview ? 'Preview only' : 'Pending'}
              </Label>
            </Stack>
          );
        },
      },
      {
        id: 'rollNumberTask',
        label: 'Roll number',
        minWidth: 150,
        isFilter: false,
        render: (_value, row) => {
          const hasCommittedValue = row.rollNo !== undefined && row.rollNo !== null;

          return (
            <Stack spacing={0.5} alignItems="flex-start">
              <Typography variant="body2" fontWeight={hasCommittedValue ? 700 : 500}>
                {hasCommittedValue ? row.rollNo : 'Not assigned'}
              </Typography>
              <Label variant="soft" color={hasCommittedValue ? 'success' : 'warning'}>
                {hasCommittedValue ? 'Assigned' : 'Pending'}
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
        render: (_value, row) => {
          const divisionAssigned = Boolean(row.divisionName && row.divisionName !== '—');

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
      { id: 'accounts', label: 'Student / guardian access', minWidth: 190, filterType: 'enum' },
      { id: 'ownerName', label: 'Owner', minWidth: 140, filterType: 'enum' },
      {
        id: 'statusLabel',
        label: 'Status',
        minWidth: 150,
        filterType: 'enum',
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row) => (
          <Label color={onboardingStageMeta[row.status as StudentOnboardingItem['status']].color}>
            {onboardingStageMeta[row.status as StudentOnboardingItem['status']].label}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Action',
        width: 72,
        align: 'center',
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row: IData) => (
          <Tooltip title={`Open onboarding for ${String(row.studentName)}`}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onOpen(String(row.id));
              }}
              color="primary"
            >
              <Iconify icon="mdi:user-edit" width={24} />
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
    };

    return allColumns.filter((column) => visibleColumns[view].includes(column.id));
  }, [
    allStudentsSelected,
    onOpen,
    onToggleAll,
    onToggleSelection,
    selectedStudentIds,
    someStudentsSelected,
    view,
  ]);

  return (
    <CustomizableTable
      tableId={tableId}
      tableTitle={tableTitle}
      columns={columns}
      data={tableData}
      isLoading={isLoading}
      isFilter
      isSearch
      serverSide={isServerBacked}
      serverSidePagination={isServerBacked}
      serverSideSearch={isServerBacked}
      totalCount={totalCount}
      page={page - 1}
      rowsPerPage={rowsPerPage}
      searchTerm={searchTerm}
      rowsPerPageOptions={[10, 25, 100]}
      onServerPagination={onPaginationChange}
      onServerSearch={onSearchChange}
      noDataText={<>{noDataText}</>}
      wrapperProps={{ sx: { minWidth: 0, minHeight: 0, flex: 1 } }}
      tableContainerProps={{ sx: { minWidth: 0, minHeight: 0 } }}
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
  }
> = {
  'gr-number': {
    title: 'GR number assignment',
    description:
      'Assign committed GR numbers to remaining students, or open all students for an authorized change.',
    icon: 'mdi:identifier',
    actionLabel: 'Assign GR No.',
    pendingScopeLabel: 'Remaining',
    allScopeLabel: 'All students',
  },
  'roll-number': {
    title: 'Roll number assignment',
    description:
      'Assign roll numbers using the configured class order, or enter student-wise values manually.',
    icon: 'mdi:format-list-numbered',
    actionLabel: 'Assign Roll No.',
    pendingScopeLabel: 'Remaining',
    allScopeLabel: 'All students',
  },
  division: {
    title: 'Division assignment',
    description:
      'Place students without a division or select existing placements that need an authorized change.',
    icon: 'mdi:google-classroom',
    actionLabel: 'Assign / Change Division',
    pendingScopeLabel: 'Unassigned',
    allScopeLabel: 'All students',
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
  assignmentMode: 'automatic' | 'manual' | 'both';
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
              <Label variant="soft" color="default">
                {assignmentModeLabel(assignmentMode)}
              </Label>
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

type BulkPreviewAction = 'review-readiness' | 'request-approval' | 'activate';

const bulkActionMeta: Record<BulkPreviewAction, { title: string; description: string }> = {
  'review-readiness': {
    title: 'Review readiness',
    description: 'Review blockers and incomplete checks for the selected students.',
  },
  'request-approval': {
    title: 'Request approval',
    description: 'Preview the students that would enter an approval workflow.',
  },
  activate: {
    title: 'Activate students',
    description: 'Preview which selected students are ready to become active student records.',
  },
};

function BulkActionPreviewDialog({
  action,
  students,
  configuration,
  onClose,
}: {
  action: BulkPreviewAction | null;
  students: StudentOnboardingItem[];
  configuration: OnboardingSettingsConfiguration;
  onClose: () => void;
}) {
  if (!action) return null;
  const meta = bulkActionMeta[action];

  return (
    <CustomDialog open handleClose={onClose} title={meta.title} maxWidth="sm" hasForm={false}>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Frontend preview only. No student record, approval, account, or activation state will
            change until the Onboarding APIs are connected.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {meta.description}
          </Typography>
          <Divider />
          <Stack spacing={1}>
            {students.slice(0, 8).map((student) => {
              const summary = getReadinessSummary(student);
              const rules = getEffectiveReadinessRules(
                configuration,
                student.admissionRoute,
                getStudentAcademicPathContext(student)
              );
              const activationBlocked = rules.blockActivation && summary.blockingCount > 0;
              return (
                <Paper key={student.id} variant="outlined" sx={{ p: 1.25 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {student.studentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.applicationNumber} · {summary.passedCount}/{summary.requiredCount}{' '}
                        checks complete
                      </Typography>
                    </Box>
                    <Label color={activationBlocked ? 'warning' : 'success'}>
                      {activationBlocked
                        ? `${summary.blockingCount} blockers`
                        : action === 'request-approval'
                          ? 'Ready for approval'
                          : 'Eligible'}
                    </Label>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
          {students.length > 8 ? (
            <Typography variant="caption" color="text.secondary">
              Showing 8 of {students.length} selected students.
            </Typography>
          ) : null}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose}>Close preview</Button>
        <Button variant="contained" disabled>
          Connect backend to continue
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

export default function StudentSetupScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManageOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const canCancelOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.Delete');
  const { settings, scope: settingsScope, isInherited } = useOnboardingSettings();
  const activeView = parseStudentSetupView(searchParams.get('view'));
  const activeTaskScope = parseStudentSetupTaskScope(searchParams.get('scope'), activeView);
  const [useWorkflowPreview, setUseWorkflowPreview] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkPreviewAction | null>(null);
  const [assignmentRequest, setAssignmentRequest] = useState<{
    type: StudentAssignmentType;
    studentIds: string[];
  } | null>(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState<HTMLElement | null>(null);
  const [showModeAlert, setShowModeAlert] = useState(true);
  const [showFilterAlert, setShowFilterAlert] = useState(true);
  const [selectedStandardId, setSelectedStandardId] = useState(ALL_STANDARDS);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
  const [refreshReadiness, refreshReadinessState] = useRefreshStudentOnboardingReadinessMutation();
  const [activateOnboarding, activateOnboardingState] = useActivateStudentOnboardingMutation();

  const queryArgs = useMemo(
    () => ({
      academicYearId: currentYear?.id || '',
      standardId: selectedStandardId === ALL_STANDARDS ? undefined : selectedStandardId,
      overdueOnly: overdueOnly || undefined,
      unassignedOnly: unassignedOnly || undefined,
      search: searchTerm.trim() || undefined,
      sorting: 'DueAt asc,CreationTime desc',
      skipCount: (tablePage - 1) * rowsPerPage,
      maxResultCount: rowsPerPage,
    }),
    [
      currentYear?.id,
      overdueOnly,
      rowsPerPage,
      searchTerm,
      selectedStandardId,
      tablePage,
      unassignedOnly,
    ]
  );

  const onboardingQuery = useGetStudentOnboardingCasesQuery(queryArgs, {
    skip: useWorkflowPreview || !currentYear?.id,
  });
  const filterOptionsQuery = useGetStudentOnboardingFilterOptionsQuery(undefined, {
    skip: useWorkflowPreview || !currentYear?.id,
  });
  const liveRows = useMemo(
    () => (onboardingQuery.data?.items ?? []).map(mapOnboardingCaseToItem),
    [onboardingQuery.data?.items]
  );
  const baseRows = useWorkflowPreview ? studentOnboardingPreviewData : liveRows;
  const sourceRows = useMemo(
    () =>
      baseRows.map((student) => {
        if (student.source === 'onboarding-case') return student;

        return applyReadinessAccessRules(
          student,
          getEffectiveReadinessRules(
            settings,
            student.admissionRoute,
            getStudentAcademicPathContext(student)
          )
        );
      }),
    [baseRows, settings]
  );
  const displayedRows = useMemo(
    () => filterStudentsForSetupView(sourceRows, activeView, activeTaskScope),
    [activeTaskScope, activeView, sourceRows]
  );
  const pendingCounts = useMemo(
    () => ({
      'gr-number': getPendingStudentCount(sourceRows, 'gr-number'),
      'roll-number': getPendingStudentCount(sourceRows, 'roll-number'),
      division: getPendingStudentCount(sourceRows, 'division'),
    }),
    [sourceRows]
  );
  const navigationCounts = useMemo<Record<StudentSetupView, number>>(
    () => ({
      readiness: sourceRows.length,
      'gr-number': pendingCounts['gr-number'],
      'roll-number': pendingCounts['roll-number'],
      division: sourceRows.length,
    }),
    [pendingCounts, sourceRows.length]
  );
  const selectedStudents = useMemo(
    () => sourceRows.filter((student) => selectedStudentIds.includes(student.id)),
    [selectedStudentIds, sourceRows]
  );
  const selectedStudent = sourceRows.find((student) => student.id === selectedStudentId) || null;
  const selectedStudentRules = selectedStudent
    ? {
        ...getEffectiveReadinessRules(
          settings,
          selectedStudent.admissionRoute,
          getStudentAcademicPathContext(selectedStudent)
        ),
        requireApproval: isStudentApprovalRequired(
          getEffectiveReadinessRules(
            settings,
            selectedStudent.admissionRoute,
            getStudentAcademicPathContext(selectedStudent)
          ),
          selectedStudent.admissionRoute
        ),
      }
    : settings.readinessAccess;
  const selectedStudentsRequireApproval = selectedStudents.some((student) => {
    const rules = getEffectiveReadinessRules(
      settings,
      student.admissionRoute,
      getStudentAcademicPathContext(student)
    );
    return isStudentApprovalRequired(rules, student.admissionRoute);
  });
  const assignmentStudents = useMemo(
    () =>
      assignmentRequest
        ? sourceRows.filter((student) => assignmentRequest.studentIds.includes(student.id))
        : [],
    [assignmentRequest, sourceRows]
  );
  const operationalAssignmentStudent =
    assignmentStudents.length === 1 && assignmentStudents[0].source === 'onboarding-case'
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
      current && sourceRows.some((student) => student.id === current) ? current : null
    );
  }, [sourceRows]);

  useEffect(() => {
    setSelectedStudentIds([]);
    setSelectedStudentId(null);
  }, [activeTaskScope, activeView]);

  const getViewHref = (view: StudentSetupView) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('view', view);
    if (view !== activeView) next.delete('scope');
    if (view !== 'readiness') next.delete('stage');
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const getScopeHref = (scope: StudentSetupTaskScope) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('view', activeView);
    next.set('scope', scope);
    next.delete('stage');
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
        message: 'You do not have permission to change Student Onboarding cases.',
      });
      return;
    }
    setAssignmentRequest({ type, studentIds });
  };

  const openBulkWorkflowAction = (action: BulkPreviewAction) => {
    setMoreActionsAnchor(null);
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
          message: `${student.studentName} is now an active student.`,
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
    <Stack spacing={1.5} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      <CustomBreadcrumbs
        heading="Student Setup"
        description=" "
        tooltipProps={{ title: studentSetupTooltip, sx: { textAlign: 'left' } } as TooltipProps}
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Student Setup' },
        ]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Label color={isInherited ? 'default' : 'info'}>
              {isInherited ? 'Inherited defaults' : `Customized · ${settingsScope.label}`}
            </Label>
            <Button
              variant={useWorkflowPreview ? 'contained' : 'outlined'}
              startIcon={<Iconify icon="mdi:monitor-eye" width={18} />}
              onClick={() => {
                setUseWorkflowPreview((current) => !current);
                setShowModeAlert(true);
                setSelectedStudentIds([]);
                setSelectedStudentId(null);
              }}
            >
              {useWorkflowPreview ? 'Use connected students' : 'View workflow preview'}
            </Button>
          </Stack>
        }
      />

      {showModeAlert ? (
        <Alert
          severity={useWorkflowPreview ? 'info' : 'warning'}
          onClose={() => setShowModeAlert(false)}
          sx={{ flexShrink: 0 }}
        >
          {useWorkflowPreview
            ? 'Workflow preview is active. Applied session settings now control readiness and assignment behavior; sample student data is not saved.'
            : 'Live mode is active. Cases, readiness steps, blockers, identifiers, placement, and lifecycle status are loaded from the Student Onboarding service.'}
        </Alert>
      ) : null}

      <StudentSetupTaskNavigation
        activeView={activeView}
        counts={navigationCounts}
        getViewHref={getViewHref}
      />

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
          gap: 1.5,
        }}
      >
        {!useWorkflowPreview ? (
          <StudentSetupFilters
            options={filterOptionsQuery.data}
            selectedStandardId={selectedStandardId}
            overdueOnly={overdueOnly}
            unassignedOnly={unassignedOnly}
            onStandardChange={(value) => {
              setSelectedStandardId(value);
              setTablePage(1);
            }}
            onOverdueOnlyChange={(value) => {
              setOverdueOnly(value);
              setTablePage(1);
            }}
            onUnassignedOnlyChange={(value) => {
              setUnassignedOnly(value);
              setTablePage(1);
            }}
          />
        ) : null}

        {!useWorkflowPreview && onboardingQuery.isFetching ? (
          <LinearProgress aria-label="Loading Student Onboarding worklist" />
        ) : null}
        {!useWorkflowPreview && onboardingQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => onboardingQuery.refetch()}>
                Retry
              </Button>
            }
          >
            Student Onboarding cases could not be loaded.
          </Alert>
        ) : null}
        {!useWorkflowPreview && !currentYear?.id && showFilterAlert ? (
          <Alert severity="info" onClose={() => setShowFilterAlert(false)}>
            Select an academic year to load Student Onboarding cases.
          </Alert>
        ) : null}

        <Box sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex' }}>
          <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, flex: 1 }}>
            {activeView !== 'readiness' ? (
              <StudentSetupAssignmentBar
                view={activeView}
                scope={activeTaskScope}
                scopeHref={getScopeHref}
                pendingCount={pendingCounts[activeView]}
                visibleCount={displayedRows.length}
                selectedCount={selectedStudentIds.length}
                assignmentMode={
                  activeView === 'division'
                    ? getDivisionAssignmentMode(settings.divisionChange.configurations)
                    : activeView === 'gr-number'
                      ? settings.grNumber.assignmentMode
                      : settings.rollNumber.assignmentMode
                }
                onSelectAll={selectAllVisible}
                onAssign={() => openAssignment(activeView, selectedStudentIds)}
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
                  {selectedStudentsRequireApproval ? (
                    <MenuItem
                      disabled={!canManageOnboarding}
                      onClick={() => openBulkWorkflowAction('request-approval')}
                    >
                      <ListItemIcon sx={{ minWidth: 10 }}>
                        <Iconify icon="mdi:account-clock-outline" width={22} />
                      </ListItemIcon>
                      <ListItemText>Request approval</ListItemText>
                    </MenuItem>
                  ) : null}
                  <MenuItem
                    disabled={!canManageOnboarding}
                    onClick={() => openBulkWorkflowAction('activate')}
                  >
                    <ListItemIcon sx={{ minWidth: 10 }}>
                      <Iconify icon="mdi:account-arrow-right-outline" width={22} />
                    </ListItemIcon>
                    <ListItemText>
                      {settings.readinessAccess.blockActivation
                        ? 'Activate ready students'
                        : 'Activate selected students'}
                    </ListItemText>
                  </MenuItem>
                </Menu>
              </Paper>
            ) : null}
            <StudentSetupTable
              rows={displayedRows}
              isLoading={!useWorkflowPreview && onboardingQuery.isLoading}
              view={activeView}
              tableId={`student-onboarding-${activeView}-worklist`}
              tableTitle={
                activeView === 'readiness'
                  ? 'Onboarding readiness'
                  : assignmentViewMeta[activeView].title
              }
              noDataText={
                activeView === 'readiness'
                  ? 'No students match the selected filters.'
                  : activeTaskScope === 'pending'
                    ? `No students are currently ${activeView === 'division' ? 'without a division' : `waiting for a ${activeView === 'gr-number' ? 'GR number' : 'roll number'}`}. Switch to All students to review existing assignments.`
                    : 'No students match the selected academic filters.'
              }
              onOpen={setSelectedStudentId}
              selectedStudentIds={selectedStudentIds}
              onToggleSelection={toggleStudent}
              allStudentsSelected={allStudentsSelected}
              someStudentsSelected={someStudentsSelected}
              onToggleAll={toggleAll}
              totalCount={
                useWorkflowPreview ? displayedRows.length : (onboardingQuery.data?.totalCount ?? 0)
              }
              page={tablePage}
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              onPaginationChange={(page, nextRowsPerPage) => {
                setTablePage(page);
                setRowsPerPage(nextRowsPerPage);
              }}
              onSearchChange={(value) => {
                setSearchTerm(value);
                setTablePage(1);
              }}
              isServerBacked={!useWorkflowPreview}
            />
          </Stack>
        </Box>
      </Box>

      <StudentSetupDrawer
        open={Boolean(selectedStudent)}
        student={selectedStudent}
        readinessRules={selectedStudentRules}
        onClose={() => setSelectedStudentId(null)}
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
      ) : (
        <StudentAssignmentDialog
          assignmentType={assignmentRequest?.type ?? null}
          students={assignmentStudents}
          configuration={settings}
          configurationScope={{
            ...settingsScope,
            academicYearName: settingsScope.academicYearName ?? currentYear?.name,
          }}
          onClose={() => setAssignmentRequest(null)}
        />
      )}
      <BulkActionPreviewDialog
        action={bulkAction}
        students={selectedStudents}
        configuration={settings}
        onClose={() => setBulkAction(null)}
      />
    </Stack>
  );
}
