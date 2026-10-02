import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { FormSectionCard } from 'src/components/form-section-card';

import { SeatingMetrics } from './seating-metrics';
import { SeatingPreviewGrid } from './seating-preview-grid';

import type { GuidedStepProps } from '../types';

export function ReviewStep({ workflow }: GuidedStepProps) {
  const plan = workflow.selectedPlan;
  const { preview, validation } = workflow;
  if (!plan) return <Alert severity="warning">Choose a seating plan before reviewing.</Alert>;

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <FormSectionCard
        icon="mdi:clipboard-check-outline"
        title="Seating review"
        descriptionTooltip="Review every room, seat assignment and exception. Apply seating saves the proposal and runs final validation. Publishing the examination is a separate step."
        action={
          <Chip
            size="small"
            variant="soft"
            label={validation?.isValid ? 'Validated' : 'Preview'}
            color={validation?.isValid ? 'success' : 'default'}
          />
        }
      >
        <Stack spacing={1}>
          <SeatingMetrics
            items={[
              { label: 'Students', value: preview?.totalStudents ?? plan.totalStudents },
              { label: 'Proposed assignments', value: preview ? preview.assignments.length : '—' },
              { label: 'Rooms', value: preview ? preview.roomsUsed : '—' },
              {
                label: 'Unallocated in preview',
                value: preview ? preview.unallocatedStudentIds.length : '—',
              },
            ]}
          />
        </Stack>
      </FormSectionCard>
      {validation && (validation.blockers.length > 0 || validation.warnings.length === 0) && (
        <ValidationResults validation={validation} />
      )}

      {!preview ? (
        <Alert severity="info">Generate a preview to review seating.</Alert>
      ) : (
        <>
          {preview.assignments.length === 0 && (
            <Alert severity="error">
              No seats were proposed. Return to Configure and choose rooms or rules that can seat at
              least one student before applying.
            </Alert>
          )}
          {preview.unallocatedStudentIds.length > 0 && (
            <Alert severity="error">
              {preview.unallocatedStudentIds.length} students could not be seated. Return to
              Configure and add usable capacity or change the rules.
            </Alert>
          )}
          <SeatingPreviewGrid assignments={preview.assignments} />
        </>
      )}
    </Stack>
  );
}

function ValidationResults({
  validation,
}: {
  validation: NonNullable<GuidedStepProps['workflow']['validation']>;
}) {
  return (
    <Stack spacing={1} aria-label="Seating validation results">
      {validation.isValid && validation.warnings.length === 0 && (
        <Alert severity="success">All mandatory checks passed and no warnings were found.</Alert>
      )}
      {validation.blockers.map((issue) => (
        <ValidationIssue
          key={`blocker-${issue.code}-${issue.roomName ?? ''}`}
          issue={issue}
          severity="error"
        />
      ))}
    </Stack>
  );
}

function ValidationIssue({
  issue,
  severity,
}: {
  issue: NonNullable<GuidedStepProps['workflow']['validation']>['warnings'][number];
  severity: 'error' | 'warning';
}) {
  return (
    <Alert severity={severity}>
      {issue.message}
      {issue.suggestedActionLabel ? ` Suggested action: ${issue.suggestedActionLabel}.` : ''}
    </Alert>
  );
}
