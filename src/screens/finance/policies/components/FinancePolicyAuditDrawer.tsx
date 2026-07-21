'use client';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import AuditTimeline from 'src/screens/finance/AuditTrail/components/AuditTimeline';
import { useGetFinanceEntityAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';
import { mapFinanceAuditEventsToLogs } from 'src/screens/finance/AuditTrail/utils/financeAudit.mapper';
import {
  Box,
  Stack,
  Alert,
  Drawer,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';

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
  // Query audit events for the policy.
  // We use 'finance_policy' as the entityType. If it's a specific sub-type, we fallback correctly.
  const { data, isLoading, isError } = useGetFinanceEntityAuditEventsQuery(
    {
      entityType: 'finance_policy',
      entityId: policy?.id || '',
      maxResultCount: 50,
      sorting: 'occurredAt desc',
    },
    { skip: !open || !policy?.id }
  );

  /**
   * Memoization Justification:
   * Prevents re-running the mapping of audit events to UI log objects
   * on every render unless the query response items array referentially changes.
   */
  const logs = useMemo(
    () => (data?.items?.length ? mapFinanceAuditEventsToLogs(data.items) : []),
    [data?.items]
  );

  if (!policy) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 'min(600px, 90vw)' },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Policy Audit Trail
            </Typography>
            <Typography variant="caption" color="text.secondary">
              History of status changes, creation, and updates for &quot;{policy.policyName}&quot;
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Close
          </Button>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
              <CircularProgress size={36} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading audit trail events...
              </Typography>
            </Stack>
          ) : isError ? (
            <Alert severity="warning">Unable to load audit events for this policy.</Alert>
          ) : logs.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
              <Iconify
                icon="mdi:history-off"
                sx={{ width: 48, height: 48, color: 'text.disabled', mb: 1.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                No audit events recorded for this policy.
              </Typography>
            </Stack>
          ) : (
            <AuditTimeline logs={logs} cardVariant="compact" />
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
