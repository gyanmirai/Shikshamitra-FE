'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
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

/** Renders a before/after diff grid or table for an audit log. */
const AuditDiffViewer = ({ diff, variant = 'full', title }: Props) => {
  const theme = useTheme();

  if (!diff || diff.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.grey[500], 0.04),
          border: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <Iconify icon="mdi:file-document-outline" width={28} color="text.disabled" />
        <Typography variant="body2" color="text.secondary" mt={1}>
          No field-level changes recorded
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
          This usually means the record was created new, so there is no earlier version to compare.
        </Typography>
      </Box>
    );
  }

  if (!hasRealChanges(diff) && variant !== 'full') {
    return (
      <Typography variant="caption" color="text.secondary">
        No field-level changes detected.
      </Typography>
    );
  }

  // Table variant for drawers
  if (variant === 'full' || variant === 'compact') {
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
              return (
                <TableRow key={`${d.fieldName}-${i}`} hover>
                  <TableCell sx={{ py: 1, pr: 0, width: 40 }}>
                    <Tooltip title={d.changeType} arrow>
                      <Iconify icon={changeIcons[d.changeType]} width={16} sx={{ color }} />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontWeight: 600 }}>{d.displayName}</TableCell>
                  <TableCell sx={{ py: 1 }}>
                    {d.oldValue ? (
                      <Box
                        component="span"
                        sx={{
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor:
                            d.changeType === 'updated'
                              ? alpha(theme.palette.error.main, 0.06)
                              : 'transparent',
                          color: d.changeType === 'removed' ? 'error.main' : 'text.primary',
                          textDecoration: d.changeType === 'updated' ? 'line-through' : 'none',
                          fontFamily: d.dataType === 'date' ? 'inherit' : 'monospace',
                          fontSize: 12,
                        }}
                      >
                        {d.oldValue}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    {d.newValue ? (
                      <Box
                        component="span"
                        sx={{
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor:
                            d.changeType === 'added'
                              ? alpha(theme.palette.success.main, 0.08)
                              : d.changeType === 'updated'
                                ? alpha(theme.palette.warning.main, 0.08)
                                : 'transparent',
                          color:
                            d.changeType === 'added'
                              ? 'success.main'
                              : d.changeType === 'updated'
                                ? 'warning.dark'
                                : 'text.primary',
                          fontFamily: d.dataType === 'date' ? 'inherit' : 'monospace',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {d.newValue}
                      </Box>
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

  // Inline "table" variant for row expansion
  return (
    <Stack spacing={1}>
      {diff
        .filter((d) => d.changeType !== 'unchanged')
        .map((d, i) => {
          const colorKey = changeColors[d.changeType];
          const color =
            colorKey === 'default' ? theme.palette.text.secondary : theme.palette[colorKey].main;
          return (
            <Box
              key={`${d.fieldName}-${i}`}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${alpha(color, 0.2)}`,
                backgroundColor: alpha(color, 0.03),
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                <Iconify icon={changeIcons[d.changeType]} width={14} sx={{ color }} />
                <Typography variant="caption" fontWeight={700} sx={{ color }}>
                  {d.displayName}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                {d.oldValue && (
                  <Typography
                    variant="caption"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'error.main',
                      fontFamily: 'monospace',
                    }}
                  >
                    {d.oldValue}
                  </Typography>
                )}
                {d.oldValue && d.newValue && (
                  <Iconify icon="mdi:arrow-right" width={12} color="text.secondary" />
                )}
                {d.newValue && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'success.main', fontWeight: 700, fontFamily: 'monospace' }}
                  >
                    {d.newValue}
                  </Typography>
                )}
              </Stack>
            </Box>
          );
        })}
    </Stack>
  );
};

export default AuditDiffViewer;
