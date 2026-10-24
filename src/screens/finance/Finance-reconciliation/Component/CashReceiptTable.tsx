'use client';

import { useState } from 'react';
import { Box, Alert, Button } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetReconciliationListQuery } from 'src/redux/finance/reconciliation';

export default function CashReceiptTable({ queryParams }: {
  queryParams: { academicYearId: string; month: number; year: number };
}) {
  const [pagination, setPagination] = useState({ page: 0, pageSize: 20 });
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, isError, refetch } = useGetReconciliationListQuery({
    ...queryParams,
    paymentMethod: 'Cash',
    page: pagination.page + 1,
    pageSize: pagination.pageSize,
    search: search || undefined,
  }, { skip: !queryParams.academicYearId });

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Alert severity="info">Cash payments receive an official receipt immediately. Approval is not required. Bank deposit matching is a separate process.</Alert>
      {isError && <Alert severity="error" action={<Button size="small" onClick={() => refetch()}>Retry</Button>}>Unable to load cash receipts.</Alert>}
      <CustomizableTable
        tableId="reconciliation-cash-receipts"
        tableTitle="Cash Official Receipts"
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
        serverSide
        serverSideSearch
        isFilter={false}
        onServerSearch={(value) => {
          setSearch(value);
          setPagination((previous) => ({ ...previous, page: 0 }));
        }}
        page={pagination.page}
        totalCount={data?.totalCount ?? 0}
        maxServerRowsPerPage={pagination.pageSize}
        onServerPagination={(page, pageSize) => setPagination({ page, pageSize })}
        noDataText="No cash receipts for the selected month"
      />
    </Box>
  );
}
