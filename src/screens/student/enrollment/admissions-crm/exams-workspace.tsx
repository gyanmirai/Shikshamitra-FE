'use client';

import type { ComponentProps } from 'react';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmEntranceExamDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Switch,
  Divider,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  EntranceExamStatusEnum,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
  useGetAdmissionCrmEntranceExamsQuery,
  useUploadAdmissionCrmExamResultMutation,
  useDecideAdmissionCrmEligibilityMutation,
  useGetAdmissionCrmCycleConfigurationQuery,
  useGetAdmissionCrmEligibilityHandoffQuery,
  useMarkAdmissionCrmExamAttendanceMutation,
  useBulkUploadAdmissionCrmExamResultsMutation,
  useBulkMarkAdmissionCrmExamAttendanceMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { admissionCrmEligibilityLabels } from './admissions-crm-utils';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantWorkspaceDrawer } from './applicant-workspace-drawer';
import {
  enrollmentActionsColumn,
  enrollmentTableWrapperSx,
  enrollmentWorkspaceRootSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import type { ApplicantDrawerTab } from './applicant-workspace-drawer';

const pageSize = 50;
const attendanceLabels: Record<AdmissionCrmExamAttendanceStatus, string> = {
  [AdmissionCrmExamAttendanceStatus.NotMarked]: 'Not Marked',
  [AdmissionCrmExamAttendanceStatus.Present]: 'Present',
  [AdmissionCrmExamAttendanceStatus.Absent]: 'Absent',
};
const resultLabels: Record<EntranceExamStatusEnum, string> = {
  [EntranceExamStatusEnum.Pending]: 'Pending',
  [EntranceExamStatusEnum.Pass]: 'Pass',
  [EntranceExamStatusEnum.Fail]: 'Fail',
  [EntranceExamStatusEnum.Absent]: 'Absent',
};
const attendanceColors: Record<AdmissionCrmExamAttendanceStatus, LabelColor> = {
  [AdmissionCrmExamAttendanceStatus.NotMarked]: 'default',
  [AdmissionCrmExamAttendanceStatus.Present]: 'success',
  [AdmissionCrmExamAttendanceStatus.Absent]: 'error',
};
const resultColors: Record<EntranceExamStatusEnum, LabelColor> = {
  [EntranceExamStatusEnum.Pending]: 'default',
  [EntranceExamStatusEnum.Pass]: 'success',
  [EntranceExamStatusEnum.Fail]: 'error',
  [EntranceExamStatusEnum.Absent]: 'warning',
};
const eligibilityColors: Record<AdmissionCrmEligibilityDecision, LabelColor> = {
  [AdmissionCrmEligibilityDecision.Pending]: 'default',
  [AdmissionCrmEligibilityDecision.Eligible]: 'success',
  [AdmissionCrmEligibilityDecision.Waitlisted]: 'warning',
  [AdmissionCrmEligibilityDecision.Rejected]: 'error',
};
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const accessibleStatusSx = { color: 'text.primary' } as const;

const getLatestEnumFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter ? Number(filter.value) : undefined;
};

const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter?.value ? String(filter.value) : undefined;
};

const getDateFilterBounds = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  if (!filter || typeof filter.value !== 'string') return {};
  const [day, month, year] = filter.value.split('-').map(Number);
  if (!day || !month || !year) return {};
  const value = new Date(Date.UTC(year, month - 1, day));
  if (filter.type === 'after') {
    value.setUTCDate(value.getUTCDate() + 1);
    return { from: value.toISOString() };
  }
  if (filter.type === 'before') {
    value.setUTCDate(value.getUTCDate() - 1);
    return { until: value.toISOString() };
  }
  const iso = value.toISOString();
  return { from: iso, until: iso };
};

type ExamRowActionsProps = {
  exam: AdmissionCrmEntranceExamDto;
  openApplicant: (leadId: string, tab?: ApplicantDrawerTab) => void;
  setSelectedExam: (exam: AdmissionCrmEntranceExamDto) => void;
  setHandoffExamId: (examId: string) => void;
};

