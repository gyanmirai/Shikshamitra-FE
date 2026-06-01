'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { shikshaMitraToast } from 'src/components/toast';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetHrAuditEventsQuery } from 'src/redux/hr/hr-policy-api';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  toHrAuditLabel,
  formatHrAuditValue,
  parseHrAuditContext,
  formatHrAuditDateTime,
} from 'src/utils/hr-audit-format';
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Stack,
  Drawer,
  Avatar,
  Tooltip,
  Divider,
  Collapse,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import {
  useMarkPayrollReviewedMutation,
  useGetRunPayrollReadinessQuery,
  useLazyGetRunPayrollPreviewQuery,
  useUnmarkPayrollReviewedMutation,
  useGenerateAndLockPayrollMutation,
  useCreatePayrollAdjustmentMutation,
  useUpdatePayrollAdjustmentMutation,
  useDeletePayrollAdjustmentMutation,
} from 'src/redux/runPayroll/runPayrollApi';

import { SalaryDetailsTableCard } from '../salarySlip-generate/salarySlipGenerate';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
  payrollAdjustments: any[];
  prorationFactor: number;
  dayCalculationMode: string;
};

type PayrollReadiness = {
  month: string;
  canPreview: boolean;
  canLock: boolean;
  employeeCount: number;
  snapshotCount: number;
  reviewedCount: number;
  lockedCount: number;
  attendanceFoundCount: number;
  missingAttendanceCount: number;
  missingSalaryStructureCount: number;
  policyConfigurationIssueCount: number;
  blockingIssues: string[];
  recommendedActions: string[];
};

