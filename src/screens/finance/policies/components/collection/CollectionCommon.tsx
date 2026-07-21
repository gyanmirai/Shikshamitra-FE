'use client';

import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';

import type { ILateFeeEscalationRule } from '../../types/finance-policy.types';

// ─── Slab overlap/gap detection ────────────────────────────────────────────────
// Single source of truth for slab-range validity, consumed by both the
// Validation Panel check and the visual SlabTimelinePreview so the two can
// never disagree about which slabs are misconfigured.

export interface ISlabGap {
  afterDay: number;
  beforeDay: number;
}

export interface ISlabIssues {
  /** Indices into the original `rules` array that participate in an overlap. */
  overlapIndices: number[];
  gaps: ISlabGap[];
  hasIssues: boolean;
}

export function computeSlabIssues(rules: ILateFeeEscalationRule[]): ISlabIssues {
  if (!rules || rules.length < 2) return { overlapIndices: [], gaps: [], hasIssues: false };

  const indexed = rules.map((r, i) => ({ ...r, _index: i }));
  const sorted = [...indexed].sort((a, b) => a.startDay - b.startDay);

  const overlapSet = new Set<number>();
  const gaps: ISlabGap[] = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.endDay === null || next.startDay <= current.endDay) {
      // Open-ended slab swallows everything after it, or the ranges intersect.
      overlapSet.add(current._index);
      overlapSet.add(next._index);
    } else if (next.startDay > current.endDay + 1) {
      // A day range with no slab covering it.
      gaps.push({ afterDay: current.endDay, beforeDay: next.startDay });
    }
  }

  return {
    overlapIndices: Array.from(overlapSet),
    gaps,
    hasIssues: overlapSet.size > 0 || gaps.length > 0,
  };
}

// SectionCard helper
export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2.5,
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <Typography variant="h6" fontWeight={700} lineHeight={1.4}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Card>
  );
}

// ValidationCheck helper
export function ValidationCheck({ label, valid }: { label: string; valid: boolean }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.2 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: valid ? 'success.main' : 'action.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.3s',
        }}
      >
        {valid && (
          <Typography sx={{ fontSize: '0.5rem', color: 'white', lineHeight: 1, fontWeight: 900 }}>
            ✓
          </Typography>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{ fontSize: '0.7rem', color: valid ? 'text.primary' : 'text.disabled' }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

// ValidationWarning helper — non-blocking, distinct from ValidationCheck's pass/fail dot.
// Phase 4a's cap-enforcement UX (implementation plan §4b, open question 3 resolved as
// "warning, not hard block" — mirrors how gracePeriodType: WorkingDay degrades rather than
// blocks elsewhere in this feature) surfaces risk without preventing publish.
export function ValidationWarning({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.2 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: 'warning.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: '0.55rem', color: 'white', lineHeight: 1, fontWeight: 900 }}>
          !
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'warning.dark' }}>
        {label}
      </Typography>
    </Stack>
  );
}

// SummaryRow helper
export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.7rem', flexShrink: 0 }}
      >
        {label}
      </Typography>
      {value}
    </Stack>
  );
}
