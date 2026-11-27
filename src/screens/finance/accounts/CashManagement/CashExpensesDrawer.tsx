'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { CashManagementCriteria } from 'src/redux/finance/cashManagementApi';

import { useState } from 'react';
import { fDateTime } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Alert, Drawer, Button } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetCashExpensesQuery } from 'src/redux/finance/cashManagementApi';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';

const columns: IColumn[] = [
  { id: 'name', label: 'Expense', minWidth: 165, rowHeader: true },
  { id: 'sourceReference', label: 'Cash source', minWidth: 145 },
  {
    id: 'paymentDate',
    label: 'Paid at',
    minWidth: 160,
    render: (value: string) => fDateTime(value),
  },
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 100,
    cellSx: { textAlign: 'right' },
    render: (value: number) => formatNumber(value, 'INR'),
  },
];

export default function CashExpensesDrawer({
  criteria,
  onClose,
}: {
  criteria: CashManagementCriteria;
  onClose: () => void;
}) {
  const [paging, setPaging] = useState({ page: 1, pageSize: 20 });
  const query = useGetCashExpensesQuery({ ...criteria, ...paging });
  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'cash-expenses-title',
        sx: {
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', sm: 'min(760px,92vw)' },
        },
      }}
    >
      <FinancePolicyDrawerHeader
        title="Cash expenses"
        titleId="cash-expenses-title"
        helpText="Cash expenses for the current filters. An expense funded by several cash sources shows the amount used from each source."
        onClose={onClose}
      />
      <Box sx={{ flex: 1, minHeight: 0, p: { xs: 1, sm: 2 } }}>
        <CustomizableTable
          tableId="cash-management-expenses"
          tableTitle="Cash expenses"
          columns={columns}
          data={query.isError ? [] : (query.currentData?.items ?? [])}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
          isLoading={query.isFetching}
          serverSidePagination
          page={paging.page - 1}
          rowsPerPage={paging.pageSize}
          rowsPerPageOptions={[10, 20, 50, 100]}
          totalCount={query.isError ? 0 : (query.currentData?.totalCount ?? 0)}
          onServerPagination={(page, pageSize) => setPaging({ page, pageSize })}
          showExport={false}
          showColumns={false}
          isSearch={false}
          showFullScreen={false}
          error={query.isError ? query.error : undefined}
          onRetry={query.refetch}
          errorContent={
            query.isError ? (
              <Alert severity="error" action={<Button onClick={query.refetch}>Retry</Button>}>
                Cash expenses could not be loaded.
              </Alert>
            ) : undefined
          }
          noDataText="No cash expenses match these filters."
        />
      </Box>
    </Drawer>
  );
}
