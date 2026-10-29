'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Card, Stack, Alert, Button } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useGetAccountsActivityQuery } from 'src/redux/finance/accountsActivityApi';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import ManualEntryForm from './ManualEntryForm';
import AccountEntryDetails from './AccountEntryDetails';
import { academicMonthOptions, defaultAcademicMonth } from './academicMonths';
import { toRegisterTableRow, registerStatusOptions } from './registerTablePresentation';
import { bankAccountReturnTo, readBankAccountEntryContext } from '../bankAccountEntryContext';

import type { AcademicPeriod } from './academicMonths';

export default function AccountsRegister({ direction }: { direction: 'income' | 'expense' }) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const permission =
    direction === 'income'
      ? financePermissions.accounts.income
      : financePermissions.accounts.expense;
  const canView = hasGrantedPermission(permissions, `${permission}.View`);
  const canAdd = hasGrantedPermission(permissions, `${permission}.Add`);
  const heading = direction === 'income' ? 'Incomes' : 'Expenses';
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {(!canView || !currentYear?.id) && (
        <CustomBreadcrumbs
          description={
            direction === 'income'
              ? 'View received student payments and other school income.'
              : 'View paid school expenses, completed student refunds, and returned payments.'
          }
          heading={heading}

          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Accounts' },
            { name: heading },
          ]}
        />
      )}
      {!canView ? (
        <Alert severity="error">You do not have permission to view {heading.toLowerCase()}.</Alert>
      ) : !currentYear?.id ? (
        <Box>Select an academic year to view {heading.toLowerCase()}.</Box>
      ) : (
        <RegisterContent
          key={`${direction}:${currentYear.id}:${currentYear.startDate}:${currentYear.endDate}`}
          direction={direction}
          period={currentYear}
          canAdd={canAdd}
        />
      )}
    </Box>
  );
}
function RegisterContent({
  direction,
  period,
  canAdd,
}: {
  direction: 'income' | 'expense';
  period: AcademicPeriod;
  canAdd: boolean;
}) {
  const income = direction === 'income';
  const routeParams = useSearchParams();
  const router = useRouter();
  const entryContext = readBankAccountEntryContext(routeParams, period.id, 'add');
  const returnTo =
    routeParams.get('academicYearId') === period.id
      ? bankAccountReturnTo(routeParams.get('returnTo'))
      : null;
  const months = academicMonthOptions(period);
  const [month, setMonth] = useState(() =>
    returnTo && routeParams.get('search') ? 'all' : defaultAcademicMonth(months)
  );
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState(() =>
    returnTo ? (routeParams.get('search') || '').slice(0, 100) : ''
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const [selected, setSelected] = useState<AccountsActivityRow | null>(null);
  const add = useBoolean();
  const openBankEntry = add.onTrue;
  const consumedEntry = useRef('');
  const requestedEntryKey = entryContext
    ? `${period.id}:${entryContext.bankAccountId}:${entryContext.returnTo}`
    : '';
  useEffect(() => {
    if (
      !requestedEntryKey ||
      !canAdd ||
      months.length === 0 ||
      consumedEntry.current === requestedEntryKey
    )
      return;
    consumedEntry.current = requestedEntryKey;
    openBankEntry();
  }, [requestedEntryKey, canAdd, months.length, openBankEntry]);
  const addButton = useRef<HTMLButtonElement>(null);
  const closeAdd = () => {
    add.onFalse();
    if (entryContext) {
      router.push(entryContext.returnTo);
      return;
    }
    requestAnimationFrame(() => addButton.current?.focus());
  };
  const query = useGetAccountsActivityQuery(
    {
      academicYearId: period.id,
      direction,
      month: month === 'all' ? undefined : Number(month.slice(5)),
      year: month === 'all' ? undefined : Number(month.slice(0, 4)),
      categoryId: category === 'all' ? undefined : category,
      search: search || undefined,
      filters: serializeFinanceTableFilters(columnFilters),
      sortBy: sorts[0]?.column,
      sortDescending: sorts[0] ? sorts[0].direction === 'desc' : true,
      page,
      pageSize,
    },
    { skip: months.length === 0, refetchOnMountOrArgChange: true }
  );
  const columns: IColumn[] = (
    [
      {
        id: 'reference',
        label: income ? 'Income Reference' : 'Expense Reference',
        minWidth: 230,
        filterType: 'string',
        sticky: true,
        stickyPosition: 'left',
      },
      {
        id: 'studentIdentity',
        label: 'Student (GR No.)',
        filterType: 'string',
        render: (value: string) => value || '—',
        minWidth: 220,
      },
      {
        id: 'classDivision',
        label: 'Class/Division',
        filterType: 'string',
        minWidth: 190,
        render: (value: string) => value || '—',
      },
      {
        id: 'counterparty',
        label: income ? 'Payer' : 'Payee',
        filterType: 'string',
        minWidth: 180,
        render: (value: string) => value || '—',
      },
      {
        id: 'categoryName',
        label: income ? 'Income Category' : 'Expense Category',
        filterType: 'string',
        minWidth: 210,
        render: (value: string) => value || '—',
      },
      {
        id: 'bankLabel',
        label: 'Bank Account',
        filterType: 'string',
        minWidth: 190,
        render: (value: string) => value || '—',
      },
      {
        cellSx: { textAlign: 'right' as const },
        id: 'amount',
        label: 'Amount',
        filterType: 'number',
        align: 'left',
        minWidth: 140,
        render: (value: number) => formatNumber(value, 'INR'),
      },
      {
        id: 'occurredAt',
        label: 'Transaction Date',
        filterType: 'date',
        minWidth: 210,
        render: (value: string) => fDateTime(value),
      },
      {
        id: 'sourceStatus',
        label: 'Status',
        filterType: 'enum',
        enumOptions: registerStatusOptions(income),
        sticky: true,
        stickyPosition: 'right',
        minWidth: 160,
        render: (value: string) => (
          <Label
            color={
              value === 'Paid' || value === 'Received'
                ? 'success'
                : value === 'Awaiting payout' || value === 'Returned' || value === 'Reversed'
                  ? 'warning'
                  : 'default'
            }
          >
            {value}
          </Label>
        ),
      },
    ] satisfies IColumn[]
  ).map((column) => ({
    ...column,
    isFilter: column.id !== 'actions',
    isSort: [
      'reference',
      'studentIdentity',
      'classDivision',
      'categoryName',
      'bankLabel',
      'amount',
      'occurredAt',
      'sourceStatus',
    ].includes(column.id),
  }));
  const filtered = month !== 'all' || category !== 'all' || columnFilters.length > 0;
  const categories = query.data?.categories ?? [];
  const noData = (
    <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: 220 }}>
      <Box>
        {months.length === 0
          ? 'Configure academic-year dates to view entries.'
          : search
            ? 'No entries match your search.'
            : filtered
              ? 'No entries match the selected filters.'
              : income
                ? 'No income has been recorded for this academic year.'
                : 'No expenses or approved refunds have been recorded for this academic year.'}
      </Box>
      {months.length === 0 ? null : search ? (
        <Button
          onClick={() => {
            setSearch('');
            setPage(1);
          }}
        >
          Clear search
        </Button>
      ) : filtered ? (
        <Button
          onClick={() => {
            setMonth('all');
            setCategory('all');
            setColumnFilters([]);
            setPage(1);
          }}
        >
          Clear filters
        </Button>
      ) : (
        canAdd && (
          <Button
            aria-label={income ? 'Add Income' : 'Add Expense'}
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            onClick={add.onTrue}
          >
            {income ? 'Add Income' : 'Add Expense'}
          </Button>
        )
      )}
    </Stack>
  );
  return (
    <>
      <Box
        sx={{
          display: add.value ? 'none' : 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          gap: 1,
        }}
      >
        <CustomBreadcrumbs
          description={
            income
              ? 'View received student payments and other school income.'
              : 'View paid school expenses, completed student refunds, and returned payments.'
          }
          heading={income ? 'Incomes' : 'Expenses'}

          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Accounts' },
            { name: income ? 'Incomes' : 'Expenses' },
          ]}
          action={
            returnTo ? (
              <Button
                size="small"
                startIcon={<Iconify icon={GlobalIcons.retrunIcon} />}
                onClick={() => router.push(returnTo)}
              >
                Back to bank account
              </Button>
            ) : undefined
          }
        />
        {months.length === 0 && (
          <Alert severity="error">
            This academic year has no valid start/end dates. Update the academic year before
            recording transactions.
          </Alert>
        )}
        <Card
          sx={{
            px: 1,
            py: 1,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: 210 } }}>
            <CustomSelect
              label="Month"
              disabled={months.length === 0}
              value={month}
              options={[{ value: 'all', label: 'All months' }, ...months]}
              onChange={(value) => {
                setMonth(String(value));
                setPage(1);
              }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: 210 } }}>
            <CustomSelect
              label="Category"
              value={category}
              isSearch
              options={[{ id: 'all', label: 'All categories' }, ...categories]}
              labelKey="label"
              valueKey="id"
              onChange={(value) => {
                setCategory(String(value));
                setPage(1);
              }}
            />
          </Box>
          {canAdd && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: 'auto' }}>
              <Button
                aria-label={income ? 'Add Income' : 'Add Expense'}
                ref={addButton}
                variant="contained"
                size="small"
                disabled={months.length === 0}
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={add.onTrue}
                sx={{ px: 4 }}
              >
                {income ? 'Add Income' : 'Add Expense'}
              </Button>
            </Box>
          )}
        </Card>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <CustomizableTable
            getRowAction={(row) => ({
              label: `Open ${row.reference || 'record'}`,
              onClick: () => {
                setSelected(row as AccountsActivityRow);
              },
            })}
            tableTitle={income ? 'Incomes' : 'Expenses'}
            wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
            tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
            tableId={`accounts-${direction}-register`}
            exportLabel="Export current page"
            columns={columns}
            data={query.isError ? [] : (query.currentData?.items ?? []).map(toRegisterTableRow)}
            isLoading={query.isFetching}
            serverSidePagination
            serverSideSearch
            serverSideSort
            serverSideFilter
            maxServerRowsPerPage={100}
            filters={columnFilters}
            onServerFilter={(nextFilters) => {
              setColumnFilters(nextFilters);
              setPage(1);
            }}
            serverSideSortMode="single"
            sorts={sorts}
            onServerSort={(_column, nextSorts) => {
              setSorts(nextSorts);
              setPage(1);
            }}
            page={page - 1}
            rowsPerPage={pageSize}
            searchTerm={search}
            searchFieldProps={{ placeholder: 'Search...' }}
            totalCount={query.isError ? 0 : (query.currentData?.totalCount ?? 0)}
            onServerPagination={(nextPage, size) => {
              setPage(nextPage);
              setPageSize(size);
            }}
            onServerSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            noDataText={noData}
            errorContent={
              query.isError ? (
                <Alert
                  severity="error"
                  action={<Button onClick={() => query.refetch()}>Retry</Button>}
                >
                  {income ? 'Incomes' : 'Expenses'} could not be loaded.
                </Alert>
              ) : undefined
            }
          />
        </Box>
      </Box>
      {selected && (
        <AccountEntryDetails
          row={selected}
          academicYearId={period.id}
          onClose={() => setSelected(null)}
        />
      )}
      {add.value && canAdd && (
        <ManualEntryForm
          direction={direction}
          period={period}
          month={month}
          onClose={closeAdd}
          initialBankAccountId={entryContext?.bankAccountId}
        />
      )}
    </>
  );
}
