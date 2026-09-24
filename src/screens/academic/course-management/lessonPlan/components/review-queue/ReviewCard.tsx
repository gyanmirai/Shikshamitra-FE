'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { ReviewCardHeader } from './ReviewCardHeader';
import { ReviewCardActions } from './ReviewCardActions';

export type ReviewItem = {
  id: string;
  targetType: 'plan' | 'diary';
  teacherId?: string;
  teacherName: string;
  submittedDate: string;
  pendingSince: string;
  classDivision: string;
  subjectName: string;
  chapterName: string;
  topic: string;
  learningObjective?: string;
  lessonType?: string;
  plannedPct: number;
  actualPct: number | string;
  progressGap: number | string;
  evidenceCount: number;
  aiSummary?: string;
  submittedAt?: string;
  status: 'pending' | 'approved' | 'changes' | 'rejected' | 'all' | string;
  reviewRemarks?: string;
  reviewedByName?: string;
  reviewedAt?: string;
};

type ReviewCardProps = {
  item: ReviewItem;
  canReview: boolean;
  canReviewSubmissions: boolean;
  isSelfSubmission?: boolean;
  isApproving?: boolean;
  isRequesting?: boolean;
  isRejecting?: boolean;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
};

export const ReviewCard = ({
  item,
  canReview,
  canReviewSubmissions,
  isSelfSubmission = false,
  isApproving = false,
  isRequesting = false,
  isRejecting = false,
  onApprove,
  onRequestChanges,
  onReject,
  onViewDetails,
}: ReviewCardProps) => (
  <Card
    variant="outlined"
    sx={{
      alignSelf: 'start',
      width: '100%',
      borderRadius: 2,
      borderColor: 'divider',
      boxShadow: 'none',
      overflow: 'hidden',
      transition: (theme) => theme.transitions.create('box-shadow', { duration: 180 }),
      '&:hover': { boxShadow: (theme) => theme.shadows[2] },
    }}
  >
    <Box sx={{ p: 2 }}>
      <ReviewCardHeader item={item} />

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Chapter
        </Typography>
        <Typography variant="subtitle2" color="text.primary">
          {item.chapterName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.topic}
        </Typography>
      </Stack>

      {item.aiSummary && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1.5, p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
        >
          <Iconify icon="mdi:robot-outline" width={17} sx={{ color: 'text.secondary', mt: 0.25 }} />
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {item.aiSummary}
          </Typography>
        </Stack>
      )}
    </Box>

    <ReviewCardActions
      status={item.status}
      canReview={canReview}
      canReviewSubmissions={canReviewSubmissions}
      isSelfSubmission={isSelfSubmission}
      isApproving={isApproving}
      isRequesting={isRequesting}
      isRejecting={isRejecting}
      onApprove={onApprove}
      onRequestChanges={onRequestChanges}
      onReject={onReject}
      onViewDetails={onViewDetails}
    />
  </Card>
);

export default ReviewCard;
