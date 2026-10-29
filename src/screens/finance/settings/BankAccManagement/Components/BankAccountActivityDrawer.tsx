'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn, IParams, TableExportRequest } from 'src/components/customizabaleTable/types';
import type {
  BankActivityRow,
  BankActivityQuery,
  BankActivitySource,
} from 'src/redux/finance/BankAccountManage/bankAccountActivityApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import { financePaths } from 'src/constants/finance-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker/custom-date-range-picker';
import {
  Box,
  Tab,
  Alert,
  Stack,
  Drawer,
  Button,
  Collapse,
  Typography,
  IconButton,
} from '@mui/material';
import {
  useGetBankAccountActivityQuery,
  useExportBankAccountActivityMutation,
} from 'src/redux/finance/BankAccountManage/bankAccountActivityApi';

import BankActivityMovementDialog from './BankActivityMovementDialog';
import {
  sourceLabels,
  activityEntryUrl,
  readActivityQuery,
  recognitionLabels,
  saveActivityState,
  confirmationLabels,
  downloadActivityBlob,
} from './bankActivityPresentation';

import type { IBankAccount } from './type';

type MovementTab = 'credit' | 'debit';
const TABS: { value: MovementTab; label: string }[] = [
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
];
export type BankAccountActivityDrawerProps = {
  open: boolean;
  bank: IBankAccount;
  academicYearId: string;
  onClose: () => void;
};
const money = (value: number | string | null | undefined) =>
  value == null || value === '' || !Number.isFinite(Number(value))
    ? '—'
    : formatNumber(value, 'INR');
const date = (value: string | null | undefined) =>
  value && dayjs(value).isValid() ? fDateTime(value) : '—';
const fieldColumn = (
  id: string,
  label: string,
  filterType: IColumn['filterType'] = 'string'
): IColumn => ({
  id,
  label,
  minWidth: 160,
  isFilter: true,
  filterType,
  ...(filterType === 'date'
    ? { filterOperators: ['equals', 'after', 'before'], render: date }
    : {}),
  ...(filterType === 'number' ? { render: money, cellSx: { textAlign: 'right' } } : {}),
});
const commonColumns: IColumn[] = [
  fieldColumn('occurredAt', 'Activity date', 'date'),
  { ...fieldColumn('reference', 'Reference'), sticky: true, stickyPosition: 'left' },
  {
    ...fieldColumn('source', 'Source'),
    filterType: 'enum',
    enumOptions: Object.entries(sourceLabels).map(([value, label]) => ({ value, label })),
    render: (value: BankActivitySource) => sourceLabels[value],
  },
  fieldColumn('counterparty', 'Payer / payee'),
  fieldColumn('categoryName', 'Category'),
  {
    ...fieldColumn('paymentMethod', 'Payment method'),
    filterType: 'enum',
    enumOptions: Object.entries(PaymentMethodLabels).map(([value, label]) => ({
      value: Number(value),
      label,
    })),
    render: (value: keyof typeof PaymentMethodLabels, row) =>
      row.source === 'cash-deposit' ? 'Cash deposit' : PaymentMethodLabels[value],
  },
];
const statusColumns: IColumn[] = [
  {
    ...fieldColumn('recognitionStatus', 'Recognition'),
    filterType: 'enum',
    enumOptions: recognitionLabels.map((label, value) => ({ label, value })),
    render: (value: number) => (
      <Label color={value === 0 ? 'success' : 'warning'}>
        {recognitionLabels[value] || 'Unavailable'}
      </Label>
    ),
  },
  {
    ...fieldColumn('bankConfirmationStatus', 'Bank confirmation'),
    filterType: 'enum',
    enumOptions: confirmationLabels.map((label, value) => ({ label, value })),
    render: (value: number) => (
      <Label color={value === 1 ? 'success' : 'default'}>
        {confirmationLabels[value] || 'Unavailable'}
      </Label>
    ),
  },
  ...[
    fieldColumn('originalPaymentAt', 'Original payment date', 'date'),
    fieldColumn('bankCreditAt', 'Bank credit date', 'date'),
    fieldColumn('depositDate', 'Deposit date', 'date'),
    fieldColumn('depositAmount', 'Deposit submitted', 'number'),
    fieldColumn('recordedBy', 'Recorded by'),
    fieldColumn('paymentReference', 'Payment reference'),
  ].map((column) => ({ ...column, defaultHidden: true })),
];
const readSaved = (key: string, year: string) =>
  readActivityQuery(
    new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get(key),
    year
  );

