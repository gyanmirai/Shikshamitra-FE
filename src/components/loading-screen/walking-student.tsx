'use client';

import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';

const walk = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(-100%)' },
});

export function WalkingStudent() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        flexShrink: 0,
        width: { xs: 160, sm: 192 },
        height: { xs: 240, sm: 288 },
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src="/assets/illustrations/characters/shikshamitra-student-walk.webp"
        alt=""
        draggable={false}
        fetchPriority="high"
        sx={{
          display: 'block',
          width: '800%',
          height: 1,
          maxWidth: 'none',
          animation: `${walk} 1.12s steps(8, end) infinite`,
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            transform: 'translateX(0)',
          },
        }}
      />
    </Box>
  );
}
