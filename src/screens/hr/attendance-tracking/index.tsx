'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useSearchParams } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
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
  Divider,
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
  { label: 'Half day', value: 'HalfDayLeave', wire: 'HALF_DAY', color: 'warning' },
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
  employeeGroup: 'all',
  department: '',
  status: 'all',
  payrollState: 'All' as PayrollState,
  exceptionFilter: 'All' as ExceptionFilter,
  search: '',
});

type AttendanceDraft = {
  status: RegisterStatus;
  inTime: string;
  outTime: string;
  remarks: string;
  reason: string;
};

type AttendanceDraftErrors = {
  inTime?: string;
  outTime?: string;
  remarks?: string;
  reason?: string;
};

const validateAttendanceDraft = (draft: AttendanceDraft): AttendanceDraftErrors => {
  const errors: AttendanceDraftErrors = {};
  const inTime = draft.inTime?.trim();
  const outTime = draft.outTime?.trim();
  const requiresTime = draft.status === 'Present' || draft.status === 'HalfDayLeave';

  if (requiresTime) {
    if (!inTime) errors.inTime = 'In time is required.';
    if (!outTime) errors.outTime = 'Out time is required.';
  }

  if ((inTime && !outTime) || (!inTime && outTime)) {
    if (!inTime) errors.inTime = 'In time is required when out time is provided.';
    if (!outTime) errors.outTime = 'Out time is required when in time is provided.';
  }

  if (inTime && outTime) {
    const parsedIn = dayjs(inTime, 'HH:mm', true);
    const parsedOut = dayjs(outTime, 'HH:mm', true);

    if (!parsedIn.isValid()) errors.inTime = 'Invalid in time.';
    if (!parsedOut.isValid()) errors.outTime = 'Invalid out time.';

    if (parsedIn.isValid() && parsedOut.isValid() && !parsedOut.isAfter(parsedIn)) {
      errors.outTime = 'Out time must be after in time.';
    }
  }
  return errors;
};

