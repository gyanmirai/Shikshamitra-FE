import type { ReactNode } from 'react';

import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Stack,
  Alert,
  Button,
  IconButton,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

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
  const [zoom, setZoom] = useState(100);
  const viewportRef = useCallback((viewport: HTMLDivElement | null) => {
    if (!viewport) return undefined;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      setZoom((value) => Math.min(300, Math.max(50, value + (event.deltaY < 0 ? 25 : -25))));
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, []);
  const { layout } = preview;
  const page = getIdentityCardSheetLayout(layout, settings);
  const duplex = settings.sideMode === 'both' && backSideEnabled;
  const side = duplex ? selectedSide : settings.sideMode === 'back' ? 'back' : 'front';
  const back = side === 'back';
  const exact = settings.pageSize === 'Card';
  const { bleedMm, safeInsetMm: inset, margin } = settings;
  const invalid = page.errors.length > 0 || (back && !backSideEnabled);
  if (invalid)
    return <Alert severity="info">Review the print settings to preview the sheet.</Alert>;

  const slots = Array.from(
    { length: Math.min(cardCount ?? page.effectiveCardsPerPage, page.effectiveCardsPerPage) },
    (_, index) => page.position(index, back)
  );
  const { width, height } = page;
  const { widthMm, heightMm } = layout;
  return (
    <Stack spacing={1} alignItems="center" sx={{ width: 1, minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={duplex ? 'space-between' : 'flex-end'}
        flexWrap="wrap"
        gap={1}
        sx={{ width: 1 }}
      >
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
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            ml: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
          }}
        >
          <CustomTooltip title="Zoom out">
            <span>
              <IconButton
                aria-label="Zoom out"
                disabled={zoom <= 50}
                onClick={() => setZoom((value) => Math.max(50, value - 25))}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon="mdi:minus" width={20} />
              </IconButton>
            </span>
          </CustomTooltip>
          <Button size="small" onClick={() => setZoom(100)} aria-label="Reset sheet zoom">
            {zoom}%
          </Button>
          <CustomTooltip title="Zoom in">
            <span>
              <IconButton
                aria-label="Zoom in"
                disabled={zoom >= 300}
                onClick={() => setZoom((value) => Math.min(300, value + 25))}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon="mdi:plus" width={20} />
              </IconButton>
            </span>
          </CustomTooltip>
        </Stack>
      </Stack>
      <Scrollbar
        ref={viewportRef}
        aria-label="Print sheet viewport"
        tabIndex={0}
        sx={{ width: 1, maxHeight: 600 }}
      >
        <Box
          sx={{
            position: 'relative',
            width: `${zoom}%`,
            maxWidth: ((exact ? 440 : 360) * zoom) / 100,
            mx: 'auto',
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
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
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
                <CardCutMarks
                  trim={{ x, y, width: widthMm, height: heightMm }}
                  page={page}
                  settings={settings}
                />
              </g>
            ))}
          </svg>
        </Box>
      </Scrollbar>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {exact ? 'Exact-size page' : `${margin} mm minimum margin · ${settings.gap} mm gap`}
        {bleedMm > 0 && ` · ${bleedMm} mm bleed`}
        {inset > 0 && ` · ${inset} mm safe inset`}
        {back &&
          !exact &&
          ` · ${settings.duplexFlip} flip · back offset ${settings.backOffsetXmm}, ${settings.backOffsetYmm} mm`}
        {back && ` · ${settings.backRotation}° rotation`}
      </Typography>
    </Stack>
  );
}
