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
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetHrAuditEventsQuery } from 'src/redux/hr/hr-policy-api';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { HrSetupLink } from 'src/screens/hr/recovery/hr-setup-controls';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { HrAuditValueView } from 'src/screens/hr/components/HrAuditValueView';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { PAYROLL_ISSUE_LABELS as ISSUE_LABELS } from 'src/constants/payroll-issues';
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
  Button,
  Tooltip,
  Divider,
  Checkbox,
  Skeleton,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
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
import { SalaryDetailsTableCard } from './salary-details-table-card';
import { DrawerHeader } from '../../policies/components/HRPolicySharedUI';
import { getPayrollMutationErrorMessage } from './run-payroll-error-utils';
import { PayrollRegistrationReadiness } from './payroll-registration-readiness';
import {
  getPayrollAdjustmentSourceLabel,
  isSystemGeneratedPayrollAdjustment,
} from './run-payroll-adjustment-utils';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type PayrollStatutoryTrace = {
  CalculationSettings?: {
    EligibilityBasis?: string;
    CalculationBasis?: string;
    WageBasis?: string;
    OverrideReason?: string;
    EvidenceReference?: string;
  };
  EligibilityWages?: number;
  EmployeePercentage?: number;
  EmployerPercentage?: number;
};
const parseStatutoryTrace = (value: unknown): PayrollStatutoryTrace | null => {
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};
type PayrollRow = {
  statutoryTrace: PayrollStatutoryTrace | null;
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
  return `${sign}${formatPayrollCurrency(value)}${pct}`;
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
  const setMonth = useCallback(
    (value: Dayjs | null) => {
      if (!value?.isValid()) return;
      const next = new URLSearchParams(searchParams.toString());
      next.set('month', value.format('YYYY-MM'));
      next.delete('previewRunId');
      next.delete('page');
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [activeRow, setActiveRow] = useState<PayrollRow | null>(null);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [readinessDrawerContext, setReadinessDrawerContext] = useState<string | null>(null);
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
  const isDesktop = useResponsive('up', 'md');
  const academicYearStart = currentYear?.startDate ? dayjs(currentYear.startDate) : null;
  const academicYearEnd = currentYear?.endDate ? dayjs(currentYear.endDate) : null;
  const preview = usePayrollPreviewRun(selectedMonthKey, academicYearId);
  const exportTable = useHrTableExport('payroll-monthly-workbench-table', {
    runId: preview.runId,
    search: preview.searchInput,
  });
  const previewItems = preview.data?.items || EMPTY_PREVIEW_ITEMS;
  const previewReadiness =
    preview.data?.readiness?.month === selectedMonthKey ? preview.data.readiness : undefined;
  const previewError = preview.error;
  const previewIsGenerated = preview.data?.isGenerated || false;
  const previewBusy = preview.isPreparing;
  const isDataForSelectedMonth = Boolean(preview.data);
  const { loadPreview } = preview;
  const previewContextKey = `${academicYearId}:${selectedMonthKey}`;
  const readinessOpen = readinessDrawerContext === previewContextKey;
  const previewContext = useRef({ key: previewContextKey });
  if (previewContext.current.key !== previewContextKey) {
    previewContext.current = { key: previewContextKey };
  }
  const previewMounted = useRef(true);
  const explicitRequest = useRef(false);
  const notifiedRuns = useRef(new Set<string>());
  const [pendingPreview, setPendingPreview] = useState<{ key: string; id: string | null } | null>(
    null
  );
  useEffect(() => {
    previewMounted.current = true;
    return () => {
      previewMounted.current = false;
    };
  }, []);
  useEffect(() => {
    setPendingPreview(null);
    explicitRequest.current = false;
    setReadinessDrawerContext(null);
  }, [previewContextKey]);
  const requestPreview = useCallback(async () => {
    if (explicitRequest.current || previewBusy) return;
    const requestedContext = previewContext.current;
    explicitRequest.current = true;
    setPendingPreview({ key: requestedContext.key, id: null });
    const accepted = await loadPreview(true);
    if (!previewMounted.current || previewContext.current !== requestedContext) return;
    if (!accepted) explicitRequest.current = false;
    setPendingPreview(
      accepted
        ? { key: requestedContext.key, id: accepted.id }
        : { key: requestedContext.key, id: '' }
    );
  }, [loadPreview, previewBusy]);
  useEffect(() => {
    if (!pendingPreview || pendingPreview.key !== previewContextKey || pendingPreview.id === null)
      return;
    const matchingRun = pendingPreview.id === preview.requestedRunId;
    const completed = matchingRun && preview.isCurrent;
    const failed = Boolean(previewError) && (!pendingPreview.id || matchingRun);
    if (!completed && !failed && !(matchingRun && preview.isStale)) return;
    const notificationKey = `${pendingPreview.key}:${pendingPreview.id}`;
    if (failed || !notifiedRuns.current.has(notificationKey)) {
      if (completed) {
        shikshaMitraToast.success({ message: 'Payroll preview updated.' });
        notifiedRuns.current.add(notificationKey);
      } else if (failed && previewError) {
        shikshaMitraToast.error({
          message: previewError.message,
        });
      }
      // Retrying a transport failure may finish the same run, so only deduplicate completion.
    }
    setPendingPreview(null);
    explicitRequest.current = false;
  }, [
    pendingPreview,
    previewContextKey,
    preview.requestedRunId,
    preview.isCurrent,
    preview.isStale,
    previewError,
  ]);

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
          statutoryTrace: parseStatutoryTrace(item.esiCalculationDetailsJson),
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
  const activeRowIsCurrent = Boolean(
    activeRow && tableData.includes(activeRow) && preview.isCurrent
  );
  const activeRowCanAdjust = Boolean(
    activeRowIsCurrent && activeRow?.status === 'REVIEWED' && canAdjustPayroll
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

  const runReviewMutation = useCallback(
    async (mutation: any, employeeIds: string[], fallbackMessage: string) => {
      if (!selectedMonthKey || !academicYearId || employeeIds.length === 0 || !preview.isCurrent)
        return;
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
    if (!activeRowIsCurrent) return;
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
    activeRowIsCurrent,
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

  const startEditingAdjustment = useCallback(
    (adjustment: any) => {
      if (!activeRowCanAdjust) return;
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
    },
    [activeRowCanAdjust]
  );

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
              inputProps={{ 'aria-label': 'Select all unlocked payroll rows on this page' }}
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
              inputProps={{ 'aria-label': `Select payroll for ${row.employeeName}` }}
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
        label: 'Staff',
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
        render: (v) => formatPayrollCurrency(v),
      },
      {
        id: 'grossSalary',
        label: 'Gross Salary',
        minWidth: 130,
        align: 'center',
        filterType: 'number',
        render: (v) => formatPayrollCurrency(v),
      },
      {
        id: 'additionalEarnings',
        label: 'Additional earnings',
        minWidth: 140,
        align: 'center',
        filterType: 'number',
        render: (v) => formatPayrollCurrency(v),
      },
      {
        id: 'totalEarnings',
        label: 'Total earnings',
        minWidth: 140,
        align: 'center',
        filterType: 'number',
        render: (v) => formatPayrollCurrency(v),
      },
      {
        id: 'totalDeduction',
        label: 'Deductions',
        minWidth: 140,
        align: 'center',
        filterType: 'number',
        render: (v) => formatPayrollCurrency(v),
      },
      {
        id: 'netSalary',
        label: 'Net pay',
        minWidth: 130,
        align: 'center',
        filterType: 'number',
        render: (v) => formatPayrollCurrency(v),
      },
      {
        id: 'previousMonthNetPay',
        label: 'Last month',
        minWidth: 130,
        align: 'left',
        filterType: 'number',
        render: (v) => (typeof v === 'number' ? formatPayrollCurrency(v) : '-'),
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
        stickyPosition: 'right' as const,
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

  // The server owns row ordering. Sorting only the loaded page would be misleading.
  const pagedColumns = useMemo(
    () =>
      columns.map((column) => ({ ...column, isSort: false, sticky: isDesktop && column.sticky })),
    [columns, isDesktop]
  );
  const blockingIssues = Array.isArray(previewReadiness?.blockingIssues)
    ? [...new Set(previewReadiness.blockingIssues)]
    : [];
  const readinessChecks = [
    {
      label: 'Attendance',
      count: previewReadiness?.missingAttendanceCount,
      issueCodes: ['NO_ATTENDANCE'],
      readyText: 'No attendance gaps reported.',
      issueText: 'Attendance missing',
    },
    {
      label: 'Salary setup',
      count: previewReadiness?.missingSalaryStructureCount,
      issueCodes: ['MISSING_SALARY_STRUCTURE'],
      readyText: 'No missing salary structures.',
      issueText: 'Salary setup missing',
    },
    {
      label: 'Payroll policies',
      count: previewReadiness?.policyConfigurationIssueCount,
      issueCodes: ['PAYROLL_POLICY_CONFIGURATION', 'ATTENDANCE_SALARY_DEDUCTION_CONFIGURATION'],
      readyText: 'No configuration issues reported.',
      issueText: 'Policy issues',
    },
  ].map((check) => ({
    ...check,
    isAvailable:
      typeof check.count === 'number' && Number.isFinite(check.count) && check.count >= 0,
    needsAttention:
      (check.count ?? 0) > 0 || check.issueCodes.some((code) => blockingIssues.includes(code)),
  }));
  const additionalBlockingIssues = blockingIssues.filter(
    (code) => !readinessChecks.some((check) => check.issueCodes.includes(code))
  );
  const checksNeedingAttention = readinessChecks.filter((check) => check.needsAttention);
  const readinessAvailable =
    readinessChecks.every((check) => check.isAvailable) &&
    Array.isArray(previewReadiness?.blockingIssues) &&
    Number.isFinite(previewReadiness?.employeeCount) &&
    typeof previewReadiness?.canPreview === 'boolean';
  const monthStatus = (() => {
    if (previewError) return { label: 'Cannot load preview', color: 'error' as const };
    if (preview.isPreparing) return { label: 'Preparing preview', color: 'default' as const };
    if (preview.isStale) return { label: 'Preview needs refresh', color: 'warning' as const };
    if (
      previewIsGenerated ||
      (previewReadiness &&
        previewReadiness.employeeCount > 0 &&
        previewReadiness.lockedCount === previewReadiness.employeeCount)
    )
      return { label: 'Already locked', color: 'success' as const };
    if (
      checksNeedingAttention.length ||
      additionalBlockingIssues.length ||
      previewReadiness?.canPreview === false
    ) {
      const check = checksNeedingAttention[0];
      return {
        label:
          readinessAvailable &&
          checksNeedingAttention.length === 1 &&
          !additionalBlockingIssues.length &&
          check.count
            ? `${check.issueText} · ${check.count}`
            : 'Needs attention',
        color: 'warning' as const,
      };
    }
    if (!previewReadiness)
      return {
        label: preview.data ? 'Readiness unavailable' : 'Preview not generated',
        color: 'default' as const,
      };
    if (!readinessAvailable) return { label: 'Readiness unavailable', color: 'default' as const };
    if (!previewReadiness.employeeCount) return { label: 'No staff', color: 'default' as const };
    return { label: 'Ready to review', color: 'success' as const };
  })();
  const summaryCount = (count: number | undefined) =>
    typeof count === 'number' && Number.isFinite(count) && count >= 0
      ? String(count)
      : 'Unavailable';
  const summaryProgress = (count: number | undefined) =>
    summaryCount(count) !== 'Unavailable' &&
    summaryCount(previewReadiness?.employeeCount) !== 'Unavailable'
      ? `${count} / ${previewReadiness?.employeeCount}`
      : 'Unavailable';
  const readinessMetrics = [
    { label: 'Staff', value: summaryCount(previewReadiness?.employeeCount) },
    { label: 'Preview rows', value: summaryCount(previewReadiness?.snapshotCount) },
    { label: 'Reviewed', value: summaryProgress(previewReadiness?.reviewedCount) },
    { label: 'Locked', value: summaryProgress(previewReadiness?.lockedCount) },
    {
      label: 'Net preview',
      value:
        typeof previewReadiness?.netPayTotal === 'number' &&
        Number.isFinite(previewReadiness.netPayTotal)
          ? formatPayrollCurrency(previewReadiness.netPayTotal)
          : 'Unavailable',
    },
  ];
  const previewButtonLabel = previewBusy
    ? isDataForSelectedMonth
      ? 'Refreshing…'
      : 'Generating…'
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
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Run Payroll' },
        ]}
        description="Generate, review, and lock monthly payroll from one workbench."
        sx={{ flexWrap: 'wrap', mb: 1 }}
      />

      <PayrollRegistrationReadiness month={selectedMonthKey} />
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
          px: 1,
          py: 1,
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
        <Stack
          spacing={1}
          sx={{ flex: 1, minHeight: 0, overflow: { xs: 'visible', md: 'hidden' } }}
        >
          {previewError ? (
            <Alert
              severity="error"
              action={
                <LoadingButton
                  size="small"
                  color="inherit"
                  loading={previewBusy}
                  onClick={requestPreview}
                  startIcon={<Iconify icon="mdi:refresh" />}
                >
                  Retry
                </LoadingButton>
              }
            >
              <Stack spacing={1}>
                <Typography variant="body2">{previewError.message}</Typography>
                <Typography variant="body2">{previewError.guidance}</Typography>
                {previewError.setup && <HrSetupLink setup={previewError.setup} />}
              </Stack>
            </Alert>
          ) : null}
          <Box
            component="section"
            aria-labelledby="payroll-register-title"
            aria-busy={preview.isPreparing || preview.fetching}
            sx={{
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
              flexWrap="wrap"
              useFlexGap
              sx={{ px: 1, py: 0.75 }}
            >
              <Box>
                <Typography id="payroll-register-title" variant="subtitle1" fontWeight={700}>
                  Payroll Register
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {month?.format('MMMM YYYY')} • {selectedEmployeeIds.length} selected
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                flexWrap={{ xs: 'wrap', lg: 'nowrap' }}
                useFlexGap
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                    aria-hidden="true"
                    sx={{
                      display: { xs: 'none', lg: 'block' },
                      height: 20,
                      alignSelf: 'center',
                      borderColor: 'text.disabled',
                    }}
                  />
                }
                sx={{ maxWidth: '100%' }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  role="group"
                  aria-label="Payroll preview"
                >
                  {preview.isStale ? (
                    <Typography variant="caption" color="warning.main" role="status">
                      Preview needs refresh
                    </Typography>
                  ) : null}
                  <LoadingButton
                    variant="contained"
                    loading={previewBusy}
                    size="small"
                    disabled={!month.isValid() || !academicYearId}
                    startIcon={
                      <Iconify icon={isDataForSelectedMonth ? 'mdi:refresh' : 'mdi:calculator'} />
                    }
                    onClick={requestPreview}
                  >
                    {previewButtonLabel}
                  </LoadingButton>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  role="group"
                  aria-label="Payroll readiness and audit"
                >
                  <Button
                    size="small"
                    variant="outlined"
                    aria-haspopup="dialog"
                    aria-expanded={readinessOpen}
                    aria-controls="payroll-readiness-drawer"
                    startIcon={<Iconify icon="mdi:clipboard-check-outline" />}
                    onClick={() => setReadinessDrawerContext(previewContextKey)}
                  >
                    View readiness
                  </Button>
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
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  role="group"
                  aria-label="Review and lock selected payroll rows"
                >
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    color="info"
                    loading={markLoading}
                    disabled={!preview.isCurrent || !selectedPendingIds.length}
                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                    title="Acknowledges the displayed payroll warnings for these rows."
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
                    startIcon={<Iconify icon="mdi:undo" />}
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
                  <LoadingButton
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={!preview.isCurrent || !canLockPayroll || !lockableIds.length}
                    startIcon={<Iconify icon="solar:lock-bold" />}
                    onClick={() => {
                      if (preview.isCurrent) setLockConfirmOpen(true);
                    }}
                  >
                    Lock Reviewed
                  </LoadingButton>
                </Stack>
              </Stack>
            </Stack>

            {!preview.isCurrent && preview.data ? (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>
                Review, adjustments, and locking require a current loaded preview.
              </Typography>
            ) : null}
            <Box sx={{ height: 2, flexShrink: 0 }}>
              {preview.data && (preview.isPreparing || preview.fetching) ? (
                <LinearProgress
                  aria-label={
                    preview.isPreparing ? 'Preparing payroll preview' : 'Loading payroll rows'
                  }
                />
              ) : null}
            </Box>
            <CustomizableTable
              showColumns
              showExport
              showFullScreen
              exportScope="all"
              noDataText={
                !isDataForSelectedMonth && selectedMonthKey ? (
                  <>
                    No preview is available. Use <strong>Generate preview</strong> above.
                  </>
                ) : (
                  <>
                    {preview.searchInput
                      ? 'No employees match your search.'
                      : 'No payroll preview rows found for this month.'}
                  </>
                )
              }
              tableId="payroll-monthly-workbench-table"
              tableTitle="Monthly payroll workbench"
              onExport={exportTable}
              isLoading={(previewBusy || preview.fetching) && !preview.data}
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
          </Box>

          <Drawer
            anchor="right"
            open={readinessOpen}
            onClose={() => setReadinessDrawerContext(null)}
            PaperProps={{
              id: 'payroll-readiness-drawer',
              role: 'dialog',
              'aria-label': 'Payroll Readiness',
              sx: { width: { xs: '100%', sm: 420 }, maxWidth: '100vw', overflow: 'hidden' },
            }}
          >
            <Stack sx={{ height: '100%', minHeight: 0 }}>
              <DrawerHeader
                title="Payroll Readiness"
                subtitle={`${month.format('MMMM YYYY')} • ${currentYear?.name || 'Select year'}`}
                onClose={() => setReadinessDrawerContext(null)}
              />
              <Divider />
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
                <Stack spacing={2}>
                  <Box>
                    <Label
                      color={monthStatus.color}
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {monthStatus.label}
                    </Label>
                    {previewReadiness &&
                    (preview.isPreparing || preview.isStale || previewError) ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {preview.isPreparing
                          ? 'Showing the last completed preview while preparing results.'
                          : 'These checks are from the last completed preview.'}
                      </Typography>
                    ) : null}
                  </Box>
                  <Box component="section" aria-label="Readiness checks">
                    <Typography variant="subtitle2">Checks</Typography>
                    <Stack divider={<Divider />}>
                      {readinessChecks.map((check) => (
                        <Stack key={check.label} direction="row" spacing={1.25} sx={{ py: 1.5 }}>
                          <Iconify
                            icon={
                              check.needsAttention
                                ? 'mdi:alert-circle-outline'
                                : check.isAvailable
                                  ? 'mdi:check-circle-outline'
                                  : 'mdi:minus-circle-outline'
                            }
                            width={20}
                            sx={{
                              mt: 0.25,
                              flexShrink: 0,
                              color: check.needsAttention
                                ? 'warning.main'
                                : check.isAvailable
                                  ? 'success.main'
                                  : 'text.secondary',
                            }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2">{check.label}</Typography>
                            {preview.isPreparing && !previewReadiness ? (
                              <Skeleton width={180} />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {!check.isAvailable
                                  ? 'Unavailable'
                                  : check.needsAttention
                                    ? check.count
                                      ? `${check.count} staff need attention.`
                                      : 'This check needs attention.'
                                    : check.readyText}
                              </Typography>
                            )}
                            {check.label === 'Attendance' ? (
                              <HrSetupLink setup="attendance" />
                            ) : null}
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                  {additionalBlockingIssues.length || previewReadiness?.canPreview === false ? (
                    <Box component="section" aria-label="Additional readiness checks">
                      <Typography variant="subtitle2">Additional checks</Typography>
                      <Stack component="ul" spacing={1} sx={{ pl: 2.5, mb: 0 }}>
                        {additionalBlockingIssues.map((code) => (
                          <Typography component="li" variant="body2" key={code}>
                            {ISSUE_LABELS[code]?.label ||
                              (code === 'NO_WORKING_DAYS'
                                ? 'No working days configured'
                                : 'Another payroll check needs attention')}
                          </Typography>
                        ))}
                        {previewReadiness?.canPreview === false ? (
                          <Typography component="li" variant="body2">
                            Payroll preview is unavailable for this month.
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>
                  ) : null}
                  <Box component="section" aria-label="Preview summary">
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Preview summary
                    </Typography>
                    <Box component="dl" sx={{ m: 0 }}>
                      {readinessMetrics.map(({ label, value }) => (
                        <Stack
                          key={label}
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                          sx={{ py: 0.75 }}
                        >
                          <Typography component="dt" variant="body2" color="text.secondary">
                            {label}
                          </Typography>
                          <Typography
                            component="dd"
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              m: 0,
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {preview.isPreparing && !previewReadiness ? (
                              <Skeleton width={56} />
                            ) : (
                              value
                            )}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Drawer>

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
            {activeRow?.statutoryTrace?.CalculationSettings?.OverrideReason && (
              <Alert severity="warning" sx={{ m: 2 }}>
                ESIC administrator override: employee {activeRow.statutoryTrace.EmployeePercentage}
                %, employer {activeRow.statutoryTrace.EmployerPercentage}%.{' '}
                {activeRow.statutoryTrace.CalculationSettings.OverrideReason} Evidence:{' '}
                {activeRow.statutoryTrace.CalculationSettings.EvidenceReference}.
              </Alert>
            )}
            {activeRow ? (
              <Stack sx={{ height: '100%', minHeight: 0 }}>
                <DrawerHeader
                  title={activeRow.employeeName || 'Staff payroll details'}
                  subtitle={`${activeRow.employeeIdentifier} • ${activeRow.employeeGroup}`}
                  helpText="Review salary, attendance, deductions, and payroll adjustments."
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
                          {formatPayrollCurrency(activeRow.fullGrossSalary)}
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
                          value: formatPayrollCurrency(activeRow.grossSalary),
                          icon: 'solar:calculator-bold-duotone',
                          color: 'primary.main',
                        },
                        {
                          label: 'Additional earnings',
                          value: formatPayrollCurrency(activeRow.additionalEarnings),
                          icon: 'solar:calculator-bold-duotone',
                          color: 'success.main',
                        },
                        {
                          label: 'Total earnings',
                          value: formatPayrollCurrency(activeRow.totalEarnings),
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
                          {activeRow.issueCodes.some((code) =>
                            [
                              'PF_APPLY_DISABLED',
                              'PF_NUMBER_MISSING',
                              'ESI_APPLY_DISABLED',
                              'ESI_NUMBER_MISSING',
                            ].includes(code)
                          ) && (
                            <HrSetupLink setup="staffPayroll" employeeId={activeRow.id} />
                          )}
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
                                        height: 'auto',
                                        minHeight: 24,
                                        py: 0.5,
                                        lineHeight: 1.5,
                                        whiteSpace: 'normal',
                                        overflowWrap: 'anywhere',
                                        textAlign: 'left',
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
                              {formatPayrollCurrency(activeRow.compensationQuotedAmount || 0)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                              Normalized Result
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {formatPayrollCurrency(
                                activeRow.compensationNormalizedProtectedAmount || 0
                              )}
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
                              {formatPayrollCurrency(activeRow.compensationTargetDifference || 0)}
                            </Typography>
                          </Grid>
                        </Grid>
                        {activeRow.compensationTargetDifference ? (
                          <Alert severity="warning" sx={{ mt: 1.5 }}>
                            Review this variance before locking. Payroll has not changed the
                            staff&apos;s effective salary automatically.
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
                              {formatPayrollCurrency(activeRow.employeeStateInsuranceWages)}
                            </Typography>
                          </Grid>
                          {activeRow.employeeStateInsuranceGovernmentContribution > 0 ? (
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary">
                                Government Contribution
                              </Typography>
                              <Typography variant="body2" fontWeight={700}>
                                {formatPayrollCurrency(
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
                                      label={`${adjustment.isEarning ? '+' : '-'}${formatPayrollCurrency(adjustment.amount)}`}
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
                        {!activeRowIsCurrent ? (
                          <Typography variant="caption" color="text.secondary">
                            Adjustments require this employee&apos;s current preview row to be
                            loaded.
                          </Typography>
                        ) : null}
                        {activeRow.status === 'LOCKED' ? (
                          <Typography variant="caption" color="text.secondary">
                            Locked payroll rows cannot be adjusted.
                          </Typography>
                        ) : activeRow.status !== 'REVIEWED' ? (
                          <Typography variant="caption" color="text.secondary">
                            Mark this payroll row reviewed before adding payroll-only adjustments.
                          </Typography>
                        ) : !canAdjustPayroll ? (
                          <Typography variant="caption" color="text.secondary">
                            You do not have permission to change payroll-only adjustments.
                          </Typography>
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
                                  disabled={!activeRowCanAdjust}
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
                        subheader={`Additional employer cost: ${formatPayrollCurrency(activeRow.employerContributionTotal)}`}
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
                size="small"
                variant="contained"
                color="error"
                loading={lockLoading}
                disabled={!canLockPayroll || !preview.isCurrent}
                onClick={async () => {
                  if (
                    !selectedMonthKey ||
                    !academicYearId ||
                    !lockableIds.length ||
                    !canLockPayroll ||
                    !preview.isCurrent
                  )
                    return;
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
