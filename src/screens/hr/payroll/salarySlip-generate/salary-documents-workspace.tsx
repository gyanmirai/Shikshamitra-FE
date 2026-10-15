'use client';

import type { RootState } from 'src/redux/store';
import type {
  HrReportSort,
  HrReportFormat,
  HrReportPreview,
  HrReportRequest,
} from 'src/redux/hr/hrReportsApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useGetPayslipSettingsQuery } from 'src/redux/hr/payslip-api';
import { useLazyGetEmployeeOptionsQuery } from 'src/redux/hr/employeeApi';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Switch,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useGetHrReportExportQuery,
  usePreviewHrReportMutation,
  useCreateHrReportExportMutation,
  useDownloadHrReportExportMutation,
} from 'src/redux/hr/hrReportsApi';

import { payslipActionError } from './payslip-action-error';
import { buildPayslipEmployeeSearch } from './payslip-selection';
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
  const [from, setFrom] = useState(dayjs().subtract(5, 'month').format('YYYY-MM'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM'));
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [columns, setColumns] = useState<string[]>(standardSalaryDocumentColumns);
  const [page, setPage] = useState({ number: 1, size: 25 });
  const [sorts, setSorts] = useState<HrReportSort[]>([]);
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
    sorts: statement ? undefined : sorts,
    filters: {
      employeeIds: statement && employee ? [employee.id] : undefined,
      includeDrafts,
      month: statement ? undefined : to,
      fromDate: statement ? `${from}-01` : undefined,
      toDate: statement ? `${to}-01` : undefined,
    },
  };
  const signature = JSON.stringify(request);
  const [loadPreview] = usePreviewHrReportMutation();
  const [preview, setPreview] = useState<HrReportPreview>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const sequence = useRef(0);
  useEffect(() => {
    sequence.current += 1;
    const { current } = sequence;
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
  }, [signature, ready, active, refresh, loadPreview]);
  const [createExport, exporting] = useCreateHrReportExportMutation();
  const [jobId, setJobId] = useState<string | null>(null);
  const [terminalJobId, setTerminalJobId] = useState<string | null>(null);
  const job = useGetHrReportExportQuery(active ? (jobId ?? skipToken) : skipToken, {
    pollingInterval: jobId === terminalJobId ? 0 : 3000,
    skipPollingIfUnfocused: true,
  });
  useEffect(() => {
    if (job.data?.status === 'Completed' || job.data?.status === 'Failed') setTerminalJobId(jobId);
  }, [job.data?.status, jobId]);
  const [download, downloading] = useDownloadHrReportExportMutation();
  const exportInFlight = useRef(false);
  const queueExport = async (format: HrReportFormat) => {
    if (exportInFlight.current || !ready || !permissions.canExport) return;
    exportInFlight.current = true;
    setError(null);
    try {
      const result = await createExport({ ...request, page: 1, format }).unwrap();
      setJobId(result.jobId);
    } catch (failure) {
      setError(payslipActionError(failure, 'The export could not be queued.'));
    } finally {
      exportInFlight.current = false;
    }
  };
  const downloadExport = async () => {
    if (!jobId || !job.data || job.data.isExpired || job.data.status !== 'Completed') return;
    try {
      const bytes = await download(jobId).unwrap();
      const url = URL.createObjectURL(bytes);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        job.data.fileName ?? `salary-document.${job.data.format === 'pdf' ? 'pdf' : 'xlsx'}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) {
      setError(payslipActionError(failure, 'The export could not be downloaded.'));
    }
  };
  const preset = statement
    ? settings.data?.presentation?.statementColumns
    : settings.data?.presentation?.registerColumns;
  if (!permissions.canView)
    return (
      <Alert severity="info">
        HR Reports View permission is required to preview salary documents.
      </Alert>
    );
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6">{title}</Typography>
        <Chip
          size="small"
          variant="outlined"
          label={includeDrafts ? 'Preview' : 'Issued payroll'}
          color={includeDrafts ? 'warning' : 'default'}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Saved payroll records for the selected period. Missing months and historical fields appear
        as unavailable.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                md: statement ? 'minmax(220px, 2fr) 1fr 1fr' : '1fr 2fr',
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
                setTo(event.target.value);
                setPage({ ...page, number: 1 });
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          {statement && from > to && (
            <Alert severity="warning">The end month must be on or after the start month.</Alert>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
            {statement &&
              [6, 7, 12].map((months) => (
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
            <FormControlLabel
              sx={{ ml: { sm: 'auto' } }}
              label="Include draft payroll"
              control={
                <Switch
                  size="small"
                  checked={includeDrafts}
                  onChange={(_, checked) => {
                    setIncludeDrafts(checked);
                    setPage({ ...page, number: 1 });
                  }}
                />
              }
            />
          </Stack>
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
              <MenuItem key={id} value={id} disabled={mandatorySalaryDocumentColumns.includes(id)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1} justifyContent="space-between" flexWrap="wrap">
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
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                disabled={!ready || loading}
                onClick={() => setRefresh((value) => value + 1)}
              >
                Refresh preview
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!ready || !preview || !permissions.canExport || exporting.isLoading}
                onClick={() => queueExport('excel')}
              >
                Export Excel
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!ready || !preview || !permissions.canExport || exporting.isLoading}
                onClick={() => queueExport('pdf')}
              >
                Export PDF
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      {error && (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              disabled={!ready || loading}
              onClick={() => setRefresh((value) => value + 1)}
            >
              Retry preview
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {jobId && (
        <Alert
          severity={job.data?.status === 'Failed' ? 'error' : 'info'}
          action={
            job.data?.status === 'Completed' && !job.isError && !job.data.isExpired ? (
              <Button size="small" disabled={downloading.isLoading} onClick={downloadExport}>
                Download
              </Button>
            ) : undefined
          }
        >
          {job.isError
            ? 'Export status could not be refreshed.'
            : job.data?.isExpired
              ? 'This export has expired. Create a new export to download the document.'
              : job.data?.status === 'Failed'
                ? (job.data.errorMessage ?? 'Export failed.')
                : `Export ${job.data?.status?.toLowerCase() ?? 'queued'}. PDF exports include up to 500 rows; Excel includes up to 20,000.`}
        </Alert>
      )}
      {preview?.queryWarnings?.map((warning) => (
        <Alert
          severity="info"
          variant="outlined"
          key={warning}
          sx={{ py: 0, bgcolor: 'transparent' }}
        >
          {warning}
        </Alert>
      ))}
      <HrReportPreviewTable
        preview={preview}
        reportName={title}
        sourceLabel={title}
        emptyMessage={
          statement && !employee
            ? 'Select a staff member and month range.'
            : 'No saved payroll is available for this selection.'
        }
        sortableFields={
          statement ? [] : ['month', 'employeeCode', 'totalEarnings', 'totalDeduction', 'netPay']
        }
        sorts={statement ? [] : sorts}
        onSortChange={
          statement
            ? undefined
            : (selected) => {
                setSorts(selected);
                setPage({ ...page, number: 1 });
              }
        }
        isLoading={loading}
        onPageChange={(number, size) => setPage({ number, size })}
      />
      {!!preview?.totals && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
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
        </Paper>
      )}
    </Stack>
  );
}
