'use client';

import { Box } from '@mui/material';

import { ElementContent } from './preview-element';

import type { IdentityCardBorderStyle, IdentityCardPreviewProps } from './types';

function borderPattern(style: IdentityCardBorderStyle | undefined, width: number) {
  if (!Number.isFinite(width) || width <= 0) return {};
  if (style === 'dashed') return { strokeDasharray: `${4 * width} ${2 * width}` };
  if (style === 'dotted') {
    // A short, nonzero dash keeps rounded dots visible in the PDF SVG renderer.
    return { strokeDasharray: `${0.01 * width} ${2 * width}`, strokeLinecap: 'round' as const };
  }
  return {};
}

export function IdentityCardPreview({
  side = 'front',
  qrCodeEnabled = true,
  barcodeEnabled = true,
  logoHidden = false,
  flat = false,
  ...props
}: IdentityCardPreviewProps & { flat?: boolean }) {
  const { layout } = props;
  const elements = [...(layout[side]?.elements ?? [])]
    .filter(
      (element) =>
        element.visible &&
        (element.type !== 'logo' || !logoHidden) &&
        (element.type !== 'signature' || props.signatureUrl || props.signaturePlaceholder) &&
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
        borderRadius: flat ? 0 : 1.5,
        overflow: 'hidden',
        bgcolor: layout.backgroundColor,
        boxShadow: flat ? 'none' : 2,
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
          const transform = `rotate(${element.rotation ?? 0} ${element.x + element.w / 2} ${element.y + element.h / 2})`;
          if (element.type === 'line' && style.borderStyle) {
            const requestedWidth = style.borderWidth ?? element.h;
            const width = Number.isFinite(requestedWidth) ? Math.max(0, requestedWidth) : 0;
            const centerY = element.y + element.h / 2;
            return (
              <g key={element.id} transform={transform} opacity={element.opacity ?? 1}>
                <line
                  x1={element.x}
                  y1={centerY}
                  x2={element.x + element.w}
                  y2={centerY}
                  stroke={style.borderColor ?? style.backgroundColor ?? layout.themeColor}
                  strokeWidth={width}
                  {...borderPattern(style.borderStyle, width)}
                />
              </g>
            );
          }
          if (element.type === 'shape' || element.type === 'line')
            return (
              <g key={element.id} transform={transform} opacity={element.opacity ?? 1}>
                {style.shape === 'ellipse' ? (
                  <ellipse
                    cx={element.x + element.w / 2}
                    cy={element.y + element.h / 2}
                    rx={element.w / 2}
                    ry={element.h / 2}
                    fill={style.backgroundColor ?? layout.themeColor}
                    stroke={
                      style.borderColor ?? (style.borderStyle ? layout.themeColor : undefined)
                    }
                    strokeWidth={style.borderWidth ?? 0}
                    {...borderPattern(style.borderStyle, style.borderWidth ?? 0)}
                  />
                ) : (
                  <rect
                    x={element.x}
                    y={element.y}
                    width={element.w}
                    height={element.h}
                    rx={style.borderRadius ?? 0}
                    fill={style.backgroundColor ?? layout.themeColor}
                    stroke={
                      style.borderColor ?? (style.borderStyle ? layout.themeColor : undefined)
                    }
                    strokeWidth={style.borderWidth ?? 0}
                    {...borderPattern(style.borderStyle, style.borderWidth ?? 0)}
                  />
                )}
              </g>
            );
          return (
            <g key={element.id} transform={transform} opacity={element.opacity ?? 1}>
              <foreignObject x={element.x} y={element.y} width={element.w} height={element.h}>
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
            </g>
          );
        })}
      </svg>
    </Box>
  );
}
