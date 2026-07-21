'use client';

import React, { useMemo } from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { computeSlabIssues } from './CollectionCommon';

import type { ILateFeeEscalationRule } from '../../types/finance-policy.types';

interface SlabTimelinePreviewProps {
  rules: ILateFeeEscalationRule[];
}

// A palette cycled per-slab (in sorted day order) so adjacent, non-overlapping
// slabs are visually distinguishable at a glance.
const SLAB_COLORS = ['#3b82f6', '#8b5cf6', '#0ea5e9', '#14b8a6', '#6366f1', '#0891b2'];

export default function SlabTimelinePreview({ rules }: SlabTimelinePreviewProps) {
  const { overlapIndices, gaps } = useMemo(() => computeSlabIssues(rules), [rules]);

  const timelineEnd = useMemo(() => {
    if (rules.length === 0) return 30;
    const lastEnd = Math.max(...rules.map((r) => r.endDay ?? r.startDay + 30));
    return Math.max(lastEnd, 30);
  }, [rules]);

  if (rules.length === 0) return null;

  const sorted = [...rules]
    .map((r, i) => ({ ...r, _index: i }))
    .sort((a, b) => a.startDay - b.startDay);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        Slab Timeline (Day 0 – {timelineEnd})
        {(overlapIndices.length > 0 || gaps.length > 0) && (
          <Box component="span" sx={{ color: 'error.main', fontWeight: 600, ml: 1 }}>
            {overlapIndices.length > 0 && gaps.length > 0
              ? 'Overlapping ranges and gaps detected'
              : overlapIndices.length > 0
                ? 'Overlapping ranges detected'
                : 'Gaps in day coverage detected'}
          </Box>
        )}
      </Typography>

      <Stack
        direction="row"
        sx={{
          position: 'relative',
          height: 28,
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
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
              title={`Day ${slab.startDay} – ${slab.endDay ?? '∞'}: ${slab.calculationType === 'Flat' ? `₹${slab.value}` : `${slab.value}%`}${isOverlap ? ' (overlaps an adjacent slab)' : ''}`}
            >
              <Box
                sx={{
                  width: `${widthPct}%`,
                  minWidth: 4,
                  height: '100%',
                  bgcolor: isOverlap ? 'error.main' : color,
                  backgroundImage: isOverlap
                    ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 4px, transparent 4px, transparent 8px)'
                    : undefined,
                  borderRight: '1px solid',
                  borderColor: 'background.paper',
                  cursor: 'default',
                }}
              />
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
              title={`No slab covers day ${gap.afterDay + 1} – ${gap.beforeDay - 1}`}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  minWidth: 4,
                  height: '100%',
                  bgcolor: 'grey.300',
                  opacity: 0.7,
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}
