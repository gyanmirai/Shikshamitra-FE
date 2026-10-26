'use client';

import type { RootState } from 'src/redux/store';
import type {
  HrPolicyType,
  PayrollPolicy,
  HrPolicyVersion,
  AttendancePolicy,
  WorkCalendarPolicy,
  HrPolicyAssignment,
  WorkCalendarHoliday,
  EditablePolicyStatus,
  CreateUpdatePayrollPolicy,
  CreateUpdateAttendancePolicy,
  CreateUpdateWorkCalendarPolicy,
} from 'src/redux/hr/hr-policy-api';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { toDateOnly } from 'src/utils/date-only';
import { useSearchParams } from 'next/navigation';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetLeavePoliciesQuery } from 'src/redux/hr/leaveApi';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { hasGrantedPermission, hasNavigationPermission } from 'src/utils/permissions';
import { useGetGroupsQuery } from 'src/redux/calendar/GroupManagement/groupManagementApi';
import { useGetEmployeeQuery, EMPLOYEE_LIST_MAX_PAGE_SIZE } from 'src/redux/hr/employeeApi';
import {
  getHolidayToDate,
  getHolidayFromDate,
  findIncludedHolidayOverlap,
  mergeNonOverlappingHolidayRows,
} from 'src/screens/hr/policies/holiday-overlap-utils';
import {
  isPayrollPolicyUnchanged,
  filterPoliciesByArchiveView,
  isAttendancePolicyUnchanged,
  isWorkCalendarPolicyUnchanged,
} from 'src/screens/hr/policies/hr-policy-change-utils';
import {
  attendanceNumericRules,
  clampNumericPolicyInput,
  normalizeEditableDefault,
  getNumericPolicyInputError,
  sanitizeNumericPolicyInput,
  isAttendanceThresholdOrderValid,
  getAttendanceOvertimeValidationError,
} from 'src/screens/hr/policies/hr-policy-ui-utils';
import {
  useGetPolicyVersionsQuery,
  useGetPayrollPoliciesQuery,
  useClonePayrollPolicyMutation,
  useComparePolicyVersionsQuery,
  useGetAttendancePoliciesQuery,
  useGetPolicyAuditSummaryQuery,
  useGetHrEntityAuditEventsQuery,
  useGetHrPolicyAssignmentsQuery,
  usePreviewPolicyImpactMutation,
  useCreatePayrollPolicyMutation,
  useGetPolicyRestorePreviewQuery,
  useGetWorkCalendarPoliciesQuery,
  useCloneAttendancePolicyMutation,
  useUnarchivePayrollPolicyMutation,
  useCreateAttendancePolicyMutation,
  useCloneWorkCalendarPolicyMutation,
  useGetPolicyAssignmentPreviewQuery,
  useCreateWorkCalendarPolicyMutation,
  useRestorePolicyVersionDraftMutation,
  useUnarchiveAttendancePolicyMutation,
  useGetPolicyHolidayImpactPreviewQuery,
  useUnarchiveWorkCalendarPolicyMutation,
  useCreatePayrollPolicyWithTokenMutation,
  useDeletePayrollPolicyWithTokenMutation,
  useUpdatePayrollPolicyWithTokenMutation,
  usePreviewPolicyAssignmentImpactMutation,
  useLazyGetWorkCalendarPolicyHolidaysQuery,
  useCreateAttendancePolicyWithTokenMutation,
  useDeleteAttendancePolicyWithTokenMutation,
  useUpdateAttendancePolicyWithTokenMutation,
  useSetDefaultPayrollPolicyWithTokenMutation,
  useCreateHrPolicyAssignmentWithTokenMutation,
  useDeleteHrPolicyAssignmentWithTokenMutation,
  useDeleteWorkCalendarPolicyWithTokenMutation,
  useUpdateHrPolicyAssignmentWithTokenMutation,
  useUpdateWorkCalendarPolicyWithTokenMutation,
  useSetDefaultAttendancePolicyWithTokenMutation,
  useLazyGetWorkCalendarHolidayImportPreviewQuery,
} from 'src/redux/hr/hr-policy-api';

import {
  defaultPayrollForm,
  defaultCalendarForm,
  defaultAttendanceForm,
  defaultAssignmentForm,
  ATTENDANCE_ADVANCED_KEYS,
} from '../hr-policy-workspace.constants';
import {
  getItems,
  toDateInput,
  formatRange,
  optionLabel,
  numberOrNull,
  sortWeekDays,
  holidayRowKey,
  getErrorMessage,
  mergeHolidayRows,
  getHolidayDayCount,
  toApiWeeklyPattern,
  normalizeWeeklyRule,
  getWeeklyOffsForRule,
  getAssignmentConflict,
  buildManualMonthDaysMap,
  getLookupOrganizationNames,
  getAcademicYearMonthRanges,
  getDefaultPolicySetupState,
  buildManualMonthDaysPayload,
  payrollManualMonthDaysToMap,
  formatHolidayOverlapMessage,
  selectSingleActiveDefaultPolicy,
  getAssignmentFormValidationError,
  normalizePayrollDayCalculationType,
  getEffectiveAssignmentLeavePolicyId,
  getHolidayAcademicYearValidationError,
} from '../hr-policy-workspace-utils';

import type { AttendanceNumericField } from '../hr-policy-ui-utils';
import type {
  DrawerKind,
  DrawerState,
  AuditTarget,
  PayrollForm,
  WorkspaceTab,
  LookupOption,
  VersionTarget,
  AttendanceForm,
  AssignmentForm,
  WorkCalendarForm,
  ManualHolidayForm,
  PolicyArchiveView,
  AssignmentTableRow,
  PendingImpactAction,
  RestoreVersionState,
  HolidayReviewFilter,
  PolicyOperationState,
  HrPolicyImpactPreview,
  PolicyAssignmentTargetType,
  HrPolicyAssignmentConflict,
} from '../types/hr-policy-workspace.types';

// --- Re-export AttendanceNumericField so callers don't need to import from ui-utils --

export type { AttendanceNumericField };

function findTab(
  tabs: Array<{ value: WorkspaceTab; disabled?: boolean }>,
  value?: WorkspaceTab | null
) {
  return tabs.find((item) => item.value === value);
}

function isDisabledTab(
  tabs: Array<{ value: WorkspaceTab; disabled?: boolean }>,
  value?: WorkspaceTab | null
) {
  return Boolean(findTab(tabs, value)?.disabled);
}

function resolveInitialTab(
  tabs: Array<{ value: WorkspaceTab; disabled?: boolean }>,
  focus?: WorkspaceTab,
  queryTab?: WorkspaceTab | null
): WorkspaceTab {
  if (focus && findTab(tabs, focus) && !isDisabledTab(tabs, focus)) return focus;
  if (queryTab && findTab(tabs, queryTab) && !isDisabledTab(tabs, queryTab)) return queryTab;
  return 'calendars';
}

// --- Attendance advanced helpers ----------------------------------------------

function hasCustomAttendanceAdvancedSettings(form: AttendanceForm): boolean {
  const defaults = defaultAttendanceForm(form.workCalendarPolicyId);
  return ATTENDANCE_ADVANCED_KEYS.some((key) => form[key] !== defaults[key]);
}

function toEditablePolicyStatus(status?: string): EditablePolicyStatus {
  return status === 'active' ? 'active' : 'draft';
}

function getLeavePolicyName(item: any): string {
  return item?.policyTitle || item?.name || item?.title || item?.id || '-';
}

function isActiveLeavePolicy(item: any): boolean {
  return String(item?.status || '').toLowerCase() === 'active' || item?.isActive === true;
}

// --- Hook ---------------------------------------------------------------------

