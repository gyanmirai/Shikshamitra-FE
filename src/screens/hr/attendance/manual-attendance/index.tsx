'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { RestartAlt } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Button, TextField, Typography } from '@mui/material';
import {
  useUpdateAttendanceMutation,
  useGetPaginatedAttendanceQuery,
} from 'src/redux/hr/attendanceApi';

// ---------------------------------------------------------------------------
// Status constants (mirroring AttendanceStatus enum from student module)
// ---------------------------------------------------------------------------
const STATUS = {
  Present: 'Present',
  Absent: 'Absent',
  Pending: 'Pending',
} as const;
type AttendanceStatusType = (typeof STATUS)[keyof typeof STATUS];

// ---------------------------------------------------------------------------
// Dummy data shown when the API returns no items
// ---------------------------------------------------------------------------
const DUMMY_DATA = [
  {
    id: '1',
    fullName: 'Arjun Sharma',
    employeeIdentifier: 'EMP001',
    timeIn: '09:00 AM',
    timeOut: '06:00 PM',
    status: STATUS.Present,
    remarks: 'Regular shift',
    errors: [],
    warnings: [],
  },
  {
    id: '2',
    fullName: 'Priya Verma',
    employeeIdentifier: 'EMP002',
    timeIn: '09:15 AM',
    timeOut: '06:15 PM',
    status: STATUS.Present,
    remarks: 'Slightly late',
    errors: [],
    warnings: ['Late arrival by 15 mins'],
  },
  {
    id: '3',
    fullName: 'Rahul Gupta',
    employeeIdentifier: 'EMP003',
    timeIn: '-',
    timeOut: '-',
    status: STATUS.Absent,
    remarks: 'Sick leave',
    errors: [],
    warnings: [],
  },
  {
    id: '4',
    fullName: 'Anjali Singh',
    employeeIdentifier: 'EMP004',
    timeIn: '09:00 AM',
    timeOut: '04:00 PM',
    status: STATUS.Present,
    remarks: 'Half day',
    errors: ['Early departure'],
    warnings: [],
  },
  {
    id: '5',
    fullName: 'Vikram Mehta',
    employeeIdentifier: 'EMP005',
    timeIn: '-',
    timeOut: '-',
    status: STATUS.Pending,
    remarks: '',
    errors: [],
    warnings: [],
  },
];

// ---------------------------------------------------------------------------
// Shared segmented-control button styles
// ---------------------------------------------------------------------------
const segmentBtnBase = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all 0.2s',
};

