'use client';

import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Card, Stack, Alert, Button, Typography } from '@mui/material';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useGetCashManagementQuery } from 'src/redux/finance/cashManagementApi';
import { useFinancePermissions } from 'src/screens/finance/hooks/useFinancePermissions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import CashDetails from './CashDetails';
import CashBulkDepositDialog from './CashBulkDepositDialog';
import { academicMonthOptions, defaultAcademicMonth } from '../Registers/academicMonths';
import { bankAccountReturnTo, readBankAccountEntryContext } from '../bankAccountEntryContext';

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
  ...[
    ['amount', 'Collected'],
    ['spentAmount', 'Spent'],
    ['depositedAmount', 'Deposited'],
    ['remainingAmount', 'Remaining cash'],
    ['inTransitAmount', 'In transit'],
  ].map(([id, label]) => ({
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
    render: (value: string) => value || '—',
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
];

function readFilters(raw: string | null): IParams['filters'] {
  try {
    const value = JSON.parse(raw || '[]');
    return Array.isArray(value)
      ? value.filter(
          (item) =>
            item &&
            typeof item.column === 'string' &&
            item.column !== 'status' &&
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
        description="Review collected cash and expenses, then deposit available academic-year cash into a school bank account."
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
        <CashContent
          key={`${currentYear.id}:${currentYear.startDate}:${currentYear.endDate}`}
          academicYearId={currentYear.id}
        />
      )}
    </Box>
  );
}

export function CashContent({ academicYearId }: { academicYearId: string }) {
  const auth = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const canDeposit =
    auth.permissionsInitialized &&
    !auth.loading &&
    hasGrantedPermission(auth.permissions, `${financePermissions.accounts.cashManagement}.Deposit`);
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const entryContext = readBankAccountEntryContext(params, academicYearId, 'deposit');
  const returnTo =
    params.get('academicYearId') === academicYearId
      ? bankAccountReturnTo(params.get('returnTo'))
      : null;
  const requestedCashId =
    params.get('academicYearId') === academicYearId ? params.get('cashId') : null;
  const months = academicMonthOptions(currentYear);
  const requestedMonth = params.get('month');
  const month =
    requestedMonth === 'all' ||
    (requestedMonth && months.some((item) => item.value === requestedMonth))
      ? requestedMonth
      : defaultAcademicMonth(months);
  const boards: Board[] = currentYear?.boards ?? [];
  const boardId = boards.some((item) => item.id === params.get('boardId'))
    ? params.get('boardId')!
    : 'all';
  const mediums = boards.find((item) => item.id === boardId)?.educationMediums ?? [];
  const mediumId = mediums.some((item) => item.id === params.get('mediumId'))
    ? params.get('mediumId')!
    : 'all';
  const search = (params.get('search') || '').slice(0, 200);
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = [10, 20, 50, 100].includes(Number(params.get('pageSize')))
    ? Number(params.get('pageSize'))
    : 20;
  const filters = readFilters(params.get('filters'));
  const sortBy = columns.some((column) => column.id === params.get('sortBy'))
    ? params.get('sortBy')!
    : undefined;
  const sortOrder = params.get('sortOrder') === 'desc' ? 'desc' : 'asc';
  const sorts: IParams['sorts'] = sortBy ? [{ column: sortBy, direction: sortOrder }] : [];
  const update = (values: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params.toString());
    next.delete('status');
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === '' || (value === 'all' && key !== 'month'))
        next.delete(key);
      else next.set(key, String(value));
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const clearFilters = () =>
    update({
      search: undefined,
      filters: undefined,
      boardId: undefined,
      mediumId: undefined,
      month: 'all',
      page: 1,
    });
  const [selected, setSelected] = useState<string | null>(null);
  const deposit = useBoolean();
  const openBankDeposit = deposit.onTrue;
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const depositButton = useRef<HTMLButtonElement>(null);
  const closeDeposit = () => {
    deposit.onFalse();
    if (entryContext) {
      router.push(entryContext.returnTo);
      return;
    }
    requestAnimationFrame(() => depositButton.current?.focus());
  };
  const query = useGetCashManagementQuery(
    {
      academicYearId,
      page,
      pageSize,
      boardId: boardId === 'all' ? undefined : boardId,
      mediumId: mediumId === 'all' ? undefined : mediumId,
      month: month === 'all' ? undefined : Number(month.slice(5)),
      year: month === 'all' ? undefined : Number(month.slice(0, 4)),
      search: search || undefined,
      filters: serializeFinanceTableFilters(filters),
      sortBy,
      sortOrder: sortBy ? sortOrder : undefined,
    },
    { refetchOnMountOrArgChange: true }
  );
  const summary = query.isError ? undefined : query.currentData?.yearSummary;
  const availableCash = query.isError ? undefined : query.currentData?.availableCash;
  const consumedDeposit = useRef('');
  const requestedDepositKey = entryContext
    ? `${academicYearId}:${entryContext.bankAccountId}:${entryContext.returnTo}`
    : '';
  useEffect(() => {
    if (
      !requestedDepositKey ||
      !canDeposit ||
      query.isFetching ||
      query.isError ||
      !availableCash ||
      availableCash <= 0 ||
      consumedDeposit.current === requestedDepositKey
    )
      return;
    consumedDeposit.current = requestedDepositKey;
    setDepositAmount(availableCash);
    openBankDeposit();
  }, [
    requestedDepositKey,
    canDeposit,
    query.isFetching,
    query.isError,
    availableCash,
    openBankDeposit,
  ]);
  const consumedCash = useRef('');
  useEffect(() => {
    if (!requestedCashId || consumedCash.current === requestedCashId) return;
    consumedCash.current = requestedCashId;
    setSelected(requestedCashId);
  }, [requestedCashId]);
  const filtered = Boolean(
    search || filters.length || boardId !== 'all' || mediumId !== 'all' || month !== 'all'
  );
  return (
    <>
      {returnTo && (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            startIcon={<Iconify icon={GlobalIcons.retrunIcon} />}
            onClick={() => router.push(returnTo)}
          >
            Back to bank account
          </Button>
        </Stack>
      )}
      {entryContext && !query.isFetching && !query.isError && availableCash === 0 && (
        <Alert severity="info">There is no available cash to deposit for this academic year.</Alert>
      )}
      <Card component="section" aria-label="Cash filters and summary" sx={{ flexShrink: 0, p: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CustomSelect
            label="Board"
            size="small"
            fullWidth
            formControlProps={{ sx: { width: { xs: '100%', sm: 160 } } }}
            value={boardId}
            options={[{ id: 'all', name: 'All boards' }, ...boards]}
            valueKey="id"
            labelKey="name"
            onChange={(value) => update({ boardId: String(value), mediumId: undefined, page: 1 })}
          />
          <CustomSelect
            label="Medium"
            size="small"
            fullWidth
            formControlProps={{ sx: { width: { xs: '100%', sm: 150 } } }}
            value={mediumId}
            options={[{ id: 'all', name: 'All mediums' }, ...mediums]}
            valueKey="id"
            labelKey="name"
            disabled={boardId === 'all'}
            onChange={(value) => update({ mediumId: String(value), page: 1 })}
          />
          <CustomSelect
            label="Month"
            size="small"
            fullWidth
            formControlProps={{ sx: { width: { xs: '100%', sm: 180 } } }}
            value={month}
            options={[{ value: 'all', label: 'All months' }, ...months]}
            disabled={!months.length}
            onChange={(value) => update({ month: String(value), page: 1 })}
          />
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            spacing={2}
            alignItems="center"
            sx={{ ml: { sm: 'auto' }, minWidth: 0 }}
          >
            {(
              [
                ['collected', 'Collected'],
                ['spent', 'Spent'],
                ['deposited', 'Deposited'],
              ] as const
            ).map(([key, label]) => (
              <Stack
                key={key}
                spacing={0.5}
                alignItems="flex-start"
                sx={{ pr: 2, borderRight: 1, borderColor: 'divider' }}
              >
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="subtitle2">
                  {summary ? formatNumber(summary[key], 'INR') : '—'}
                </Typography>
              </Stack>
            ))}
            <Stack spacing={0.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Academic-year cash available
              </Typography>
              <Typography variant="subtitle2">
                {availableCash !== undefined ? formatNumber(availableCash, 'INR') : '—'}
              </Typography>
            </Stack>
            {canDeposit && (
              <Button
                ref={depositButton}
                variant="contained"
                color="inherit"
                size="small"
                sx={{ flexShrink: 0 }}
                startIcon={<Iconify icon={GlobalIcons.bankAccount} />}
                disabled={
                  query.isFetching || query.isError || !(availableCash && availableCash > 0)
                }
                onClick={() => {
                  setDepositAmount(availableCash!);
                  deposit.onTrue();
                }}
              >
                Deposit cash
              </Button>
            )}
          </Stack>
        </Box>
      </Card>
      {!months.length && (
        <Alert severity="warning">Configure the academic-year dates to use the month filter.</Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="cash-management"
          tableTitle="Cash Management"
          columns={columns}
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
          totalCount={query.isError ? 0 : (query.currentData?.totalCount ?? 0)}
          searchTerm={search}
          filters={filters}
          sorts={sorts}
          searchFieldProps={{
            placeholder: 'Search receipts or payers…',
            inputProps: { 'aria-label': 'Search cash receipts or payers', maxLength: 200 },
          }}
          onServerSearch={(value) => {
            if (value !== search) update({ search: value, page: 1 });
          }}
          onServerPagination={(next, size) => update({ page: next, pageSize: size })}
          onServerFilter={(next) =>
            update({
              filters: JSON.stringify(next.filter((item) => item.column !== 'status')),
              page: 1,
            })
          }
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
          onClose={() => {
            setSelected(null);
            if (returnTo && selected === requestedCashId) router.push(returnTo);
          }}
        />
      )}
      {deposit.value && canDeposit && depositAmount !== null && (
        <CashBulkDepositDialog
          academicYearId={academicYearId}
          amount={depositAmount}
          initialBankAccountId={entryContext?.bankAccountId}
          onClose={closeDeposit}
          onRefresh={async () => (await query.refetch().unwrap()).availableCash}
        />
      )}
    </>
  );
}
