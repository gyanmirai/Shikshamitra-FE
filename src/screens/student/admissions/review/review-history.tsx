import type { ReviewStageKey } from 'src/redux/student/admissions/admission-review-types';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useGetAdmissionReviewHistoryQuery } from 'src/redux/student/admissions/admission-review-api';
import {
  Box,
  Stack,
  Skeleton,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { ReviewRecordDetails } from './review-record-details';
import { AdmissionQueryError } from '../admission-query-error';

function HistoryRecords(props: ReviewStageKey) {
  const query = useGetAdmissionReviewHistoryQuery(props);
  if (query.isLoading) return <Skeleton variant="rounded" height={120} />;
  if (query.isError) return <AdmissionQueryError onRetry={query.refetch} />;
  return (
    <Stack spacing={1}>
      {!query.data?.length && (
        <Typography variant="body2" color="text.secondary">
          No review records yet.
        </Typography>
      )}
      {query.data?.map((record) => (
        <Box key={record.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
          <ReviewRecordDetails record={record} showEvidence />
        </Box>
      ))}
    </Stack>
  );
}
export function ReviewHistory(props: ReviewStageKey) {
  const [open, setOpen] = useState(false);
  return (
    <Accordion expanded={open} onChange={(_, value) => setOpen(value)}>
      <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
        <Typography variant="subtitle2">Review history</Typography>
      </AccordionSummary>
      <AccordionDetails>{open && <HistoryRecords {...props} />}</AccordionDetails>
    </Accordion>
  );
}
