'use client';

import React, { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Stack,
  Alert,
  Paper,
  Drawer,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useFinancePolicyVersion } from '../hooks/useFinancePolicyVersion';
import PolicyAuditTimeline from './version/PolicyAuditTimeline';

import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';

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
  const { versions, isLoading, isError, refetch } = useFinancePolicyVersion({
    open,
    policyId: policy?.id,
    policyType: policy?.policyType,
  });

  const valueContext = useMemo(() => {
    const labelsById: Record<string, string> = {};
    if (policy?.id) labelsById[policy.id.toLowerCase()] = policy.policyName;
    if (policy?.academicYearId && policy.academicYearName) {
      labelsById[policy.academicYearId.toLowerCase()] = policy.academicYearName;
    }
    return { labelsById };
  }, [policy]);

  if (!policy) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.32),
          },
        },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'policy-audit-title',
        sx: {
          width: { xs: '100%', sm: 'min(680px, 92vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        <FinancePolicyDrawerHeader
          title="Policy audit trail"
          titleId="policy-audit-title"
          description={`${policy.policyName} · ${policy.academicYearName || 'Current academic year'}`}
          onClose={onClose}
        />

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
          <Typography variant="subtitle2">
            Recorded activity{!isLoading && !isError && ` (${versions.length})`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Newest first
          </Typography>
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
              <Alert
                severity="warning"
                sx={{ borderRadius: 1.5 }}
                action={
                  <Button size="small" onClick={() => refetch()}>
                    Try again
                  </Button>
                }
              >
                Unable to load audit events for this policy.
              </Alert>
            ) : versions.length === 0 ? (
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
                <Typography
                  variant="caption"
                  color="text.disabled"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  Modifications, status updates, and activations will appear here in chronological
                  order, newest first.
                </Typography>
              </Paper>
            ) : (
              <PolicyAuditTimeline versions={versions} valueContext={valueContext} />
            )}
          </Box>
        </Scrollbar>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            bgcolor: 'background.paper',
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
