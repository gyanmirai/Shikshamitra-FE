'use client';

import type { RootState } from 'src/redux/store';
import type { HrReportPreview, HrReportRequest } from 'src/redux/hr/hrReportsApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { hrPermissions } from 'src/constants/hr-menus';
import { formatNumber } from 'src/utils/formate_number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { useGetPayslipSettingsQuery } from 'src/redux/hr/payslip-api';
import { usePreviewHrReportMutation } from 'src/redux/hr/hrReportsApi';
import { useId, useRef, useState, useEffect, useCallback } from 'react';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useLazyGetEmployeeOptionsQuery } from 'src/redux/hr/employeeApi';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  Box,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import { payslipActionError } from './payslip-action-error';
import { buildPayslipEmployeeSearch } from './payslip-selection';
import { usePayrollMonth } from '../payroll-cycle/use-payroll-month';
import { useHrReportPermissions } from '../../reports/hooks/useHrReportPermissions';
import { HrReportPreviewTable } from '../../reports/components/HrReportPreviewTable';
import {
  salaryDocumentFields,
  standardSalaryDocumentColumns,
  mandatorySalaryDocumentColumns,
} from './salary-document-fields';

const statementDefaultColumns = [...mandatorySalaryDocumentColumns, 'status'];

export default function SalaryDocumentsWorkspace({
  kind,
  active = true,
}: {
  kind: 'statement' | 'register';
  active?: boolean;
}) {
  const permissions = useHrReportPermissions();
  const grants = useSelector((state: RootState) => state.auth.permissions);
  const canReadSettings = hasGrantedPermission(
    grants,
    `${hrPermissions.payroll.generateSalarySlip}.View`
  );
  const settings = useGetPayslipSettingsQuery(undefined, { skip: !canReadSettings });
  const [employee, setEmployee] = useState<{ id: string; label: string } | null>(null);
  const [payrollMonth, setPayrollMonth] = usePayrollMonth();
  const [from, setFrom] = useState(payrollMonth.subtract(5, 'month').format('YYYY-MM'));
  const to = payrollMonth.format('YYYY-MM');
  const [columns, setColumns] = useState<string[]>(() =>
    kind === 'statement' ? statementDefaultColumns : standardSalaryDocumentColumns
  );
  const [page, setPage] = useState({ number: 1, size: 25 });
  const [searchTerm, setSearchTerm] = useState('');
  const notesId = useId();
  const {
    open: notesOpen,
    anchorEl: notesAnchor,
    onOpen: openNotes,
    onClose: closeNotes,
  } = usePopover();
  const [search] = useLazyGetEmployeeOptionsQuery();
  const fetchEmployees = useCallback(
    async (query: string, nextPage: number) => {
      const result = await search(buildPayslipEmployeeSearch(query, nextPage)).unwrap();
      return {
        data: result.items.map((item) => ({ id: item.id, label: item.fullName })),
        hasMore: result.hasMore,
      };
    },
    [search]
  );
  const statement = kind === 'statement';
  const title = statement ? 'Employee salary statement' : 'School payroll register';
  const ready = permissions.canView && !!to && (!statement || (!!employee && !!from && from <= to));
  const request: HrReportRequest = {
    reportType: title,
    dataSource: statement ? 'payroll_statement' : 'payroll_register',
    columns: [...new Set([...mandatorySalaryDocumentColumns, ...columns])],
    page: page.number,
    pageSize: page.size,
    filters: {
      employeeIds: statement && employee ? [employee.id] : undefined,
      includeDrafts: false,
      month: statement ? undefined : to,
      fromDate: statement ? `${from}-01` : undefined,
      toDate: statement ? `${to}-01` : undefined,
    },
  };
  const exportTable = useHrTableExport('hr-salary-documents', request);
  const signature = JSON.stringify(request);
  const [loadPreview] = usePreviewHrReportMutation();
  const [basePreview, setPreview] = useState<{ signature: string; data: HrReportPreview }>();
  const [baseLoading, setLoading] = useState(false);
  const [baseError, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const sequence = useRef(0);
  useEffect(() => {
    sequence.current += 1;
    const { current } = sequence;
    closeNotes();
    setPreview(undefined);
    setError(null);
    setLoading(active && ready);
    if (!active || !ready) return undefined;
    const pendingRequest = loadPreview(JSON.parse(signature));
    pendingRequest
      .unwrap()
      .then((data) => {
        if (current === sequence.current) setPreview({ signature, data });
      })
      .catch((failure) => {
        if (current === sequence.current)
          setError(payslipActionError(failure, 'The document preview could not be loaded.'));
      })
      .finally(() => {
        if (current === sequence.current) setLoading(false);
      });
    return () => {
      sequence.current += 1;
      pendingRequest.abort();
    };
  }, [signature, ready, active, refresh, loadPreview, closeNotes]);
  const previewView = useHrTableQuery(
    {
      table: 'hr-salary-documents',
      query: request,
      page: page.number - 1,
      size: page.size,
      resetPage: () => setPage((current) => ({ ...current, number: 1 })),
      skip: !active || !ready,
      genericSearch: true,
      columnTypes: Object.fromEntries(
        salaryDocumentFields.map(([id]) => [
          id,
          id === 'dateOfJoining'
            ? 'date'
            : [
                  'month',
                  'employeeCode',
                  'employeeName',
                  'designation',
                  'bankAccount',
                  'pfNumber',
                  'esicNumber',
                  'status',
                ].includes(id)
              ? 'string'
              : ['casualLeaveDays', 'paidLeaveDays', 'unpaidLeaveDays', 'payableDays'].includes(id)
                ? 'number'
                : 'money',
        ])
      ),
    },
    {
      data: basePreview?.signature === signature && active && ready ? basePreview.data : undefined,
      isLoading: baseLoading,
      isFetching: baseLoading,
      error: baseError,
      refetch: () => setRefresh((value) => value + 1),
    }
  );
  const preview = previewView.data;
  const loading = previewView.isLoading;
  const hasTableCriteria = Boolean(
    previewView.tableProps.searchTerm ||
    previewView.tableProps.filters?.length ||
    previewView.tableProps.sorts?.length
  );
  const error =
    typeof previewView.error === 'string'
      ? previewView.error
      : previewView.error
        ? payslipActionError(previewView.error, 'The document preview could not be loaded.')
        : null;
  const preset = statement
    ? settings.data?.presentation?.statementColumns
    : settings.data?.presentation?.registerColumns;
  const columnControl = (
    <TextField
      select
      label="Document columns"
      size="small"
      value={columns}
      SelectProps={{
        multiple: true,
        renderValue: (selected) => `${(selected as string[]).length} columns selected`,
      }}
      onChange={(event) =>
        setColumns(
          typeof event.target.value === 'string'
            ? event.target.value.split(',')
            : event.target.value
        )
      }
      helperText={statement ? 'Identity, totals, and all nonzero deductions always appear.' : undefined}
    >
      {salaryDocumentFields.map(([id, label]) => (
        <MenuItem key={id} value={id} disabled={mandatorySalaryDocumentColumns.includes(id)}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  );
  const presetButton = (
    <Button
      size="small"
      onClick={() =>
        setColumns([
          ...new Set([
            ...mandatorySalaryDocumentColumns,
            ...(preset?.length
              ? preset
              : statement
                ? statementDefaultColumns
                : standardSalaryDocumentColumns),
          ]),
        ])
      }
    >
      Use school column preset
    </Button>
  );
  if (!permissions.canView)
    return (
      <HrNotice role="alert" severity="info">
        HR Reports View permission is required to preview salary documents.
      </HrNotice>
    );
  const refreshButton = (
    <Button
      size="small"
      variant="outlined"
      startIcon={<Iconify icon="mdi:refresh" width={18} />}
      disabled={!ready || loading}
      onClick={() => previewView.refetch()}
    >
      Refresh preview
    </Button>
  );
  const controls = statement ? (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(0, 2fr) repeat(2, minmax(0, 1fr))',
            lg: 'minmax(230px, 360px) repeat(2, minmax(150px, 205px))',
          },
        }}
      >
        <PaginatedSearchSelect
          id="salary-statement-staff"
          label="Staff member"
          value={employee}
          size="small"
          minChars={2}
          debounceMs={400}
          fetchOptions={fetchEmployees}
          filterOptions={(options) => options}
          onChange={(_, value) => {
            setEmployee(value);
            setPage({ ...page, number: 1 });
          }}
          getOptionLabel={(option: { label: string }) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <TextField
          label="From month"
          type="month"
          size="small"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            setPage({ ...page, number: 1 });
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To month"
          type="month"
          size="small"
          value={to}
          onChange={(event) => {
            setPayrollMonth(dayjs(`${event.target.value}-01`));
            setPage({ ...page, number: 1 });
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
      {from > to && (
        <Alert severity="warning">The end month must be on or after the start month.</Alert>
      )}

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
      >
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            aria-label="Quick pay periods"
          >
            {[3, 6, 12].map((months) => (
              <Button
                key={months}
                size="small"
                variant="outlined"
                onClick={() => {
                  setFrom(
                    dayjs(`${to}-01`)
                      .subtract(months - 1, 'month')
                      .format('YYYY-MM')
                  );
                  setPage({ ...page, number: 1 });
                }}
              >
                Last {months} months
              </Button>
            ))}
          </Stack>
          <Box
            component="details"
            sx={{
              '& > summary': {
                cursor: 'pointer',
                typography: 'body2',
                fontWeight: 600,
                py: 0.75,
              },
            }}
          >
            <Box component="summary">Document options</Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'flex-start' }}
              sx={{ pt: 1 }}
            >
              {columnControl}
              {presetButton}
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
          {refreshButton}
        </Stack>
      </Stack>
    </Stack>
  ) : (
    <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
      <DatePicker
        label="Payroll month"
        views={['year', 'month']}
        openTo="month"
        closeOnSelect
        format="MMMM YYYY"
        value={payrollMonth}
        onChange={(value) => {
          if (!value?.isValid()) return;
          setPayrollMonth(value);
          setPage((current) => ({ ...current, number: 1 }));
        }}
        slotProps={{ textField: { size: 'small' } }}
        sx={{ width: { xs: '100%', sm: 220 } }}
      />
      <Box sx={{ width: { xs: '100%', sm: 220 }, '& > *': { width: 1 } }}>{columnControl}</Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        flexWrap="wrap"
        useFlexGap
        spacing={1}
        sx={{ ml: 'auto' }}
      >
        {presetButton}
        {refreshButton}
      </Stack>
    </Stack>
  );
  return (
    <Stack sx={{ minWidth: 0, flex: 1, minHeight: { xs: 460, sm: 0 } }}>
      <HrReportPreviewTable
        operationalProps={{
          ...previewView.tableProps,
          tableId: statement ? 'hr-employee-statement' : 'hr-school-payroll-register',
          headerContent: (
            <Stack spacing={1.5}>
              {controls}
              {preview?.totals && preview.rows.length > 0 && (
                <Stack
                  direction="row"
                  useFlexGap
                  flexWrap="wrap"
                  spacing={1.5}
                  alignItems="baseline"
                >
                  <Typography variant="subtitle2">
                    {hasTableCriteria
                      ? 'Displayed row totals'
                      : statement
                        ? 'Period totals'
                        : preview.totalsLabel || 'Payroll totals'}
                  </Typography>
                  {(['totalEarnings', 'totalDeduction', 'netPay'] as const).map((field) => (
                    <Typography key={field} variant="body2" color="text.secondary">
                      {salaryDocumentFields.find(([id]) => id === field)?.[1]}{' '}
                      <Box component="strong" sx={{ color: 'text.primary' }}>
                        {preview.totals?.[field] == null
                          ? 'Unavailable'
                          : formatNumber(preview.totals[field], 'INR', { fractionDigits: 2 })}
                      </Box>
                    </Typography>
                  ))}
                </Stack>
              )}
            </Stack>
          ),
          exportDisabled: !ready || loading || !preview?.totalCount,
          searchTerm,
          onSearchInputChange: setSearchTerm,
          onClearCriteria: () => {
            setSearchTerm('');
            previewView.resetCriteria();
          },
          searchFieldProps: {
            placeholder: statement ? 'Search statement' : 'Search staff or payroll details',
            disabled: !ready,
          },
          error: error ? { data: { detail: error } } : undefined,
          onRetry: previewView.refetch,
        }}
        onExport={exportTable}
        preview={preview}
        headerAction={
          preview?.queryWarnings?.length ? (
            <>
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon="mdi:information-outline" width={16} />}
                aria-expanded={notesOpen}
                aria-haspopup="dialog"
                aria-controls={notesOpen ? notesId : undefined}
                onClick={openNotes}
              >
                Report notes ({preview.queryWarnings.length})
              </Button>
              <CustomPopover
                open={notesOpen}
                anchorEl={notesAnchor}
                onClose={closeNotes}
                slotProps={{
                  arrow: { placement: 'top-left' },
                  paper: {
                    id: notesId,
                    role: 'dialog',
                    'aria-label': 'Report notes',
                    sx: { width: 360, maxWidth: 'calc(100vw - 32px)' },
                  },
                }}
              >
                <Stack spacing={1} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Report notes</Typography>
                    <IconButton size="small" aria-label="Close report notes" onClick={closeNotes}>
                      <Iconify icon="mdi:close" width={18} />
                    </IconButton>
                  </Stack>
                  {preview.queryWarnings.map((warning) => (
                    <Typography key={warning} variant="body2" color="text.secondary">
                      {warning}
                    </Typography>
                  ))}
                </Stack>
              </CustomPopover>
            </>
          ) : undefined
        }
        reportName={title}
        sourceLabel={
          statement && employee && ready
            ? `${employee.label} · ${dayjs(`${from}-01`).format('MMM YYYY')} to ${payrollMonth.format('MMM YYYY')}`
            : 'issued payroll'
        }
        emptyMessage={
          statement && !ready
            ? 'Choose a staff member and a valid pay period to preview a statement.'
            : 'No issued payroll was found for this selection.'
        }
        isLoading={loading}
        onPageChange={(number, size) => setPage({ number, size })}
      />
    </Stack>
  );
}
