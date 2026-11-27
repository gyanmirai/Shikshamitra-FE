'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ShakingTextField from 'src/components/shaking-text-field';
import { durationHours } from 'src/screens/hr/utils/table-values';
import CustomizableTable from 'src/components/customizabaleTable';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { useHrTableCriteria } from 'src/screens/hr/hooks/use-hr-table-query';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { isRegisterMissingPunch } from 'src/screens/hr/attendance-tracking/status-mapper';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
import {
  useAdjustAttendanceRegisterMutation,
  useGetGroupedAttendanceRegisterQuery,
  useBulkAdjustAttendanceRegisterMutation,
} from 'src/redux/hr/attendanceApi';
import {
  Box,
  Chip,
  Stack,
  Button,
  Select,
  Collapse,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  DialogActions,
} from '@mui/material';

import { isRegisterQueryLocked } from './table-query-guard';
import {
  validateAttendanceDraft,
  getAttendanceAdjustmentTimes,
  usesAttendanceAdjustmentTimes,
  reconcileBulkAttendanceAdjustment,
  getSingleAttendanceAdjustmentFailure,
} from './adjustment-state';

import type { AttendanceDraftErrors } from './adjustment-state';

type RegisterStatus =
  'NotMarked' | 'Present' | 'HalfDay' | 'Absent' | 'HalfDayLeave' | 'FullDayLeave';
type PayrollState = 'All' | 'Editable' | 'Locked';
type ExceptionFilter = 'All' | 'NeedsAttention' | 'Absent' | 'HalfDay' | 'MissingPunch' | 'Locked';

type AttendanceRegisterRow = {
  attendanceId?: string | null;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string | null;
  employeeGroup?: string | null;
  educationMediumStageId?: string | null;
  educationMediumStageName?: string | null;
  attendanceDate: string;
  payrollMonth: string;
  inTime?: string | null;
  outTime?: string | null;
  hoursWorked?: string | null;
  remarks?: string | null;
  captureMode?: 'manual_status' | 'manual_with_time' | 'integrated';
  source?: string | null;
  status: RegisterStatus | number;
  isMarked?: boolean;
  isDayLocked: boolean;
  isPayrollLocked: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  holidayReason?: string | null;
  canEdit: boolean;
  lockReason?: string | null;
};

type GroupedAttendanceRegisterRow = {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string | null;
  employeeGroup?: string | null;
  educationMediumStageId?: string | null;
  educationMediumStageName?: string | null;
  roleId?: string | null;
  recordedDays: number;
  present: number;
  halfDay: number;
  absent: number;
  editable: number;
  locked: number;
  missingPunch: number;
  holiday?: number;
  hasExceptions: boolean;
  days: AttendanceRegisterRow[];
};

const STATUS_OPTIONS = [
  { label: 'Present', value: 'Present', wire: 'PRESENT', color: 'success' },
  {
    label: 'Half day',
    value: 'HalfDayLeave',
    wire: 'HALF_DAY',
    color: 'warning',
  },
  { label: 'Absent', value: 'FullDayLeave', wire: 'ABSENT', color: 'error' },
] as const;

const REGISTER_STATUS_OPTIONS = [
  { label: 'Not marked', value: 'NotMarked', color: 'default' },
  { label: 'Present', value: 'Present', color: 'success' },
  { label: 'Half day', value: 'HalfDay', color: 'warning' },
  { label: 'Absent', value: 'Absent', color: 'error' },
] as const;

const PAYROLL_STATES: Array<{ label: string; value: PayrollState }> = [
  { label: 'All payroll states', value: 'All' },
  { label: 'Editable only', value: 'Editable' },
  { label: 'Locked only', value: 'Locked' },
];

const EXCEPTION_FILTERS: Array<{ label: string; value: ExceptionFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Needs attention', value: 'NeedsAttention' },
  { label: 'Absent', value: 'Absent' },
  { label: 'Half day', value: 'HalfDay' },
  { label: 'Missing punch', value: 'MissingPunch' },
  { label: 'Locked', value: 'Locked' },
];

const REGISTER_TABLE_MIN_WIDTH = 1080;
const REGISTER_DAY_TABLE_MIN_WIDTH = 1120;

const normalizeStatus = (
  value: RegisterStatus | number | string | null | undefined
): RegisterStatus => {
  if (value === 1 || value === 'Present') return 'Present';
  if (value === 2 || value === 'HalfDay' || value === 'HalfDayLeave') return 'HalfDay';
  if (value === 3 || value === 'Absent' || value === 'FullDayLeave') return 'Absent';
  return 'NotMarked';
};

const labelize = (value?: string | null) =>
  value ? value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '-';

const getEmployeeCode = (option: any) =>
  option?.employeeCode || option?.employeeIdentifier || option?.code || '';

const getEmployeeName = (option: any) =>
  option?.employeeName ||
  option?.fullName ||
  [option?.firstName, option?.middleName, option?.lastName].filter(Boolean).join(' ') ||
  '';

const getEmployeeOptionLabel = (option: any) => {
  if (typeof option === 'string') return option;

  const name = getEmployeeName(option);
  const code = getEmployeeCode(option);

  return [name, code ? `(${code})` : ''].filter(Boolean).join(' ').trim();
};

const statusMeta = (value: RegisterStatus | number | string) =>
  REGISTER_STATUS_OPTIONS.find((item) => item.value === normalizeStatus(value)) ||
  REGISTER_STATUS_OPTIONS[0];

const toEditableStatus = (value: RegisterStatus | number | string): RegisterStatus => {
  const normalized = normalizeStatus(value);
  if (normalized === 'HalfDay') return 'HalfDayLeave';
  if (normalized === 'Absent') return 'FullDayLeave';
  return normalized === 'Present' ? 'Present' : 'FullDayLeave';
};

const editableStatusMeta = (value: RegisterStatus) =>
  STATUS_OPTIONS.find((item) => item.value === value) || STATUS_OPTIONS[2];

const toTimeValue = (value?: string | null) => {
  if (!value) return '';

  // Keep API clock-time as-is (same behavior expected from exam-slot time handling).
  const isoTimeMatch = value.match(/T(\d{2}:\d{2}:\d{2})/);
  if (isoTimeMatch?.[1]) {
    return dayjs(isoTimeMatch[1], 'HH:mm:ss', true).format('HH:mm');
  }

  const parsed = dayjs(
    value,
    ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss[Z]'],
    true
  );
  if (parsed.isValid()) return parsed.format('HH:mm');

  const fallback = dayjs(value);
  return fallback.isValid() ? fallback.format('HH:mm') : '';
};

