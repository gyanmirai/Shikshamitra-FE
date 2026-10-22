'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { CustomTabs } from 'src/components/custom-tabs';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Chip, Alert, Button, Typography } from '@mui/material';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useGetAccountsActivityQuery } from 'src/redux/finance/accountsActivityApi';

type SourceFilter = 'all' | 'collection' | 'refund' | 'income' | 'expense';

export default function AccountsActivity({ embedded = false }: { embedded?: boolean }) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canViewFees = hasGrantedPermission(permissions, financePermissions.accounts.activity);
  const canViewIncome = hasGrantedPermission(
    permissions,
    `${financePermissions.accounts.income}.View`
  );
  const canViewExpense = hasGrantedPermission(
    permissions,
    `${financePermissions.accounts.expense}.View`
  );
  const canView = canViewFees || canViewIncome || canViewExpense;
  const [source, setSource] = useState<SourceFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const effectiveSource =
    ((source === 'collection' || source === 'refund') && !canViewFees) ||
    (source === 'income' && !canViewIncome) ||
    (source === 'expense' && !canViewExpense)
      ? 'all'
      : source;
  const activity = useGetAccountsActivityQuery(
    {
      academicYearId: currentYear?.id || '',
      source: effectiveSource === 'all' ? undefined : effectiveSource,
      search: search || undefined,
      page,
      pageSize,
    },
    { skip: !canView || !currentYear?.id, refetchOnMountOrArgChange: true }
  );

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'reference', label: 'Receipt / refund no.', minWidth: 185 },
      {
        id: 'studentName',
        label: 'Student',
        minWidth: 200,
        render: (value: string) => <Typography variant="body2">{value || 'Student'}</Typography>,
      },
      { id: 'source', label: 'Source', minWidth: 110 },
      { id: 'categoryName', label: 'Category', minWidth: 140 },
      { id: 'bankLabel', label: 'School Bank Account', minWidth: 180 },
      {
        cellSx: { textAlign: 'right' as const },
        id: 'amount',
        label: 'Amount',
        align: 'left',
        minWidth: 125,
        render: (value: number) => fCurrency(value),
      },
      {
        id: 'sourceStatus',
        label: 'Source status',
        minWidth: 135,
        render: (value: string) => <Chip size="small" variant="soft" label={value} />,
      },
      {
        id: 'accountingStatus',
        label: 'Accounts journal',
        minWidth: 150,
        render: (value: string) => (
          <Chip size="small" color="warning" variant="soft" label={value} />
        ),
      },
      {
        id: 'occurredAt',
        label: 'Date',
        minWidth: 145,
        render: (value: string) => fDateTime(value),
      },
      {
        align: 'left',
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'action',
        label: 'Actions',
        sticky: true,
        minWidth: 100,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const item = row as AccountsActivityRow;
          if (!item.canOpenSource) return null;
          const destination =
            item.source === 'Refund'
              ? 'Refunds'
              : item.source === 'Collection'
                ? 'Receipts'
                : item.source === 'Income'
                  ? 'Other income'
                  : 'School expenses';
          return (
            <Button
              size="small"
              href={
                item.source === 'Refund'
                  ? financePaths.feeRefund
                  : item.source === 'Collection'
                    ? financePaths.fees.invoicesAndReceipts
                    : item.source === 'Income'
                      ? financePaths.incomeTracking
                      : financePaths.expenseTracking
              }
              aria-label={`Open ${destination} for ${item.reference}`}
            >
              Open {destination}
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {!embedded && (
        <CustomBreadcrumbs
          description="Fee collections, confirmed refunds, and manual school entries in one register."
          heading="Income & expenses"

          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Accounts' },
            { name: 'Income & expenses' },
          ]}
        />
      )}
      {!canView ? (
        <Alert severity="error">You do not have permission to view Income & Expenses.</Alert>
      ) : !currentYear?.id ? (
        <Box>Select an academic year to view activity.</Box>
      ) : (
        <>
          <CustomTabs
            value={effectiveSource}
            onChange={(_event, value: SourceFilter) => {
              setSource(value);
              setPage(1);
            }}
          >
            <Tab value="all" label="All" />
            {canViewFees && <Tab value="collection" label="Collections" />}
            {canViewFees && <Tab value="refund" label="Refunds" />}
            {canViewIncome && <Tab value="income" label="Income" />}
            {canViewExpense && <Tab value="expense" label="Expenses" />}
          </CustomTabs>
          {activity.isError && (
            <Alert
              severity="error"
              action={<Button onClick={() => activity.refetch()}>Retry</Button>}
            >
              Income & Expenses could not be loaded.
            </Alert>
          )}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <CustomizableTable
              tableId="accounts-income-expense-register"
              exportLabel="Export current page"
              columns={columns}
              data={activity.data?.items || []}
              isLoading={activity.isLoading || activity.isFetching}
              serverSidePagination
              serverSideSearch
              page={page - 1}
              rowsPerPage={pageSize}
              searchTerm={search}
              totalCount={activity.data?.totalCount || 0}
              onServerPagination={(nextPage, nextSize) => {
                setPage(nextPage);
                setPageSize(nextSize);
              }}
              onServerSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              noDataText="No completed collections, refunds, or manual entries found."
            />
          </Box>
        </>
      )}
    </Box>
  );
}