const AttendanceTrackingScreen = () => {
  const dashboardParams = useSearchParams();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [filters, setFilters] = useState(getDefaultFilters);
  useEffect(() => {
    const start = dashboardParams.get('startDate');
    const end = dashboardParams.get('endDate');
    const employeeId = dashboardParams.get('employeeId');
    if (
      start &&
      end &&
      dayjs(start).isValid() &&
      dayjs(end).isValid() &&
      dayjs(start).format('YYYY-MM-DD') === start &&
      dayjs(end).format('YYYY-MM-DD') === end &&
      !dayjs(end).isBefore(dayjs(start), 'day')
    ) {
      setFilters((previous) => ({
        ...previous,
        startDate: dayjs(start),
        endDate: dayjs(end),
        employeeId: employeeId && /^[a-f0-9-]{36}$/i.test(employeeId) ? employeeId : '',
      }));
    }
  }, [dashboardParams]);
  const [selectedEmployeeOption, setSelectedEmployeeOption] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editRow, setEditRow] = useState<AttendanceRegisterRow | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [sorting, setSorting] = useState('');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<AttendanceDraft>({
    status: 'Present' as RegisterStatus,
    inTime: '',
    outTime: '',
    remarks: '',
    reason: '',
  });
  const [draftErrors, setDraftErrors] = useState<AttendanceDraftErrors>({});
  // A dashboard link carries an explicit date; let the register resolve that date's calendar.
  const academicYearId =
    filters.employeeId &&
    filters.employeeId === dashboardParams.get('employeeId') &&
    dashboardParams.get('startDate')
      ? undefined
      : currentYear?.id;
  const { options: stages, isLoading: stagesLoading } =
    useAcademicOrganizationOptions(academicYearId);
  const [findEmployees] = useLazyGetEmployeeQuery();
  const fetchStaffOptions = useCallback(
    async (search: string, nextPage: number) => {
      const result = await findEmployees({ page: nextPage, pageSize: 50, search }).unwrap();
      return { data: result.items || [], hasMore: nextPage * 50 < result.totalCount };
    },
    [findEmployees]
  );
  const previousYear = React.useRef(academicYearId);
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
      sorting,
      employeeId: filters.employeeId,
      employeeGroup:
        filters.employeeGroup === 'all' ? undefined : filters.employeeGroup || undefined,
      department: filters.department,
      status: filters.status === 'all' ? undefined : filters.status,
      payrollState: filters.payrollState,
      exceptionFilter: filters.exceptionFilter,
      search: filters.search,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
    }),
    [academicYearId, filters, page, pageSize, sorting]
  );

  const exportTable = useHrTableExport('hr-attendance-register', queryParams);
  const {
    currentData: data,
    isLoading,
    isFetching,
    error: tableError,
    refetch: retryTable,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGroupedAttendanceRegisterQuery,
    params: queryParams,
    options: {
      skip: !filters.startDate || !filters.endDate || (!academicYearId && !filters.employeeId),
    },
  });

  const [adjustAttendance, { isLoading: isAdjusting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAdjustAttendanceRegisterMutation,
  });

  const [bulkAdjustAttendance, { isLoading: isBulkAdjusting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useBulkAdjustAttendanceRegisterMutation,
  });

  const rows = useMemo(() => (data?.items || []) as GroupedAttendanceRegisterRow[], [data?.items]);
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
  const getDayIdentifier = useCallback(
    (day: AttendanceRegisterRow) => day.attendanceId || `${day.employeeId}_${day.attendanceDate}`,
    []
  );

  const selectableDayRows = useMemo(() => allDayRows.filter((row) => row.canEdit), [allDayRows]);
  const selectedRows = useMemo(
    () => allDayRows.filter((row) => selectedIds.includes(getDayIdentifier(row))),
    [allDayRows, selectedIds, getDayIdentifier]
  );
  const blockedSelectedCount = selectedRows.filter((row) => !row.canEdit).length;
  const editableSelectedIds = useMemo(
    () =>
      selectedRows
        .filter((row) => row.canEdit && row.attendanceId)
        .map((row) => row.attendanceId as string),
    [selectedRows]
  );
  const editableSelectedEmployeeDates = useMemo(
    () =>
      selectedRows
        .filter((row) => row.canEdit && !row.attendanceId)
        .map((row) => ({
          employeeId: row.employeeId,
          attendanceDate: row.attendanceDate,
        })),
    [selectedRows]
  );

  const resetPaging = () => {
    setPage(1);
    setSelectedIds([]);
  };

  const setFilter = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    resetPaging();
  };

  const resetFilters = () => {
    setFilters(getDefaultFilters());
    setSelectedEmployeeOption(null);
    resetPaging();
  };
  const shiftMonth = (offset: number) => {
    if (!filters.startDate) return;
    const month = filters.startDate.add(offset, 'month');
    setFilters((prev) => ({
      ...prev,
      startDate: month.startOf('month'),
      endDate: month.endOf('month'),
    }));
    resetPaging();
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
        clear: () => setFilter(key, getDefaultFilters()[key]),
      })),
  ];

  const openEdit = (row: AttendanceRegisterRow) => {
    if (!row.canEdit) return;
    setEditRow(row);
    setDraftErrors({});
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
    setDraftErrors({});
  };

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
    inTime: toWireTime(draft.inTime),
    outTime: toWireTime(draft.outTime),
    remarks: draft.remarks,
    reason: draft.reason,
  });

  const saveInline = async () => {
    if (!editRow) return;

    const errors = validateAttendanceDraft(draft);
    if (Object.keys(errors).length) {
      setDraftErrors(errors);
      shikshaMitraToast.error({ message: 'Please fix the validation errors before saving.' });
      return;
    }

    try {
      await adjustAttendance(buildAdjustmentPayload(editRow)).unwrap();
      shikshaMitraToast.success({ message: 'Attendance adjusted.' });
      closeDialogs();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to adjust attendance.' });
    }
  };

  const saveBulk = async () => {
    if (!editableSelectedIds.length && !editableSelectedEmployeeDates.length) {
      shikshaMitraToast.error({ message: 'No editable rows selected.' });
      return;
    }

    const errors = validateAttendanceDraft(draft);
    if (Object.keys(errors).length) {
      setDraftErrors(errors);
      shikshaMitraToast.error({ message: 'Please fix the validation errors before saving.' });
      return;
    }

    try {
      const result = await bulkAdjustAttendance(buildAdjustmentPayload()).unwrap();
      shikshaMitraToast.success({
        message: `Updated ${result?.updatedCount || 0} row(s), skipped ${result?.skippedCount || 0}.`,
      });
      setSelectedIds([]);
      closeDialogs();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to bulk adjust attendance.' });
    }
  };

  const getEditableDayIds = (group: GroupedAttendanceRegisterRow) =>
    (group.days || []).filter((day) => day.canEdit).map((day) => getDayIdentifier(day));

  const isGroupSelected = (group: GroupedAttendanceRegisterRow) => {
    const editableIds = getEditableDayIds(group);
    return editableIds.length > 0 && editableIds.every((id) => selectedIds.includes(id));
  };

  const isGroupIndeterminate = (group: GroupedAttendanceRegisterRow) => {
    const editableIds = getEditableDayIds(group);
    const selectedEditableCount = editableIds.filter((id) => selectedIds.includes(id)).length;
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
          disabled={!row.canEdit}
          checked={Boolean(selectedIds.includes(getDayIdentifier(row as AttendanceRegisterRow)))}
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
      filterType: 'string',
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
      isSort: false,
      isFilter: false,
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
                disabled={!dayRow.canEdit}
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
          inputProps={{ 'aria-label': 'Select editable attendance on this page' }}
          checked={
            selectableDayRows.length > 0 &&
            selectableDayRows.every((row) => selectedIds.includes(getDayIdentifier(row)))
          }
          indeterminate={
            selectedIds.length > 0 &&
            !selectableDayRows.every((row) => selectedIds.includes(getDayIdentifier(row)))
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
          disabled={getEditableDayIds(row).length === 0}
          inputProps={{ 'aria-label': `Select editable attendance for ${row.employeeName}` }}
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
      isSort: false,
      isFilter: false,
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
        { label: 'Non teaching', value: 'Non teaching' },
      ],
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
      isSort: false,
      isFilter: false,
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
              disabled={getEditableDayIds(row).length === 0}
              onClick={() => {
                toggleGroupSelection(row, true);
                setDraft({ status: 'Present', inTime: '', outTime: '', remarks: '', reason: '' });
                setDraftErrors({});
                setBulkOpen(true);
              }}
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
      handleClose={closeDialogs}
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
                value={draft.status}
                onChange={(event) => {
                  const nextStatus = event.target.value as RegisterStatus;
                  setDraft((prev) => ({
                    ...prev,
                    status: nextStatus,
                    ...(nextStatus === 'FullDayLeave' ? { inTime: '', outTime: '' } : {}),
                  }));
                  setDraftErrors((prev) => ({ ...prev, inTime: '', outTime: '' }));
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <ShakingTextField error={Boolean(draftErrors.inTime)}>
              <TimePicker
                label="In time"
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
          <ShakingTextField error={Boolean(draftErrors.remarks)}>
            <TextField
              size="small"
              label="Remarks"
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
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          onClick={closeDialogs}
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
          disabled={isAdjusting || isBulkAdjusting}
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
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="solar:pen-2-bold" />}
            disabled={!editableSelectedIds.length && !editableSelectedEmployeeDates.length}
            onClick={() => {
              setDraft({ status: 'Present', inTime: '', outTime: '', remarks: '', reason: '' });
              setDraftErrors({});
              setBulkOpen(true);
            }}
          >
            Bulk adjust{selectedRows.length ? ` (${selectedRows.length})` : ''}
          </Button>
        }
        heading="Attendance Register"
        description="Review staff attendance and resolve exceptions for the selected period."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Attendance Management', href: hrPaths.attendance.dashboard },
          { name: 'Attendance Register' },
        ]}
      />

      <Stack spacing={1} sx={{ px: 1, pb: 1, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <CustomTooltip title="Previous month">
            <IconButton
              size="small"
              aria-label="Previous month"
              disabled={!filters.startDate}
              onClick={() => shiftMonth(-1)}
            >
              <Iconify icon="solar:alt-arrow-left-linear" />
            </IconButton>
          </CustomTooltip>
          <Box sx={{ width: { xs: 'calc(100% - 80px)', sm: 290 }, minWidth: 0 }}>
            <CustomDateRangePicker
              label="Register period"
              value={[filters.startDate, filters.endDate]}
              dateFormat="DD/MM/YYYY"
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, startDate: value[0], endDate: value[1] }));
                resetPaging();
              }}
            />
          </Box>
          <CustomTooltip title="Next month">
            <IconButton
              size="small"
              aria-label="Next month"
              disabled={!filters.startDate}
              onClick={() => shiftMonth(1)}
            >
              <Iconify icon="solar:alt-arrow-right-linear" />
            </IconButton>
          </CustomTooltip>
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              const defaults = getDefaultFilters();
              setFilters((prev) => ({
                ...prev,
                startDate: defaults.startDate,
                endDate: defaults.endDate,
              }));
              resetPaging();
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
          <Button size="small" color="inherit" onClick={resetFilters}>
            Reset
          </Button>
          <Typography
            variant="caption"
            role="status"
            aria-live="polite"
            sx={{ ml: { sm: 'auto' } }}
          >
            {isFetching
              ? 'Updating staff…'
              : data
                ? `${data.totalCount} staff found`
                : 'Select a register period'}
          </Typography>
        </Stack>
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
              isLoading={stagesLoading}
              value={filters.educationMediumStageIds}
              options={stages.map((stage) => ({ value: stage.id, label: stage.label }))}
              onChange={(value) => setFilter('educationMediumStageIds', value)}
              renderValue={(value) => (value.length ? `${value.length} selected` : 'All divisions')}
              helperText="All divisions, or any selected academic organization assignment."
            />
            <PaginatedSearchSelect
              size="small"
              fullWidth
              label="Staff"
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

            <FormControl size="small" fullWidth>
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
            <FormControl size="small" fullWidth>
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
            <FormControl size="small" fullWidth>
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
              value={filters.department}
              onChange={(event) => setFilter('department', event.target.value)}
            />
            <CustomSelect
              size="small"
              fullWidth
              label="Staff with exceptions"
              value={filters.exceptionFilter}
              options={EXCEPTION_FILTERS}
              onChange={(value) => setFilter('exceptionFilter', value)}
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
              <Chip key={filter.key} size="small" label={filter.label} onDelete={filter.clear} />
            ))}
          </Stack>
        )}
      </Stack>

      <Divider />

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
        isLoading={isLoading || (isFetching && !data)}
        isRefreshing={isFetching && !!data}
        serverSideSort
        serverSideSortMode="single"
        onServerSort={(_column, sorts) => {
          setSorting(sorts.map((sort) => `${sort.column} ${sort.direction}`).join(','));
          resetPaging();
        }}
        serverSide
        serverSidePagination
        totalCount={data?.totalCount || 0}
        serverSideSearch
        searchTerm={filters.search}
        onServerSearch={(search) => setFilter('search', search)}
        page={page - 1}
        rowsPerPage={pageSize}
        isFilter={false}
        onServerPagination={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
          setSelectedIds([]);
        }}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
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
          <Stack spacing={1} alignItems="center">
            <Typography>No staff attendance matches this period and filters.</Typography>
            <Button size="small" onClick={resetFilters}>
              Reset filters
            </Button>
          </Stack>
        }
      />

      {renderAdjustmentDialog(false)}
      {renderAdjustmentDialog(true)}
    </Box>
  );
};

export default AttendanceTrackingScreen;
