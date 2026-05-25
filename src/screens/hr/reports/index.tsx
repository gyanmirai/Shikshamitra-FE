'use client';

import type { HrReportFormat, HrReportFilter } from 'src/redux/hr/hrReportsApi';

import dayjs, { type Dayjs } from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CustomizableTable from 'src/components/customizabaleTable';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  useGetHrReportOptionsQuery,
  usePreviewHrReportMutation,
  useGetHrReportExportsQuery,
  useCreateHrReportExportMutation,
  useDownloadHrReportExportMutation,
} from 'src/redux/hr/hrReportsApi';

const EMPLOYEE_REPORTS = [
  'Employee Profile',
  'Employee List',
  'Joining Letter',
  'Employee Detail',
  'Employee Contact List',
  'Employee All Detail',
  'Relieving Certificate',
  'Increment Certificate',
  'Experience Certificate',
];

const PAYROLL_REPORTS = [
  'Salary Register',
  'Employee Payslip',
  'Monthly Payroll Summary',
  'Allowance Report',
  'Deduction Report',
  'Payroll Reconciliation Report',
  'Leave Encashment Report',
  'Final Settlement Report',
];

const DOCUMENT_REPORTS = new Set([
  'Joining Letter',
  'Relieving Certificate',
  'Increment Certificate',
  'Experience Certificate',
]);

const COMPONENT_REPORTS = new Set(['Allowance Report', 'Deduction Report']);

const GENDER_OPTIONS = [
  { id: 0, label: 'Male' },
  { id: 1, label: 'Female' },
  { id: 2, label: 'Other' },
];

const DEFAULT_PAGE_SIZE = 25;

