import type { EligibilityStageKey } from 'src/redux/student/admissions/admission-eligibility-types';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useGetEligibilityHistoryQuery } from 'src/redux/student/admissions/admission-eligibility-api';
import {
  Alert,
  Stack,
  Paper,
  Skeleton,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { EligibilityExceptions } from './eligibility-exceptions';
import { EligibilityEvaluation } from './eligibility-evaluation';

export function EligibilityHistory({
  stageKey,
  latestEvaluationId,
}: {
  stageKey: EligibilityStageKey;
  latestEvaluationId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const query = useGetEligibilityHistoryQuery(stageKey, { skip: !expanded });
  const previous = query.currentData?.filter((item) => item.id !== latestEvaluationId) ?? [];
  return (
    <Accordion expanded={expanded} onChange={(_, open) => setExpanded(open)}>
      <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
        <Typography variant="subtitle2">Eligibility check history</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {query.isLoading ? (
          <Skeleton variant="rounded" height={100} />
        ) : query.isError ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : previous.length === 0 ? (
          <Alert severity="info">No earlier checks have been recorded.</Alert>
        ) : (
          <Stack spacing={2}>
            {[...previous]
              .sort((a, b) => b.sequenceNumber - a.sequenceNumber)
              .map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack spacing={2}>
                    <EligibilityEvaluation evaluation={item} />
                    <EligibilityExceptions exceptions={item.exceptions} />
                  </Stack>
                </Paper>
              ))}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
