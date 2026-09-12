import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import { AI_REPORT_ACTIVITY_COPY } from './ai-report-activity-config';

import type { AiReportBusyStage } from './ai-report-activity-config';

const TYPING_DOTS = [0, 1, 2] as const;

export function AiReportActivity({ stage }: { stage: AiReportBusyStage }) {
  const copy = AI_REPORT_ACTIVITY_COPY[stage];

  return (
    <Stack
      direction="row"
      spacing={1.25}
      role="status"
      aria-live="polite"
      aria-label={`ShikshaMitra AI: ${copy.status}`}
      sx={{ py: 1 }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          display: 'grid',
          borderRadius: '50%',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }}
      >
        <Iconify icon="solar:magic-stick-3-bold" width={20} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
        <Typography variant="subtitle2">ShikshaMitra AI</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
          <Typography variant="body2" fontWeight={600}>
            {copy.status}
          </Typography>
          <Stack
            direction="row"
            spacing={0.4}
            aria-hidden="true"
            sx={{
              '@keyframes ai-typing-dot': {
                '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.35 },
                '30%': { transform: 'translateY(-3px)', opacity: 1 },
              },
            }}
          >
            {TYPING_DOTS.map((dot) => (
              <Box
                key={dot}
                component="span"
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: 'text.primary',
                  animation: 'ai-typing-dot 1.2s ease-in-out infinite',
                  animationDelay: `${dot * 160}ms`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    opacity: dot === 0 ? 1 : 0.35,
                  },
                }}
              />
            ))}
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {copy.description}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
          <Iconify icon="solar:shield-check-bold" width={16} color="success.main" />
          <Typography variant="caption" color="text.secondary">
            Using only your selected academic context and permitted data.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
