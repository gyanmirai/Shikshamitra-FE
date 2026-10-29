'use client';

import type { RootState } from 'src/redux/store';
import type { HrReportPreview, HrReportRequest } from 'src/redux/hr/hrReportsApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { hrPermissions } from 'src/constants/hr-menus';
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
  Chip,
  Card,
  Alert,
  Stack,
  Button,
  Tooltip,
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
  const [columns, setColumns] = useState<string[]>(standardSalaryDocumentColumns);
  const [page, setPage] = useState({ number: 1, size: 25 });
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
  const [basePreview, setPreview] = useState<HrReportPreview>();
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
    let pendingRequest: ReturnType<typeof loadPreview> | undefined;
    const timer = setTimeout(() => {
      pendingRequest = loadPreview(JSON.parse(signature));
      pendingRequest
        .unwrap()
        .then((data) => {
          if (current === sequence.current) setPreview(data);
        })
        .catch((failure) => {
          if (current === sequence.current)
            setError(payslipActionError(failure, 'The document preview could not be loaded.'));
        })
        .finally(() => {
          if (current === sequence.current) setLoading(false);
        });
    }, 350);
    return () => {
      sequence.current += 1;
      clearTimeout(timer);
      pendingRequest?.abort();
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
      columnTypes: Object.fromEntries(
        (request.columns || []).map((id) => [
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
      data: basePreview,
      isLoading: baseLoading,
      isFetching: baseLoading,
      error: baseError,
      refetch: () => setRefresh((value) => value + 1),
    }
  );
  const preview = previewView.data;
  const loading = previewView.isLoading;
  const error =
    typeof previewView.error === 'string'
      ? previewView.error
      : previewView.error
        ? payslipActionError(previewView.error, 'The document preview could not be loaded.')
        : null;
  const preset = statement
    ? settings.data?.presentation?.statementColumns
    : settings.data?.presentation?.registerColumns;
  if (!permissions.canView)
    return (
      <HrNotice role="alert" severity="info">
        HR Reports View permission is required to preview salary documents.
      </HrNotice>
    );
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
        <Typography variant="h6">{title}</Typography>
        <Tooltip title="Saved payroll records for the selected period. Missing months and historical fields appear as unavailable.">
          <IconButton size="small" aria-label="About salary documents">
            <Iconify icon="mdi:information-outline" width={16} sx={{ color: 'info.main' }} />
          </IconButton>
        </Tooltip>
        <Chip size="small" variant="soft" label="Issued payroll" color="default" />
      </Stack>
      <Card sx={{ p: 1.5 }}>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: statement
                  ? 'minmax(200px, 2fr) repeat(3, minmax(140px, 1fr))'
                  : '240px minmax(0, 1fr)',
              },
            }}
          >
            {statement && (
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
            )}
            {statement && (
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
            )}
            <TextField
              label={statement ? 'To month' : 'Payroll month'}
              type="month"
              size="small"
              value={to}
              onChange={(event) => {
                setPayrollMonth(dayjs(`${event.target.value}-01`));
                setPage({ ...page, number: 1 });
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
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
              helperText="Identity, totals, and all nonzero deductions always appear."
            >
              {salaryDocumentFields.map(([id, label]) => (
                <MenuItem
                  key={id}
                  value={id}
                  disabled={mandatorySalaryDocumentColumns.includes(id)}
                >
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {statement && from > to && (
            <Alert severity="warning">The end month must be on or after the start month.</Alert>
          )}
          {statement && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {[6, 7, 12].map((months) => (
                <Button
                  key={months}
                  size="small"
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
          )}
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', lg: 'center' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                Only issued payslips from locked payroll are included.
              </Typography>
              <Button
                size="small"
                onClick={() =>
                  setColumns([
                    ...new Set([
                      ...mandatorySalaryDocumentColumns,
                      ...(preset?.length ? preset : standardSalaryDocumentColumns),
                    ]),
                  ])
                }
              >
                Use school column preset
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:refresh" width={18} />}
                disabled={!ready || loading}
                onClick={() => previewView.refetch()}
              >
                Refresh Preview
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Card>
      {error && (
        <Alert
          severity="error"
          action={
            <Button size="small" disabled={!ready || loading} onClick={() => previewView.refetch()}>
              Retry preview
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      <HrReportPreviewTable
        operationalProps={previewView.tableProps}
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
        sourceLabel={title}
        emptyMessage={
          statement && !employee
            ? 'Select a staff member and month range.'
            : 'No saved payroll is available for this selection.'
        }
        isLoading={loading}
        onPageChange={(number, size) => setPage({ number, size })}
      />
      {!!preview?.totals && (
        <Card sx={{ p: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {preview.totalsLabel}
          </Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            {(['totalEarnings', 'totalDeduction', 'netPay'] as const).map((field) => (
              <Box key={field}>
                <Typography variant="caption">
                  {salaryDocumentFields.find(([id]) => id === field)?.[1]}
                </Typography>
                <Typography variant="subtitle1">
                  {preview.totals?.[field]?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }) ?? 'Unavailable'}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
