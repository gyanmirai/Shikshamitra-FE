import { Box } from '@mui/material';

import type { IdentityCardLayout } from '../types';

export function CanvasRulers({
  layout,
  children,
}: {
  layout: IdentityCardLayout;
  children: React.ReactNode;
}) {
  const ticks = (length: number) =>
    Array.from({ length: Math.floor(length / 10) + 1 }, (_, i) => i * 10);
  return (
    <Box sx={{ position: 'relative', p: '24px 0 0 24px' }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 24,
          right: 0,
          top: 0,
          height: 20,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {ticks(layout.widthMm).map((mm) => (
          <Box
            key={mm}
            component="span"
            sx={{
              position: 'absolute',
              left: `${(mm / layout.widthMm) * 100}%`,
              fontSize: 10,
              color: 'text.secondary',
              borderLeft: 1,
              borderColor: 'divider',
              pl: 0.25,
            }}
          >
            {mm}
          </Box>
        ))}
      </Box>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 24,
          bottom: 0,
          left: 0,
          width: 20,
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        {ticks(layout.heightMm).map((mm) => (
          <Box
            key={mm}
            component="span"
            sx={{
              position: 'absolute',
              top: `${(mm / layout.heightMm) * 100}%`,
              fontSize: 10,
              color: 'text.secondary',
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {mm}
          </Box>
        ))}
      </Box>
      {children}
    </Box>
  );
}
