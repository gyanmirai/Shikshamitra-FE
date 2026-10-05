import { Iconify } from 'src/components/iconify';
import { Box, Stack, Tooltip, Divider, IconButton, Typography } from '@mui/material';

import { HealthScoreGauge } from './HealthScoreGauge';

import type { StudentSuccessHeaderProps } from './StudentSuccessHeader';

type StudentSuccessNavigationProps = Omit<StudentSuccessHeaderProps, 'student' | 'kpis'>;

export function StudentSuccessNavigation({ health, currentIndex, totalStudents, onPrevious, onNext, onClose, canGoPrevious, canGoNext }: StudentSuccessNavigationProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        alignSelf: { xs: 'flex-end', md: 'center' },
        flexShrink: 0,
      }}
    >
      {/* Health Gauge */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          p: 0.75,
          pr: 1.25,
          borderRadius: 1.5,
          bgcolor: (theme) => `${theme.palette.primary.main}08`,
          border: 1,
          borderColor: (theme) => `${theme.palette.primary.main}1A`,
        }}
      >
        <HealthScoreGauge score={health?.score} size={42} thickness={4.5} showSubtext={false} />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: 11, lineHeight: 1.2 }}>
            Academic Health
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            {health?.score !== null && health?.score !== undefined ? `${health.score} / 100` : 'No score'}
          </Typography>
        </Box>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto', display: { xs: 'none', sm: 'block' } }} />

      {/* Student Pagination / Quick Switch */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Tooltip title="Previous student (Left arrow)">
          <span>
            <IconButton
              size="small"
              aria-label="Previous student"
              disabled={!canGoPrevious}
              onClick={onPrevious}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 0.75,
                width: 34,
                height: 34,
              }}
            >
              <Iconify icon="mdi:chevron-left" width={18} />
            </IconButton>
          </span>
        </Tooltip>

        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 0.75, minWidth: 48, textAlign: 'center', fontSize: 12 }}>
          {totalStudents > 0 ? `${currentIndex + 1} of ${totalStudents}` : '-'}
        </Typography>

        <Tooltip title="Next student (Right arrow)">
          <span>
            <IconButton
              size="small"
              aria-label="Next student"
              disabled={!canGoNext}
              onClick={onNext}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 0.75,
                width: 34,
                height: 34,
              }}
            >
              <Iconify icon="mdi:chevron-right" width={18} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Close Button */}
      <Tooltip title="Close (Esc)">
        <IconButton
          size="small"
          aria-label="Close Student Academic 360"
          onClick={onClose}
          sx={{
            bgcolor: (theme) => `${theme.palette.grey[500]}10`,
            borderRadius: 1,
            p: 0.75,
            width: 34,
            height: 34,
            '&:hover': {
              bgcolor: (theme) => `${theme.palette.error.main}14`,
              color: 'error.main',
            },
          }}
        >
          <Iconify icon="mdi:close" width={18} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
