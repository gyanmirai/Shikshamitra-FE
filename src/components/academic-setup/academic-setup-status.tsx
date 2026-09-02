import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Paper, Button, Skeleton } from '@mui/material';

type AcademicSetupStatusProps = {
  kind: 'loading' | 'error' | 'empty';
  onRetry?: () => void;
  onCreateYear?: () => void;
};

export const AcademicSetupStatus = ({ kind, onRetry, onCreateYear }: AcademicSetupStatusProps) => (
  <Paper
    component="section"
    variant="outlined"
    sx={{ minHeight: 360, p: 3, borderRadius: 2, bgcolor: 'background.paper' }}
  >
    {kind === 'loading' ? (
      <Box aria-label="Loading academic hierarchy">
        <Skeleton variant="text" width="35%" height={40} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rounded" height={210} sx={{ mt: 3 }} />
      </Box>
    ) : kind === 'error' ? (
      <EmptyContent
        title="Academic hierarchy could not be loaded"
        description="Check your connection and try again. Your existing setup has not been changed."
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            onClick={onRetry}
            startIcon={<Iconify icon="solar:restart-bold" aria-hidden />}
            sx={{ mt: 2, minHeight: 36 }}
          >
            Retry
          </Button>
        }
      />
    ) : (
      <EmptyContent
        title="Create the first academic year"
        description="An academic year is the starting point for boards, mediums, stages, standards, and divisions."
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            onClick={onCreateYear}
            startIcon={<Iconify icon="mingcute:add-line" aria-hidden />}
            sx={{ mt: 2, minHeight: 36 }}
          >
            Create academic year
          </Button>
        }
      />
    )}
  </Paper>
);
