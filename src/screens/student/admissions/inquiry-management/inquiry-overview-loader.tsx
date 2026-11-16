'use client';

import dynamic from 'next/dynamic';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Skeleton } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { skeletonReducedMotionSx } from 'src/theme/styles/skeleton';

export const loadInquiryOverviewForm = () =>
  import('./inquiry-overview-form').then((module) => module.InquiryOverviewForm);

// The owning management page retains Back, permissions, query errors and its draft guard.
export const InquiryOverviewForm = dynamic(loadInquiryOverviewForm, {
  loading: () => (
    <Stack
      role="status"
      aria-label="Loading Inquiry Form"
      aria-busy
      spacing={2}
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflowY: 'auto',
        p: { xs: 1.5, sm: 2 },
        ...skeletonReducedMotionSx,
      }}
    >
      <FormSectionCard title="Admission Interest" icon={GlobalIcons.admissionInterest}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={48} />
          ))}
        </Box>
      </FormSectionCard>
      <FormSectionCard title={<Skeleton width={180} height={28} />}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={48} />
          ))}
        </Box>
      </FormSectionCard>
    </Stack>
  ),
});
