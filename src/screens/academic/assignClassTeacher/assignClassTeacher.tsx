'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type { LabelColor } from 'src/components/label';
import type { ITimetableSummaryCard } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import type {
  ClassTeacherSummary,
  ClassTeacherEligibleTeacher,
  ClassTeacherValidationResult,
  ClassTeacherAssignmentRowDto,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Save,
  History,
  FactCheck,
  RestartAlt,
  Close as CloseIcon,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import {
  Tab,
  Box,
  Tabs,
  Card,
  Alert,
  Paper,
  Stack,
  Button,
  Drawer,
  Avatar,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  useGetClassTeacherAssignmentsQuery,
  useGetClassTeacherEligibleTeachersQuery,
  useGetClassTeacherAssignmentHistoryQuery,
  useGetClassTeacherAssignmentSummaryQuery,
  useUpdateClassTeacherAssignmentsMutation,
  useValidateClassTeacherAssignmentsMutation,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { shouldCloseReviewDrawer } from './classTeacherReviewDrawer';
import { getPendingAssignmentRows } from './classTeacherPendingRows';
import { getClassTeacherAssignmentStatusColor } from './classTeacherAssignmentStatus';
import { ClassTeacherAssignmentParameterSelect } from './ClassTeacherAssignmentParameterSelect';
import {
  getDraftTeacherWorkload,
  applyDraftTeacherWorkloads,
} from './classTeacherDraftWorkload';

type AssignmentTableRow = ClassTeacherAssignmentRowDto & {
  classTeacher: string | null;
  classTeacherName: string;
  effectiveFromDraft: string;
  assignmentTypeDraft: string;
  changeReasonDraft: string;
};

const assignmentTypes = ['Permanent', 'Temporary', 'Acting', 'Replacement'];
const changeReasons = [
  'New Academic Year',
  'Transfer',
  'Long Leave',
  'Workload Balancing',
  'Administrative Decision',
  'Other',
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const buildRows = (rows: ClassTeacherAssignmentRowDto[]): AssignmentTableRow[] =>
  rows.map((row) => ({
    ...row,
    classTeacher: row.assignedTeacher?.teacherId ?? null,
    classTeacherName: row.assignedTeacher?.teacherName ?? '',
    effectiveFromDraft: row.effectiveFrom?.slice(0, 10) ?? todayIso(),
    assignmentTypeDraft: row.assignmentType || 'Permanent',
    changeReasonDraft: 'New Academic Year',
  }));

const getRowKey = (row: AssignmentTableRow) => `${row.classId}-${row.divisionId}`;

const getChangedRows = (rows: AssignmentTableRow[], originalRows: AssignmentTableRow[]) =>
  rows.filter((row) => {
    const original = originalRows.find((item) => getRowKey(item) === getRowKey(row));
    return (
      row.classTeacher !== original?.classTeacher ||
      row.effectiveFromDraft !== original?.effectiveFromDraft ||
      row.assignmentTypeDraft !== original?.assignmentTypeDraft ||
      row.changeReasonDraft !== original?.changeReasonDraft
    );
  });

const getSummary = (
  rows: AssignmentTableRow[],
  apiSummary: ClassTeacherSummary | undefined,
  pendingChanges: number
): ClassTeacherSummary => {
  const assigned = rows.filter((row) => row.classTeacher).length;
  const conflicts = rows.filter((row) => row.conflictCount > 0).length;
  const unassigned = rows.length - assigned;
  const reasons = [
    ...(unassigned ? [`${unassigned} class divisions are unassigned.`] : []),
    ...(conflicts ? [`${conflicts} assignments need review.`] : []),
    ...(pendingChanges ? [`${pendingChanges} changes are awaiting confirmation.`] : []),
  ];

  return {
    totalClasses: rows.length || apiSummary?.totalClasses || 0,
    assigned,
    unassigned,
    conflicts,
    pendingChanges,
    pendingApproval: apiSummary?.pendingApproval ?? 0,
    temporaryAssignments: rows.filter((row) => row.assignmentTypeDraft === 'Temporary').length,
    acknowledgmentPending: apiSummary?.acknowledgmentPending ?? 0,
    status: conflicts || unassigned || pendingChanges ? 'Attention Needed' : 'Ready',
    reasons,
  };
};

const TeacherAssignmentCell = ({
  row,
  teachers,
  onChange,
}: {
  row: AssignmentTableRow;
  teachers: ClassTeacherEligibleTeacher[];
  onChange: (teacher: ClassTeacherEligibleTeacher | null) => void;
}) => {
  const selectedTeacher =
    teachers.find((teacher) => teacher.teacherId === row.classTeacher) ??
    (row.classTeacher
      ? {
        teacherId: row.classTeacher,
        teacherName: row.classTeacherName,
        currentClassTeacherCount: row.assignedTeacher?.currentClassTeacherCount ?? 0,
        maximumClassTeacherCount: row.assignedTeacher?.maximumClassTeacherCount ?? 2,
        isEligible: row.assignedTeacher?.isActive ?? true,
        isActive: row.assignedTeacher?.isActive ?? true,
        availabilityStatus: row.assignedTeacher?.availabilityStatus ?? 'Available',
        workloadStatus: row.assignedTeacher?.workloadStatus ?? 'Normal',
        conflictStatus: row.assignedTeacher?.conflictStatus ?? 'None',
        recommendationScore: row.assignedTeacher?.recommendationScore ?? 0,
        currentWorkload: row.assignedTeacher?.currentClassTeacherCount ?? 0,
        maximumWorkload: 30,
        hasTimetableConflict: false,
        isOnLeave: false,
        employeeCode: row.assignedTeacher?.employeeCode,
        department: row.assignedTeacher?.department,
        ineligibilityReasons: [],
      }
      : null);

  return (
    <Autocomplete
      size="small"
      fullWidth
      options={teachers}
      value={selectedTeacher}
      onChange={(_, value) => onChange(value)}
      getOptionLabel={(option) => option.teacherName || ''}
      isOptionEqualToValue={(option, value) => option.teacherId === value.teacherId}
      getOptionDisabled={(option) => !option.isEligible && option.teacherId !== row.classTeacher}
      renderInput={(params) => <TextField {...params} label="Class Teacher" />}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.teacherId} sx={{ alignItems: 'flex-start' }}>
          <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: 12 }}>
            {option.teacherName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {option.teacherName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.employeeCode || 'No code'} · {option.department || 'No department'}
            </Typography>
            <Stack direction="row" spacing={0.75} mt={0.5} flexWrap="wrap">
              <Label variant="soft">
                {`${option.currentClassTeacherCount}/${option.maximumClassTeacherCount} classes`}
              </Label>
              <Label variant="soft">{option.workloadStatus}</Label>
              <Label variant="soft" color={option.isActive ? 'success' : 'error'}>
                {option.availabilityStatus}
              </Label>
              <Label variant="soft" color="info">{`${option.recommendationScore}% match`}</Label>
            </Stack>
            {!option.isEligible && (
              <Typography variant="caption" color="error">
                {option.ineligibilityReasons.join(' ')}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      sx={{ minWidth: 300 }}
    />
  );
};

const ReviewDrawer = ({
  open,
  validation,
  changedRows,
  isSaving,
  onClose,
  onConfirm,
}: {
  open: boolean;
  validation: ClassTeacherValidationResult | null;
  changedRows: AssignmentTableRow[];
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={(_event, reason) => {
      if (shouldCloseReviewDrawer(reason)) {
        onClose();
      }
    }}
    PaperProps={{
      sx: {
        width: { xs: '100%', sm: 480 },
        display: 'flex',
        flexDirection: 'column',
        p: 0,
      },
    }}
  >
    {/* Drawer Header */}
    <Box
      sx={{
        px: 2.5,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="h6" fontWeight={700}>
          Review & Confirm
        </Typography>
        <CustomTooltip
          arrow
          placement="bottom-start"
          title={
            <Box sx={{ p: 1, maxWidth: 320 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Allocation Guidance
              </Typography>
              <Typography variant="caption" display="block">
                Check modified allocations, workload warnings, and conflict status before publishing the latest class teacher assignments.
              </Typography>
            </Box>
          }
        >
          <IconButton size="small" color="info">
            <Iconify icon="lucide:info" width={18} />
          </IconButton>
        </CustomTooltip>
      </Box>
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Scrollable Content Body */}
    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity={validation?.canConfirm ? 'success' : 'error'} sx={{ borderRadius: 1.5 }}>
        {validation?.canConfirm
          ? 'No critical errors found. You can confirm and publish these assignments.'
          : 'Critical issues must be resolved before confirmation.'}
      </Alert>

      {/* Changed Assignments Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:user-block-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Pending Changes ({changedRows.length})
            </Typography>
          </Stack>
          <CustomTooltip
            arrow
            placement="bottom-start"
            title={
              <Box sx={{ p: 1, maxWidth: 280 }}>
                <Typography variant="caption" display="block">
                  Class teacher assignments modified during this draft session.
                </Typography>
              </Box>
            }
          >
            <IconButton size="small" color="info">
              <Iconify icon="lucide:info" width={16} />
            </IconButton>
          </CustomTooltip>
        </Stack>

        <Stack spacing={1.25}>
          {changedRows.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No local changes to review.
            </Typography>
          )}
          {changedRows.map((row) => (
            <Box
              key={getRowKey(row)}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {row.className} {row.divisionName}
                </Typography>
                <Label color={row.classTeacher ? 'success' : 'warning'} variant="soft">
                  {row.assignmentTypeDraft || 'Regular'}
                </Label>
              </Stack>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {row.classTeacherName || 'No teacher assigned'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Effective: {row.effectiveFromDraft || 'Immediate'} • Reason: {row.changeReasonDraft || 'Routine Assignment'}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Validation Issues Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:danger-triangle-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Validation & Warnings ({validation?.issues.length || 0})
            </Typography>
          </Stack>
          <CustomTooltip
            arrow
            placement="bottom-start"
            title={
              <Box sx={{ p: 1, maxWidth: 280 }}>
                <Typography variant="caption" display="block">
                  System checks for workload overload, availability conflicts, and unassigned divisions.
                </Typography>
              </Box>
            }
          >
            <IconButton size="small" color="info">
              <Iconify icon="lucide:info" width={16} />
            </IconButton>
          </CustomTooltip>
        </Stack>

        <Stack spacing={1}>
          {(!validation?.issues || validation.issues.length === 0) && (
            <Typography variant="body2" color="text.secondary">
              No validation issues found.
            </Typography>
          )}
          {validation?.issues.map((issue) => (
            <Alert
              key={`${issue.code}-${issue.classId}-${issue.divisionId}-${issue.teacherId}`}
              severity={issue.severity === 'Critical' ? 'error' : 'warning'}
              sx={{ py: 0.5, borderRadius: 1.5 }}
            >
              <Typography variant="body2" fontWeight={600}>{issue.message}</Typography>
              {issue.suggestedFix && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }}>
                  Fix: {issue.suggestedFix}
                </Typography>
              )}
            </Alert>
          ))}
        </Stack>
      </Paper>
    </Box>

    {/* Sticky Bottom Action Bar */}
    <Box
      sx={{
        p: 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      <Button variant="outlined" color="inherit" size="small" startIcon={<CloseIcon />} onClick={onClose}>
        Cancel
      </Button>
      <LoadingButton
        size="small"
        variant="contained"
        startIcon={<AssignmentTurnedIn />}
        loading={isSaving}
        disabled={!validation?.canConfirm || changedRows.length === 0}
        onClick={onConfirm}
        sx={{
          bgcolor: 'text.primary',
          color: 'background.paper',
          borderRadius: 1,
          px: 2,
          '&:hover': { bgcolor: 'text.secondary' },
        }}
      >
        Confirm & Publish
      </LoadingButton>
    </Box>
  </Drawer>
);

const ClassTeacherAssignment = () => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [organization, setOrganization] = useState<string>('');
  const [pendingOrganization, setPendingOrganization] = useState<string | null>(null);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [tableData, setTableData] = useState<AssignmentTableRow[]>([]);
  const [originalTableData, setOriginalTableData] = useState<AssignmentTableRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ClassTeacherValidationResult | null>(null);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    if (medium?.educationMediumStages?.length > 0 && !organization) {
      setOrganization(medium.educationMediumStages[0].id);
    }
  }, [medium, organization]);

  const {
    data: assignmentsData,
    refetch: refetchAssignments,
    isLoading: isClassAssignmentLoading,
    isFetching: isClassAssignmentFetching,
  } = useGetClassTeacherAssignmentsQuery({ organizationId: organization }, { skip: !organization });

  const { data: apiSummary } = useGetClassTeacherAssignmentSummaryQuery(
    { organizationId: organization },
    { skip: !organization }
  );

  const { data: eligibleTeachers = [] } = useGetClassTeacherEligibleTeachersQuery(
    { organizationId: organization },
    { skip: !organization }
  );

  const { data: history = [] } = useGetClassTeacherAssignmentHistoryQuery(
    { organizationId: organization },
    { skip: !organization || !historyOpen }
  );

  const [validateAssignments, { isLoading: isValidating }] =
    useValidateClassTeacherAssignmentsMutation();
  const [updateAssignments, { isLoading: isSaving }] = useUpdateClassTeacherAssignmentsMutation();

  useEffect(() => {
    if (!assignmentsData) return;
    const rows = buildRows(assignmentsData);
    setTableData(rows);
    setOriginalTableData(JSON.parse(JSON.stringify(rows)));
  }, [assignmentsData]);

  const changedRows = getChangedRows(tableData, originalTableData);
  const hasChanges = changedRows.length > 0;
  const pendingRows = getPendingAssignmentRows(tableData, changedRows);
  const hasPendingChanges = pendingRows.length > 0;
  const summary = getSummary(tableData, apiSummary, pendingRows.length);

  /**
   * Memoization Justification:
   * - Reconciles the server teacher list with every editable table row.
   * - Keeps one stable option collection for all assignment dropdowns until draft state changes.
   */
  const draftEligibleTeachers = useMemo(
    () => applyDraftTeacherWorkloads(eligibleTeachers, tableData, originalTableData),
    [eligibleTeachers, originalTableData, tableData]
  );

  const filteredData = tableData.filter((row) => {
    const text = `${row.className} ${row.divisionName} ${row.classTeacherName}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'assigned' && !!row.classTeacher) ||
      (statusFilter === 'unassigned' && !row.classTeacher) ||
      (statusFilter === 'conflict' && row.conflictCount > 0) ||
      (statusFilter === 'changed' &&
        pendingRows.some((pendingRow) => getRowKey(pendingRow) === getRowKey(row))) ||
      (statusFilter === 'temporary' && row.assignmentTypeDraft === 'Temporary');
    return matchesSearch && matchesFilter;
  });

  const summaryCards: ITimetableSummaryCard[] = useMemo(
    () => [
      {
        label: 'Total Classes',
        value: summary.totalClasses,
        icon: 'mdi:school',
        color: 'primary',
        onClick: () => setStatusFilter('all'),
        isActive: statusFilter === 'all',
      },
      {
        label: 'Assigned',
        value: summary.assigned,
        icon: 'mdi:check-circle-outline',
        color: 'success',
        onClick: () => setStatusFilter('assigned'),
        isActive: statusFilter === 'assigned',
      },
      {
        label: 'Unassigned',
        value: summary.unassigned,
        icon: 'mdi:clock-alert-outline',
        color: 'warning',
        onClick: () => setStatusFilter('unassigned'),
        isActive: statusFilter === 'unassigned',
      },
      {
        label: 'Conflicts',
        value: summary.conflicts,
        icon: 'mdi:alert-circle-outline',
        color: 'error',
        onClick: () => setStatusFilter('conflict'),
        isActive: statusFilter === 'conflict',
      },
      {
        label: 'Pending Changes',
        value: summary.pendingChanges,
        icon: 'mdi:square-edit-outline',
        color: 'info',
        onClick: () => setStatusFilter('changed'),
        isActive: statusFilter === 'changed',
      },
      {
        label: 'Temporary',
        value: summary.temporaryAssignments,
        icon: 'mdi:clock-outline',
        color: 'info',
        onClick: () => setStatusFilter('temporary'),
        isActive: statusFilter === 'temporary',
      },
    ],
    [summary, statusFilter]
  );

  const TABS = useMemo(
    () => [
      { label: 'All', value: 'all', count: summary.totalClasses, color: 'default' as LabelColor },
      { label: 'Assigned', value: 'assigned', count: summary.assigned, color: 'success' as LabelColor },
      { label: 'Unassigned', value: 'unassigned', count: summary.unassigned, color: 'warning' as LabelColor },
      { label: 'Conflicts', value: 'conflict', count: summary.conflicts, color: 'error' as LabelColor },
      { label: 'Pending Changes', value: 'changed', count: summary.pendingChanges, color: 'info' as LabelColor },
      { label: 'Temporary', value: 'temporary', count: summary.temporaryAssignments, color: 'info' as LabelColor },
    ],
    [summary]
  );

  const buildPayload = (saveAsDraft: boolean) => ({
    organizationId: organization,
    saveAsDraft,
    assignments: tableData
      .filter((row) => row.classTeacher)
      .map((row) => ({
        classId: row.classId,
        divisionId: row.divisionId,
        teacherId: row.classTeacher as string,
        assignmentType: row.assignmentTypeDraft,
        effectiveFrom: row.effectiveFromDraft,
        changeReason: row.changeReasonDraft,
      })),
  });

  const updateRow = (rowKey: string, patch: Partial<AssignmentTableRow>) => {
    setTableData((prev) =>
      prev.map((row) => (getRowKey(row) === rowKey ? { ...row, ...patch } : row))
    );
  };

  const handleTeacherChange = (
    row: AssignmentTableRow,
    teacher: ClassTeacherEligibleTeacher | null
  ) => {
    updateRow(getRowKey(row), {
      classTeacher: teacher?.teacherId ?? null,
      classTeacherName: teacher?.teacherName ?? '',
      assignedTeacher: teacher
        ? {
          teacherId: teacher.teacherId,
          teacherName: teacher.teacherName,
          employeeCode: teacher.employeeCode,
          department: teacher.department,
          isActive: teacher.isActive,
          currentClassTeacherCount: teacher.currentClassTeacherCount,
          maximumClassTeacherCount: teacher.maximumClassTeacherCount,
          availabilityStatus: teacher.availabilityStatus,
          workloadStatus: teacher.workloadStatus,
          conflictStatus: teacher.conflictStatus,
          recommendationScore: teacher.recommendationScore,
        }
        : null,
      assignmentStatus: teacher ? 'Changed' : 'Unassigned',
    });
  };

  const handleDiscard = () => {
    setTableData(JSON.parse(JSON.stringify(originalTableData)));
    setDiscardOpen(false);
    shikshaMitraToast.success({ message: 'Draft changes discarded.' });
  };

  const handleOrganizationChange = (value: string) => {
    if (hasChanges) {
      setPendingOrganization(value);
      setSwitchOpen(true);
      return;
    }
    setOrganization(value);
  };

  const confirmOrganizationSwitch = () => {
    if (pendingOrganization) {
      setOrganization(pendingOrganization);
      setPendingOrganization(null);
    }
    setSwitchOpen(false);
  };

  const handleSaveDraft = async () => {
    if (!organization) return;
    try {
      await updateAssignments(buildPayload(true)).unwrap();
      shikshaMitraToast.success({ message: 'Class teacher draft saved.' });
      await refetchAssignments();
    } catch {
      shikshaMitraToast.error({ message: 'Draft could not be saved. Please review conflicts.' });
    }
  };

  const handleReview = async () => {
    if (!hasPendingChanges) return;
    try {
      const result = await validateAssignments(buildPayload(false)).unwrap();
      setValidationResult(result);
      setReviewOpen(true);
    } catch {
      shikshaMitraToast.error({ message: 'Validation failed. Please try again.' });
    }
  };

  const handleConfirm = async () => {
    try {
      await updateAssignments(buildPayload(false)).unwrap();
      shikshaMitraToast.success({ message: 'Class teacher assignments confirmed.' });
      setReviewOpen(false);
      await refetchAssignments();
    } catch {
      shikshaMitraToast.error({ message: 'Assignments could not be confirmed.' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Class Teacher Assignment"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Class Teacher Assignment' },
        ]}
        description="Assign and manage class teachers while checking workload, availability, conflicts, and continuity."
      />

      {/* Organization Bar */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper', boxShadow: 'var(--shadows-3)' }}
      >
        <CustomSelect
          options={allOrganization}
          label="Organization *"
          value={organization}
          onChange={(val) => handleOrganizationChange(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: 280, width: '100%' } }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
          <Button size="small" variant="outlined" startIcon={<History />} onClick={() => setHistoryOpen(true)}>
            History
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RestartAlt />}
            disabled={!hasChanges}
            onClick={() => setDiscardOpen(true)}
          >
            Discard Changes
          </Button>
          <LoadingButton
            size="small"
            variant="outlined"
            startIcon={<Save />}
            disabled={!hasChanges}
            loading={isSaving}
            onClick={handleSaveDraft}
          >
            Save Draft
          </LoadingButton>
          <LoadingButton
            size="small"
            variant="contained"
            startIcon={<FactCheck />}
            disabled={!hasPendingChanges}
            loading={isValidating}
            onClick={handleReview}
          >
            Review & Confirm
          </LoadingButton>
        </Stack>
      </Stack>

      {/* Allocation Status Alert */}
      <Alert severity={summary.status === 'Ready' ? 'success' : 'warning'} sx={{ borderRadius: 2, py: 0.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <Typography variant="body2" fontWeight={700}>
            Allocation Status: {summary.status}
          </Typography>
          <Typography variant="body2">
            {summary.reasons.length ? summary.reasons.join(' ') : 'All class divisions are assigned.'}
          </Typography>
        </Stack>
      </Alert>

      {/* ── Sticky Tabs Card (Matching Substitution Management) ── */}
      <Card
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderRadius: 1,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={statusFilter}
            onChange={(_, value) => setStatusFilter(value as string)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}{' '}
                    <Label color={tab.color} variant={statusFilter === tab.value ? 'filled' : 'soft'}>
                      {tab.count}
                    </Label>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Stack>
      </Card>

      {/* ── Table Container ─────────────────────────── */}
      <Box sx={{ flexGrow: 1, minHeight: 0, height: '100%', overflow: 'auto' }}>
        <CustomizableTable
          tableId="assignTeacherTable"
          isLoading={isClassAssignmentLoading || isClassAssignmentFetching}
          noDataText={<>No class divisions found for this organization.</>}
          columns={[
            { id: 'className', label: 'Class', align: 'left', minWidth: 120, sticky: true, filterType: 'string' },
            { id: 'divisionName', label: 'Division', align: 'left', minWidth: 120, sticky: true, filterType: 'string' },
            { id: 'studentCount', label: 'Students', align: 'left', minWidth: 100, filterType: 'number' },
            {
              id: 'classTeacher',
              label: 'Current Class Teacher',
              isSort: false,
              isFilter: false,
              align: 'left',
              minWidth: 340,
              render: (_: unknown, row) => {
                const typedRow = row as unknown as AssignmentTableRow;
                return (
                  <TeacherAssignmentCell
                    row={typedRow}
                    teachers={draftEligibleTeachers}
                    onChange={(teacher) => handleTeacherChange(typedRow, teacher)}
                  />
                );
              },
            },
            {
              id: 'workload',
              label: 'Workload',
              isSort: false,
              isFilter: false,
              minWidth: 140,
              render: (_: unknown, row) => {
                const typedRow = row as unknown as AssignmentTableRow;
                const workload = getDraftTeacherWorkload(
                  draftEligibleTeachers,
                  typedRow.classTeacher,
                  typedRow.assignedTeacher
                );
                const countText = workload
                  ? `${workload.currentClassTeacherCount}/${workload.maximumClassTeacherCount} classes`
                  : 'Unassigned';
                const color: LabelColor = !workload
                  ? 'default'
                  : workload.workloadStatus === 'Exceeded'
                    ? 'error'
                    : workload.workloadStatus === 'High'
                      ? 'warning'
                      : 'info';
                return <Label color={color}>{countText}</Label>;
              },
            },
            {
              id: 'availability',
              label: 'Availability',
              isSort: false,
              isFilter: false,
              minWidth: 130,
              render: (_: unknown, row) => {
                const typedRow = row as unknown as AssignmentTableRow;
                const status = typedRow.assignedTeacher?.availabilityStatus || 'Unassigned';
                const color: LabelColor = typedRow.assignedTeacher?.isActive ? 'success' : 'default';
                return <Label color={color}>{status}</Label>;
              },
            },
            {
              id: 'effectiveFromDraft',
              label: 'Effective From',
              isSort: false,
              isFilter: false,
              minWidth: 170,
              render: (_: unknown, row) => {
                const typedRow = row as unknown as AssignmentTableRow;
                return (
                  <DatePicker
                    value={typedRow.effectiveFromDraft ? dayjs(typedRow.effectiveFromDraft) : null}
                    onChange={(newValue) =>
                      updateRow(getRowKey(typedRow), {
                        effectiveFromDraft: newValue?.isValid() ? newValue.format('YYYY-MM-DD') : '',
                      })
                    }
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small', sx: { width: 155 } } }}
                  />
                );
              },
            },
            {
              id: 'assignmentTypeDraft',
              label: 'Assignment Type',
              isSort: false,
              isFilter: false,
              minWidth: 180,
              render: (_: unknown, row) => {
                const typedRow = row as unknown as AssignmentTableRow;
                return (
                  <ClassTeacherAssignmentParameterSelect
                    ariaLabel={`${typedRow.className} ${typedRow.divisionName} Assignment Type`}
                    options={assignmentTypes}
                    value={typedRow.assignmentTypeDraft}
                    onChange={(value) =>
                      updateRow(getRowKey(typedRow), { assignmentTypeDraft: value })
                    }
                  />
                );
              },
            },
            {
              id: 'changeReasonDraft',
              label: 'Change Reason',
              isSort: false,
              isFilter: false,
              minWidth: 220,
              render: (_: unknown, row) => {
                const typedRow = row as unknown as AssignmentTableRow;
                return (
                  <ClassTeacherAssignmentParameterSelect
                    ariaLabel={`${typedRow.className} ${typedRow.divisionName} Change Reason`}
                    options={changeReasons}
                    value={typedRow.changeReasonDraft}
                    onChange={(value) =>
                      updateRow(getRowKey(typedRow), { changeReasonDraft: value })
                    }
                  />
                );
              },
            },
            {
              id: 'assignmentStatus',
              label: 'Status',
              minWidth: 130,
              filterType: 'enum',
              enumOptions: [
                { label: 'Assigned', value: 'Assigned' },
                { label: 'Unassigned', value: 'Unassigned' },
                { label: 'Changed', value: 'Changed' },
              ],
              render: (_: unknown, row) => {
                const typedRow = row as unknown as AssignmentTableRow;
                const statusColor = getClassTeacherAssignmentStatusColor(typedRow.assignmentStatus);
                return <Label color={statusColor}>{typedRow.assignmentStatus}</Label>;
              },
            },
          ]}
          data={filteredData}
        />
      </Box>

      <ReviewDrawer
        open={reviewOpen}
        validation={validationResult}
        changedRows={pendingRows}
        isSaving={isSaving}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleConfirm}
      />

      <Drawer
        anchor="right"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            display: 'flex',
            flexDirection: 'column',
            p: 0,
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700}>
              Assignment History
            </Typography>
            <CustomTooltip
              arrow
              placement="bottom-start"
              title={
                <Box sx={{ p: 1, maxWidth: 300 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                    Audit Trail
                  </Typography>
                  <Typography variant="caption" display="block">
                    Historical log of class teacher reassignments, change reasons, and audit timelines for this organization.
                  </Typography>
                </Box>
              }
            >
              <IconButton size="small" color="info">
                <Iconify icon="lucide:info" width={18} />
              </IconButton>
            </CustomTooltip>
          </Box>
          <IconButton onClick={() => setHistoryOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content Body */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
          <Stack spacing={1.5}>
            {history.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No assignment history found.
              </Typography>
            )}
            {history.map((item) => (
              <Paper
                key={`${item.classId}-${item.divisionId}-${item.changedAt}`}
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.className} {item.divisionName}
                  </Typography>
                  <Label color="info" variant="soft">
                    {dayjs(item.changedAt).isValid() ? dayjs(item.changedAt).format('DD-MM-YYYY') : '-'}
                  </Label>
                </Stack>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {item.newTeacherName || 'Teacher not available'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Reason: {item.changeReason || 'Routine Update'} • Changed by: {item.changedBy || 'System'}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Sticky Bottom Action Bar */}
        <Box
          sx={{
            p: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button variant="outlined" color="inherit" size="small" startIcon={<CloseIcon />} onClick={() => setHistoryOpen(false)}>
            Close
          </Button>
        </Box>
      </Drawer>

      <ConfirmDialog
        title="Discard Changes"
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        content="Discard the unsaved assignment changes and restore the last saved values?"
        action={
          <Button size="small" variant="contained" color="error" onClick={handleDiscard}>
            Discard
          </Button>
        }
      />

      <ConfirmDialog
        title="Unsaved Changes"
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
        content="Changing organization will discard your unsaved assignment changes."
        action={
          <Button size="small" variant="contained" color="warning" onClick={confirmOrganizationSwitch}>
            Continue
          </Button>
        }
      />
    </Box>
  );
};

export default ClassTeacherAssignment;
