'use client';

import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Chip, Paper, Alert, Stack, AlertTitle, Typography } from '@mui/material';

import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const journeySteps = [
  {
    label: 'Inquiry & qualification',
    owner: 'Admissions team',
    transition: 'Staff qualify the inquiry and mark it ready for an exam.',
    mode: 'Staff action',
    path: studentPaths.enrollment.pipeline,
  },
  {
    label: 'Exam & eligibility',
    owner: 'Exam team',
    transition: 'Results and eligibility decisions update the applicant stage automatically.',
    mode: 'Automatic stage',
    path: studentPaths.enrollment.exams,
  },
  {
    label: 'Registration & documents',
    owner: 'Registration team',
    transition:
      'The system can issue a form at a milestone, or staff issue it from Ready to Invite.',
    mode: 'Configured handoff',
    path: studentPaths.enrollment.registrations,
  },
  {
    label: 'Offer & seat',
    owner: 'Admissions approver',
    transition: 'Verified applicants enter final approval before an offer reserves a seat.',
    mode: 'Approval',
    path: studentPaths.enrollment.offersSeats,
  },
  {
    label: 'Student activation',
    owner: 'School administrator',
    transition: 'Accepted applicants are activated after required admission gates are satisfied.',
    mode: 'Controlled action',
    path: studentPaths.enrollment.activation,
  },
] as const;

export function AdmissionJourneyOverview() {
  const { state } = useEnrollmentWorkspace();
  const withCycle = (path: string) =>
    state.cycle ? `${path}?cycle=${encodeURIComponent(state.cycle)}` : path;

  return (
    <Box
      component="section"
      aria-labelledby="admission-journey-overview-title"
      sx={{ minWidth: 0 }}
    >
      <Stack spacing={0.25} sx={{ mb: 1.25 }}>
        <Typography id="admission-journey-overview-title" component="h2" variant="subtitle1">
          Applicant journey
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Five clear handoffs take an inquiry from first contact to an active student.
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1,
        }}
      >
        {journeySteps.map((step, index) => (
          <Paper
            key={step.label}
            component={RouterLink}
            href={withCycle(step.path)}
            variant="outlined"
            sx={{
              p: 1.25,
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          >
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Chip size="small" color="primary" label={index + 1} sx={{ minWidth: 28 }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {step.owner}
                </Typography>
              </Stack>
              <Typography variant="subtitle2">{step.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {step.mode}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export function ExamRegistrationHandoffGuidance() {
  return (
    <Alert severity="info">
      <AlertTitle>Exam-to-registration handoff</AlertTitle>
      Recording the result and eligibility decision updates the applicant stage automatically.
      Eligible applicants receive a registration form automatically only when a published template
      is configured for that milestone; otherwise they appear in the Ready to Invite queue.
    </Alert>
  );
}

export function RegistrationOfferHandoffGuidance() {
  return (
    <Alert severity="info">
      <AlertTitle>Registration handoffs</AlertTitle>
      Use Ready to Invite for eligible applicants who need a manual registration link. After
      registration and required documents are verified, confirming readiness places the applicant in
      Admission Ready and the Offers final-approval queue.
    </Alert>
  );
}

export function OfferActivationHandoffGuidance() {
  return (
    <Alert severity="info">
      <AlertTitle>Offer-to-activation handoff</AlertTitle>
      Admission-ready applicants enter Final Approval. An accepted offer reserves the seat, and the
      applicant can move to activation after the configured admission gates are satisfied.
    </Alert>
  );
}

export function ActivationRepairGuidance() {
  return (
    <Alert severity="info">
      <AlertTitle>Activation completion</AlertTitle>
      Activation creates the student identity, academic placement, and access records. Any partial
      failure remains visible in Activation Repair and can be retried without repeating completed
      work.
    </Alert>
  );
}
