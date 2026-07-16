'use client';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Stack, Paper, Avatar, Tooltip, Typography } from '@mui/material';

import AuditRiskBadge from './badges/AuditRiskBadge';
import AuditActionBadge from './badges/AuditActionBadge';
import AuditSourceBadge from './badges/AuditSourceBadge';
import { groupLogsByDate, getUserInitials } from '../utils/auditFormatters';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  logs: AuditLog[];
  onLogClick?: (log: AuditLog) => void;
  hasActiveFilters?: boolean;
}

/** Timeline view: groups audit logs by date with time-spine layout. */
const AuditTimelineView = ({ logs, onLogClick, hasActiveFilters }: Props) => {
  const theme = useTheme();
  const groups = groupLogsByDate(logs);

  if (logs.length === 0) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 8 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="mdi:timeline-outline" width={32} color="text.disabled" />
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {hasActiveFilters ? 'No logs match your filters' : 'No audit events yet'}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ maxWidth: 360, textAlign: 'center' }}
        >
          {hasActiveFilters
            ? 'Try changing the date range, action, or search keyword.'
            : 'Audit events will appear on the timeline as soon as calendar changes happen.'}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ py: 1 }}>
      {groups.map((group) => (
        <Box key={group.date}>
          {/* Date header */}
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
            <Iconify icon="mdi:calendar-blank-outline" width={16} color="primary.main" />
            <Typography variant="subtitle2" fontWeight={800}>
              {group.label}
            </Typography>
            <Box
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <Typography variant="caption" fontWeight={700} color="primary.main">
                {group.items.length} event{group.items.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Stack>

          {/* Events */}
          <Stack spacing={1}>
            {group.items.map((log, idx) => {
              const ts = dayjs(log.timestamp);
              const isLast = idx === group.items.length - 1;
              return (
                <Box key={log.id} sx={{ display: 'flex', gap: 1 }}>
                  {/* Time + spine */}
                  <Stack alignItems="center" sx={{ minWidth: 64 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {ts.format('hh:mm A')}
                    </Typography>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        mt: 0.5,
                        backgroundColor: 'primary.main',
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    />
                    {!isLast && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          minHeight: 20,
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Stack>

                  {/* Card */}
                  <Paper
                    onClick={() => onLogClick?.(log)}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      p: 1.75,
                      mb: 0,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ sm: 'center' }}
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          {getUserInitials(log.changedByName ?? undefined)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <AuditActionBadge action={log.action} />
                          <Stack
                            direction="row"
                            alignItems="center"
                            gap={1}
                            sx={{ mt: 0.5 }}
                            flexWrap="wrap"
                          >
                            <Typography variant="caption" color="text.secondary">
                              by{' '}
                              <Box component="span" fontWeight={700}>
                                {log.changedByName}
                              </Box>{' '}
                              ({log.changedByRole})
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>

                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Tooltip title={log.entityName ?? ''}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 140 }}
                          >
                            {log.entityName ?? 'Unknown record'}
                          </Typography>
                        </Tooltip>
                        <AuditRiskBadge level={log.riskLevel} showTooltip={false} />
                        <AuditSourceBadge source={log.source} />
                      </Stack>
                    </Stack>

                    {log.reason && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {log.reason}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default AuditTimelineView;
