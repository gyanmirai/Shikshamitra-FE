import type { ReactNode } from 'react';

import { useState } from 'react';
import { Box, Stack, Alert, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { CardCutMarks } from './cut-marks';
import { IdentityCardPreview } from './preview';
import { getIdentityCardSheetLayout } from './geometry';

import type { IdentityCardPreviewProps, IdentityCardPrintSettings } from './types';

type Side = 'front' | 'back';

export function IdentityCardSheetPreview({
  settings,
  backSideEnabled,
  cardCount,
  renderCard,
  ...preview
}: IdentityCardPreviewProps & {
  settings: IdentityCardPrintSettings;
  backSideEnabled: boolean;
  cardCount?: number;
  renderCard?: (index: number, side: Side) => ReactNode;
}) {
  const [selectedSide, setSelectedSide] = useState<Side>('front');
  const { layout } = preview;
  const page = getIdentityCardSheetLayout(layout, settings);
  const duplex = settings.sideMode === 'both' && backSideEnabled;
  const side = duplex ? selectedSide : settings.sideMode === 'back' ? 'back' : 'front';
  const back = side === 'back';
  const exact = settings.pageSize === 'Card';
  const { bleedMm, safeInsetMm: inset, margin } = settings;
  if (page.errors.length || (back && !backSideEnabled))
    return <Alert severity="info">Review the print settings to preview the sheet.</Alert>;

  const slots = Array.from(
    { length: Math.min(cardCount ?? page.effectiveCardsPerPage, page.effectiveCardsPerPage) },
    (_, index) => page.position(index, back)
  );
  const { width, height } = page;
  const { widthMm, heightMm } = layout;
  return (
    <Stack spacing={1} alignItems="center" sx={{ width: 1, minWidth: 0 }}>
      {duplex && (
        <ToggleButtonGroup
          exclusive
          size="small"
          value={side}
          aria-label="Print preview side"
          onChange={(_event, value: Side | null) => {
            if (value) setSelectedSide(value);
          }}
        >
          <ToggleButton value="front">Front sheet</ToggleButton>
          <ToggleButton value="back">Back sheet</ToggleButton>
        </ToggleButtonGroup>
      )}
      <Box
        sx={{
          position: 'relative',
          width: 1,
          maxWidth: exact ? 440 : 360,
          aspectRatio: `${width} / ${height}`,
          bgcolor: 'common.white',
          outline: '1px solid',
          outlineColor: 'divider',
        }}
      >
        {slots.map(({ x, y }, index) => (
          <Box
            key={index}
            aria-hidden
            data-card-artwork=""
            sx={{
              position: 'absolute',
              left: `${(x / width) * 100}%`,
              top: `${(y / height) * 100}%`,
              width: `${(widthMm / width) * 100}%`,
              transform: back && settings.backRotation === 180 ? 'rotate(180deg)' : undefined,
              ...(bleedMm > 0 && {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: `-${(bleedMm / heightMm) * 100}% -${(bleedMm / widthMm) * 100}%`,
                  bgcolor: layout.backgroundColor,
                },
                '& > *': { position: 'relative' },
              }),
            }}
          >
            {renderCard ? (
              renderCard(index, side)
            ) : (
              <IdentityCardPreview {...preview} side={side} signaturePlaceholder={false} flat />
            )}
          </Box>
        ))}
        <svg
          role="img"
          aria-label={`${back ? 'Back' : 'Front'} ${exact ? 'exact-size card' : 'A4 sheet'} preview`}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {!exact && margin > 0 && (
            <rect
              x={margin}
              y={margin}
              width={width - 2 * margin}
              height={height - 2 * margin}
              fill="none"
              stroke="#526779"
              strokeWidth={0.3}
              strokeDasharray="2 1.4"
            />
          )}
          {slots.map(({ x, y }, index) => (
            <g key={index} fill="none" strokeWidth={0.25}>
              {bleedMm > 0 && (
                <rect
                  x={x - bleedMm}
                  y={y - bleedMm}
                  width={page.slotWidth}
                  height={page.slotHeight}
                  stroke="#005caa"
                  strokeDasharray="1.2 0.8"
                />
              )}
              <rect data-trim="" x={x} y={y} width={widthMm} height={heightMm} stroke="#526779" />
              {inset > 0 && (
                <rect
                  x={x + inset}
                  y={y + inset}
                  width={widthMm - 2 * inset}
                  height={heightMm - 2 * inset}
                  stroke="#a34215"
                  strokeDasharray="0.5 0.6"
                />
              )}
              <CardCutMarks trim={{ x, y, width: widthMm, height: heightMm }} page={page} settings={settings} />
            </g>
          ))}
        </svg>
      </Box>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {exact ? 'Exact-size page' : `${margin} mm minimum margin · ${settings.gap} mm gap`}
        {bleedMm > 0 && ` · ${bleedMm} mm bleed`}
        {inset > 0 && ` · ${inset} mm safe inset`}
        {back && !exact &&
          ` · ${settings.duplexFlip} flip · back offset ${settings.backOffsetXmm}, ${settings.backOffsetYmm} mm`}
        {back && ` · ${settings.backRotation}° rotation`}
      </Typography>
    </Stack>
  );
}
