'use client';

import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';

import { SplashContent } from './splash-content';

type Props = BoxProps & {
  portal?: boolean;
};

export function SplashScreen({ portal = true, sx, ...other }: Props) {
  const content = (
    <Box sx={{ overflow: 'hidden' }}>
      <Box
        role="status"
        aria-live="polite"
        aria-label="Loading ShikshaMitra"
        sx={[
          {
            right: 0,
            width: 1,
            bottom: 0,
            height: 1,
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            alignItems: 'center',
            bgcolor: 'background.default',
            px: 3,
            py: { xs: 7, sm: 8 },
            overflowY: 'auto',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <SplashContent />
      </Box>
    </Box>
  );

  if (portal) {
    return <Portal>{content}</Portal>;
  }

  return content;
}