export default function BankAccountActivityDrawer({
  bank,
  academicYearId,
  ...props
}: BankAccountActivityDrawerProps) {
  return (
    <BankActivityContent
      key={`${bank.id  }:${  academicYearId}`}
      bank={bank}
      academicYearId={academicYearId}
      {...props}
    />
  );
}
function BankActivityContent({
  open,
  bank,
  academicYearId,
  onClose,
}: BankAccountActivityDrawerProps) {
  const router = useRouter();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const access = useAccountSettingPermissions('BankAccount');
  const hasOperationalAccess = ['IncomeTracking', 'ExpenseTracking', 'CashManagement'].some(
    (name) => hasGrantedPermission(permissions, `Finance.Accounts.${  name  }.View`)
  );
  const initialQuery = (direction: MovementTab): BankActivityQuery => {
    const legacy = readSaved('bankActivityQuery', academicYearId);
    const legacyDirection = legacy.direction === 'outgoing' ? 'debit' : 'credit';
    return {
      academicYearId,
      page: 1,
      pageSize: 10,
      sortBy: 'occurredAt',
      sortOrder: 'desc',
      ...(legacyDirection === direction ? legacy : {}),
      ...readSaved(direction === 'credit' ? 'bankCreditQuery' : 'bankDebitQuery', academicYearId),
    };
  };
  const [creditQuery, setCreditQuery] = useState(() => initialQuery('credit'));
  const [debitQuery, setDebitQuery] = useState(() => initialQuery('debit'));
  const [period, setPeriod] = useState(() => {
    const restored = readSaved('bankActivityQuery', academicYearId);
    return {
      from:
        restored.from ||
        (currentYear?.startDate && dayjs(currentYear.startDate).isValid()
          ? dayjs(currentYear.startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
          : undefined),
      toExclusive:
        restored.toExclusive || dayjs().add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'),
    };
  });
  const [tab, setTab] = useState<MovementTab>(() => {
    const saved = new URLSearchParams(
      typeof window === 'undefined' ? '' : window.location.search
    ).get('bankActivityTab');
    return saved === 'debit' ||
      (!saved && readSaved('bankActivityQuery', academicYearId).direction === 'outgoing')
      ? 'debit'
      : 'credit';
  });
  const [creditSearch, setCreditSearch] = useState(creditQuery.search || '');
  const [debitSearch, setDebitSearch] = useState(debitQuery.search || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<BankActivityRow | null>(null);
  const selectedQuery = useMemo<BankActivityQuery>(
    () => ({
      ...(tab === 'credit' ? creditQuery : debitQuery),
      ...period,
      academicYearId,
      direction: tab === 'credit' ? 'incoming' : 'outgoing',
      panel: 'activity',
    }),
    [tab, creditQuery, debitQuery, period, academicYearId]
  );
  const activity = useGetBankAccountActivityQuery(
    { bankAccountId: bank.id, query: selectedQuery },
    {
      skip: !open || !bank.id || !academicYearId || !access.canView || !hasOperationalAccess,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const snapshot = activity.currentData;
  const data =
    snapshot?.account.id === bank.id && snapshot.academicYearId === academicYearId
      ? snapshot
      : undefined;
  const account = data?.account || bank;
  const [exportActivity, exportState] = useExportBankAccountActivityMutation();
  useEffect(() => {
    if (open)
      saveActivityState(
        bank.id,
        selectedQuery,
        tab,
        { ...debitQuery, ...period, academicYearId, direction: 'outgoing', panel: 'activity' },
        { ...creditQuery, ...period, academicYearId, direction: 'incoming', panel: 'activity' }
      );
  }, [open, bank.id, academicYearId, tab, selectedQuery, debitQuery, creditQuery, period]);
  const update = (patch: Partial<BankActivityQuery>) =>
    (tab === 'credit' ? setCreditQuery : setDebitQuery)((current) => ({
      ...current,
      ...patch,
      page: 1,
    }));
  const exportRows = async (request: TableExportRequest) => {
    const blob = await exportActivity({
      bankAccountId: bank.id,
      query: {
        ...selectedQuery,
        search: request.searchTerm || undefined,
        filters: serializeFinanceTableFilters(request.filters),
        sortBy: request.sorts[0]?.column || selectedQuery.sortBy,
        sortOrder: request.sorts[0]?.direction || selectedQuery.sortOrder,
      },
      format: request.format,
      columns: request.columns.map((column) => ({ id: column.id, label: String(column.label) })),
    }).unwrap();
    downloadActivityBlob(
      blob,
      `bank-${
        tab
        }-${
        dayjs().format('YYYY-MM-DD')
        }${request.format === 'excel' ? '.xlsx' : '.pdf'}`
    );
  };
  const viewColumn: IColumn = {
    id: 'action',
    label: 'Actions',
    isSort: false,
    isFilter: false,
    excludeFromExport: true,
    minWidth: 64,
    sticky: true,
    stickyPosition: 'right',
    stickyOnMobile: false,
    render: (_, row) => (
      <AdaptiveThreeDotsActions
        directActionLimit={2}
        actions={[
          {
            id: 'view',
            label: 'View source',
            icon: GlobalIcons.eye,
            disabled: !row.canOpenSource,
            onClick: () => setSelected(row as BankActivityRow),
          },
        ]}
      />
    ),
  };
  const columns: IColumn[] = [
    ...commonColumns.slice(0, 2),
    tab === 'credit'
      ? fieldColumn('incoming', 'Credit amount', 'number')
      : fieldColumn('outgoing', 'Debit amount', 'number'),
    ...commonColumns.slice(2),
    ...(tab === 'credit'
      ? [
          fieldColumn('pendingAmount', 'Pending amount', 'number'),
          fieldColumn('inTransitAmount', 'In transit', 'number'),
        ]
      : []),
    ...statusColumns,
    viewColumn,
  ];
  const tableFilters: IParams['filters'] = (() => {
    try {
      return JSON.parse(selectedQuery.filters || '[]').map((item: any) => {
        const column = columns.find((candidate) => candidate.id === item.column);
        return {
          ...item,
          label: String(column?.label || item.column),
          displayValue:
            column?.enumOptions?.find((option) => String(option.value) === String(item.value))
              ?.label ?? item.value,
          valueType: [
            'incoming',
            'outgoing',
            'pendingAmount',
            'paymentMethod',
            'recognitionStatus',
            'bankConfirmationStatus',
            'depositAmount',
            'inTransitAmount',
          ].includes(item.column)
            ? 'number'
            : item.column.endsWith('At') || item.column === 'depositDate'
              ? 'date'
              : 'string',
        };
      });
    } catch {
      return [];
    }
  })();
  const select = (
    field: 'source' | 'paymentMethod' | 'categoryId' | 'status',
    label: string,
    options: { label: string; value: string | number }[]
  ) => (
    <CustomSelect
      size="small"
      fullWidth
      label={label}
      value={selectedQuery[field] ?? ''}
      options={[{ label: 'All', value: '' }, ...options]}
      onChange={(value) => update({ [field]: value === '' ? undefined : value })}
    />
  );
  const entry = (label: string, path: string, action: 'add' | 'deposit', allowed?: boolean) =>
    allowed && (
      <Button
        size="small"
        color="inherit"
        disabled={!account.isActive}
        startIcon={<Iconify icon={GlobalIcons.addIcon} />}
        onClick={() => router.push(activityEntryUrl(path, bank.id, academicYearId, action))}
      >
        {label}
      </Button>
    );
  const help =
    tab === 'credit'
      ? 'Incoming bank activity, including confirmed cash credits. Pending amounts and cash in transit are shown separately from recorded credits.'
      : 'Recorded movements leaving this bank account. Reversals and corrections follow their actual movement direction.';
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { bgcolor: (theme) => alpha(theme.palette.common.black, 0.32) } },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'bank-activity-title',
        sx: {
          width: { xs: '100%', md: 'min(1200px, 96vw)' },
          maxWidth: '100%',
          height: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={1}
        sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography
              id="bank-activity-title"
              variant="h6"
              component="h2"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {bank.bankName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {account.maskedAccountNumber}
            </Typography>
            <Label color={account.isActive ? 'success' : 'default'}>
              {account.isActive ? 'Active' : 'Inactive'}
            </Label>
            <InfoTooltipIcon
              label={`${bank.bankName  } information`}
              title={
                `View credit and debit activity for this bank account. ${
                data?.coverage.message ||
                  'Only activity within your authorized scope is included. Recorded movement is not a bank balance.'}`
              }
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Academic year: {data?.academicYearName || currentYear?.name || 'Selected academic year'}
          </Typography>
        </Box>
        <IconButton size="small" aria-label={`Close ${  bank.bankName}`} onClick={onClose}>
          <Iconify icon={GlobalIcons.cancel} />
        </IconButton>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        useFlexGap
        flexWrap="wrap"
        sx={{ flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <CustomTabs
          value={tab}
          guardUnsavedChanges={false}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flex: { xs: '1 0 100%', sm: 1 }, minWidth: 0 }}
        >
          {TABS.map(({ value, label }) => (
            <Tab
              key={value}
              id={`bank-${  value  }-tab`}
              aria-controls={`bank-${  value  }-panel`}
              value={value}
              label={label}
            />
          ))}
        </CustomTabs>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ ml: 'auto', px: { xs: 2, sm: 3 }, py: 1 }}
        >
          {tab === 'credit' ? (
            <>
              {entry(
                'Add income',
                financePaths.incomeTracking,
                'add',
                data?.capabilities.canAddIncome
              )}
              {entry(
                'Deposit cash',
                financePaths.accounts.cashManagement,
                'deposit',
                data?.capabilities.canDepositCash
              )}
            </>
          ) : (
            entry(
              'Add expense',
              financePaths.expenseTracking,
              'add',
              data?.capabilities.canAddExpense
            )
          )}
        </Stack>
      </Stack>
      <Box
        role="tabpanel"
        id={`bank-${  tab  }-panel`}
        aria-labelledby={`bank-${  tab  }-tab`}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        {!hasOperationalAccess ? (
          <Alert severity="info">
            Operational activity requires the owning income, expense or cash viewing permission.
          </Alert>
        ) : (
          <>
            <Stack spacing={1} sx={{ flexShrink: 0, maxHeight: '50%', overflowY: 'auto' }}>
              {!account.isActive && (
                <Alert severity="info">
                  This account is inactive. Historical activity is available; new bank movements are
                  disabled.
                </Alert>
              )}
              <FormSectionHeader
                title="Transactions"
                icon={GlobalIcons.bankAccount}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip={help}
                action={
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon={GlobalIcons.applyFilter} />}
                    aria-expanded={filtersOpen}
                    onClick={() => setFiltersOpen((value) => !value)}
                  >
                    Filters
                  </Button>
                }
              />
              <CustomDateRangePicker
                label="Activity period"
                dateFormat="DD/MM/YYYY"
                value={[
                  period.from ? dayjs(period.from) : null,
                  period.toExclusive ? dayjs(period.toExclusive).subtract(1, 'day') : null,
                ]}
                onChange={([start, end]: [Dayjs | null, Dayjs | null]) => {
                  if (start?.isValid() && end?.isValid() && !end.isBefore(start, 'day')) {
                    setPeriod({
                      from: start.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'),
                      toExclusive: end.add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'),
                    });
                    setCreditQuery((current) => ({ ...current, page: 1 }));
                    setDebitQuery((current) => ({ ...current, page: 1 }));
                  }
                }}
              />
              <Collapse in={filtersOpen}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      md: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 1,
                  }}
                >
                  {select(
                    'source',
                    'Source',
                    Object.entries(sourceLabels).map(([value, label]) => ({ value, label }))
                  )}
                  {select(
                    'paymentMethod',
                    'Payment method',
                    Object.entries(PaymentMethodLabels).map(([value, label]) => ({
                      value: Number(value),
                      label,
                    }))
                  )}
                  {select(
                    'categoryId',
                    'Category',
                    (data?.categories || []).map(({ id, label }) => ({ value: id, label }))
                  )}
                  {select(
                    'status',
                    'Recognition status',
                    recognitionLabels.map((label, value) => ({ label, value }))
                  )}
                </Box>
              </Collapse>
            </Stack>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <CustomizableTable
                key={tab}
                tableId={`bank-activity-${  tab}`}
                tableTitle={tab === 'credit' ? 'Credit transactions' : 'Debit transactions'}
                columns={columns}
                data={activity.isError ? [] : data?.items || []}
                getRowAction={(row) =>
                  row.canOpenSource
                    ? {
                        label: `View source ${  row.reference}`,
                        onClick: () => setSelected(row as BankActivityRow),
                      }
                    : undefined
                }
                isLoading={activity.isFetching && !data}
                isRefreshing={activity.isFetching && Boolean(data)}
                error={activity.error}
                onRetry={() => activity.refetch()}
                serverSidePagination
                serverSideSearch
                serverSideFilter
                serverSideSort
                serverSideSortMode="single"
                maxServerRowsPerPage={100}
                rowsPerPageOptions={[10, 25, 50, 100]}
                page={(selectedQuery.page || 1) - 1}
                rowsPerPage={selectedQuery.pageSize || 10}
                totalCount={data?.totalCount || 0}
                searchTerm={tab === 'credit' ? creditSearch : debitSearch}
                onSearchInputChange={(search) =>
                  (tab === 'credit' ? setCreditSearch : setDebitSearch)(search.slice(0, 100))
                }
                filters={tableFilters}
                sorts={[
                  {
                    column: selectedQuery.sortBy || 'occurredAt',
                    direction: selectedQuery.sortOrder || 'desc',
                  },
                ]}
                onServerPagination={(page, pageSize) =>
                  (tab === 'credit' ? setCreditQuery : setDebitQuery)((current) => ({
                    ...current,
                    page,
                    pageSize,
                  }))
                }
                onServerSearch={(search) => update({ search: search.slice(0, 100) || undefined })}
                onServerFilter={(next) => update({ filters: serializeFinanceTableFilters(next) })}
                onServerSort={(_, sorts) =>
                  update({
                    sortBy: sorts[0]?.column || 'occurredAt',
                    sortOrder: sorts[0]?.direction || 'desc',
                  })
                }
                onClearCriteria={() => {
                  (tab === 'credit' ? setCreditSearch : setDebitSearch)('');
                  update({
                    search: undefined,
                    filters: undefined,
                    source: undefined,
                    paymentMethod: undefined,
                    categoryId: undefined,
                    status: undefined,
                  });
                }}
                noDataText={
                  selectedQuery.search ||
                  selectedQuery.filters ||
                  selectedQuery.source ||
                  selectedQuery.categoryId ||
                  selectedQuery.status !== undefined ||
                  selectedQuery.paymentMethod !== undefined
                    ? 'No transactions match these filters.'
                    : tab === 'credit'
                      ? 'No credit activity recorded in this period.'
                      : 'No debit activity recorded in this period.'
                }
                exportScope="all"
                exportFormats={['excel', 'pdf']}
                exportBusy={exportState.isLoading}
                exportDisabled={!data || activity.isError}
                onExport={exportRows}
              />
            </Box>
          </>
        )}
      </Box>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.75,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </Stack>
      {selected && (
        <BankActivityMovementDialog
          row={selected}
          bankAccountId={bank.id}
          academicYearId={academicYearId}
          onClose={() => setSelected(null)}
        />
      )}
    </Drawer>
  );
}
