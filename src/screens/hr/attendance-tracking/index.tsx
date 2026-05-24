'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import React, { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetAttendanceRegisterQuery,
  useAdjustAttendanceRegisterMutation,
  useBulkAdjustAttendanceRegisterMutation,
} from 'src/redux/hr/attendanceApi';
import {
  Box,
  Stack,
  Button,
  Dialog,
  Select,
  Divider,
  Popover,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  DialogTitle,
  FormControl,
  Autocomplete,
  useMediaQuery,
  DialogContent,
  DialogActions,
} from '@mui/material';

type RegisterStatus = 'Present' | 'HalfDayLeave' | 'FullDayLeave';
type PayrollState = 'All' | 'Editable' | 'Locked';

type AttendanceRegisterRow = {
  attendanceId: string;
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
  isDayLocked: boolean;
  isPayrollLocked: boolean;
  canEdit: boolean;
  lockReason?: string | null;
};

const STATUS_OPTIONS = [
  { label: 'Present', value: 'Present', wire: 'PRESENT', color: 'success' },
  { label: 'Half day', value: 'HalfDayLeave', wire: 'HALF_DAY', color: 'warning' },
  { label: 'Absent', value: 'FullDayLeave', wire: 'ABSENT', color: 'error' },
] as const;

const PAYROLL_STATES: Array<{ label: string; value: PayrollState }> = [
  { label: 'All payroll states', value: 'All' },
  { label: 'Editable only', value: 'Editable' },
  { label: 'Locked only', value: 'Locked' },
];

const normalizeStatus = (value: RegisterStatus | number | string): RegisterStatus => {
  if (value === 0 || value === 'Present') return 'Present';
  if (value === 1 || value === 'HalfDayLeave') return 'HalfDayLeave';
  return 'FullDayLeave';
};

const statusMeta = (value: RegisterStatus | number | string) =>
  STATUS_OPTIONS.find((item) => item.value === normalizeStatus(value)) || STATUS_OPTIONS[2];

const toTimeValue = (value?: string | null) => (value ? dayjs(value).format('HH:mm') : '');

const toWireTime = (date: string, time?: string) => (time ? `${date}T${time}:00Z` : null);

const getDefaultFilters = () => ({
  startDate: dayjs().startOf('month'),
  endDate: dayjs(),
  educationMediumStageId: '',
  employeeId: '',
  employeeGroup: '',
  department: '',
  isTeaching: '',
  status: '',
  payrollState: 'All' as PayrollState,
  search: '',
});

const getMonthDays = (month: Dayjs) => {
  const start = month.startOf('month').startOf('week');
  const end = month.endOf('month').endOf('week');
  const days: Dayjs[] = [];
  let cursor = start;

  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }

  return days;
};

