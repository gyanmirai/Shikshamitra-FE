'use client';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import AuditTimeline from 'src/screens/finance/AuditTrail/components/AuditTimeline';
import {
  Box,
  Stack,
  Alert,
  Paper,
  Drawer,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { useFinancePolicyVersion } from '../hooks/useFinancePolicyVersion';
import { mapPolicyVersionsToAuditLogs } from '../utils/policy-version-audit';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

type FinancePolicyAuditDrawerProps = {
  open: boolean;
  onClose: () => void;
  policy: IFinancePolicyRow | null;
};

export default function FinancePolicyAuditDrawer({
  open,
  onClose,
  policy,
}: FinancePolicyAuditDrawerProps) {
  const { versions, isLoading, isError } = useFinancePolicyVersion({
    open,
    policyId: policy?.id,
    policyType: policy?.policyType,
  });

  const logs = useMemo(
    () => (policy ? mapPolicyVersionsToAuditLogs(versions, policy) : []),
    [policy, versions]
  );

  const latestEventTime = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    return logs[0]?.createdAt ? dayjs(logs[0].createdAt).format('DD-MM-YYYY hh:mm A') : null;
  }, [logs]);

  if (!policy) return null;

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
          width: { xs: '100%', sm: 'min(680px, 92vw)' },
          maxWidth: '100%',
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
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.default, 0.5)
                : alpha(theme.palette.grey[50], 0.8),
            flexShrink: 0,
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.25,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon={GlobalIcons.history} width={22} height={22} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h6" fontWeight={700} noWrap>
                  Policy Audit Trail
                </Typography>
                <CustomTooltip
                  title="Immutable audit event history tracking creation, version increments, and lifecycle state changes"
                  placement="right"
                  arrow
                >
                  <Iconify
                    icon={GlobalIcons.info}
                    color="info.main"
                    width={16}
                    height={16}
                    sx={{ cursor: 'pointer' }}
                  />
                </CustomTooltip>
                <Label color="info" sx={{ height: 20, fontSize: '0.7rem' }}>
                  {policy.policyName}
                </Label>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Immutable event history, status transitions, and modification logs.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            sx={{
              p: 0.75,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="mdi:close" width={20} height={20} />
          </IconButton>
        </Box>

        {/* Audit Stats Banner */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Total Audit Events
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                {logs.length} recorded
              </Typography>
            </Box>
            {latestEventTime && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Latest Activity
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {latestEventTime}
                </Typography>
              </Box>
            )}
          </Stack>
          <Label color="default" sx={{ height: 20, fontSize: '0.65rem' }}>
            Entity:{' '}
            {policy.policyType
              .replace(/(^|_)(\w)/g, (_match, _prefix, letter) => ` ${letter.toUpperCase()}`)
              .trim()}{' '}
            Policy
          </Label>
        </Box>

        {/* Scrollable Timeline */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ p: { xs: 2, sm: 3 }, pb: 6 }}>
            {isLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading audit trail events...
                </Typography>
              </Stack>
            ) : isError ? (
              <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                Unable to load audit events for this policy.
              </Alert>
            ) : logs.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  borderStyle: 'dashed',
                }}
              >
                <Iconify
                  icon="solar:history-bold-duotone"
                  width={48}
                  height={48}
                  sx={{ color: 'text.disabled', mb: 1.5 }}
                />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  No audit events recorded for this policy yet.
                </Typography>
                <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                  Modifications, status updates, and activations will appear here in chronological
                  order.
                </Typography>
              </Paper>
            ) : (
              <AuditTimeline logs={logs} cardVariant="compact" />
            )}
          </Box>
        </Scrollbar>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.neutral',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
