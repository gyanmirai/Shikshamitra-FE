'use client';

import type { HrAuditRenderValue } from 'src/utils/hr-audit-format';

import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { toHrAuditRenderValue } from 'src/utils/hr-audit-format';

type HrAuditValueViewProps = {
  value: unknown;
  label?: string;
  dense?: boolean;
  maxDepth?: number;
  renderValue?: HrAuditRenderValue;
};

export function HrAuditValueView({
  value,
  label,
  dense = false,
  maxDepth = 3,
  renderValue,
}: HrAuditValueViewProps) {
  const auditValue = renderValue || toHrAuditRenderValue(value);

  return (
    <Stack spacing={dense ? 0.5 : 0.75} sx={{ minWidth: 0 }} data-testid="hr-audit-value">
      {label ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
      ) : null}
      <AuditValueNode value={auditValue} dense={dense} depth={0} maxDepth={maxDepth} />
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
          <Chip
            key={`${item.label}-${item.value}`}
            size="small"
            variant="outlined"
            label={`${item.label} ${item.value}`}
            sx={{ maxWidth: '100%' }}
          />
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
