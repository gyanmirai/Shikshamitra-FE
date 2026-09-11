import type { EligibilityException } from 'src/redux/student/admissions/admission-eligibility-types';

import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { Stack, Paper, Button, Typography } from '@mui/material';

export function EligibilityExceptions({
  exceptions,
  canReview = false,
  disabled = false,
  onReview,
}: {
  exceptions: EligibilityException[];
  canReview?: boolean;
  disabled?: boolean;
  onReview?: (exceptionId: string, approved: boolean) => void;
}) {
  if (!exceptions.length) return null;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Exceptions</Typography>
      {[...exceptions].reverse().map((exception) => (
        <Paper key={exception.id} variant="outlined" sx={{ p: 1.5, overflowWrap: 'anywhere' }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Label
                color={
                  exception.status === 'approved'
                    ? 'success'
                    : exception.status === 'rejected'
                      ? 'error'
                      : 'warning'
                }
              >
                {exception.status === 'pending'
                  ? 'Pending review'
                  : exception.status === 'approved'
                    ? 'Approved'
                    : 'Declined'}
              </Label>
              <Typography variant="caption" color="text.secondary">
                Requested {fDateTime(exception.requestedAt)}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {exception.reason}
            </Typography>
            {exception.reviewReason && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                Decision reason: {exception.reviewReason}
              </Typography>
            )}
            {exception.reviewedAt && (
              <Typography variant="caption" color="text.secondary">
                Reviewed {fDateTime(exception.reviewedAt)}
              </Typography>
            )}
            {canReview && exception.canReview && onReview && (
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="contained"
                  disabled={disabled}
                  onClick={() => onReview(exception.id, true)}
                >
                  Approve exception
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={disabled}
                  onClick={() => onReview(exception.id, false)}
                >
                  Decline exception
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
