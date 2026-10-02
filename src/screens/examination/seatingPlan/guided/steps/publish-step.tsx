'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormSectionCard } from 'src/components/form-section-card';

import { PublishedReceipt } from './published-receipt';
import { PublicationWarnings } from './publication-warnings';
import { ExaminationReadinessCard } from './examination-readiness-card';

import type { GuidedStepProps } from '../types';

export function PublishStep({ workspace, workflow }: GuidedStepProps) {
  if (workflow.isPublished) {
    return <PublishedReceipt workspace={workspace} workflow={workflow} />;
  }
  const { readiness } = workflow;

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <ExaminationReadinessCard workflow={workflow} />
      <FormSectionCard
        icon="mdi:clipboard-check-outline"
        title="Plans to publish"
        descriptionTooltip="All subjects must belong to a plan, and every plan must have complete, validated seating. All plans are published together for this examination."
      >
        <Stack spacing={1}>
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
        </Stack>
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:lock-outline"
        title="Publish examination"
        descriptionTooltip="Review any warnings before publishing. Publishing runs final validation and locks the seating plans. Corrections after publication require a new examination revision."
      >
        <Stack spacing={1}>
          <PublicationWarnings warnings={readiness.warnings} />

          {readiness.warnings.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={workflow.formik.values.acknowledgeWarnings}
                  onChange={(_, checked) =>
                    workflow.formik.setFieldValue('acknowledgeWarnings', checked)
                  }
                />
              }
              label={`I reviewed all ${readiness.warnings.length} warning${readiness.warnings.length === 1 ? '' : 's'}.`}
            />
          )}

          {readiness.isReadyToPublish ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:lock-outline" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Publishing locks all plans. Corrections require a new examination revision.
              </Typography>
            </Stack>
          ) : (
            <Alert severity="error">
              Complete all subjects and seating plans before publishing.
            </Alert>
          )}
        </Stack>
      </FormSectionCard>
    </Stack>
  );
}
