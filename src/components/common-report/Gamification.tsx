import { Icon } from '@iconify/react';
import { Box, Stack, Avatar, Tooltip, Typography, LinearProgress } from '@mui/material';

import type { UserStats } from './types';

interface GamificationProps {
  stats: UserStats;
}

export default function Gamification({ stats }: GamificationProps) {
  const progress = (stats.xp % 1000) / 10; // Assuming 1000 XP per level

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Icon icon="ph:fire-fill" color="#FF5630" width={20} />
        <Typography variant="subtitle2" color="text.primary">
          {stats.streak} Day Streak
        </Typography>
      </Stack>

      <Box sx={{ width: 150 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="caption" fontWeight="bold">
            Lvl {stats.level}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stats.xp} XP
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundImage: 'linear-gradient(45deg, #FFAB00 30%, #FFD666 90%)',
            },
          }}
        />
      </Box>

      <Stack direction="row" spacing={1}>
        {stats.badges.map((badge, index) => (
          <Tooltip key={index} title={badge}>
            <Avatar
              sx={{ width: 28, height: 28, bgcolor: 'primary.lighter', color: 'primary.main' }}
            >
              <Icon icon="ph:medal-fill" width={16} />
            </Avatar>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
}
