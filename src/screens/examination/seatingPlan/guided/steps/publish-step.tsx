'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { PublishedReceipt } from './published-receipt';

import type { GuidedStepProps } from '../types';

export function PublishStep({ workspace, workflow }: GuidedStepProps) {
  if (workflow.isPublished) {
    return <PublishedReceipt workspace={workspace} workflow={workflow} />;
  }
  const { readiness } = workflow;

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 }, maxWidth: 920 }}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Review the complete examination seating</Typography>
        <Typography color="text.secondary">
          This is the only publish action. It validates and locks every plan together so the
          examination can never be left partially published.
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Metric label="Subjects planned" value={`${readiness.plannedSubjectCount}/${readiness.totalSubjectCount}`} />
        <Metric label="Plans ready" value={`${readiness.readyPlanCount}/${readiness.totalPlanCount}`} />
        <Metric
          label="Seats assigned"
          value={`${readiness.allocatedStudentSeats}/${readiness.totalStudentSeats}`}
        />
      </Stack>

      {workspace.plans.map((plan) => (
        <Alert
          key={plan.seatingPlanId}
          severity={plan.pendingStudents === 0 ? 'success' : 'warning'}
          variant="outlined"
        >
          <Typography variant="subtitle2">{plan.name}</Typography>
          {plan.subjects.map((subject) => subject.subjectName).join(', ')} ·{' '}
          {plan.allocatedStudents} of {plan.totalStudents} students seated
        </Alert>
      ))}

      {readiness.blockers.map((issue) => (
        <Alert key={`${issue.code}-${issue.seatingPlanId ?? ''}`} severity="error">
          {issue.message}
        </Alert>
      ))}
      {readiness.warnings.map((warning) => (
        <Alert key={`${warning.code}-${warning.seatingPlanId ?? ''}`} severity="warning">
          {warning.message}
        </Alert>
      ))}

      {readiness.warnings.length > 0 && (
        <FormControlLabel
          control={
            <Checkbox
              checked={workflow.formik.values.acknowledgeWarnings}
              onChange={(_, checked) =>
                workflow.formik.setFieldValue('acknowledgeWarnings', checked)
              }
            />
          }
          label={`I reviewed ${readiness.warnings.length} warning${readiness.warnings.length === 1 ? '' : 's'} for all plans.`}
        />
      )}

      <Alert severity={readiness.isReadyToPublish ? 'warning' : 'error'}>
        {readiness.isReadyToPublish
          ? 'After publishing, room choices, subject groups and seat assignments cannot be changed. Corrections require a new examination revision.'
          : 'Publishing is blocked until every scheduled subject belongs to one valid, fully seated plan.'}
      </Alert>
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      spacing={0.25}
      sx={{ flex: 1, minWidth: 150, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Stack>
  );
}
