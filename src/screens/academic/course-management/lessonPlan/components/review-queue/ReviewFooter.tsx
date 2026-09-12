'use client';

import React from 'react';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

type ReviewFooterProps = {
  status: string;
  canReview: boolean;
  canReviewSubmissions: boolean;
  isSelfSubmission?: boolean;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
};

export const ReviewFooter = ({
  status,
  canReview,
  canReviewSubmissions,
  isSelfSubmission = false,
  onApprove,
  onRequestChanges,
  onReject,
  onViewDetails,
}: ReviewFooterProps) => {
  const isPending = status === 'pending';

  return (
    <Stack spacing={1} sx={{ pt: 1 }}>
      {isPending && canReviewSubmissions && isSelfSubmission && (
        <Alert severity="info" sx={{ py: 0.25, px: 1, '& .MuiAlert-message': { p: 0 } }}>
          <Typography variant="caption">You cannot review your own submission.</Typography>
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="flex-end"
        flexWrap="wrap"
        useFlexGap
      >
        {onViewDetails && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.eye} width={16} />}
            onClick={onViewDetails}
          >
            View Details
          </Button>
        )}

        {isPending && canReview && (
          <>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="solar:close-circle-bold" width={16} />}
              onClick={onReject}
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="solar:alt-arrow-right-bold" width={16} />}
              onClick={onRequestChanges}
            >
              Request Changes
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Iconify icon="solar:check-circle-bold" width={16} />}
              onClick={onApprove}
            >
              Approve
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default ReviewFooter;
