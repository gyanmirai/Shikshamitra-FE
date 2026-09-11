import type { EligibilityCriterionResult } from 'src/redux/student/admissions/admission-eligibility-types';

import { Label } from 'src/components/label';
import { Paper, Stack, Typography } from '@mui/material';

export function EligibilityCriterionResults({
  criteria,
}: {
  criteria: EligibilityCriterionResult[];
}) {
  return (
    <Stack spacing={1}>
      {criteria.map((criterion) => (
        <Paper key={criterion.code} variant="outlined" sx={{ p: 1.5, overflowWrap: 'anywhere' }}>
          <Stack spacing={0.75}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="subtitle2">{criterion.name}</Typography>
              <Label
                color={
                  criterion.outcome === 'passed'
                    ? 'success'
                    : criterion.outcome === 'failed'
                      ? 'error'
                      : 'warning'
                }
              >
                {criterion.outcome === 'passed'
                  ? 'Passed'
                  : criterion.outcome === 'failed'
                    ? 'Not met'
                    : 'Information needed'}
              </Label>
            </Stack>
            <Typography variant="body2">Expected: {criterion.expected}</Typography>
            <Typography variant="body2">
              Recorded value: {criterion.actual || 'Not provided'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Source: {criterion.source}
            </Typography>
            {criterion.message && <Typography variant="body2">{criterion.message}</Typography>}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
