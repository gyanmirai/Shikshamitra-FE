import { Iconify } from 'src/components/iconify';
import { Box, Stack, Alert, Typography } from '@mui/material';

import { GradeEntryReviewIssueList } from './GradeEntryReviewIssueList';

import type { GradeEntryReviewValidationResult } from '../types/grade-entry-review';

interface GradeEntryReviewValidationProps {
  validation: GradeEntryReviewValidationResult;
  onFix: (studentId: string) => void;
  disabled?: boolean;
}

export function GradeEntryReviewValidation({
  validation,
  onFix,
  disabled,
}: GradeEntryReviewValidationProps) {
  const hasBlockers = validation.blockers.length > 0;
  const isReady = validation.isValid && !hasBlockers;
  const readinessTitle = hasBlockers
    ? `${validation.blockers.length} Blocker(s) Found`
    : isReady
      ? 'No validation blockers'
      : 'Submission readiness is incomplete';
  const readinessMessage = hasBlockers
    ? 'You must fix all blockers before submitting marks.'
    : isReady
      ? 'All mandatory validation checks passed. Ready for submission.'
      : 'Submission readiness could not be confirmed. Go back to entry, review the marks, and try again.';

  return (
    <Stack spacing={1.5} sx={{ height: 1 }}>
      <Typography variant="overline" color="text.secondary">
        Result Readiness Validation
      </Typography>
      <Alert
        severity={isReady ? 'success' : 'error'}
        variant="outlined"
        sx={{
          borderRadius: 1.5,
          borderColor: isReady ? 'divider' : 'error.light',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
        icon={
          <Iconify
            icon={isReady ? 'solar:shield-check-bold' : 'solar:shield-warning-bold'}
            width={24}
          />
        }
      >
        <Typography variant="subtitle2">{readinessTitle}</Typography>
        <Typography variant="caption" color="text.secondary">
          {readinessMessage}
        </Typography>
      </Alert>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1.5,
          border: 1,
          borderColor: 'divider',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          Validation Checks Detail
        </Typography>
        <GradeEntryReviewIssueList validation={validation} onFix={onFix} disabled={disabled} />
      </Box>
    </Stack>
  );
}