type PayrollPreviewError = {
  message: string;
  errorCode?: string;
  month?: string;
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
  ATTENDANCE_POLICY_EFFECTIVE_BOUNDARY: {
    label: 'Attendance policy boundary warning',
    severity: 'INFO',
    color: 'info',
  },
  PAYROLL_POLICY_CONFIGURATION: {
    label: 'Payroll policy needs setup',
    severity: 'CRITICAL',
    color: 'error',
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

const getPayrollPreviewError = (error: any, fallbackMonth: string): PayrollPreviewError => ({
  message: error?.data?.detail || error?.data?.message || 'Payroll preview could not be prepared.',
  errorCode: error?.data?.errorCode,
  month: error?.data?.data?.month || fallbackMonth,
});

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
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const canLockPayroll = hasGrantedPermission(permissions, hrPermissions.payroll.runPayrollLock);
  const canAdjustPayroll = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.runPayrollAdjustments
  );
  const canViewPayrollAudit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.runPayrollViewAudit
  );
  const [month, setMonth] = useState<Dayjs | null>(dayjs());
  const [loadedMonthKey, setLoadedMonthKey] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [previewReadiness, setPreviewReadiness] = useState<PayrollReadiness | null>(null);
  const [previewError, setPreviewError] = useState<PayrollPreviewError | null>(null);
  const [previewIsGenerated, setPreviewIsGenerated] = useState(false);
  const [previewMode, setPreviewMode] = useState<'load' | 'refresh' | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [activeRow, setActiveRow] = useState<PayrollRow | null>(null);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [auditOpen, setAuditOpen] = useState(false);
  const [adjustmentDraft, setAdjustmentDraft] = useState({
    name: '',
    amount: '',
    isEarning: 'true',
    reason: '',
  });
  const [editingAdjustmentId, setEditingAdjustmentId] = useState<string | null>(null);

  const selectedMonthKey = month?.format('YYYY-MM') ?? '';
  const academicYearId = currentYear?.id || '';
  const academicYearStart = currentYear?.startDate ? dayjs(currentYear.startDate) : null;
  const academicYearEnd = currentYear?.endDate ? dayjs(currentYear.endDate) : null;
  const selectedPayrollKey =
    selectedMonthKey && academicYearId ? `${academicYearId}:${selectedMonthKey}` : '';
  const isDataForSelectedMonth =
    Boolean(selectedPayrollKey) && loadedMonthKey === selectedPayrollKey;
  const latestPreviewRequestRef = useRef(0);
  const lastAutoLoadedMonthRef = useRef<string | null>(null);
  const {
    data: readinessData,
    isLoading: readinessLoading,
    isFetching: readinessFetching,
    refetch: refetchReadiness,
  } = useGetRunPayrollReadinessQuery(
    { month: selectedMonthKey, academicYearId },
    { skip: !selectedMonthKey || !academicYearId }
  );

  const [fetchRunPayrollPreview, { isLoading: previewLoading, isFetching: previewFetching }] =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useLazyGetRunPayrollPreviewQuery,
    });
  const previewBusy = previewLoading || previewFetching || previewMode !== null;

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

  const [createAdjustment, { isLoading: createAdjustmentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreatePayrollAdjustmentMutation,
  });

  const [updateAdjustment, { isLoading: updateAdjustmentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePayrollAdjustmentMutation,
  });

  const [deleteAdjustment, { isLoading: deleteAdjustmentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePayrollAdjustmentMutation,
  });

  const { data: payrollAuditEvents, isLoading: payrollAuditLoading } = useGetHrAuditEventsQuery(
    {
      entityType: 'payroll_run',
      action: 'locked',
      search: selectedMonthKey,
      maxResultCount: 20,
    },
    { skip: !auditOpen || !selectedMonthKey || !canViewPayrollAudit }
  );

  const isMonthInAcademicYear = useCallback(
    (value: Dayjs | null) => {
      if (!value || !academicYearStart?.isValid() || !academicYearEnd?.isValid()) return true;
      const monthStart = value.startOf('month');
      const monthEnd = value.endOf('month');
      return (
        monthStart.isSameOrBefore(academicYearEnd.endOf('day')) &&
        monthEnd.isSameOrAfter(academicYearStart.startOf('day'))
      );
    },
    [academicYearEnd, academicYearStart]
  );

  useEffect(() => {
    if (!academicYearId || !academicYearStart?.isValid() || !academicYearEnd?.isValid()) return;
    if (isMonthInAcademicYear(month)) return;

    const today = dayjs();
    setMonth(isMonthInAcademicYear(today) ? today : academicYearStart.startOf('month'));
  }, [academicYearEnd, academicYearId, academicYearStart, isMonthInAcademicYear, month]);

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
          payrollAdjustments: item.payrollAdjustments || [],
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
  const lockableIds = useMemo(
    () =>
      selectedRows
        .filter((row) => row.status === 'REVIEWED' && row.issueSeverity !== 'CRITICAL')
        .map((row) => row.id),
    [selectedRows]
  );
  const activeRowCanAdjust = Boolean(
    activeRow && activeRow.status === 'REVIEWED' && canAdjustPayroll
  );
  useEffect(() => {
    setSelectedEmployeeIds((prev) => prev.filter((id) => pendingRows.some((row) => row.id === id)));
  }, [pendingRows]);

  useEffect(() => {
    if (!activeRow) return;
    const refreshedRow = tableData.find((row) => row.id === activeRow.id);
    if (refreshedRow) {
      setActiveRow(refreshedRow);
    }
  }, [activeRow, tableData]);

  useEffect(() => {
    setAdjustmentDraft({ name: '', amount: '', isEarning: 'true', reason: '' });
    setEditingAdjustmentId(null);
  }, [activeRow?.id]);

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
      if (!selectedMonthKey || !academicYearId) return;
      const requestId = latestPreviewRequestRef.current + 1;
      latestPreviewRequestRef.current = requestId;
      const requestedMonthKey = selectedMonthKey;
      const requestedPayrollKey = selectedPayrollKey;
      setPreviewMode(forceRefresh ? 'refresh' : 'load');
      try {
        let readiness: PayrollReadiness | null = null;
        let isGenerated = false;
        const loadPage = async (
          page: number,
          totalPages: number,
          accumulatedItems: any[]
        ): Promise<any[]> => {
          if (page >= totalPages) {
            return accumulatedItems;
          }

          const response = await fetchRunPayrollPreview(
            {
              month: requestedMonthKey,
              academicYearId,
              page,
              pageSize: PAYROLL_REGISTER_PAGE_SIZE,
              forceRefresh: forceRefresh && page === 0,
            },
            false
          ).unwrap();
          readiness = readiness || response?.readiness || null;
          isGenerated = Boolean(response?.isGenerated);

          return loadPage(page + 1, Math.max(1, Number(response?.totalPages || 1)), [
            ...accumulatedItems,
            ...(response?.items || []),
          ]);
        };

        const allItems = await loadPage(0, 1, []);
        if (
          latestPreviewRequestRef.current !== requestId ||
          requestedPayrollKey !== selectedPayrollKey
        ) {
          return;
        }

        setPreviewItems(allItems);
        setPreviewReadiness(readiness);
        setPreviewError(null);
        setPreviewIsGenerated(isGenerated);
        setLoadedMonthKey(requestedPayrollKey);
        // Auto-collapse insights once data is loaded to focus on the table after 3 seconds
        if (allItems.length > 0) {
          setTimeout(() => {
            setInsightsOpen(false);
          }, 3000);
        }
        refetchReadiness();
      } catch (error: any) {
        if (
          latestPreviewRequestRef.current !== requestId ||
          requestedPayrollKey !== selectedPayrollKey
        ) {
          return;
        }
        setPreviewItems([]);
        setPreviewReadiness(null);
        setPreviewError(getPayrollPreviewError(error, requestedMonthKey));
        setPreviewIsGenerated(false);
        setLoadedMonthKey(null);
      } finally {
        if (latestPreviewRequestRef.current === requestId) {
          setPreviewMode(null);
        }
      }
    },
    [academicYearId, fetchRunPayrollPreview, refetchReadiness, selectedMonthKey, selectedPayrollKey]
  );

  useEffect(() => {
    latestPreviewRequestRef.current += 1;
    if (!selectedPayrollKey) {
      lastAutoLoadedMonthRef.current = null;
    }
    setLoadedMonthKey(null);
    setPreviewItems([]);
    setPreviewReadiness(null);
    setPreviewError(null);
    setPreviewIsGenerated(false);
    setPreviewMode(null);
    setSelectedEmployeeIds([]);
    setActiveRow(null);
    setAdjustmentDraft({ name: '', amount: '', isEarning: 'true', reason: '' });
    setEditingAdjustmentId(null);
  }, [selectedPayrollKey]);

  useEffect(() => {
    if (!selectedPayrollKey) return;
    if (lastAutoLoadedMonthRef.current === selectedPayrollKey) return;
    lastAutoLoadedMonthRef.current = selectedPayrollKey;
    loadPreview(false);
  }, [loadPreview, selectedPayrollKey]);

  useEffect(() => {
    if (!readinessData || isDataForSelectedMonth) return;
    setPreviewReadiness(readinessData);
  }, [isDataForSelectedMonth, readinessData]);

  const runReviewMutation = useCallback(
    async (mutation: any, employeeIds: string[], fallbackMessage: string) => {
      if (!selectedMonthKey || !academicYearId || employeeIds.length === 0) return;
      try {
        const res = await mutation({
          month: selectedMonthKey,
          academicYearId,
          employeeIds,
        }).unwrap();
        shikshaMitraToast.success({ message: res?.message || fallbackMessage });
        await loadPreview();
      } catch (error: any) {
        shikshaMitraToast.error({ message: error?.data?.message || fallbackMessage });
      }
    },
    [academicYearId, loadPreview, selectedMonthKey]
  );

  const addPayrollAdjustment = useCallback(async () => {
    if (!activeRow || !selectedMonthKey || !academicYearId) return;
    if (!canAdjustPayroll || activeRow.status !== 'REVIEWED') {
      shikshaMitraToast.error({
        message: 'Payroll adjustments are available only for reviewed, unlocked rows.',
      });
      return;
    }
    const amount = Number(adjustmentDraft.amount);
    if (
      !adjustmentDraft.name.trim() ||
      !adjustmentDraft.reason.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      shikshaMitraToast.error({ message: 'Enter adjustment name, amount, and reason.' });
      return;
    }

    try {
      const payload = {
        month: selectedMonthKey,
        academicYearId,
        employeeId: activeRow.id,
        name: adjustmentDraft.name.trim(),
        amount,
        isEarning: adjustmentDraft.isEarning === 'true',
        reason: adjustmentDraft.reason.trim(),
      };
      if (editingAdjustmentId) {
        await updateAdjustment({ id: editingAdjustmentId, ...payload }).unwrap();
      } else {
        await createAdjustment(payload).unwrap();
      }
      shikshaMitraToast.success({
        message: editingAdjustmentId ? 'Payroll adjustment updated.' : 'Payroll adjustment added.',
      });
      setAdjustmentDraft({ name: '', amount: '', isEarning: 'true', reason: '' });
      setEditingAdjustmentId(null);
      await loadPreview(true);
    } catch (error: any) {
      shikshaMitraToast.error({
        message:
          error?.data?.message ||
          (editingAdjustmentId ? 'Failed to update adjustment.' : 'Failed to add adjustment.'),
      });
    }
  }, [
    activeRow,
    adjustmentDraft,
    academicYearId,
    canAdjustPayroll,
    createAdjustment,
    editingAdjustmentId,
    loadPreview,
    selectedMonthKey,
    updateAdjustment,
  ]);

  const removePayrollAdjustment = useCallback(
    async (id: string) => {
      if (!activeRowCanAdjust) {
        shikshaMitraToast.error({
          message: 'Payroll adjustments are available only for reviewed, unlocked rows.',
        });
        return;
      }
      try {
        await deleteAdjustment(id).unwrap();
        shikshaMitraToast.success({ message: 'Payroll adjustment removed.' });
        if (editingAdjustmentId === id) {
          setAdjustmentDraft({ name: '', amount: '', isEarning: 'true', reason: '' });
          setEditingAdjustmentId(null);
        }
        await loadPreview(true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to remove adjustment.',
        });
      }
    },
    [activeRowCanAdjust, deleteAdjustment, editingAdjustmentId, loadPreview]
  );

  const startEditingAdjustment = useCallback((adjustment: any) => {
    setEditingAdjustmentId(adjustment.id);
    setAdjustmentDraft({
      name: adjustment.name || '',
      amount: String(adjustment.amount ?? ''),
      isEarning: adjustment.isEarning ? 'true' : 'false',
      reason: adjustment.reason || '',
    });
  }, []);

  const cancelEditingAdjustment = useCallback(() => {
    setEditingAdjustmentId(null);
    setAdjustmentDraft({ name: '', amount: '', isEarning: 'true', reason: '' });
  }, []);
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
        align: 'center',
        filterType: 'number',
        render(_value, row) {
          const absentDays = Number(row.absentDays || 0);

          return (
            <Stack spacing={0.25} alignItems="center">
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
        align: 'center',
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'grossSalary',
        label: 'Payable gross',
        minWidth: 130,
        align: 'center',
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'totalDeduction',
        label: 'Deductions',
        minWidth: 140,
        align: 'center',
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'netSalary',
        label: 'Net pay',
        minWidth: 130,
        align: 'center',
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'previousMonthNetPay',
        label: 'Last month',
        minWidth: 130,
        align: 'center',
        filterType: 'number',
        render: (v) => (typeof v === 'number' ? formatCurrency(v) : '-'),
      },
      {
        id: 'netPayDelta',
        label: 'Variance',
        minWidth: 150,
        align: 'center',
        render(_value, row) {
          const isHighVariance = row.issueCodes?.includes('LARGE_SALARY_VARIANCE');
          return (
            <Typography
              variant="body2"
              textAlign="center"
              color={isHighVariance ? 'warning.main' : 'text.primary'}
            >
              {formatDelta(row.netPayDelta, row.netPayDeltaPercent)}
            </Typography>
          );
        },
      },
      {
        id: 'issueFilter',
        label: 'Issues',
        minWidth: 170,
        align: 'center',
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
        align: 'center',
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
        align: 'center',
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

  const readinessBusy = readinessLoading || readinessFetching;
  const hasPreviewForSelectedMonth = isDataForSelectedMonth && tableData.length > 0;
  const stats = {
    total: hasPreviewForSelectedMonth
      ? tableData.length
      : Number(previewReadiness?.employeeCount || 0),
    pending: hasPreviewForSelectedMonth
      ? tableData.filter((row) => row.status === 'PENDING').length
      : Math.max(
          0,
          Number(previewReadiness?.snapshotCount || 0) - Number(previewReadiness?.lockedCount || 0)
        ),
    reviewed: hasPreviewForSelectedMonth
      ? reviewedRows.length
      : Number(previewReadiness?.reviewedCount || 0),
    locked: hasPreviewForSelectedMonth
      ? tableData.filter((row) => row.status === 'LOCKED').length
      : Number(previewReadiness?.lockedCount || 0),
    net: hasPreviewForSelectedMonth ? tableData.reduce((sum, row) => sum + row.netSalary, 0) : 0,
  };
  const monthStatus = previewError
    ? { label: 'Cannot load', color: 'error' as const }
    : previewIsGenerated || (stats.total > 0 && stats.locked === stats.total)
      ? { label: 'Already locked', color: 'success' as const }
      : previewReadiness?.policyConfigurationIssueCount
        ? { label: 'Needs payroll setup', color: 'error' as const }
        : previewReadiness?.missingAttendanceCount
          ? { label: 'Needs attendance', color: 'warning' as const }
          : previewReadiness
            ? { label: 'Ready to review', color: 'success' as const }
            : { label: 'Select month', color: 'default' as const };
  const readinessActions = new Set(previewReadiness?.recommendedActions || []);
  const showReadinessPanel = Boolean(previewReadiness || previewError || readinessBusy);
  const previewButtonIcon = isDataForSelectedMonth ? 'solar:refresh-linear' : 'solar:rocket-bold';
  const previewButtonLabel = previewBusy
    ? 'Generating preview...'
    : isDataForSelectedMonth
      ? 'Refresh preview'
      : 'Generate preview';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
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
          minDate={academicYearStart ?? undefined}
          maxDate={academicYearEnd ?? undefined}
          shouldDisableMonth={(value) => !isMonthInAcademicYear(value)}
          disabled={!academicYearId}
          slotProps={{
            textField: {
              size: 'small',
              helperText: currentYear?.name ? `Academic year: ${currentYear.name}` : undefined,
            },
          }}
          sx={{ width: { xs: '100%', sm: 220, md: 260 }, minWidth: { sm: 220 } }}
        />
        <Chip
          size="small"
          variant="outlined"
          icon={<Iconify icon="solar:calendar-date-linear" />}
          label={currentYear?.name || 'Select academic year'}
        />
        <LoadingButton
          variant="contained"
          loading={previewBusy}
          size="small"
          disabled={!month || !academicYearId}
          startIcon={<Iconify icon={previewButtonIcon} />}
          onClick={() => loadPreview(true)}
        >
          {previewButtonLabel}
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
            <Chip size="small" label="Summary" variant="outlined" />
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
                ['Net preview', hasPreviewForSelectedMonth ? formatCurrency(stats.net) : '-'],
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
                Deterministic checks flag missing salary structures, attendance gaps, stale payroll
                previews, negative net pay, and large salary variance before lock.
              </Typography>
            </Stack>
          </Box>
        </Collapse>
      </Card>

      {showReadinessPanel ? (
        <Card variant="outlined" sx={{ mb: 1, p: 1.25 }}>
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Payroll setup checklist
                  </Typography>
                  <Chip size="small" color={monthStatus.color} label={monthStatus.label} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Load the saved payroll preview when setup is ready. Review the rows, fix any setup
                  gaps, and use Refresh preview only when rows need to be recomputed.
                </Typography>
              </Box>
              {previewError ? (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  loading={previewBusy}
                  disabled={previewBusy}
                  startIcon={<Iconify icon="solar:refresh-linear" />}
                  onClick={() => loadPreview(false)}
                >
                  Retry preview load
                </LoadingButton>
              ) : null}
            </Stack>

            {previewError ? (
              <Alert severity="error">
                Payroll preview could not be prepared for{' '}
                {dayjs(`${previewError.month || selectedMonthKey}-01`).isValid()
                  ? dayjs(`${previewError.month || selectedMonthKey}-01`).format('MMMM YYYY')
                  : selectedMonthKey}
                . {previewError.errorCode ? `Error code: ${previewError.errorCode}. ` : ''}
                Use Retry preview load after checking attendance and payroll policy setup.
              </Alert>
            ) : null}

            {previewReadiness ? (
              <Grid container spacing={1}>
                {[
                  ['Employees', previewReadiness.employeeCount],
                  ['Existing preview rows', previewReadiness.snapshotCount],
                  ['Attendance found', previewReadiness.attendanceFoundCount],
                  ['Missing attendance', previewReadiness.missingAttendanceCount],
                  ['Missing salary setup', previewReadiness.missingSalaryStructureCount],
                  ['Policy setup issues', previewReadiness.policyConfigurationIssueCount],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 6, md: 2 }}>
                    <Card variant="outlined" sx={{ p: 1, height: '100%' }}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="h6">{value}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : null}

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(readinessActions.has('import-attendance') || previewError) && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:upload-linear" />}
                  onClick={() => router.push('/hr/attendance-tracking')}
                >
                  Go to Attendance Import
                </LoadingButton>
              )}
              {(readinessActions.has('review-attendance') || previewError) && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:calendar-mark-linear" />}
                  onClick={() => router.push(hrPaths.attendance.markAttendance)}
                >
                  Open Manual Attendance
                </LoadingButton>
              )}
              {(readinessActions.has('fix-payroll-policy') || previewError) && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<Iconify icon="solar:settings-linear" />}
                  onClick={() => router.push('/hr/policies?tab=payroll')}
                >
                  Open Payroll Policies
                </LoadingButton>
              )}
              {(readinessActions.has('assign-salary-structure') || previewError) && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<Iconify icon="solar:wallet-money-linear" />}
                  onClick={() => router.push(hrPaths.payroll.structure)}
                >
                  Open Salary Structures
                </LoadingButton>
              )}
            </Stack>
          </Stack>
        </Card>
      ) : null}

      <Card
        sx={{
          p: 1.25,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 480,
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
            {canViewPayrollAudit ? (
              <LoadingButton
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:history-linear" />}
                onClick={() => setAuditOpen(true)}
              >
                Audit
              </LoadingButton>
            ) : null}
            <LoadingButton
              size="small"
              variant="contained"
              color="success"
              disabled={!canLockPayroll || !lockableIds.length}
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
                This month is not loaded yet. Use <strong>Load preview</strong> above.
              </>
            ) : (
              <>No payroll preview rows found for this month. Refresh preview to recompute.</>
            )
          }
          tableId="payroll-monthly-workbench-table"
          isLoading={previewBusy}
          columns={columns}
          data={tableData}
          wrapperProps={{
            sx: {
              height: { xs: '56vh', md: '64vh' },
              minHeight: 360,
              maxHeight: '72vh',
              overflow: 'auto',
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
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520 },
            maxWidth: '100vw',
            height: '100dvh',
            maxHeight: '100dvh',
            overflow: 'hidden',
          },
        }}
      >
        {activeRow ? (
          <Stack sx={{ height: '100%', minHeight: 0 }}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={1}
              sx={{ flexShrink: 0, p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.25 } }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" noWrap>
                  {activeRow.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {activeRow.employeeIdentifier} • {activeRow.employeeGroup}
                </Typography>
              </Box>
              <IconButton onClick={() => setActiveRow(null)} sx={{ flexShrink: 0 }}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </Stack>
            <Divider />
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1.25, sm: 2 },
              }}
            >
              <Stack spacing={{ xs: 1.25, sm: 2 }}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Payable days
                    </Typography>
                    <Typography variant="subtitle2">
                      {activeRow.payableDays} / {activeRow.totalWorkingDays}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Proration
                    </Typography>
                    <Typography variant="subtitle2">
                      {activeRow.prorationFactor.toFixed(4)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total salary
                    </Typography>
                    <Typography variant="subtitle2">
                      {formatCurrency(activeRow.fullGrossSalary)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Day rule
                    </Typography>
                    <Typography variant="subtitle2" noWrap>
                      {activeRow.dayCalculationMode}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Review status
                    </Typography>
                    <Typography variant="subtitle2">{activeRow.status}</Typography>
                  </Grid>
                </Grid>
                <Card variant="outlined" sx={{ p: { xs: 1, sm: 1.25 }, overflow: 'visible' }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                    View all issues
                  </Typography>
                  {activeRow.issueCodes.length === 0 ? (
                    <Chip
                      size="small"
                      label="Clean payroll row"
                      color="success"
                      variant="outlined"
                    />
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
                            sx={{ minWidth: 0 }}
                          >
                            <Chip size="small" color={color} label={severity} />
                            {codes.map((code) => (
                              <Chip
                                key={code}
                                size="small"
                                variant="outlined"
                                color={color}
                                label={ISSUE_LABELS[code]?.label || code}
                                sx={{
                                  maxWidth: '100%',
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  },
                                }}
                              />
                            ))}
                          </Stack>
                        );
                      })}
                    </Stack>
                  )}
                </Card>
                <Card variant="outlined" sx={{ p: { xs: 1, sm: 1.25 } }}>
                  <Stack spacing={{ xs: 1, sm: 1.25 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2">Payroll-only adjustments</Typography>
                      <Chip
                        size="small"
                        label={`${activeRow.payrollAdjustments.length}`}
                        variant="outlined"
                      />
                    </Stack>
                    {activeRow.payrollAdjustments.length ? (
                      <Stack spacing={0.75}>
                        {activeRow.payrollAdjustments.map((adjustment) => (
                          <Stack
                            key={adjustment.id}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                            sx={{ minWidth: 0 }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {adjustment.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {adjustment.reason}
                              </Typography>
                            </Box>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                              sx={{ flexShrink: 0, minWidth: 0 }}
                            >
                              <Chip
                                size="small"
                                color={adjustment.isEarning ? 'success' : 'error'}
                                variant="outlined"
                                label={`${adjustment.isEarning ? '+' : '-'}${formatCurrency(adjustment.amount)}`}
                                sx={{
                                  maxWidth: { xs: 140, sm: 180 },
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  },
                                }}
                              />
                              {activeRowCanAdjust ? (
                                <>
                                  <IconButton
                                    size="small"
                                    disabled={updateAdjustmentLoading || deleteAdjustmentLoading}
                                    onClick={() => startEditingAdjustment(adjustment)}
                                  >
                                    <Iconify icon="solar:pen-linear" width={16} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    disabled={deleteAdjustmentLoading}
                                    onClick={() => removePayrollAdjustment(adjustment.id)}
                                  >
                                    <Iconify icon="solar:trash-bin-trash-linear" width={16} />
                                  </IconButton>
                                </>
                              ) : null}
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No payroll-only adjustments.
                      </Typography>
                    )}
                    {activeRow.status === 'LOCKED' ? (
                      <Alert severity="info">Locked payroll rows cannot be adjusted.</Alert>
                    ) : activeRow.status !== 'REVIEWED' ? (
                      <Alert severity="warning">
                        Mark this payroll row reviewed before adding payroll-only adjustments.
                      </Alert>
                    ) : !canAdjustPayroll ? (
                      <Alert severity="warning">
                        You do not have permission to change payroll-only adjustments.
                      </Alert>
                    ) : (
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Name"
                            value={adjustmentDraft.name}
                            onChange={(event) =>
                              setAdjustmentDraft((prev) => ({ ...prev, name: event.target.value }))
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Type"
                            value={adjustmentDraft.isEarning}
                            onChange={(event) =>
                              setAdjustmentDraft((prev) => ({
                                ...prev,
                                isEarning: event.target.value,
                              }))
                            }
                          >
                            <MenuItem value="true">Earning</MenuItem>
                            <MenuItem value="false">Deduction</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Amount"
                            value={adjustmentDraft.amount}
                            onChange={(event) =>
                              setAdjustmentDraft((prev) => ({
                                ...prev,
                                amount: event.target.value,
                              }))
                            }
                          />
                        </Grid>
                        <Grid size={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Reason"
                            value={adjustmentDraft.reason}
                            onChange={(event) =>
                              setAdjustmentDraft((prev) => ({
                                ...prev,
                                reason: event.target.value,
                              }))
                            }
                          />
                        </Grid>
                        <Grid size={12}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <LoadingButton
                              size="small"
                              variant="contained"
                              loading={createAdjustmentLoading || updateAdjustmentLoading}
                              startIcon={
                                <Iconify
                                  icon={
                                    editingAdjustmentId
                                      ? 'solar:diskette-bold'
                                      : 'solar:add-circle-bold'
                                  }
                                />
                              }
                              onClick={addPayrollAdjustment}
                              sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                              {editingAdjustmentId ? 'Save adjustment' : 'Add adjustment'}
                            </LoadingButton>
                            {editingAdjustmentId ? (
                              <LoadingButton
                                size="small"
                                variant="outlined"
                                onClick={cancelEditingAdjustment}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                              >
                                Cancel
                              </LoadingButton>
                            ) : null}
                          </Stack>
                        </Grid>
                      </Grid>
                    )}
                  </Stack>
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
            </Box>
          </Stack>
        ) : null}
      </Drawer>

      <Drawer
        anchor="right"
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        PaperProps={{ sx: { width: { xs: 360, sm: 520 }, p: 2 } }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6">Payroll lock audit</Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedMonthKey || 'Select a payroll month'}
            </Typography>
          </Box>
          {!canViewPayrollAudit ? (
            <Alert severity="warning">
              You do not have permission to view payroll audit events.
            </Alert>
          ) : payrollAuditLoading ? (
            <Alert severity="info">Loading payroll audit events...</Alert>
          ) : payrollAuditEvents?.items?.length ? (
            payrollAuditEvents.items.map((event, index) => {
              const context = parseHrAuditContext(event.contextJson);
              return (
                <Card key={event.id} variant="outlined" sx={{ p: 1.25 }}>
                  <Stack spacing={0.75}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        size="small"
                        label={`${index + 1}. ${event.actionLabel || toHrAuditLabel(event.action)}`}
                        color="primary"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatHrAuditDateTime(event.occurredAt, event.occurredAtDisplay)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {event.summary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actor:{' '}
                      {event.actorDisplayName ||
                        event.actorNameSnapshot ||
                        event.actorUserId ||
                        'System'}
                    </Typography>
                    {context ? (
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {Object.entries(context)
                          .slice(0, 8)
                          .map(([key, value]) => (
                            <Chip
                              key={key}
                              size="small"
                              variant="outlined"
                              label={`${toHrAuditLabel(key)}: ${formatHrAuditValue(value)}`}
                              sx={{ maxWidth: '100%' }}
                            />
                          ))}
                      </Stack>
                    ) : null}
                  </Stack>
                </Card>
              );
            })
          ) : (
            <Alert severity="info">No payroll lock audit events found for this month.</Alert>
          )}
        </Stack>
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
            disabled={!canLockPayroll}
            onClick={async () => {
              if (!selectedMonthKey || !academicYearId || !lockableIds.length) return;
              try {
                const res = await generateAndLockPayroll({
                  month: selectedMonthKey,
                  academicYearId,
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
