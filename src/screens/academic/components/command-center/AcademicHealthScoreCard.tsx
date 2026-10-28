'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Chip, Stack, Typography, LinearProgress } from '@mui/material';

import type { AcademicHealthFactor } from './types';

type AcademicHealthScoreCardProps = {
  score: number;
  title: string;
  status: string;
  description: string;
  factors: AcademicHealthFactor[];
};

const statusTone = (score: number): 'success' | 'warning' | 'error' => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
};

export function AcademicHealthScoreCard({
  score,
  title,
  status,
  description,
  factors,
}: AcademicHealthScoreCardProps) {
  const theme = useTheme();
  const scoreAvailable = Number.isFinite(score);
  const tone = scoreAvailable ? statusTone(score) : 'info';
  const toneMain = theme.palette[tone].main;

  return (
    <Card
      component="section"
      aria-label={title}
      sx={{
        p: 2,
        height: '100%',
        border: `1px solid ${alpha(toneMain, 0.24)}`,
        bgcolor: alpha(toneMain, 0.05),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
            <Typography variant="h3" sx={{ lineHeight: 1 }}>
              {scoreAvailable ? score : '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              / 100
            </Typography>
          </Stack>
        </Box>
        <Chip
          size="small"
          color={tone}
          variant="soft"
          icon={<Iconify icon="mdi:pulse" />}
          label={scoreAvailable ? status : 'Unavailable'}
        />
      </Stack>

      {scoreAvailable && (
        <LinearProgress
          variant="determinate"
          value={Math.min(Math.max(score, 0), 100)}
          color={tone}
          sx={{ my: 1.5, height: 8, borderRadius: 1 }}
        />
      )}
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>

      {scoreAvailable ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
            mt: 1.5,
          }}
        >
          {factors.map((factor) => (
            <Box key={factor.label} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {factor.label}
              </Typography>
              <Typography variant="subtitle2" color={`${factor.tone}.main`} noWrap>
                {factor.value}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Academic health data is unavailable.
        </Typography>
      )}
    </Card>
  );
}
