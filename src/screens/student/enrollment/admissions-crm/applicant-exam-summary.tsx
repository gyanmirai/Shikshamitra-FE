'use client';

import Link from 'next/link';
import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingButton } from 'src/components/loading-button';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import {
  Chip,
  Alert,
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  EntranceExamStatusEnum,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  useDecideAdmissionCrmEligibilityMutation,
  useGetAdmissionCrmEntranceExamByLeadQuery,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';

import { ApplicantEmptyState } from './applicant-workspace-primitives';
import { formatEnumLabel, formatEnrollmentDate } from './enrollment-display';

const enumLabel = (source: Record<string, string | number>, value: number) => {
  const raw = source[value];
  return typeof raw === 'string' ? formatEnumLabel(raw) : 'Not available';
};

export function ApplicantExamSummary({
  leadId,
  academicYearId,
}: {
  leadId: string;
  academicYearId: string;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const query = useGetAdmissionCrmEntranceExamByLeadQuery({ leadId });
  const [decideEligibility, decisionState] = useDecideAdmissionCrmEligibilityMutation();
  const exam = query.data;
  const examHref = `${studentPaths.enrollment.entranceExams}?cycle=${encodeURIComponent(academicYearId)}&applicant=${encodeURIComponent(leadId)}`;
  const unresolvedAbsence =
    exam != null &&
    [
      AdmissionCrmExamAttendanceStatus.Absent,
      AdmissionCrmExamAttendanceStatus.NoShow,
      AdmissionCrmExamAttendanceStatus.Excused,
    ].includes(exam.attendanceStatus) &&
    exam.eligibilityDecision === AdmissionCrmEligibilityDecision.Pending;

  const rejectApplication = async () => {
    if (!exam || !rejectReason.trim()) return;
    try {
      await decideEligibility({
        examRecordId: exam.id,
        body: {
          decision: AdmissionCrmEligibilityDecision.Rejected,
          reason: rejectReason.trim(),
          overrideDecision: false,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Application rejected after the exam no-show.' });
      setRejectOpen(false);
      setRejectReason('');
      await query.refetch();
    } catch {
      shikshaMitraToast.error({ message: 'The eligibility decision could not be saved.' });
    }
  };

  if (query.isLoading) return <LinearProgress aria-label="Loading entrance exam" />;
  if (!exam) {
    return (
      <ApplicantEmptyState
        title="Entrance exam is not scheduled"
        description="Schedule the required test, interview, or interaction from the Assessments workspace."
        action={
          <Button component={Link} href={examHref} color="inherit" size="small">
            Open Assessments
          </Button>
        }
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
        <Stack spacing={0.25}>
          <Typography variant="subtitle1">{exam.slotNameSnapshot || 'Entrance Exam'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatEnrollmentDate(exam.examStartTime, true)} · Room {exam.examRoomNo}
          </Typography>
        </Stack>
        <Button
          component={Link}
          href={examHref}
          size="small"
          variant="outlined"
          endIcon={<OpenInNewRounded />}
        >
          Open Assessments
        </Button>
      </Stack>
      <Stack direction="row" gap={0.75} flexWrap="wrap">
        <Chip
          size="small"
          label={`Attendance: ${enumLabel(AdmissionCrmExamAttendanceStatus, exam.attendanceStatus)}`}
        />
        <Chip
          size="small"
          label={`Result: ${enumLabel(EntranceExamStatusEnum, exam.examStatus)}`}
        />
        <Chip
          size="small"
          label={`Eligibility: ${enumLabel(AdmissionCrmEligibilityDecision, exam.eligibilityDecision)}`}
        />
      </Stack>
      {exam.totalMarks != null && exam.obtainedMarks != null ? (
        <Typography variant="body2">
          Marks {exam.obtainedMarks}/{exam.totalMarks}
          {exam.percentage != null ? ` (${exam.percentage.toFixed(1)}%)` : ''}
          {exam.meritRank ? ` · Merit rank ${exam.meritRank}` : ''}
        </Typography>
      ) : null}
      {exam.eligibilityDecisionReason ? (
        <Alert
          severity={
            exam.eligibilityDecision === AdmissionCrmEligibilityDecision.Rejected
              ? 'warning'
              : 'success'
          }
        >
          {exam.eligibilityDecisionReason}
        </Alert>
      ) : null}
      {unresolvedAbsence ? (
        <Alert
          severity="warning"
          action={
            <Stack direction="row" gap={0.75}>
              <Button
                component={Link}
                href={examHref}
                color="inherit"
                size="small"
                variant="outlined"
              >
                Reschedule exam
              </Button>
              <Button
                color="error"
                size="small"
                variant="contained"
                onClick={() => setRejectOpen(true)}
              >
                Reject application
              </Button>
            </Stack>
          }
        >
          The applicant was absent. Choose whether to reschedule the exam or reject the application.
        </Alert>
      ) : null}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject application</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            required
            multiline
            minRows={3}
            margin="dense"
            label="Reason for rejection"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            helperText="This reason is recorded in the applicant timeline."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <LoadingButton
            color="error"
            variant="contained"
            loading={decisionState.isLoading}
            disabled={!rejectReason.trim()}
            onClick={rejectApplication}
          >
            Reject application
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
