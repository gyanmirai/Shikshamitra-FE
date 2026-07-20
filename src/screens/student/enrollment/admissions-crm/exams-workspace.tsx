'use client';

import type { ComponentProps } from 'react';
import type { LabelColor } from 'src/components/label';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmEntranceExamDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
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
  useGetAdmissionCrmEligibilityHandoffQuery,
  useMarkAdmissionCrmExamAttendanceMutation,
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
        viewLabel="Open Applicant"
        handleViewClick={() => openApplicant(exam.leadId, 'exam')}
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
  const { academicYearId, state, updateState, openApplicant, closeApplicant } =
    useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<AdmissionCrmEntranceExamDto | null>(null);
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

  const examsQuery = useGetAdmissionCrmEntranceExamsQuery(
    {
      academicYearId: academicYearId || '',
      filterText: search.trim() || undefined,
      attendanceStatus: state.attendance,
      examStatus: state.examStatus,
      eligibilityDecision: state.eligibility,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
      sorting: 'ExamStartTime ASC',
    },
    { skip: !academicYearId }
  );
  const [markAttendance, markAttendanceState] = useMarkAdmissionCrmExamAttendanceMutation();
  const [uploadResult, uploadResultState] = useUploadAdmissionCrmExamResultMutation();
  const [decideEligibility, decideEligibilityState] = useDecideAdmissionCrmEligibilityMutation();
  const handoffQuery = useGetAdmissionCrmEligibilityHandoffQuery(
    { examRecordId: handoffExamId },
    { skip: !handoffExamId }
  );

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

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'applicantName',
        label: 'Applicant',
        width: 190,
        minWidth: 180,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
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
        isSort: false,
        isFilter: false,
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
        isSort: false,
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
        isSort: false,
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
        isSort: false,
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
        isSort: false,
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
    [openApplicant]
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

      {examsQuery.isError ? (
        <EnrollmentWorkspaceErrorState
          message="Entrance exams are unavailable."
          onRetry={() => examsQuery.refetch()}
        />
      ) : (
        <CustomizableTable
          tableId="student-enrollment-entrance-exams"
          tableTitle="Entrance Exams"
          columns={columns}
          data={examsQuery.data?.items || []}
          isLoading={examsQuery.isLoading}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideFilter
          defaultSearchTerm={search}
          searchFieldProps={{
            placeholder: 'Search applicant or exam slot',
            inputProps: { 'aria-label': 'Search entrance exams' },
          }}
          filters={tableFilters}
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
          onServerFilter={(filters) =>
            updateState(
              {
                attendance: getLatestEnumFilter(filters, 'attendanceStatus'),
                examStatus: getLatestEnumFilter(filters, 'examStatus'),
                eligibility: getLatestEnumFilter(filters, 'eligibilityDecision'),
                page: 1,
              },
              'push'
            )
          }
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
      )}

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
