'use client';

import { FinanceListSkeleton } from 'src/screens/finance/components/FinanceContentSkeletons';

import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { DateRange } from 'src/components/custom-date-range-picker';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { CashManagementCriteria } from 'src/redux/finance/cashManagementApi';

import dayjs from 'dayjs';
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
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useGetCashManagementQuery } from 'src/redux/finance/cashManagementApi';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { useFinancePermissions } from 'src/screens/finance/hooks/useFinancePermissions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import { Box, Card, Stack, Alert, Button, Tooltip, IconButton, Typography } from '@mui/material';

import CashDetails from './CashDetails';
import CashExpensesDrawer from './CashExpensesDrawer';
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
            item.column !== 'spentAmount' &&
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
        <FinanceListSkeleton label="Loading cash management permissions" columns={4} />
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
  const requestedStart = params.get('startDate');
  const requestedEnd = params.get('endDate');
  const start = dayjs(requestedStart);
  const end = dayjs(requestedEnd);
  const hasDateRange =
    start.isValid() &&
    end.isValid() &&
    start.format('YYYY-MM-DD') === requestedStart &&
    end.format('YYYY-MM-DD') === requestedEnd &&
    !start.isAfter(end, 'day');
  const monthStart = month === 'all' ? null : dayjs(`${month}-01`);
  const monthEnd = monthStart?.endOf('month') ?? null;
  const academicStart = dayjs(currentYear?.startDate);
  const academicEnd = dayjs(currentYear?.endDate);
  const range: DateRange = hasDateRange
    ? [start, end]
    : [
        monthStart?.isBefore(academicStart, 'day') ? academicStart : monthStart,
        monthEnd?.isAfter(academicEnd, 'day') ? academicEnd : monthEnd,
      ];
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
      startDate: undefined,
      endDate: undefined,
      page: 1,
    });
  const [selected, setSelected] = useState<string | null>(null);
  const deposit = useBoolean();
  const expenses = useBoolean();
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
  const criteria: CashManagementCriteria = {
    academicYearId,
    boardId: boardId === 'all' ? undefined : boardId,
    mediumId: mediumId === 'all' ? undefined : mediumId,
    month: hasDateRange || month === 'all' ? undefined : Number(month.slice(5)),
    year: hasDateRange || month === 'all' ? undefined : Number(month.slice(0, 4)),
    startDate: hasDateRange ? requestedStart! : undefined,
    endDate: hasDateRange ? requestedEnd! : undefined,
    search: search || undefined,
    filters: serializeFinanceTableFilters(filters),
  };
  const query = useGetCashManagementQuery(
    {
      ...criteria,
      page,
      pageSize,
      sortBy,
      sortOrder: sortBy ? sortOrder : undefined,
    },
    { skip: !academicYearId, refetchOnMountOrArgChange: 60 }
  );
  const summary = query.isError ? undefined : query.currentData?.activitySummary;
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
    search || filters.length || boardId !== 'all' || mediumId !== 'all' || range[0]
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
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ width: { xs: '100%', sm: 270 } }}
          >
            <CustomDateRangePicker
              label="Date range"
              title="Select cash activity dates"
              placeholder="All dates"
              dateFormat="DD/MM/YYYY"
              value={range}
              showShortcuts={false}
              onChange={([from, to]) => {
                if (from && to && from.isValid() && to.isValid() && !from.isAfter(to, 'day'))
                  update({
                    month: undefined,
                    startDate: from.format('YYYY-MM-DD'),
                    endDate: to.format('YYYY-MM-DD'),
                    page: 1,
                  });
              }}
            />
            {range[0] && (
              <Tooltip title="Clear date range">
                <IconButton
                  size="small"
                  aria-label="Clear date range"
                  onClick={() =>
                    update({ month: 'all', startDate: undefined, endDate: undefined, page: 1 })
                  }
                >
                  <Iconify icon={GlobalIcons.cancel} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
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
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.eye} />}
              onClick={expenses.onTrue}
            >
              View expenses
            </Button>
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
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="cash-management"
          tableTitle="Cash Management"
          columns={columns}
          data={query.isError ? [] : (query.currentData?.items ?? [])}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
          isLoading={query.isFetching}
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
            placeholder: 'Search',
            inputProps: { 'aria-label': 'Search cash receipts or payers', maxLength: 200 },
          }}
          onServerSearch={(value) => {
            if (value !== search) update({ search: value, page: 1 });
          }}
          onServerPagination={(next, size) => update({ page: next, pageSize: size })}
          onServerFilter={(next) =>
            update({
              filters: JSON.stringify(
                next.filter((item) => item.column !== 'status' && item.column !== 'spentAmount')
              ),
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
      {expenses.value && (
        <CashExpensesDrawer
          key={JSON.stringify(criteria)}
          criteria={criteria}
          onClose={expenses.onFalse}
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
