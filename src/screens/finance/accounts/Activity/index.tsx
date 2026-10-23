'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
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
  const router = useRouter();
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
  const [filters, setFilters] = useState<IParams['filters']>([]);
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
      filters: serializeFinanceTableFilters(filters),
      page,
      pageSize,
    },
    { skip: !canView || !currentYear?.id, refetchOnMountOrArgChange: true }
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'reference',
        label: 'Receipt / refund no.',
        minWidth: 185,
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'studentName',
        isFilter: true,
        filterType: 'string',
        label: 'Student',
        minWidth: 200,
        render: (value: string) => <Typography variant="body2">{value || 'Student'}</Typography>,
      },
      { id: 'source', label: 'Source', minWidth: 110, isFilter: true, filterType: 'string' },
      {
        id: 'categoryName',
        label: 'Category',
        minWidth: 140,
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'bankLabel',
        label: 'School Bank Account',
        minWidth: 180,
        isFilter: true,
        filterType: 'string',
      },
      {
        cellSx: { textAlign: 'right' as const },
        id: 'amount',
        isFilter: true,
        filterType: 'number',
        label: 'Amount',
        align: 'left',
        minWidth: 125,
        render: (value: number) => fCurrency(value),
      },
      {
        id: 'sourceStatus',
        isFilter: true,
        filterType: 'string',
        label: 'Source status',
        minWidth: 135,
        render: (value: string) => <Chip size="small" variant="soft" label={value} />,
      },
      {
        id: 'accountingStatus',
        isFilter: true,
        filterType: 'string',
        label: 'Accounts journal',
        minWidth: 150,
        render: (value: string) => (
          <Chip size="small" color="warning" variant="soft" label={value} />
        ),
      },
      {
        id: 'occurredAt',
        isFilter: true,
        filterType: 'date',
        label: 'Date',
        minWidth: 145,
        render: (value: string) => fDateTime(value),
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
              setFilters((current) => current.filter((filter) => filter.column !== 'source'));
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
              getRowAction={(row) => {
                const item = row as AccountsActivityRow;
                if (!item.canOpenSource) return undefined;
                const href =
                  item.source === 'Refund'
                    ? financePaths.feeRefund
                    : item.source === 'Collection'
                      ? financePaths.fees.invoicesAndReceipts
                      : item.source === 'Income'
                        ? financePaths.incomeTracking
                        : financePaths.expenseTracking;
                return {
                  label: `Open source for ${item.reference}`,
                  onClick: () => router.push(href),
                };
              }}
              tableId="accounts-income-expense-register"
              exportLabel="Export current page"
              columns={columns}
              data={activity.data?.items || []}
              isLoading={activity.isLoading || activity.isFetching}
              serverSideFilter
              filters={filters}
              onServerFilter={(next) => {
                setFilters(next);
                setPage(1);
              }}
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
