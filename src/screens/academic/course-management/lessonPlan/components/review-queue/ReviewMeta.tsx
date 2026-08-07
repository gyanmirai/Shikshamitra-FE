'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

import { Iconify } from 'src/components/iconify';

type ReviewMetaProps = {
  classDivision: string;
  subjectName: string;
  lectureDate: string;
  submittedAt?: string;
  plannedPct?: number;
  actualPct?: number | string;
  progressGap?: number | string;
  evidenceCount?: number;
};

export const ReviewMeta = ({
  classDivision,
  subjectName,
  lectureDate,
  submittedAt,
  plannedPct,
  actualPct,
  progressGap,
  evidenceCount = 0,
}: ReviewMetaProps) => {
  const formattedLectureDate = lectureDate ? dayjs(lectureDate).format('DD-MM-YYYY') : '—';
  const formattedSubmittedAt = submittedAt ? dayjs(submittedAt).format('DD-MM-YYYY HH:mm') : '—';

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '8px',
        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        gap: 1.25,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon="solar:users-group-two-rounded-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.7rem' }}>
            Class & Division
          </Typography>
          <Typography variant="body2" fontWeight={600} noWrap>
            {classDivision}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon="solar:notebook-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.7rem' }}>
            Subject
          </Typography>
          <Typography variant="body2" fontWeight={600} noWrap>
            {subjectName}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon="solar:calendar-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.7rem' }}>
            Lecture Date
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formattedLectureDate}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon="solar:clock-circle-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.7rem' }}>
            Submission Time
          </Typography>
          <Typography variant="body2" fontWeight={600} noWrap>
            {formattedSubmittedAt}
          </Typography>
        </Box>
      </Stack>

      {(plannedPct !== undefined || evidenceCount > 0) && (
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, pt: 0.5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            {plannedPct !== undefined && (
              <Tooltip
                title={`Planned: ${plannedPct}% | Actual: ${actualPct ?? '-'}% | Gap: ${
                  progressGap !== undefined && progressGap !== '-'
                    ? `${Number(progressGap) > 0 ? '+' : ''}${progressGap}%`
                    : '-'
                }`}
                arrow
              >
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: '6px',
                    bgcolor: 'action.hover',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'help',
                  }}
                >
                  <Iconify icon="solar:chart-bold-duotone" width={14} sx={{ color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={600}>
                    Target: {plannedPct}%
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {evidenceCount > 0 && (
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Iconify icon="solar:paperclip-bold" width={14} />
                <Typography variant="caption" fontWeight={600}>
                  {evidenceCount} Evidence file(s)
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ReviewMeta;
