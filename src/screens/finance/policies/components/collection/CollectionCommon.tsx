'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';


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
  icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2.5,
        borderRadius: 1.75,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.98),
        borderColor: (theme) => alpha(theme.palette.divider, 0.9),
        boxShadow: (theme) => `0 4px 16px -8px ${alpha(theme.palette.grey[500], 0.16)}`,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.default, 0.4)
              : alpha(theme.palette.grey[50], 0.8),
          borderRadius: '14px 14px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          {icon && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon={icon} width={18} height={18} />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Card>
  );
}

// ValidationCheck helper
export function ValidationCheck({ label, valid }: { label: string; valid: boolean }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.35 }}>
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: valid ? (theme) => alpha(theme.palette.success.main, 0.12) : 'action.hover',
          color: valid ? 'success.main' : 'text.disabled',
          border: '1px solid',
          borderColor: valid ? 'success.light' : 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.25s ease',
        }}
      >
        {valid ? (
          <Iconify icon={GlobalIcons.tick} width={11} height={11} />
        ) : (
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.72rem',
          fontWeight: valid ? 500 : 400,
          color: valid ? 'text.primary' : 'text.secondary',
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

// ValidationWarning helper
export function ValidationWarning({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ py: 0.35 }}>
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
          color: 'warning.main',
          border: '1px solid',
          borderColor: 'warning.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.1,
        }}
      >
        <Iconify icon={GlobalIcons.alertIcon} width={11} height={11} />
      </Box>
      <Typography
        variant="caption"
        sx={{ fontSize: '0.72rem', color: 'warning.dark', fontWeight: 500, lineHeight: 1.3 }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

// SummaryRow helper
export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
      sx={{
        py: 0.4,
        '&:not(:last-child)': {
          borderBottom: '1px dashed',
          borderColor: (theme) => alpha(theme.palette.divider, 0.6),
        },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.72rem', flexShrink: 0, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Box sx={{ minWidth: 0, textAlign: 'right' }}>{value}</Box>
    </Stack>
  );
}