type ThreeDotsActionRenderer = NonNullable<ComponentProps<typeof ThreeDotsActions>['actions']>;

const ExamRowActions = memo(
  ({ exam, openApplicant, setSelectedExam, setHandoffExamId }: ExamRowActionsProps) => {
    const renderActions = useCallback<ThreeDotsActionRenderer>(
      ({ popover }) => (
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              setHandoffExamId(exam.id);
            }}
          >
            <Iconify icon="mdi:account-arrow-right-outline" />
            Eligibility Handoff
          </MenuItem>
          {exam.eligibilityDecision === AdmissionCrmEligibilityDecision.Eligible ? (
            <MenuItem
              onClick={() => {
                popover.onClose();
                openApplicant(exam.leadId, 'registration');
              }}
            >
              <Iconify icon="mdi:file-document-edit-outline" />
              Open Registration
            </MenuItem>
          ) : null}
        </MenuList>
      ),
      [exam, openApplicant, setHandoffExamId]
    );

    return (
      <ThreeDotsActions
        placement="right-top"
        showViewIcon
        viewLabel="Open Exam"
        handleViewClick={() => setSelectedExam(exam)}
        showEditIcon
        editLabel="Manage Exam"
        handleEditClick={() => setSelectedExam(exam)}
        onEditMouseDown={() => setSelectedExam(exam)}
        actions={renderActions}
      />
    );
  }
);

