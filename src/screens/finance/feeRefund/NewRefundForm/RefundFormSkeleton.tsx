import { Box, Grid, Stack, Skeleton } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import RefundTableSkeleton from './feeHeadRefundTable/RefundTableSkeleton';

export function RefundDetailsSkeleton() {
  return (
    <Stack spacing={1} role="status" aria-label="Loading refund details" aria-busy="true">
      <FormSectionCard title="Refund details" icon="solar:bill-list-bold-duotone">
        <Skeleton variant="text" width={100} />
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" width={110} height={28} />
          <Skeleton variant="rounded" width={130} height={28} />
        </Stack>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Skeleton variant="text" width="45%" />
          <Skeleton variant="text" width="25%" />
        </Stack>
        <RefundTableSkeleton compact />
      </FormSectionCard>
      <FormSectionCard title="Refund payment details" icon="solar:wallet-bold-duotone">
        <Grid container spacing={1}>
          {[0, 1].map((field) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
          ))}
          <Grid size={12}>
            <Skeleton variant="rounded" height={70} />
          </Grid>
        </Grid>
      </FormSectionCard>
    </Stack>
  );
}

export default function RefundFormSkeleton() {
  return (
    <Box role="status" aria-label="Loading refund request" aria-busy="true">
      <Stack spacing={1}>
        <FormSectionCard title="Student information" icon="solar:users-group-rounded-bold-duotone">
          <Grid container spacing={1}>
            {[0, 1, 2, 3].map((field) => (
              <Grid key={field} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={40} />
              </Grid>
            ))}
            <Grid size={12}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
          </Grid>
        </FormSectionCard>
        <RefundDetailsSkeleton />
      </Stack>
    </Box>
  );
}
