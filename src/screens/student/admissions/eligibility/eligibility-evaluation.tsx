import type { EligibilityEvaluation as Evaluation } from 'src/redux/student/admissions/admission-eligibility-types';

import { fDateTime } from 'src/utils/format-time';
import { Stack, Typography } from '@mui/material';

import { EligibilityStatusLabel } from './eligibility-status';
import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { EligibilityCriterionResults } from './eligibility-criterion-results';

export function EligibilityEvaluation({ evaluation }: { evaluation: Evaluation }) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="subtitle2">Check {evaluation.sequenceNumber}</Typography>
        <EligibilityStatusLabel status={evaluation.outcome} stale={evaluation.isStale} />
        <Typography variant="caption" color="text.secondary">
          Checked {fDateTime(evaluation.evaluatedAt, ADMISSION_DATE_TIME_FORMAT)}
        </Typography>
      </Stack>
      <EligibilityCriterionResults criteria={evaluation.criteria} />
    </Stack>
  );
}
