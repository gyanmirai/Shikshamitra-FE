'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { RootState } from 'src/redux/store';
import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, Chip, Tab, Typography } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomizableTable from 'src/components/customizabaleTable';
import { financePermissions, financePaths } from 'src/constants/finance-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { useGetAccountsActivityQuery } from 'src/redux/finance/accountsActivityApi';

type SourceFilter = 'all' | 'collection' | 'refund';

export default function AccountsActivity() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, financePermissions.accounts.activity);
  const [source, setSource] = useState<SourceFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const activity = useGetAccountsActivityQuery(
    {
      academicYearId: currentYear?.id || '',
      source: source === 'all' ? undefined : source,
      search: search || undefined,
      page,
      pageSize,
    },
    { skip: !canView || !currentYear?.id }
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
      {
        id: 'amount',
        label: 'Amount',
        align: 'right',
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
        id: 'action',
        label: 'Actions',
        sticky: true,
        minWidth: 100,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const item = row as AccountsActivityRow;
          if (!item.canOpenSource) return null;
          return (
            <Button
              size="small"
              href={
                item.source === 'Refund'
                  ? financePaths.feeRefund
                  : financePaths.fees.invoicesAndReceipts
              }
              aria-label={`Open ${item.source.toLowerCase()} source ${item.reference}`}
            >
              Open source
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Accounts activity"
        description="Accepted fee collections and confirmed refunds, linked to their Fees records."
        links={[{ name: 'Finance', href: financePaths.dashboard }, { name: 'Accounts' }, { name: 'Activity' }]}
      />
      {!canView ? (
        <Alert severity="error">You do not have permission to view Accounts activity.</Alert>
      ) : !currentYear?.id ? (
        <Alert severity="info">Select an academic year to view activity.</Alert>
      ) : (
        <>
          <Alert severity="info">
            These are completed Fees actions. “Not posted” means no General Accounts journal has
            been created; this list does not affect account balances or reports.
          </Alert>
          <CustomTabs
            value={source}
            onChange={(_event, value: SourceFilter) => {
              setSource(value);
              setPage(1);
            }}
          >
            <Tab value="all" label="All" />
            <Tab value="collection" label="Collections" />
            <Tab value="refund" label="Refunds" />
          </CustomTabs>
          {activity.isError && (
            <Alert severity="error" action={<Button onClick={() => activity.refetch()}>Retry</Button>}>
              Accounts activity could not be loaded.
            </Alert>
          )}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <CustomizableTable
              tableId="accounts-activity-table"
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
              noDataText="No accepted collections or confirmed refunds found."
            />
          </Box>
        </>
      )}
    </Box>
  );
}
