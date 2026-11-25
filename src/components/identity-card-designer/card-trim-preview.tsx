import type { ReactNode } from 'react';

import { Box } from '@mui/material';

import { getIdentityCardSheetLayout } from './geometry';
import { CardCutMarks, CUT_MARK_REACH_MM } from './cut-marks';

import type { IdentityCardLayout, IdentityCardPrintSettings } from './types';

export function CardTrimPreview({
  layout,
  settings,
  back,
  children,
}: {
  layout: IdentityCardLayout;
  settings: IdentityCardPrintSettings;
  back: boolean;
  children: ReactNode;
}) {
  const sheet = getIdentityCardSheetLayout(layout, settings);
  if (!settings.showCutMarks || settings.pageSize !== 'A4' || sheet.errors.length) return children;

  const trim = { ...sheet.position(0, back), width: layout.widthMm, height: layout.heightMm };
  const padding = settings.bleedMm + CUT_MARK_REACH_MM + 0.5;
  const width = trim.width + 2 * padding;
  const height = trim.height + 2 * padding;
  return (
    <Box
      sx={{
        position: 'relative',
        px: `${(padding / width) * 100}%`,
        py: `${(padding / width) * 100}%`,
        borderRadius: 1.5,
        bgcolor: 'common.white',
      }}
    >
      {children}
      <svg
        role="img"
        aria-label="Card cut marks"
        viewBox={`${trim.x - padding} ${trim.y - padding} ${width} ${height}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <CardCutMarks trim={trim} page={sheet} settings={settings} />
      </svg>
    </Box>
  );
}