const ManualAttendanceScreen = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [employeeData, setEmployeeData] = useState<any[]>(DUMMY_DATA);
  const [isLocked, setIsLocked] = useState(false);

  const resetConfirmDialog = useBoolean();
  const lockConfirmDialog = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [updateAttendance, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAttendanceMutation,
  });

  const [query, setQuery] = useState({
    page: 0,
    pageSize: 20,
    search: '',
  });

  const { data, isLoading, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaginatedAttendanceQuery,
    params: {
      date: dateConvertor(dayjs(date).format(dateFormat)),
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
    },
    options: { skip: !date },
  });

  useEffect(() => {
    if (data?.items && data.items.length > 0) {
      setEmployeeData(
        data.items.map((item: any) => ({
          ...item,
          status: item.status || STATUS.Pending,
          remarks: item.remarks || '',
        }))
      );
    } else {
      setEmployeeData(DUMMY_DATA);
    }
  }, [data]);

  // -------------------------------------------------------------------------
  // Helpers to update a single row's status
  // -------------------------------------------------------------------------
  const setRowStatus = (id: string, status: AttendanceStatusType) => {
    if (isLocked) return;
    setEmployeeData((prev) => prev.map((emp) => (emp.id === id ? { ...emp, status } : emp)));
  };

  const setAllStatus = (status: AttendanceStatusType) => {
    if (isLocked) return;
    setEmployeeData((prev) => prev.map((emp) => ({ ...emp, status })));
  };

  // -------------------------------------------------------------------------
  // Save handler
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    try {
      const payload = employeeData.map((emp) => ({
        employeeId: emp.id || emp.employeeId,
        date: dateConvertor(dayjs(date).format(dateFormat)),
        status: emp.status,
        remarks: emp.remarks || '',
      }));

      await updateAttendance(payload).unwrap();
      shikshaMitraToast.success({
        message: `Attendance updated successfully for ${date?.format('DD-MM-YYYY')}`,
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      shikshaMitraToast.error({ message: 'Failed to update attendance.' });
    }
  };

  // -------------------------------------------------------------------------
  // Count helpers used in column header badges & tooltips
  // -------------------------------------------------------------------------
  const presentCount = employeeData.filter((e) => e.status === STATUS.Present).length;
  const absentCount = employeeData.filter((e) => e.status === STATUS.Absent).length;
  const pendingCount = employeeData.filter((e) => e.status === STATUS.Pending).length;

  // -------------------------------------------------------------------------
  // Columns
  // -------------------------------------------------------------------------
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'fullName',
        label: 'Name',
        minWidth: '12vw',
        align: 'left',
        sticky: true,
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              {value} ({row.employeeIdentifier})
            </Box>
          );
        },
      },
      {
        id: 'attendanceDate',
        label: 'Date',
        align: 'left',
        filterType: 'date',
        minWidth: '8vw',
        render: () => date?.format('DD/MM/YYYY'),
      },
      {
        id: 'timeIn',
        label: 'In-Time',
        align: 'left',
        minWidth: '6vw',
        render: (val) => val || '-',
      },
      {
        id: 'timeOut',
        label: 'Out-Time',
        align: 'left',
        minWidth: '6vw',
        render: (val) => val || '-',
      },
      // -------------------------------------------------------------------
      // Status column — 3-button segmented control (Present / Pending / Absent)
      // -------------------------------------------------------------------
      {
        id: 'status',
        label: (
          <Stack spacing={0.75} alignItems="center">
            {/* ── Count badges ── */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              {/* Present */}
              <CustomTooltip
                title={
                  presentCount > 0 ? (
                    <Box sx={{ p: 1, maxWidth: 260 }}>
                      <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                        Present ({presentCount})
                      </Typography>
                      {employeeData
                        .filter((e) => e.status === STATUS.Present)
                        .slice(0, 8)
                        .map((e) => (
                          <Typography key={e.id} variant="caption" display="block">
                            • {e.fullName} ({e.employeeIdentifier})
                          </Typography>
                        ))}
                      {presentCount > 8 && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ fontStyle: 'italic', mt: 0.5 }}
                        >
                          +{presentCount - 8} more
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        display="block"
                        mt={1}
                        sx={{ fontStyle: 'italic', opacity: 0.8 }}
                      >
                        Click ✓ to mark all as Present
                      </Typography>
                    </Box>
                  ) : (
                    'Click ✓ to mark all as Present'
                  )
                }
                arrow
                placement="top"
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      boxShadow: (t) => t.shadows[8],
                      border: (t) => `1px solid ${t.vars.palette.divider}`,
                      '& .MuiTooltip-arrow': {
                        color: 'background.paper',
                        '&::before': { border: (t) => `1px solid ${t.vars.palette.divider}` },
                      },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: '28px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    bgcolor: (t) => varAlpha(t.vars.palette.success.mainChannel, 0.16),
                    color: 'success.dark',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    px: 0.75,
                    cursor: 'default',
                  }}
                >
                  {presentCount}
                </Box>
              </CustomTooltip>

              {/* Pending */}
              <Box
                sx={{
                  minWidth: '28px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  bgcolor: (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.16),
                  color: 'warning.dark',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  px: 0.75,
                  cursor: 'default',
                }}
              >
                {pendingCount}
              </Box>

              {/* Absent */}
              <CustomTooltip
                title={
                  absentCount > 0 ? (
                    <Box sx={{ p: 1, maxWidth: 260 }}>
                      <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                        Absent ({absentCount})
                      </Typography>
                      {employeeData
                        .filter((e) => e.status === STATUS.Absent)
                        .slice(0, 8)
                        .map((e) => (
                          <Typography key={e.id} variant="caption" display="block">
                            • {e.fullName} ({e.employeeIdentifier})
                          </Typography>
                        ))}
                      {absentCount > 8 && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ fontStyle: 'italic', mt: 0.5 }}
                        >
                          +{absentCount - 8} more
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        display="block"
                        mt={1}
                        sx={{ fontStyle: 'italic', opacity: 0.8 }}
                      >
                        Click ✗ to mark all as Absent
                      </Typography>
                    </Box>
                  ) : (
                    'Click ✗ to mark all as Absent'
                  )
                }
                arrow
                placement="top"
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      boxShadow: (t) => t.shadows[8],
                      border: (t) => `1px solid ${t.vars.palette.divider}`,
                      '& .MuiTooltip-arrow': {
                        color: 'background.paper',
                        '&::before': { border: (t) => `1px solid ${t.vars.palette.divider}` },
                      },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: '28px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    bgcolor: (t) => varAlpha(t.vars.palette.error.mainChannel, 0.16),
                    color: 'error.dark',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    px: 0.75,
                    cursor: 'default',
                  }}
                >
                  {absentCount}
                </Box>
              </CustomTooltip>
            </Stack>

            {/* ── Mark-all segmented control ── */}
            <Box
              sx={{
                display: 'flex',
                width: '180px',
                height: '32px',
                bgcolor: (t) => t.vars.palette.background.neutral,
                borderRadius: '6px',
                p: 0.25,
                gap: 0.25,
              }}
            >
              {/* Mark all Present */}
              <CustomTooltip title="Mark all as Present" arrow placement="top">
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      isLocked ||
                      employeeData.length === 0 ||
                      employeeData.every((emp) => emp.status === STATUS.Present)
                    )
                      return;
                    setAllStatus(STATUS.Present);
                  }}
                  sx={{
                    ...segmentBtnBase,
                    cursor:
                      isLocked ||
                      employeeData.length === 0 ||
                      employeeData.every((e) => e.status === STATUS.Present)
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      isLocked ||
                      employeeData.length === 0 ||
                      employeeData.every((e) => e.status === STATUS.Present)
                        ? 0.5
                        : 1,
                    bgcolor: (t) =>
                      presentCount > 0 ? t.vars.palette.success.main : 'transparent',
                    color: (t) =>
                      presentCount > 0
                        ? t.vars.palette.success.contrastText
                        : t.vars.palette.text.secondary,
                    '&:hover': {
                      bgcolor: (t) => varAlpha(t.vars.palette.success.mainChannel, 0.12),
                    },
                  }}
                >
                  <Iconify icon="eva:checkmark-fill" width={18} />
                </Box>
              </CustomTooltip>

              {/* Pending indicator (display only) */}
              <Box
                sx={{
                  ...segmentBtnBase,
                  cursor: 'default',
                  bgcolor: (t) => (pendingCount > 0 ? t.vars.palette.warning.main : 'transparent'),
                  color: (t) =>
                    pendingCount > 0
                      ? t.vars.palette.warning.contrastText
                      : t.vars.palette.text.secondary,
                }}
              >
                <Iconify icon="eva:minus-fill" width={18} />
              </Box>

              {/* Mark all Absent */}
              <CustomTooltip title="Mark all as Absent" arrow placement="top">
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      isLocked ||
                      employeeData.length === 0 ||
                      employeeData.every((emp) => emp.status === STATUS.Absent)
                    )
                      return;
                    setAllStatus(STATUS.Absent);
                  }}
                  sx={{
                    ...segmentBtnBase,
                    cursor:
                      isLocked ||
                      employeeData.length === 0 ||
                      employeeData.every((e) => e.status === STATUS.Absent)
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      isLocked ||
                      employeeData.length === 0 ||
                      employeeData.every((e) => e.status === STATUS.Absent)
                        ? 0.5
                        : 1,
                    bgcolor: (t) => (absentCount > 0 ? t.vars.palette.error.main : 'transparent'),
                    color: (t) =>
                      absentCount > 0
                        ? t.vars.palette.error.contrastText
                        : t.vars.palette.text.secondary,
                    '&:hover': { bgcolor: (t) => varAlpha(t.vars.palette.error.mainChannel, 0.12) },
                  }}
                >
                  <Iconify icon="eva:close-fill" width={18} />
                </Box>
              </CustomTooltip>
            </Box>
          </Stack>
        ),
        align: 'left',
        minWidth: '200px',
        isSort: false,
        isFilter: false,
        render(value, row) {
          return (
            <Box
              sx={{
                display: 'flex',
                width: '180px',
                height: '32px',
                bgcolor: (t) => t.vars.palette.background.neutral,
                borderRadius: '6px',
                p: 0.25,
                gap: 0.25,
              }}
            >
              {/* Present */}
              <Box
                onClick={() => setRowStatus(row.id, STATUS.Present)}
                sx={{
                  ...segmentBtnBase,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1,
                  bgcolor:
                    value === STATUS.Present ? (t) => t.vars.palette.success.main : 'transparent',
                  color:
                    value === STATUS.Present
                      ? (t) => t.vars.palette.success.contrastText
                      : (t) => t.vars.palette.text.secondary,
                  '&:hover': {
                    bgcolor:
                      value === STATUS.Present
                        ? (t) => t.vars.palette.success.dark
                        : (t) => varAlpha(t.vars.palette.success.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="eva:checkmark-fill" width={18} />
              </Box>

              {/* Pending */}
              <Box
                onClick={() => setRowStatus(row.id, STATUS.Pending)}
                sx={{
                  ...segmentBtnBase,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1,
                  bgcolor:
                    value === STATUS.Pending ? (t) => t.vars.palette.warning.main : 'transparent',
                  color:
                    value === STATUS.Pending
                      ? (t) => t.vars.palette.warning.contrastText
                      : (t) => t.vars.palette.text.secondary,
                  '&:hover': {
                    bgcolor:
                      value === STATUS.Pending
                        ? (t) => t.vars.palette.warning.dark
                        : (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="eva:minus-fill" width={18} />
              </Box>

              {/* Absent */}
              <Box
                onClick={() => setRowStatus(row.id, STATUS.Absent)}
                sx={{
                  ...segmentBtnBase,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1,
                  bgcolor:
                    value === STATUS.Absent ? (t) => t.vars.palette.error.main : 'transparent',
                  color:
                    value === STATUS.Absent
                      ? (t) => t.vars.palette.error.contrastText
                      : (t) => t.vars.palette.text.secondary,
                  '&:hover': {
                    bgcolor:
                      value === STATUS.Absent
                        ? (t) => t.vars.palette.error.dark
                        : (t) => varAlpha(t.vars.palette.error.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="eva:close-fill" width={18} />
              </Box>
            </Box>
          );
        },
      },
      // -------------------------------------------------------------------
      // Remarks — only for Absent employees
      // -------------------------------------------------------------------
      {
        id: 'remarks',
        label: 'Remarks',
        align: 'left',
        minWidth: '15vw',
        render: (val, row) =>
          row.status === STATUS.Absent ? (
            <TextField
              size="small"
              fullWidth
              disabled={isLocked}
              value={val || ''}
              onChange={(e) =>
                setEmployeeData((prev) =>
                  prev.map((emp) => (emp.id === row.id ? { ...emp, remarks: e.target.value } : emp))
                )
              }
              label="Add remarks"
              multiline
              rows={2}
              sx={{ width: '100%' }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.disabled',
                fontStyle: 'italic',
                fontSize: '0.875rem',
              }}
            >
              {row.status === STATUS.Present ? 'No remarks needed' : 'Mark attendance first'}
            </Box>
          ),
      },
      // -------------------------------------------------------------------
      // Errors
      // -------------------------------------------------------------------
      {
        id: 'errors',
        label: 'Errors',
        align: 'left',
        minWidth: '3vw',
        render(value) {
          return value?.length > 0 ? (
            <CustomTooltip title={value.join(', ')}>
              <Iconify icon="material-symbols:error-outline" color="error.main" />
            </CustomTooltip>
          ) : (
            '-'
          );
        },
      },
      // -------------------------------------------------------------------
      // Warnings
      // -------------------------------------------------------------------
      {
        id: 'warnings',
        label: 'Warnings',
        align: 'left',
        minWidth: '3vw',
        render(value) {
          return value?.length > 0 ? (
            <CustomTooltip title={value.join(', ')}>
              <Iconify icon="material-symbols:warning-outline" color="warning.main" />
            </CustomTooltip>
          ) : (
            '-'
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      employeeData,
      query.page,
      query.pageSize,
      date,
      isLocked,
      presentCount,
      pendingCount,
      absentCount,
    ]
  );

  // -------------------------------------------------------------------------
  // Row colour tinting (same pattern as student screen)
  // -------------------------------------------------------------------------
  const rowProps = (row: any) => ({
    sx: {
      background: (theme: any) =>
        row.status === STATUS.Present
          ? varAlpha(theme.vars.palette.success.mainChannel, 0.1)
          : row.status === STATUS.Absent
            ? varAlpha(theme.vars.palette.error.mainChannel, 0.1)
            : varAlpha(theme.vars.palette.warning.mainChannel, 0.06),
      transition: 'background-color 0.2s',
      height: '40px',
      '& td': { py: 0.5 },
    },
  });

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Manual Attendance"
        links={[
          { name: 'HR', href: '/hr/dashboard/' },
          { name: 'Attendance', href: '/hr/attendance-tracking' },
          { name: 'Manual Attendance' },
        ]}
        description="Quickly record employee attendance manually: Choose the date, then mark each employee as Present, Pending, or Absent."
      />

      {/* ── Top toolbar ── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 1,
          gap: 2,
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mb: 1,
          flexWrap: 'wrap',
        }}
      >
        <DatePicker
          label="Date"
          value={date}
          onChange={(val) => setDate(val)}
          format="DD-MM-YYYY"
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
          slotProps={{ textField: { size: 'small' } }}
        />

        <Box sx={{ flexGrow: 1 }} />

        {/* Reset */}
        {!isLocked && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RestartAlt sx={{ fontSize: '16px' }} />}
            disabled={
              employeeData.length === 0 || employeeData.every((e) => e.status === STATUS.Pending)
            }
            onClick={() => resetConfirmDialog.onTrue()}
            sx={{ minWidth: '90px', fontWeight: 500, fontSize: '0.875rem' }}
          >
            Reset
          </Button>
        )}

        {/* Lock / Unlock */}
        <CustomTooltip
          title={isLocked ? 'Attendance is locked — click to unlock' : 'Click to lock attendance'}
          arrow
          placement="top"
        >
          <span>
            <Button
              size="small"
              variant={isLocked ? 'contained' : 'outlined'}
              color={isLocked ? 'error' : 'inherit'}
              startIcon={
                <Iconify
                  icon={isLocked ? 'eva:lock-fill' : 'eva:unlock-fill'}
                  sx={{ fontSize: '16px' }}
                />
              }
              onClick={() => lockConfirmDialog.onTrue()}
              sx={{ minWidth: '90px', fontWeight: 500, fontSize: '0.875rem' }}
            >
              {isLocked ? 'Locked' : 'Lock'}
            </Button>
          </span>
        </CustomTooltip>

        {/* Save */}
        {!isLocked && (
          <Button
            size="small"
            variant="contained"
            loading={isUpdating}
            startIcon={<Iconify icon={GlobalIcons.submit} sx={{ fontSize: '16px' }} />}
            onClick={handleSave}
            disabled={
              employeeData.length === 0 || employeeData.every((e) => e.status === STATUS.Pending)
            }
            sx={{ minWidth: '90px', fontWeight: 500, fontSize: '0.875rem' }}
          >
            Save
          </Button>
        )}
      </Box>

      {/* ── Table ── */}
      <CustomizableTable
        tableTitle="Employee List"
        tableId="hr-manual-attendance"
        isLoading={isLoading || isFetching}
        columns={columns}
        data={employeeData}
        rowProps={rowProps}
        serverSide
        onServerPagination={(page, rowsPerPage) => {
          setQuery((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
        }}
      />

      {/* ── Lock / Unlock confirmation ── */}
      <ConfirmDialog
        open={lockConfirmDialog.value}
        onClose={() => lockConfirmDialog.onFalse()}
        title={isLocked ? 'Unlock Attendance' : 'Lock Attendance'}
        content={
          <>
            Are you sure you want to {isLocked ? 'unlock' : 'lock'} the attendance?
            <br />
            <strong>
              {isLocked
                ? 'Unlocking will allow further modifications.'
                : 'Locking will prevent any further modifications.'}
            </strong>
          </>
        }
        action={
          <Button
            variant="contained"
            color={isLocked ? 'error' : 'primary'}
            size="small"
            onClick={() => {
              setIsLocked((prev) => !prev);
              shikshaMitraToast.success({
                message: isLocked
                  ? 'Attendance unlocked successfully'
                  : 'Attendance locked successfully',
              });
              lockConfirmDialog.onFalse();
            }}
          >
            Yes, {isLocked ? 'Unlock' : 'Lock'}
          </Button>
        }
      />

      {/* ── Reset confirmation ── */}
      <ConfirmDialog
        open={resetConfirmDialog.value}
        onClose={() => resetConfirmDialog.onFalse()}
        title="Reset Attendance"
        content={
          <>
            Are you sure you want to reset all attendance?
            <br />
            <strong>All employees will be marked as Pending and remarks will be cleared.</strong>
          </>
        }
        action={
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setEmployeeData((prev) =>
                prev.map((emp) => ({ ...emp, status: STATUS.Pending, remarks: '' }))
              );
              resetConfirmDialog.onFalse();
              shikshaMitraToast.success({ message: 'Attendance reset successfully' });
            }}
          >
            Yes, Reset
          </Button>
        }
      />
    </Box>
  );
};

export default ManualAttendanceScreen;
