import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Box, Stack, Skeleton, Typography } from '@mui/material';
import { findCurrentAcademicYear } from 'src/utils/academic-year';
import { useAcademicOptions } from 'src/layouts/components/global-academic-search/use-academic-options';

type Props = { children: ReactNode; loading?: boolean };

export function AcademicContextContent({ children, loading = false }: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const options = useAcademicOptions(false);
  const defaultYear = findCurrentAcademicYear(options.years?.items ?? []);
  const awaitingDefault =
    !currentYear?.id &&
    options.options.some((option) => option.academicYear.id === defaultYear?.id);
  const contextLoading = options.isLoading || awaitingDefault;

  if (loading || contextLoading) {
    return (
      <Stack
        role="status"
        aria-label="Loading academic workspace"
        aria-busy
        spacing={2}
        sx={{ p: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading academic workspace…
        </Typography>
        <Skeleton variant="rounded" height={48} />
        <Box>
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Box>
      </Stack>
    );
  }
  return children;
}
