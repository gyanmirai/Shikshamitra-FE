'use client';

import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Divider, CardHeader, IconButton, Typography } from '@mui/material';

// -----------------------------------------------------------------------
// Colour helpers

const hexToRgb = (hex: string): [number, number, number] => {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h, 16);
  const r = Math.floor(n / 65536) % 256;
  const g = Math.floor(n / 256) % 256;
  const b = n % 256;
  return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((x) =>
      Math.max(0, Math.min(255, Math.round(x)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;

const darken = (hex: string, amt: number) => {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r - amt, g - amt, b - amt);
};

const lighten = (hex: string, amt: number) => {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amt, g + amt, b + amt);
};

// -----------------------------------------------------------------------
// Flat donut chart with radial-gradient 3-D shading (pure SVG)

interface Seg {
  val: number;
  startA: number;
  endA: number;
  midA: number;
  color: string;
  label: string;
  idx: number;
}

interface DonutShadeProps {
  series: number[];
  labels: string[];
  colors: string[];
  totalLabel?: string;
  selectedIdx?: number | null;
  onSliceClick?: (idx: number) => void;
}

const SEG_GAP = 1.2;

const DonutShade: React.FC<DonutShadeProps> = ({
  series,
  labels,
  colors,
  totalLabel = 'Present',
  selectedIdx = null,
  onSliceClick,
}) => {
  const W = 400;
  const H = 400;
  const CX = 200;
  const CY = 200;
  const RO = 155;
  const RI = 88;

  const sum = series.reduce((a, b) => a + b, 0);

  const segs: Seg[] = useMemo(() => {
    let angle = -90;
    return series.map((v, i) => {
      const span = (v / sum) * 360;
      const startA = angle + SEG_GAP / 2;
      const endA = angle + span - SEG_GAP / 2;
      const midA = angle + span / 2;
      angle += span;
      return { val: v, startA, endA, midA, color: colors[i], label: labels[i], idx: i };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, labels, colors]);

  const pt = (a: number, r: number): [number, number] => {
    const rad = (a * Math.PI) / 180;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  };

  const segPath = (s: number, e: number, rO: number, rI: number) => {
    const [x1, y1] = pt(s, rO);
    const [x2, y2] = pt(e, rO);
    const [x3, y3] = pt(e, rI);
    const [x4, y4] = pt(s, rI);
    const lg = e - s > 180 ? 1 : 0;
    return (
      `M${x1},${y1}` +
      `A${rO},${rO} 0 ${lg} 1 ${x2},${y2}` +
      `L${x3},${y3}` +
      `A${rI},${rI} 0 ${lg} 0 ${x4},${y4}Z`
    );
  };

  const labelXY = (seg: Seg) => pt(seg.midA, (RO + RI) / 2);

  const expandedSegPath = (seg: Seg) => {
    const EXPAND = 10;
    const rad = (seg.midA * Math.PI) / 180;
    const dx = EXPAND * Math.cos(rad);
    const dy = EXPAND * Math.sin(rad);
    const [x1, y1] = pt(seg.startA, RO);
    const [x2, y2] = pt(seg.endA, RO);
    const [x3, y3] = pt(seg.endA, RI);
    const [x4, y4] = pt(seg.startA, RI);
    const lg = seg.endA - seg.startA > 180 ? 1 : 0;
    return (
      `M${x1 + dx},${y1 + dy}` +
      `A${RO},${RO} 0 ${lg} 1 ${x2 + dx},${y2 + dy}` +
      `L${x3 + dx},${y3 + dy}` +
      `A${RI},${RI} 0 ${lg} 0 ${x4 + dx},${y4 + dy}Z`
    );
  };

  const centerLabel =
    selectedIdx !== null && selectedIdx !== undefined ? labels[selectedIdx] : totalLabel;
  const centerValue = selectedIdx !== null && selectedIdx !== undefined ? series[selectedIdx] : sum;
  const centerColor =
    selectedIdx !== null && selectedIdx !== undefined ? colors[selectedIdx] : '#111';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ overflow: 'visible', display: 'block' }}
      aria-label="Shift Monitoring Donut Chart"
    >
      <defs>
        <filter id="dsf" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.20)" />
        </filter>
        {segs.map((s) => (
          <radialGradient
            key={`rg-${s.idx}`}
            id={`rg-${s.idx}`}
            cx="33%"
            cy="28%"
            r="72%"
            fx="33%"
            fy="28%"
          >
            <stop offset="0%" stopColor={lighten(s.color, 80)} />
            <stop offset="35%" stopColor={lighten(s.color, 35)} />
            <stop offset="68%" stopColor={s.color} />
            <stop offset="100%" stopColor={darken(s.color, 28)} />
          </radialGradient>
        ))}
        <radialGradient id="hl-overlay" cx="40%" cy="18%" r="52%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g filter="url(#dsf)">
        {segs.map((seg) => {
          const isSelected = selectedIdx === seg.idx;
          const isOtherSelected = selectedIdx !== null && selectedIdx !== undefined && !isSelected;
          return (
            <path
              key={`seg-${seg.idx}`}
              d={isSelected ? expandedSegPath(seg) : segPath(seg.startA, seg.endA, RO, RI)}
              fill={`url(#rg-${seg.idx})`}
              opacity={isOtherSelected ? 0.45 : 1}
              style={{ cursor: 'pointer', transition: 'opacity 0.25s, d 0.25s' }}
              onClick={() => onSliceClick?.(seg.idx)}
            />
          );
        })}
        {segs.map((seg) => {
          const isSelected = selectedIdx === seg.idx;
          return (
            <path
              key={`hl-${seg.idx}`}
              d={isSelected ? expandedSegPath(seg) : segPath(seg.startA, seg.endA, RO, RI)}
              fill="url(#hl-overlay)"
              style={{ pointerEvents: 'none' }}
            />
          );
        })}
        <circle cx={CX} cy={CY} r={RI - 2} fill="white" />
      </g>

      <text x={CX} y={CY - 18} textAnchor="middle" fill="#888" fontSize="13" fontFamily="inherit">
        {centerLabel}:
      </text>
      <text
        x={CX}
        y={CY + 16}
        textAnchor="middle"
        fill={centerColor}
        fontSize="30"
        fontWeight="800"
        fontFamily="inherit"
      >
        {centerValue}
      </text>
      {selectedIdx !== null && selectedIdx !== undefined && (
        <text x={CX} y={CY + 38} textAnchor="middle" fill="#aaa" fontSize="11" fontFamily="inherit">
          click again to reset
        </text>
      )}

      {segs.map((seg) => {
        const isSelected = selectedIdx === seg.idx;
        const isOtherSelected = selectedIdx !== null && selectedIdx !== undefined && !isSelected;
        if (isOtherSelected) return null;
        const span = seg.endA - seg.startA;
        const pct = Math.round((seg.val / sum) * 100);
        const [r, g, b] = hexToRgb(seg.color);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const tc = lum > 0.68 ? '#333' : 'white';

        if (span >= 14) {
          // Label inside the slice
          const [lx, ly] = labelXY(seg);
          return (
            <g key={`lbl-${seg.idx}`} style={{ pointerEvents: 'none' }}>
              <text
                x={lx}
                y={ly - 9}
                textAnchor="middle"
                fill={tc}
                fontSize="11"
                fontWeight="700"
                fontFamily="inherit"
              >
                {seg.label}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor="middle"
                fill={tc}
                fontSize="12"
                fontWeight="800"
                fontFamily="inherit"
              >
                {seg.val} ({pct}%)
              </text>
            </g>
          );
        }

        // Small slice — draw leader line outside
        const LEADER = 22;
        const TICK = 10;
        const [ox, oy] = pt(seg.midA, RO);
        const [lx, ly] = pt(seg.midA, RO + LEADER);
        const isRight = lx >= CX;
        const tx = isRight ? lx + TICK : lx - TICK;
        const anchor = isRight ? 'start' : 'end';
        return (
          <g key={`lbl-${seg.idx}`} style={{ pointerEvents: 'none' }}>
            <line x1={ox} y1={oy} x2={lx} y2={ly} stroke={seg.color} strokeWidth="1.2" />
            <line x1={lx} y1={ly} x2={tx} y2={ly} stroke={seg.color} strokeWidth="1.2" />
            <text
              x={tx + (isRight ? 3 : -3)}
              y={ly - 6}
              textAnchor={anchor}
              fill={seg.color}
              fontSize="10"
              fontWeight="700"
              fontFamily="inherit"
            >
              {seg.label}
            </text>
            <text
              x={tx + (isRight ? 3 : -3)}
              y={ly + 7}
              textAnchor={anchor}
              fill="#555"
              fontSize="10"
              fontWeight="600"
              fontFamily="inherit"
            >
              {seg.val} ({pct}%)
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// -----------------------------------------------------------------------

const AttendanceShiftMonitoring = () => {
  const theme = useTheme();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const SHIFT_DATA = [
    {
      id: 1,
      shift: 'Morning (7 AM - 3 PM)',
      total: 45,
      present: 40,
      late: 3,
      absent: 2,
      color: theme.palette.success.main,
    },
    {
      id: 2,
      shift: 'General (9 AM - 5 PM)',
      total: 52,
      present: 44,
      late: 5,
      absent: 3,
      color: theme.palette.info.main,
    },
    {
      id: 3,
      shift: 'Afternoon (12 PM - 8 PM)',
      total: 15,
      present: 12,
      late: 2,
      absent: 1,
      color: theme.palette.warning.main,
    },
    {
      id: 4,
      shift: 'Split Shift',
      total: 6,
      present: 4,
      late: 1,
      absent: 1,
      color: theme.palette.secondary.main,
    },
  ];

  const chartColors = SHIFT_DATA.map((s) => s.color);
  const chartSeries = SHIFT_DATA.map((s) => s.present);
  const chartLabels = SHIFT_DATA.map((s) => s.shift.split(' (')[0]);

  const handleSliceClick = (idx: number) => {
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Shift Monitoring</Typography>
            <CustomTooltip title="Shift-wise attendance breakdown" placement="top">
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        sx={{ p: 2, pb: 1 }}
      />

      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ my: 1, maxWidth: 280, mx: 'auto' }}>
          <DonutShade
            series={chartSeries}
            labels={chartLabels}
            colors={chartColors}
            totalLabel="Present"
            selectedIdx={selectedIdx}
            onSliceClick={handleSliceClick}
          />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

        <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1}>
          {SHIFT_DATA.map((s, i) => (
            <Stack
              key={s.id}
              direction="row"
              alignItems="center"
              spacing={0.75}
              onClick={() => handleSliceClick(i)}
              sx={{
                cursor: 'pointer',
                opacity: selectedIdx !== null && selectedIdx !== i ? 0.45 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: chartColors[i],
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {chartLabels[i]}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

export default AttendanceShiftMonitoring;
