'use client';

import type { CashDetail } from 'src/redux/finance/cashManagementApi';

import { useState, useEffect } from 'react';
import { Alert, Button, Skeleton } from '@mui/material';
import { useGetCashDetailQuery } from 'src/redux/finance/cashManagementApi';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import CashCommandDialog from './CashCommandDialog';

export default function CashApprovalDialog({
  id,
  academicYearId,
  onClose,
}: {
  id: string;
  academicYearId: string;
  onClose: () => void;
}) {
  const query = useGetCashDetailQuery({ id, academicYearId }, { refetchOnMountOrArgChange: true });
  const [initialData, setInitialData] = useState<CashDetail | null>(null);
  useEffect(() => {
    if (!initialData && query.currentData && !query.isFetching && !query.isError)
      setInitialData(query.currentData);
  }, [initialData, query.currentData, query.isFetching, query.isError]);
  // Always load current evidence and concurrency stamp before opening a financial command.
  if (initialData) {
    return (
      <CashCommandDialog
        action="approve"
        data={initialData}
        academicYearId={academicYearId}
        onClose={onClose}
        onRefresh={() => query.refetch().unwrap()}
        onSaved={async () => {
          onClose();
        }}
      />
    );
  }
  return (
    <CustomDialog open title="Approve Cash" handleClose={onClose} maxWidth="sm">
      <DialogScrollContent>
        {query.isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Cash details could not be loaded.
          </Alert>
        ) : (
          <Skeleton height={120} role="status" aria-label="Loading cash for approval" />
        )}
      </DialogScrollContent>
    </CustomDialog>
  );
}
