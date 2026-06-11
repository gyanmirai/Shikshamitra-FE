'use client';

import type { HrAuditRenderValue } from 'src/utils/hr-audit-format';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { toHrAuditRenderValue } from 'src/utils/hr-audit-format';
import { Box, Chip, Stack, Paper, Typography } from '@mui/material';

type HrAuditValueViewProps = {
  value: unknown;
  label?: string;
  dense?: boolean;
  maxDepth?: number;
  renderValue?: HrAuditRenderValue;
  sourceKey?: string;
};

interface CleanHoliday {
  id?: string;
  holidayName?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  dayCount?: number | string;
  isIncluded?: boolean;
  source?: string;
  notes?: string;
}

function extractHolidays(value: HrAuditRenderValue): CleanHoliday[] {
  const list: CleanHoliday[] = [];

  function traverse(node: HrAuditRenderValue) {
    if (node.kind === 'list') {
      node.items.forEach(traverse);
    } else if (node.kind === 'object') {
      const holiday: CleanHoliday = {};
      node.entries.forEach((entry) => {
        const { key } = entry;
        const valText = entry.value.text;

        if (key === 'id') holiday.id = valText;
        else if (key === 'holidayName') holiday.holidayName = valText;
        else if (key === 'date') holiday.date = valText;
        else if (key === 'fromDate') holiday.fromDate = valText;
        else if (key === 'toDate') holiday.toDate = valText;
        else if (key === 'dayCount') holiday.dayCount = valText;
        else if (key === 'isIncluded') {
          holiday.isIncluded = valText === 'true' || valText === 'Yes' || valText === 'Included';
        } else if (key === 'source') holiday.source = valText;
        else if (key === 'notes') holiday.notes = valText;
      });

      if (holiday.holidayName) {
        list.push(holiday);
      }
    }
  }

  traverse(value);
  return list;
}

function HolidayListRenderer({
  value,
  dense,
  isTruncated,
}: {
  value: HrAuditRenderValue;
  dense: boolean;
  isTruncated: boolean;
}) {
  const holidays = extractHolidays(value);

  if (holidays.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No holidays configured
      </Typography>
    );
  }

  return (
    <Stack spacing={1} sx={{ mt: 0.5, width: '100%' }}>
      {holidays.map((holiday, idx) => {
        const dateStr = holiday.date || holiday.fromDate || 'Unknown date';

        return (
          <Paper
            key={idx}
            variant="outlined"
            sx={{
              p: dense ? 1 : 1.25,
              borderColor: 'divider',
              bgcolor: 'background.neutral',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              borderRadius: 1,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
              <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                  {holiday.holidayName}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Iconify icon="solar:calendar-date-bold-duotone" width={14} height={14} />
                    {dateStr}
                  </Typography>
                  {holiday.dayCount && Number(holiday.dayCount) !== 1 ? (
                    <Chip
                      size="small"
                      variant="soft"
                      color="info"
                      label={`${holiday.dayCount} days`}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  ) : null}
                  {holiday.source ? (
                    <Chip
                      size="small"
                      variant="soft"
                      color="default"
                      label={holiday.source === 'manual' ? 'Manual' : 'Central'}
                      sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize' }}
                    />
                  ) : null}
                </Stack>

                {holiday.notes && holiday.notes !== '-' ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic', mt: 0.25 }}
                  >
                    Note: {holiday.notes}
                  </Typography>
                ) : null}

                {holiday.id && holiday.id !== '-' ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.65rem', display: 'block', mt: 0.25 }}
                  >
                    Ref: <span>{holiday.id}</span>
                  </Typography>
                ) : null}
              </Stack>

              <Chip
                size="small"
                variant="outlined"
                color={holiday.isIncluded !== false ? 'success' : 'error'}
                label={holiday.isIncluded !== false ? 'Included' : 'Excluded'}
                sx={{ flexShrink: 0 }}
              />
            </Stack>
          </Paper>
        );
      })}
      {isTruncated ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center', display: 'block', mt: 0.5, fontStyle: 'italic' }}
        >
          ... and more truncated holidays
        </Typography>
      ) : null}
    </Stack>
  );
}

export function HrAuditValueView({
  value,
  label,
  dense = false,
  maxDepth = 3,
  renderValue,
  sourceKey,
}: HrAuditValueViewProps) {
  const auditValue = renderValue || toHrAuditRenderValue(value, sourceKey);

  const isHolidayList =
    (sourceKey === 'holidays' || sourceKey === 'holidaySummary') &&
    (auditValue.kind === 'list' || auditValue.kind === 'object') &&
    extractHolidays(auditValue).length > 0;

  const isTruncated =
    typeof value === 'string' && (value.endsWith('...') || !value.trim().endsWith(']'));

  return (
    <Stack spacing={dense ? 0.5 : 0.75} sx={{ minWidth: 0 }} data-testid="hr-audit-value">
      {label ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
      ) : null}
      {isHolidayList ? (
        <HolidayListRenderer value={auditValue} dense={dense} isTruncated={isTruncated} />
      ) : (
        <AuditValueNode value={auditValue} dense={dense} depth={0} maxDepth={maxDepth} />
      )}
    </Stack>
  );
}

function AuditValueNode({
  value,
  dense,
  depth,
  maxDepth,
}: {
  value: HrAuditRenderValue;
  dense: boolean;
  depth: number;
  maxDepth: number;
}) {
  if (depth > maxDepth) {
    return (
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value.text || 'Changed'}
      </Typography>
    );
  }

  if (value.kind === 'empty') {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  if (value.kind === 'reference') {
    return (
      <Chip size="small" variant="outlined" label={value.text} sx={{ width: 'fit-content' }} />
    );
  }

  if (value.kind === 'scalar' || value.kind === 'date') {
    return (
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value.text}
      </Typography>
    );
  }

  if (value.kind === 'countSummary') {
    return (
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {value.items.map((item) => (
          <Label
            key={`${item.label}-${item.value}`}
            variant="outlined"
            sx={{
              maxWidth: '100%',
              borderWidth: 1,
            }}
          >
            {item.label} {item.value}
          </Label>
        ))}
      </Stack>
    );
  }

  if (value.kind === 'list') {
    return (
      <Stack spacing={0.75} data-testid="hr-audit-list">
        {value.items.map((item, index) => (
          <Box
            key={`${item.kind}-${index}`}
            sx={{
              p: item.kind === 'object' || item.kind === 'list' ? 0.75 : 0,
              border: item.kind === 'object' || item.kind === 'list' ? '1px solid' : 'none',
              borderColor: 'divider',
              borderRadius: 1,
              minWidth: 0,
            }}
          >
            <AuditValueNode value={item} dense={dense} depth={depth + 1} maxDepth={maxDepth} />
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={dense ? 0.4 : 0.6} data-testid="hr-audit-object">
      {value.entries.map((entry) => (
        <Stack
          key={entry.key}
          direction={{ xs: 'column', sm: dense ? 'column' : 'row' }}
          spacing={dense ? 0.25 : 1}
          sx={{ minWidth: 0 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: dense ? 0 : 140, flexShrink: 0, fontWeight: 700 }}
          >
            {entry.label}
          </Typography>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <AuditValueNode
              value={entry.value}
              dense={dense}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
