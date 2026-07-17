'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type {
  ClassTeacherSummary,
  ClassTeacherEligibleTeacher,
  ClassTeacherValidationResult,
  ClassTeacherAssignmentRowDto,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Save, History, FactCheck, RestartAlt, AssignmentTurnedIn } from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Drawer,
  Avatar,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
import { useState, useEffect } from 'react';

import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetClassTeacherAssignmentsQuery,
  useGetClassTeacherAssignmentHistoryQuery,
  useGetClassTeacherAssignmentSummaryQuery,
  useGetClassTeacherEligibleTeachersQuery,
  useValidateClassTeacherAssignmentsMutation,
  useUpdateClassTeacherAssignmentsMutation,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

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
    ...(pendingChanges ? [`${pendingChanges} unsaved changes are waiting.`] : []),
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
              <Chip
                size="small"
                label={`${option.currentClassTeacherCount}/${option.maximumClassTeacherCount} classes`}
              />
              <Chip size="small" label={option.workloadStatus} color="default" />
              <Chip
                size="small"
                label={option.availabilityStatus}
                color={option.isActive ? 'success' : 'error'}
              />
              <Chip size="small" label={`${option.recommendationScore}% match`} />
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

const SummaryCards = ({
  summary,
  activeFilter,
  onFilter,
}: {
  summary: ClassTeacherSummary;
  activeFilter: string;
  onFilter: (filter: string) => void;
}) => {
  const cards = [
    { key: 'all', label: 'Total Classes', value: summary.totalClasses },
    { key: 'assigned', label: 'Assigned', value: summary.assigned },
    { key: 'unassigned', label: 'Unassigned', value: summary.unassigned },
    { key: 'conflict', label: 'Conflicts', value: summary.conflicts },
    { key: 'changed', label: 'Pending Changes', value: summary.pendingChanges },
    { key: 'temporary', label: 'Temporary', value: summary.temporaryAssignments },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 1,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          role="button"
          tabIndex={0}
          onClick={() => onFilter(card.key)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onFilter(card.key);
          }}
          sx={{
            p: 1.25,
            borderRadius: 1,
            cursor: 'pointer',
            border: activeFilter === card.key ? '1px solid' : '1px solid transparent',
            borderColor: activeFilter === card.key ? 'primary.main' : 'transparent',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {card.label}
          </Typography>
          <Typography variant="h6">{card.value}</Typography>
        </Card>
      ))}
    </Box>
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
  <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 460, p: 2 } }}>
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Review & Confirm</Typography>
        <Typography variant="body2" color="text.secondary">
          Check assignment impact before publishing the latest class teacher allocation.
        </Typography>
      </Box>
      <Alert severity={validation?.canConfirm ? 'success' : 'error'}>
        {validation?.canConfirm
          ? 'No critical errors found. You can confirm these assignments.'
          : 'Critical issues must be fixed before confirmation.'}
      </Alert>
      <Card sx={{ p: 1.5 }}>
        <Typography variant="subtitle2">Changed Assignments</Typography>
        <Stack spacing={1} mt={1}>
          {changedRows.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No local changes to review.
            </Typography>
          )}
          {changedRows.map((row) => (
            <Box key={getRowKey(row)}>
              <Typography variant="body2" fontWeight={700}>
                {row.className} {row.divisionName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.classTeacherName || 'Teacher selected'} · {row.assignmentTypeDraft} ·{' '}
                {row.effectiveFromDraft}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Card>
      <Card sx={{ p: 1.5 }}>
        <Typography variant="subtitle2">Validation Issues</Typography>
        <Stack spacing={1} mt={1}>
          {validation?.issues.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No issues found.
            </Typography>
          )}
          {validation?.issues.map((issue) => (
            <Alert
              key={`${issue.code}-${issue.classId}-${issue.divisionId}-${issue.teacherId}`}
              severity={issue.severity === 'Critical' ? 'error' : 'warning'}
              sx={{ py: 0.5 }}
            >
              <Typography variant="body2">{issue.message}</Typography>
              {issue.suggestedFix && (
                <Typography variant="caption">{issue.suggestedFix}</Typography>
              )}
            </Alert>
          ))}
        </Stack>
      </Card>
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={onClose}>
          Close
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          startIcon={<AssignmentTurnedIn />}
          loading={isSaving}
          disabled={!validation?.canConfirm || changedRows.length === 0}
          onClick={onConfirm}
        >
          Confirm
        </LoadingButton>
      </Stack>
    </Stack>
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
  const summary = getSummary(tableData, apiSummary, changedRows.length);

  const filteredData = tableData.filter((row) => {
    const text = `${row.className} ${row.divisionName} ${row.classTeacherName}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'assigned' && !!row.classTeacher) ||
      (statusFilter === 'unassigned' && !row.classTeacher) ||
      (statusFilter === 'conflict' && row.conflictCount > 0) ||
      (statusFilter === 'changed' &&
        changedRows.some((changedRow) => getRowKey(changedRow) === getRowKey(row))) ||
      (statusFilter === 'temporary' && row.assignmentTypeDraft === 'Temporary');
    return matchesSearch && matchesFilter;
  });

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
    if (!hasChanges) return;
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Class Teacher Assignment"
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Class Teacher Assignment' },
        ]}
        description="Assign and manage class teachers while checking workload, availability, conflicts, and continuity."
      />

      <Card sx={{ p: 1.25 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
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
              disabled={!hasChanges}
              loading={isValidating}
              onClick={handleReview}
            >
              Review & Confirm
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>

      <SummaryCards summary={summary} activeFilter={statusFilter} onFilter={setStatusFilter} />

      <Alert severity={summary.status === 'Ready' ? 'success' : 'warning'}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <Typography variant="body2" fontWeight={700}>
            Allocation Status: {summary.status}
          </Typography>
          <Typography variant="body2">
            {summary.reasons.length ? summary.reasons.join(' ') : 'All class divisions are assigned.'}
          </Typography>
        </Stack>
      </Alert>

      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            label="Search class, division, or teacher"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: { xs: '100%', md: 320 } }}
          />
          <TextField
            select
            size="small"
            label="Assignment Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{ width: { xs: '100%', md: 220 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
            <MenuItem value="conflict">Conflicts</MenuItem>
            <MenuItem value="changed">Pending Changes</MenuItem>
            <MenuItem value="temporary">Temporary</MenuItem>
          </TextField>
          <Button size="small" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
            Clear Filters
          </Button>
        </Stack>
      </Card>

      <CustomizableTable
        tableId="assignTeacherTable"
        isLoading={isClassAssignmentLoading || isClassAssignmentFetching}
        noDataText={<>No class divisions found for this organization.</>}
        columns={[
          { id: 'className', label: 'Class', align: 'left', minWidth: 120 },
          { id: 'divisionName', label: 'Division', align: 'left', minWidth: 120 },
          { id: 'studentCount', label: 'Students', align: 'left', minWidth: 100 },
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
                  teachers={eligibleTeachers}
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
            minWidth: 160,
            render: (_: unknown, row) => {
              const typedRow = row as unknown as AssignmentTableRow;
              return (
                <Stack spacing={0.5}>
                  <Chip
                    size="small"
                    label={
                      typedRow.assignedTeacher
                        ? `${typedRow.assignedTeacher.currentClassTeacherCount}/${typedRow.assignedTeacher.maximumClassTeacherCount} classes`
                        : 'No teacher'
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {typedRow.assignedTeacher?.workloadStatus || 'Unassigned'}
                  </Typography>
                </Stack>
              );
            },
          },
          {
            id: 'availability',
            label: 'Availability',
            isSort: false,
            isFilter: false,
            minWidth: 140,
            render: (_: unknown, row) => {
              const typedRow = row as unknown as AssignmentTableRow;
              return (
                <Chip
                  size="small"
                  label={typedRow.assignedTeacher?.availabilityStatus || 'Unassigned'}
                  color={typedRow.assignedTeacher?.isActive ? 'success' : 'default'}
                />
              );
            },
          },
          {
            id: 'assignmentStatus',
            label: 'Status',
            minWidth: 150,
            render: (_: unknown, row) => {
              const typedRow = row as unknown as AssignmentTableRow;
              return (
                <Stack spacing={0.5}>
                  <Chip
                    size="small"
                    label={typedRow.assignmentStatus}
                    color={typedRow.conflictCount ? 'error' : typedRow.classTeacher ? 'success' : 'warning'}
                  />
                  {typedRow.conflictCount > 0 && (
                    <Typography variant="caption" color="error">
                      {typedRow.conflictCount} issue(s)
                    </Typography>
                  )}
                </Stack>
              );
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
                <TextField
                  size="small"
                  type="date"
                  value={typedRow.effectiveFromDraft}
                  onChange={(event) =>
                    updateRow(getRowKey(typedRow), { effectiveFromDraft: event.target.value })
                  }
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
                <TextField
                  select
                  size="small"
                  value={typedRow.assignmentTypeDraft}
                  onChange={(event) =>
                    updateRow(getRowKey(typedRow), { assignmentTypeDraft: event.target.value })
                  }
                  fullWidth
                >
                  {assignmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
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
                <TextField
                  select
                  size="small"
                  value={typedRow.changeReasonDraft}
                  onChange={(event) =>
                    updateRow(getRowKey(typedRow), { changeReasonDraft: event.target.value })
                  }
                  fullWidth
                >
                  {changeReasons.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {reason}
                    </MenuItem>
                  ))}
                </TextField>
              );
            },
          },
        ]}
        data={filteredData}
      />

      <ReviewDrawer
        open={reviewOpen}
        validation={validationResult}
        changedRows={changedRows}
        isSaving={isSaving}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleConfirm}
      />

      <Drawer
        anchor="right"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        PaperProps={{ sx: { width: 420, p: 2 } }}
      >
        <Typography variant="h6">Assignment History</Typography>
        <Typography variant="body2" color="text.secondary">
          Current assignment audit trail for this organization.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          {history.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No assignment history found.
            </Typography>
          )}
          {history.map((item) => (
            <Card key={`${item.classId}-${item.divisionId}-${item.changedAt}`} sx={{ p: 1.25 }}>
              <Typography variant="subtitle2">
                {item.className} {item.divisionName}
              </Typography>
              <Typography variant="body2">{item.newTeacherName || 'Teacher not available'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.changeReason} · {new Date(item.changedAt).toLocaleDateString('en-GB')} ·{' '}
                {item.changedBy}
              </Typography>
            </Card>
          ))}
        </Stack>
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
