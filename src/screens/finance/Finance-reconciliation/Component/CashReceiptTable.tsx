'use client';

import { Box, Alert, Button } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetReconciliationListQuery } from 'src/redux/finance/reconciliation';

import { useReconciliationTableQuery } from './useReconciliationTableQuery';

export default function CashReceiptTable({ queryParams }: {
  queryParams: { academicYearId: string; month: number; year: number };
}) {
  const { params, tableProps } = useReconciliationTableQuery({ ...queryParams, paymentMethod: 'Cash' });
  const { data, isLoading, isFetching, isError, refetch } = useGetReconciliationListQuery(params!, {
    skip: !queryParams.academicYearId,
  });

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Alert severity="info">Cash payments receive a receipt immediately. Approval is not required. Bank deposit matching is a separate process.</Alert>
      {isError && <Alert severity="error" action={<Button size="small" onClick={() => refetch()}>Retry</Button>}>Unable to load cash receipts.</Alert>}
      <CustomizableTable
        tableId="reconciliation-cash-receipts"
        tableTitle="Cash Receipts"
        columns={[
          { id: 'receiptNumber', label: 'Receipt No.', minWidth: 160 },
          { id: 'studentName', label: 'Student', minWidth: 180 },
          { id: 'receiptScope', label: 'Receipt Covers', minWidth: 130 },
          { id: 'paymentMethodLabel', label: 'Payment Method', minWidth: 130 },
          { id: 'amount', label: 'Amount Paid', minWidth: 140, render: (value: number) => formatNumber(value, 'INR') },
          { id: 'receiptDate', label: 'Receipt Date', minWidth: 130 },
          { id: 'statusLabel', label: 'Status', minWidth: 170 },
        ].map((column) => ({ ...column, isSort: false, isFilter: false }))}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        {...tableProps}
        totalCount={data?.totalCount ?? 0}
        noDataText="No cash receipts for the selected month"
      />
    </Box>
  );
}
