'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { Scrollbar } from 'src/components/scrollbar';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Avatar,
  Divider,
  Skeleton,
  CardHeader,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  useLazyGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipPdfQuery,
  useLazyGetEmployeeSalarySlipPreviewPdfQuery,
} from 'src/redux/runPayroll/runPayrollApi';

import PaySlipPrintView from './payslip-print-view';
import { hasMoreEmployeeSearchPages } from './salary-slip-employee-search';
import { usePayslipActions, isOfficialPayslipStatus } from './use-payslip-actions';

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

type PayslipViewMode = 'dashboard' | 'pdf';
type PayslipTone = 'success' | 'error' | 'info' | 'warning' | 'default';

const PaySlipGenerationScreen = () => {
  const [employee, setEmployee] = useState<any>(null);
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<PayslipViewMode>('dashboard');

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const printRef = useRef<HTMLDivElement>(null);

  const [getEmployees] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
  });

  const [
    getEmployeeSalarySlip,
    { data: employeeSalarySlip, isLoading: employeeSalarySlipLoading },
  ] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetEmployeeSalarySlipQuery,
    params: {
      employeeId: employee?.id,
      monthYear: monthYear?.format('MMMM-YYYY').toUpperCase(),
    },
    options: {
      skip: !employee?.id || !monthYear,
    },
  });

  const [getEmployeeSalarySlipPdf] = useLazyGetEmployeeSalarySlipPdfQuery();
  const [getEmployeeSalarySlipPreviewPdf] = useLazyGetEmployeeSalarySlipPreviewPdfQuery();

  useEffect(() => {
    if (employee?.id && monthYear) {
      getEmployeeSalarySlip({
        employeeId: employee?.id,
        monthYear: monthYear?.format('MMMM-YYYY').toUpperCase(),
      });
    }
  }, [employee?.id, getEmployeeSalarySlip, monthYear]);

  const normalizedSalarySlip = employeeSalarySlip
    ? {
        ...employeeSalarySlip,
        netSalary: employeeSalarySlip.netSalary ?? employeeSalarySlip.netPay ?? 0,
      }
    : null;

  const downloadOfficialPdf = useCallback(async () => {
    if (!employee?.id || !monthYear) return null;

    return getEmployeeSalarySlipPdf({
      employeeId: employee.id,
      monthYear: monthYear.format('MMMM-YYYY').toUpperCase(),
    }).unwrap();
  }, [employee?.id, getEmployeeSalarySlipPdf, monthYear]);

  const downloadPreviewPdf = useCallback(async () => {
    if (!employee?.id || !monthYear) return null;

    return getEmployeeSalarySlipPreviewPdf({
      employeeId: employee.id,
      monthYear: monthYear.format('MMMM-YYYY').toUpperCase(),
    }).unwrap();
  }, [employee?.id, getEmployeeSalarySlipPreviewPdf, monthYear]);

  const { handlePrint, handleDownload, isDownloading, isOfficialPayslip } = usePayslipActions({
    printRef,
    employee,
    monthYear,
    employeeSalarySlip: normalizedSalarySlip,
    downloadOfficialPdf,
    downloadPreviewPdf,
  });

  const hasData = !!employee?.id && !employeeSalarySlipLoading && !!employeeSalarySlip;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CustomBreadcrumbs
        heading="Payslips"
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.runPayroll },
          { name: 'Payslips' },
        ]}
        description="View, download, or print finalized salary slips after payroll lock."
      />

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.neutral',
          pb: 1.5,
          pt: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Card
          sx={{
            p: 1.5,
            width: '100%',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) => theme.customShadows?.z1,
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.5}
            alignItems={{ lg: 'center' }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              flexWrap="wrap"
              alignItems={{ sm: 'center' }}
              sx={{ flex: 1 }}
            >
              <PaginatedSearchSelect
                label="Select Employee"
                fetchOptions={async (query, page) => {
                  const res = await getEmployees({ page, pageSize: 10, search: query }).unwrap();
                  return {
                    data: res?.items?.map((item: any) => ({
                      label: item.fullName,
                      id: item.id,
                    })),
                    hasMore: hasMoreEmployeeSearchPages(res),
                  };
                }}
                value={employee}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(prop, option: any) => {
                  const { key, ...optionProps } = prop;
                  return (
                    <li key={key || option.id} {...optionProps}>
                      {option.label}
                    </li>
                  );
                }}
                getOptionLabel={(option: any) => option?.label || ''}
                minChars={2}
                onChange={(_, value) => setEmployee(value)}
                debounceMs={400}
                placeholder="Search by name or email"
                error={false}
                sx={{ width: { xs: '100%', sm: 320 } }}
                size="small"
                clearOnBlur={false}
              />

              <DatePicker
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                value={monthYear}
                onChange={(val) => setMonthYear(val)}
                views={['month', 'year']}
                label="Select Pay Period"
                format="MMMM-YYYY"
                sx={{ width: { xs: '100%', sm: 220 } }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </Stack>

            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              sx={{
                width: { xs: '100%', lg: 'auto' },
                p: 0.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: 'background.default',
              }}
            >
              <ToggleButtonGroup
                exclusive
                size="small"
                value={viewMode}
                onChange={(_, value: PayslipViewMode | null) => {
                  if (value) setViewMode(value);
                }}
                sx={{
                  p: 0,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  '& .MuiToggleButton-root': {
                    px: 1.25,
                    py: 0.55,
                    gap: 0.5,
                    border: 0,
                    typography: 'caption',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      bgcolor: 'background.neutral',
                      color: 'text.primary',
                    },
                  },
                }}
              >
                <ToggleButton value="dashboard">
                  <Iconify icon="solar:widget-5-linear" width={16} />
                  Dashboard
                </ToggleButton>
                <ToggleButton value="pdf">
                  <Iconify icon="solar:document-text-linear" width={16} />
                  PDF View
                </ToggleButton>
              </ToggleButtonGroup>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: 'none', sm: 'block' } }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:download-linear" />}
                  variant="outlined"
                  color="inherit"
                  disabled={!hasData || isDownloading}
                  onClick={handleDownload}
                >
                  {isDownloading
                    ? 'Downloading...'
                    : isOfficialPayslip
                      ? 'Download'
                      : 'Download Preview'}
                </Button>
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:printer-linear" />}
                  variant="outlined"
                  color="inherit"
                  disabled={!hasData}
                  onClick={() => handlePrint()}
                >
                  {isOfficialPayslip ? 'Print' : 'Print Preview'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        {employeeSalarySlipLoading && (
          <Grid container spacing={1.5}>
            {[1, 2, 3].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item}>
                <Card sx={{ p: 1.5, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <Box flexGrow={1}>
                    <Skeleton variant="text" width="50%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="70%" height={40} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Scrollable Body Content */}
      <Scrollbar sx={{ flexGrow: 1 }}>
        <Stack spacing={1} sx={{ pb: 2 }}>
          {hasData ? (
            <>
              {viewMode === 'dashboard' ? (
                <PayslipDashboardPreview
                  employee={employee}
                  monthYear={monthYear}
                  slip={normalizedSalarySlip}
                />
              ) : (
                <PayslipDocumentPreview
                  employee={employee}
                  monthYear={monthYear}
                  slip={normalizedSalarySlip}
                />
              )}
            </>
          ) : employeeSalarySlipLoading ? (
            <>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={1}>
                {[1, 2].map((item) => (
                  <Grid size={{ xs: 12, md: 6 }} key={item}>
                    <Card sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
                      <CardHeader
                        title={<Skeleton variant="text" width="30%" height={24} />}
                        subheader={<Skeleton variant="text" width="40%" height={20} />}
                        sx={{ p: 2 }}
                      />
                      <Box sx={{ px: 2, py: 2, pt: 0 }}>
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={200}
                          sx={{ borderRadius: 1 }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Card
              sx={{
                minHeight: 360,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <EmptyContent title="Search an employee to view a finalized payslip" />
            </Card>
          )}
        </Stack>
      </Scrollbar>

      {/* Hidden print component */}
      <Box sx={{ display: 'none', displayPrint: 'block' }}>
        <PaySlipPrintView
          ref={printRef}
          employee={employee}
          monthYear={monthYear}
          slip={normalizedSalarySlip}
        />
      </Box>
    </Box>
  );
};

export default PaySlipGenerationScreen;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PayslipDocumentPreviewProps {
  employee: { label?: string } | null;
  monthYear: Dayjs | null;
  slip: any;
}

const documentBorder = '1px solid #d9dde3';
const documentHeaderBg = '#f6f7f9';
const documentText = '#111827';

const formatDays = (value: number | null | undefined) =>
  value === null || value === undefined ? '-' : Number(value).toLocaleString('en-IN');

const formatDecimal = (value: number | null | undefined, digits = 4) =>
  value === null || value === undefined ? '-' : Number(value).toFixed(digits);

const formatDate = (value: string | Date | null | undefined) =>
  value ? dayjs(value).format('DD MMM YYYY') : '-';

const formatMode = (value: string | null | undefined) => {
  if (!value) return '-';
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatStatus = (value: string | number | null | undefined) => {
  if (value === 0 || value === '0') return 'Draft';
  if (value === 1 || value === '1') return 'Finalized';
  if (value === 2 || value === '2') return 'Paid';
  if (!value) return 'Status Pending';

  const normalized = String(value).replace(/[_-]/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
};

const salaryLineTotal = (data: any[]) =>
  (data || []).reduce((sum, item) => sum + Number(item?.amount || 0), 0);

const getEmployeeName = (employee: { label?: string } | null, slip: any) =>
  slip?.employeeName || employee?.label || '-';

const getStatusTone = (status: string | number | null | undefined): PayslipTone => {
  const normalized = formatStatus(status).toLowerCase();

  if (normalized === 'paid') return 'success';
  if (normalized === 'finalized') return 'info';
  if (normalized === 'draft') return 'warning';

  return 'default';
};

const PayslipDashboardPreview = ({ employee, monthYear, slip }: PayslipDocumentPreviewProps) => {
  const period = monthYear ? monthYear.format('MMMM YYYY') : '-';
  const status = formatStatus(slip?.status);
  const employeeName = getEmployeeName(employee, slip);
  const payBasisItems = [
    ['Payable Days', formatDays(slip?.payableDays)],
    ['Payroll Basis Days', formatDays(slip?.payrollBasisDays)],
    ['Present Days', formatDays(slip?.presentDays)],
    ['Half Days', formatDays(slip?.halfWorkingDays)],
    ['LOP / Absent Days', formatDays(slip?.lopDays)],
    ['Proration Factor', formatDecimal(slip?.prorationFactor)],
    ['Day Calculation', formatMode(slip?.payrollDayCalculationMode)],
    ['Pay Period', period],
  ];
  const paymentItems = [
    ['Bank', slip?.bankName || '-'],
    ['Account No.', slip?.maskedAccountNumber || '-'],
    ['IFSC', slip?.ifscCode || '-'],
    ['UAN', slip?.uanNumber || '-'],
    ['EPF No.', slip?.epfNumber || '-'],
  ];

  return (
    <Stack spacing={1}>
      <Card
        sx={{
          p: { xs: 1.5, md: 2 },
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => theme.customShadows?.z1,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              variant="rounded"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                color: 'text.primary',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Iconify icon="solar:user-id-linear" width={24} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {employeeName}
                </Typography>
                <StatusBadge status={status} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {slip?.employeeCode || '-'} / {slip?.department || '-'} / {slip?.designation || '-'}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'row', md: 'column' }}
            spacing={0.25}
            sx={{ textAlign: { md: 'right' } }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Pay Period
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {period}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Slip No: {slip?.slipNumber || '-'}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardMetricCard
            label="Total Earnings"
            value={formatCurrency(slip?.totalEarning || 0)}
            icon="solar:wallet-money-linear"
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardMetricCard
            label="Total Deductions"
            value={formatCurrency(slip?.totalDeduction || 0)}
            icon="solar:bill-list-linear"
            tone="error"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardMetricCard
            label="Net Payable"
            value={formatCurrency(slip?.netSalary || 0)}
            icon="solar:card-send-linear"
            tone="info"
            strong
          />
        </Grid>
      </Grid>

      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardPanel
            title="Pay Basis"
            subtitle="Attendance and proration values used for payroll"
          >
            <Grid container spacing={1}>
              {payBasisItems.map(([label, value]) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
                  <DashboardInfoTile label={label} value={value} />
                </Grid>
              ))}
            </Grid>
          </DashboardPanel>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardPanel title="Payment & Statutory" subtitle="Bank and statutory references">
            <Stack divider={<Divider flexItem />}>
              {paymentItems.map(([label, value]) => (
                <CompactKeyValue key={label} label={label} value={value} />
              ))}
            </Stack>
          </DashboardPanel>
        </Grid>
      </Grid>

      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardBreakdownCard
            title="Earnings"
            rows={slip?.earnings || []}
            total={slip?.totalEarning || 0}
            emptyText="No earnings"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardBreakdownCard
            title="Deductions"
            rows={slip?.deductions || []}
            total={slip?.totalDeduction || 0}
            emptyText="No deductions"
          />
        </Grid>
      </Grid>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: slip?.remarks ? 8 : 12 }}>
          <DashboardPanel title="Net Pay in Words">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {slip?.netPayInWords || '-'}
            </Typography>
          </DashboardPanel>
        </Grid>
        {slip?.remarks ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardPanel title="Remarks">
              <Typography variant="body2" color="text.secondary">
                {slip.remarks}
              </Typography>
            </DashboardPanel>
          </Grid>
        ) : null}
      </Grid>
    </Stack>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const tone = getStatusTone(status);

  return (
    <Box
      component="span"
      sx={(theme) => {
        const isDark = theme.palette.mode === 'dark';
        let bgColor = theme.palette.background.neutral;
        let borderColor = theme.palette.divider;
        let textColor = theme.palette.text.primary;

        if (tone !== 'default') {
          const palette = theme.palette[tone];
          bgColor = isDark ? alpha(palette.main, 0.2) : alpha(palette.lighter, 0.42);
          borderColor = alpha(palette.main, isDark ? 0.5 : 0.28);
          textColor = palette.main;
        }

        return {
          px: 1,
          py: 0.35,
          borderRadius: 1,
          border: `1px solid ${borderColor}`,
          bgcolor: bgColor,
          typography: 'caption',
          fontWeight: 800,
          textTransform: 'uppercase',
          color: textColor,
          letterSpacing: 0,
        };
      }}
    >
      {status}
    </Box>
  );
};

const DashboardMetricCard = ({
  label,
  value,
  icon,
  tone = 'default',
  strong = false,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: Exclude<PayslipTone, 'warning'>;
  strong?: boolean;
}) => (
  <Card
    sx={(theme) => {
      const accent =
        tone === 'default' ? theme.palette.divider : alpha(theme.palette[tone].main, 0.55);

      return {
        p: 1.5,
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: theme.customShadows?.z1,
      };
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Avatar
        variant="rounded"
        sx={(theme) => {
          const isDark = theme.palette.mode === 'dark';
          const bgColor = theme.palette.background.neutral;
          let textColor = theme.palette.text.primary;
          let borderColor = theme.palette.divider;

          if (tone !== 'default') {
            const palette = theme.palette[tone];
            textColor = palette.main;
            borderColor = alpha(palette.main, isDark ? 0.4 : 0.18);
          }

          return {
            width: 38,
            height: 38,
            borderRadius: 1.25,
            bgcolor: bgColor,
            color: textColor,
            border: `1px solid ${borderColor}`,
          };
        }}
      >
        <Iconify icon={icon} width={20} />
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography
          variant={strong ? 'h6' : 'subtitle1'}
          sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

const DashboardPanel = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Card
    sx={{
      p: 1.5,
      height: '100%',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: (theme) => theme.customShadows?.z1,
    }}
  >
    <Box sx={{ mb: 1.25 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Box>
    {children}
  </Card>
);

const DashboardInfoTile = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      px: 1.25,
      py: 1,
      borderRadius: 1,
      bgcolor: 'background.neutral',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      minHeight: 68,
    }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography variant="subtitle2" sx={{ mt: 0.35, fontWeight: 800 }}>
      {value}
    </Typography>
  </Box>
);

const CompactKeyValue = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" spacing={1.5} sx={{ py: 0.85 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
      {value}
    </Typography>
  </Stack>
);

const DashboardBreakdownCard = ({
  title,
  rows,
  total,
  emptyText,
}: {
  title: string;
  rows: any[];
  total: number;
  emptyText: string;
}) => (
  <DashboardPanel title={title}>
    {rows?.length ? (
      <Stack divider={<Divider flexItem />}>
        {rows.map((row, index) => (
          <Stack
            key={`${row?.name || title}-${index}`}
            direction="row"
            spacing={1.5}
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 0.85 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row?.name || '-'}
              </Typography>
              {row?.description ? (
                <Typography variant="caption" color="text.secondary">
                  {row.description}
                </Typography>
              ) : null}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
              {formatCurrency(row?.amount || 0)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    ) : (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {emptyText}
      </Typography>
    )}
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        mt: 1,
        px: 1,
        py: 0.85,
        borderRadius: 1,
        bgcolor: 'background.neutral',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        Total
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {formatCurrency(rows?.length ? salaryLineTotal(rows) : total)}
      </Typography>
    </Stack>
  </DashboardPanel>
);

interface SalaryDetailsTableCardProps {
  title: string;
  subheader?: string;
  icon?: string;
  iconColor?: { bg?: string; bgcolor?: string; color?: string };
  data: any[];
  tableId?: string;
  nameColumnLabel?: string;
  noDataText: string;
}

export const SalaryDetailsTableCard = ({
  title,
  subheader,
  icon = 'solar:bill-list-linear',
  iconColor,
  data,
  tableId,
  nameColumnLabel = 'Component',
  noDataText,
}: SalaryDetailsTableCardProps) => {
  const total = salaryLineTotal(data);

  return (
    <Card
      data-table-id={tableId}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.customShadows?.z1,
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            variant="rounded"
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.25,
              bgcolor: iconColor?.bg || iconColor?.bgcolor || 'background.neutral',
              color: iconColor?.color || 'text.primary',
            }}
          >
            <Iconify icon={icon} width={18} />
          </Avatar>
        }
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              {subheader ? (
                <Typography variant="caption" color="text.secondary">
                  {subheader}
                </Typography>
              ) : null}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
              {formatCurrency(total)}
            </Typography>
          </Stack>
        }
        sx={{ p: 1.5, pb: 1 }}
      />

      <Box sx={{ px: 1.5, pb: 1.5, flex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            py: 0.75,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            {nameColumnLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            Amount
          </Typography>
        </Stack>
        {data?.length ? (
          <Stack divider={<Divider flexItem />}>
            {data.map((item, index) => (
              <Stack
                key={`${item?.name || title}-${index}`}
                direction="row"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ py: 0.9 }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
                  {item?.name || '-'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatCurrency(item?.amount || 0)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {noDataText}
          </Typography>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 1, px: 1, py: 0.85, borderRadius: 1, bgcolor: 'background.neutral' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            Total
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {formatCurrency(total)}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
};

const PayslipDocumentPreview = ({ employee, monthYear, slip }: PayslipDocumentPreviewProps) => {
  const period = monthYear ? monthYear.format('MMMM YYYY') : '-';
  const status = formatStatus(slip?.status);
  const isPreview = !isOfficialPayslipStatus(slip?.status);
  const employeeRows: Array<[string, string]> = [
    ['Employee Name', getEmployeeName(employee, slip)],
    ['Employee Code', slip?.employeeCode || '-'],
    ['Department', slip?.department || '-'],
    ['Designation', slip?.designation || '-'],
    ['Date of Joining', formatDate(slip?.dateOfJoining)],
  ];
  const paymentRows: Array<[string, string]> = [
    ['Bank', slip?.bankName || '-'],
    ['Account No.', slip?.maskedAccountNumber || '-'],
    ['IFSC', slip?.ifscCode || '-'],
    ['UAN', slip?.uanNumber || '-'],
    ['EPF No.', slip?.epfNumber || '-'],
  ];
  const payBasisRows: Array<[string, string]> = [
    ['Payroll Basis Days', formatDays(slip?.payrollBasisDays)],
    ['Payable Days', formatDays(slip?.payableDays)],
    ['Present Days', formatDays(slip?.presentDays)],
    ['Half Days', formatDays(slip?.halfWorkingDays)],
    ['LOP / Absent Days', formatDays(slip?.lopDays)],
    ['Proration Factor', formatDecimal(slip?.prorationFactor)],
    ['Day Calculation', formatMode(slip?.payrollDayCalculationMode)],
    ['Pay Period', period],
  ];

  return (
    <Box
      sx={{
        py: { xs: 1, md: 2 },
        px: { xs: 0, md: 2 },
        bgcolor: 'background.neutral',
      }}
    >
      <Card
        sx={{
          width: { xs: '100%', md: 794 },
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          bgcolor: '#fff',
          color: documentText,
          border: documentBorder,
          borderRadius: 0.75,
          boxShadow: (theme) => theme.customShadows?.z8,
          overflow: 'hidden',
        }}
      >
        <Stack spacing={2}>
          <PayslipHeader
            employeeName={getEmployeeName(employee, slip)}
            period={period}
            status={isPreview ? `Preview - ${status}` : status}
            slipNumber={slip?.slipNumber}
            generatedAt={slip?.generatedAt}
            isPreview={isPreview}
          />

          {isPreview ? (
            <Box
              sx={{
                border: documentBorder,
                bgcolor: documentHeaderBg,
                px: 1.25,
                py: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Preview payslip only. Finalize/lock payroll to issue the official salary slip.
              </Typography>
            </Box>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <DocumentInfoSection title="Employee Details" rows={employeeRows} />
            <DocumentInfoSection title="Payment & Statutory" rows={paymentRows} />
          </Stack>

          <DocumentInfoSection title="Pay Basis" rows={payBasisRows} columns={4} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <PayslipAmountTable
              title="Earnings"
              rows={slip?.earnings || []}
              total={slip?.totalEarning || 0}
              emptyText="No earnings"
            />
            <PayslipAmountTable
              title="Deductions"
              rows={slip?.deductions || []}
              total={slip?.totalDeduction || 0}
              emptyText="No deductions"
            />
          </Stack>

          <NetPayDocumentBlock slip={slip} />

          {slip?.remarks ? (
            <Box sx={{ border: documentBorder, p: 1.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Remarks
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {slip.remarks}
              </Typography>
            </Box>
          ) : null}

          <Box sx={{ pt: 1.25, borderTop: documentBorder, textAlign: 'center' }}>
            {isPreview ? (
              <Typography
                variant="caption"
                sx={{ display: 'block', fontWeight: 800, color: 'text.primary' }}
              >
                This is a preview payslip and is not an official salary slip.
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              This is a computer-generated payslip and does not require a signature.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Confidential payroll document. Contact HR/payroll for any discrepancy.
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

const PayslipHeader = ({
  employeeName,
  period,
  status,
  slipNumber,
  generatedAt,
  isPreview,
}: {
  employeeName: string;
  period: string;
  status: string;
  slipNumber?: string | null;
  generatedAt?: string | Date | null;
  isPreview?: boolean;
}) => (
  <Box sx={{ borderBottom: `2px solid ${documentText}`, pb: 1.5 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
          Institution Payroll
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isPreview ? 'Preview salary statement' : 'Official salary statement'}
        </Typography>
      </Box>
      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.25,
            py: 0.5,
            border: `1px solid ${documentText}`,
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
            display: 'inline-block',
          }}
        >
          {status}
        </Typography>
      </Box>
    </Stack>

    <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 800, textAlign: 'center' }}>
      Salary Slip
    </Typography>

    <Grid container spacing={1.5} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DocumentKeyValue label="Employee" value={employeeName} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DocumentKeyValue label="Pay Period" value={period} alignRight />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DocumentKeyValue label="Slip Number" value={slipNumber || '-'} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DocumentKeyValue label="Generated On" value={formatDate(generatedAt)} alignRight />
      </Grid>
    </Grid>
  </Box>
);

const DocumentInfoSection = ({
  title,
  rows,
  columns = 2,
}: {
  title: string;
  rows: Array<[string, string]>;
  columns?: 2 | 4;
}) => (
  <Box sx={{ flex: 1, border: documentBorder }}>
    <Box sx={{ px: 1.25, py: 0.75, bgcolor: documentHeaderBg, borderBottom: documentBorder }}>
      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
        {title}
      </Typography>
    </Box>
    <Grid container>
      {rows.map(([label, value]) => (
        <Grid key={label} size={{ xs: 12, sm: columns === 4 ? 3 : 6 }}>
          <Box
            sx={{
              px: 1.25,
              py: 0.85,
              minHeight: 48,
              borderRight: { sm: documentBorder },
              borderBottom: documentBorder,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 600 }}>
              {value}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const DocumentKeyValue = ({
  label,
  value,
  alignRight = false,
}: {
  label: string;
  value: string;
  alignRight?: boolean;
}) => (
  <Box sx={{ textAlign: { xs: 'left', sm: alignRight ? 'right' : 'left' } }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Box>
);

const PayslipAmountTable = ({
  title,
  rows,
  total,
  emptyText,
}: {
  title: string;
  rows: any[];
  total: number;
  emptyText: string;
}) => {
  const computedTotal = rows?.length ? salaryLineTotal(rows) : Number(total || 0);

  return (
    <Box sx={{ flex: 1, border: documentBorder }}>
      <Box sx={{ px: 1.25, py: 0.75, bgcolor: documentHeaderBg, borderBottom: documentBorder }}>
        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </Box>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr">
            <AmountTableHeaderCell>Component</AmountTableHeaderCell>
            <AmountTableHeaderCell align="right">Amount</AmountTableHeaderCell>
          </Box>
        </Box>
        <Box component="tbody">
          {rows?.length ? (
            rows.map((row, index) => (
              <Box component="tr" key={`${row?.name || title}-${index}`}>
                <AmountTableCell>{row?.name || '-'}</AmountTableCell>
                <AmountTableCell align="right">{formatCurrency(row?.amount || 0)}</AmountTableCell>
              </Box>
            ))
          ) : (
            <Box component="tr">
              <AmountTableCell colSpan={2}>{emptyText}</AmountTableCell>
            </Box>
          )}
          <Box component="tr">
            <AmountTableCell strong bg>
              Total
            </AmountTableCell>
            <AmountTableCell align="right" strong bg>
              {formatCurrency(computedTotal)}
            </AmountTableCell>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AmountTableHeaderCell = ({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) => (
  <Box
    component="th"
    sx={{
      px: 1.25,
      py: 0.75,
      borderBottom: documentBorder,
      textAlign: align,
      typography: 'caption',
      color: 'text.secondary',
      fontWeight: 800,
    }}
  >
    {children}
  </Box>
);

const AmountTableCell = ({
  children,
  align = 'left',
  colSpan,
  strong = false,
  bg = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  colSpan?: number;
  strong?: boolean;
  bg?: boolean;
}) => (
  <Box
    component="td"
    colSpan={colSpan}
    sx={{
      px: 1.25,
      py: 0.8,
      borderBottom: documentBorder,
      bgcolor: bg ? documentHeaderBg : '#fff',
      textAlign: align,
      typography: 'body2',
      fontWeight: strong ? 800 : 500,
      color: strong ? 'text.primary' : 'text.secondary',
    }}
  >
    {children}
  </Box>
);

const NetPayDocumentBlock = ({ slip }: { slip: any }) => (
  <Box sx={{ border: `2px solid ${documentText}` }}>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      spacing={1}
      sx={{ p: 1.25, bgcolor: documentHeaderBg }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
          Net Payable
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Final amount payable after all deductions
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {formatCurrency(slip?.netSalary || 0)}
      </Typography>
    </Stack>
    <Box sx={{ px: 1.25, py: 1, borderTop: documentBorder }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        Amount in Words
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 600 }}>
        {slip?.netPayInWords || '-'}
      </Typography>
    </Box>
  </Box>
);
