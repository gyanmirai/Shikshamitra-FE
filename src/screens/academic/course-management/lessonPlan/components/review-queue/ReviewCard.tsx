'use client';

import React from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

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

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  changes: 'Changes Requested',
  rejected: 'Rejected',
  all: 'All Reviews',
};

const statusColors: Record<string, 'warning' | 'success' | 'error' | 'default' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  changes: 'warning',
  rejected: 'error',
  all: 'default',
};

type ReviewCardProps = {
  item: ReviewItem;
  canReview: boolean;
  canReviewSubmissions: boolean;
  isSelfSubmission?: boolean;
  // Per-action loading flags wired from useQueryAndMutation isLoading states.
  // When any action for this card is in-flight, all sibling review buttons are
  // disabled to prevent duplicate submissions; the active one shows its spinner.
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
}: ReviewCardProps) => {
  const theme = useTheme();

  const isPending = item.status === 'pending';
  const formattedDate = item.submittedDate ? dayjs(item.submittedDate).format('DD-MM-YYYY') : '—';

  // Any in-flight review mutation on this card locks all review buttons so the
  // user can't kick off a second concurrent request for the same target.
  const isReviewActionLoading = isApproving || isRequesting || isRejecting;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        borderColor: theme.palette.divider,
        boxShadow: 'none',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      {/* Header Row: Teacher Name, Info Tooltip, Lesson Plan Chip, Status Badge */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {item.teacherName}
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" display="block">
                    Planned: {item.plannedPct}%
                  </Typography>
                  <Typography variant="caption" display="block">
                    Actual: {item.actualPct === '-' ? '-' : `${item.actualPct}%`}
                  </Typography>
                  {item.progressGap !== '-' && (
                    <Typography variant="caption" display="block">
                      Gap: {Number(item.progressGap) > 0 ? '+' : ''}
                      {item.progressGap}%
                    </Typography>
                  )}
                </Box>
              }
              arrow
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0.25, color: 'text.secondary' }}>
                <Iconify icon="mdi:information-outline" width={18} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
            {item.classDivision} • {item.subjectName} • {formattedDate}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip
            label={item.lessonType || 'Lesson Plan'}
            size="small"
            color="info"
            variant="soft"
            sx={{ fontWeight: 600 }}
          />
          <Label
            color={statusColors[item.status] || 'default'}
            variant="soft"
            sx={{ fontWeight: 600 }}
          >
            {statusLabels[item.status] || item.status}
          </Label>
        </Stack>
      </Stack>

      {/* Lesson Chapter & Topic Title */}
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {item.chapterName} — {item.topic}
      </Typography>

      {/* AI Summary / Curriculum Alignment Box */}
      {item.aiSummary && (
        <Box
          sx={{
            p: 1.25,
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            borderRadius: 1.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Iconify
              icon="mdi:robot-outline"
              width={16}
              sx={{ mt: 0.25, color: 'secondary.main', flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {item.aiSummary}
            </Typography>
          </Stack>
        </Box>
      )}

      <Divider />

      {/* Footer Action Buttons */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
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
              variant="contained"
              color="success"
              loading={isApproving}
              disabled={isReviewActionLoading && !isApproving}
              startIcon={<Iconify icon="mdi:check" width={16} />}
              onClick={onApprove}
            >
              Approve
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
              Change
            </LoadingButton>
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
          </>
        )}

        {isPending && isSelfSubmission && (
          <Chip
            label="You cannot review your own submission"
            size="small"
            color="info"
            variant="soft"
            sx={{ fontWeight: 500 }}
          />
        )}
      </Stack>
    </Card>
  );
};

export default ReviewCard;
