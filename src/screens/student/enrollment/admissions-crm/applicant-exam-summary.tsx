'use client';

import Link from 'next/link';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { Chip, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import {
  EntranceExamStatusEnum,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
  useGetAdmissionCrmEntranceExamByLeadQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

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
  const query = useGetAdmissionCrmEntranceExamByLeadQuery({ leadId });
  const exam = query.data;
  const examHref = `/student/enrollment/exams?cycle=${encodeURIComponent(academicYearId)}&applicant=${encodeURIComponent(leadId)}&tab=exam`;

  if (query.isLoading) return <LinearProgress aria-label="Loading entrance exam" />;
  if (!exam) {
    return (
      <ApplicantEmptyState
        title="Entrance exam is not scheduled"
        description="Schedule an exam from the Entrance Exams workspace when the applicant is ready."
        action={
          <Button component={Link} href={examHref} color="inherit" size="small">
            Open Exams
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
          Open Exams
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
    </Stack>
  );
}
