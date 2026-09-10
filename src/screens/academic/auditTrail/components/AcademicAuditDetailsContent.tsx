import type { AcademicAuditEvent } from 'src/redux/academicAPI/AuditApi/academic-audit-api';

import { Box, Chip, Stack, Typography } from '@mui/material';

import { parseAcademicAuditContext } from '../utils/academicAuditContext';
import {
  formatActionLabel,
  formatAcademicAuditSource,
  formatAcademicAuditChangedValue,
} from '../utils/academicAuditFormatters';

type AcademicAuditDetailsContentProps = {
  event: AcademicAuditEvent;
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

const AcademicAuditDetailsContent = ({ event }: AcademicAuditDetailsContentProps) => {
  const contextEntries = parseAcademicAuditContext(event.contextJson);

  return (
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

      <Stack
        spacing={1.25}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <DetailRow label="Entity" value={`${event.entityName} (${event.entityType})`} />
        <DetailRow label="Performed By" value={event.actorDisplayName} />
        <DetailRow label="Role" value={event.actorRoleSnapshot} />
        <DetailRow label="Source" value={formatAcademicAuditSource(event.source)} />
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
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere', fontWeight: 600 }}>
                  {formatAcademicAuditChangedValue(event, field, field.oldValue)} {'→'}{' '}
                  {formatAcademicAuditChangedValue(event, field, field.newValue)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {contextEntries.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
            Technical Metadata
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Device, network, and request details
          </Typography>
          <Stack
            spacing={1.25}
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            {contextEntries.map((entry) => (
              <DetailRow key={entry.key} label={entry.label} value={entry.value} />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default AcademicAuditDetailsContent;
