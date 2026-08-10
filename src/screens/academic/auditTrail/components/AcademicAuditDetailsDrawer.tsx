'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Drawer, Divider, Typography, IconButton } from '@mui/material';

import type { AcademicAuditEvent } from 'src/redux/academicAPI/AuditApi/academic-audit-api';
import { isGuid, shortenGuid, parseAcademicAuditContext } from '../utils/academicAuditContext';

type AcademicAuditDetailsDrawerProps = {
  event: AcademicAuditEvent | null;
  open: boolean;
  onClose: () => void;
};

export const formatActionLabel = (label?: string | null) => {
  if (!label) return '-';
  const formatted = label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(?=(?:added|deleted|updated|created|published|archived|resolved)\b)/gi, '$1 ');

  return formatted
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const AcademicAuditDetailsDrawer = ({ event, open, onClose }: AcademicAuditDetailsDrawerProps) => {
  const contextEntries = parseAcademicAuditContext(event?.contextJson);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 360, sm: 520 }, p: 2 } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h6">Audit Details</Typography>
          <Typography variant="caption" color="text.secondary">
            {event?.occurredAtDisplay || event?.occurredAt || '-'}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {event && (
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} flexWrap="wrap">
              <Chip size="small" label={event.subModuleDisplayName} variant="soft" color="info" />
              <Chip
                size="small"
                label={formatActionLabel(event.actionLabel)}
                variant="soft"
                color="primary"
              />
            </Stack>
            <Typography variant="subtitle2">{event.summary}</Typography>
            {event.reason && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Reason: {event.reason}
              </Typography>
            )}
          </Box>

          <Stack spacing={1.25}>
            <DetailRow label="Entity" value={`${event.entityName} (${event.entityType})`} />
            <DetailRow
              label="Entity ID"
              value={isGuid(event.entityId) ? shortenGuid(event.entityId) : event.entityId}
            />
            <DetailRow label="Performed By" value={event.actorDisplayName} />
            <DetailRow label="Role" value={event.actorRoleSnapshot} />
            <DetailRow
              label="Correlation ID"
              value={
                isGuid(event.correlationId)
                  ? shortenGuid(event.correlationId as string)
                  : event.correlationId
              }
            />
            <DetailRow label="Source" value={event.source} />
          </Stack>

          {event.changedFields.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Changed Fields
              </Typography>
              <Stack spacing={1}>
                {event.changedFields.map((field) => (
                  <Box
                    key={`${field.field}-${field.newValue}`}
                    sx={{
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {field.displayName || field.field}
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {field.oldValue || '-'} {'->'} {field.newValue || '-'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {contextEntries.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Context
              </Typography>
              <Stack spacing={1.25} sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
                {contextEntries.map((entry) => (
                  <DetailRow key={entry.key} label={entry.label} value={entry.value} />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Drawer>
  );
};

export default AcademicAuditDetailsDrawer;
