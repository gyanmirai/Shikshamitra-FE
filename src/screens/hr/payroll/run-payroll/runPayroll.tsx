'use client';

import type { Dayjs } from 'dayjs';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { RouterLink } from 'src/routes/components';
import { shikshaMitraToast } from 'src/components/toast';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Drawer,
  Avatar,
  Tooltip,
  Divider,
  Collapse,
  Checkbox,
  Typography,
  IconButton,
} from '@mui/material';
import {
  useMarkPayrollReviewedMutation,
  useLazyGetRunPayrollPreviewQuery,
  useUnmarkPayrollReviewedMutation,
  useGenerateAndLockPayrollMutation,
} from 'src/redux/runPayroll/runPayrollApi';

import { SalaryDetailsTableCard } from '../salarySlip-generate/salarySlipGenerate';

type PayrollRow = {
  id: string;
  employeeName: string;
  employeeIdentifier: string;
  employeeGroup: string;
  totalWorkingDays: number;
  payableDays: number;
  presentDays: number;
  absentDays: number;
  fullGrossSalary: number;
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  previousMonthNetPay: number | null;
  netPayDelta: number | null;
  netPayDeltaPercent: number | null;
  status: 'PENDING' | 'REVIEWED' | 'LOCKED';
  reviewedAt?: string | null;
  issueCodes: string[];
  issueSeverity: 'CLEAN' | 'INFO' | 'WARNING' | 'CRITICAL';
  issueFilter: 'CLEAN' | 'HAS_ISSUES' | 'CRITICAL';
  earningComponents: any[];
  deductionComponents: any[];
  prorationFactor: number;
  dayCalculationMode: string;
};

const ISSUE_LABELS: Record<
  string,
  { label: string; severity: 'CRITICAL' | 'WARNING' | 'INFO'; color: 'warning' | 'error' | 'info' }
> = {
  MISSING_SALARY_STRUCTURE: {
    label: 'Salary structure missing',
    severity: 'CRITICAL',
    color: 'error',
  },
  NO_ATTENDANCE: { label: 'No attendance', severity: 'CRITICAL', color: 'error' },
  LOW_ATTENDANCE: { label: 'Low attendance', severity: 'WARNING', color: 'warning' },
  NEGATIVE_NET_PAY: { label: 'Negative net pay', severity: 'CRITICAL', color: 'error' },
  NO_PREVIOUS_MONTH_COMPARISON: { label: 'No previous month', severity: 'INFO', color: 'info' },
  LARGE_SALARY_VARIANCE: { label: 'Large variance', severity: 'WARNING', color: 'warning' },
  ATTENDANCE_POLICY_EVALUATION_MISSING: {
    label: 'Published attendance evaluation missing',
    severity: 'WARNING',
    color: 'warning',
  },
  ATTENDANCE_POLICY_EVALUATION_CONFIG_STALE: {
    label: 'Attendance evaluation uses older policy',
    severity: 'WARNING',
    color: 'warning',
  },
  ATTENDANCE_POLICY_EFFECTIVE_BOUNDARY: {
    label: 'Attendance policy boundary warning',
    severity: 'INFO',
    color: 'info',
  },
  ATTENDANCE_POLICY_EVALUATION_RESULT_MISSING: {
    label: 'Employee attendance evaluation result missing',
    severity: 'WARNING',
    color: 'warning',
  },
};

const statusColor = {
  PENDING: 'warning',
  REVIEWED: 'info',
  LOCKED: 'success',
} as const;

const PAYROLL_REGISTER_PAGE_SIZE = 100;

const formatDelta = (value: number | null, percent: number | null) => {
  if (value === null || value === undefined) return '-';
  const sign = value > 0 ? '+' : '';
  const pct = percent === null || percent === undefined ? '' : ` (${sign}${percent.toFixed(1)}%)`;
  return `${sign}${formatCurrency(value)}${pct}`;
};

const resolveIssueSeverity = (codes: string[]): PayrollRow['issueSeverity'] => {
  if (!codes.length) return 'CLEAN';
  if (codes.some((code) => (ISSUE_LABELS[code]?.severity ?? 'INFO') === 'CRITICAL'))
    return 'CRITICAL';
  if (codes.some((code) => (ISSUE_LABELS[code]?.severity ?? 'INFO') === 'WARNING'))
    return 'WARNING';
  return 'INFO';
};

