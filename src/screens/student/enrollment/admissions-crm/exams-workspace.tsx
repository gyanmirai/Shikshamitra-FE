'use client';

import type { AdmissionCrmEntranceExamDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Table,
  Button,
  Dialog,
  Switch,
  Divider,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  TablePagination,
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

export function ExamsWorkspace() {
  const { academicYearId, state, updateState, openApplicant, closeApplicant } =
    useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
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

  if (!academicYearId) {
    return <Alert severity="info">Select an academic year to open Entrance Exams.</Alert>;
  }

  return (
    <Stack spacing={1.5}>
      <EnrollmentWorkspaceHeader
        title="Entrance Exams"
        description="Process attendance, results, merit, and eligibility decisions from one queue."
      />

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1.25}>
          <TextField
            select
            size="small"
            label="Attendance"
            value={state.attendance ?? ''}
            onChange={(event) =>
              updateState({
                attendance: event.target.value === '' ? undefined : Number(event.target.value),
                page: 1,
              })
            }
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="">All attendance</MenuItem>
            {Object.entries(attendanceLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Result"
            value={state.examStatus ?? ''}
            onChange={(event) =>
              updateState({
                examStatus: event.target.value === '' ? undefined : Number(event.target.value),
                page: 1,
              })
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All results</MenuItem>
            {Object.entries(resultLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Eligibility"
            value={state.eligibility ?? ''}
            onChange={(event) =>
              updateState({
                eligibility: event.target.value === '' ? undefined : Number(event.target.value),
                page: 1,
              })
            }
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="">All decisions</MenuItem>
            {Object.entries(admissionCrmEligibilityLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            size="small"
            onClick={() =>
              updateState({
                attendance: undefined,
                examStatus: undefined,
                eligibility: undefined,
                page: 1,
              })
            }
          >
            Clear Filters
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
        {examsQuery.isFetching && <LinearProgress aria-label="Loading entrance exams" />}
        {examsQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" color="inherit" onClick={() => examsQuery.refetch()}>
                Retry
              </Button>
            }
            sx={{ m: 1.5 }}
          >
            Entrance exams are unavailable.
          </Alert>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Eligibility</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(examsQuery.data?.items || []).map((exam) => (
                  <TableRow key={exam.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{exam.applicantName}</Typography>
                      <Typography variant="caption" color="text.primary">
                        {exam.slotNameSnapshot || 'Exam slot'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {dayjs(exam.examStartTime).format('DD MMM YYYY, HH:mm')}
                      <Typography variant="caption" color="text.primary" display="block">
                        Room {exam.examRoomNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={attendanceLabels[exam.attendanceStatus]}
                        sx={{ color: 'text.primary', borderColor: 'text.primary' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={resultLabels[exam.examStatus]}
                        variant="outlined"
                        sx={{
                          color: 'text.primary',
                          borderColor:
                            exam.examStatus === EntranceExamStatusEnum.Pass
                              ? 'success.dark'
                              : exam.examStatus === EntranceExamStatusEnum.Fail
                                ? 'error.dark'
                                : 'text.primary',
                          bgcolor: 'background.paper',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {exam.obtainedMarks != null && exam.totalMarks != null
                        ? `${exam.obtainedMarks}/${exam.totalMarks}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={admissionCrmEligibilityLabels[exam.eligibilityDecision]}
                        sx={{ color: 'text.primary', borderColor: 'text.primary' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                        <Button size="small" onClick={() => openApplicant(exam.leadId)}>
                          Applicant
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedExam(exam)}
                        >
                          Manage
                        </Button>
                        <Button size="small" onClick={() => setHandoffExamId(exam.id)}>
                          Handoff
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!examsQuery.isFetching && !examsQuery.data?.items.length && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ py: 5, textAlign: 'center' }}>
                        <Typography variant="subtitle2">No matching exams</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Change the filters or schedule an exam from the Pipeline workspace.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
        <TablePagination
          component="div"
          count={examsQuery.data?.totalCount || 0}
          page={page}
          onPageChange={(_, nextPage) => updateState({ page: nextPage + 1 }, 'push')}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
        />
      </Paper>

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
                {dayjs(selectedExam.examStartTime).format('DD MMM YYYY, HH:mm')}
              </Alert>
            )}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Attendance
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
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
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
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
                        DOB: {dayjs(handoffQuery.data.dateOfBirth).format('DD MMM YYYY')}
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
          <Button onClick={() => setHandoffExamId('')}>Close</Button>
        </DialogActions>
      </Dialog>

      <ApplicantWorkspaceDrawer
        leadId={state.applicant}
        academicYearId={academicYearId}
        initialTab="overview"
        onClose={closeApplicant}
      />
    </Stack>
  );
}
