'use client';

import { Box, Stack, Skeleton } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { skeletonReducedMotionSx } from 'src/theme/styles/skeleton';

/** Stage-shaped placeholders used only while an admission workspace chunk is loading. */
export function ApplicationWorkspaceSkeleton({
  layout = 'cards',
  label = 'Loading Admission Workspace',
}: {
  layout?: 'form' | 'cards' | 'table';
  label?: string;
}) {
  return (
    <Stack
      role="status"
      aria-label={label}
      aria-busy
      spacing={2}
      sx={{ minWidth: 0, width: '100%', ...skeletonReducedMotionSx }}
    >
      <Skeleton variant="text" width="35%" height={32} />
      {layout === 'table' ? (
        <FormSectionCard title={<Skeleton width={160} />}>
          <Skeleton variant="rounded" height={40} sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={40} />
            ))}
          </Stack>
        </FormSectionCard>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: layout === 'cards' ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 2 }, (_, section) => (
            <FormSectionCard key={section} title={<Skeleton width={160} />}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: layout === 'form' ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {Array.from({ length: layout === 'form' ? 4 : 3 }, (_field, field) => (
                  <Skeleton key={field} variant="rounded" height={layout === 'form' ? 48 : 40} />
                ))}
              </Box>
            </FormSectionCard>
          ))}
        </Box>
      )}
    </Stack>
  );
}
