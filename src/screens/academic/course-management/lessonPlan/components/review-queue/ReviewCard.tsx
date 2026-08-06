'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';

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
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  onRevisePlan?: () => void;
};

export const ReviewCard = ({
  item,
  canReview,
  canReviewSubmissions,
  isSelfSubmission = false,
  onApprove,
  onRequestChanges,
  onReject,
  onViewDetails,
  onRevisePlan,
}: ReviewCardProps) => {
  const theme = useTheme();

  const isPending = item.status === 'pending';
  const formattedDate = item.submittedDate ? dayjs(item.submittedDate).format('DD-MM-YYYY') : '—';

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

        {!isPending && onRevisePlan && ['changes', 'rejected'].includes(item.status) && (
          <Button
            size="small"
            variant="contained"
            color="warning"
            startIcon={<Iconify icon="solar:pen-bold" width={16} />}
            onClick={onRevisePlan}
          >
            Revise
          </Button>
        )}

        {isPending && canReview && (
          <>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Iconify icon="mdi:check" width={16} />}
              onClick={onApprove}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="mdi:swap-horizontal" width={16} />}
              onClick={onRequestChanges}
            >
              Change
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="mdi:close" width={16} />}
              onClick={onReject}
            >
              Reject
            </Button>
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
