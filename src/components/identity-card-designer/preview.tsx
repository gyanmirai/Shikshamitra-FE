'use client';

import { Box } from '@mui/material';

import { ElementContent } from './preview-element';

import type { IdentityCardPreviewProps } from './types';

export function IdentityCardPreview({
  side = 'front',
  qrCodeEnabled = true,
  barcodeEnabled = true,
  logoHidden = false,
  ...props
}: IdentityCardPreviewProps) {
  const { layout } = props;
  const elements = [...(layout[side]?.elements ?? [])]
    .filter(
      (element) =>
        element.visible &&
        (element.type !== 'logo' || !logoHidden) &&
        (element.type !== 'qr' || qrCodeEnabled) &&
        (element.type !== 'barcode' || barcodeEnabled)
    )
    .sort((a, b) => a.z - b.z);
  return (
    <Box
      sx={{
        width: 1,
        minWidth: 0,
        aspectRatio: `${layout.widthMm} / ${layout.heightMm}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: layout.backgroundColor,
        boxShadow: 2,
      }}
    >
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        role="img"
        aria-label={`${side === 'front' ? 'Front' : 'Back'} identity card preview`}
        style={{ display: 'block' }}
      >
        {elements.map((element) => {
          const style = element.style ?? {};
          if (element.type === 'shape' || element.type === 'line')
            return (
              <rect
                key={element.id}
                x={element.x}
                y={element.y}
                width={element.w}
                height={element.h}
                rx={style.borderRadius ?? 0}
                fill={style.backgroundColor ?? layout.themeColor}
                stroke={style.borderColor}
                strokeWidth={style.borderWidth ?? 0}
              />
            );
          return (
            <foreignObject
              key={element.id}
              x={element.x}
              y={element.y}
              width={element.w}
              height={element.h}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius:
                    style.photoShape === 'circle'
                      ? '50%'
                      : style.photoShape === 'rounded'
                        ? 9
                        : (style.borderRadius ?? 0),
                  background: style.backgroundColor,
                  border: style.borderWidth
                    ? `${style.borderWidth}px solid ${style.borderColor ?? '#C4CDD5'}`
                    : undefined,
                  boxSizing: 'border-box',
                }}
              >
                <ElementContent {...props} element={element} />
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </Box>
  );
}
