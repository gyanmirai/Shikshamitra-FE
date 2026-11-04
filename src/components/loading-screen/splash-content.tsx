'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { WalkingStudent } from './walking-student';

export function SplashContent() {
  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{ position: 'absolute', top: { xs: 24, sm: 32 }, left: { xs: 24, sm: 32 } }}
      >
        ShikshaMitra
      </Typography>
      <Box
        sx={{
          width: 1,
          maxWidth: 640,
          flexShrink: 0,
          my: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 2, sm: 5 },
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        <WalkingStudent />
        <Box sx={{ width: 1, maxWidth: 300 }}>
          <Typography
            variant="subtitle2"
            sx={[
              { color: 'primary.dark', mb: 1.5 },
              (theme) => theme.applyStyles('dark', { color: 'primary.light' }),
            ]}
          >
            Your school companion
          </Typography>
          <Typography component="h1" variant="h4" sx={{ mb: 1.5 }}>
            A new day.
            <br />A little step ahead.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Getting your school workspace ready.
          </Typography>
          <LinearProgress
            aria-label="Loading your school workspace"
            sx={{
              borderRadius: 1,
              '@media (prefers-reduced-motion: reduce)': {
                '& .MuiLinearProgress-bar': {
                  animation: 'none',
                  transform: 'none',
                  width: '35%',
                },
                '& .MuiLinearProgress-bar2Indeterminate': { display: 'none' },
              },
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1.5 }}>
            Loading ShikshaMitra…
          </Typography>
        </Box>
      </Box>
    </>
  );
}
