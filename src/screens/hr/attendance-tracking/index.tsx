'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import React, { useMemo, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
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
  Checkbox,
  MenuItem,
  TextField,
  Accordion,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  Autocomplete,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

type RegisterStatus =
  | 'NotMarked'
  | 'Present'
  | 'HalfDay'
  | 'Absent'
  | 'HalfDayLeave'
  | 'FullDayLeave';
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
  status: RegisterStatus | number;
  isMarked?: boolean;
  isDayLocked: boolean;
  isPayrollLocked: boolean;
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

const normalizeStatus = (
  value: RegisterStatus | number | string | null | undefined
): RegisterStatus => {
  if (value === 1 || value === 'Present') return 'Present';
  if (value === 2 || value === 'HalfDay' || value === 'HalfDayLeave') return 'HalfDay';
  if (value === 3 || value === 'Absent' || value === 'FullDayLeave') return 'Absent';
  return 'NotMarked';
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
  educationMediumStageId: 'all',
  employeeId: '',
  employeeGroup: 'all',
  department: '',
  isTeaching: '',
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
  const theme = useTheme();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const stages = currentMedium?.educationMediumStages || [];
  const [filters, setFilters] = useState(getDefaultFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editRow, setEditRow] = useState<AttendanceRegisterRow | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [draft, setDraft] = useState<AttendanceDraft>({
    status: 'Present' as RegisterStatus,
    inTime: '',
    outTime: '',
    remarks: '',
    reason: '',
  });
  const [draftErrors, setDraftErrors] = useState<AttendanceDraftErrors>({});

  const { data: employeeOptions } = useGetEmployeeQuery({
    page: 1,
    pageSize: 50,
    search: filters.search,
  });

  const queryParams = useMemo(
    () => ({
      startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : '',
      endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : '',
      educationMediumStageId:
        filters.educationMediumStageId === 'all' ? undefined : filters.educationMediumStageId,
      employeeId: filters.employeeId,
      employeeGroup:
        filters.employeeGroup === 'all' ? undefined : filters.employeeGroup || undefined,
      department: filters.department,
      isTeaching: filters.isTeaching === '' ? undefined : filters.isTeaching === 'true',
      status: filters.status === 'all' ? undefined : filters.status,
      payrollState: filters.payrollState,
      exceptionFilter: filters.exceptionFilter,
      search: filters.search,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
    }),
    [filters, page, pageSize]
  );

  const { data, isLoading, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGroupedAttendanceRegisterQuery,
    params: queryParams,
    options: { skip: !filters.startDate || !filters.endDate },
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
  const allDayRows = useMemo(() => rows.flatMap((row) => row.days || []), [rows]);
  const selectedRows = useMemo(
    () => allDayRows.filter((row) => row.attendanceId && selectedIds.includes(row.attendanceId)),
    [allDayRows, selectedIds]
  );
  const blockedSelectedCount = selectedRows.filter((row) => !row.canEdit).length;
  const editableSelectedIds = selectedRows
    .filter((row) => row.canEdit && row.attendanceId)
    .map((row) => row.attendanceId as string);

  const resetPaging = () => {
    setPage(1);
    setSelectedIds([]);
  };

  const setFilter = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    resetPaging();
  };

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

  const buildAdjustmentPayload = (attendanceId?: string) => ({
    ...(attendanceId ? { attendanceId } : { attendanceIds: editableSelectedIds }),
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
      await adjustAttendance(buildAdjustmentPayload(editRow.attendanceId)).unwrap();
      shikshaMitraToast.success({ message: 'Attendance adjusted.' });
      closeDialogs();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to adjust attendance.' });
    }
  };

  const saveBulk = async () => {
    if (!editableSelectedIds.length) {
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
    (group.days || [])
      .filter((day) => day.canEdit && day.attendanceId)
      .map((day) => day.attendanceId as string);

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
      minWidth: 20,
      maxWidth: 30,
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (_value, row) => (
        <Checkbox
          size="small"
          disabled={!row.canEdit || !row.attendanceId}
          checked={Boolean(row.attendanceId && selectedIds.includes(row.attendanceId))}
          onChange={(event) => {
            if (row.attendanceId) {
              toggleDaySelection(row.attendanceId, event.target.checked);
            }
          }}
        />
      ),
    },
    {
      id: 'attendanceDate',
      label: 'Date',
      minWidth: 40,
      maxWidth: 60,
      align: 'left',
      sticky: true,
      filterType: 'date',
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 40,
      maxWidth: 60,
      sticky: true,
      align: 'left',
      render: (value, row) => {
        const meta = statusMeta(value);
        const missingPunch =
          normalizeStatus(row.status) === 'Present' && (!row.inTime || !row.outTime);
        return (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Label color={meta.color as any}>{meta.label}</Label>
            {missingPunch && <Label color="warning">Missing punch</Label>}
          </Stack>
        );
      },
    },
    {
      id: 'inTime',
      label: 'In',
      minWidth: 30,
      maxWidth: 45,
      align: 'left',
      render: (value) => toTimeValue(value) || '-',
    },
    {
      id: 'outTime',
      label: 'Out',
      minWidth: 40,
      maxWidth: 49,
      align: 'left',
      render: (value) => toTimeValue(value) || '-',
    },
    {
      id: 'hoursWorked',
      label: 'Hours',
      minWidth: 40,
      maxWidth: 55,
      align: 'left',
      render: (value) => value || '-',
    },
    {
      id: 'remarks',
      label: 'Remarks',
      minWidth: 60,
      maxWidth: 70,
      align: 'left',
      render: (value) => value || '-',
    },
    {
      id: 'lockInfo',
      label: 'Lock',
      minWidth: 40,
      maxWidth: 50,
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (_value, row) => {
        const dayRow = row as AttendanceRegisterRow;
        return dayRow.canEdit ? (
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
      id: 'actions',
      label: 'Actions',
      minWidth: 70,
      maxWidth: 90,
      width: 80,
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (_value, row) => {
        const dayRow = row as AttendanceRegisterRow;
        return (
          <CustomTooltip
            title={dayRow.canEdit ? 'Adjust this day' : dayRow.lockReason || 'Locked'}
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
    <Box sx={{ minHeight: 350, ml: 5 }}>
      <CustomizableTable
        tableId={`hr-attendance-register-days-${group.employeeId || group.employeeCode}`}
        columns={dayColumns}
        data={group.days || []}
        isLoading={false}
        isSearch={false}
        isFilter={false}
        // tableContainerProps={{
        //   sx: {
        //     maxHeight: 350,
        //     overflowX: 'hidden',
        //     overflowY: 'auto',
        //     '& .MuiTableCell-root': {
        //       whiteSpace: 'nowrap',
        //       textAlign: 'left',
        //     },
        //   },
        // }}
        // wrapperProps={{
        //   sx: {
        //     pt: 0,
        //   },
        // }}
        noDataText="No daily attendance found for this employee."
      />
    </Box>
  );

  const columns: IColumn[] = [
    {
      id: 'select',
      sticky: true,
      label: (
        <Checkbox
          size="small"
          checked={
            allDayRows.filter((row) => row.canEdit).length > 0 &&
            allDayRows
              .filter((row) => row.canEdit && row.attendanceId)
              .every((row) => selectedIds.includes(row.attendanceId as string))
          }
          indeterminate={
            selectedIds.length > 0 &&
            !allDayRows
              .filter((row) => row.canEdit && row.attendanceId)
              .every((row) => selectedIds.includes(row.attendanceId as string))
          }
          onChange={(event) => {
            setSelectedIds(
              event.target.checked
                ? allDayRows
                    .filter((row) => row.canEdit && row.attendanceId)
                    .map((row) => row.attendanceId as string)
                : []
            );
          }}
        />
      ),
      minWidth: 32,
      stickyPosition: 'left',
      isSort: false,
      isFilter: false,
      render: (_value, row: any) => (
        <Checkbox
          size="small"
          disabled={!row.editable}
          checked={isGroupSelected(row)}
          indeterminate={isGroupIndeterminate(row)}
          onChange={(event) => toggleGroupSelection(row, event.target.checked)}
        />
      ),
    },
    {
      id: 'employeeName',
      label: 'Employee',
      minWidth: 260,
      sticky: true,
      align: 'left',
      stickyPosition: 'left',
      render: (value, row: any) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {[row.employeeCode, row.educationMediumStageName].filter(Boolean).join(' • ')}
          </Typography>
        </Box>
      ),
      children: (row: any) => renderDailyRows(row),
    },
    {
      id: 'present',
      label: 'Attendance',
      align: 'left',
      minWidth: 150,
      render: (_value, row: any) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            Present {row.present} / {row.recordedDays}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Recorded days
          </Typography>
        </Box>
      ),
    },
    {
      id: 'exceptions',
      label: 'Exceptions',
      align: 'left',
      minWidth: 260,
      isSort: false,
      render: (_value, row: any) => (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {row.absent > 0 && <Label color="error">Absent {row.absent}</Label>}
          {row.halfDay > 0 && <Label color="warning">Half day {row.halfDay}</Label>}
          {row.missingPunch > 0 && <Label color="warning">Missing punch {row.missingPunch}</Label>}
          {row.locked > 0 && <Label color="error">Locked {row.locked}</Label>}
          {!row.hasExceptions && <Label color="success">Clear</Label>}
        </Stack>
      ),
    },
    { id: 'employeeGroup', label: 'Group', minWidth: 120, align: 'left' },
    { id: 'department', label: 'Department', minWidth: 140, align: 'left' },
    {
      id: 'editability',
      label: 'Editability',
      align: 'left',
      minWidth: 150,
      render: (_value, row: any) => `${row.editable} editable, ${row.locked} locked`,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 110,
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
        <CustomTooltip title="Bulk adjust editable days for this employee" arrow>
          <span>
            <IconButton
              size="small"
              disabled={!row.editable}
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
              {editableSelectedIds.length} editable selected, {blockedSelectedCount} locked
              selected.
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Attendance Register"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance Management', href: hrPaths.attendance.dashboard },
          { name: 'Attendance Register' },
        ]}
      />

      <Accordion
        expanded={filtersOpen}
        onChange={(_, expanded) => setFiltersOpen(expanded)}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 'var(--shadows-2)',
          '&:before': { display: 'none' },
          m: 0,
          '&.Mui-expanded': { m: 0 },
        }}
      >
        <AccordionSummary
          expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}
          sx={{ px: 1.5, minHeight: 'auto', m: 0 }}
        >
          <Stack
            direction="row"
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: '100%', pr: 1 }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Label color="default">Staff {data?.summary?.staffCount || 0}</Label>
              <Label color="success">Present {data?.summary?.present || 0}</Label>
              <Label color="warning">Half day {data?.summary?.halfDay || 0}</Label>
              <Label color="error">Absent {data?.summary?.absent || 0}</Label>
              <Label color="default">Not marked {data?.summary?.notMarked || 0}</Label>
              <Label color="warning">Missing punch {data?.summary?.missingPunch || 0}</Label>
              <Label color="info">Editable {data?.summary?.editable || 0}</Label>
              <Label color="error">Locked {data?.summary?.locked || 0}</Label>
            </Stack>
            <Stack direction="row" spacing={1} flexShrink={0} onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:restart-bold" />}
                size="small"
                onClick={() => {
                  setFilters(getDefaultFilters());
                  resetPaging();
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="solar:pen-2-bold" />}
                disabled={!selectedIds.length}
                onClick={() => {
                  setDraft({ status: 'Present', inTime: '', outTime: '', remarks: '', reason: '' });
                  setDraftErrors({});
                  setBulkOpen(true);
                }}
              >
                Bulk adjust
              </Button>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0, mt: 0 }}>
          <Stack spacing={1.5}>
            {/* Row 1: Search · Date Range · Organization · Employee */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                value={filters.search}
                onChange={(event) => setFilter('search', event.target.value)}
                placeholder="Search..."
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                  ),
                  endAdornment: filters.search && (
                    <IconButton size="small" onClick={() => setFilter('search', '')} edge="end">
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  ),
                  sx: {
                    borderRadius: 1.5,
                    bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                    fontSize: '14px',
                    '& fieldset': {
                      border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
                    },
                    '&:hover fieldset': {
                      borderColor: `${varAlpha(theme.vars.palette.grey['500Channel'], 0.4)} !important`,
                    },
                  },
                }}
                sx={{
                  maxWidth: '300px',
                  width: '100%',
                  '& .MuiInputBase-root': {
                    pr: 1,
                  },
                }}
              />
              <CustomDateRangePicker
                label="Start Date - End Date"
                value={[filters.startDate, filters.endDate]}
                dateFormat="DD/MM/YYYY"
                onChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    startDate: value[0],
                    endDate: value[1] ? value[1].endOf('day') : null,
                  }));
                  resetPaging();
                }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  label="Organization"
                  value={filters.educationMediumStageId}
                  onChange={(event) => setFilter('educationMediumStageId', event.target.value)}
                >
                  <MenuItem value="all">All organizations</MenuItem>
                  {stages.map((stage: any) => (
                    <MenuItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                size="small"
                fullWidth
                options={employeeOptions?.items || []}
                getOptionLabel={(option: any) =>
                  `${option.employeeName || option.fullName || option.firstName || ''} ${option.employeeCode ? `(${option.employeeCode})` : ''}`
                }
                onChange={(_event, value: any) => setFilter('employeeId', value?.id || '')}
                renderInput={(params) => <TextField {...params} label="Employee" />}
              />
            </Box>

            {/* Row 2: Group · Department · Status · Payroll State */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel>Group</InputLabel>
                <Select
                  label="Group"
                  value={filters.employeeGroup}
                  onChange={(event) => setFilter('employeeGroup', event.target.value)}
                >
                  <MenuItem value="all">All groups</MenuItem>
                  <MenuItem value="Teaching">Teaching</MenuItem>
                  <MenuItem value="NonTeaching">Non teaching</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                fullWidth
                label="Department"
                value={filters.department}
                onChange={(event) => setFilter('department', event.target.value)}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(event) => setFilter('status', event.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {STATUS_OPTIONS.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Payroll state</InputLabel>
                <Select
                  label="Payroll state"
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
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {EXCEPTION_FILTERS.map((item) => (
                <Chip
                  key={item.value}
                  size="small"
                  label={item.label}
                  color={filters.exceptionFilter === item.value ? 'primary' : 'default'}
                  variant={filters.exceptionFilter === item.value ? 'filled' : 'outlined'}
                  onClick={() => setFilter('exceptionFilter', item.value)}
                />
              ))}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <CustomizableTable
        tableId="hr-attendance-register"
        columns={columns}
        data={rows}
        isLoading={isLoading || isFetching}
        serverSide
        serverSidePagination
        totalCount={data?.totalCount || 0}
        isSearch={false}
        isFilter={false}
        onServerPagination={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        tableContainerProps={{
          sx: {
            maxHeight: filtersOpen ? 'calc(100vh - 360px)' : 'calc(100vh - 230px)',
            transition: 'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        noDataText="No employee attendance found for the selected filters."
      />

      {renderAdjustmentDialog(false)}
      {renderAdjustmentDialog(true)}
    </Box>
  );
};

export default AttendanceTrackingScreen;
