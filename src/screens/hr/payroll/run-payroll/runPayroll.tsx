'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { useResponsive } from 'src/hooks/use-responsive';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { shikshaMitraToast } from 'src/components/toast';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetHrAuditEventsQuery } from 'src/redux/hr/hr-policy-api';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { HrAuditValueView } from 'src/screens/hr/components/HrAuditValueView';
import {
  toHrAuditLabel,
  formatHrAuditText,
  formatHrAuditActor,
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
  useUnmarkPayrollReviewedMutation,
  useGenerateAndLockPayrollMutation,
  useCreatePayrollAdjustmentMutation,
  useUpdatePayrollAdjustmentMutation,
  useDeletePayrollAdjustmentMutation,
} from 'src/redux/runPayroll/runPayrollApi';

import { usePayrollPreviewRun } from './use-payroll-preview-run';
import SalaryProtectionSummary from '../salary-protection-summary';
import { DrawerHeader } from '../../policies/components/HRPolicySharedUI';
import { getPayrollMutationErrorMessage } from './run-payroll-error-utils';
import { SalaryDetailsTableCard } from '../salarySlip-generate/salarySlipGenerate';
import {
  getPayrollAdjustmentSourceLabel,
  isSystemGeneratedPayrollAdjustment,
} from './run-payroll-adjustment-utils';