export function useHRPolicyWorkspace({
  focus,
  tabs,
}: {
  focus?: WorkspaceTab;
  tabs: Array<{ value: WorkspaceTab; label: string; icon: string; disabled?: boolean }>;
}) {
  const muiTheme = useTheme();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as WorkspaceTab | null;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const academicYearId = currentYear?.id;

  // --- Navigation -----------------------------------------------------------
  const [tab, setTab] = useState<WorkspaceTab>(() => resolveInitialTab(tabs, focus, queryTab));

  // --- Drawer ---------------------------------------------------------------
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [formError, setFormError] = useState('');

  // --- Calendar form state --------------------------------------------------
  const [calendarForm, setCalendarForm] = useState<WorkCalendarForm>(
    defaultCalendarForm(currentYear?.startDate)
  );
  const [holidayReviewFilters, setHolidayReviewFilters] = useState<{
    search: string;
    month: string;
    source: HolidayReviewFilter;
  }>({ search: '', month: '', source: 'all' });
  const [centralHolidayPreviewRows, setCentralHolidayPreviewRows] = useState<WorkCalendarHoliday[]>(
    []
  );
  const [holidayReviewError, setHolidayReviewError] = useState('');
  const [holidayReviewInfo, setHolidayReviewInfo] = useState('');
  const [manualHolidayForm, setManualHolidayForm] = useState<ManualHolidayForm>({
    holidayName: '',
    fromDate: '',
    toDate: '',
    notes: '',
  });
  const [manualHolidayDialogOpen, setManualHolidayDialogOpen] = useState(false);
  const [editingManualHolidayIndex, setEditingManualHolidayIndex] = useState<number | null>(null);

  // --- Payroll form state ----------------------------------------------------
  const [payrollForm, setPayrollForm] = useState<PayrollForm>(defaultPayrollForm());

  // --- Attendance form state -------------------------------------------------
  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>(defaultAttendanceForm());
  const [attendanceAdvancedMode, setAttendanceAdvancedMode] = useState(false);

  // --- Assignment form state -------------------------------------------------
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>(
    defaultAssignmentForm(currentYear?.startDate)
  );
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentDateError, setAssignmentDateError] = useState('');
  const [assignmentConflict, setAssignmentConflict] = useState<HrPolicyAssignmentConflict | null>(
    null
  );

  // --- Archive view ----------------------------------------------------------
  const [policyArchiveView, setPolicyArchiveView] = useState<Record<DrawerKind, PolicyArchiveView>>(
    { calendar: 'current', payroll: 'current', attendance: 'current', assignment: 'current' }
  );

  // --- Impact drawer state ---------------------------------------------------
  const [impactDrawerOpen, setImpactDrawerOpen] = useState(false);
  const [impactPreview, setImpactPreview] = useState<HrPolicyImpactPreview | null>(null);
  const [impactPreviewError, setImpactPreviewError] = useState('');
  const [pendingImpactAction, setPendingImpactAction] = useState<PendingImpactAction>(null);

  // --- Audit / Version state -------------------------------------------------
  const [auditTarget, setAuditTarget] = useState<AuditTarget>(null);
  const [versionTarget, setVersionTarget] = useState<VersionTarget>(null);
  const [compareVersionIds, setCompareVersionIds] = useState({ from: '', to: '' });
  const [versionFilters, setVersionFilters] = useState({ search: '', action: 'all' });
  const [versionPage, setVersionPage] = useState({ number: 1, size: 10 });
  useEffect(() => {
    setVersionPage((current) => ({ ...current, number: 1 }));
  }, [versionTarget?.policyId, versionFilters.search, versionFilters.action]);
  const [restoreVersion, setRestoreVersion] = useState<RestoreVersionState>(null);
  const [employeeLookupSearch, setEmployeeLookupSearch] = useState('');

  // --- Operation overlay state -----------------------------------------------
  const [activePolicyOperation, setActivePolicyOperation] = useState<PolicyOperationState>(null);

  // --- Holiday service filters -----------------------------------------------
  const [holidayFilters, setHolidayFilters] = useState({
    workCalendarPolicyId: '',
    payrollPolicyId: '',
    attendancePolicyId: '',
    month: dayjs().format('YYYY-MM'),
    fromDate: '',
    toDate: '',
  });
  // --- API Queries ----------------------------------------------------------
  const listArgs = { academicYearId, maxResultCount: 200, isArchived: false };
  const [assignmentPage, setAssignmentPage] = useState({ number: 1, size: 20 });
  useEffect(() => {
    setAssignmentPage((current) => ({ ...current, number: 1 }));
  }, [academicYearId, assignmentSearch]);
  const assignmentListArgs = {
    academicYearId,
    maxResultCount: assignmentPage.size,
    skipCount: (assignmentPage.number - 1) * assignmentPage.size,
    search: assignmentSearch,
  };

  const { currentData: employees, isFetching: employeesLoading } = useGetEmployeeQuery(
    { page: 1, pageSize: EMPLOYEE_LIST_MAX_PAGE_SIZE },
    { skip: !academicYearId }
  );
  const { currentData: employeeSearchResults, isFetching: employeeSearchLoading } =
    useGetEmployeeQuery(
      {
        page: 1,
        pageSize: 100,
        search: employeeLookupSearch.trim(),
      },
      { skip: !academicYearId || employeeLookupSearch.trim().length < 2 }
    );
  const { data: groups, isFetching: groupsLoading } = useGetGroupsQuery(
    { academicYearId, maxResultCount: 200, includeDetails: false },
    { skip: !academicYearId }
  );
  const {
    data: workCalendarPolicies,
    isFetching: calendarsLoading,
    error: calendarsError,
  } = useGetWorkCalendarPoliciesQuery(listArgs, { skip: !academicYearId });
  const {
    currentData: payrollPolicies,
    isFetching: payrollLoading,
    error: payrollError,
  } = useGetPayrollPoliciesQuery(listArgs, { skip: !academicYearId });
  const {
    currentData: attendancePolicies,
    isFetching: attendanceLoading,
    error: attendanceError,
  } = useGetAttendancePoliciesQuery(listArgs, { skip: !academicYearId });
  const {
    currentData: leavePolicyData,
    isFetching: leavePoliciesLoading,
    error: leavePoliciesError,
  } = useGetLeavePoliciesQuery(
    { academicYearId, page: 1, pageSize: 500 },
    { skip: !academicYearId }
  );
  const {
    data: assignments,
    isFetching: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
    tableProps: assignmentTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-policy-assignments',
      query: assignmentListArgs,
      page: assignmentPage.number - 1,
      size: assignmentPage.size,
      resetPage: () => setAssignmentPage((current) => ({ ...current, number: 1 })),
      skip: !academicYearId,
    },
    useGetHrPolicyAssignmentsQuery(assignmentListArgs, { skip: !academicYearId })
  );

  const policyAuditTarget =
    auditTarget?.policyType && auditTarget.policyId
      ? { policyType: auditTarget.policyType, id: auditTarget.policyId }
      : null;
  const { currentData: auditSummary, isFetching: auditLoading } = useGetPolicyAuditSummaryQuery(
    policyAuditTarget || { policyType: 'work_calendar', id: '' },
    { skip: !policyAuditTarget }
  );
  const { currentData: auditEvents, isFetching: auditEventsLoading } =
    useGetHrEntityAuditEventsQuery(
      auditTarget
        ? { entityType: auditTarget.entityType, entityId: auditTarget.entityId, maxResultCount: 50 }
        : { entityType: 'work_calendar_policy', entityId: '' },
      { skip: !auditTarget }
    );
  const {
    currentData: versionHistory,
    isFetching: versionHistoryLoading,
    tableProps: versionTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-policy-versions',
      query: {
        policyType: versionTarget?.policyType,
        policyId: versionTarget?.policyId,
        search: versionFilters.search,
        action: versionFilters.action,
      },
      page: versionPage.number - 1,
      size: versionPage.size,
      resetPage: () => setVersionPage((current) => ({ ...current, number: 1 })),
      skip: !versionTarget,
    },
    useGetPolicyVersionsQuery(
      versionTarget
        ? {
            policyType: versionTarget.policyType,
            policyId: versionTarget.policyId,
            maxResultCount: versionPage.size,
            skipCount: (versionPage.number - 1) * versionPage.size,
            search: versionFilters.search,
            action: versionFilters.action,
          }
        : { policyType: 'work_calendar', policyId: '' },
      { skip: !versionTarget }
    )
  );
  const { currentData: versionCompare, isFetching: versionCompareLoading } =
    useComparePolicyVersionsQuery(
      versionTarget && compareVersionIds.from && compareVersionIds.to
        ? {
            policyType: versionTarget.policyType,
            policyId: versionTarget.policyId,
            fromVersionId: compareVersionIds.from,
            toVersionId: compareVersionIds.to,
          }
        : { policyType: 'work_calendar', policyId: '', fromVersionId: '', toVersionId: '' },
      { skip: !versionTarget || !compareVersionIds.from || !compareVersionIds.to }
    );
  const { currentData: restorePreview, isFetching: restorePreviewLoading } =
    useGetPolicyRestorePreviewQuery(
      versionTarget && restoreVersion
        ? {
            policyType: versionTarget.policyType,
            policyId: versionTarget.policyId,
            versionId: restoreVersion.version.id,
          }
        : { policyType: 'work_calendar', policyId: '', versionId: '' },
      { skip: !versionTarget || !restoreVersion }
    );

  // const selectedHolidayCalendarId =
  //   holidayFilters.workCalendarPolicyId ||
  //   useMemo(
  //     () =>
  //       (workCalendarPolicies?.items || []).find((c) => c.status === 'active')?.id ||
  //       (workCalendarPolicies?.items || [])[0]?.id,
  //     [workCalendarPolicies?.items]
  //   ) ||
  //   '';

  // This is resolved inline below after memos are declared - see derived values section.

  const {
    data: holidayImpact,
    isFetching: holidayImpactLoading,
    error: holidayImpactError,
  } = useGetPolicyHolidayImpactPreviewQuery(
    {
      academicYearId,
      workCalendarPolicyId: holidayFilters.workCalendarPolicyId || undefined,
      payrollPolicyId: holidayFilters.payrollPolicyId || undefined,
      attendancePolicyId: holidayFilters.attendancePolicyId || undefined,
      month: holidayFilters.month || undefined,
      fromDate: holidayFilters.month ? undefined : holidayFilters.fromDate || undefined,
      toDate: holidayFilters.month ? undefined : holidayFilters.toDate || undefined,
    },
    {
      skip:
        !academicYearId || !holidayFilters.payrollPolicyId || !holidayFilters.attendancePolicyId,
    }
  );

  const {
    currentData: assignmentPreview,
    isFetching: assignmentPreviewLoading,
    error: assignmentPreviewError,
  } = useGetPolicyAssignmentPreviewQuery(
    {
      academicYearId,
      date: assignmentForm.effectiveFrom,
      employeeId: assignmentForm.targetType === 'employee' ? assignmentForm.targetKey : undefined,
      groupId: assignmentForm.targetType === 'group' ? assignmentForm.targetKey : undefined,
    },
    {
      skip:
        !drawer ||
        drawer.kind !== 'assignment' ||
        !academicYearId ||
        !assignmentForm.effectiveFrom ||
        !assignmentForm.targetKey,
    }
  );

  // --- API Mutations --------------------------------------------------------
  const [createWorkCalendarPolicy, createCalendarState] = useCreateWorkCalendarPolicyMutation();
  const [updateWorkCalendarPolicyWithToken, updateCalendarState] =
    useUpdateWorkCalendarPolicyWithTokenMutation();
  const [cloneWorkCalendarPolicy, cloneCalendarState] = useCloneWorkCalendarPolicyMutation();
  const [deleteWorkCalendarPolicyWithToken, deleteCalendarState] =
    useDeleteWorkCalendarPolicyWithTokenMutation();
  const [unarchiveWorkCalendarPolicy, unarchiveCalendarState] =
    useUnarchiveWorkCalendarPolicyMutation();
  const [loadCalendarHolidays, loadCalendarHolidaysState] =
    useLazyGetWorkCalendarPolicyHolidaysQuery();
  const [loadHolidayImportPreview, loadHolidayImportPreviewState] =
    useLazyGetWorkCalendarHolidayImportPreviewQuery();

  const [createPayrollPolicy, createPayrollState] = useCreatePayrollPolicyMutation();
  const [createPayrollPolicyWithToken] = useCreatePayrollPolicyWithTokenMutation();
  const [updatePayrollPolicyWithToken, updatePayrollState] =
    useUpdatePayrollPolicyWithTokenMutation();
  const [clonePayrollPolicy, clonePayrollState] = useClonePayrollPolicyMutation();
  const [deletePayrollPolicyWithToken, deletePayrollState] =
    useDeletePayrollPolicyWithTokenMutation();
  const [unarchivePayrollPolicy, unarchivePayrollState] = useUnarchivePayrollPolicyMutation();

  const [createAttendancePolicy, createAttendanceState] = useCreateAttendancePolicyMutation();
  const [createAttendancePolicyWithToken] = useCreateAttendancePolicyWithTokenMutation();
  const [updateAttendancePolicyWithToken, updateAttendanceState] =
    useUpdateAttendancePolicyWithTokenMutation();
  const [cloneAttendancePolicy, cloneAttendanceState] = useCloneAttendancePolicyMutation();
  const [deleteAttendancePolicyWithToken, deleteAttendanceState] =
    useDeleteAttendancePolicyWithTokenMutation();
  const [unarchiveAttendancePolicy, unarchiveAttendanceState] =
    useUnarchiveAttendancePolicyMutation();

  const [setDefaultPayrollPolicyWithToken, payrollDefaultState] =
    useSetDefaultPayrollPolicyWithTokenMutation();
  const [setDefaultAttendancePolicyWithToken, attendanceDefaultState] =
    useSetDefaultAttendancePolicyWithTokenMutation();

  const [createHrPolicyAssignmentWithToken, createAssignmentState] =
    useCreateHrPolicyAssignmentWithTokenMutation();
  const [updateHrPolicyAssignmentWithToken, updateAssignmentState] =
    useUpdateHrPolicyAssignmentWithTokenMutation();
  const [deleteHrPolicyAssignmentWithToken, deleteAssignmentState] =
    useDeleteHrPolicyAssignmentWithTokenMutation();

  const [previewPolicyImpact, previewPolicyImpactState] = usePreviewPolicyImpactMutation();
  const [previewPolicyAssignmentImpact, previewPolicyAssignmentImpactState] =
    usePreviewPolicyAssignmentImpactMutation();
  const [restorePolicyVersionDraft, restoreVersionState] = useRestorePolicyVersionDraftMutation();

  // --- Derived values (memoized) --------------------------------------------

  /**
   * Memoization Justification:
   * Prevents new array reference on each render when the RTK Query response object
   * hasn't changed. Downstream computed values (visibleCalendars, archivedCalendarCount,
   * activeCalendars) would otherwise recompute on every render even when no data changed.
   */
  const calendars = useMemo(() => workCalendarPolicies?.items || [], [workCalendarPolicies?.items]);

  /**
   * Memoization Justification:
   * Same as `calendars` - prevents cascading recomputation of payroll-derived values
   * (visiblePayroll, archivedPayrollCount, defaultPayroll) when the parent renders.
   */
  const payroll = useMemo(() => payrollPolicies?.items || [], [payrollPolicies?.items]);

  /**
   * Memoization Justification:
   * Same pattern as payroll/calendars - stable array reference prevents unnecessary
   * re-renders of the attendance table and derived default policy lookup.
   */
  const attendance = useMemo(() => attendancePolicies?.items || [], [attendancePolicies?.items]);
  const leavePolicies = useMemo(() => getItems<any>(leavePolicyData), [leavePolicyData]);

  const visibleCalendars = filterPoliciesByArchiveView(calendars, policyArchiveView.calendar);
  const visiblePayroll = filterPoliciesByArchiveView(payroll, policyArchiveView.payroll);
  const visibleAttendance = filterPoliciesByArchiveView(attendance, policyArchiveView.attendance);
  const archivedCalendarCount = calendars.filter((item) => item.status === 'archived').length;
  const archivedPayrollCount = payroll.filter((item) => item.status === 'archived').length;
  const archivedAttendanceCount = attendance.filter((item) => item.status === 'archived').length;
  const activeCalendars = calendars.filter((item) => item.status === 'active');
  const activePayroll = payroll.filter((item) => item.status === 'active');
  const activeAttendance = attendance.filter((item) => item.status === 'active');
  const activeLeavePolicies = leavePolicies.filter(isActiveLeavePolicy);

  const isPolicyOperationActive = Boolean(activePolicyOperation);

  /**
   * Memoization Justification:
   * MUI Drawer's `transitionDuration` prop requires a stable object reference.
   * Recreating this object every render causes React to treat it as new props and
   * potentially re-trigger CSS transition recalculations. Memoized against the
   * theme transition durations which change only on theme re-mount.
   */
  const drawerTransitionDuration = useMemo(
    () => ({
      enter: muiTheme.transitions.duration.enteringScreen + 100,
      exit: muiTheme.transitions.duration.leavingScreen,
    }),
    [muiTheme.transitions.duration.enteringScreen, muiTheme.transitions.duration.leavingScreen]
  );

  const defaultPayroll = selectSingleActiveDefaultPolicy(activePayroll);
  const defaultAttendancePolicy = selectSingleActiveDefaultPolicy(activeAttendance);
  const defaultLeavePolicy = selectSingleActiveDefaultPolicy(activeLeavePolicies);
  const getSetupState = (data: any, loading: boolean, error: unknown, items: any[]) =>
    getDefaultPolicySetupState({ data, loading, error, items });
  const leaveSetupState = getSetupState(
    leavePolicyData,
    leavePoliciesLoading,
    leavePoliciesError,
    activeLeavePolicies
  );
  const payrollSetupState = getSetupState(
    payrollPolicies,
    payrollLoading,
    payrollError,
    activePayroll
  );
  const attendanceSetupState = getSetupState(
    attendancePolicies,
    attendanceLoading,
    attendanceError,
    activeAttendance
  );
  const canOpenLeavePolicies = hasNavigationPermission(
    permissions,
    hrPermissions.policies.leavePolicies
  );
  const canOpenPayrollPolicies = hasNavigationPermission(
    permissions,
    hrPermissions.policies.payroll
  );
  const canOpenAttendancePolicies = hasNavigationPermission(
    permissions,
    hrPermissions.policies.attendance
  );

  const employeeOptions = useMemo(() => {
    const options = [
      ...getItems<LookupOption>(employees),
      ...getItems<LookupOption>(employeeSearchResults),
    ];
    return Array.from(new Map(options.map((option) => [option.id, option])).values());
  }, [employeeSearchResults, employees]);
  const groupOptions = getItems<LookupOption>(groups);

  /**
   * Memoization Justification:
   * Maps assignments and resolves their display values across policy and staff lookups.
   * Without memoization this runs
   * on every keystroke in any unrelated form field. Dependency list covers all inputs
   * that affect the output: assignment data and policy/staff lookups.
   */
  const assignmentRows = useMemo<AssignmentTableRow[]>(() => {
    const payrollNameById = new Map(payroll.map((item) => [item.id, item.name]));
    const attendanceNameById = new Map(attendance.map((item) => [item.id, item.name]));
    const leaveNameById = new Map(leavePolicies.map((item) => [item.id, getLeavePolicyName(item)]));
    const employeeById = new Map(employeeOptions.map((item) => [item.id, item]));

    return (assignments?.items || []).map((item) => {
      const employeeOption =
        item.targetType === 'employee' ? employeeById.get(item.targetKey) : undefined;
      const target =
        item.targetType === 'employee'
          ? item.targetDisplayName || optionLabel(employeeOption) || 'Unknown staff'
          : item.targetDisplayName || item.targetKey;
      const organization =
        item.targetType === 'employee'
          ? item.targetOrganizationNames?.filter(Boolean).join(', ') ||
            getLookupOrganizationNames(employeeOption).join(', ') ||
            '-'
          : '-';

      return {
        id: item.id,
        assignment: item,
        target,
        targetKey: item.targetKey,
        organization,
        sourceType: item.targetType === 'employee' ? 'Staff' : 'Group',
        payrollPolicyName:
          item.payrollPolicyName ||
          payrollNameById.get(item.payrollPolicyId) ||
          item.payrollPolicyId,
        attendancePolicyName:
          item.attendancePolicyName ||
          attendanceNameById.get(item.attendancePolicyId) ||
          item.attendancePolicyId,
        leavePolicyName:
          item.leavePolicyName ||
          (item.leavePolicyId
            ? leaveNameById.get(item.leavePolicyId) || item.leavePolicyId
            : defaultLeavePolicy
              ? `${getLeavePolicyName(defaultLeavePolicy)} (default)`
              : 'Default leave policy unavailable'),
        effective: formatRange(item.effectiveFrom, item.effectiveTo),
        priority: item.priority,
        status: item.isActive ? 'Active' : 'Inactive',
        reason: item.assignmentReason || '-',
      };
    });
  }, [assignments?.items, attendance, defaultLeavePolicy, employeeOptions, leavePolicies, payroll]);

  // --- Permissions -----------------------------------------------------------
  const canCreatePolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.create);
  const canEditPolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.edit);
  const canArchivePolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.archive);
  const canSetDefaultPolicy = hasGrantedPermission(
    permissions,
    hrPermissions.policyActions.setDefault
  );
  const canAssignPolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.assign);
  const canClonePolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.clone);
  const canPreviewImpact = hasGrantedPermission(
    permissions,
    hrPermissions.policyActions.previewImpact
  );
  const canViewAudit = hasGrantedPermission(permissions, hrPermissions.policyActions.viewAudit);

  // --- Auto-seed version compare on first load ------------------------------
  useEffect(() => {
    const versions = versionHistory?.items || [];
    if (!versionTarget || compareVersionIds.from || compareVersionIds.to || versions.length < 2) {
      return;
    }
    const latest = versions[0];
    const previous = versions[1];
    if (latest?.id && previous?.id) {
      setCompareVersionIds({ from: previous.id, to: latest.id });
    }
  }, [compareVersionIds.from, compareVersionIds.to, versionHistory?.items, versionTarget]);

  // --- Payload builders -----------------------------------------------------

  const buildCalendarPayload = useCallback((): CreateUpdateWorkCalendarPolicy | null => {
    if (!academicYearId) return null;
    const customWeeklyOffs = sortWeekDays(calendarForm.customWeeklyOffs);
    const weeklyOffs = getWeeklyOffsForRule(calendarForm.weeklyOffPattern, customWeeklyOffs);
    return {
      academicYearId,
      name: calendarForm.name.trim(),
      status: calendarForm.status,
      effectiveFrom: calendarForm.effectiveFrom,
      effectiveTo: calendarForm.effectiveTo || null,
      weeklyOffPattern: toApiWeeklyPattern(calendarForm.weeklyOffPattern),
      customWeeklyOffs: weeklyOffs,
      holidaySyncMode: 'snapshot',
      holidays: calendarForm.holidays.map((holiday) => ({
        ...holiday,
        academicYearId,
        date: toDateOnly(getHolidayFromDate(holiday)),
        fromDate: toDateOnly(getHolidayFromDate(holiday)),
        toDate: toDateOnly(getHolidayToDate(holiday)),
        dayCount: getHolidayDayCount(holiday),
      })),
    };
  }, [academicYearId, calendarForm]);

  const buildPayrollPayload = useCallback((): CreateUpdatePayrollPolicy | null => {
    if (!academicYearId) return null;
    const dayCalculationType = normalizePayrollDayCalculationType(payrollForm.dayCalculationType);
    const manualMonthDaysResult = buildManualMonthDaysPayload({
      academicYearStart: currentYear?.startDate,
      academicYearEnd: currentYear?.endDate,
      manualMonthDays: payrollForm.manualMonthDays,
    });
    return {
      academicYearId,
      workCalendarPolicyId: payrollForm.workCalendarPolicyId,
      name: payrollForm.name.trim(),
      status: payrollForm.status,
      isDefault: normalizeEditableDefault(payrollForm.status, payrollForm.isDefault),
      dayCalculationType,
      manualDays: null,
      manualMonthDays: dayCalculationType === 'manual-days' ? manualMonthDaysResult.items : [],
      saturdayWorkPolicy: payrollForm.saturdayWorkPolicy,
      holidayOverrides: (drawer?.item as PayrollPolicy | undefined)?.holidayOverrides || [],
    };
  }, [academicYearId, currentYear, drawer?.item, payrollForm]);

  const buildAttendancePayload = useCallback((): CreateUpdateAttendancePolicy | null => {
    if (!academicYearId) return null;
    const formToSave = attendanceForm;
    const penaltyDeductionAmount =
      formToSave.penaltyType === 'salary_deduction'
        ? numberOrNull(formToSave.penaltyDeductionAmount)
        : null;
    return {
      academicYearId,
      workCalendarPolicyId: formToSave.workCalendarPolicyId,
      name: formToSave.name.trim(),
      status: formToSave.status,
      isDefault: normalizeEditableDefault(formToSave.status, formToSave.isDefault),
      captureMode: formToSave.captureMode,
      fullDayThresholdPercentage: Number(formToSave.fullDayThresholdPercentage),
      halfDayThresholdPercentage: Number(formToSave.halfDayThresholdPercentage),
      absentThresholdPercentage: Number(formToSave.absentThresholdPercentage),
      missingPunchBehavior: formToSave.missingPunchBehavior,
      manualCorrectionAllowed: formToSave.manualCorrectionAllowed,
      graceTime: Number(formToSave.graceTime || 0),
      maxLateAllowedPerMonth: Number(formToSave.maxLateAllowedPerMonth || 0),
      penaltyType: formToSave.penaltyType,
      penaltyCountThreshold: Number(formToSave.penaltyCountThreshold || 0),
      penaltyDeductionAmount,
      earlyExitEnabled: formToSave.earlyExitEnabled,
      earlyExitGraceTime: Number(formToSave.earlyExitGraceTime || 0),
      overtimeEnabled: formToSave.overtimeEnabled,
      overtimeRate: formToSave.overtimeEnabled ? formToSave.overtimeRate || 'flat' : null,
      minOvertimeMinutes: numberOrNull(formToSave.minOvertimeMinutes),
      holidayWorkBehavior: formToSave.holidayWorkBehavior,
      payrollPreviewEnabled: formToSave.payrollPreviewEnabled,
    };
  }, [academicYearId, attendanceForm]);

  // --- Diff checks ----------------------------------------------------------
  const calendarPayload = buildCalendarPayload();
  const payrollPayload = buildPayrollPayload();
  const attendancePayload = buildAttendancePayload();

  const currentCalendarUnchanged = Boolean(
    drawer?.kind === 'calendar' &&
    drawer.mode === 'edit' &&
    drawer.item &&
    calendarPayload &&
    isWorkCalendarPolicyUnchanged(drawer.item as WorkCalendarPolicy, calendarPayload)
  );
  const currentPayrollUnchanged = Boolean(
    drawer?.kind === 'payroll' &&
    drawer.mode === 'edit' &&
    drawer.item &&
    payrollPayload &&
    isPayrollPolicyUnchanged(drawer.item as PayrollPolicy, payrollPayload)
  );
  const currentAttendanceUnchanged = Boolean(
    drawer?.kind === 'attendance' &&
    drawer.mode === 'edit' &&
    drawer.item &&
    attendancePayload &&
    isAttendancePolicyUnchanged(drawer.item as AttendancePolicy, attendancePayload)
  );

  // --- Operation runner -----------------------------------------------------
  const runPolicyOperation = async <T>(
    operation: Exclude<PolicyOperationState, null>,
    task: () => Promise<T>
  ): Promise<T | undefined> => {
    if (isPolicyOperationActive) return undefined;
    setActivePolicyOperation(operation);
    try {
      return await task();
    } finally {
      setActivePolicyOperation(null);
    }
  };

  // --- Drawer open / close --------------------------------------------------
  const clearDrawer = useCallback(() => {
    setDrawer(null);
    setFormError('');
    setAssignmentDateError('');
    setAssignmentConflict(null);
  }, []);

  // Used only after explicit discard consent (or a verified clean editor), so a
  // navigation action can await successful closure without opening a second prompt.
  const discardDrawer = useCallback(() => {
    if (isPolicyOperationActive) return false;
    clearDrawer();
    return true;
  }, [clearDrawer, isPolicyOperationActive]);
  const closeDrawer = useCallback(() => {
    discardDrawer();
  }, [discardDrawer]);

  const openCalendarDrawer = useCallback(
    async (item?: WorkCalendarPolicy) => {
      setFormError('');
      const customWeeklyOffs = sortWeekDays(item?.customWeeklyOffs || []);
      setHolidayReviewFilters({ search: '', month: '', source: 'all' });
      setHolidayReviewError('');
      setHolidayReviewInfo('');
      setCentralHolidayPreviewRows([]);
      setManualHolidayForm({ holidayName: '', fromDate: '', toDate: '', notes: '' });
      setManualHolidayDialogOpen(false);
      setEditingManualHolidayIndex(null);
      const holidays = item?.id
        ? item.holidays?.length
          ? item.holidays
          : await loadCalendarHolidays({ id: item.id })
              .unwrap()
              .catch(() => [])
        : [];
      setDrawer({
        kind: 'calendar',
        mode: item ? 'edit' : 'create',
        item: item ? { ...item, holidays } : undefined,
      });
      setCalendarForm(
        item
          ? {
              name: item.name,
              status: toEditablePolicyStatus(item.status),
              effectiveFrom: toDateInput(item.effectiveFrom),
              effectiveTo: toDateInput(item.effectiveTo),
              weeklyOffPattern: normalizeWeeklyRule(item.weeklyOffPattern, customWeeklyOffs),
              customWeeklyOffs,
              holidaySyncMode: 'snapshot',
              holidays,
            }
          : defaultCalendarForm(currentYear?.startDate)
      );

      if (academicYearId) {
        try {
          const previewRows = await loadHolidayImportPreview({ academicYearId }).unwrap();
          setCentralHolidayPreviewRows(previewRows);
          if (!item && previewRows.length === 0) {
            setHolidayReviewInfo(
              'No central holidays found for this academic year. Add manual holidays or create holidays in Calendar first.'
            );
          }
        } catch (error) {
          setHolidayReviewError(
            getErrorMessage(error, 'Could not load central Calendar holidays.')
          );
        }
      }
    },
    [academicYearId, currentYear, loadCalendarHolidays, loadHolidayImportPreview]
  );

  const openPayrollDrawer = useCallback(
    (item?: PayrollPolicy) => {
      setFormError('');
      const existingManualMonthDays = item
        ? buildManualMonthDaysMap({
            academicYearStart: currentYear?.startDate,
            academicYearEnd: currentYear?.endDate,
            existing: payrollManualMonthDaysToMap(item.manualMonthDays || []),
            fallbackDays: item.manualDays,
          })
        : {};
      setPayrollForm(
        item
          ? {
              name: item.name,
              status: toEditablePolicyStatus(item.status),
              workCalendarPolicyId: item.workCalendarPolicyId,
              isDefault: item.isDefault,
              dayCalculationType: normalizePayrollDayCalculationType(item.dayCalculationType),
              manualMonthDays: existingManualMonthDays,
              saturdayWorkPolicy: item.saturdayWorkPolicy,
            }
          : defaultPayrollForm(activeCalendars[0]?.id || '')
      );
      setDrawer({ kind: 'payroll', mode: item ? 'edit' : 'create', item });
    },
    [activeCalendars, currentYear]
  );

  const openAttendanceDrawer = useCallback(
    (item?: AttendancePolicy) => {
      setFormError('');
      const nextForm = item
        ? {
            name: item.name,
            status: toEditablePolicyStatus(item.status),
            workCalendarPolicyId: item.workCalendarPolicyId,
            isDefault: item.isDefault,
            captureMode: item.captureMode || 'integrated',
            fullDayThresholdPercentage: String(item.fullDayThresholdPercentage),
            halfDayThresholdPercentage: String(item.halfDayThresholdPercentage),
            absentThresholdPercentage: String(item.absentThresholdPercentage),
            missingPunchBehavior: item.missingPunchBehavior,
            manualCorrectionAllowed: item.manualCorrectionAllowed,
            graceTime: String(item.graceTime),
            maxLateAllowedPerMonth: String(item.maxLateAllowedPerMonth),
            penaltyType: item.penaltyType,
            penaltyCountThreshold: String(item.penaltyCountThreshold),
            penaltyDeductionAmount:
              item.penaltyDeductionAmount == null ? '' : String(item.penaltyDeductionAmount),
            earlyExitEnabled: item.earlyExitEnabled,
            earlyExitGraceTime: String(item.earlyExitGraceTime),
            overtimeEnabled: item.overtimeEnabled,
            overtimeRate: item.overtimeRate || '',
            minOvertimeMinutes:
              item.minOvertimeMinutes == null ? '' : String(item.minOvertimeMinutes),
            holidayWorkBehavior: item.holidayWorkBehavior,
            payrollPreviewEnabled: item.payrollPreviewEnabled,
          }
        : defaultAttendanceForm(activeCalendars[0]?.id || '');
      setAttendanceForm(nextForm);
      setAttendanceAdvancedMode(item ? hasCustomAttendanceAdvancedSettings(nextForm) : false);
      setDrawer({ kind: 'attendance', mode: item ? 'edit' : 'create', item });
    },
    [activeCalendars]
  );

  const openAssignmentDrawer = useCallback(
    (item?: HrPolicyAssignment, mode: 'edit' | 'view' = 'edit') => {
      setFormError('');
      setAssignmentDateError('');
      setAssignmentConflict(null);
      setEmployeeLookupSearch(item?.targetType === 'employee' ? item.targetDisplayName || '' : '');
      setAssignmentForm(
        item
          ? {
              targetType: item.targetType as PolicyAssignmentTargetType,
              targetKey: item.targetKey,
              targetDisplayName: item.targetDisplayName || '',
              payrollPolicyId: item.payrollPolicyId,
              attendancePolicyId: item.attendancePolicyId,
              leavePolicyId: item.leavePolicyId || '',
              effectiveFrom: toDateInput(item.effectiveFrom),
              effectiveTo: toDateInput(item.effectiveTo),
              priority: String(item.priority ?? 0),
              assignmentReason: item.assignmentReason || '',
              isActive: item.isActive,
            }
          : {
              ...defaultAssignmentForm(currentYear?.startDate),
              payrollPolicyId: defaultPayroll?.id || '',
              attendancePolicyId: defaultAttendancePolicy?.id || '',
              leavePolicyId: defaultLeavePolicy?.id || '',
            }
      );
      setDrawer({ kind: 'assignment', mode: item ? mode : 'create', item });
    },
    [currentYear, defaultAttendancePolicy?.id, defaultLeavePolicy?.id, defaultPayroll?.id]
  );

  // --- Impact drawer --------------------------------------------------------
  const clearImpactDrawer = useCallback(() => {
    setImpactDrawerOpen(false);
    setImpactPreview(null);
    setImpactPreviewError('');
    setPendingImpactAction(null);
  }, []);

  const closeImpactDrawer = useCallback(() => {
    if (isPolicyOperationActive) return;
    clearImpactDrawer();
  }, [clearImpactDrawer, isPolicyOperationActive]);

  const openImpactDrawerLoading = useCallback(() => {
    setImpactDrawerOpen(true);
    setImpactPreview(null);
    setImpactPreviewError('');
    setPendingImpactAction(null);
  }, []);

  const runWithImpactConfirmation = useCallback(
    async (
      preview: HrPolicyImpactPreview,
      label: string,
      run: (token?: string) => Promise<void>
    ) => {
      setImpactPreviewError('');
      if (preview.blockingWarnings?.length || preview.requiresConfirmation) {
        setImpactDrawerOpen(true);
        setImpactPreview(preview);
        setPendingImpactAction({ label, run });
        return;
      }
      setPendingImpactAction(null);
      await run();
      clearImpactDrawer();
    },
    [clearImpactDrawer]
  );

  const confirmPendingImpactAction = useCallback(async () => {
    if (!pendingImpactAction || !impactPreview) return;
    if (impactPreview.blockingWarnings?.length) return;
    await runPolicyOperation(
      {
        key: 'confirm-impact',
        title: pendingImpactAction.label,
        message: 'Applying the confirmed policy change...',
      },
      async () => {
        try {
          await pendingImpactAction.run(impactPreview.confirmationToken || undefined);
          clearImpactDrawer();
        } catch (error) {
          shikshaMitraToast.error({
            message: getErrorMessage(error, 'Could not complete confirmed policy action.'),
          });
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearImpactDrawer, impactPreview, pendingImpactAction]);

  // --- Policy Actions --------------------------------------------------------

  const previewPolicyRowImpact = useCallback(
    async (
      policyType: 'work_calendar' | 'payroll' | 'attendance',
      item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy,
      action = 'update'
    ) => {
      openImpactDrawerLoading();
      await runPolicyOperation(
        {
          key: 'preview-impact',
          title: 'Checking impact',
          message:
            'Finding staff, assignments, and locked payroll periods affected by this action...',
        },
        async () => {
          try {
            const response = await previewPolicyImpact({
              policyType,
              policyId: item.id,
              academicYearId: item.academicYearId,
              action,
            }).unwrap();
            setImpactPreview(response);
          } catch (error) {
            setImpactPreviewError(getErrorMessage(error, 'Could not preview policy impact.'));
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openImpactDrawerLoading, previewPolicyImpact]
  );

  const openVersionHistory = useCallback(
    (policyType: HrPolicyType, item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy) => {
      setVersionTarget({ policyType, policyId: item.id, policyName: item.name });
      setCompareVersionIds({ from: '', to: '' });
    },
    []
  );

  const openPolicyAudit = useCallback(
    (policyType: HrPolicyType, item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy) => {
      const entityType =
        policyType === 'work_calendar'
          ? 'work_calendar_policy'
          : policyType === 'payroll'
            ? 'payroll_policy'
            : 'attendance_policy';
      setAuditTarget({
        entityType,
        entityId: item.id,
        title: item.name,
        policyType,
        policyId: item.id,
      });
    },
    []
  );

  const openEntityAudit = useCallback((entityType: string, entityId: string, title: string) => {
    setAuditTarget({ entityType, entityId, title });
  }, []);

  const restoreVersionAsDraft = useCallback(
    async (version: HrPolicyVersion) => {
      if (!versionTarget) return;
      if (!restoreVersion?.reason.trim()) {
        shikshaMitraToast.error({ message: 'Enter a restore reason before creating the draft.' });
        return;
      }
      await runPolicyOperation(
        {
          key: 'restore-version',
          title: 'Restoring version',
          message: 'Creating a new draft from the selected policy version...',
        },
        async () => {
          try {
            const restored = await restorePolicyVersionDraft({
              policyType: versionTarget.policyType,
              policyId: versionTarget.policyId,
              versionId: version.id,
              name: restoreVersion.name.trim(),
              changeReason: restoreVersion.reason.trim(),
            }).unwrap();
            shikshaMitraToast.success({ message: 'Version restored as a new draft' });
            setVersionTarget(null);
            setRestoreVersion(null);
            if (versionTarget.policyType === 'work_calendar') {
              openCalendarDrawer(restored as WorkCalendarPolicy);
            } else if (versionTarget.policyType === 'payroll') {
              openPayrollDrawer(restored as PayrollPolicy);
            } else {
              openAttendanceDrawer(restored as AttendancePolicy);
            }
          } catch (error) {
            shikshaMitraToast.error({
              message: getErrorMessage(error, 'Could not restore policy version.'),
            });
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      openAttendanceDrawer,
      openCalendarDrawer,
      openPayrollDrawer,
      restoreVersion,
      restorePolicyVersionDraft,
      versionTarget,
    ]
  );

  const clonePolicy = useCallback(
    async (
      type: 'calendar' | 'payroll' | 'attendance',
      item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy
    ) => {
      await runPolicyOperation(
        {
          key: 'clone-policy',
          title: 'Cloning policy',
          message: 'Preparing a draft copy for editing...',
        },
        async () => {
          try {
            if (type === 'calendar') {
              const cloned = await cloneWorkCalendarPolicy({
                id: item.id,
                name: `${item.name} Copy`,
              }).unwrap();
              openCalendarDrawer(cloned);
            } else if (type === 'payroll') {
              const cloned = await clonePayrollPolicy({
                id: item.id,
                name: `${item.name} Copy`,
              }).unwrap();
              openPayrollDrawer(cloned);
            } else {
              const cloned = await cloneAttendancePolicy({
                id: item.id,
                name: `${item.name} Copy`,
              }).unwrap();
              openAttendanceDrawer(cloned);
            }
            shikshaMitraToast.success({
              message: 'Draft copy created - review and save when ready',
            });
          } catch (error) {
            shikshaMitraToast.error({ message: getErrorMessage(error, 'Could not clone policy.') });
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cloneAttendancePolicy,
      clonePayrollPolicy,
      cloneWorkCalendarPolicy,
      openAttendanceDrawer,
      openCalendarDrawer,
      openPayrollDrawer,
    ]
  );

  const saveCalendar = useCallback(async () => {
    if (
      !academicYearId ||
      !calendarForm.name.trim() ||
      !calendarForm.effectiveFrom ||
      !calendarForm.weeklyOffPattern
    ) {
      setFormError('Name, effective from, and weekly rule are required.');
      return;
    }
    if (
      calendarForm.effectiveTo &&
      dayjs(calendarForm.effectiveTo).isBefore(dayjs(calendarForm.effectiveFrom), 'day')
    ) {
      setFormError('Effective to must be on or after effective from.');
      return;
    }
    const policyDates = [calendarForm.effectiveFrom, calendarForm.effectiveTo].filter(Boolean);
    if (
      policyDates.some((date) => {
        const year = dayjs(date).year();
        return year < 1900 || year > 2100;
      })
    ) {
      setFormError('Please enter a valid year between 1900 and 2100.');
      return;
    }
    const customWeeklyOffs = sortWeekDays(calendarForm.customWeeklyOffs);
    const weeklyOffs = getWeeklyOffsForRule(calendarForm.weeklyOffPattern, customWeeklyOffs);
    if (calendarForm.weeklyOffPattern === 'custom' && weeklyOffs.length === 0) {
      setFormError('Select at least one weekly off day for a custom weekly rule.');
      return;
    }
    if (calendarForm.weeklyOffPattern === 'custom' && weeklyOffs.length >= 7) {
      setFormError(
        'Select at least one working day. A work calendar cannot mark all seven days as weekly offs.'
      );
      return;
    }
    const invalidHoliday = calendarForm.holidays.find(
      (holiday) =>
        !holiday.holidayName.trim() ||
        !getHolidayFromDate(holiday) ||
        !getHolidayToDate(holiday) ||
        !(() => {
          const from = toDateOnly(getHolidayFromDate(holiday));
          const to = toDateOnly(getHolidayToDate(holiday));
          const rangeFrom = calendarForm.effectiveFrom;
          const rangeTo = calendarForm.effectiveTo;
          const fromD = dayjs(from);
          const toD = dayjs(to);
          if (!fromD.isValid() || toD.isBefore(fromD, 'day')) return false;
          if (rangeFrom && fromD.isBefore(dayjs(rangeFrom), 'day')) return false;
          if (rangeTo && toD.isAfter(dayjs(rangeTo), 'day')) return false;
          return true;
        })()
    );
    if (invalidHoliday) {
      setFormError(
        'All finalized holidays need a name, valid date range, and must stay inside the work calendar effective date range.'
      );
      return;
    }
    const academicYearHolidayError = getHolidayAcademicYearValidationError(
      calendarForm.holidays,
      currentYear?.startDate,
      currentYear?.endDate
    );
    if (academicYearHolidayError) {
      setFormError(academicYearHolidayError);
      return;
    }
    const body = buildCalendarPayload();
    if (!body) return;
    await runPolicyOperation(
      {
        key: 'save-calendar',
        title: drawer?.mode === 'edit' ? 'Saving work calendar' : 'Creating work calendar',
        message:
          drawer?.mode === 'edit'
            ? 'Checking impact and saving the work calendar...'
            : 'Saving the new work calendar...',
      },
      async () => {
        try {
          if (drawer?.mode === 'edit' && drawer.item?.id) {
            const preview = await previewPolicyImpact({
              policyType: 'work_calendar',
              policyId: drawer.item.id,
              academicYearId,
              action: 'update',
              workCalendarPolicy: body,
            }).unwrap();
            await runWithImpactConfirmation(preview, 'Save work calendar', async (token) => {
              await updateWorkCalendarPolicyWithToken({
                id: drawer.item!.id,
                body,
                token,
              }).unwrap();
              shikshaMitraToast.success({ message: 'Work calendar updated successfully' });
              clearDrawer();
            });
          } else {
            await createWorkCalendarPolicy(body).unwrap();
            shikshaMitraToast.success({ message: 'Work calendar created successfully' });
            clearDrawer();
          }
        } catch (error) {
          setFormError(getErrorMessage(error, 'Could not save work calendar policy.'));
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    academicYearId,
    buildCalendarPayload,
    calendarForm,
    clearDrawer,
    currentYear?.endDate,
    currentYear?.startDate,
    createWorkCalendarPolicy,
    drawer,
    previewPolicyImpact,
    runWithImpactConfirmation,
    updateWorkCalendarPolicyWithToken,
  ]);

  const savePayroll = useCallback(async () => {
    if (!academicYearId || !payrollForm.name.trim() || !payrollForm.workCalendarPolicyId) {
      setFormError('Name and active work calendar are required.');
      return;
    }
    const dayCalculationType = normalizePayrollDayCalculationType(payrollForm.dayCalculationType);
    const isManualDays = dayCalculationType === 'manual-days';
    const manualMonthDaysResult = buildManualMonthDaysPayload({
      academicYearStart: currentYear?.startDate,
      academicYearEnd: currentYear?.endDate,
      manualMonthDays: payrollForm.manualMonthDays,
    });
    if (isManualDays) {
      if (getAcademicYearMonthRanges(currentYear?.startDate, currentYear?.endDate).length === 0) {
        setFormError('Manual Days mode requires an academic year with valid start and end dates.');
        return;
      }
      if (manualMonthDaysResult.error) {
        setFormError(manualMonthDaysResult.error);
        return;
      }
    }
    const body = buildPayrollPayload();
    if (!body) return;
    await runPolicyOperation(
      {
        key: 'save-payroll',
        title: drawer?.mode === 'edit' ? 'Saving payroll policy' : 'Creating payroll policy',
        message:
          drawer?.mode === 'edit'
            ? 'Checking impact and saving the payroll policy...'
            : 'Saving the new payroll policy...',
      },
      async () => {
        try {
          if (drawer?.mode === 'edit' && drawer.item?.id) {
            const preview = await previewPolicyImpact({
              policyType: 'payroll',
              policyId: drawer.item.id,
              academicYearId,
              action: 'update',
              payrollPolicy: body,
            }).unwrap();
            await runWithImpactConfirmation(preview, 'Save payroll policy', async (token) => {
              await updatePayrollPolicyWithToken({ id: drawer.item!.id, body, token }).unwrap();
              shikshaMitraToast.success({ message: 'Payroll policy updated successfully' });
              clearDrawer();
            });
          } else if (body.status === 'active' && body.isDefault) {
            const preview = await previewPolicyImpact({
              policyType: 'payroll',
              academicYearId,
              action: 'create-default',
              payrollPolicy: body,
            }).unwrap();
            await runWithImpactConfirmation(preview, 'Create payroll policy', async (token) => {
              await createPayrollPolicyWithToken({ body, token }).unwrap();
              shikshaMitraToast.success({ message: 'Payroll policy created successfully' });
              clearDrawer();
            });
          } else {
            await createPayrollPolicy(body).unwrap();
            shikshaMitraToast.success({ message: 'Payroll policy created successfully' });
            clearDrawer();
          }
        } catch (error) {
          setFormError(getErrorMessage(error, 'Could not save payroll policy.'));
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    academicYearId,
    buildPayrollPayload,
    clearDrawer,
    createPayrollPolicy,
    createPayrollPolicyWithToken,
    currentYear,
    drawer,
    payrollForm,
    previewPolicyImpact,
    runWithImpactConfirmation,
    updatePayrollPolicyWithToken,
  ]);

  const saveAttendance = useCallback(async () => {
    const formToSave = attendanceForm;
    const full = Number(formToSave.fullDayThresholdPercentage);
    const half = Number(formToSave.halfDayThresholdPercentage);
    const absent = Number(formToSave.absentThresholdPercentage);
    if (!academicYearId || !formToSave.name.trim() || !formToSave.workCalendarPolicyId) {
      setFormError('Name and active work calendar are required.');
      return;
    }
    if (!isAttendanceThresholdOrderValid(full, half, absent)) {
      setFormError('');
      return;
    }
    const overtimeValidationError = getAttendanceOvertimeValidationError({
      overtimeEnabled: formToSave.overtimeEnabled,
      overtimeRate: formToSave.overtimeRate,
      minOvertimeMinutes: formToSave.minOvertimeMinutes,
    });
    if (overtimeValidationError) {
      setFormError(overtimeValidationError);
      return;
    }
    if (
      formToSave.penaltyType === 'salary_deduction' &&
      (!numberOrNull(formToSave.penaltyDeductionAmount) ||
        Number(formToSave.penaltyDeductionAmount) <= 0)
    ) {
      setFormError('Penalty deduction amount is required when penalty action is Salary Deduction.');
      return;
    }
    const invalidRule = (Object.keys(attendanceNumericRules) as AttendanceNumericField[]).find(
      (field) => getNumericPolicyInputError(formToSave[field] || '', attendanceNumericRules[field])
    );
    if (invalidRule) {
      setFormError(
        getNumericPolicyInputError(
          formToSave[invalidRule] || '',
          attendanceNumericRules[invalidRule]
        )
      );
      return;
    }
    const body = buildAttendancePayload();
    if (!body) return;
    await runPolicyOperation(
      {
        key: 'save-attendance',
        title: drawer?.mode === 'edit' ? 'Saving attendance policy' : 'Creating attendance policy',
        message:
          drawer?.mode === 'edit'
            ? 'Checking impact and saving the attendance policy...'
            : 'Saving the new attendance policy...',
      },
      async () => {
        try {
          if (drawer?.mode === 'edit' && drawer.item?.id) {
            const preview = await previewPolicyImpact({
              policyType: 'attendance',
              policyId: drawer.item.id,
              academicYearId,
              action: 'update',
              attendancePolicy: body,
            }).unwrap();
            await runWithImpactConfirmation(preview, 'Save attendance policy', async (token) => {
              await updateAttendancePolicyWithToken({ id: drawer.item!.id, body, token }).unwrap();
              shikshaMitraToast.success({ message: 'Attendance policy updated successfully' });
              clearDrawer();
            });
          } else if (body.status === 'active' && body.isDefault) {
            const preview = await previewPolicyImpact({
              policyType: 'attendance',
              academicYearId,
              action: 'create-default',
              attendancePolicy: body,
            }).unwrap();
            await runWithImpactConfirmation(preview, 'Create attendance policy', async (token) => {
              await createAttendancePolicyWithToken({ body, token }).unwrap();
              shikshaMitraToast.success({ message: 'Attendance policy created successfully' });
              clearDrawer();
            });
          } else {
            await createAttendancePolicy(body).unwrap();
            shikshaMitraToast.success({ message: 'Attendance policy created successfully' });
            clearDrawer();
          }
        } catch (error) {
          setFormError(getErrorMessage(error, 'Could not save attendance policy.'));
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    academicYearId,
    attendanceAdvancedMode,
    attendanceForm,
    buildAttendancePayload,
    clearDrawer,
    createAttendancePolicy,
    createAttendancePolicyWithToken,
    drawer,
    previewPolicyImpact,
    runWithImpactConfirmation,
    updateAttendancePolicyWithToken,
  ]);

  const saveAssignment = useCallback(async () => {
    if (
      !academicYearId ||
      !assignmentForm.targetKey.trim() ||
      !assignmentForm.payrollPolicyId ||
      !assignmentForm.attendancePolicyId ||
      !assignmentForm.leavePolicyId ||
      !assignmentForm.effectiveFrom
    ) {
      setFormError('Target, policies, and effective from are required.');
      if (!assignmentForm.effectiveFrom) setAssignmentDateError('Effective from is required.');
      return;
    }
    const assignmentValidationError = getAssignmentFormValidationError(assignmentForm);
    if (assignmentValidationError) {
      if (assignmentValidationError.toLowerCase().includes('effective')) {
        setAssignmentDateError(assignmentValidationError);
      }
      setFormError(assignmentValidationError);
      return;
    }
    const priority = Number(assignmentForm.priority || 0);
    const body = {
      academicYearId,
      targetType: assignmentForm.targetType,
      targetKey: assignmentForm.targetKey.trim(),
      targetDisplayName: assignmentForm.targetDisplayName || null,
      payrollPolicyId: assignmentForm.payrollPolicyId,
      attendancePolicyId: assignmentForm.attendancePolicyId,
      leavePolicyId: assignmentForm.leavePolicyId,
      effectiveFrom: assignmentForm.effectiveFrom,
      effectiveTo: assignmentForm.effectiveTo || null,
      priority,
      assignmentReason: assignmentForm.assignmentReason || null,
      isActive: assignmentForm.isActive,
    };
    await runPolicyOperation(
      {
        key: 'save-assignment',
        title: drawer?.mode === 'edit' ? 'Saving assignment' : 'Creating assignment',
        message: 'Checking assignment impact and applying the policy assignment...',
      },
      async () => {
        try {
          setAssignmentConflict(null);
          const action = drawer?.mode === 'edit' ? 'update' : 'create';
          const assignmentId = drawer?.mode === 'edit' ? drawer.item?.id : undefined;
          const preview = await previewPolicyAssignmentImpact({
            action,
            assignmentId,
            assignment: body,
          }).unwrap();
          if (drawer?.mode === 'edit' && drawer.item?.id) {
            await runWithImpactConfirmation(preview, 'Save policy assignment', async (token) => {
              await updateHrPolicyAssignmentWithToken({
                id: drawer.item!.id,
                body,
                token,
              }).unwrap();
              shikshaMitraToast.success({ message: 'Policy assignment saved' });
              clearDrawer();
            });
          } else {
            await runWithImpactConfirmation(preview, 'Save policy assignment', async (token) => {
              await createHrPolicyAssignmentWithToken({ body, token }).unwrap();
              shikshaMitraToast.success({ message: 'Policy assignment saved' });
              clearDrawer();
            });
          }
        } catch (error) {
          const conflict = getAssignmentConflict(error);
          const message = getErrorMessage(
            error,
            'Assignment overlaps an active rule for the same target and date range.'
          );
          if (conflict) {
            setAssignmentConflict(conflict);
            setAssignmentDateError('This date range overlaps another active assignment.');
          } else if (message.toLowerCase().includes('overlap')) {
            setAssignmentDateError(message);
          } else {
            setFormError(message);
          }
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    academicYearId,
    assignmentForm,
    clearDrawer,
    createHrPolicyAssignmentWithToken,
    drawer,
    previewPolicyAssignmentImpact,
    runWithImpactConfirmation,
    updateHrPolicyAssignmentWithToken,
  ]);

  const archivePolicy = useCallback(
    async (
      type: 'payroll' | 'attendance' | 'calendar',
      item: PayrollPolicy | AttendancePolicy | WorkCalendarPolicy
    ) => {
      openImpactDrawerLoading();
      await runPolicyOperation(
        {
          key: 'archive-policy',
          title: 'Archiving policy',
          message: 'Checking impact before archiving this policy...',
        },
        async () => {
          try {
            const policyType = type === 'calendar' ? 'work_calendar' : type;
            const preview = await previewPolicyImpact({
              policyType,
              policyId: item.id,
              academicYearId: item.academicYearId,
              action: 'archive',
            }).unwrap();
            await runWithImpactConfirmation(preview, 'Archive policy', async (token) => {
              if (type === 'payroll')
                await deletePayrollPolicyWithToken({ id: item.id, token }).unwrap();
              else if (type === 'attendance')
                await deleteAttendancePolicyWithToken({ id: item.id, token }).unwrap();
              else await deleteWorkCalendarPolicyWithToken({ id: item.id, token }).unwrap();
              shikshaMitraToast.success({ message: 'Policy archived successfully' });
            });
          } catch (error) {
            setImpactPreviewError(getErrorMessage(error, 'Could not archive policy.'));
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      deleteAttendancePolicyWithToken,
      deletePayrollPolicyWithToken,
      deleteWorkCalendarPolicyWithToken,
      openImpactDrawerLoading,
      previewPolicyImpact,
      runWithImpactConfirmation,
    ]
  );

  const deleteAssignment = useCallback(
    async (item: HrPolicyAssignment) => {
      openImpactDrawerLoading();
      await runPolicyOperation(
        {
          key: 'delete-assignment',
          title: 'Deactivating assignment',
          message: 'Checking impact before deactivating this policy assignment...',
        },
        async () => {
          try {
            const effectiveLeavePolicyId = getEffectiveAssignmentLeavePolicyId(
              item,
              defaultLeavePolicy?.id
            );
            if (!effectiveLeavePolicyId) {
              setFormError(
                'A single default leave policy is required before previewing impact for this legacy assignment.'
              );
              return;
            }

            const preview = await previewPolicyAssignmentImpact({
              action: 'delete',
              assignmentId: item.id,
              assignment: {
                academicYearId: item.academicYearId,
                targetType: item.targetType,
                targetKey: item.targetKey,
                targetDisplayName: item.targetDisplayName || null,
                payrollPolicyId: item.payrollPolicyId,
                attendancePolicyId: item.attendancePolicyId,
                leavePolicyId: effectiveLeavePolicyId,
                effectiveFrom: item.effectiveFrom,
                effectiveTo: item.effectiveTo || null,
                priority: item.priority,
                assignmentReason: item.assignmentReason || null,
                isActive: false,
              },
            }).unwrap();
            await runWithImpactConfirmation(
              preview,
              'Deactivate policy assignment',
              async (token) => {
                await deleteHrPolicyAssignmentWithToken({ id: item.id, token }).unwrap();
                shikshaMitraToast.success({ message: 'Policy assignment deactivated' });
              }
            );
          } catch (error) {
            setImpactPreviewError(getErrorMessage(error, 'Could not deactivate assignment.'));
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      defaultLeavePolicy?.id,
      deleteHrPolicyAssignmentWithToken,
      openImpactDrawerLoading,
      previewPolicyAssignmentImpact,
      runWithImpactConfirmation,
    ]
  );

  const unarchivePolicy = useCallback(
    async (
      type: 'payroll' | 'attendance' | 'calendar',
      item: PayrollPolicy | AttendancePolicy | WorkCalendarPolicy
    ) => {
      await runPolicyOperation(
        {
          key: 'unarchive-policy',
          title: 'Unarchiving policy',
          message: 'Restoring this policy as a draft...',
        },
        async () => {
          try {
            if (type === 'payroll') await unarchivePayrollPolicy(item.id).unwrap();
            else if (type === 'attendance') await unarchiveAttendancePolicy(item.id).unwrap();
            else await unarchiveWorkCalendarPolicy(item.id).unwrap();
            shikshaMitraToast.success({ message: 'Policy restored as draft' });
          } catch (error) {
            shikshaMitraToast.error({
              message: getErrorMessage(error, 'Could not unarchive policy.'),
            });
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unarchiveAttendancePolicy, unarchivePayrollPolicy, unarchiveWorkCalendarPolicy]
  );

  const setDefaultWithImpact = useCallback(
    async (type: 'payroll' | 'attendance', item: PayrollPolicy | AttendancePolicy) => {
      openImpactDrawerLoading();
      await runPolicyOperation(
        {
          key: 'set-default',
          title: 'Setting default policy',
          message: 'Checking impact before changing the default policy...',
        },
        async () => {
          try {
            const preview = await previewPolicyImpact({
              policyType: type,
              policyId: item.id,
              academicYearId: item.academicYearId,
              action: 'set-default',
            }).unwrap();
            await runWithImpactConfirmation(preview, 'Set default policy', async (token) => {
              if (type === 'payroll')
                await setDefaultPayrollPolicyWithToken({ id: item.id, token }).unwrap();
              else await setDefaultAttendancePolicyWithToken({ id: item.id, token }).unwrap();
              shikshaMitraToast.success({ message: 'Default policy updated successfully' });
            });
          } catch (error) {
            setImpactPreviewError(getErrorMessage(error, 'Could not set default policy.'));
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      openImpactDrawerLoading,
      previewPolicyImpact,
      runWithImpactConfirmation,
      setDefaultAttendancePolicyWithToken,
      setDefaultPayrollPolicyWithToken,
    ]
  );

  const previewCurrentAssignmentImpact = useCallback(async () => {
    if (
      !academicYearId ||
      !assignmentForm.targetKey.trim() ||
      !assignmentForm.payrollPolicyId ||
      !assignmentForm.attendancePolicyId ||
      !assignmentForm.leavePolicyId ||
      !assignmentForm.effectiveFrom
    ) {
      setFormError('Target, policies, and effective from are required before impact preview.');
      if (!assignmentForm.effectiveFrom) setAssignmentDateError('Effective from is required.');
      return;
    }
    const assignmentValidationError = getAssignmentFormValidationError(assignmentForm);
    if (assignmentValidationError) {
      if (assignmentValidationError.toLowerCase().includes('effective')) {
        setAssignmentDateError(assignmentValidationError);
      }
      setFormError(assignmentValidationError);
      return;
    }
    openImpactDrawerLoading();
    await runPolicyOperation(
      {
        key: 'preview-impact',
        title: 'Checking assignment impact',
        message: 'Finding affected staff and policy conflicts for this assignment...',
      },
      async () => {
        try {
          const response = await previewPolicyAssignmentImpact({
            action: drawer?.mode === 'edit' ? 'update' : 'create',
            assignmentId: drawer?.item?.id,
            assignment: {
              academicYearId,
              targetType: assignmentForm.targetType,
              targetKey: assignmentForm.targetKey.trim(),
              targetDisplayName: assignmentForm.targetDisplayName || null,
              payrollPolicyId: assignmentForm.payrollPolicyId,
              attendancePolicyId: assignmentForm.attendancePolicyId,
              leavePolicyId: assignmentForm.leavePolicyId,
              effectiveFrom: assignmentForm.effectiveFrom,
              effectiveTo: assignmentForm.effectiveTo || null,
              priority: Number(assignmentForm.priority || 0),
              assignmentReason: assignmentForm.assignmentReason || null,
              isActive: assignmentForm.isActive,
            },
          }).unwrap();
          setImpactPreview(response);
        } catch (error) {
          const conflict = getAssignmentConflict(error);
          if (conflict) setAssignmentConflict(conflict);
          setImpactPreviewError(getErrorMessage(error, 'Could not preview assignment impact.'));
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    academicYearId,
    assignmentForm,
    drawer,
    openImpactDrawerLoading,
    previewPolicyAssignmentImpact,
  ]);

  // --- Holiday form actions --------------------------------------------------

  /**
   * Memoization Justification:
   * Runs O(n) holiday overlap detection against the calendar's holiday list on
   * every date field change in the manual holiday dialog. Without memoization, this
   * algorithm runs on every parent re-render including unrelated form state changes.
   */
  const manualHolidayConflict = useMemo(() => {
    const toDate = manualHolidayForm.toDate || manualHolidayForm.fromDate;
    if (!manualHolidayForm.fromDate || !toDate) return null;
    if (dayjs(toDate).isBefore(dayjs(manualHolidayForm.fromDate), 'day')) return null;
    return findIncludedHolidayOverlap(
      calendarForm.holidays,
      { fromDate: manualHolidayForm.fromDate, toDate },
      editingManualHolidayIndex
    );
  }, [
    calendarForm.holidays,
    editingManualHolidayIndex,
    manualHolidayForm.fromDate,
    manualHolidayForm.toDate,
  ]);

  const manualHolidayConflictMessage = manualHolidayConflict
    ? formatHolidayOverlapMessage(manualHolidayConflict)
    : '';

  const importCentralHolidays = useCallback(async () => {
    if (!academicYearId) {
      setHolidayReviewError('Select an academic year before importing central holidays.');
      return;
    }
    setHolidayReviewError('');
    setHolidayReviewInfo('');
    try {
      const rows = centralHolidayPreviewRows.length
        ? centralHolidayPreviewRows
        : await loadHolidayImportPreview({ academicYearId }).unwrap();
      setCentralHolidayPreviewRows(rows);
      if (!rows.length) {
        setHolidayReviewInfo(
          'No central holidays found for this academic year. Add manual holidays or create holidays in Calendar first.'
        );
        return;
      }
      const mergeResult = mergeNonOverlappingHolidayRows(
        calendarForm.holidays,
        rows,
        holidayRowKey
      );
      setCalendarForm((current) => ({ ...current, holidays: mergeResult.rows }));
      if (mergeResult.skippedOverlapCount > 0) {
        setHolidayReviewInfo(
          `${mergeResult.skippedOverlapCount} central holiday${mergeResult.skippedOverlapCount === 1 ? '' : 'ies'} skipped because an included holiday already exists on the same date.`
        );
      }
      shikshaMitraToast.success({
        message: mergeResult.addedCount
          ? `${mergeResult.addedCount} central holidays added`
          : 'Central holidays are already in this work calendar',
      });
    } catch (error) {
      setHolidayReviewError(getErrorMessage(error, 'Could not import central holidays.'));
    }
  }, [academicYearId, calendarForm.holidays, centralHolidayPreviewRows, loadHolidayImportPreview]);

  const openManualHolidayDialog = useCallback(
    (index?: number) => {
      const existing = typeof index === 'number' ? calendarForm.holidays[index] : null;
      setEditingManualHolidayIndex(typeof index === 'number' ? index : null);
      setManualHolidayForm(
        existing
          ? {
              holidayName: existing.holidayName,
              fromDate: toDateInput(getHolidayFromDate(existing)),
              toDate: toDateInput(getHolidayToDate(existing)),
              notes: existing.notes || '',
            }
          : { holidayName: '', fromDate: '', toDate: '', notes: '' }
      );
      setFormError('');
      setManualHolidayDialogOpen(true);
    },
    [calendarForm.holidays]
  );

  const closeManualHolidayDialog = useCallback(() => {
    setManualHolidayDialogOpen(false);
    setEditingManualHolidayIndex(null);
    setManualHolidayForm({ holidayName: '', fromDate: '', toDate: '', notes: '' });
  }, []);

  const saveManualHoliday = useCallback(() => {
    const toDate = manualHolidayForm.toDate || manualHolidayForm.fromDate;
    if (
      !academicYearId ||
      !manualHolidayForm.holidayName.trim() ||
      !manualHolidayForm.fromDate ||
      !toDate
    ) {
      setFormError('Manual holiday name, from date, and to date are required.');
      return;
    }
    if (dayjs(toDate).isBefore(dayjs(manualHolidayForm.fromDate), 'day')) {
      setFormError('Manual holiday to date must be on or after from date.');
      return;
    }
    const rangeFrom = calendarForm.effectiveFrom;
    const rangeTo = calendarForm.effectiveTo;
    const fromD = dayjs(manualHolidayForm.fromDate);
    const toD = dayjs(toDate);
    const insideRange =
      fromD.isValid() &&
      !toD.isBefore(fromD, 'day') &&
      (!rangeFrom || !fromD.isBefore(dayjs(rangeFrom), 'day')) &&
      (!rangeTo || !toD.isAfter(dayjs(rangeTo), 'day'));
    if (!insideRange) {
      setFormError('Manual holiday range must be inside the work calendar effective date range.');
      return;
    }
    const row: WorkCalendarHoliday = {
      academicYearId,
      date: manualHolidayForm.fromDate,
      fromDate: manualHolidayForm.fromDate,
      toDate,
      dayCount: dayjs(toDate).diff(dayjs(manualHolidayForm.fromDate), 'day') + 1,
      holidayName: manualHolidayForm.holidayName.trim(),
      source: 'manual',
      calendarHolidayId: null,
      isIncluded: true,
      notes: manualHolidayForm.notes.trim() || null,
    };
    const academicYearHolidayError = getHolidayAcademicYearValidationError(
      [row],
      currentYear?.startDate,
      currentYear?.endDate
    );
    if (academicYearHolidayError) {
      setFormError(academicYearHolidayError);
      return;
    }
    if (manualHolidayConflict) {
      setFormError(manualHolidayConflictMessage);
      return;
    }
    setCalendarForm((current) => ({
      ...current,
      holidays:
        editingManualHolidayIndex === null
          ? mergeHolidayRows(current.holidays, [row])
          : current.holidays
              .map((item, i) => (i === editingManualHolidayIndex ? { ...item, ...row } : item))
              .sort(
                (left, right) =>
                  dayjs(toDateOnly(getHolidayFromDate(left))).valueOf() -
                  dayjs(toDateOnly(getHolidayFromDate(right))).valueOf()
              ),
    }));
    setFormError('');
    closeManualHolidayDialog();
  }, [
    academicYearId,
    calendarForm.effectiveFrom,
    calendarForm.effectiveTo,
    closeManualHolidayDialog,
    currentYear?.endDate,
    currentYear?.startDate,
    editingManualHolidayIndex,
    manualHolidayConflict,
    manualHolidayConflictMessage,
    manualHolidayForm,
  ]);

  const updateCalendarHoliday = useCallback(
    (index: number, changes: Partial<WorkCalendarHoliday>) => {
      setCalendarForm((current) => ({
        ...current,
        holidays: current.holidays.map((item, i) => (i === index ? { ...item, ...changes } : item)),
      }));
    },
    []
  );

  const removeManualHoliday = useCallback((index: number) => {
    setCalendarForm((current) => ({
      ...current,
      holidays: current.holidays.filter((_, i) => i !== index),
    }));
  }, []);

  // --- Numeric field props helper --------------------------------------------
  const getAttendanceNumericFieldProps = useCallback(
    (field: AttendanceNumericField) => {
      const rule = attendanceNumericRules[field];
      const value = attendanceForm[field] || '';
      const baseError = getNumericPolicyInputError(value, rule);

      let helperText = baseError || `Allowed range: ${rule.min}-${rule.max}`;
      let hasError = Boolean(baseError);

      if (
        !baseError &&
        (field === 'fullDayThresholdPercentage' ||
          field === 'halfDayThresholdPercentage' ||
          field === 'absentThresholdPercentage')
      ) {
        const full = Number(attendanceForm.fullDayThresholdPercentage || 0);
        const half = Number(attendanceForm.halfDayThresholdPercentage || 0);
        const absent = Number(attendanceForm.absentThresholdPercentage || 0);

        if (!isAttendanceThresholdOrderValid(full, half, absent)) {
          if (field === 'fullDayThresholdPercentage' && full <= half) {
            hasError = true;
            helperText = `Must be greater than half day threshold (${half}%)`;
          } else if (field === 'halfDayThresholdPercentage') {
            if (half >= full) {
              hasError = true;
              helperText = `Must be less than full day threshold (${full}%)`;
            } else if (half < absent) {
              hasError = true;
              helperText = `Must be \u2265 absent threshold (${absent}%)`;
            }
          } else if (field === 'absentThresholdPercentage' && absent > half) {
            hasError = true;
            helperText = `Must be \u2264 half day threshold (${half}%)`;
          }
        }
      }

      return {
        fullWidth: true,
        size: 'small' as const,
        value,
        error: hasError,
        helperText,
        inputProps: { inputMode: 'numeric' as const, maxLength: rule.maxLength },
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          const nextValue = sanitizeNumericPolicyInput(event.target.value, rule);
          setAttendanceForm((current) => ({ ...current, [field]: nextValue }));
        },
        onBlur: () => {
          setAttendanceForm((current) => ({
            ...current,
            [field]: clampNumericPolicyInput(current[field] || '', rule),
          }));
        },
      };
    },
    [attendanceForm]
  );

  // --- Returned state surface ------------------------------------------------
  return {
    // Navigation
    tab,
    setTab,

    // Drawer
    drawer,
    openCalendarDrawer,
    openPayrollDrawer,
    openAttendanceDrawer,
    openAssignmentDrawer,
    closeDrawer,
    discardDrawer,

    // Operation overlay
    activePolicyOperation,
    isPolicyOperationActive,

    // Policy data
    calendars,
    payroll,
    attendance,
    leavePolicies,
    visibleCalendars,
    visiblePayroll,
    visibleAttendance,
    archivedCalendarCount,
    archivedPayrollCount,
    archivedAttendanceCount,
    activeCalendars,
    activePayroll,
    activeAttendance,
    activeLeavePolicies,
    assignments,
    assignmentRows,
    assignmentListArgs,
    assignmentTableProps,
    versionTableProps,
    assignmentPage,
    setAssignmentPage,
    assignmentTotal: assignments?.totalCount || 0,
    employeeOptions,
    employeeLookupSearch,
    setEmployeeLookupSearch,
    employeeSearchLoading,
    groupOptions,

    // Derived
    defaultPayroll,
    defaultAttendancePolicy,
    defaultLeavePolicy,
    leaveSetupState,
    payrollSetupState,
    attendanceSetupState,
    canOpenLeavePolicies,
    canOpenPayrollPolicies,
    canOpenAttendancePolicies,

    // Permissions
    canCreatePolicy,
    canEditPolicy,
    canArchivePolicy,
    canSetDefaultPolicy,
    canAssignPolicy,
    canClonePolicy,
    canPreviewImpact,
    canViewAudit,

    // Loading states
    isLoading:
      calendarsLoading ||
      payrollLoading ||
      attendanceLoading ||
      leavePoliciesLoading ||
      assignmentsLoading ||
      employeesLoading ||
      employeeSearchLoading ||
      groupsLoading,
    calendarsLoading,
    payrollLoading,
    attendanceLoading,
    leavePoliciesLoading,
    assignmentsLoading,
    // Errors
    calendarsError,
    payrollError,
    attendanceError,
    leavePoliciesError,
    assignmentsError,
    refetchAssignments,

    // Archive view
    policyArchiveView,
    setPolicyArchiveView,

    // Drawer transition
    drawerTransitionDuration,

    // Calendar form
    calendarForm,
    setCalendarForm,
    holidayReviewFilters,
    setHolidayReviewFilters,
    centralHolidayPreviewRows,
    holidayReviewError,
    holidayReviewInfo,
    manualHolidayForm,
    setManualHolidayForm,
    manualHolidayDialogOpen,
    setManualHolidayDialogOpen,
    editingManualHolidayIndex,
    manualHolidayConflict,
    manualHolidayConflictMessage,
    loadCalendarHolidaysState,
    loadHolidayImportPreviewState,
    currentCalendarUnchanged,
    createCalendarState,
    updateCalendarState,
    cloneCalendarState,
    deleteCalendarState,
    unarchiveCalendarState,

    // Payroll form
    payrollForm,
    setPayrollForm,
    currentPayrollUnchanged,
    createPayrollState,
    updatePayrollState,
    clonePayrollState,
    deletePayrollState,
    unarchivePayrollState,
    payrollDefaultState,

    // Attendance form
    attendanceForm,
    setAttendanceForm,
    attendanceAdvancedMode,
    setAttendanceAdvancedMode,
    currentAttendanceUnchanged,
    createAttendanceState,
    updateAttendanceState,
    cloneAttendanceState,
    deleteAttendanceState,
    unarchiveAttendanceState,
    attendanceDefaultState,

    // Assignment form
    assignmentForm,
    setAssignmentForm,
    assignmentSearch,
    setAssignmentSearch,
    assignmentDateError,
    setAssignmentDateError,
    assignmentConflict,
    assignmentPreview,
    assignmentPreviewLoading,
    assignmentPreviewError,
    createAssignmentState,
    updateAssignmentState,
    deleteAssignmentState,
    previewPolicyAssignmentImpactState,
    formError,
    setFormError,

    // Impact drawer
    impactDrawerOpen,
    impactPreview,
    impactPreviewError,
    pendingImpactAction,
    closeImpactDrawer,
    confirmPendingImpactAction,
    previewPolicyImpactState,

    // Audit
    auditTarget,
    setAuditTarget,
    auditSummary,
    auditEvents,
    auditLoading: auditLoading || auditEventsLoading,

    // Version history
    versionTarget,
    setVersionTarget,
    versionHistory,
    versionPage,
    setVersionPage,
    versionCompare,
    compareVersionIds,
    setCompareVersionIds,
    versionFilters,
    setVersionFilters,
    restoreVersion,
    setRestoreVersion,
    restorePreview,
    restorePreviewLoading,
    restoreVersionState,
    versionHistoryLoading,
    versionCompareLoading,

    // Holiday Impact tab
    holidayFilters,
    setHolidayFilters,
    holidayImpact,
    holidayImpactLoading,
    holidayImpactError,

    // Handlers
    saveCalendar,
    savePayroll,
    saveAttendance,
    saveAssignment,
    deleteAssignment,
    archivePolicy,
    unarchivePolicy,
    setDefaultWithImpact,
    clonePolicy,
    previewPolicyRowImpact,
    openVersionHistory,
    openPolicyAudit,
    openEntityAudit,
    restoreVersionAsDraft,
    previewCurrentAssignmentImpact,
    importCentralHolidays,
    openManualHolidayDialog,
    closeManualHolidayDialog,
    saveManualHoliday,
    updateCalendarHoliday,
    removeManualHoliday,
    getAttendanceNumericFieldProps,

    // Misc
    academicYearId,
    currentYear,
  } as const;
}

export type HRPolicyWorkspaceContext = ReturnType<typeof useHRPolicyWorkspace>;
