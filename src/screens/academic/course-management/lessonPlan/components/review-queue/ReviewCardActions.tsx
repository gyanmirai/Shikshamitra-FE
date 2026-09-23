import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';

type ReviewCardActionsProps = {
  status: string;
  canReview: boolean;
  canReviewSubmissions: boolean;
  isSelfSubmission: boolean;
  isApproving: boolean;
  isRequesting: boolean;
  isRejecting: boolean;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
};

export const ReviewCardActions = ({
  status,
  canReview,
  canReviewSubmissions,
  isSelfSubmission,
  isApproving,
  isRequesting,
  isRejecting,
  onApprove,
  onRequestChanges,
  onReject,
  onViewDetails,
}: ReviewCardActionsProps) => {
  const isPending = status === 'pending';
  const isReviewActionLoading = isApproving || isRequesting || isRejecting;

  return (
    <Box
      sx={{ px: 2, py: 1.25, borderTop: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}
    >
      <Stack direction="row" spacing={1} justifyContent="flex-end" useFlexGap flexWrap="wrap">
        {isPending && canReviewSubmissions && isSelfSubmission && (
          <Chip label="Your submission" size="small" variant="outlined" />
        )}

        {onViewDetails && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.eye} width={16} />}
            onClick={onViewDetails}
          >
            View
          </Button>
        )}

        {isPending && canReview && (
          <>
            <LoadingButton
              size="small"
              variant="outlined"
              color="error"
              loading={isRejecting}
              disabled={isReviewActionLoading && !isRejecting}
              startIcon={<Iconify icon="mdi:close" width={16} />}
              onClick={onReject}
            >
              Reject
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="outlined"
              color="warning"
              loading={isRequesting}
              disabled={isReviewActionLoading && !isRequesting}
              startIcon={<Iconify icon="mdi:swap-horizontal" width={16} />}
              onClick={onRequestChanges}
            >
              Request changes
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isApproving}
              disabled={isReviewActionLoading && !isApproving}
              startIcon={<Iconify icon="mdi:check" width={16} />}
              onClick={onApprove}
            >
              Approve
            </LoadingButton>
          </>
        )}
      </Stack>
    </Box>
  );
};
