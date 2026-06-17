'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Drawer, IconButton, Typography, CircularProgress } from '@mui/material';
import { useGetFinanceStudentAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';

import AuditTimeline from './AuditTimeline';
import { mapFinanceAuditEventsToLogs } from '../utils/financeAudit.mapper';

type FinanceFeeAuditDrawerProps = {
  open: boolean;
  studentId: string | null;
  studentName?: string;
  onClose: () => void;
};

export default function FinanceFeeAuditDrawer({
  open,
  studentId,
  studentName,
  onClose,
}: FinanceFeeAuditDrawerProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data, isLoading, isError, refetch } = useGetFinanceStudentAuditEventsQuery(
    {
      studentId: studentId ?? '',
      academicYearId: currentYear?.id,
      maxResultCount: 50,
      skipCount: 0,
      sorting: 'occurredAt desc',
    },
    { skip: !open || !studentId || !currentYear?.id }
  );

  const logs = data?.items ? mapFinanceAuditEventsToLogs(data.items) : [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Fee Audit Trail
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {studentName || 'Student activity'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {isError && (
          <Alert
            severity="error"
            action={
              <IconButton size="small" onClick={() => refetch()}>
                <Iconify icon="mdi:refresh" width={18} />
              </IconButton>
            }
          >
            Failed to load audit events.
          </Alert>
        )}
        {!isLoading && !isError && <AuditTimeline logs={logs} cardVariant="compact" />}
      </Box>
    </Drawer>
  );
}
