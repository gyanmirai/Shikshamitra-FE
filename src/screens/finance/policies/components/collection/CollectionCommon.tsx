'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import React from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';

import { Box, Paper, Stack, Typography, IconButton } from '@mui/material';

import { validCollectionNumber } from '../../collectionNumericLimits';

import type { ILateFeeEscalationRule } from '../../types/finance-policy.types';
import CustomTooltip from 'src/components/custom-tooltip';

export function CollectionInfoTip({ label, title }: { label: string; title: string }) {
  return (
    <CustomTooltip arrow placement="right" title={title}>
      <IconButton size="small" aria-label={`${label} information`}>
        <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
      </IconButton>
    </CustomTooltip>
  );
}

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
  invalidIndices: number[];
  hasIssues: boolean;
}

export function computeSlabIssues(
  rules: ILateFeeEscalationRule[],
  maximumChargingDays?: number | null
): ISlabIssues {
  if (!rules?.length) return { overlapIndices: [], invalidIndices: [], gaps: [], hasIssues: true };
  const cutoff = maximumChargingDays ?? 365;
  const invalidIndices = rules.flatMap((rule, index) =>
    !validCollectionNumber(rule.startDay, 'days', 1) ||
    rule.startDay > cutoff ||
    (rule.endDay !== null &&
      (!validCollectionNumber(rule.endDay, 'days', 1) ||
        rule.endDay < rule.startDay ||
        rule.endDay > cutoff)) ||
    !validCollectionNumber(
      rule.value,
      rule.calculationType === 'Percentage' ? 'percentage' : 'amount',
      0.01
    ) ||
    !['Flat', 'Percentage'].includes(rule.calculationType) ||
    (rule.maxFee != null && !validCollectionNumber(rule.maxFee, 'amount', 0.01))
      ? [index]
      : []
  );

  const indexed = rules.map((r, i) => ({ ...r, _index: i }));
  const sorted = [...indexed].sort((a, b) => a.startDay - b.startDay);

  const overlapSet = new Set<number>();
  const gaps: ISlabGap[] = [];
  if (sorted[0].startDay > 1) gaps.push({ afterDay: 0, beforeDay: sorted[0].startDay });
  const last = sorted[sorted.length - 1];
  if (maximumChargingDays != null && last.endDay !== null && last.endDay < cutoff)
    gaps.push({ afterDay: last.endDay, beforeDay: cutoff + 1 });

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
    invalidIndices,
    overlapIndices: Array.from(overlapSet),
    gaps,
    hasIssues: invalidIndices.length > 0 || overlapSet.size > 0 || gaps.length > 0,
  };
}

// SectionCard helper
export function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  headerSpacing = 2,
  sx = {},
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  headerSpacing?: number;
  sx?: SxProps<Theme>;
}) {
  return (
    <Paper
      variant="outlined"
      sx={[{ p: 2, borderRadius: 2, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: headerSpacing }}>
        {icon && <Iconify icon={icon} width={20} sx={{ color: 'text.secondary', flexShrink: 0 }} />}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" component="h3">
            {title}
          </Typography>
          {subtitle && (
            <CustomTooltip arrow placement="right" title={subtitle}>
              <IconButton size="small" aria-label={`${title} information`}>
                <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
              </IconButton>
            </CustomTooltip>
          )}
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
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
      <Box sx={{ minWidth: 0, textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</Box>
    </Stack>
  );
}
