import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SeatingPreviewGrid } from './seating-preview-grid';

import type { GuidedStepProps } from '../types';

export function ReviewStep({ workflow }: GuidedStepProps) {
  const plan = workflow.selectedPlan;
  const { preview, validation } = workflow;
  if (!plan) return <Alert severity="warning">Choose a seating plan before reviewing.</Alert>;

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 }, maxWidth: 1040 }}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Review the proposed seating</Typography>
        <Typography color="text.secondary">
          Check every room and exception before applying the proposal. Applying runs the final
          server validation; it does not publish the plan.
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Metric label="Students" value={preview?.totalStudents ?? plan.totalStudents} />
        <Metric label="Proposed" value={preview?.assignments.length ?? 0} />
        <Metric label="Rooms" value={preview?.roomsUsed ?? 0} />
        <Metric label="Utilization" value={`${preview?.utilizationPercent ?? 0}%`} />
      </Stack>

      {!preview ? (
        <Alert severity="info">
          Generate a new preview to review changes. The saved seating remains unchanged until you
          apply and validate the proposal.
        </Alert>
      ) : (
        <>
          {preview.assignments.length === 0 && (
            <Alert severity="error">
              No seats were proposed. Return to Configure and choose rooms or rules that can seat
              at least one student before applying.
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

      {validation && <ValidationResults validation={validation} />}
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
      {validation.isValid && validation.warnings.length > 0 && (
        <Alert severity="warning">
          Mandatory checks passed, but review {validation.warnings.length} warning
          {validation.warnings.length === 1 ? '' : 's'} before publishing.
        </Alert>
      )}
      {validation.blockers.map((issue) => (
        <ValidationIssue
          key={`blocker-${issue.code}-${issue.roomName ?? ''}`}
          issue={issue}
          severity="error"
        />
      ))}
      {validation.warnings.map((issue) => (
        <ValidationIssue
          key={`warning-${issue.code}-${issue.roomName ?? ''}`}
          issue={issue}
          severity="warning"
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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack
      spacing={0.25}
      sx={{
        flex: 1,
        minWidth: 120,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Stack>
  );
}
