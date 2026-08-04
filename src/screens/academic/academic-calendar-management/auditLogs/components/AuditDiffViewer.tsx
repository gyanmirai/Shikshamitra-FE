'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

import { hasRealChanges } from '../utils/auditDiff.utils';

import type { AuditLogDiff } from '../types/auditLogs.types';

interface Props {
  diff?: AuditLogDiff[];
  variant?: 'table' | 'compact' | 'full';
  title?: string;
}

const changeColors = {
  added: 'success',
  updated: 'warning',
  removed: 'error',
  unchanged: 'default',
} as const;

const changeIcons = {
  added: 'mdi:plus-circle-outline',
  updated: 'mdi:pencil-circle-outline',
  removed: 'mdi:minus-circle-outline',
  unchanged: 'mdi:circle-small',
} as const;

const STATUS_ENUM_MAP: Record<string, string> = {
  '1': 'Active',
  '2': 'Cancelled',
  '3': 'Rescheduled',
  '4': 'Approved',
  '5': 'Rejected',
  '6': 'Published',
  '7': 'Locked',
  '8': 'Archived',
};

const DAY_TYPE_MAP: Record<string, string> = {
  '1': 'Working Day',
  '2': 'Holiday',
  '3': 'Emergency Closure',
  '4': 'Event / Activity',
};

const APPROVAL_STATUS_MAP: Record<string, string> = {
  '0': 'Not Required',
  '1': 'Pending Approval',
  '2': 'Approved',
  '3': 'Rejected',
};

/** Format raw database values & enum integers to human-readable labels. */
const formatDiffValue = (fieldName: string, rawVal: string | null | undefined): string => {
  if (rawVal === null || rawVal === undefined || rawVal === '') return '—';

  const key = fieldName.toLowerCase();
  if (key === 'status' || key === 'daystatus') {
    return STATUS_ENUM_MAP[rawVal] || rawVal;
  }
  if (key === 'daytype') {
    return DAY_TYPE_MAP[rawVal] || rawVal;
  }
  if (key === 'approvalstatus') {
    return APPROVAL_STATUS_MAP[rawVal] || rawVal;
  }
  if (rawVal === 'true') return 'Yes';
  if (rawVal === 'false') return 'No';

  return rawVal;
};

/** Renders a before/after diff grid or table for an audit log. */
const AuditDiffViewer = ({ diff, variant = 'full', title }: Props) => {
  const theme = useTheme();

  // Compact / single-line empty state when expanded in table or when no diff exists
  if (!diff || diff.length === 0 || (!hasRealChanges(diff) && variant !== 'full')) {
    return (
      <Box
        sx={{
          py: 1.25,
          px: 2,
          borderRadius: 1.5,
          backgroundColor: alpha(theme.palette.grey[500], 0.04),
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Iconify icon="mdi:file-document-outline" width={18} color="text.secondary" />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          No field-level changes recorded
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
          New record creation (no prior version to compare)
        </Typography>
      </Box>
    );
  }

  // Table variant for drawers or dedicated diff modals
  if (variant === 'full') {
    return (
      <Box>
        {title && (
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
            <Iconify icon="mdi:compare-horizontal" width={16} color="primary.main" />
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            <Chip
              size="small"
              label={`${diff.filter((d) => d.changeType !== 'unchanged').length} changes`}
              color="primary"
              variant="soft"
              sx={{ height: 18, fontSize: 10 }}
            />
          </Stack>
        )}
        <Table size="small" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  py: 1,
                  width: 40,
                }}
              >
                Type
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  py: 1,
                }}
              >
                Field
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  py: 1,
                }}
              >
                Before
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  py: 1,
                }}
              >
                After
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diff.map((d, i) => {
              const colorKey = changeColors[d.changeType];
              const color =
                colorKey === 'default'
                  ? theme.palette.text.secondary
                  : theme.palette[colorKey].main;
              const beforeVal = formatDiffValue(d.fieldName, d.oldValue);
              const afterVal = formatDiffValue(d.fieldName, d.newValue);

              return (
                <TableRow key={`${d.fieldName}-${i}`} hover>
                  <TableCell sx={{ py: 1, pr: 0, width: 40 }}>
                    <Tooltip title={d.changeType} arrow>
                      <Iconify icon={changeIcons[d.changeType]} width={16} sx={{ color }} />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontWeight: 700, color: 'text.primary' }}>
                    {d.displayName || d.fieldName}
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    {d.oldValue !== null && d.oldValue !== undefined ? (
                      <Chip
                        size="small"
                        variant="soft"
                        color="error"
                        label={beforeVal}
                        sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          textDecoration: d.changeType === 'updated' ? 'line-through' : 'none',
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                          color: theme.palette.error.dark,
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    {d.newValue !== null && d.newValue !== undefined ? (
                      <Chip
                        size="small"
                        variant="soft"
                        color="success"
                        label={afterVal}
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          bgcolor: alpha(theme.palette.success.main, 0.12),
                          color: theme.palette.success.dark,
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    );
  }

  // Inline "compact" variant for table row expansion
  return (
    <Stack spacing={1}>
      {diff
        .filter((d) => d.changeType !== 'unchanged')
        .map((d, i) => {
          const isAdded = d.changeType === 'added';
          const isRemoved = d.changeType === 'removed';
          const beforeVal = formatDiffValue(d.fieldName, d.oldValue);
          const afterVal = formatDiffValue(d.fieldName, d.newValue);

          return (
            <Paper
              key={`${d.fieldName}-${i}`}
              elevation={0}
              sx={{
                p: 1.25,
                px: 1.75,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (t: any) => alpha(t.palette.background.neutral, 0.4),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 160 }}>
                <Iconify
                  icon={changeIcons[d.changeType]}
                  width={16}
                  color={
                    isAdded
                      ? theme.palette.success.main
                      : isRemoved
                        ? theme.palette.error.main
                        : theme.palette.info.main
                  }
                />
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  {d.displayName || d.fieldName}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={1.25} flexWrap="wrap">
                {d.oldValue !== null && d.oldValue !== undefined && (
                  <Chip
                    size="small"
                    variant="soft"
                    color="error"
                    label={`Before: ${beforeVal}`}
                    sx={{
                      fontWeight: 600,
                      fontSize: 11,
                      textDecoration: isAdded ? 'none' : 'line-through',
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.dark,
                    }}
                  />
                )}
                {d.oldValue !== null &&
                  d.oldValue !== undefined &&
                  d.newValue !== null &&
                  d.newValue !== undefined && (
                    <Iconify icon="mdi:arrow-right" width={14} color="text.secondary" />
                  )}
                {d.newValue !== null && d.newValue !== undefined && (
                  <Chip
                    size="small"
                    variant="soft"
                    color="success"
                    label={`After: ${afterVal}`}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      bgcolor: alpha(theme.palette.success.main, 0.12),
                      color: theme.palette.success.dark,
                    }}
                  />
                )}
              </Stack>
            </Paper>
          );
        })}
    </Stack>
  );
};

export default AuditDiffViewer;