const toWireTime = (time?: string) => {
  if (!time) return null;

  const parsed = dayjs(time, ['HH:mm', 'HH:mm:ss'], true);
  return parsed.isValid() ? parsed.format('HH:mm:ss') : null;
};

const getDefaultFilters = () => ({
  startDate: dayjs().startOf('month') as Dayjs | null,
  endDate: dayjs() as Dayjs | null,
  educationMediumStageIds: [] as string[],
  employeeId: '',
  employeeGroup: 'all' as 'all' | 'Teaching' | 'NonTeaching',
  department: '',
  status: 'all' as 'all' | (typeof STATUS_OPTIONS)[number]['value'],
  payrollState: 'All' as PayrollState,
  exceptionFilter: 'All' as ExceptionFilter,
  search: '',
});

const MAX_REGISTER_DATE_SPAN = 366;
const REGISTER_CACHE_FRESHNESS_SECONDS = 30;
const REGISTER_SORT_COLUMNS = ['employeeName', 'present', 'employeeGroup', 'department'];

function getDashboardFilters(start: string | null, end: string | null, employeeId: string | null) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  if (
    !startDate.isValid() ||
    !endDate.isValid() ||
    startDate.format('YYYY-MM-DD') !== start ||
    endDate.format('YYYY-MM-DD') !== end ||
    endDate.isBefore(startDate, 'day') ||
    endDate.diff(startDate, 'day') > MAX_REGISTER_DATE_SPAN
  )
    return null;

  return {
    startDate,
    endDate,
    employeeId:
      employeeId && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(employeeId)
        ? employeeId
        : '',
  };
}

type AttendanceDraft = {
  status: RegisterStatus;
  inTime: string;
  outTime: string;
  remarks: string;
  reason: string;
};

