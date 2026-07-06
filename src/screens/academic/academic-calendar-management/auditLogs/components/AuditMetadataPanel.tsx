'use client';

import { useTheme, alpha } from '@mui/material/styles';
import { Box, Stack, Paper, Typography, Divider } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import type { AuditLogMetadata } from '../types/auditLogs.types';

interface Props {
  metadata?: AuditLogMetadata;
  /** When false (limited permission), sensitive fields are masked. */
  showSensitive?: boolean;
}

const maskValue = (v?: string) => (v ? `${v.slice(0, 4)}••••` : '—');

/** Technical metadata panel: IP, device, browser, session, etc. */
const AuditMetadataPanel = ({ metadata, showSensitive = true }: Props) => {
  const theme = useTheme();

  if (!metadata) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          No technical metadata recorded.
        </Typography>
      </Paper>
    );
  }

  const rows: Array<{ label: string; value?: string; icon: string; sensitive?: boolean }> = [
    {
      label: 'IP Address',
      value: metadata.ipAddress,
      icon: 'mdi:ip-network-outline',
      sensitive: true,
    },
    { label: 'Device', value: metadata.device, icon: 'mdi:devices' },
    { label: 'Browser', value: metadata.browser, icon: 'mdi:google-chrome' },
    { label: 'Operating System', value: metadata.operatingSystem, icon: 'mdi:monitor' },
    { label: 'Session ID', value: metadata.sessionId, icon: 'mdi:identifier', sensitive: true },
    { label: 'Request Path', value: metadata.requestPath, icon: 'mdi:link-variant' },
    { label: 'HTTP Method', value: metadata.httpMethod, icon: 'mdi:swap-horizontal' },
    { label: 'API Version', value: metadata.apiVersion, icon: 'mdi:tag-outline' },
  ].filter((r) => r.value);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          p: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Iconify icon="mdi:server-network" width={16} color="primary.main" />
          <Typography variant="subtitle2" fontWeight={700}>
            Technical Metadata
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ p: 1.5 }}>
        {rows.map((r, i) => (
          <Box key={r.label}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ py: 0.75 }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Iconify icon={r.icon} width={14} color="text.secondary" />
                <Typography variant="caption" color="text.secondary">
                  {r.label}
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ fontFamily: 'monospace', maxWidth: 180 }}
                noWrap
              >
                {r.sensitive && !showSensitive ? maskValue(r.value) : r.value}
              </Typography>
            </Stack>
            {i < rows.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default AuditMetadataPanel;