export function ExamsWorkspace() {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const { academicYearId, state, updateState, openApplicant, closeApplicant } =
    useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<AdmissionCrmEntranceExamDto | null>(null);
  const [bulkMarksOpen, setBulkMarksOpen] = useState(false);
  const [handoffExamId, setHandoffExamId] = useState('');
  const [attendance, setAttendance] = useState(AdmissionCrmExamAttendanceStatus.NotMarked);
  const [totalMarks, setTotalMarks] = useState('100');
  const [passingMarks, setPassingMarks] = useState('40');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [meritRank, setMeritRank] = useState('');
  const [eligibility, setEligibility] = useState(AdmissionCrmEligibilityDecision.Pending);
  const [decisionReason, setDecisionReason] = useState('');
  const [overrideDecision, setOverrideDecision] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [bulkTotalMarks, setBulkTotalMarks] = useState('100');
  const [bulkPassingMarks, setBulkPassingMarks] = useState('40');
  const [bulkObtainedMarks, setBulkObtainedMarks] = useState('');
  const [bulkMeritRank, setBulkMeritRank] = useState('');

  const examsQuery = useGetAdmissionCrmEntranceExamsQuery(
    {
      academicYearId: academicYearId || '',
      filterText: search.trim() || undefined,
      applicantSearch: getLatestStringFilter(columnFilters, 'applicantName'),
      examStartFrom: getDateFilterBounds(columnFilters, 'examStartTime').from,
      examStartUntil: getDateFilterBounds(columnFilters, 'examStartTime').until,
      attendanceStatus: state.attendance,
      examStatus: state.examStatus,
      eligibilityDecision: state.eligibility,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
      sorting: state.sorting || 'ExamStartTime ASC',
    },
    { skip: !academicYearId }
  );
  const [markAttendance, markAttendanceState] = useMarkAdmissionCrmExamAttendanceMutation();
  const [bulkMarkAttendance, bulkAttendanceState] = useBulkMarkAdmissionCrmExamAttendanceMutation();
  const [bulkUploadResults, bulkResultsState] = useBulkUploadAdmissionCrmExamResultsMutation();
  const [uploadResult, uploadResultState] = useUploadAdmissionCrmExamResultMutation();
  const [decideEligibility, decideEligibilityState] = useDecideAdmissionCrmEligibilityMutation();
  const handoffQuery = useGetAdmissionCrmEligibilityHandoffQuery(
    { examRecordId: handoffExamId },
    { skip: !handoffExamId }
  );
  const cycleConfigurationQuery = useGetAdmissionCrmCycleConfigurationQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const entranceExamRequired = cycleConfigurationQuery.data?.entranceExamRequired !== false;

  useEffect(() => {
    if (!selectedExam) return;
    setAttendance(selectedExam.attendanceStatus);
    setTotalMarks(selectedExam.totalMarks?.toString() || '100');
    setPassingMarks(selectedExam.passingMarks?.toString() || '40');
    setObtainedMarks(selectedExam.obtainedMarks?.toString() || '');
    setMeritRank(selectedExam.meritRank?.toString() || '');
    setEligibility(selectedExam.eligibilityDecision);
    setDecisionReason(selectedExam.eligibilityDecisionReason || '');
    setOverrideDecision(false);
    setOverrideReason('');
  }, [selectedExam]);

  useEffect(() => {
    setSelectedExamIds([]);
  }, [state.page, state.attendance, state.examStatus, state.eligibility]);

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      const updated = (await action()) as AdmissionCrmEntranceExamDto;
      setSelectedExam(updated);
      shikshaMitraToast.success({ message });
    } catch {
      shikshaMitraToast.error({
        message: 'The exam record could not be updated. Review the fields and retry.',
      });
    }
  };

  const tableFilters = useMemo<IParams['filters']>(
    () => [
      ...(state.attendance == null
        ? []
        : [
            {
              column: 'attendanceStatus',
              type: 'equals',
              value: state.attendance,
              valueType: 'enum',
              label: 'Attendance',
              displayValue: attendanceLabels[state.attendance as AdmissionCrmExamAttendanceStatus],
            },
          ]),
      ...(state.examStatus == null
        ? []
        : [
            {
              column: 'examStatus',
              type: 'equals',
              value: state.examStatus,
              valueType: 'enum',
              label: 'Result',
              displayValue: resultLabels[state.examStatus as EntranceExamStatusEnum],
            },
          ]),
      ...(state.eligibility == null
        ? []
        : [
            {
              column: 'eligibilityDecision',
              type: 'equals',
              value: state.eligibility,
              valueType: 'enum',
              label: 'Eligibility',
              displayValue:
                admissionCrmEligibilityLabels[state.eligibility as AdmissionCrmEligibilityDecision],
            },
          ]),
    ],
    [state.attendance, state.eligibility, state.examStatus]
  );

  const exams = useMemo(() => examsQuery.data?.items || [], [examsQuery.data?.items]);
  const selectedExamSet = useMemo(() => new Set(selectedExamIds), [selectedExamIds]);

  const markSelectedAttendance = async (value: AdmissionCrmExamAttendanceStatus) => {
    if (!academicYearId || selectedExamIds.length === 0) return;
    try {
      const result = await bulkMarkAttendance({
        academicYearId,
        examRecordIds: selectedExamIds,
        attendanceStatus: value,
      }).unwrap();
      if (result.failedCount > 0) {
        setSelectedExamIds(
          result.items.filter((item) => !item.success).map((item) => item.entityId)
        );
        shikshaMitraToast.error({
          message: `${result.succeededCount} updated; ${result.failedCount} failed and remain selected.`,
        });
        return;
      }
      setSelectedExamIds([]);
      shikshaMitraToast.success({
        message: `${result.succeededCount} exam attendance record${result.succeededCount === 1 ? '' : 's'} updated.`,
      });
    } catch {
      shikshaMitraToast.error({ message: 'The selected exam attendance could not be updated.' });
    }
  };

  const uploadSelectedResults = async () => {
    if (!academicYearId || selectedExamIds.length === 0) return;
    try {
      const result = await bulkUploadResults({
        academicYearId,
        examRecordIds: selectedExamIds,
        totalMarks: Number(bulkTotalMarks),
        passingMarks: Number(bulkPassingMarks),
        obtainedMarks: Number(bulkObtainedMarks),
        meritRank: bulkMeritRank ? Number(bulkMeritRank) : undefined,
      }).unwrap();
      if (result.failedCount > 0) {
        setSelectedExamIds(
          result.items.filter((item) => !item.success).map((item) => item.entityId)
        );
        shikshaMitraToast.error({
          message: `${result.succeededCount} updated; ${result.failedCount} failed and remain selected.`,
        });
        return;
      }
      setBulkMarksOpen(false);
      setBulkObtainedMarks('');
      setBulkMeritRank('');
      setSelectedExamIds([]);
      shikshaMitraToast.success({
        message: `${result.succeededCount} exam result${result.succeededCount === 1 ? '' : 's'} recorded.`,
      });
    } catch {
      shikshaMitraToast.error({ message: 'The selected exam results could not be recorded.' });
    }
  };

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'selection',
        label: '',
        width: 56,
        minWidth: 56,
        maxWidth: 56,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        renderColumn: () => (
          <Checkbox
            size="small"
            checked={exams.length > 0 && exams.every((exam) => selectedExamSet.has(exam.id))}
            indeterminate={
              selectedExamIds.length > 0 && !exams.every((exam) => selectedExamSet.has(exam.id))
            }
            onChange={(_event, checked) =>
              setSelectedExamIds(checked ? exams.map((exam) => exam.id) : [])
            }
            inputProps={{ 'aria-label': 'Select visible entrance exams' }}
          />
        ),
        render: (_value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <Checkbox
              size="small"
              checked={selectedExamSet.has(exam.id)}
              onClick={(event) => event.stopPropagation()}
              onChange={() =>
                setSelectedExamIds((current) =>
                  current.includes(exam.id)
                    ? current.filter((id) => id !== exam.id)
                    : [...current, exam.id]
                )
              }
              inputProps={{ 'aria-label': `Select ${exam.applicantName}` }}
            />
          );
        },
      },
      {
        id: 'applicantName',
        originalId: 'ApplicantName',
        label: 'Applicant',
        width: 190,
        minWidth: 180,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        filterType: 'string',
        render: (value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {value}
              </Typography>
              <Typography variant="caption" color="text.primary" noWrap>
                {exam.slotNameSnapshot || 'Exam slot'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'examStartTime',
        label: 'Exam schedule',
        width: 190,
        minWidth: 180,
        filterType: 'date',
        render: (value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Iconify icon="solar:clock-circle-bold-duotone" width={18} aria-hidden="true" />
                <Typography variant="body2">{dateTimeFormatter.format(new Date(value))}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Iconify icon="solar:door-2-bold-duotone" width={18} aria-hidden="true" />
                <Typography variant="caption" color="text.primary">
                  Room {exam.examRoomNo}
                </Typography>
              </Stack>
            </Stack>
          );
        },
      },
      {
        id: 'attendanceStatus',
        label: 'Attendance',
        width: 130,
        minWidth: 125,
        filterType: 'enum',
        enumOptions: Object.entries(attendanceLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (value) => (
          <Label
            color={attendanceColors[value as AdmissionCrmExamAttendanceStatus]}
            sx={accessibleStatusSx}
          >
            {attendanceLabels[value as AdmissionCrmExamAttendanceStatus]}
          </Label>
        ),
      },
      {
        id: 'examStatus',
        label: 'Result',
        width: 100,
        minWidth: 95,
        filterType: 'enum',
        enumOptions: Object.entries(resultLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (value) => (
          <Label color={resultColors[value as EntranceExamStatusEnum]} sx={accessibleStatusSx}>
            {resultLabels[value as EntranceExamStatusEnum]}
          </Label>
        ),
      },
      {
        id: 'obtainedMarks',
        label: 'Marks',
        width: 80,
        minWidth: 75,
        isFilter: false,
        render: (value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return value != null && exam.totalMarks != null ? `${value}/${exam.totalMarks}` : '-';
        },
      },
      {
        id: 'eligibilityDecision',
        label: 'Admission status',
        width: 150,
        minWidth: 145,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        headerSx: { px: 1.5 },
        cellSx: { px: 1.5 },
        filterType: 'enum',
        enumOptions: Object.entries(admissionCrmEligibilityLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (value) => (
          <Label
            color={eligibilityColors[value as AdmissionCrmEligibilityDecision]}
            sx={accessibleStatusSx}
          >
            {admissionCrmEligibilityLabels[value as AdmissionCrmEligibilityDecision]}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        ...enrollmentActionsColumn,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <ExamRowActions
              exam={exam}
              openApplicant={openApplicant}
              setSelectedExam={setSelectedExam}
              setHandoffExamId={setHandoffExamId}
            />
          );
        },
      },
    ],
    [exams, openApplicant, selectedExamIds.length, selectedExamSet]
  );

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="Entrance Exams"
          description="Process attendance, results, merit, and eligibility decisions from one queue."
        />
        <Alert severity="info">Select an academic year to open Entrance Exams.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="Entrance Exams"
        description="Process attendance, results, merit, and eligibility decisions from one queue."
      />

      {!entranceExamRequired ? (
        <Alert severity="info">
          Entrance exams are disabled for this admissions cycle. Applicants follow the exam-waived
          registration and admission readiness path.
        </Alert>
      ) : null}

      {entranceExamRequired && selectedExamIds.length > 0 ? (
        <Paper variant="outlined" role="region" aria-label="Bulk exam actions" sx={{ p: 1 }}>
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip color="primary" label={`${selectedExamIds.length} selected`} />
            {hasGrantedPermission(
              permissions,
              'Students.Enrollment.AdmissionsCrm.BulkOperations'
            ) ? (
              <>
                <LoadingButton
                  size="small"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.Present)}
                >
                  Mark present
                </LoadingButton>
                <LoadingButton
                  size="small"
                  color="warning"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.Absent)}
                >
                  Mark absent
                </LoadingButton>
                <Button size="small" onClick={() => setBulkMarksOpen(true)}>
                  Give Marks
                </Button>
              </>
            ) : null}
            <Button size="small" color="inherit" onClick={() => setSelectedExamIds([])}>
              Clear selection
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {entranceExamRequired && examsQuery.isError ? (
        <EnrollmentWorkspaceErrorState
          message="Entrance exams are unavailable."
          onRetry={() => examsQuery.refetch()}
        />
      ) : entranceExamRequired ? (
        <CustomizableTable
          tableId="student-enrollment-entrance-exams"
          tableTitle="Entrance Exams"
          columns={columns}
          data={exams}
          isLoading={examsQuery.isLoading}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideFilter
          defaultSearchTerm={search}
          searchFieldProps={{
            placeholder: 'Search applicant or exam slot',
            inputProps: { 'aria-label': 'Search entrance exams' },
          }}
          filters={[...tableFilters, ...columnFilters]}
          totalCount={examsQuery.data?.totalCount || 0}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onServerSearch={(value) => {
            setSearch(value);
            updateState({ page: 1 }, 'replace');
          }}
          onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
          onServerSort={(_column, sorts) => {
            const sort = sorts[0];
            updateState(
              {
                sorting: sort ? `${sort.originalId || sort.column} ${sort.direction}` : undefined,
                page: 1,
              },
              'push'
            );
          }}
          onServerFilter={(filters) => {
            const stateColumns = new Set(['attendanceStatus', 'examStatus', 'eligibilityDecision']);
            setColumnFilters(filters.filter((filter) => !stateColumns.has(filter.column)));
            updateState(
              {
                attendance: getLatestEnumFilter(filters, 'attendanceStatus'),
                examStatus: getLatestEnumFilter(filters, 'examStatus'),
                eligibility: getLatestEnumFilter(filters, 'eligibilityDecision'),
                page: 1,
              },
              'push'
            );
          }}
          noDataText={
            <EnrollmentTableEmptyState
              title="No matching exams"
              description="Change the column filters or schedule an exam from Pipeline."
            />
          }
          rowProps={(row) => ({
            'data-testid': 'student-enrollment-exam-row',
            'data-exam-id': row.id,
          })}
          wrapperProps={{ sx: enrollmentTableWrapperSx }}
          tableContainerProps={{ sx: enrollmentTableContainerSx }}
        />
      ) : null}

      <Dialog open={bulkMarksOpen} onClose={() => setBulkMarksOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Give Marks</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="info">
              Apply the same marks to {selectedExamIds.length} selected exam
              {selectedExamIds.length === 1 ? '' : 's'}.
            </Alert>
            <TextField
              label="Total marks"
              type="number"
              value={bulkTotalMarks}
              onChange={(event) => setBulkTotalMarks(event.target.value)}
            />
            <TextField
              label="Passing marks"
              type="number"
              value={bulkPassingMarks}
              onChange={(event) => setBulkPassingMarks(event.target.value)}
            />
            <TextField
              label="Obtained marks"
              type="number"
              value={bulkObtainedMarks}
              onChange={(event) => setBulkObtainedMarks(event.target.value)}
            />
            <TextField
              label="Merit rank"
              type="number"
              value={bulkMeritRank}
              onChange={(event) => setBulkMeritRank(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkMarksOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={bulkResultsState.isLoading}
            disabled={!bulkTotalMarks || !bulkPassingMarks || !bulkObtainedMarks}
            onClick={uploadSelectedResults}
          >
            Save Marks
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedExam)}
        onClose={() => setSelectedExam(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Manage Entrance Exam</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {selectedExam && (
              <Alert severity="info">
                {selectedExam.applicantName} ·{' '}
                {dateTimeFormatter.format(new Date(selectedExam.examStartTime))}
              </Alert>
            )}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Attendance
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  select
                  fullWidth
                  label="Attendance status"
                  value={attendance}
                  onChange={(event) => setAttendance(Number(event.target.value))}
                >
                  {Object.entries(attendanceLabels).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <LoadingButton
                  variant="outlined"
                  loading={markAttendanceState.isLoading}
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        markAttendance({
                          examRecordId: selectedExam.id,
                          body: { attendanceStatus: attendance },
                        }).unwrap(),
                      'Attendance recorded.'
                    )
                  }
                >
                  Save Attendance
                </LoadingButton>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Marks & Merit
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  label="Total marks"
                  type="number"
                  value={totalMarks}
                  onChange={(event) => setTotalMarks(event.target.value)}
                />
                <TextField
                  label="Passing marks"
                  type="number"
                  value={passingMarks}
                  onChange={(event) => setPassingMarks(event.target.value)}
                />
                <TextField
                  label="Obtained marks"
                  type="number"
                  value={obtainedMarks}
                  onChange={(event) => setObtainedMarks(event.target.value)}
                />
                <TextField
                  label="Merit rank"
                  type="number"
                  value={meritRank}
                  onChange={(event) => setMeritRank(event.target.value)}
                />
              </Stack>
              <LoadingButton
                variant="outlined"
                loading={uploadResultState.isLoading}
                disabled={!totalMarks || !passingMarks || !obtainedMarks}
                onClick={() =>
                  selectedExam &&
                  run(
                    () =>
                      uploadResult({
                        examRecordId: selectedExam.id,
                        body: {
                          totalMarks: Number(totalMarks),
                          passingMarks: Number(passingMarks),
                          obtainedMarks: Number(obtainedMarks),
                          meritRank: meritRank ? Number(meritRank) : undefined,
                        },
                      }).unwrap(),
                    'Exam result recorded.'
                  )
                }
                sx={{ mt: 1.25 }}
              >
                Save Result
              </LoadingButton>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Eligibility Decision
              </Typography>
              <Stack spacing={1.25}>
                <TextField
                  select
                  label="Decision"
                  value={eligibility}
                  onChange={(event) => setEligibility(Number(event.target.value))}
                >
                  {Object.entries(admissionCrmEligibilityLabels).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  label="Decision reason"
                  value={decisionReason}
                  onChange={(event) => setDecisionReason(event.target.value)}
                  multiline
                  minRows={2}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={overrideDecision}
                      onChange={(_, checked) => setOverrideDecision(checked)}
                    />
                  }
                  label="Override the calculated decision"
                />
                {overrideDecision && (
                  <TextField
                    required
                    label="Override reason"
                    value={overrideReason}
                    onChange={(event) => setOverrideReason(event.target.value)}
                    multiline
                    minRows={2}
                  />
                )}
                <LoadingButton
                  variant="contained"
                  loading={decideEligibilityState.isLoading}
                  disabled={!decisionReason.trim() || (overrideDecision && !overrideReason.trim())}
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        decideEligibility({
                          examRecordId: selectedExam.id,
                          body: {
                            decision: eligibility,
                            reason: decisionReason.trim(),
                            meritRank: meritRank ? Number(meritRank) : undefined,
                            overrideDecision,
                            overrideReason: overrideDecision ? overrideReason.trim() : undefined,
                          },
                        }).unwrap(),
                      'Eligibility decision recorded.'
                    )
                  }
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Save Eligibility
                </LoadingButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedExam(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(handoffExamId)}
        onClose={() => setHandoffExamId('')}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Eligibility Handoff</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {handoffQuery.isFetching && <LinearProgress aria-label="Loading eligibility handoff" />}
            {handoffQuery.isError && (
              <Alert severity="error">Eligibility handoff details are unavailable.</Alert>
            )}
            {handoffQuery.data && (
              <>
                <Alert severity={handoffQuery.data.canStartAdmission ? 'success' : 'warning'}>
                  {handoffQuery.data.canStartAdmission
                    ? 'Eligible for admission handoff'
                    : 'Review before admission handoff'}
                </Alert>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2">{handoffQuery.data.applicantName}</Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={admissionCrmEligibilityLabels[handoffQuery.data.eligibilityDecision]}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {handoffQuery.data.desiredClassName || 'Class not captured'} -{' '}
                      {handoffQuery.data.admissionIntent}
                    </Typography>
                    {handoffQuery.data.dateOfBirth && (
                      <Typography variant="body2" color="text.secondary">
                        DOB: {dateFormatter.format(new Date(handoffQuery.data.dateOfBirth))}
                      </Typography>
                    )}
                    <Divider />
                    <Typography variant="body2">
                      {handoffQuery.data.primaryContactNo ||
                        handoffQuery.data.email ||
                        'No contact captured'}
                    </Typography>
                    <Typography variant="body2">
                      Marks:{' '}
                      {handoffQuery.data.obtainedMarks != null &&
                      handoffQuery.data.totalMarks != null
                        ? `${handoffQuery.data.obtainedMarks}/${handoffQuery.data.totalMarks}`
                        : 'Not recorded'}
                    </Typography>
                    {handoffQuery.data.missingAdmissionFields.length > 0 && (
                      <Alert severity="warning">
                        Missing: {handoffQuery.data.missingAdmissionFields.join(', ')}
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {handoffQuery.data?.eligibilityDecision === AdmissionCrmEligibilityDecision.Eligible ? (
            <Button
              variant="contained"
              onClick={() => {
                openApplicant(handoffQuery.data!.leadId, 'registration');
                setHandoffExamId('');
              }}
            >
              Continue to Registration
            </Button>
          ) : null}
          <Button onClick={() => setHandoffExamId('')}>Close</Button>
        </DialogActions>
      </Dialog>

      <ApplicantWorkspaceDrawer
        leadId={state.applicant}
        academicYearId={academicYearId}
        initialTab={(state.applicantTab as ApplicantDrawerTab | undefined) || 'exam'}
        onTabChange={(nextTab) => updateState({ applicantTab: nextTab }, 'replace')}
        onClose={closeApplicant}
      />
    </Stack>
  );
}