const AttendanceTrackingScreen = () => {
  const dashboardParams = useSearchParams();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdjust = hasGrantedPermission(
    permissions,
    `${hrPermissions.attendance.attendanceTracking}.Add`
  );
  const dashboardStart = dashboardParams.get('startDate');
  const dashboardEnd = dashboardParams.get('endDate');
  const dashboardEmployee = dashboardParams.get('employeeId');
  const dashboardFilters = useMemo(
    () => getDashboardFilters(dashboardStart, dashboardEnd, dashboardEmployee),
    [dashboardStart, dashboardEnd, dashboardEmployee]
  );
  const [filters, setFilters] = useState(() => ({ ...getDefaultFilters(), ...dashboardFilters }));
  const appliedDashboardFilters = React.useRef(dashboardFilters);
  useEffect(() => {
    if (appliedDashboardFilters.current === dashboardFilters) return;
    appliedDashboardFilters.current = dashboardFilters;
    if (dashboardFilters) {
      setFilters((previous) => ({ ...previous, ...dashboardFilters }));
      setPage(1);
      setSelectedIds([]);
    }
  }, [dashboardFilters]);
  const [selectedEmployeeOption, setSelectedEmployeeOption] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editRow, setEditRow] = useState<AttendanceRegisterRow | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<AttendanceRegisterRow[] | null>(null);
  const [bulkRetryBlocked, setBulkRetryBlocked] = useState(false);
  const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);
  const adjustmentInFlight = React.useRef(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [periodError, setPeriodError] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [draft, setDraft] = useState<AttendanceDraft>({
    status: 'Present' as RegisterStatus,
    inTime: '',
    outTime: '',
    remarks: '',
    reason: '',
  });
  const [draftErrors, setDraftErrors] = useState<AttendanceDraftErrors>({});
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
  // A dashboard link carries an explicit date; let the register resolve that date's calendar.
  const isDashboardEmployee = Boolean(
    filters.employeeId && filters.employeeId === dashboardFilters?.employeeId
  );
  const academicYearId = isDashboardEmployee ? undefined : currentYear?.id;
  const { options: stages, isLoading: stagesLoading } = useAcademicOrganizationOptions(
    academicYearId,
    advancedFiltersOpen || filters.educationMediumStageIds.length > 0
  );
  const [findEmployees] = useLazyGetEmployeeQuery();
  const fetchStaffOptions = useCallback(
    async (search: string, nextPage: number) => {
      const result = await findEmployees({
        page: nextPage,
        pageSize: 50,
        search,
      }).unwrap();
      return {
        data: result.items || [],
        hasMore: nextPage * 50 < result.totalCount,
      };
    },
    [findEmployees]
  );
  const previousYear = React.useRef(academicYearId);
  const changingYear = previousYear.current !== academicYearId;
  useEffect(() => {
    if (previousYear.current === academicYearId) return;
    previousYear.current = academicYearId;
    setFilters((prev) => ({ ...prev, educationMediumStageIds: [] }));
    setPage(1);
    setSelectedIds([]);
  }, [academicYearId]);

  const queryParams = useMemo(
    () => ({
      startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : '',
      endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : '',
      academicYearId,
      educationMediumStageIds: filters.educationMediumStageIds,
      employeeId: filters.employeeId,
      employeeGroup: filters.employeeGroup === 'all' ? undefined : filters.employeeGroup,
      department: filters.department,
      status: filters.status === 'all' ? undefined : filters.status,
      payrollState: filters.payrollState,
      exceptionFilter: filters.exceptionFilter,
      search: filters.search,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
    }),
    [academicYearId, filters, page, pageSize]
  );

  const [adjustAttendance, { isLoading: isAdjusting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAdjustAttendanceRegisterMutation,
  });

  const [bulkAdjustAttendance, { isLoading: isBulkAdjusting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useBulkAdjustAttendanceRegisterMutation,
  });

  const queryLocked = isRegisterQueryLocked({
    editRow,
    bulkOpen,
    isAdjusting,
    isBulkAdjusting,
  });
  const missingYear = !academicYearId && !isDashboardEmployee;
  const skipRegister = missingYear || changingYear;
  const { active, filtered, nativeSort, tableProps } = useHrTableCriteria({
    table: 'hr-attendance-register',
    query: queryParams,
    page: page - 1,
    size: pageSize,
    resetPage: () => {
      setPage(1);
      setSelectedIds([]);
    },
    skip: skipRegister,
    locked: queryLocked,
    freshnessSeconds: REGISTER_CACHE_FRESHNESS_SECONDS,
    nativeSortColumns: REGISTER_SORT_COLUMNS,
  });
  const registerParams = { ...queryParams, sorting: nativeSort };
  const registerQuery = useGetGroupedAttendanceRegisterQuery(registerParams, {
    skip: skipRegister || active,
    refetchOnMountOrArgChange: REGISTER_CACHE_FRESHNESS_SECONDS,
    refetchOnReconnect: true,
  });
  const {
    currentData,
    isLoading,
    isFetching,
    error: tableError,
    refetch: retryTable,
  } = active ? filtered : registerQuery;
  const data = currentData as
    { items: GroupedAttendanceRegisterRow[]; totalCount: number } | undefined;
  const exportRegister = useHrTableExport('hr-attendance-register', registerParams);
  const exportTable = (request: Parameters<typeof exportRegister>[0]) =>
    exportRegister(nativeSort ? { ...request, sorts: [] } : request);
  const canEditRows = canAdjust && !isFetching && !tableError;

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  useEffect(() => {
    if (!filters.employeeId || selectedEmployeeOption?.id === filters.employeeId) return;
    const row = rows.find((item) => item.employeeId === filters.employeeId);
    if (!row) return;
    const option = {
      id: row.employeeId,
      employeeName: row.employeeName,
      employeeCode: row.employeeCode,
    };
    setSelectedEmployeeOption(option);
  }, [rows, filters.employeeId, selectedEmployeeOption?.id]);
  const allDayRows = useMemo(() => rows.flatMap((row) => row.days || []), [rows]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const getDayIdentifier = useCallback(
    (day: AttendanceRegisterRow) => day.attendanceId || `${day.employeeId}_${day.attendanceDate}`,
    []
  );

  const selectableDayRows = useMemo(() => allDayRows.filter((row) => row.canEdit), [allDayRows]);
  const selectedRows = useMemo(
    () =>
      selectedIdSet.size
        ? allDayRows.filter((row) => selectedIdSet.has(getDayIdentifier(row)))
        : [],
    [allDayRows, selectedIdSet, getDayIdentifier]
  );
  // Retain target identities through mutation-triggered query refreshes, including unmarked days.
  const bulkTargetRows = bulkRows ?? selectedRows;
  const blockedSelectedCount = bulkTargetRows.filter((row) => !row.canEdit).length;
  const editableSelectedIds = useMemo(
    () =>
      bulkTargetRows
        .filter((row) => row.canEdit && row.attendanceId)
        .map((row) => row.attendanceId as string),
    [bulkTargetRows]
  );
  const editableSelectedEmployeeDates = useMemo(
    () =>
      bulkTargetRows
        .filter((row) => row.canEdit && !row.attendanceId)
        .map((row) => ({
          employeeId: row.employeeId,
          attendanceDate: row.attendanceDate,
        })),
    [bulkTargetRows]
  );

  const resetPaging = () => {
    setPage(1);
    setSelectedIds([]);
  };

  const setFilter = <Key extends keyof typeof filters>(key: Key, value: (typeof filters)[Key]) => {
    if (queryLocked) return;
    setFilters((prev) => ({ ...prev, [key]: value }));
    resetPaging();
  };

  const resetFilters = () => {
    if (queryLocked) return;
    setFilters(getDefaultFilters());
    setDepartmentInput('');
    setPeriodError('');
    setSelectedEmployeeOption(null);
    resetPaging();
  };
  useEffect(() => {
    const department = departmentInput.trim();
    if (queryLocked || department === filters.department) return undefined;
    const timer = setTimeout(() => {
      setFilters((previous) => ({ ...previous, department }));
      setPage(1);
      setSelectedIds([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [departmentInput, filters.department, queryLocked]);

  const setPeriod = ([startDate, endDate]: [Dayjs | null, Dayjs | null]) => {
    if (queryLocked || !startDate?.isValid() || !endDate?.isValid()) return;
    if (
      endDate.isBefore(startDate, 'day') ||
      endDate.diff(startDate, 'day') > MAX_REGISTER_DATE_SPAN
    ) {
      setPeriodError('Choose an end date within 366 days of the start date.');
      return;
    }
    setPeriodError('');
    if (startDate.isSame(filters.startDate, 'day') && endDate.isSame(filters.endDate, 'day'))
      return;
    setFilters((previous) => ({ ...previous, startDate, endDate }));
    resetPaging();
  };
  const shiftMonth = (offset: number) => {
    if (queryLocked || !filters.startDate) return;
    const month = filters.startDate.add(offset, 'month');
    const now = dayjs();
    setPeriod([month.startOf('month'), month.isSame(now, 'month') ? now : month.endOf('month')]);
  };
  const appliedFilters = [
    ...filters.educationMediumStageIds.map((id) => ({
      key: id,
      label: `Division: ${stages.find((stage) => stage.id === id)?.label || id}`,
      clear: () =>
        setFilter(
          'educationMediumStageIds',
          filters.educationMediumStageIds.filter((value) => value !== id)
        ),
    })),
    ...(filters.employeeId
      ? [
          {
            key: 'employeeId',
            label: `Staff: ${selectedEmployeeOption ? getEmployeeOptionLabel(selectedEmployeeOption) : filters.employeeId}`,
            clear: () => {
              setSelectedEmployeeOption(null);
              setFilter('employeeId', '');
            },
          },
        ]
      : []),
    ...(
      [
        'employeeGroup',
        'department',
        'status',
        'payrollState',
        'exceptionFilter',
        'search',
      ] as const
    )
      .filter((key) => filters[key] && !['all', 'All'].includes(filters[key]))
      .map((key) => ({
        key,
        label: `${{ employeeGroup: 'Group', department: 'Department contains', status: 'Attendance status', payrollState: 'Payroll state', exceptionFilter: 'Exceptions', search: 'Search' }[key]}: ${key === 'status' ? statusMeta(filters[key]).label : key === 'exceptionFilter' ? EXCEPTION_FILTERS.find((option) => option.value === filters[key])?.label : key === 'employeeGroup' && filters[key] === 'NonTeaching' ? 'Non teaching' : filters[key]}`,
        clear: () => {
          if (key === 'department') setDepartmentInput('');
          setFilter(key, getDefaultFilters()[key]);
        },
      })),
  ];

  const openEdit = (row: AttendanceRegisterRow) => {
    if (!canEditRows || !row.canEdit) return;
    setEditRow(row);
    setDraftErrors({});
    setAdjustmentError(null);
    setDraft({
      status: toEditableStatus(row.status),
      inTime: toTimeValue(row.inTime),
      outTime: toTimeValue(row.outTime),
      remarks: row.remarks || '',
      reason: '',
    });
  };

  const closeDialogs = () => {
    setEditRow(null);
    setBulkOpen(false);
    setBulkRows(null);
    setBulkRetryBlocked(false);
    setDraftErrors({});
    setAdjustmentError(null);
  };

  const adjustmentRows = editRow ? [editRow] : bulkTargetRows;
  const savingAdjustment = isSavingAdjustment || isAdjusting || isBulkAdjusting;
  const showAdjustmentTimes = usesAttendanceAdjustmentTimes(adjustmentRows);
  const adjustmentTimes = getAttendanceAdjustmentTimes(draft, adjustmentRows);

  const buildAdjustmentPayload = (row?: AttendanceRegisterRow) => ({
    ...(row
      ? row.attendanceId
        ? { attendanceId: row.attendanceId }
        : { employeeId: row.employeeId, attendanceDate: row.attendanceDate }
      : {
          attendanceIds: editableSelectedIds,
          employeeDates: editableSelectedEmployeeDates,
        }),
    statusWire: editableStatusMeta(draft.status).wire,
    inTime: toWireTime(adjustmentTimes.inTime),
    outTime: toWireTime(adjustmentTimes.outTime),
    remarks: draft.remarks,
    reason: draft.reason,
  });

  const saveInline = async () => {
    if (!editRow || adjustmentInFlight.current) return;

    const errors = validateAttendanceDraft(draft, adjustmentRows);
    if (Object.keys(errors).length) {
      setDraftErrors(errors);
      shikshaMitraToast.error({
        message: 'Please fix the validation errors before saving.',
      });
      return;
    }

    adjustmentInFlight.current = true;
    setIsSavingAdjustment(true);
    try {
      const result = await adjustAttendance(buildAdjustmentPayload(editRow)).unwrap();
      const failure = getSingleAttendanceAdjustmentFailure(result);
      if (failure) {
        setAdjustmentError(failure);
        return;
      }
      setAdjustmentError(null);
      shikshaMitraToast.success({ message: 'Attendance adjusted.' });
      closeDialogs();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to adjust attendance.' });
    } finally {
      adjustmentInFlight.current = false;
      setIsSavingAdjustment(false);
    }
  };

  const saveBulk = async () => {
    if (adjustmentInFlight.current || bulkRetryBlocked) return;
    if (!editableSelectedIds.length && !editableSelectedEmployeeDates.length) {
      shikshaMitraToast.error({ message: 'No editable rows selected.' });
      return;
    }

    const errors = validateAttendanceDraft(draft, adjustmentRows);
    if (Object.keys(errors).length) {
      setDraftErrors(errors);
      shikshaMitraToast.error({
        message: 'Please fix the validation errors before saving.',
      });
      return;
    }

    const submittedRows = bulkTargetRows.filter((row) => row.canEdit);
    adjustmentInFlight.current = true;
    setIsSavingAdjustment(true);
    try {
      const result = await bulkAdjustAttendance(buildAdjustmentPayload()).unwrap();
      const outcome = reconcileBulkAttendanceAdjustment(submittedRows, result);
      if (!outcome.complete) {
        setBulkRows(outcome.pendingRows);
        setSelectedIds(outcome.pendingRows.map(getDayIdentifier));
        setBulkRetryBlocked(outcome.retryBlocked);
        setAdjustmentError(outcome.message);
        return;
      }
      shikshaMitraToast.success({ message: `Updated ${outcome.updatedCount} row(s).` });
      setSelectedIds([]);
      closeDialogs();
    } catch {
      setBulkRetryBlocked(true);
      setAdjustmentError(
        'The bulk adjustment outcome could not be confirmed. Your draft is retained. Close and refresh the register before submitting again to avoid repeating successful updates.'
      );
    } finally {
      adjustmentInFlight.current = false;
      setIsSavingAdjustment(false);
    }
  };

  const getEditableDayIds = (group: GroupedAttendanceRegisterRow) =>
    (group.days || []).filter((day) => day.canEdit).map(getDayIdentifier);

  const isGroupSelected = (group: GroupedAttendanceRegisterRow) => {
    const editableIds = getEditableDayIds(group);
    return editableIds.length > 0 && editableIds.every((id) => selectedIdSet.has(id));
  };

  const isGroupIndeterminate = (group: GroupedAttendanceRegisterRow) => {
    const editableIds = getEditableDayIds(group);
    const selectedEditableCount = editableIds.filter((id) => selectedIdSet.has(id)).length;
    return selectedEditableCount > 0 && selectedEditableCount < editableIds.length;
  };

  const toggleGroupSelection = (group: GroupedAttendanceRegisterRow, checked: boolean) => {
    const editableIds = getEditableDayIds(group);
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...editableIds]))
        : prev.filter((id) => !editableIds.includes(id))
    );
  };

  const toggleDaySelection = (attendanceId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, attendanceId]))
        : prev.filter((id) => id !== attendanceId)
    );
  };

  const openBulk = (targets: AttendanceRegisterRow[]) => {
    if (!canEditRows || !targets.some((row) => row.canEdit)) return;
    setBulkRows(targets);
    setBulkRetryBlocked(false);
    setAdjustmentError(null);
    setDraft({ status: 'Present', inTime: '', outTime: '', remarks: '', reason: '' });
    setDraftErrors({});
    setBulkOpen(true);
  };

  const dayColumns: IColumn[] = [
    {
      id: 'select',
      label: '',
      width: 44,
      minWidth: 44,
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (_value, row) => (
        <Checkbox
          size="small"
          disabled={!canEditRows || !row.canEdit}
          checked={selectedIdSet.has(getDayIdentifier(row as AttendanceRegisterRow))}
          onChange={(event) => {
            toggleDaySelection(
              getDayIdentifier(row as AttendanceRegisterRow),
              event.target.checked
            );
          }}
        />
      ),
    },
    {
      id: 'attendanceDate',
      label: 'Date',
      width: 120,
      minWidth: 120,
      align: 'left',
      sticky: true,
      filterType: 'date',
      isSort: true,
      isFilter: true,
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      enumOptions: ['NotMarked', 'Present', 'HalfDay', 'Absent'].map((value) => ({
        value,
        label: statusMeta(value).label,
      })),
      filterValue: (value) =>
        normalizeStatus(typeof value === 'number' ? value : String(value ?? '')),
      sortValue: (value) =>
        statusMeta(typeof value === 'number' ? value : String(value ?? '')).label,
      width: 130,
      minWidth: 130,
      sticky: true,
      stickyPosition: 'right' as const,
      align: 'left',
      isSort: true,
      isFilter: true,
      render: (value, row) => {
        const meta = statusMeta(value);
        const missingPunch = isRegisterMissingPunch(row as AttendanceRegisterRow);
        return (
          <Stack direction="column" spacing={0.75} alignItems="center">
            <Label color={meta.color as any}>{meta.label}</Label>
            {row.isHoliday && <Label color="default">Holiday</Label>}
            {missingPunch && <Label color="warning">Missing punch</Label>}
          </Stack>
        );
      },
    },
    {
      id: 'inTime',
      label: 'In',
      width: 85,
      minWidth: 85,
      align: 'left',
      filterType: 'string',
      isSort: true,
      isFilter: true,
      render: (value) => toTimeValue(value) || '-',
    },
    {
      id: 'outTime',
      label: 'Out',
      width: 90,
      minWidth: 90,
      align: 'left',
      filterType: 'string',
      isSort: true,
      isFilter: true,
      render: (value) => toTimeValue(value) || '-',
    },
    {
      id: 'hoursWorked',
      label: 'Hours',
      width: 100,
      minWidth: 100,
      align: 'left',
      filterType: 'number',
      filterValue: (value) => durationHours(value),
      sortValue: (value) => durationHours(value),
      isSort: true,
      isFilter: true,
      render: (value) => value || '-',
    },
    {
      id: 'source',
      label: 'Source',
      width: 130,
      minWidth: 130,
      align: 'left',
      filterType: 'string',
      isSort: true,
      isFilter: true,
      render: (value, row) => {
        const dayRow = row as AttendanceRegisterRow;
        return (
          <CustomTooltip title={`Mode: ${labelize(dayRow.captureMode)}`} arrow>
            <span>
              <Label color={dayRow.source === 'integration' ? 'info' : 'default'}>
                {labelize(value as string)}
              </Label>
            </span>
          </CustomTooltip>
        );
      },
    },
    {
      id: 'remarks',
      label: 'Remarks',
      width: 150,
      minWidth: 150,
      align: 'left',
      filterType: 'string',
      isSort: true,
      isFilter: true,
      render: (value) => value || '-',
    },
    {
      id: 'lockInfo',
      label: 'Lock',
      width: 110,
      minWidth: 110,
      align: 'left',
      isSort: true,
      isFilter: true,
      filterType: 'enum',
      enumOptions: ['Holiday', 'Not marked', 'Editable', 'Locked'].map((value) => ({
        label: value,
        value,
      })),
      filterValue: (_value, row) =>
        row.isHoliday
          ? 'Holiday'
          : normalizeStatus(row.status) === 'NotMarked' || !row.isMarked
            ? 'Not marked'
            : row.canEdit
              ? 'Editable'
              : 'Locked',
      sortValue: (_value, row) =>
        row.isHoliday
          ? 'Holiday'
          : normalizeStatus(row.status) === 'NotMarked' || !row.isMarked
            ? 'Not marked'
            : row.canEdit
              ? 'Editable'
              : 'Locked',
      exportValue: (_value, row) =>
        row.isHoliday
          ? 'Holiday'
          : normalizeStatus(row.status) === 'NotMarked' || !row.isMarked
            ? 'Not marked'
            : row.canEdit
              ? 'Editable'
              : 'Locked',
      render: (_value, row) => {
        const dayRow = row as AttendanceRegisterRow;
        return dayRow.isHoliday ? (
          <CustomTooltip title={dayRow.holidayReason || dayRow.lockReason || 'Holiday'} arrow>
            <span>
              <Label color="default">Holiday</Label>
            </span>
          </CustomTooltip>
        ) : normalizeStatus(dayRow.status) === 'NotMarked' || !dayRow.isMarked ? (
          <CustomTooltip
            title={
              dayRow.canEdit
                ? 'Attendance has not been marked. Use Adjust to fill it.'
                : 'Attendance has not been marked for this day.'
            }
            arrow
          >
            <span>
              <Label color="default">Not marked</Label>
            </span>
          </CustomTooltip>
        ) : dayRow.canEdit ? (
          <Label color="success">Editable</Label>
        ) : (
          <CustomTooltip title={dayRow.lockReason || 'Locked'} arrow>
            <span>
              <Label color="error">Locked</Label>
            </span>
          </CustomTooltip>
        );
      },
    },
    {
      excludeFromExport: true,
      id: 'actions',
      label: 'Actions',
      width: 120,
      minWidth: 120,
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (_value, row) => {
        const dayRow = row as AttendanceRegisterRow;
        return (
          <CustomTooltip
            title={
              dayRow.canEdit
                ? 'Adjust this day'
                : normalizeStatus(dayRow.status) === 'NotMarked' || !dayRow.isMarked
                  ? 'Attendance has not been marked for this day.'
                  : dayRow.lockReason || 'Locked'
            }
            arrow
          >
            <span>
              <Button
                size="small"
                variant="outlined"
                disabled={!canEditRows || !dayRow.canEdit}
                startIcon={<Iconify icon="solar:pen-bold" width={16} />}
                onClick={() => openEdit(dayRow)}
              >
                Adjust
              </Button>
            </span>
          </CustomTooltip>
        );
      },
    },
  ];

  const renderDailyRows = (group: GroupedAttendanceRegisterRow) => (
    <Box
      sx={{
        height: { xs: 300, sm: 340, md: 380, lg: 420, xl: 460 },
        minHeight: { xs: 300, sm: 340, md: 380, lg: 420, xl: 460 },
        ml: 0,
        width: '100%',
        maxWidth: '100%',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId={`hr-attendance-register-days-${group.employeeId || group.employeeCode}`}
        tableTitle={`Attendance days for ${group.employeeName || group.employeeCode}`}
        columns={dayColumns}
        data={group.days || []}
        rowProps={(row) => ({
          sx: row.isHoliday
            ? {
                bgcolor: 'action.hover',
                color: 'text.secondary',
                '& td': { bgcolor: 'action.hover' },
              }
            : undefined,
        })}
        isLoading={false}
        isSearch={false}
        isFilter={false}
        tableContainerProps={{
          sx: {
            height: { xs: 300, sm: 340, md: 380, lg: 420, xl: 460 },
            maxHeight: { xs: 300, sm: 340, md: 380, lg: 420, xl: 460 },
            overflowY: 'visible',
            overflowX: 'auto',
            '& .simplebar-content-wrapper': {
              overflowX: 'auto !important',
              overflowY: 'visible !important',
            },
            '& .simplebar-content': {
              minWidth: '100%',
            },
            '& .MuiTable-root': {
              minWidth: REGISTER_DAY_TABLE_MIN_WIDTH,
              width: '100%',
              tableLayout: 'auto',
              borderSpacing: 0,
            },
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap',
              textAlign: 'left',
            },
          },
        }}
        wrapperProps={{
          sx: {
            pt: 0,
            height: '100%',
          },
        }}
        noDataText="No daily attendance found for this staff member."
      />
    </Box>
  );

  const columns: IColumn[] = [
    {
      id: 'select',
      excludeFromExport: true,
      sticky: true,
      label: (
        <Checkbox
          size="small"
          inputProps={{
            'aria-label': 'Select editable attendance on this page',
          }}
          disabled={!canEditRows || !selectableDayRows.length}
          checked={
            selectableDayRows.length > 0 &&
            selectableDayRows.every((row) => selectedIdSet.has(getDayIdentifier(row)))
          }
          indeterminate={
            selectedIds.length > 0 &&
            !selectableDayRows.every((row) => selectedIdSet.has(getDayIdentifier(row)))
          }
          onChange={(event) => {
            setSelectedIds(
              event.target.checked ? selectableDayRows.map((row) => getDayIdentifier(row)) : []
            );
          }}
        />
      ),
      width: 36,
      minWidth: 36,
      stickyPosition: 'left',
      isSort: false,
      isFilter: false,
      headerSx: {
        px: 0.5,
      },
      cellSx: {
        px: 0.5,
      },
      render: (_value, row: any) => (
        <Checkbox
          size="small"
          disabled={!canEditRows || getEditableDayIds(row).length === 0}
          inputProps={{
            'aria-label': `Select editable attendance for ${row.employeeName}`,
          }}
          checked={isGroupSelected(row)}
          indeterminate={isGroupIndeterminate(row)}
          onChange={(event) => toggleGroupSelection(row, event.target.checked)}
        />
      ),
    },
    {
      id: 'employeeName',
      label: 'Staff',
      width: 220,
      minWidth: 220,
      sticky: true,
      align: 'left',
      stickyPosition: 'left',
      filterType: 'string',
      isSort: true,
      isFilter: true,
      render: (value, row: any) => (
        <Stack spacing={0.35}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {[row.employeeCode, row.educationMediumStageName].filter(Boolean).join(' / ')}
          </Typography>
        </Stack>
      ),
      children: (row: any) => renderDailyRows(row),
    },
    {
      id: 'present',
      label: 'Attendance',
      align: 'left',
      width: 140,
      minWidth: 140,
      filterType: 'number',
      isSort: true,
      isFilter: true,
      render: (_value, row: any) => (
        <Stack spacing={0.35}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {row.present} / {row.recordedDays}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Present days
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'exceptions',
      label: 'Exceptions',
      align: 'left',
      width: 190,
      minWidth: 190,
      isSort: true,
      isFilter: true,
      filterType: 'string',
      render: (_value, row: any) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {row.absent > 0 && (
            <Label color="error" variant="soft">
              Absent {row.absent}
            </Label>
          )}
          {row.halfDay > 0 && (
            <Label color="warning" variant="soft">
              Half day {row.halfDay}
            </Label>
          )}
          {row.missingPunch > 0 && (
            <Label color="warning" variant="soft">
              Missing {row.missingPunch}
            </Label>
          )}
          {row.locked > 0 && (
            <Label color="error" variant="soft">
              Locked {row.locked}
            </Label>
          )}
          {!row.hasExceptions && (
            <Label color="success" variant="soft">
              Clear
            </Label>
          )}
        </Stack>
      ),
    },
    {
      id: 'employeeGroup',
      label: 'Group',
      width: 130,
      minWidth: 130,
      align: 'left',
      filterType: 'enum',
      enumOptions: [
        { label: 'Teaching', value: 'Teaching' },
        { label: 'Non teaching', value: 'NonTeaching' },
      ],
      render: (value) => (value === 'NonTeaching' ? 'Non teaching' : value),
      isSort: true,
      isFilter: true,
    },
    {
      id: 'department',
      label: 'Department',
      width: 120,
      minWidth: 120,
      align: 'left',
      filterType: 'string',
      isSort: true,
      isFilter: true,
      defaultHidden: true,
    },
    {
      id: 'editability',
      label: 'Editability',
      align: 'left',
      width: 145,
      minWidth: 145,
      isSort: true,
      isFilter: true,
      filterType: 'string',
      render: (_value, row: any) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Label color="info" variant="soft">
            {row.editable} editable
          </Label>
          {row.locked > 0 && (
            <Label color="error" variant="soft">
              {row.locked} locked
            </Label>
          )}
        </Stack>
      ),
    },
    {
      excludeFromExport: true,
      id: 'actions',
      label: 'Actions',
      width: 96,
      minWidth: 96,
      align: 'left',
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right',
      headerSx: {
        right: 0,
        boxShadow: '-4px 0 8px rgba(0,0,0,0.08)',
      },
      cellSx: {
        right: 0,
        bgcolor: 'background.paper',
        boxShadow: '-4px 0 8px rgba(0,0,0,0.08)',
      },
      render: (_value, row: any) => (
        <CustomTooltip title="Bulk adjust editable days for this staff member" arrow>
          <span>
            <IconButton
              size="small"
              aria-label={`Adjust attendance for ${row.employeeName || 'staff member'}`}
              disabled={!canEditRows || getEditableDayIds(row).length === 0}
              onClick={() =>
                openBulk((row.days || []).filter((day: AttendanceRegisterRow) => day.canEdit))
              }
            >
              <Iconify icon="solar:pen-2-bold" width={18} />
            </IconButton>
          </span>
        </CustomTooltip>
      ),
    },
  ];

  const renderAdjustmentDialog = (isBulk: boolean) => (
    <CustomDialog
      open={isBulk ? bulkOpen : Boolean(editRow)}
      handleClose={() => {
        if (!adjustmentInFlight.current) closeDialogs();
      }}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">
            {isBulk ? 'Bulk Adjust Attendance' : 'Adjust Attendance'}
          </Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title={
              isBulk
                ? 'Update status, in/out time, remarks, and reason for all selected editable attendance days in one step. Locked rows are skipped automatically.'
                : 'Update status, in/out time, remarks, and reason for this attendance day. Changes are applied only when the day is editable.'
            }
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {isBulk
              ? 'Apply one adjustment across selected editable days. Any locked day remains unchanged.'
              : 'Use this form to correct attendance details for the selected day.'}
          </Typography>
          {isBulk && (
            <Typography variant="body2" color="text.secondary">
              {editableSelectedIds.length + editableSelectedEmployeeDates.length} editable selected,{' '}
              {blockedSelectedCount} locked selected.
            </Typography>
          )}
          <ShakingTextField error={false}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                disabled={savingAdjustment}
                value={draft.status}
                onChange={(event) => {
                  const nextStatus = event.target.value as RegisterStatus;
                  setDraft((prev) => ({
                    ...prev,
                    status: nextStatus,
                    ...(nextStatus === 'FullDayLeave' ? { inTime: '', outTime: '' } : {}),
                  }));
                  setDraftErrors((prev) => ({
                    ...prev,
                    inTime: '',
                    outTime: '',
                  }));
                }}
              >
                {STATUS_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ShakingTextField>
          {!showAdjustmentTimes && (
            <Typography variant="body2" color="text.secondary">
              Status-only attendance does not record in or out times.
            </Typography>
          )}
          {isBulk &&
            showAdjustmentTimes &&
            adjustmentRows.some((row) => row.canEdit && row.captureMode === 'manual_status') && (
              <Typography variant="body2" color="text.secondary">
                Times apply only to selected days with time-based attendance. Status-only days keep
                no punch times.
              </Typography>
            )}
          {showAdjustmentTimes && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <ShakingTextField error={Boolean(draftErrors.inTime)}>
                <TimePicker
                  label="In time"
                  disabled={savingAdjustment}
                  value={draft.inTime ? dayjs(`2000-01-01T${draft.inTime}`) : null}
                  onChange={(newValue) => {
                    setDraft((prev) => ({
                      ...prev,
                      inTime: newValue && newValue.isValid() ? newValue.format('HH:mm') : '',
                    }));
                    if (draftErrors.inTime) {
                      setDraftErrors((prev) => ({ ...prev, inTime: '' }));
                    }
                  }}
                  format="HH:mm"
                  ampm={false}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: Boolean(draftErrors.inTime),
                      helperText: draftErrors.inTime,
                    },
                  }}
                />
              </ShakingTextField>
              <ShakingTextField error={Boolean(draftErrors.outTime)}>
                <TimePicker
                  label="Out time"
                  disabled={savingAdjustment}
                  value={draft.outTime ? dayjs(`2000-01-01T${draft.outTime}`) : null}
                  onChange={(newValue) => {
                    setDraft((prev) => ({
                      ...prev,
                      outTime: newValue && newValue.isValid() ? newValue.format('HH:mm') : '',
                    }));
                    if (draftErrors.outTime) {
                      setDraftErrors((prev) => ({ ...prev, outTime: '' }));
                    }
                  }}
                  format="HH:mm"
                  ampm={false}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: Boolean(draftErrors.outTime),
                      helperText: draftErrors.outTime,
                    },
                  }}
                />
              </ShakingTextField>
            </Stack>
          )}
          <ShakingTextField error={Boolean(draftErrors.remarks)}>
            <TextField
              size="small"
              label="Remarks"
              disabled={savingAdjustment}
              multiline
              minRows={2}
              value={draft.remarks}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, remarks: event.target.value }));
                if (draftErrors.remarks) {
                  setDraftErrors((prev) => ({ ...prev, remarks: '' }));
                }
              }}
              fullWidth
              error={Boolean(draftErrors.remarks)}
              helperText={draftErrors.remarks}
            />
          </ShakingTextField>
          <ShakingTextField error={Boolean(draftErrors.reason)}>
            <TextField
              size="small"
              label="Reason"
              disabled={savingAdjustment}
              value={draft.reason}
              fullWidth
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, reason: event.target.value }));
                if (draftErrors.reason) {
                  setDraftErrors((prev) => ({ ...prev, reason: '' }));
                }
              }}
              error={Boolean(draftErrors.reason)}
              helperText={draftErrors.reason}
            />
          </ShakingTextField>
          {adjustmentError && (
            <Typography
              role="alert"
              variant="body2"
              color="error.main"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {adjustmentError}
            </Typography>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (!adjustmentInFlight.current) closeDialogs();
          }}
          disabled={savingAdjustment}
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          disabled={savingAdjustment || (isBulk && bulkRetryBlocked)}
          onClick={isBulk ? saveBulk : saveInline}
        >
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      <CustomBreadcrumbs
        layout="inline"
        action={
          canAdjust && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="solar:pen-2-bold" />}
              disabled={!canEditRows || !selectedRows.some((row) => row.canEdit)}
              onClick={() => openBulk(selectedRows)}
            >
              Bulk adjust{selectedRows.length ? ` (${selectedRows.length})` : ''}
            </Button>
          )
        }
        heading="Attendance Register"
        description="Review staff attendance and resolve exceptions for the selected period."
        links={[
          { name: 'Attendance Management', href: hrPaths.attendance.dashboard },
          { name: 'Attendance Register' },
        ]}
      />

      <Stack spacing={1} sx={{ px: 1, pb: 1, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            role="group"
            aria-label="Register period navigation"
            sx={{ width: { xs: 1, sm: 'auto' }, minWidth: 0 }}
          >
            <CustomTooltip title="Previous month">
              <IconButton
                size="small"
                aria-label="Previous month"
                disabled={queryLocked}
                onClick={() => shiftMonth(-1)}
              >
                <Iconify icon="solar:alt-arrow-left-linear" />
              </IconButton>
            </CustomTooltip>
            <Box sx={{ flex: { xs: 1, sm: '0 0 256px' }, minWidth: 0 }}>
              <CustomDateRangePicker
                label="Register period"
                title="Register Period"
                value={[filters.startDate, filters.endDate]}
                dateFormat="DD/MM/YYYY"
                disabled={queryLocked}
                onChange={setPeriod}
              />
            </Box>
            <CustomTooltip title="Next month">
              <IconButton
                size="small"
                aria-label="Next month"
                disabled={queryLocked}
                onClick={() => shiftMonth(1)}
              >
                <Iconify icon="solar:alt-arrow-right-linear" />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <Button
            size="small"
            color="inherit"
            disabled={queryLocked}
            onClick={() => {
              const defaults = getDefaultFilters();
              setPeriod([defaults.startDate, defaults.endDate]);
            }}
          >
            This month
          </Button>
          <Button
            size="small"
            color="inherit"
            variant={advancedFiltersOpen ? 'soft' : 'outlined'}
            startIcon={<Iconify icon="solar:filter-linear" />}
            aria-expanded={advancedFiltersOpen}
            aria-controls="attendance-register-filters"
            onClick={() => setAdvancedFiltersOpen((prev) => !prev)}
          >
            Filters{appliedFilters.length ? ` (${appliedFilters.length})` : ''}
          </Button>
          {!!appliedFilters.length && (
            <Button size="small" color="inherit" disabled={queryLocked} onClick={resetFilters}>
              Reset filters
            </Button>
          )}
          <Typography
            variant="caption"
            role="status"
            aria-live="polite"
            color="text.secondary"
            sx={{ ml: 'auto' }}
          >
            {tableError
              ? 'Attendance could not be loaded'
              : isFetching
                ? data
                  ? 'Refreshing attendance…'
                  : 'Loading attendance…'
                : data
                  ? `${data.totalCount} staff found`
                  : missingYear
                    ? 'Select an academic year'
                    : 'Loading attendance…'}
          </Typography>
        </Stack>
        {periodError && (
          <Typography role="alert" variant="caption" color="error">
            {periodError}
          </Typography>
        )}
        <Collapse in={advancedFiltersOpen} timeout="auto" unmountOnExit>
          <Box
            id="attendance-register-filters"
            role="region"
            aria-label="Attendance register filters"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.5,
              py: 0.5,
            }}
          >
            <CustomSelect
              multiple
              isSearch
              size="small"
              fullWidth
              label="Divisions"
              disabled={queryLocked}
              isLoading={stagesLoading}
              value={filters.educationMediumStageIds}
              options={stages.map((stage) => ({
                value: stage.id,
                label: stage.label,
              }))}
              onChange={(value) =>
                setFilter(
                  'educationMediumStageIds',
                  value.filter((id): id is string => typeof id === 'string')
                )
              }
              renderValue={(value) => (value.length ? `${value.length} selected` : 'All divisions')}
              helperText="All divisions, or any selected academic organization assignment."
            />
            <PaginatedSearchSelect
              size="small"
              fullWidth
              label="Staff"
              disabled={queryLocked}
              value={selectedEmployeeOption}
              fetchOptions={fetchStaffOptions}
              getOptionLabel={getEmployeeOptionLabel}
              getOptionKey={(option: any) => option.id}
              isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
              filterOptions={(options) => options}
              onChange={(_event, value: any) => {
                setSelectedEmployeeOption(value);
                setFilter('employeeId', value?.id || '');
              }}
            />

            <FormControl size="small" fullWidth disabled={queryLocked}>
              <InputLabel id="register-group-label">Staff group</InputLabel>
              <Select
                label="Staff group"
                labelId="register-group-label"
                value={filters.employeeGroup}
                onChange={(event) => setFilter('employeeGroup', event.target.value)}
              >
                <MenuItem value="all">All groups</MenuItem>
                <MenuItem value="Teaching">Teaching</MenuItem>
                <MenuItem value="NonTeaching">Non teaching</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={queryLocked}>
              <InputLabel id="register-status-label">Attendance status</InputLabel>
              <Select
                label="Attendance status"
                labelId="register-status-label"
                value={filters.status}
                onChange={(event) => setFilter('status', event.target.value)}
              >
                <MenuItem value="all">All statuses</MenuItem>
                {STATUS_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={queryLocked}>
              <InputLabel id="register-payroll-label">Payroll state</InputLabel>
              <Select
                label="Payroll state"
                labelId="register-payroll-label"
                value={filters.payrollState}
                onChange={(event) => setFilter('payrollState', event.target.value)}
              >
                {PAYROLL_STATES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Department contains"
              value={departmentInput}
              disabled={queryLocked}
              onChange={(event) => setDepartmentInput(event.target.value)}
            />
            <CustomSelect
              size="small"
              fullWidth
              label="Staff with exceptions"
              disabled={queryLocked}
              value={filters.exceptionFilter}
              options={EXCEPTION_FILTERS}
              onChange={(value) => {
                const match = EXCEPTION_FILTERS.find((option) => option.value === value);
                if (match) setFilter('exceptionFilter', match.value);
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Criteria combine with search across all pages. Attendance status and payroll state
            narrow the days and totals shown; exceptions match staff within those days. Export
            includes all matching staff.
          </Typography>
        </Collapse>
        {appliedFilters.length > 0 && (
          <Stack
            direction="row"
            gap={0.75}
            flexWrap="wrap"
            useFlexGap
            aria-label="Applied register filters"
          >
            {appliedFilters.map((filter) => (
              <Chip
                key={filter.key}
                size="small"
                label={filter.label}
                onDelete={queryLocked ? undefined : filter.clear}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="hr-attendance-register"
        tableTitle="Attendance register"
        onExport={exportTable}
        error={tableError}
        onRetry={retryTable}
        columns={columns}
        data={rows}
        getRowKey={(row) => row.employeeId}
        isLoading={
          changingYear || (!skipRegister && !tableError && (isLoading || (isFetching && !data)))
        }
        isRefreshing={isFetching && !!data}
        {...tableProps}
        serverSide
        serverSidePagination
        totalCount={data?.totalCount || 0}
        serverSideSearch
        searchTerm={filters.search}
        searchFieldProps={{ disabled: queryLocked }}
        paginationDisabled={queryLocked}
        onServerSearch={(search) => setFilter('search', search)}
        page={page - 1}
        rowsPerPage={pageSize}
        onServerPagination={(nextPage, nextPageSize) => {
          if (queryLocked) return;
          setPage(nextPage);
          setPageSize(nextPageSize);
          setSelectedIds([]);
        }}
        wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' } }}
        tableContainerProps={{
          sx: {
            height: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'auto',
            '& .simplebar-content-wrapper': {
              overflowX: 'auto !important',
              overflowY: 'auto !important',
            },
            '& .simplebar-content': {
              minWidth: '100%',
            },
            '& .MuiTableHead-root .MuiTableRow-root > .MuiTableCell-root:first-of-type': {
              width: 44,
              minWidth: 44,
              px: 0.5,
              textAlign: 'center',
            },
            '& .MuiTableBody-root .MuiTableRow-root > .MuiTableCell-root:first-of-type': {
              width: 44,
              minWidth: 44,
              px: 0.5,
              textAlign: 'center',
            },
            '& .MuiTableBody-root .MuiTableCell-root[colspan]': {
              px: 0,
              py: 0,
            },
            '& .MuiTableBody-root .MuiTableCell-root[colspan] .MuiCollapse-root > .MuiBox-root': {
              m: 0,
            },
            '& .MuiTable-root': {
              minWidth: REGISTER_TABLE_MIN_WIDTH,
              width: '100%',
              tableLayout: 'auto',
            },
          },
        }}
        noDataText={
          missingYear ? (
            'Select an academic year to view attendance.'
          ) : (
            <Stack spacing={1} alignItems="center">
              <Typography>No staff attendance matches this period and filters.</Typography>
              <Button size="small" onClick={resetFilters}>
                Reset filters
              </Button>
            </Stack>
          )
        }
      />

      {renderAdjustmentDialog(false)}
      {renderAdjustmentDialog(true)}
    </Box>
  );
};

export default AttendanceTrackingScreen;
