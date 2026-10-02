import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Button,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { GradeEntryProgress } from './GradeEntryProgress';
import { GradeEntryReviewStatistics } from './GradeEntryReviewStatistics';
import { GradeEntryReviewValidation } from './GradeEntryReviewValidation';

import type { GradeEntryReviewDialogProps } from '../types/grade-entry-review';

export function GradeEntryReviewDialog({
  open,
  onClose,
  stats,
  validation,
  onFix,
  onSubmit,
  submitLabel,
  isSubmitLoading = false,
  isPreparing = false,
  preparationError,
  onRetry,
}: GradeEntryReviewDialogProps) {
  const isBusy = isPreparing || isSubmitLoading;

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      guardUnsavedChanges={false}
      disableClose={isBusy}
      title={
        <Stack component="span" direction="row" spacing={1.25} alignItems="center">
          <Iconify icon="solar:clipboard-check-bold" sx={{ color: 'text.secondary' }} width={24} />
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
            Review Grade Entry & Result Readiness
          </Box>
        </Stack>
      }
      maxWidth="md"
      hasForm={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent sx={{ bgcolor: 'background.default' }}>
        {isPreparing && (
          <Stack role="status" direction="row" alignItems="center" spacing={1.5} sx={{ py: 3 }}>
            <CircularProgress size={24} aria-label="Preparing review" />
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Preparing review</Typography>
              <Typography variant="body2" color="text.secondary">
                Saving your latest marks and checking submission readiness.
              </Typography>
            </Stack>
          </Stack>
        )}
        {!isPreparing && preparationError && (
          <Alert
            severity="error"
            action={
              onRetry && (
                <Button color="inherit" size="small" onClick={onRetry} disabled={isBusy}>
                  Retry review
                </Button>
              )
            }
          >
            {preparationError}
          </Alert>
        )}
        {!isPreparing && !preparationError && (
          <>
            <GradeEntryProgress totalCount={stats.totalCount} gradedCount={stats.gradedCount} />
            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }}>
                <GradeEntryReviewStatistics stats={stats} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <GradeEntryReviewValidation
                  validation={validation}
                  onFix={onFix}
                  disabled={isBusy}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          disabled={isBusy}
          startIcon={<Iconify icon="basil:cross-solid" />}
        >
          Back to Entry
        </Button>
        <SubmitButton
          type="button"
          buttonText={submitLabel}
          loading={isSubmitLoading}
          disabled={
            isBusy ||
            Boolean(preparationError) ||
            !validation.isValid ||
            validation.blockers.length > 0
          }
          onClick={onSubmit}
          startIcon={<Iconify icon="solar:plain-bold" />}
        />
      </DialogActions>
    </CustomDialog>
  );
}
