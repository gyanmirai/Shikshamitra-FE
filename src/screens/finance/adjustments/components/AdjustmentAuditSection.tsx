'use client';

import { Box, Alert, Typography, CircularProgress } from '@mui/material';
import AuditTimeline from 'src/screens/finance/AuditTrail/components/AuditTimeline';
import { useGetFinanceEntityAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';
import { mapFinanceAuditEventsToLogs } from 'src/screens/finance/AuditTrail/utils/financeAudit.mapper';
import { useFinancePermissions } from 'src/screens/finance/hooks/useFinancePermissions';

import type { AdjustmentAuditTrail } from '../types/adjustment.types';

type AdjustmentAuditSectionProps = {
  adjustmentId: string;
  localAuditTrail?: AdjustmentAuditTrail[];
};

function mapLocalTrail(items: AdjustmentAuditTrail[]) {
  return items.map((item, index) => ({
    id: `local-${index}`,
    subModule: 'Adjustments',
    action: 'ADJUSTMENT',
    description: item.message,
    performedBy: item.actor,
    createdAt: item.createdAt,
  }));
}

export default function AdjustmentAuditSection({
  adjustmentId,
  localAuditTrail,
}: AdjustmentAuditSectionProps) {
  const access = useFinancePermissions('Finance.Auditing');
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    adjustmentId
  );

  const { data, isLoading, isError } = useGetFinanceEntityAuditEventsQuery(
    {
      entityType: 'fee_adjustment',
      entityId: adjustmentId,
      maxResultCount: 20,
    },
    { skip: !isGuid || !access.canView }
  );

  if (!access.canView) return null;

  if (isGuid) {
    if (isLoading) {
      return (
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }
    if (isError) {
      return <Alert severity="warning">Unable to load adjustment audit events.</Alert>;
    }
    const logs = data?.items?.length ? mapFinanceAuditEventsToLogs(data.items) : [];
    if (!logs.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          No audit events recorded for this adjustment yet.
        </Typography>
      );
    }
    return <AuditTimeline logs={logs} cardVariant="compact" />;
  }

  if (localAuditTrail?.length) {
    return <AuditTimeline logs={mapLocalTrail(localAuditTrail)} cardVariant="compact" />;
  }

  return (
    <Typography variant="body2" color="text.secondary">
      Audit history will appear here once the adjustment is saved on the server.
    </Typography>
  );
}