const DateRangeSelector = ({
  startDate,
  endDate,
  onChange,
}: {
  startDate: Dayjs;
  endDate: Dayjs;
  onChange: (start: Dayjs, end: Dayjs) => void;
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draftStart, setDraftStart] = useState<Dayjs | null>(startDate);
  const [draftEnd, setDraftEnd] = useState<Dayjs | null>(endDate);
  const [calendarMonth, setCalendarMonth] = useState(startDate.startOf('month'));
  const open = Boolean(anchorEl);

  const openCalendar = (event: React.MouseEvent<HTMLElement>) => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
    setCalendarMonth(startDate.startOf('month'));
    setAnchorEl(event.currentTarget);
  };

  const closeCalendar = () => setAnchorEl(null);

  const selectDate = (date: Dayjs) => {
    const selected = date.startOf('day');

    if (!draftStart || draftEnd || selected.isBefore(draftStart, 'day')) {
      setDraftStart(selected);
      setDraftEnd(null);
      return;
    }

    setDraftEnd(selected);
    onChange(draftStart, selected);
    closeCalendar();
  };

  const renderMonth = (month: Dayjs) => {
    const days = getMonthDays(month);
    const weekDays = days.slice(0, 7);

    return (
      <Box sx={{ width: 292 }}>
        <Typography variant="subtitle2" textAlign="center" sx={{ mb: 1 }}>
          {month.format('MMMM YYYY')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
          }}
        >
          {weekDays.map((day) => (
            <Typography
              key={day.format('dd')}
              variant="caption"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 0.5, fontWeight: 600 }}
            >
              {day.format('dd')}
            </Typography>
          ))}
          {days.map((day) => {
            const isOutsideMonth = !day.isSame(month, 'month');
            const isStart = Boolean(draftStart?.isSame(day, 'day'));
            const isEnd = Boolean(draftEnd?.isSame(day, 'day'));
            const isInRange = Boolean(
              draftStart &&
              draftEnd &&
              day.isAfter(draftStart, 'day') &&
              day.isBefore(draftEnd, 'day')
            );
            const isHighlighted = isStart || isEnd || isInRange;

            return (
              <Button
                key={day.format('YYYY-MM-DD')}
                size="small"
                onClick={() => selectDate(day)}
                sx={{
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  p: 0,
                  mx: 'auto',
                  borderRadius: isStart || isEnd ? '50%' : 1,
                  color: isStart || isEnd ? 'primary.contrastText' : 'text.primary',
                  bgcolor:
                    isStart || isEnd
                      ? 'primary.main'
                      : isInRange
                        ? 'primary.lighter'
                        : 'transparent',
                  opacity: isOutsideMonth ? 0.36 : 1,
                  '&:hover': {
                    bgcolor: isStart || isEnd ? 'primary.dark' : 'primary.lighter',
                  },
                }}
                variant={isHighlighted ? 'contained' : 'text'}
              >
                {day.date()}
              </Button>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <TextField
        size="small"
        fullWidth
        label="Date range"
        value={`${startDate.format('DD MMM YYYY')} - ${endDate.format('DD MMM YYYY')}`}
        onClick={openCalendar}
        InputProps={{
          readOnly: true,
          endAdornment: <Iconify icon="solar:calendar-date-bold" width={20} />,
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeCalendar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 1.5, mt: 0.5 } } }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <IconButton
              size="small"
              onClick={() => setCalendarMonth((prev) => prev.subtract(1, 'month'))}
            >
              <Iconify icon="solar:alt-arrow-left-linear" width={18} />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              Select start date, then end date
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCalendarMonth((prev) => prev.add(1, 'month'))}
            >
              <Iconify icon="solar:alt-arrow-right-linear" width={18} />
            </IconButton>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {renderMonth(calendarMonth)}
            {isDesktop && renderMonth(calendarMonth.add(1, 'month'))}
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};

const AttendanceTrackingScreen = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const stages = currentMedium?.educationMediumStages || [];
  const [filters, setFilters] = useState(getDefaultFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editRow, setEditRow] = useState<AttendanceRegisterRow | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [draft, setDraft] = useState({
    status: 'Present' as RegisterStatus,
    inTime: '',
    outTime: '',
    remarks: '',
    reason: '',
  });

  const { data: employeeOptions } = useGetEmployeeQuery({
    page: 1,
    pageSize: 50,
    search: filters.search,
  });

  const queryParams = useMemo(
    () => ({
      startDate: filters.startDate.format('YYYY-MM-DD'),
      endDate: filters.endDate.format('YYYY-MM-DD'),
      educationMediumStageId: filters.educationMediumStageId,
      employeeId: filters.employeeId,
      employeeGroup: filters.employeeGroup || undefined,
      department: filters.department,
      isTeaching: filters.isTeaching === '' ? undefined : filters.isTeaching === 'true',
      status: filters.status || undefined,
      payrollState: filters.payrollState,
      search: filters.search,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
    }),
    [filters, page, pageSize]
  );

  const { data, isLoading, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceRegisterQuery,
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

  const rows = useMemo(() => (data?.items || []) as AttendanceRegisterRow[], [data?.items]);
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.attendanceId)),
    [rows, selectedIds]
  );
  const blockedSelectedCount = selectedRows.filter((row) => !row.canEdit).length;
  const editableSelectedIds = selectedRows
    .filter((row) => row.canEdit)
    .map((row) => row.attendanceId);

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
    setDraft({
      status: normalizeStatus(row.status),
      inTime: toTimeValue(row.inTime),
      outTime: toTimeValue(row.outTime),
      remarks: row.remarks || '',
      reason: '',
    });
  };

  const closeDialogs = () => {
    setEditRow(null);
    setBulkOpen(false);
  };

  const buildAdjustmentPayload = (attendanceId?: string) => ({
    ...(attendanceId ? { attendanceId } : { attendanceIds: editableSelectedIds }),
    statusWire: statusMeta(draft.status).wire,
    inTime: toWireTime(editRow?.attendanceDate || selectedRows[0]?.attendanceDate, draft.inTime),
    outTime: toWireTime(editRow?.attendanceDate || selectedRows[0]?.attendanceDate, draft.outTime),
    remarks: draft.remarks,
    reason: draft.reason,
  });

  const saveInline = async () => {
    if (!editRow) return;
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

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'select',
        label: (
          <Checkbox
            size="small"
            checked={rows.length > 0 && rows.every((row) => selectedIds.includes(row.attendanceId))}
            indeterminate={
              selectedIds.length > 0 && !rows.every((row) => selectedIds.includes(row.attendanceId))
            }
            onChange={(event) => {
              setSelectedIds(event.target.checked ? rows.map((row) => row.attendanceId) : []);
            }}
          />
        ),
        minWidth: 52,
        isSort: false,
        isFilter: false,
        render: (_value, row: any) => (
          <Checkbox
            size="small"
            checked={selectedIds.includes(row.attendanceId)}
            onChange={(event) => {
              setSelectedIds((prev) =>
                event.target.checked
                  ? [...prev, row.attendanceId]
                  : prev.filter((id) => id !== row.attendanceId)
              );
            }}
          />
        ),
      },
      {
        id: 'employeeName',
        label: 'Employee',
        minWidth: 220,
        sticky: true,
        stickyPosition: 'left',
        render: (value, row: any) => (
          <Box>
            <Typography variant="body2">{value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.employeeCode}
            </Typography>
          </Box>
        ),
      },
      { id: 'attendanceDate', label: 'Date', minWidth: 120 },
      { id: 'educationMediumStageName', label: 'Organization', minWidth: 160 },
      { id: 'employeeGroup', label: 'Group', minWidth: 120 },
      { id: 'department', label: 'Department', minWidth: 140 },
      {
        id: 'status',
        label: 'Status',
        minWidth: 110,
        render: (value) => {
          const meta = statusMeta(value);
          return <Label color={meta.color as any}>{meta.label}</Label>;
        },
      },
      { id: 'inTime', label: 'In', minWidth: 90, render: (value) => toTimeValue(value) || '-' },
      { id: 'outTime', label: 'Out', minWidth: 90, render: (value) => toTimeValue(value) || '-' },
      { id: 'hoursWorked', label: 'Hours', minWidth: 90, render: (value) => value || '-' },
      { id: 'remarks', label: 'Remarks', minWidth: 180, render: (value) => value || '-' },
      {
        id: 'lock',
        label: 'Lock',
        minWidth: 150,
        render: (_value, row: any) =>
          row.canEdit ? (
            <Label color="success">Editable</Label>
          ) : (
            <CustomTooltip title={row.lockReason || 'Locked'} arrow>
              <span>
                <Label color="error">Locked</Label>
              </span>
            </CustomTooltip>
          ),
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 90,
        align: 'center',
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row: any) => (
          <CustomTooltip title={row.canEdit ? 'Edit attendance' : row.lockReason || 'Locked'} arrow>
            <span>
              <IconButton size="small" disabled={!row.canEdit} onClick={() => openEdit(row)}>
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
            </span>
          </CustomTooltip>
        ),
      },
    ],
    [rows, selectedIds]
  );

  const renderAdjustmentDialog = (isBulk: boolean) => (
    <Dialog
      open={isBulk ? bulkOpen : Boolean(editRow)}
      onClose={closeDialogs}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{isBulk ? 'Bulk adjust attendance' : 'Adjust attendance'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {isBulk && (
            <Typography variant="body2" color="text.secondary">
              {editableSelectedIds.length} editable selected, {blockedSelectedCount} locked
              selected.
            </Typography>
          )}
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={draft.status}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, status: event.target.value as RegisterStatus }))
              }
            >
              {STATUS_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="In time"
              type="time"
              fullWidth
              value={draft.inTime}
              onChange={(event) => setDraft((prev) => ({ ...prev, inTime: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Out time"
              type="time"
              fullWidth
              value={draft.outTime}
              onChange={(event) => setDraft((prev) => ({ ...prev, outTime: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <TextField
            size="small"
            label="Remarks"
            multiline
            minRows={2}
            value={draft.remarks}
            onChange={(event) => setDraft((prev) => ({ ...prev, remarks: event.target.value }))}
          />
          <TextField
            size="small"
            label="Reason"
            value={draft.reason}
            onChange={(event) => setDraft((prev) => ({ ...prev, reason: event.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialogs}>Cancel</Button>
        <Button
          variant="contained"
          disabled={isAdjusting || isBulkAdjusting}
          onClick={isBulk ? saveBulk : saveInline}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Attendance Register"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance Management', href: hrPaths.attendance.dashboard },
          { name: 'Attendance Register' },
        ]}
      />

      <Box
        sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'var(--shadows-2)' }}
      >
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <DateRangeSelector
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={(start, end) => {
                setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
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
                <MenuItem value="">All organizations</MenuItem>
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
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Group</InputLabel>
              <Select
                label="Group"
                value={filters.employeeGroup}
                onChange={(event) => setFilter('employeeGroup', event.target.value)}
              >
                <MenuItem value="">All groups</MenuItem>
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
                <MenuItem value="">All statuses</MenuItem>
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
            <TextField
              size="small"
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(event) => setFilter('search', event.target.value)}
            />
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Label color="success">Present {data?.summary?.present || 0}</Label>
              <Label color="warning">Half day {data?.summary?.halfDay || 0}</Label>
              <Label color="error">Absent {data?.summary?.absent || 0}</Label>
              <Label color="info">Editable {data?.summary?.editable || 0}</Label>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:restart-bold" />}
                onClick={() => {
                  setFilters(getDefaultFilters());
                  resetPaging();
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:pen-2-bold" />}
                disabled={!selectedIds.length}
                onClick={() => {
                  setDraft({ status: 'Present', inTime: '', outTime: '', remarks: '', reason: '' });
                  setBulkOpen(true);
                }}
              >
                Bulk adjust
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>

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
        tableContainerProps={{ sx: { maxHeight: 'calc(100vh - 360px)' } }}
        noDataText="No attendance rows found for the selected filters."
      />

      {renderAdjustmentDialog(false)}
      {renderAdjustmentDialog(true)}
    </Box>
  );
};

export default AttendanceTrackingScreen;
