'use client';

import { useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Alert, Stack, Skeleton, Typography } from '@mui/material';

import { useRoomAuditLogs } from '../roomAvailability.hooks';

import type { AuditLogEntry } from '../types';

const ACTION_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  'Room Reserved': { icon: 'mdi:calendar-plus', color: 'primary.main', bg: 'primary.lighter' },
  'Reservation Approved': {
    icon: 'mdi:check-circle',
    color: 'success.main',
    bg: 'success.lighter',
  },
  'Reservation Rejected': { icon: 'mdi:close-circle', color: 'error.main', bg: 'error.lighter' },
  'Reservation Cancelled': {
    icon: 'mdi:calendar-remove',
    color: 'warning.main',
    bg: 'warning.lighter',
  },
  'Maintenance Created': { icon: 'mdi:wrench', color: 'warning.main', bg: 'warning.lighter' },
  'Maintenance Completed': { icon: 'mdi:check-all', color: 'success.main', bg: 'success.lighter' },
  'Room Status Changed': { icon: 'mdi:swap-horizontal', color: 'info.main', bg: 'info.lighter' },
  'Conflict Override': { icon: 'mdi:alert', color: 'error.main', bg: 'error.lighter' },
  'AI Suggestion Accepted': { icon: 'mdi:robot', color: 'primary.main', bg: 'primary.lighter' },
};

const DEFAULT_ICON = { icon: 'mdi:history', color: 'text.secondary', bg: 'action.hover' };

interface RoomAuditLogPanelProps {
  roomId?: string | null;
  logs?: AuditLogEntry[];
  compact?: boolean;
}

export const RoomAuditLogPanel = ({
  roomId,
  logs: externalLogs,
  compact = false,
}: RoomAuditLogPanelProps) => {
  const { data, isLoading, error, fetch } = useRoomAuditLogs(roomId);

  useEffect(() => {
    if (!externalLogs) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, externalLogs]);

  const logs = externalLogs || data;

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={64} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (logs.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Iconify icon="mdi:history" width={40} color="text.disabled" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No audit trail entries found.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0}>
      {logs.map((log, idx) => {
        const config = ACTION_ICONS[log.action] || DEFAULT_ICON;
        const isLast = idx === logs.length - 1;

        return (
          <Box key={log.id} sx={{ display: 'flex', gap: 1.5 }}>
            {/* Timeline line */}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: config.bg,
                  color: config.color,
                  mt: 0.5,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={config.icon} width={16} />
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    bgcolor: 'divider',
                    my: 0.5,
                    minHeight: 16,
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, pb: isLast ? 0 : 2, pt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle2">{log.action}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ ml: 1, flexShrink: 0 }}
                >
                  {log.dateTime}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                By <strong>{log.user}</strong>
              </Typography>
              {log.oldValue && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={log.oldValue}
                    variant="outlined"
                    color="default"
                    sx={{ fontSize: 10, height: 18 }}
                  />
                  <Iconify icon="mdi:arrow-right" width={12} color="text.disabled" />
                  {log.newValue && (
                    <Chip
                      size="small"
                      label={log.newValue}
                      variant="soft"
                      color="primary"
                      sx={{ fontSize: 10, height: 18 }}
                    />
                  )}
                </Stack>
              )}
              {!log.oldValue && log.newValue && (
                <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 0.5 }}>
                  {log.newValue}
                </Typography>
              )}
              {log.remarks && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.25, fontStyle: 'italic' }}
                >
                  &quot;{log.remarks}&quot;
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};
