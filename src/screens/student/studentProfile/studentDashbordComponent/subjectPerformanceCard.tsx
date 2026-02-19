import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography, LinearProgress } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

interface SubjectPerformanceItemProps {
  subject: string;
  percentage: number;
  previous: number;
  grade: string;
  color: string;
  isHighest?: boolean;
  isLowest?: boolean;
}

const SubjectPerformanceItem: React.FC<SubjectPerformanceItemProps> = ({
  subject,
  percentage,
  previous,
  grade,
  color,
  isHighest,
  isLowest,
}) => {
  // Determine Grade Label Color
  const getGradeColor = (gradeVal: string): LabelColor => {
    switch (gradeVal) {
      case 'A+':
        return 'success';
      case 'A':
        return 'info';
      case 'B+':
        return 'warning';
      default:
        return 'error';
    }
  };

  // Determine Status Text
  const getStatus = (percent: number) => {
    if (percent >= 75) return { label: 'Excellent', color: 'success.main' };
    if (percent >= 60) return { label: 'Average', color: 'warning.main' };
    return { label: 'Needs Improvement', color: 'error.main' };
  };

  const status = getStatus(percentage);
  const trend = percentage - previous;
  const isPositive = trend >= 0;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'transparent',
          bgcolor: 'background.neutral',
          transform: 'scale(1.02)',
          boxShadow: 'none',
        },
        ...(isHighest && {
          borderColor: 'success.lighter',
          bgcolor: (theme) => theme.alpha(theme.palette.success.lighter, 0.2), // Subtle Green Hint
        }),
        ...(isLowest && {
          borderColor: 'error.lighter',
          bgcolor: (theme) => theme.alpha(theme.palette.error.lighter, 0.1), // Subtle Red Hint
        }),
      }}
    >
      {/* Top/Lowest Indicator Label */}
      {(isHighest || isLowest) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            px: 1,
            py: 0.25,
            bgcolor: isHighest ? 'success.main' : 'error.main',
            color: 'white',
            borderRadius: '0 0 0 8px',
            typography: 'caption',
            fontWeight: 700,
            fontSize: '0.65rem',
          }}
        >
          {isHighest ? 'Top Subject' : 'Lowest'}
        </Box>
      )}

      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <SubjectColorIndicator color={color} />

          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {subject}
              </Typography>
              {/* Status Badge Text */}
              <Typography
                variant="caption"
                sx={{ color: status.color, fontWeight: 500, fontSize: '0.7rem' }}
              >
                • {status.label}
              </Typography>
            </Stack>

            {/* Trend Indicator */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                vs prev:
              </Typography>
              <Iconify
                icon={isPositive ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                width={14}
                sx={{ color: isPositive ? 'success.main' : 'error.main' }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: isPositive ? 'success.main' : 'error.main' }}
              >
                {Math.abs(trend)}%
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {percentage}%
            </Typography>
            <Label
              variant="filled"
              color={getGradeColor(grade)}
              sx={{
                fontWeight: 700,
                borderRadius: 0.8,
                minWidth: 32,
              }}
            >
              {grade}
            </Label>
          </Stack>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 4,
            bgcolor: (theme) => theme.alpha(color, 0.15),
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 4,
            },
          }}
        />

        {/* Improvement Suggestion for Weak Subjects */}
        {percentage < 60 && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Iconify icon="eva:bulb-outline" width={14} sx={{ color: 'warning.main' }} />
            Focus more on revision and assignment completion.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default SubjectPerformanceItem;
