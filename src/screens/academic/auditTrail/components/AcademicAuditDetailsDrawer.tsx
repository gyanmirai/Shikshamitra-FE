'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Drawer, Divider, Typography, IconButton } from '@mui/material';

import type { AcademicAuditEvent } from 'src/redux/academicAPI/AuditApi/academic-audit-api';

type AcademicAuditDetailsDrawerProps = {
  event: AcademicAuditEvent | null;
  open: boolean;
  onClose: () => void;
};

const isGuid = (val: any) =>
  typeof val === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

const shortenGuid = (val: string) => `${val.slice(0, 8)}...${val.slice(-4)}`;

export const formatActionLabel = (label?: string | null) => {
  if (!label) return '-';
  let formatted = label.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  const verbs = ['added', 'deleted', 'updated', 'created', 'published', 'archived', 'resolved'];
  verbs.forEach((verb) => {
    const regex = new RegExp(`([a-z])(${verb})$`, 'i');
    formatted = formatted.replace(regex, '$1 $2');
  });

  return formatted
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const recursivelyParseJson = (obj: any): any => {
  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj);
      if (typeof parsed === 'object' && parsed !== null) {
        return recursivelyParseJson(parsed);
      }
    } catch {
      // not json, return as is
    }
  }
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(recursivelyParseJson);
    }
    const newObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      newObj[k] = recursivelyParseJson(v);
    }
    return newObj;
  }
  return obj;
};

const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
  let result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix} ${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result = { ...result, ...flattenObject(value, newKey) };
    } else {
      result[newKey] = value;
    }
  }
  return result;
};

const formatContextKey = (key: string) => {
  const spaced = key.replace(/([A-Z])/g, ' $1');
  const capitalized = spaced.charAt(0).toUpperCase() + spaced.slice(1);
  return capitalized.replace(/\sId$/, '').trim();
};

const formatContextValue = (value: any) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  const strVal = String(value);
  if (isGuid(strVal)) return shortenGuid(strVal);
  return strVal;
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
  let parsedContext: Record<string, any> | null = null;
  let rawContextString: string | null = null;

  if (event?.contextJson) {
    try {
      parsedContext = JSON.parse(event.contextJson);
      if (typeof parsedContext === 'object' && parsedContext !== null) {
        parsedContext = flattenObject(recursivelyParseJson(parsedContext));
      } else {
        rawContextString = String(parsedContext);
        parsedContext = null;
      }
    } catch {
      rawContextString = event.contextJson;
    }
  }

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
              <Chip size="small" label={formatActionLabel(event.actionLabel)} variant="soft" color="primary" />
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
            <DetailRow label="Entity ID" value={isGuid(event.entityId) ? shortenGuid(event.entityId) : event.entityId} />
            <DetailRow label="Performed By" value={event.actorDisplayName} />
            <DetailRow label="Role" value={event.actorRoleSnapshot} />
            <DetailRow label="Correlation ID" value={isGuid(event.correlationId) ? shortenGuid(event.correlationId as string) : event.correlationId} />
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

          {(parsedContext || rawContextString) && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Context
              </Typography>
              {parsedContext ? (
                <Stack spacing={1.25} sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  {Object.entries(parsedContext).map(([key, value]) => (
                    <DetailRow key={key} label={formatContextKey(key)} value={formatContextValue(value)} />
                  ))}
                </Stack>
              ) : (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.25,
                    maxHeight: 300,
                    overflow: 'auto',
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    fontSize: 12,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {rawContextString}
                </Box>
              )}
            </Box>
          )}
        </Stack>
      )}
    </Drawer>
  );
};

export default AcademicAuditDetailsDrawer;