const RunPayroll = () => {
  const router = useRouter();
  const [month, setMonth] = useState<Dayjs | null>(dayjs());
  const [loadedMonthKey, setLoadedMonthKey] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [activeRow, setActiveRow] = useState<PayrollRow | null>(null);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);

  const selectedMonthKey = month?.format('YYYY-MM') ?? '';
  const isDataForSelectedMonth = Boolean(selectedMonthKey) && loadedMonthKey === selectedMonthKey;

  const [fetchRunPayrollPreview, { isLoading: previewLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetRunPayrollPreviewQuery,
  });

  const [markReviewed, { isLoading: markLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMarkPayrollReviewedMutation,
  });

  const [unmarkReviewed, { isLoading: unmarkLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUnmarkPayrollReviewedMutation,
  });

  const [generateAndLockPayroll, { isLoading: lockLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGenerateAndLockPayrollMutation,
  });

  const sourceRows = useMemo(
    () => (isDataForSelectedMonth ? previewItems : []),
    [isDataForSelectedMonth, previewItems]
  );

  const tableData: PayrollRow[] = useMemo(
    () =>
      sourceRows.map((item: any) => {
        const totalWorkingDays = Number(item.totalWorkingDays || 0);
        const payableDays = Number(item.payableDays || 0);
        const reviewStatus = item.isLocked ? 'LOCKED' : item.reviewStatus || 'PENDING';

        const issueCodes = item.issueCodes || [];
        const issueSeverity = resolveIssueSeverity(issueCodes);
        return {
          id: item.employeeId,
          employeeName: item.employeeName,
          employeeIdentifier: item.employeeIdentifier,
          employeeGroup: item.isTeaching ? 'Teaching' : 'Non-Teaching',
          totalWorkingDays,
          payableDays,
          presentDays: Number(item.presentDays || 0),
          absentDays: Math.max(0, totalWorkingDays - payableDays),
          fullGrossSalary: Number(item.fullGrossSalary || 0),
          grossSalary: Number(item.grossSalary || 0),
          totalDeduction: Number(item.totalDeduction || 0),
          netSalary: Number(item.netPay || 0),
          previousMonthNetPay:
            item.previousMonthNetPay === null || item.previousMonthNetPay === undefined
              ? null
              : Number(item.previousMonthNetPay),
          netPayDelta:
            item.netPayDelta === null || item.netPayDelta === undefined
              ? null
              : Number(item.netPayDelta),
          netPayDeltaPercent:
            item.netPayDeltaPercent === null || item.netPayDeltaPercent === undefined
              ? null
              : Number(item.netPayDeltaPercent),
          status: reviewStatus,
          reviewedAt: item.reviewedAt,
          issueCodes,
          issueSeverity,
          issueFilter:
            issueCodes.length === 0
              ? 'CLEAN'
              : issueSeverity === 'CRITICAL'
                ? 'CRITICAL'
                : 'HAS_ISSUES',
          earningComponents: item.earningComponents || [],
          deductionComponents: item.deductionComponents || [],
          prorationFactor: Number(item.prorationFactor || 0),
          dayCalculationMode: item.dayCalculationMode || '-',
        };
      }),
    [sourceRows]
  );

  const pendingRows = useMemo(
    () => tableData.filter((row) => row.status !== 'LOCKED'),
    [tableData]
  );
  const reviewedRows = useMemo(
    () => tableData.filter((row) => row.status === 'REVIEWED'),
    [tableData]
  );
  const selectedRows = useMemo(
    () => tableData.filter((row) => selectedEmployeeIds.includes(row.id)),
    [selectedEmployeeIds, tableData]
  );
  const selectedPendingIds = useMemo(
    () => selectedRows.filter((row) => row.status === 'PENDING').map((row) => row.id),
    [selectedRows]
  );
  const selectedReviewedIds = useMemo(
    () => selectedRows.filter((row) => row.status === 'REVIEWED').map((row) => row.id),
    [selectedRows]
  );
  const lockableIds = useMemo(() => selectedReviewedIds, [selectedReviewedIds]);
  useEffect(() => {
    setSelectedEmployeeIds((prev) => prev.filter((id) => pendingRows.some((row) => row.id === id)));
  }, [pendingRows]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        if (window.scrollY > 120) {
          setInsightsOpen(false);
        } else if (window.scrollY < 20) {
          /* empty */
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const loadPreview = useCallback(
    async (forceRefresh = false) => {
      if (!selectedMonthKey) return;
      try {
        const loadPage = async (
          page: number,
          totalPages: number,
          accumulatedItems: any[]
        ): Promise<any[]> => {
          if (page >= totalPages) {
            return accumulatedItems;
          }

          const response = await fetchRunPayrollPreview(
            { month: selectedMonthKey, page, pageSize: PAYROLL_REGISTER_PAGE_SIZE, forceRefresh },
            false
          ).unwrap();

          return loadPage(page + 1, Math.max(1, Number(response?.totalPages || 1)), [
            ...accumulatedItems,
            ...(response?.items || []),
          ]);
        };

        const allItems = await loadPage(0, 1, []);

        setPreviewItems(allItems);
        setLoadedMonthKey(selectedMonthKey);
        // Auto-collapse insights once data is loaded to focus on the table after 3 seconds
        if (allItems.length > 0) {
          setTimeout(() => {
            setInsightsOpen(false);
          }, 3000);
        }
      } catch (error: any) {
        setPreviewItems([]);
        setLoadedMonthKey(null);
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to load payroll preview.',
        });
      }
    },
    [fetchRunPayrollPreview, selectedMonthKey]
  );

  useEffect(() => {
    if (!selectedMonthKey) return;
    loadPreview(false);
  }, [selectedMonthKey, loadPreview]);

  const runReviewMutation = useCallback(
    async (mutation: any, employeeIds: string[], fallbackMessage: string) => {
      if (!selectedMonthKey || employeeIds.length === 0) return;
      try {
        const res = await mutation({ month: selectedMonthKey, employeeIds }).unwrap();
        shikshaMitraToast.success({ message: res?.message || fallbackMessage });
        await loadPreview();
      } catch (error: any) {
        shikshaMitraToast.error({ message: error?.data?.message || fallbackMessage });
      }
    },
    [loadPreview, selectedMonthKey]
  );
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'checkBox',
        label: '',
        minWidth: 56,
        align: 'center',
        sticky: true,
        isFilter: false,
        isSort: false,
        renderColumn() {
          const isAllSelected =
            pendingRows.length > 0 &&
            pendingRows.every((row) => selectedEmployeeIds.includes(row.id));
          return (
            <Checkbox
              checked={isAllSelected}
              indeterminate={
                selectedEmployeeIds.length > 0 &&
                pendingRows.some((row) => selectedEmployeeIds.includes(row.id)) &&
                !isAllSelected
              }
              onChange={(event) =>
                setSelectedEmployeeIds(event.target.checked ? pendingRows.map((row) => row.id) : [])
              }
            />
          );
        },
        render(_value, row) {
          const disabled = row.status === 'LOCKED';
          return (
            <Checkbox
              disabled={disabled}
              checked={selectedEmployeeIds.includes(row.id)}
              onChange={(event) =>
                setSelectedEmployeeIds((prev) =>
                  event.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
                )
              }
            />
          );
        },
      },
      {
        id: 'employeeName',
        label: 'Employee',
        minWidth: 220,
        align: 'left',
        sticky: true,
        render(value, row) {
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 32, height: 32 }}>{String(value || '?').slice(0, 1)}</Avatar>
              <Box>
                <Typography
                  component={RouterLink}
                  href={`${hrPaths.employee.list}?employee=${row.id}&tab=leaveBalance`}
                  variant="subtitle2"
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.employeeIdentifier} • {row.employeeGroup}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        id: 'payableDays',
        label: 'Payable days',
        minWidth: 160,
        filterType: 'number',
        render(_value, row) {
          const absentDays = Number(row.absentDays || 0);

          return (
            <Stack spacing={0.25}>
              <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                {row.payableDays} / {row.totalWorkingDays}
              </Typography>
              <Typography
                variant="caption"
                color={absentDays > 0 ? 'error.main' : 'success.main'}
                sx={{ lineHeight: 1.2 }}
              >
                {absentDays > 0 ? `${absentDays} absent` : 'Full payable'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'fullGrossSalary',
        label: 'Total salary',
        minWidth: 140,
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'grossSalary',
        label: 'Payable gross',
        minWidth: 130,
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'totalDeduction',
        label: 'Deductions',
        minWidth: 140,
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'netSalary',
        label: 'Net pay',
        minWidth: 130,
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'previousMonthNetPay',
        label: 'Last month',
        minWidth: 130,
        filterType: 'number',
        render: (v) => (typeof v === 'number' ? formatCurrency(v) : '-'),
      },
      {
        id: 'netPayDelta',
        label: 'Variance',
        minWidth: 150,
        render(_value, row) {
          const isHighVariance = row.issueCodes?.includes('LARGE_SALARY_VARIANCE');
          return (
            <Typography variant="body2" color={isHighVariance ? 'warning.main' : 'text.primary'}>
              {formatDelta(row.netPayDelta, row.netPayDeltaPercent)}
            </Typography>
          );
        },
      },
      {
        id: 'issueFilter',
        label: 'Issues',
        minWidth: 170,
        filterType: 'enum',
        enumOptions: [
          { label: 'Has Issues', value: 'HAS_ISSUES' },
          { label: 'Critical', value: 'CRITICAL' },
          { label: 'Clean', value: 'CLEAN' },
        ],
        render(_value, row) {
          const issues = row.issueCodes || [];
          if (!issues.length) {
            return <Chip size="small" label="Clean" color="success" variant="outlined" />;
          }

          const state = row.issueSeverity;
          const chipColor =
            state === 'CRITICAL' ? 'error' : state === 'WARNING' ? 'warning' : 'info';
          const title = issues
            .slice(0, 5)
            .map((code: string | number) => ISSUE_LABELS[code]?.label || code)
            .join(', ');

          return (
            <Tooltip title={title} arrow>
              <Chip
                size="small"
                color={chipColor}
                variant="outlined"
                label={`${
                  state === 'CRITICAL' ? 'Critical' : state === 'WARNING' ? 'Warning' : 'Info'
                } • ${issues.length}`}
              />
            </Tooltip>
          );
        },
      },
      {
        id: 'status',
        label: 'Review',
        minWidth: 130,
        filterType: 'enum',
        enumOptions: [
          { label: 'Pending', value: 'PENDING' },
          { label: 'Reviewed', value: 'REVIEWED' },
          { label: 'Locked', value: 'LOCKED' },
        ],
        render(value) {
          return (
            <Label variant="soft" color={statusColor[value as keyof typeof statusColor] as any}>
              {String(value).toLowerCase()}
            </Label>
          );
        },
      },
      {
        id: 'actions',
        label: '',
        minWidth: 72,
        isFilter: false,
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        render(_value, row) {
          return (
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => setActiveRow(row as PayrollRow)}>
                <Iconify icon="solar:eye-linear" width={18} />
              </IconButton>
            </Stack>
          );
        },
      },
    ],
    [pendingRows, selectedEmployeeIds]
  );

  const stats = {
    total: tableData.length,
    pending: tableData.filter((row) => row.status === 'PENDING').length,
    reviewed: reviewedRows.length,
    locked: tableData.filter((row) => row.status === 'LOCKED').length,
    net: tableData.reduce((sum, row) => sum + row.netSalary, 0),
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Run Payroll"
        links={[{ name: 'HR/Staff' }, { name: 'Payroll Management' }, { name: 'Run Payroll' }]}
        description="Generate, review, and lock monthly payroll from one workbench."
      />

      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        spacing={1}
        sx={{
          mb: 1,
          p: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <DatePicker
          label="Payroll month"
          views={['month', 'year']}
          format="MMMM YYYY"
          value={month}
          onChange={(newValue) => setMonth(newValue)}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
          sx={{ width: { xs: '100%', sm: 220, md: 260 }, minWidth: { sm: 220 } }}
        />
        <LoadingButton
          variant="contained"
          loading={previewLoading}
          size="small"
          disabled={!month}
          startIcon={<Iconify icon="solar:rocket-bold" />}
          onClick={() => loadPreview(true)}
        >
          Run / Refresh Payroll
        </LoadingButton>
      </Stack>

      <Card variant="outlined" sx={{ mb: 1, p: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          onClick={() => setInsightsOpen((prev) => !prev)}
          sx={{
            p: 1,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">Payroll insights</Typography>
            <Chip size="small" label="Summary + AI" variant="outlined" />
          </Stack>
          <IconButton size="small">
            <Iconify
              icon={insightsOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
              width={18}
            />
          </IconButton>
        </Stack>
        <Collapse in={insightsOpen} timeout={800} unmountOnExit>
          <Box sx={{ p: 1, pt: 0 }}>
            <Grid container spacing={1.25} sx={{ mt: 0.25 }}>
              {[
                ['Employees', stats.total],
                ['Pending review', stats.pending],
                ['Reviewed', stats.reviewed],
                ['Locked', stats.locked],
                ['Net preview', formatCurrency(stats.net)],
              ].map(([label, value]) => (
                <Grid key={label} size={{ xs: 6, md: 2.4 }}>
                  <Card variant="outlined" sx={{ p: 1.25, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6">{value}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.25}
              alignItems={{ md: 'center' }}
              sx={{ mt: 0.5 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                }}
              >
                <Iconify icon="solar:magic-stick-3-bold-duotone" width={24} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Today we flag deterministic issues and month-on-month variance. Later, AI agents can
                explain unusual salary changes and suggest what to inspect before lock.
              </Typography>
            </Stack>
            <Box sx={{ mt: 1 }}>
              <Chip size="small" label="AI anomaly review placeholder" variant="outlined" />
            </Box>
          </Box>
        </Collapse>
      </Card>

      <Card
        sx={{
          p: 1.25,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.25 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Payroll Register
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {month?.format('MMMM YYYY')} • {selectedEmployeeIds.length} selected
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <LoadingButton
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:calendar-mark-linear" />}
              onClick={() => router.push('/hr/manual-attendance')}
            >
              Move to Attendance
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="outlined"
              color="info"
              loading={markLoading}
              disabled={!selectedPendingIds.length}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              onClick={() =>
                runReviewMutation(
                  markReviewed,
                  selectedPendingIds,
                  'Marked selected rows reviewed.'
                )
              }
            >
              Mark Reviewed
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="outlined"
              color="warning"
              loading={unmarkLoading}
              disabled={!selectedReviewedIds.length}
              onClick={() =>
                runReviewMutation(unmarkReviewed, selectedReviewedIds, 'Removed selected reviews.')
              }
            >
              Unmark
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="contained"
              color="success"
              disabled={!lockableIds.length}
              startIcon={<Iconify icon="solar:lock-bold" />}
              onClick={() => setLockConfirmOpen(true)}
            >
              Lock Reviewed
            </LoadingButton>
          </Stack>
        </Stack>

        <CustomizableTable
          noDataText={
            !isDataForSelectedMonth && selectedMonthKey ? (
              <>
                This month is not loaded yet. Use <strong>Run / Refresh Payroll</strong> above.
              </>
            ) : (
              <>No payroll rows for this month after the last run.</>
            )
          }
          tableId="payroll-monthly-workbench-table"
          isLoading={previewLoading}
          columns={columns}
          data={tableData}
          wrapperProps={{
            sx: {
              height: { xs: '56vh', md: '64vh' },
              minHeight: 360,
              maxHeight: '72vh',
              overflow: 'hidden',
            },
          }}
          tableContainerProps={{
            sx: {
              '& .MuiTableHead-root .MuiTableCell-root': {
                py: 1,
                px: 1.5,
              },
              '& .MuiTableBody-root .MuiTableCell-root': {
                py: 0.75,
                px: 1.5,
              },
              '& .MuiTableBody-root .MuiAvatar-root': {
                width: 24,
                height: 24,
                fontSize: 14,
              },
              '& .MuiTableBody-root .MuiTypography-subtitle2': {
                fontSize: '0.85rem',
                lineHeight: 1.2,
              },
              '& .MuiTableBody-root .MuiTypography-caption': {
                display: 'none',
              },
            },
          }}
        />
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(activeRow)}
        onClose={() => setActiveRow(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: 2 } }}
      >
        {activeRow ? (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">{activeRow.employeeName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeRow.employeeIdentifier} • {activeRow.employeeGroup}
                </Typography>
              </Box>
              <IconButton onClick={() => setActiveRow(null)}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </Stack>
            <Divider />
            <Grid container spacing={1}>
              <Grid size={3}>
                <Typography variant="caption" color="text.secondary">
                  Payable days
                </Typography>
                <Typography variant="subtitle2">
                  {activeRow.payableDays} / {activeRow.totalWorkingDays}
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant="caption" color="text.secondary">
                  Proration
                </Typography>
                <Typography variant="subtitle2">{activeRow.prorationFactor.toFixed(4)}</Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant="caption" color="text.secondary">
                  Total salary
                </Typography>
                <Typography variant="subtitle2">
                  {formatCurrency(activeRow.fullGrossSalary)}
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant="caption" color="text.secondary">
                  Day rule
                </Typography>
                <Typography variant="subtitle2">{activeRow.dayCalculationMode}</Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant="caption" color="text.secondary">
                  Review status
                </Typography>
                <Typography variant="subtitle2">{activeRow.status}</Typography>
              </Grid>
            </Grid>
            <Card variant="outlined" sx={{ p: 1.25, overflow: 'visible' }}>
              <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                View all issues
              </Typography>
              {activeRow.issueCodes.length === 0 ? (
                <Chip size="small" label="Clean payroll row" color="success" variant="outlined" />
              ) : (
                <Stack spacing={0.75}>
                  {(['CRITICAL', 'WARNING', 'INFO'] as const).map((severity) => {
                    const codes = activeRow.issueCodes.filter(
                      (code) => (ISSUE_LABELS[code]?.severity ?? 'INFO') === severity
                    );
                    if (!codes.length) return null;
                    const color =
                      severity === 'CRITICAL'
                        ? 'error'
                        : severity === 'WARNING'
                          ? 'warning'
                          : 'info';
                    return (
                      <Stack
                        key={severity}
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip size="small" color={color} label={severity} />
                        {codes.map((code) => (
                          <Chip
                            key={code}
                            size="small"
                            variant="outlined"
                            color={color}
                            label={ISSUE_LABELS[code]?.label || code}
                          />
                        ))}
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </Card>
            <SalaryDetailsTableCard
              title="Earnings"
              subheader="Payroll preview earnings"
              icon="solar:hand-money-linear"
              iconColor={{ bg: 'success.lighter', color: 'success.main' }}
              data={activeRow.earningComponents}
              tableId="payroll-workbench-earnings"
              nameColumnLabel="Earning"
              noDataText="No earnings found"
            />
            <SalaryDetailsTableCard
              title="Deductions"
              subheader="Payroll preview deductions"
              icon="solar:minus-circle-linear"
              iconColor={{ bg: 'error.lighter', color: 'error.main' }}
              data={activeRow.deductionComponents}
              tableId="payroll-workbench-deductions"
              nameColumnLabel="Deduction"
              noDataText="No deductions found"
            />
          </Stack>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={lockConfirmOpen}
        onClose={() => setLockConfirmOpen(false)}
        title="Lock reviewed payroll rows"
        icon="warning"
        content={
          <Typography variant="body2">
            This will finalize salary slips for <strong>{lockableIds.length}</strong> reviewed
            row(s) in <strong>{month?.format('MMMM YYYY')}</strong>. Unreviewed rows will remain
            pending.
          </Typography>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={lockLoading}
            onClick={async () => {
              if (!selectedMonthKey || !lockableIds.length) return;
              try {
                const res = await generateAndLockPayroll({
                  month: selectedMonthKey,
                  employeeIds: lockableIds,
                }).unwrap();
                shikshaMitraToast.success({
                  message: res?.message || 'Payroll locked successfully.',
                });
                setLockConfirmOpen(false);
                setSelectedEmployeeIds([]);
                await loadPreview();
              } catch (error: any) {
                shikshaMitraToast.error({
                  message:
                    error?.data?.message ||
                    'Only reviewed payroll rows can be locked. Please review rows first.',
                });
              }
            }}
          >
            Yes, lock reviewed
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default RunPayroll;
