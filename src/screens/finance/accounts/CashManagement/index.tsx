'use client';

import type { RootState } from 'src/redux/store';
import type { CashRow } from 'src/redux/finance/cashManagementApi';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useGetCashManagementQuery } from 'src/redux/finance/cashManagementApi';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Box, Card, Stack, Alert, Button, Typography, ButtonBase } from '@mui/material';
import { useFinancePermissions } from 'src/screens/finance/hooks/useFinancePermissions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import CashDetails from './CashDetails';
import CashApprovalDialog from './CashApprovalDialog';

const statusOptions = [
  { value: 'all', label: 'All cash', key: 'all', color: 'default' },
  { value: '0', label: 'Pending approval', key: 'pending', color: 'warning' },
  { value: '1', label: 'Approved', key: 'approved', color: 'success' },
] as const;
const moneyColumns = [
  ['amount', 'Collected'],
  ['spentAmount', 'Spent'],
  ['depositedAmount', 'Deposited'],
  ['remainingAmount', 'Remaining cash'],
  ['inTransitAmount', 'In transit'],
];
const columns: IColumn[] = [
  {
    id: 'reference',
    label: 'Receipt / source',
    minWidth: 190,
    sticky: true,
    stickyPosition: 'left',
    stickyOnMobile: false,
    rowHeader: true,
    isFilter: true,
    filterType: 'string',
  },
  { id: 'payerName', label: 'Payer', minWidth: 180, isFilter: true, filterType: 'string' },
  ...moneyColumns.map(([id, label]) => ({
    id,
    label,
    minWidth: 145,
    align: 'left' as const,
    isFilter: true,
    filterType: 'number' as const,
    defaultHidden: id === 'inTransitAmount',
    cellSx: { textAlign: 'right' as const },
    render: (value: number) => formatNumber(value, 'INR'),
  })),
  {
    id: 'bankLabel',
    label: 'Receiving bank',
    minWidth: 220,
    isFilter: true,
    filterType: 'string',
    render: (_value, row) => row.bankLabel || (row.status === 0 ? 'Awaiting approval' : '—'),
  },
  {
    id: 'collectedAt',
    label: 'Collected at',
    minWidth: 190,
    isFilter: true,
    filterType: 'date',
    filterOperators: ['equals', 'after', 'before'],
    render: (value: string) => fDateTime(value),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 155,
    align: 'left',
    sticky: true,
    stickyPosition: 'right',
    isFilter: true,
    filterType: 'enum',
    enumOptions: [
      { value: 0, label: 'Pending approval' },
      { value: 1, label: 'Approved' },
    ],
    render: (value: number) => (
      <Label color={value === 1 ? 'success' : 'warning'}>
        {value === 1 ? 'Approved' : 'Pending approval'}
      </Label>
    ),
  },
];

function readFilters(raw: string | null): IParams['filters'] {
  try {
    const value = JSON.parse(raw || '[]');
    return Array.isArray(value)
      ? value.filter(
          (item) =>
            item &&
            typeof item.column === 'string' &&
            typeof item.type === 'string' &&
            'value' in item
        )
      : [];
  } catch {
    return [];
  }
}