const getEmployeeLabel = (employee: any) =>
  employee?.employeeName ||
  employee?.fullName ||
  [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') ||
  employee?.employeeCode ||
  '';

const getEmployeeId = (employee: any) => employee?.id || employee?.employeeId || '';

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '-';

const ReportsScreen = () => {
  const [reportCategory, setReportCategory] = useState<'Employee' | 'Payroll'>('Employee');
  const [reportType, setReportType] = useState(EMPLOYEE_REPORTS[1]);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<{ id: string; label: string }[]>([]);
  const [selectedGender, setSelectedGender] = useState<{ id: number; label: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [componentNames, setComponentNames] = useState<string[]>([]);
  const [lastRequest, setLastRequest] = useState<{ page: number; pageSize: number } | null>(null);

  const { data: reportOptions } = useGetHrReportOptionsQuery();
  const {
    data: exportJobs = [],
    refetch: refetchExports,
    isFetching: isFetchingExports,
  } = useGetHrReportExportsQuery(undefined, { pollingInterval: 5000 });

  const [searchEmployees, { data: employeeResult, isFetching: isSearchingEmployees }] =
    useLazyGetEmployeeQuery();
  const [previewReport, { data: preview, isLoading: isPreviewLoading }] =
    usePreviewHrReportMutation();
  const [createExport, { isLoading: isCreatingExport }] = useCreateHrReportExportMutation();
  const [downloadExport, { isLoading: isDownloading }] = useDownloadHrReportExportMutation();

  const availableReportTypes = useMemo(
    () => (reportCategory === 'Employee' ? EMPLOYEE_REPORTS : PAYROLL_REPORTS),
    [reportCategory]
  );

  const departmentOptions = useMemo(
    () => reportOptions?.departments?.map((option) => option.label) ?? [],
    [reportOptions?.departments]
  );

  const employeeOptions = useMemo(() => employeeResult?.items ?? [], [employeeResult]);

  const isPayrollReport = reportCategory === 'Payroll';
  const isDocumentReport = DOCUMENT_REPORTS.has(reportType);
  const isComponentReport = COMPONENT_REPORTS.has(reportType);

  useEffect(() => {
    searchEmployees({ page: 1, pageSize: 20, search: '' });
  }, [searchEmployees]);

  useEffect(() => {
    setReportType(availableReportTypes[0]);
    setLastRequest(null);
  }, [availableReportTypes]);

  const buildFilters = useCallback((): HrReportFilter => {
    const filters: HrReportFilter = {};

    if (selectedEmployees.length > 0) {
      filters.employeeIds = selectedEmployees.map(getEmployeeId).filter(Boolean);
    }

    if (selectedDepartments.length > 0) {
      filters.departments = selectedDepartments;
    }

    if (selectedStatuses.length > 0) {
      filters.statuses = selectedStatuses.map((status) => Number(status.id));
    }

    if (selectedGender) {
      filters.genderType = selectedGender.id;
    }

    if (isPayrollReport && selectedMonth) {
      filters.month = selectedMonth.format('YYYY-MM');
    }

    if (isComponentReport && componentNames.length > 0) {
      filters.componentNames = componentNames;
    }

    return filters;
  }, [
    componentNames,
    isComponentReport,
    isPayrollReport,
    selectedDepartments,
    selectedEmployees,
    selectedGender,
    selectedMonth,
    selectedStatuses,
  ]);

  const handlePreview = useCallback(
    async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
      await previewReport({
        reportType,
        format: 'excel',
        page,
        pageSize,
        filters: buildFilters(),
      }).unwrap();
      setLastRequest({ page, pageSize });
    },
    [buildFilters, previewReport, reportType]
  );

  const handleExport = useCallback(
    async (format: HrReportFormat) => {
      await createExport({
        reportType,
        format,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: buildFilters(),
      }).unwrap();
      await refetchExports();
    },
    [buildFilters, createExport, refetchExports, reportType]
  );

  const handleDownload = useCallback(
    async (jobId: string, fileName?: string) => {
      const blob = await downloadExport(jobId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'hr-report';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [downloadExport]
  );

  const previewColumns = useMemo(
    () =>
      (preview?.columns ?? []).map((column) => ({
        id: column.id,
        label: column.label,
        minWidth: '12vw',
        align: 'left' as const,
        filterType: 'string' as const,
      })),
    [preview?.columns]
  );

  const previewRows = useMemo(
    () =>
      (preview?.rows ?? []).map((row, index) => ({
        id: `${preview?.page ?? 1}-${index}`,
        ...row,
      })),
    [preview?.page, preview?.rows]
  );

  const historyColumns = useMemo(
    () => [
      { id: 'reportType', label: 'Report', minWidth: '14vw', align: 'left' as const },
      { id: 'format', label: 'Format', minWidth: '7vw', align: 'left' as const },
      {
        id: 'status',
        label: 'Status',
        minWidth: '9vw',
        align: 'left' as const,
        render: (_value: any, row: any) => (
          <Chip
            size="small"
            label={row.status}
            color={
              row.status === 'Completed' ? 'success' : row.status === 'Failed' ? 'error' : 'info'
            }
            variant="soft"
          />
        ),
      },
      {
        id: 'creationTime',
        label: 'Requested',
        minWidth: '13vw',
        align: 'left' as const,
        render: (value: string) => formatDateTime(value),
      },
      {
        id: 'completedAt',
        label: 'Completed',
        minWidth: '13vw',
        align: 'left' as const,
        render: (value: string) => formatDateTime(value),
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: '7vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value: any, row: any) => (
          <IconButton
            size="small"
            disabled={row.status !== 'Completed' || isDownloading}
            onClick={() => handleDownload(row.id, row.fileName)}
          >
            <Iconify icon={GlobalIcons.download} />
          </IconButton>
        ),
      },
    ],
    [handleDownload, isDownloading]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate paged HR report previews and export PDF or Excel files through background jobs."
        links={[{ name: 'HR/Staff', href: '/hr/dashboard/' }, { name: 'Reports' }]}
        sx={{ px: 2 }}
      />

      <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '220px 1fr 1fr' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <TextField
            select
            size="small"
            label="Category"
            value={reportCategory}
            onChange={(event) => setReportCategory(event.target.value as 'Employee' | 'Payroll')}
          >
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="Payroll">Payroll</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Report"
            value={reportType}
            onChange={(event) => {
              setReportType(event.target.value);
              setLastRequest(null);
            }}
          >
            {(
              reportOptions?.reportTypes?.filter((option) =>
                availableReportTypes.includes(option.label)
              ) ?? availableReportTypes.map((name) => ({ id: name, label: name }))
            ).map((option) => (
              <MenuItem key={option.id} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            size="small"
            options={employeeOptions}
            loading={isSearchingEmployees}
            value={selectedEmployees}
            filterOptions={(options) => options}
            getOptionLabel={(option) => {
              const label = getEmployeeLabel(option);
              return option?.employeeCode ? `${label} (${option.employeeCode})` : label;
            }}
            isOptionEqualToValue={(option, value) => getEmployeeId(option) === getEmployeeId(value)}
            onInputChange={(_event, value) =>
              searchEmployees({ page: 1, pageSize: 20, search: value })
            }
            onChange={(_event, value) => setSelectedEmployees(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isDocumentReport ? 'Employees' : 'Employees'}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearchingEmployees ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <Autocomplete
            multiple
            freeSolo
            size="small"
            options={departmentOptions}
            value={selectedDepartments}
            onChange={(_event, value) => setSelectedDepartments(value)}
            renderInput={(params) => <TextField {...params} label="Departments" />}
          />

          <Autocomplete
            multiple
            size="small"
            options={reportOptions?.statuses ?? []}
            value={selectedStatuses}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, value) => setSelectedStatuses(value)}
            renderInput={(params) => <TextField {...params} label="Statuses" />}
          />

          <Autocomplete
            size="small"
            options={GENDER_OPTIONS}
            value={selectedGender}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, value) => setSelectedGender(value)}
            renderInput={(params) => <TextField {...params} label="Gender" />}
          />

          {isPayrollReport ? (
            <DatePicker
              label="Payroll Month"
              value={selectedMonth}
              views={['year', 'month']}
              slotProps={{ textField: { size: 'small' } }}
              onChange={(value) => setSelectedMonth(value)}
            />
          ) : (
            <TextField
              size="small"
              label="Page Size"
              value={lastRequest?.pageSize ?? DEFAULT_PAGE_SIZE}
              disabled
            />
          )}
        </Box>

        {isComponentReport && (
          <Autocomplete
            multiple
            freeSolo
            size="small"
            options={[]}
            value={componentNames}
            onChange={(_event, value) => setComponentNames(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Component Names"
                placeholder="Type allowance or deduction name"
              />
            )}
          />
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.report} />}
            disabled={isPreviewLoading}
            onClick={() => handlePreview(1, lastRequest?.pageSize ?? DEFAULT_PAGE_SIZE)}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.excel} />}
            disabled={isCreatingExport}
            onClick={() => handleExport('excel')}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.pdf} />}
            disabled={isCreatingExport}
            onClick={() => handleExport('pdf')}
          >
            PDF
          </Button>
          {(isPreviewLoading || isCreatingExport || isFetchingExports) && (
            <CircularProgress size={24} />
          )}
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Preview</Typography>
            {preview && (
              <Typography variant="body2" color="text.secondary">
                {preview.totalCount} rows
              </Typography>
            )}
          </Stack>
          <CustomizableTable
            tableId="hr-report-preview"
            tableTitle={`${reportType} Preview`}
            columns={previewColumns}
            data={previewRows}
            isLoading={isPreviewLoading}
            totalCount={preview?.totalCount ?? 0}
            serverSidePagination
            serverSideFilter
            serverSideSort
            isSearch={false}
            isFilter={false}
            maxServerRowsPerPage={200}
            noDataText="Generate a preview to view report rows."
            onServerPagination={(page, pageSize) => handlePreview(page, pageSize)}
          />
        </Box>

        <Box sx={{ minHeight: 260, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Export History
          </Typography>
          <CustomizableTable
            tableId="hr-report-export-history"
            tableTitle="HR Report Export History"
            columns={historyColumns}
            data={exportJobs}
            isLoading={isFetchingExports}
            isSearch={false}
            noDataText="No export jobs found."
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default ReportsScreen;
