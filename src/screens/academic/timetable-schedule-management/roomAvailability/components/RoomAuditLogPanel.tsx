'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Alert, Stack, Button, Collapse, Skeleton, Typography } from '@mui/material';

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

// Old/new values are sometimes a serialized JSON snapshot of the entity rather than a
// simple string, so this pulls out human-readable key/value pairs instead of dumping raw JSON.
// Internal IDs and un-decoded enum codes aren't meaningful to a viewer, so they're dropped
// rather than shown as raw numbers/guids.
const HIDDEN_KEY_PATTERN = /id$/i;
const OPAQUE_KEYS = new Set(['status', 'reservationtype']);
// ABP framework bookkeeping fields (auditing/soft-delete/concurrency plumbing) — never business data.
const FRAMEWORK_KEYS = new Set([
  'extraproperties',
  'concurrencystamp',
  'creationtime',
  'lastmodificationtime',
  'isdeleted',
  'deletiontime',
  'tenantid',
]);

const isMeaningfulEntry = ([key, value]: [string, unknown]) => {
  const normalizedKey = key.toLowerCase();
  if (HIDDEN_KEY_PATTERN.test(key)) return false;
  if (OPAQUE_KEYS.has(normalizedKey)) return false;
  if (FRAMEWORK_KEYS.has(normalizedKey)) return false;
  if (value === null || value === undefined || value === '') return false;
  if (value === false) return false;
  if (typeof value === 'object') return false;
  return true;
};

const formatKeyLabel = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
const TIME_ONLY_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;

// Snapshot fields carry full timestamps, but only the date is meaningful here — drop the clock time.
const formatDisplayValue = (value: unknown): string => {
  if (typeof value === 'string' && ISO_DATETIME_PATTERN.test(value)) {
    return dayjs(value).format('DD MMM YYYY');
  }
  if (typeof value === 'string' && TIME_ONLY_PATTERN.test(value)) {
    return value.slice(0, 5);
  }
  return String(value);
};

const formatLogDate = (value: string) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : value;
};

type ParsedAuditValue =
  | { type: 'json'; entries: [string, unknown][] }
  | { type: 'text'; text: string };

const parseAuditValue = (raw?: string | null): ParsedAuditValue | null => {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return { type: 'json', entries: Object.entries(obj).filter(isMeaningfulEntry) };
    }
  } catch {
    /* not JSON — fall through to plain text */
  }
  return { type: 'text', text: raw };
};

interface RoomAuditLogPanelProps {
  roomId?: string | null;
  logs?: AuditLogEntry[];
  compact?: boolean;
  showRoomChip?: boolean;
}

const AuditLogItem = ({
  log,
  isLast,
  showRoomChip,
}: {
  log: AuditLogEntry;
  isLast: boolean;
  showRoomChip: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_ICONS[log.action] || DEFAULT_ICON;
  const oldParsed = parseAuditValue(log.oldValue);
  const newParsed = parseAuditValue(log.newValue);
  const detailEntries = newParsed?.type === 'json' ? newParsed.entries : [];
  const hasJsonDetails = detailEntries.length > 0;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {/* Timeline line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
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
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="subtitle2" fontWeight={700}>
              {log.action}
            </Typography>
            {showRoomChip && log.roomName && (
              <Chip
                size="small"
                icon={<Iconify icon="mdi:door" width={12} />}
                label={log.roomName}
                variant="outlined"
                sx={{ fontSize: 10, height: 20 }}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 1, flexShrink: 0 }}>
            {formatLogDate(log.dateTime)}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          By <strong>{log.user}</strong>
        </Typography>

        {/* Simple string diff (e.g. status change) */}
        {oldParsed?.type === 'text' && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
            <Chip
              size="small"
              label={oldParsed.text}
              variant="outlined"
              color="default"
              sx={{ fontSize: 10, height: 18 }}
            />
            <Iconify icon="mdi:arrow-right" width={12} color="text.disabled" />
            {newParsed?.type === 'text' && (
              <Chip
                size="small"
                label={newParsed.text}
                variant="soft"
                color="primary"
                sx={{ fontSize: 10, height: 18 }}
              />
            )}
          </Stack>
        )}
        {!oldParsed && newParsed?.type === 'text' && (
          <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 0.5 }}>
            {newParsed.text}
          </Typography>
        )}

        {/* JSON snapshot — collapsed behind a toggle instead of dumped raw */}
        {hasJsonDetails && (
          <Box sx={{ mt: 0.5 }}>
            <Button
              size="small"
              variant="text"
              onClick={() => setExpanded((v) => !v)}
              startIcon={
                <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={14} />
              }
              sx={{ fontSize: 11, py: 0, minHeight: 0, px: 0.5 }}
            >
              {expanded ? 'Hide details' : 'View details'}
            </Button>
            <Collapse in={expanded}>
              <Box
                sx={{
                  mt: 0.5,
                  p: 1.25,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.neutral',
                }}
              >
                <Stack spacing={1}>
                  {detailEntries.map(([key, value]) => (
                    <Stack key={key} direction="row" justifyContent="space-between" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        {formatKeyLabel(key)}
                      </Typography>
                      <Typography variant="caption" fontWeight={600} textAlign="right">
                        {formatDisplayValue(value)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </Box>
        )}

        {log.remarks && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.5, fontStyle: 'italic' }}
          >
            &quot;{log.remarks}&quot;
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export const RoomAuditLogPanel = ({
  roomId,
  logs: externalLogs,
  compact = false,
  showRoomChip = false,
}: RoomAuditLogPanelProps) => {
  const { data, isLoading, error, fetch } = useRoomAuditLogs(roomId, { skip: Boolean(externalLogs) });

  useEffect(() => {
    if (!externalLogs) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, externalLogs]);

  const logs = externalLogs || data;

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={64} sx={{ borderRadius: 1.5 }} />
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
      {logs.map((log, idx) => (
        <AuditLogItem
          key={log.id}
          log={log}
          isLast={idx === logs.length - 1}
          showRoomChip={showRoomChip}
        />
      ))}
    </Stack>
  );
};