import type { SalaryProtectionResult } from '../salary-protection-summary';

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
  additionalEarnings: number;
  totalEarnings: number;
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
  employerContributions: any[];
  employerContributionTotal: number;
  employerCost: number;
  compensationRevisionId?: string | null;
  compensationRevisionNumber?: number | null;
  compensationSalaryBasis?: string | null;
  salaryProtection?: SalaryProtectionResult | null;
  compensationProtectionPolicy?: string | null;
  compensationQuotedAmount?: number | null;
  compensationProtectedAmount?: number | null;
  compensationNormalizedProtectedAmount?: number | null;
  compensationTargetDifference?: number | null;
  payrollAdjustments: any[];
  prorationFactor: number;
  dayCalculationMode: string;
  employeeStateInsuranceRuleId?: string | null;
  employeeStateInsuranceRuleVersion?: number | null;
  employeeStateInsuranceWages: number;
  employeeStateInsuranceCoverageDecision?: string | null;
  employeeStateInsuranceNumber?: string | null;
  employeeStateInsuranceContributionPeriodStart?: string | null;
  employeeStateInsuranceContributionPeriodEnd?: string | null;
  employeeStateInsuranceGovernmentContribution: number;
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
  ESI_ESTABLISHMENT_INACTIVE: {
    label: 'ESI establishment setup is inactive',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_WAGE_CLASSIFICATION_REQUIRED: {
    label: 'ESI wage classification required',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_ENROLLMENT_REVIEW_REQUIRED: {
    label: 'ESI enrollment review required',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_INSURANCE_NUMBER_REQUIRED: {
    label: 'ESI insurance number required',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_PWD_RELIEF_EVIDENCE_REQUIRED: {
    label: 'PwD employer-share relief evidence needs review',
    severity: 'WARNING',
    color: 'warning',
  },
  COMPENSATION_REVISION_REQUIRED: {
    label: 'Effective salary setup required',
    severity: 'CRITICAL',
    color: 'error',
  },
  COMPENSATION_TARGET_VARIANCE: {
    label: 'Protected compensation target differs after payroll calculation',
    severity: 'WARNING',
    color: 'warning',
  },
};

const statusColor = {
  PENDING: 'warning',
  REVIEWED: 'info',
  LOCKED: 'success',
} as const;

const EMPTY_PREVIEW_ITEMS: Record<string, unknown>[] = [];

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
  const isDesktop = useResponsive('up', 'md');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
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
  const month = dayjs(searchParams.get('month') || undefined);
  const setMonth = useCallback((value: Dayjs | null) => {
    if (!value?.isValid()) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('month', value.format('YYYY-MM'));
    next.delete('previewRunId');
    next.delete('page');
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [pathname, router, searchParams]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [activeRow, setActiveRow] = useState<PayrollRow | null>(null);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [readinessOpen, setReadinessOpen] = useState(true);
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
  const preview = usePayrollPreviewRun(selectedMonthKey, academicYearId);
  const previewItems = preview.data?.items || EMPTY_PREVIEW_ITEMS;
  const previewReadiness = preview.data?.readiness;
  const previewError = preview.error;
  const previewIsGenerated = preview.data?.isGenerated || false;
  const previewBusy = preview.busy;
  const isDataForSelectedMonth = Boolean(preview.data);
  const {loadPreview} = preview;

  const [markReviewed, { isLoading: markLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMarkPayrollReviewedMutation,
    popupConfig: { error: false },
  });

  const [unmarkReviewed, { isLoading: unmarkLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUnmarkPayrollReviewedMutation,
    popupConfig: { error: false },
  });

  const [generateAndLockPayroll, { isLoading: lockLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGenerateAndLockPayrollMutation,
    popupConfig: { error: false },
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
  }, [academicYearEnd, academicYearId, academicYearStart, isMonthInAcademicYear, month, setMonth]);

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
          additionalEarnings: Number(item.additionalEarnings || 0),
          totalEarnings: Number(item.totalEarnings || 0),
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
          employerContributions: item.employerContributions || [],
          employerContributionTotal: Number(item.employerContributionTotal || 0),
          employerCost: Number(item.employerCost || 0),
          compensationRevisionId: item.compensationRevisionId,
          compensationRevisionNumber: item.compensationRevisionNumber,
          compensationSalaryBasis: item.compensationSalaryBasis,
          salaryProtection: item.salaryProtection,
          compensationProtectionPolicy: item.compensationProtectionPolicy,
          compensationQuotedAmount:
            item.compensationQuotedAmount == null ? null : Number(item.compensationQuotedAmount),
          compensationProtectedAmount:
            item.compensationProtectedAmount == null
              ? null
              : Number(item.compensationProtectedAmount),
          compensationNormalizedProtectedAmount:
            item.compensationNormalizedProtectedAmount == null
              ? null
              : Number(item.compensationNormalizedProtectedAmount),
          compensationTargetDifference:
            item.compensationTargetDifference == null
              ? null
              : Number(item.compensationTargetDifference),
          payrollAdjustments: item.payrollAdjustments || [],
          prorationFactor: Number(item.prorationFactor || 0),
          dayCalculationMode: item.dayCalculationMode || '-',
          employeeStateInsuranceRuleId: item.employeeStateInsuranceRuleId,
          employeeStateInsuranceRuleVersion: item.employeeStateInsuranceRuleVersion,
          employeeStateInsuranceWages: Number(item.employeeStateInsuranceWages || 0),
          employeeStateInsuranceCoverageDecision: item.employeeStateInsuranceCoverageDecision,
          employeeStateInsuranceNumber: item.employeeStateInsuranceNumber,
          employeeStateInsuranceContributionPeriodStart:
            item.employeeStateInsuranceContributionPeriodStart,
          employeeStateInsuranceContributionPeriodEnd:
            item.employeeStateInsuranceContributionPeriodEnd,
          employeeStateInsuranceGovernmentContribution: Number(
            item.employeeStateInsuranceGovernmentContribution || 0
          ),
        };
      }),
    [sourceRows]
  );

  const pendingRows = useMemo(
    () => tableData.filter((row) => row.status !== 'LOCKED'),
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
    activeRow && activeRow.status === 'REVIEWED' && canAdjustPayroll && preview.isCurrent
  );
  useEffect(() => {
    setSelectedEmployeeIds([]);
    setActiveRow(null);
    setLockConfirmOpen(false);
  }, [selectedMonthKey, academicYearId]);
  useEffect(() => {
    setSelectedEmployeeIds((prev) => {
      const next = prev.filter((id) => pendingRows.some((row) => row.id === id));
      return next.length === prev.length ? prev : next;
    });
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
          setReadinessOpen(false);
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


  const runReviewMutation = useCallback(
    async (mutation: any, employeeIds: string[], fallbackMessage: string) => {
      if (!selectedMonthKey || !academicYearId || employeeIds.length === 0 || !preview.isCurrent) return;
      try {
        const res = await mutation({
          month: selectedMonthKey,
          academicYearId,
          employeeIds,
          previewRunId: preview.runId,
        }).unwrap();
        shikshaMitraToast.success({ message: res?.message || fallbackMessage });
        await loadPreview();
      } catch (error: unknown) {
        shikshaMitraToast.error({ message: getPayrollMutationErrorMessage(error) });
      }
    },
    [academicYearId, loadPreview, preview.isCurrent, preview.runId, selectedMonthKey]
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
    if (isSystemGeneratedPayrollAdjustment(adjustment)) {
      shikshaMitraToast.error({
        message: 'System-generated payroll adjustments cannot be edited.',
      });
      return;
    }

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
        label: 'Full-month gross',
        minWidth: 140,
        align: 'center',
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'grossSalary',
        label: 'Gross Salary',
        minWidth: 130,
        align: 'center',
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'additionalEarnings',
        label: 'Additional earnings',
        minWidth: 140,
        align: 'center',
        filterType: 'number',
        render: (v) => formatCurrency(v),
      },
      {
        id: 'totalEarnings',
        label: 'Total earnings',
        minWidth: 140,
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
        align: 'left',
        filterType: 'number',
        render: (v) => (typeof v === 'number' ? formatCurrency(v) : '-'),
      },
      {
        id: 'netPayDelta',
        label: 'Variance',
        minWidth: 150,
        align: 'left',
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
        align: 'left',
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
        align: 'left',
        filterType: 'enum',
        sticky: true,
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
        label: 'Action',
        minWidth: 72,
        align: 'center',
        isFilter: false,
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        render(_value, row) {
          return (
            <ThreeDotsActions
              showViewIcon
              showThreeDots={false}
              handleViewClick={() => setActiveRow(row as PayrollRow)}
            />
          );
        },
      },
    ],
    [pendingRows, selectedEmployeeIds]
  );

  const readinessBusy = preview.busy || preview.fetching;
  // The server owns row ordering. Sorting only the loaded page would be misleading.
  const pagedColumns = useMemo(() => columns.map((column) => ({ ...column, isSort: false })), [columns]);
  const hasPreviewForSelectedMonth = isDataForSelectedMonth && tableData.length > 0;
  const stats = {
    total: previewReadiness?.employeeCount || 0,
    pending: Math.max(0, (previewReadiness?.employeeCount || 0) - (previewReadiness?.lockedCount || 0) - (previewReadiness?.reviewedCount || 0)),
    reviewed: previewReadiness?.reviewedCount || 0,
    locked: previewReadiness?.lockedCount || 0,
    net: previewReadiness?.netPayTotal || 0,
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
  const totalForProgress = stats.total || Number(previewReadiness?.employeeCount || 0);
  const readinessMetrics = [
    {
      label: 'Employees',
      value: readinessBusy && !previewReadiness ? '...' : stats.total || '-',
      icon: 'solar:users-group-rounded-linear',
    },
    {
      label: 'Preview rows',
      value: readinessBusy && !previewReadiness ? '...' : (previewReadiness?.snapshotCount ?? '-'),
      icon: 'solar:document-text-linear',
    },
    {
      label: 'Attendance gaps',
      value: previewReadiness?.missingAttendanceCount ?? '-',
      icon: 'solar:calendar-remove-linear',
    },
    {
      label: 'Salary setup gaps',
      value: previewReadiness?.missingSalaryStructureCount ?? '-',
      icon: 'solar:wallet-money-linear',
    },
    {
      label: 'Policy issues',
      value: previewReadiness?.policyConfigurationIssueCount ?? '-',
      icon: 'solar:shield-warning-linear',
    },
    {
      label: 'Reviewed',
      value: totalForProgress ? `${stats.reviewed}/${totalForProgress}` : '-',
      icon: 'solar:check-circle-linear',
    },
    {
      label: 'Locked',
      value: totalForProgress ? `${stats.locked}/${totalForProgress}` : '-',
      icon: 'solar:lock-keyhole-linear',
    },
    {
      label: 'Net preview',
      value: hasPreviewForSelectedMonth ? formatCurrency(stats.net) : '-',
      icon: 'solar:wallet-money-linear',
    },
  ];
  const previewButtonIcon = isDataForSelectedMonth ? 'solar:refresh-linear' : 'solar:rocket-bold';
  const previewButtonLabel = previewBusy
    ? 'Generating preview...'
    : isDataForSelectedMonth
      ? 'Refresh preview'
      : 'Generate preview';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflowX: 'hidden',
        overflowY: { xs: 'auto', md: 'hidden' },
        '& > *': { flexShrink: 0 },
      }}
    >
      <CustomBreadcrumbs
        heading="Run Payroll"
        layout={isDesktop ? 'inline' : 'stacked'}
        links={[{ name: 'HR/Staff' }, { name: 'Payroll Management' }, { name: 'Run Payroll' }]}
        description="Generate, review, and lock monthly payroll from one workbench."
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        flexWrap="wrap"
        useFlexGap
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.25}
        sx={{
          position: { xs: 'static', md: 'sticky' },
          top: 0,
          zIndex: 10,
          mb: 1,
          p: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 6px 20px -5px rgba(0, 0, 0, 0.5)'
              : '0 6px 20px -5px rgba(145, 158, 171, 0.08)',
          transition: (theme) => theme.transitions.create(['box-shadow']),
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
            },
          }}
          sx={{ width: { xs: '100%', sm: 220, md: 260 }, minWidth: { sm: 220 } }}
        />
        <Box
          sx={{
            minHeight: 40,
            width: { xs: '100%', sm: 170 },
            px: 1.5,
            py: 0.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: 'background.neutral',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
            Academic year
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
            <Iconify icon="solar:calendar-date-linear" width={16} />
            <Typography variant="body2" fontWeight={700} noWrap>
              {currentYear?.name || 'Select year'}
            </Typography>
          </Stack>
        </Box>
        <LoadingButton
          variant="contained"
          loading={previewBusy}
          size="small"
          disabled={!month || !academicYearId}
          startIcon={<Iconify icon={previewButtonIcon} />}
          onClick={() => loadPreview(true)}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {previewButtonLabel}
        </LoadingButton>
      </Stack>

      <Box
        sx={{
          flex: { xs: '0 0 auto', md: 1 },
          minHeight: 0,
          overflow: { xs: 'visible', md: 'hidden' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={1} sx={{ flex: 1, minHeight: 0, overflow: { xs: 'visible', md: 'hidden' } }}>
          <Card variant="outlined" sx={{ p: 0, flexShrink: 0 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              spacing={1}
              onClick={() => setReadinessOpen((prev) => !prev)}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle2">Payroll readiness</Typography>
                <Chip size="small" color={monthStatus.color} label={monthStatus.label} />
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent={{ xs: 'space-between', md: 'flex-end' }}
              >
                {previewError ? (
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    loading={previewBusy}
                    disabled={previewBusy}
                    startIcon={<Iconify icon="solar:refresh-linear" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      loadPreview(false);
                    }}
                  >
                    Retry preview load
                  </LoadingButton>
                ) : null}
                <IconButton size="small">
                  <Iconify
                    icon={
                      readinessOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'
                    }
                    width={18}
                  />
                </IconButton>
              </Stack>
            </Stack>
            <Collapse in={readinessOpen} timeout={800} unmountOnExit>
              <Box sx={{ px: 1.25, pb: 1.25 }}>
                <Stack spacing={1}>
                  {previewError ? (
                    <Alert severity="error">
                      Payroll preview could not be prepared for{' '}
                      {dayjs(`${selectedMonthKey}-01`).isValid()
                        ? dayjs(`${selectedMonthKey}-01`).format('MMMM YYYY')
                        : selectedMonthKey}
                      . {previewError.errorCode ? `Error code: ${previewError.errorCode}. ` : ''}
                      Use Retry preview load after checking attendance and payroll policy setup.
                    </Alert>
                  ) : null}

                  <Grid container spacing={0.75}>
                    {readinessMetrics.map(({ label, value, icon }) => (
                      <Grid key={label} size={{ xs: 6, sm: 3, lg: 1.5 }}>
                        <Box
                          sx={{
                            height: '100%',
                            minHeight: 64,
                            px: 1,
                            py: 0.75,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            minWidth: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: 'primary.main',
                              bgcolor: 'primary.lighter',
                            }}
                          >
                            <Iconify icon={icon} width={18} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {label}
                            </Typography>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                              {value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Box>
            </Collapse>
          </Card>

          {(preview.busy || (preview.data && !preview.isCurrent)) ? (
            <Alert severity={preview.busy ? 'info' : 'warning'} aria-live="polite">
              {preview.busy ? 'Calculating payroll in the background. You can leave this page and return later.' : 'These results are outdated. Refresh and review the updated payroll before locking.'}
            </Alert>
          ) : null}
          <Card
            sx={{
              p: 1.25,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: { xs: 480, md: 0 },
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
                  disabled={!preview.isCurrent || !selectedPendingIds.length}
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
                  disabled={!preview.isCurrent || !selectedReviewedIds.length}
                  onClick={() =>
                    runReviewMutation(
                      unmarkReviewed,
                      selectedReviewedIds,
                      'Removed selected reviews.'
                    )
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
                  disabled={!preview.isCurrent || !canLockPayroll || !lockableIds.length}
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
              isLoading={previewBusy && !preview.data}
              serverSidePagination
              serverSideSearch
              totalCount={preview.data?.totalCount || 0}
              page={preview.page}
              rowsPerPage={preview.pageSize}
              rowsPerPageOptions={[10, 25, 50]}
              maxServerRowsPerPage={50}
              searchTerm={preview.searchInput}
              onSearchInputChange={preview.setSearchInput}
              onServerPagination={(page, pageSize) => {
                setSelectedEmployeeIds([]);
                preview.updateQuery({ page: page - 1, pageSize });
              }}
              isFilter={false}
              columns={pagedColumns}
              data={tableData}
              wrapperProps={{
                sx: {
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                },
              }}
              tableContainerProps={{
                sx: {
                  flex: 1,
                  minHeight: 0,
                  height: '100%',
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
                <DrawerHeader
                  title={activeRow.employeeName || 'Employee payroll details'}
                  subtitle={`${activeRow.employeeIdentifier} • ${activeRow.employeeGroup}`}
                  helpText="Track who changed this policy, what fields were updated, and when each change occurred."
                  onClose={() => setActiveRow(null)}
                />

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
                    {/* Top Highlights Banner */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.neutral',
                        border: (theme) =>
                          `1px solid ${theme.vars?.palette?.divider || theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            fontSize: '0.68rem',
                          }}
                        >
                          Full-month gross
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {formatCurrency(activeRow.fullGrossSalary)}
                        </Typography>
                      </Stack>
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            fontSize: '0.68rem',
                          }}
                        >
                          Review Status
                        </Typography>
                        <Label
                          variant="soft"
                          color={statusColor[activeRow.status] || 'default'}
                          sx={{
                            px: 1.5,
                            py: 1.5,
                            borderRadius: 1,
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            fontSize: '0.72rem',
                          }}
                        >
                          {activeRow.status}
                        </Label>
                      </Stack>
                    </Box>

                    {/* Supporting Metrics 2x2 Grid */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 1.5,
                      }}
                    >
                      {[
                        {
                          label: 'Gross Salary',
                          value: formatCurrency(activeRow.grossSalary),
                          icon: 'solar:calculator-bold-duotone',
                          color: 'primary.main',
                        },
                        {
                          label: 'Additional earnings',
                          value: formatCurrency(activeRow.additionalEarnings),
                          icon: 'solar:calculator-bold-duotone',
                          color: 'success.main',
                        },
                        {
                          label: 'Total earnings',
                          value: formatCurrency(activeRow.totalEarnings),
                          icon: 'solar:calculator-bold-duotone',
                          color: 'primary.main',
                        },
                        {
                          label: 'Payable Days',
                          value: `${activeRow.payableDays} / ${activeRow.totalWorkingDays} days`,
                          icon: 'solar:calendar-date-bold-duotone',
                          color: 'info.main',
                        },
                        {
                          label: 'Proration Factor',
                          value: activeRow.prorationFactor.toFixed(4),
                          icon: 'solar:calculator-bold-duotone',
                          color: 'warning.main',
                        },
                        {
                          label: 'Day Calculation Rule',
                          value: activeRow.dayCalculationMode,
                          icon: 'solar:document-text-bold-duotone',
                          color: 'success.main',
                        },
                        {
                          label: 'Attendance Summary',
                          value: `${activeRow.absentDays || 0} absent`,
                          icon: 'solar:user-block-bold-duotone',
                          color: activeRow.absentDays > 0 ? 'error.main' : 'text.secondary',
                        },
                      ].map((metric) => (
                        <Box
                          key={metric.label}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            border: (theme) =>
                              `1px solid ${theme.vars?.palette?.divider || theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: 'background.paper',
                            boxShadow: (theme) => theme.customShadows?.z1 || 'none',
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'action.hover',
                            }}
                          >
                            <Iconify
                              icon={metric.icon}
                              sx={{ color: metric.color, width: 20, height: 20 }}
                            />
                          </Box>
                          <Stack spacing={0.25} sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                            >
                              {metric.label}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textTransform: 'capitalize',
                              }}
                            >
                              {metric.value}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Box>

                    {/* Warnings & Issues Card */}
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        boxShadow: (theme) => theme.customShadows?.z1 || 'none',
                        overflow: 'visible',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <Iconify
                          icon="solar:shield-warning-bold-duotone"
                          sx={{
                            color:
                              activeRow.issueCodes.length > 0 ? 'warning.main' : 'success.main',
                            width: 22,
                            height: 22,
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Payroll Warnings & Issues
                        </Typography>
                      </Stack>

                      {activeRow.issueCodes.length === 0 ? (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: (theme) =>
                              `rgba(${theme.vars?.palette?.success?.mainChannel || '34 197 94'} / 0.08)`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                          }}
                        >
                          <Iconify
                            icon="solar:check-circle-bold"
                            sx={{ color: 'success.main', width: 20, height: 20 }}
                          />
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            Clean payroll row • No issues detected.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5}>
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
                              <Box
                                key={severity}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  border: (theme) =>
                                    `1px solid rgba(${theme.vars?.palette?.[color]?.mainChannel || '255 171 0'} / 0.2)`,
                                  bgcolor: (theme) =>
                                    `rgba(${theme.vars?.palette?.[color]?.mainChannel || '255 171 0'} / 0.08)`,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                  sx={{ mb: 1.25 }}
                                >
                                  <Label
                                    color={color}
                                    variant="filled"
                                    sx={{
                                      textTransform: 'uppercase',
                                      px: 1,
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                    }}
                                  >
                                    {severity}
                                  </Label>
                                  <Label
                                    color={color}
                                    variant="soft"
                                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                                  >
                                    {codes.length} {codes.length === 1 ? 'Notice' : 'Notices'}
                                  </Label>
                                </Stack>
                                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                  {codes.map((code) => (
                                    <Label
                                      key={code}
                                      color={color}
                                      variant="soft"
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {ISSUE_LABELS[code]?.label || code}
                                    </Label>
                                  ))}
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>
                      )}
                    </Card>
                    {activeRow.compensationRevisionId ? (
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          gap={1}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              Compensation Revision {activeRow.compensationRevisionNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Effective recurring salary source
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            color="info"
                            label={
                              activeRow.compensationProtectionPolicy
                                ?.replaceAll('_', ' ')
                                .toLowerCase() || 'Protected'
                            }
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Stack>
                        <Grid container spacing={1.25} sx={{ mt: 0.75 }}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                              Quote Basis
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {activeRow.compensationSalaryBasis
                                ?.replaceAll('_', ' ')
                                .toLowerCase() || '-'}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                              Quoted
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {formatCurrency(activeRow.compensationQuotedAmount || 0)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                              Protected result
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {formatCurrency(activeRow.compensationNormalizedProtectedAmount || 0)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                              Difference
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color={
                                activeRow.compensationTargetDifference
                                  ? 'warning.main'
                                  : 'text.primary'
                              }
                            >
                              {formatCurrency(activeRow.compensationTargetDifference || 0)}
                            </Typography>
                          </Grid>
                        </Grid>
                        <SalaryProtectionSummary result={activeRow.salaryProtection} />
                        {activeRow.compensationTargetDifference ? (
                          <Alert severity="warning" sx={{ mt: 1.5 }}>
                            Review this variance before locking. Payroll has not changed the
                            employee&apos;s effective salary automatically.
                          </Alert>
                        ) : null}
                      </Card>
                    ) : null}
                    {activeRow.employeeStateInsuranceRuleId ? (
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          gap={1}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              Employee State Insurance
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              System-calculated statutory component
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            color={
                              activeRow.employeeStateInsuranceCoverageDecision ===
                              'ABOVE_WAGE_CEILING'
                                ? 'default'
                                : 'info'
                            }
                            label={
                              activeRow.employeeStateInsuranceCoverageDecision
                                ?.replaceAll('_', ' ')
                                .toLowerCase() || 'Evaluated'
                            }
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Stack>
                        <Grid container spacing={1.25} sx={{ mt: 0.75 }}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Statutory Wages
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {formatCurrency(activeRow.employeeStateInsuranceWages)}
                            </Typography>
                          </Grid>
                          {activeRow.employeeStateInsuranceGovernmentContribution > 0 ? (
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary">
                                Government Contribution
                              </Typography>
                              <Typography variant="body2" fontWeight={700}>
                                {formatCurrency(
                                  activeRow.employeeStateInsuranceGovernmentContribution
                                )}
                              </Typography>
                            </Grid>
                          ) : null}
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Rule Version
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              v{activeRow.employeeStateInsuranceRuleVersion}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Insurance Number
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ overflowWrap: 'anywhere' }}
                            >
                              {activeRow.employeeStateInsuranceNumber || 'Registration pending'}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Contribution Period
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {activeRow.employeeStateInsuranceContributionPeriodStart &&
                              activeRow.employeeStateInsuranceContributionPeriodEnd
                                ? `${dayjs(activeRow.employeeStateInsuranceContributionPeriodStart).format('MMM YYYY')} - ${dayjs(activeRow.employeeStateInsuranceContributionPeriodEnd).format('MMM YYYY')}`
                                : 'Not applicable'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Card>
                    ) : null}
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
                            {activeRow.payrollAdjustments.map((adjustment) => {
                              const isSystemGenerated =
                                isSystemGeneratedPayrollAdjustment(adjustment);
                              const sourceLabel = getPayrollAdjustmentSourceLabel(adjustment);

                              return (
                                <Stack
                                  key={adjustment.id}
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  spacing={1}
                                  sx={{ minWidth: 0 }}
                                >
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Stack
                                      direction="row"
                                      spacing={0.75}
                                      alignItems="center"
                                      sx={{ minWidth: 0 }}
                                    >
                                      <Typography variant="body2" fontWeight={600} noWrap>
                                        {adjustment.name}
                                      </Typography>
                                      {isSystemGenerated ? (
                                        <Chip
                                          size="small"
                                          label={sourceLabel}
                                          color="warning"
                                          variant="outlined"
                                        />
                                      ) : null}
                                    </Stack>
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
                                        <Tooltip
                                          title={
                                            isSystemGenerated
                                              ? 'System-generated adjustment'
                                              : 'Edit adjustment'
                                          }
                                        >
                                          <span>
                                            <IconButton
                                              size="small"
                                              disabled={
                                                isSystemGenerated ||
                                                updateAdjustmentLoading ||
                                                deleteAdjustmentLoading
                                              }
                                              onClick={() => startEditingAdjustment(adjustment)}
                                            >
                                              <Iconify icon="solar:pen-linear" width={16} />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                        <Tooltip
                                          title={
                                            isSystemGenerated
                                              ? 'System-generated adjustment'
                                              : 'Remove adjustment'
                                          }
                                        >
                                          <span>
                                            <IconButton
                                              size="small"
                                              disabled={
                                                isSystemGenerated || deleteAdjustmentLoading
                                              }
                                              onClick={() => removePayrollAdjustment(adjustment.id)}
                                            >
                                              <Iconify
                                                icon="solar:trash-bin-trash-linear"
                                                width={16}
                                              />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      </>
                                    ) : null}
                                  </Stack>
                                </Stack>
                              );
                            })}
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
                                  setAdjustmentDraft((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                  }))
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
                    {activeRow.employerContributions.length ? (
                      <SalaryDetailsTableCard
                        title="Employer Contributions"
                        subheader={`Additional employer cost: ${formatCurrency(activeRow.employerContributionTotal)}`}
                        icon="solar:buildings-2-linear"
                        iconColor={{ bg: 'info.lighter', color: 'info.main' }}
                        data={activeRow.employerContributions}
                        tableId="payroll-workbench-employer-contributions"
                        nameColumnLabel="Contribution"
                        noDataText="No employer contributions found"
                      />
                    ) : null}
                  </Stack>
                </Box>
              </Stack>
            ) : null}
          </Drawer>

          <Drawer
            anchor="right"
            open={auditOpen}
            onClose={() => setAuditOpen(false)}
            PaperProps={{ sx: { width: { xs: 360, sm: 520 } } }}
          >
            <Stack sx={{ height: '100%', minHeight: 0 }}>
              <DrawerHeader
                title="Payroll lock audit"
                subtitle={selectedMonthKey || 'Select a payroll month'}
                helpText="Track who changed this policy, what fields were updated, and when each change occurred."
                onClose={() => setAuditOpen(false)}
              />

              <Divider sx={{ mb: 1 }} />
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
                          {formatHrAuditText(event.summary)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Actor:{' '}
                          {formatHrAuditActor(
                            event.actorDisplayName || event.actorNameSnapshot || event.actorUserId,
                            'System'
                          )}
                        </Typography>
                        {context ? (
                          <Stack spacing={0.75}>
                            {Object.entries(context)
                              .slice(0, 8)
                              .map(([key, value]) => (
                                <Box
                                  key={key}
                                  sx={{
                                    p: 0.75,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                  }}
                                >
                                  <HrAuditValueView
                                    value={value}
                                    label={toHrAuditLabel(key)}
                                    dense
                                  />
                                </Box>
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
                disabled={!canLockPayroll || !preview.isCurrent}
                onClick={async () => {
                  if (!selectedMonthKey || !academicYearId || !lockableIds.length) return;
                  try {
                    const res = await generateAndLockPayroll({
                      month: selectedMonthKey,
                      academicYearId,
                      employeeIds: lockableIds,
                      previewRunId: preview.runId,
                    }).unwrap();
                    shikshaMitraToast.success({
                      message: res?.message || 'Payroll locked successfully.',
                    });
                    setLockConfirmOpen(false);
                    setSelectedEmployeeIds([]);
                    await loadPreview();
                  } catch (error: unknown) {
                    shikshaMitraToast.error({
                      message: getPayrollMutationErrorMessage(error),
                    });
                  }
                }}
              >
                Yes, lock reviewed
              </LoadingButton>
            }
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default RunPayroll;
