'use client';

import type { Theme } from '@mui/material/styles';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { varAlpha, stylesMode, getSemanticTextStyles } from 'src/theme/styles';
import { Box, Chip, Alert, Stack, Button, Collapse, Skeleton, Typography } from '@mui/material';

import { useRoomAuditLogs } from '../roomAvailability.hooks';

import type { AuditLogEntry } from '../types';

type AuditActionTone = Exclude<LabelColor, 'default'>;
type AuditActionConfig = { icon: string; tone: LabelColor };

const APPROVED_ACTION: AuditActionConfig = {
  icon: 'mdi:check-circle',
  tone: 'success',
};

const REJECTED_ACTION: AuditActionConfig = {
  icon: 'mdi:close-circle',
  tone: 'error',
};

const CANCELLED_ACTION: AuditActionConfig = {
  icon: 'mdi:calendar-remove',
  tone: 'warning',
};

const UPDATED_ACTION: AuditActionConfig = {
  icon: 'mdi:pencil',
  tone: 'info',
};

const ACTION_ICONS: Record<string, AuditActionConfig> = {
  'room reserved': { icon: 'mdi:calendar-plus', tone: 'primary' },
  'reservation created': {
    icon: 'mdi:calendar-plus',
    tone: 'primary',
  },
  approved: APPROVED_ACTION,
  'reservation approved': APPROVED_ACTION,
  rejected: REJECTED_ACTION,
  'reservation rejected': REJECTED_ACTION,
  cancelled: CANCELLED_ACTION,
  'reservation cancelled': CANCELLED_ACTION,
  updated: UPDATED_ACTION,
  'reservation updated': UPDATED_ACTION,
  'maintenance created': { icon: 'mdi:wrench', tone: 'warning' },
  'maintenance completed': {
    icon: 'mdi:check-all',
    tone: 'success',
  },
  'room status changed': {
    icon: 'mdi:swap-horizontal',
    tone: 'info',
  },
  'conflict override': { icon: 'mdi:alert', tone: 'error' },
  'ai suggestion accepted': {
    icon: 'mdi:robot',
    tone: 'primary',
  },
};

const DEFAULT_ICON: AuditActionConfig = { icon: 'mdi:history', tone: 'default' };

export const getRoomAuditActionConfig = (action: string): AuditActionConfig =>
  ACTION_ICONS[action.trim().toLowerCase()] || DEFAULT_ICON;

const getAuditActionTextStyles = (theme: Theme, tone: LabelColor) =>
  tone === 'default' ? { color: theme.vars.palette.text.secondary } : getSemanticTextStyles(theme, tone);

const getAuditActionMarkerStyles = (theme: Theme, tone: LabelColor) => {
  if (tone === 'default') {
    return {
      color: theme.vars.palette.text.secondary,
      backgroundColor: theme.vars.palette.action.hover,
      borderColor: theme.vars.palette.text.secondary,
    };
  }

  const semanticTone = tone as AuditActionTone;
  const palette = theme.vars.palette[semanticTone];

  return {
    ...getAuditActionTextStyles(theme, semanticTone),
    backgroundColor: varAlpha(palette.mainChannel, 0.16),
    borderColor: palette.main,
  };
};

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
  { type: 'json'; entries: [string, unknown][] } | { type: 'text'; text: string };

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
  const config = getRoomAuditActionConfig(log.action);
  const oldParsed = parseAuditValue(log.oldValue);
  const newParsed = parseAuditValue(log.newValue);
  const detailEntries = newParsed?.type === 'json' ? newParsed.entries : [];
  const hasJsonDetails = detailEntries.length > 0;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
      {/* Timeline connector + icon */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          pt: 0.5,
        }}
      >
        <Box
          sx={(theme) => ({
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            border: '2px solid',
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${theme.vars.palette.background.paper}`,
            ...getAuditActionMarkerStyles(theme, config.tone),
          })}
        >
          <Iconify icon={config.icon} width={18} />
        </Box>
        {!isLast && (
          <Box
            sx={{
              width: 2,
              flex: 1,
              bgcolor: 'divider',
              my: 0.75,
              minHeight: 20,
            }}
          />
        )}
      </Box>

      {/* Card content */}
      <Box
        sx={{
          flex: 1,
          mb: isLast ? 0 : 1.5,
          p: 1.5,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '&:hover': {
            borderColor: config.tone === 'default' ? 'text.secondary' : `${config.tone}.main`,
            bgcolor: 'action.hover',
          },
          transition: 'border-color 0.15s, background-color 0.15s',
        }}
      >
        {/* Header row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 0.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Label
              color={config.tone}
              variant="soft"
              sx={{
                fontSize: 11,
                height: 22,
                ...(config.tone !== 'default' && {
                  color: `${config.tone}.darker`,
                  [stylesMode.dark]: { color: `${config.tone}.light` },
                }),
              }}
            >
              {log.action}
            </Label>
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
  const { data, isLoading, isFetching, error, fetch } = useRoomAuditLogs(roomId, {
    skip: Boolean(externalLogs),
  });

  useEffect(() => {
    if (!externalLogs) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, externalLogs]);

  const logs = externalLogs || data;

  if (!externalLogs && (isLoading || isFetching)) {
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
