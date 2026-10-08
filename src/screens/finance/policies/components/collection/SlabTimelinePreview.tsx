'use client';

import React, { useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { computeSlabIssues } from './CollectionCommon';

import type { ILateFeeEscalationRule } from '../../types/finance-policy.types';

interface SlabTimelinePreviewProps {
  rules: ILateFeeEscalationRule[];
  maximumChargingDays?: number | null;
}

// A palette cycled per-slab (in sorted day order) so adjacent, non-overlapping
// slabs are visually distinguishable at a glance.
const SLAB_COLORS = [
  '#0284c7', // Sky
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#4f46e5', // Indigo
  '#0d9488', // Teal
];

export default function SlabTimelinePreview({
  rules,
  maximumChargingDays,
}: SlabTimelinePreviewProps) {
  const { overlapIndices, gaps, hasIssues, invalidIndices } = useMemo(
    () => computeSlabIssues(rules, maximumChargingDays),
    [rules, maximumChargingDays]
  );

  const timelineEnd = useMemo(() => {
    if (rules.length === 0) return 30;
    const lastEnd = Math.max(...rules.map((r) => r.endDay ?? maximumChargingDays ?? 365));
    return Math.max(lastEnd, 30);
  }, [rules, maximumChargingDays]);

  if (rules.length === 0) return null;

  const sorted = [...rules]
    .map((r, i) => ({ ...r, _index: i }))
    .sort((a, b) => a.startDay - b.startDay);

  if (invalidIndices.length > 0)
    return (
      <Typography variant="caption" color="error.main" sx={{ mb: 2, display: 'block' }}>
        Correct slab days and values to preview coverage.
      </Typography>
    );

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          Slab Coverage Timeline (Day 1 – {timelineEnd})
        </Typography>

        {hasIssues && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'error.main' }}>
            <Iconify icon={GlobalIcons.alertIcon} width={14} height={14} />
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
              {overlapIndices.length > 0 && gaps.length > 0
                ? 'Overlaps & gaps detected'
                : overlapIndices.length > 0
                  ? 'Overlapping slabs detected'
                  : 'Gaps between slabs detected'}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Stack
        direction="row"
        sx={{
          position: 'relative',
          height: 32,
          width: '100%',
          borderRadius: 1.5,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: hasIssues ? 'error.light' : 'divider',
          bgcolor: (theme) => varAlpha(theme.vars.palette.background.defaultChannel, 0.6),
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {sorted.map((slab, sortedIdx) => {
          const isOverlap = overlapIndices.includes(slab._index);
          const effectiveEnd = slab.endDay ?? timelineEnd;
          const widthPct = (Math.max(effectiveEnd - slab.startDay + 1, 1) / timelineEnd) * 100;
          const color = SLAB_COLORS[sortedIdx % SLAB_COLORS.length];

          return (
            <Tooltip
              key={slab._index}
              arrow
              placement="top"
              title={
                <Box sx={{ p: 0.5, textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={700} display="block">
                    Day {slab.startDay} – {slab.endDay ?? '∞'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Fee: {slab.calculationType === 'Flat' ? `₹${slab.value}` : `${slab.value}%`}
                  </Typography>
                  {isOverlap && (
                    <Typography
                      variant="caption"
                      color="error.light"
                      fontWeight={600}
                      display="block"
                    >
                      ⚠️ Overlaps adjacent slab!
                    </Typography>
                  )}
                </Box>
              }
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${((slab.startDay - 1) / timelineEnd) * 100}%`,
                  width: `${widthPct}%`,
                  minWidth: 6,
                  height: '100%',
                  bgcolor: isOverlap ? 'error.main' : color,
                  backgroundImage: isOverlap
                    ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 5px, transparent 5px, transparent 10px)'
                    : undefined,
                  borderRight: '1.5px solid',
                  borderColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.88,
                  },
                }}
              >
                {widthPct > 12 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      px: 0.5,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {slab.calculationType === 'Flat' ? `₹${slab.value}` : `${slab.value}%`}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}

        {gaps.map((gap, i) => {
          const widthPct = (Math.max(gap.beforeDay - gap.afterDay - 1, 1) / timelineEnd) * 100;
          const leftPct = (gap.afterDay / timelineEnd) * 100;
          return (
            <Tooltip
              key={`gap-${i}`}
              arrow
              placement="top"
              title={`Gap: No slab defined for Day ${gap.afterDay + 1} – ${gap.beforeDay - 1}`}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  minWidth: 6,
                  height: '100%',
                  bgcolor: 'warning.light',
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 3px, transparent 3px, transparent 6px)',
                  opacity: 0.85,
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}
