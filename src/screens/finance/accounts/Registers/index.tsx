'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Card, Stack, Alert, Button } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useGetAccountsActivityQuery } from 'src/redux/finance/accountsActivityApi';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import ManualEntryForm from './ManualEntryForm';
import AccountEntryDetails from './AccountEntryDetails';
import { academicMonthOptions, defaultAcademicMonth } from './academicMonths';
import {
  toRegisterTableRow,
  registerSourceOptions,
  registerStatusOptions,
} from './registerTablePresentation';

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
  const heading = direction === 'income' ? 'Income' : 'Expenses';
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {(!canView || !currentYear?.id) && (
        <CustomBreadcrumbs
          heading={heading}
          description={
            direction === 'income'
              ? 'View received student payments and other school income.'
              : 'View school expenses and automatically linked student refunds. Awaiting payouts are excluded from paid expenses.'
          }
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
        <Alert severity="info">Select an academic year to view {heading.toLowerCase()}.</Alert>
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
  const months = academicMonthOptions(period);
  const [month, setMonth] = useState(() => defaultAcademicMonth(months));
  const [source, setSource] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const [selected, setSelected] = useState<AccountsActivityRow | null>(null);
  const add = useBoolean();
  const addButton = useRef<HTMLButtonElement>(null);
  const closeAdd = () => {
    add.onFalse();
    requestAnimationFrame(() => addButton.current?.focus());
  };
  const query = useGetAccountsActivityQuery(
    {
      academicYearId: period.id,
      direction,
      month: month === 'all' ? undefined : Number(month.slice(5)),
      year: month === 'all' ? undefined : Number(month.slice(0, 4)),
      source: source === 'all' ? undefined : source,
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
        id: 'source',
        label: 'Source',
        minWidth: 170,
        filterType: 'enum',
        enumOptions: registerSourceOptions(income),
        render: (value: string) =>
          registerSourceOptions(income).find((option) => option.value === value)?.label ?? '—',
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
        id: 'amount',
        label: 'Amount',
        filterType: 'number',
        align: 'right',
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
      {
        id: 'actions',
        label: 'Actions',
        sticky: true,
        stickyPosition: 'right',
        align: 'right',
        minWidth: 140,
        excludeFromExport: true,
        render: (_, row) => (
          <ThreeDotsActions
            showViewIcon
            showThreeDots={false}
            viewIcon={GlobalIcons.eye}
            sx={{ justifyContent: 'flex-end' }}
            viewLabel={`View details for ${row.reference}`}
            handleViewClick={() => setSelected(row as AccountsActivityRow)}
          />
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
  const filtered =
    month !== 'all' || source !== 'all' || category !== 'all' || columnFilters.length > 0;
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
            setSource('all');
            setCategory('all');
            setColumnFilters([]);
            setPage(1);
          }}
        >
          Clear filters
        </Button>
      ) : (
        canAdd && <Button onClick={add.onTrue}>Add {income ? 'income' : 'expense'}</Button>
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
          heading={income ? 'Income' : 'Expenses'}
          description={
            income
              ? 'View received student payments and other school income.'
              : 'View school expenses and linked student refunds. Awaiting payouts are excluded from paid expenses.'
          }
          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Accounts' },
            { name: income ? 'Income' : 'Expenses' },
          ]}
          action={
            canAdd ? (
              <Button
                ref={addButton}
                variant="contained"
                size="small"
                disabled={months.length === 0}
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={add.onTrue}
                sx={{ px: 4 }}
              >
                Add {income ? 'income' : 'expense'}
              </Button>
            ) : undefined
          }
        />
        {months.length === 0 && (
          <Alert severity="warning">
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
          <Box sx={{ width: { xs: '100%', sm: 190 } }}>
            <CustomSelect
              label="Source"
              value={source}
              options={[
                { value: 'all', label: 'All sources' },
                ...(income
                  ? [
                    { value: 'collection', label: 'Student payments' },
                    { value: 'income', label: 'Other income' },
                  ]
                  : [
                    { value: 'expense', label: 'School expenses' },
                    { value: 'refund', label: 'Student refunds' },
                  ]),
              ]}
              onChange={(value) => {
                setSource(String(value));
                setCategory('all');
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
            tableTitle={income ? 'Income' : 'Expenses'}
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
                  {income ? 'Income' : 'Expenses'} could not be loaded.
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
        <ManualEntryForm direction={direction} period={period} month={month} onClose={closeAdd} />
      )}
    </>
  );
}
