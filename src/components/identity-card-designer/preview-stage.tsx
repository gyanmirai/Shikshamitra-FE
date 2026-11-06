import { Box } from '@mui/material';

import { IdentityCardPreview } from './preview';

import type { IdentityCardElement, IdentityCardPreviewProps } from './types';

export function PreviewStage({
  selectedId,
  onSelect,
  onMove,
  guides,
  safeInsetMm,
  disabled,
  ...props
}: IdentityCardPreviewProps & {
  selectedId: string;
  onSelect: (id: string) => void;
  onMove: (element: IdentityCardElement) => void;
  guides: boolean;
  safeInsetMm: number;
  disabled?: boolean;
}) {
  const {
    layout,
    side = 'front',
    qrCodeEnabled = true,
    barcodeEnabled = true,
    logoHidden = false,
  } = props;
  return (
    <Box
      sx={{
        bgcolor: 'background.neutral',
        p: { xs: 0.75, md: 2.5 },
        borderRadius: 1.5,
        display: 'grid',
        placeItems: 'center',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        containerType: 'size',
      }}
    >
      <Box
        sx={{
          width: `min(100%, ${layout.orientation === 'Vertical' ? 300 : 520}px, calc(100cqh * ${layout.widthMm / layout.heightMm}))`,
          position: 'relative',
        }}
      >
        <IdentityCardPreview {...props} />
        {guides && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              pointerEvents: 'none',
              inset: `${(safeInsetMm / layout.heightMm) * 100}% ${(safeInsetMm / layout.widthMm) * 100}%`,
              border: '1px dashed',
              borderColor: 'warning.main',
              zIndex: 110,
            }}
          />
        )}
        {(layout[side]?.elements ?? [])
          .filter(
            (element) =>
              element.visible &&
              (element.type !== 'logo' || !logoHidden) &&
              (element.type !== 'qr' || qrCodeEnabled) &&
              (element.type !== 'barcode' || barcodeEnabled)
          )
          .map((element) => (
            <Box
              component="button"
              type="button"
              key={element.id}
              aria-label={`Edit ${element.label || element.type}`}
              aria-pressed={selectedId === element.id}
              onClick={() => onSelect(element.id)}
              onKeyDown={(event) => {
                if (
                  disabled ||
                  element.locked ||
                  !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
                )
                  return;
                event.preventDefault();
                const amount = event.shiftKey ? 10 : 1;
                onMove({
                  ...element,
                  x: Math.max(
                    0,
                    Math.min(
                      layout.width - element.w,
                      element.x +
                        (event.key === 'ArrowLeft'
                          ? -amount
                          : event.key === 'ArrowRight'
                            ? amount
                            : 0)
                    )
                  ),
                  y: Math.max(
                    0,
                    Math.min(
                      layout.height - element.h,
                      element.y +
                        (event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0)
                    )
                  ),
                });
              }}
              sx={{
                position: 'absolute',
                left: `${(element.x / layout.width) * 100}%`,
                top: `${(element.y / layout.height) * 100}%`,
                width: `${(element.w / layout.width) * 100}%`,
                height: `${(element.h / layout.height) * 100}%`,
                zIndex: element.z + 1,
                bgcolor: 'transparent',
                border: 'none',
                p: 0,
                cursor: 'pointer',
                outline: selectedId === element.id ? '2px solid' : 'none',
                outlineColor: 'info.main',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'info.main',
                  outlineOffset: 2,
                },
              }}
            />
          ))}
      </Box>
    </Box>
  );
}
