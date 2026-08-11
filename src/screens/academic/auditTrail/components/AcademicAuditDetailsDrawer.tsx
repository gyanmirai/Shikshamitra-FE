'use client';

import type { AcademicAuditEvent } from 'src/redux/academicAPI/AuditApi/academic-audit-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Chip, Stack, Button, Drawer, IconButton, Typography } from '@mui/material';

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

export const AcademicAuditDetailsDrawer = ({
  event,
  open,
  onClose,
}: AcademicAuditDetailsDrawerProps) => {
  const contextEntries = parseAcademicAuditContext(event?.contextJson);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Audit Details
            </Typography>
            <CustomTooltip title="Audit trail event details" placement="right" arrow>
              <Iconify
                icon={GlobalIcons.info}
                color="info.main"
                width={16}
                height={16}
                sx={{ cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {event?.occurredAtDisplay || event?.occurredAt || '-'}
          </Typography>
        </Stack>

        <IconButton onClick={onClose} sx={{ p: 0.5, color: 'text.secondary' }}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      <Scrollbar sx={{ flex: 1, '& .simplebar-content': { p: 2 }, p: 1.5 }}>
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
                <Stack
                  spacing={1.25}
                  sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
                >
                  {contextEntries.map((entry) => (
                    <DetailRow key={entry.key} label={entry.label} value={entry.value} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Scrollbar>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.neutral',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
          size="small"
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
};

export default AcademicAuditDetailsDrawer;