export default function CashManagement() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const access = useFinancePermissions(financePermissions.accounts.cashManagement);
  return (
    <Box
      sx={{
        height: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="Cash Management"
        description="Review collected cash and expenses, then approve the remaining deposit into a school bank account."
        links={[
          { name: 'Finance', href: financePaths.dashboard },
          { name: 'Accounts' },
          { name: 'Cash Management' },
        ]}
      />
      {!access.isReady ? (
        <Typography role="status">Loading permissions…</Typography>
      ) : !access.canView ? (
        <Alert severity="error">You do not have permission to view Cash Management.</Alert>
      ) : !currentYear?.id ? (
        <Alert severity="info">Select an academic year to review cash.</Alert>
      ) : (
        <CashContent key={currentYear.id} academicYearId={currentYear.id} />
      )}
    </Box>
  );
}

export function CashContent({ academicYearId }: { academicYearId: string }) {
  const auth = useSelector((state: RootState) => state.auth);
  const canApprove =
    auth.permissionsInitialized &&
    !auth.loading &&
    hasGrantedPermission(auth.permissions, `${financePermissions.accounts.cashManagement}.Approve`);
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const status = ['0', '1'].includes(params.get('status') || '') ? params.get('status')! : 'all';
  const search = (params.get('search') || '').slice(0, 200);
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = [10, 20, 50, 100].includes(Number(params.get('pageSize')))
    ? Number(params.get('pageSize'))
    : 20;
  const filters = readFilters(params.get('filters'));
  const tableFilters: IParams['filters'] = [
    ...filters.filter((item) => item.column !== 'status'),
    ...(status === 'all'
      ? []
      : [
          {
            column: 'status',
            type: 'equals',
            value: Number(status),
            valueType: 'enum',
            label: 'Status',
            displayValue: status === '0' ? 'Pending approval' : 'Approved',
          },
        ]),
  ];
  const sortBy = params.get('sortBy') || undefined;
  const sortOrder = params.get('sortOrder') === 'desc' ? 'desc' : 'asc';
  const sorts: IParams['sorts'] = sortBy ? [{ column: sortBy, direction: sortOrder }] : [];
  const update = (values: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') next.delete(key);
      else next.set(key, String(value));
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const clearFilters = () =>
    update({ search: undefined, filters: undefined, status: undefined, page: 1 });
  const [selected, setSelected] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const query = useGetCashManagementQuery(
    {
      academicYearId,
      page,
      pageSize,
      status: status === 'all' ? undefined : (Number(status) as 0 | 1),
      search: search || undefined,
      filters: serializeFinanceTableFilters(filters),
      sortBy,
      sortOrder: sortBy ? sortOrder : undefined,
    },
    { refetchOnMountOrArgChange: true }
  );
  const summary = query.isError ? undefined : query.currentData?.summary;
  const counts = query.isError ? undefined : query.currentData?.statusCounts;
  const filtered = Boolean(search || filters.length || status !== 'all');
  const actionsColumn: IColumn = {
    id: 'actions',
    label: 'Actions',
    minWidth: 100,
    align: 'left',
    sticky: true,
    stickyPosition: 'right',
    isFilter: false,
    isSort: false,
    excludeFromExport: true,
    render: (_value, value) => {
      const row = value as CashRow;
      const actions: AdaptiveThreeDotsAction[] = [];
      if (canApprove && row.status === 0)
        actions.push({
          id: 'approve',
          label: `Approve ${row.reference}`,
          icon: GlobalIcons.approveDecision,
          color: 'success.main',
          disabled: query.isFetching || !row.canApprove,
          tooltip: query.isFetching
            ? 'Checking approval availability…'
            : !row.canApprove
              ? row.creatorId === auth.user?.sub
                ? 'Another authorized reviewer must approve this cash.'
                : 'Cash approval is unavailable. Refresh details to check availability.'
              : `Approve ${row.reference}`,
          onClick: () => setApproving(row.id),
        });
      actions.push({
        id: 'view',
        label: `View ${row.reference}`,
        icon: GlobalIcons.eye,
        onClick: () => setSelected(row.id),
      });
      return (
        <AdaptiveThreeDotsActions
          actions={actions}
          moreLabel={`More actions for ${row.reference}`}
          directActionLimit={2}
          collapseOnOverflow={false}
          sx={{ justifyContent: 'flex-end' }}
        />
      );
    },
  };
  return (
    <>
      <Card sx={{ flexShrink: 0, px: 1, boxShadow: 'var(--shadows-4)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minWidth: 0 }}>
          <Box
            role="group"
            aria-label="Approval status"
            sx={{ display: 'flex', gap: 2, overflowX: 'auto', flexShrink: 0 }}
          >
            {statusOptions.map((option) => (
              <ButtonBase
                key={option.value}
                aria-pressed={status === option.value}
                onClick={() =>
                  update({
                    status: option.value,
                    page: 1,
                    filters: JSON.stringify(filters.filter((item) => item.column !== 'status')),
                  })
                }
                sx={{
                  minHeight: 44,
                  gap: 1,
                  px: 1,
                  flexShrink: 0,
                  typography: 'subtitle2',
                  color: status === option.value ? 'text.primary' : 'text.secondary',
                  borderBottom: 2,
                  borderColor: status === option.value ? 'text.primary' : 'transparent',
                  '&.Mui-focusVisible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: -2,
                  },
                }}
              >
                {option.label}
                <Label color={option.color}>{counts?.[option.key] ?? '—'}</Label>
              </ButtonBase>
            ))}
          </Box>
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            spacing={2}
            sx={{ flex: 1, px: 1, py: 1, justifyContent: { md: 'flex-end' }, alignItems: 'center' }}
          >
            {(
              [
                ['collected', 'Collected'],
                ['pendingApproval', 'Pending deposit'],
                ['remaining', 'Remaining'],
              ] as const
            ).map(([key, label]) => (
              <Stack key={key} direction="row" spacing={0.5} alignItems="baseline">
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="subtitle2">
                  {summary ? formatNumber(summary[key], 'INR') : '—'}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Card>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="cash-management"
          tableTitle="Cash Management"
          columns={[...columns, actionsColumn]}
          data={query.isError ? [] : (query.currentData?.items ?? [])}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
          isLoading={query.isFetching && !query.currentData}
          isRefreshing={query.isFetching && Boolean(query.currentData)}
          serverSidePagination
          serverSideSearch
          serverSideFilter
          serverSideSort
          serverSideSortMode="single"
          page={page - 1}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50, 100]}
          totalCount={query.currentData?.totalCount ?? 0}
          searchTerm={search}
          filters={tableFilters}
          sorts={sorts}
          searchFieldProps={{
            placeholder: 'Search receipts or payers…',
            inputProps: { 'aria-label': 'Search cash receipts or payers', maxLength: 200 },
          }}
          onServerSearch={(value) => {
            if (value !== search) update({ search: value, page: 1 });
          }}
          onServerPagination={(next, size) => update({ page: next, pageSize: size })}
          onServerFilter={(next) => {
            const statuses = Array.from(
              new Set(
                next.filter((item) => item.column === 'status').map((item) => String(item.value))
              )
            );
            const value = statuses.length === 1 ? statuses[0] : undefined;
            update({
              filters: JSON.stringify(next.filter((item) => item.column !== 'status')),
              status: value,
              page: 1,
            });
          }}
          onServerSort={(_column, next) =>
            update({ sortBy: next[0]?.column, sortOrder: next[0]?.direction, page: 1 })
          }
          onClearCriteria={clearFilters}
          showExport={false}
          getRowAction={(row) => ({
            label: `Open ${row.reference}`,
            onClick: () => setSelected(row.id),
          })}
          error={query.isError ? query.error : undefined}
          onRetry={() => query.refetch()}
          errorContent={
            query.isError ? (
              <Alert
                severity="error"
                action={<Button onClick={() => query.refetch()}>Retry</Button>}
              >
                Cash could not be loaded.
              </Alert>
            ) : undefined
          }
          noDataText={
            <Stack alignItems="center" spacing={1}>
              <Typography component="span">
                {filtered
                  ? 'No cash matches your filters.'
                  : 'No cash has been collected for this academic year.'}
              </Typography>
              {filtered && (
                <Button size="small" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Stack>
          }
        />
      </Box>
      {selected && (
        <CashDetails
          id={selected}
          academicYearId={academicYearId}
          onClose={() => setSelected(null)}
        />
      )}
      {approving && (
        <CashApprovalDialog
          id={approving}
          academicYearId={academicYearId}
          onClose={() => setApproving(null)}
        />
      )}
    </>
  );
}
