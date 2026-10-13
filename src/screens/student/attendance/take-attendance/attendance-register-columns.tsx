import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AttendanceStudent,
  AttendancePolicySummary,
} from 'src/redux/student/take-attendance/attendance-types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import { Box, Stack, Avatar, Tooltip, TextField, IconButton, Typography } from '@mui/material';

import { changeAttendanceMark, attendanceStudentName } from './attendance-draft';

const marks = [
  { value: 'full', label: 'Present', icon: 'eva:checkmark-fill', color: 'success' },
  { value: 'absent', label: 'Absent', icon: 'eva:close-fill', color: 'error' },
  { value: 'pending', label: 'Pending', icon: 'eva:minus-fill', color: 'warning' },
  { value: 'half', label: 'Half-day', icon: 'mdi:fraction-one-half', color: 'info' },
] as const;

export const attendanceStatusLabel = (row: AttendanceStudent) =>
  !row.isExpected && row.status === AttendanceStatus.Pending
    ? 'Not applicable'
    : row.status === AttendanceStatus.Pending
      ? 'Pending'
      : row.status === AttendanceStatus.Absent
        ? 'Absent'
        : row.halfDay
          ? 'Half-day'
          : 'Present';

type Options = {
  editable: boolean;
  broad: boolean;
  submitted: boolean;
  policy?: AttendancePolicySummary;
  onChange: (studentId: string, change: (row: AttendanceStudent) => AttendanceStudent) => void;
};

export const buildAttendanceColumns = ({
  editable,
  broad,
  submitted,
  policy,
  onChange,
}: Options): IColumn[] => [
  {
    id: 'name',
    label: 'Student',
    minWidth: 200,
    filterType: 'string',
    isFilter: false,
    render: (_value, item) => {
      const row = item as AttendanceStudent;
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              display: { xs: 'none', sm: 'flex' },
              bgcolor: 'background.neutral',
              color: 'text.secondary',
              fontSize: 12,
            }}
          >
            {[row.firstName, row.lastName]
              .filter(Boolean)
              .map((name) => name?.charAt(0))
              .join('')
              .slice(0, 2) || '—'}
          </Avatar>
          <Typography
            variant="body2"
            fontWeight="fontWeightSemiBold"
            sx={{ overflowWrap: 'anywhere' }}
          >
            {attendanceStudentName(row)}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'grNumber',
    label: 'GR number',
    minWidth: 120,
    filterType: 'string',
    isFilter: false,
    render: (value, row) => value || row.grNo || '—',
  },
  { id: 'classDivision', label: 'Class / Division', minWidth: 150, isFilter: false, isSort: false },
  {
    id: 'rollNo',
    label: 'Roll number',
    width: 100,
    filterType: 'number',
    isFilter: false,
    isSort: !broad,
    render: (value) => value ?? '—',
  },
  {
    id: 'remarks',
    label: 'Details',
    minWidth: 220,
    isFilter: false,
    isSort: false,
    render: (_value, item) => {
      const row = item as AttendanceStudent;
      const readonly =
        !editable || !row.isExpected || row.requiresCorrectionApproval || row.needsCreditCorrection;
      return (
        <Stack spacing={0.5}>
          {!row.isExpected && (
            <Typography variant="caption" color="text.secondary">
              {row.notExpectedReason || 'Attendance is not applicable on this date.'}
            </Typography>
          )}
          {row.status === AttendanceStatus.Absent && row.isExpected ? (
            <TextField
              size="small"
              fullWidth
              multiline
              maxRows={3}
              value={row.remarks || ''}
              placeholder="Remarks (optional)"
              disabled={Boolean(readonly)}
              slotProps={{
                htmlInput: {
                  'aria-label': `Remarks: ${attendanceStudentName(row)}`,
                  maxLength: 500,
                },
              }}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                onChange(row.studentId, (previous) => ({
                  ...previous,
                  remarks: event.target.value,
                }))
              }
            />
          ) : row.remarks ? (
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {row.remarks}
            </Typography>
          ) : null}
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {row.approvedLeaveId && <Label color="info">Approved leave</Label>}
            {row.late && <Label color="warning">Late</Label>}
            {row.needsCreditCorrection && <Label color="warning">Leave correction needed</Label>}
            {row.requiresCorrectionApproval && <Label color="default">Approval required</Label>}
          </Stack>
          {row.scheduleLabel && (
            <Typography variant="caption" color="text.secondary">
              {row.scheduleLabel}
            </Typography>
          )}
        </Stack>
      );
    },
  },
  {
    id: 'statusLabel',
    label: 'Attendance',
    width: 200,
    minWidth: 200,
    align: 'center',
    cellSx: { px: { xs: 0.5, sm: 2 } },
    headerSx: { px: { xs: 0.5, sm: 2 } },
    sticky: true,
    stickyPosition: 'right',
    stickyOnMobile: true,
    isFilter: false,
    isSort: false,
    render: (_value, item) => {
      const row = item as AttendanceStudent;
      if (broad)
        return (
          <Stack spacing={0.5} alignItems="center">
            <Label
              color={
                !row.isExpected
                  ? 'default'
                  : row.status === AttendanceStatus.Pending
                    ? 'warning'
                    : row.status === AttendanceStatus.Absent
                      ? 'error'
                      : row.halfDay
                        ? 'info'
                        : 'success'
              }
            >
              {attendanceStatusLabel(row)}
            </Label>
            {!row.isExpected && row.status !== AttendanceStatus.Pending && (
              <Typography variant="caption" color="text.secondary">
                Not applicable
              </Typography>
            )}
          </Stack>
        );
      const blockedReason = !row.isExpected
        ? row.notExpectedReason || 'Attendance is not applicable on this date.'
        : row.needsCreditCorrection
          ? 'Approved leave requires an attendance credit correction.'
          : row.requiresCorrectionApproval
            ? 'School policy requires approval to change this attendance.'
            : !editable
              ? 'This attendance register is read-only.'
              : '';
      return (
        <Stack spacing={0.5} alignItems="center">
          {blockedReason && (
            <Typography variant="caption" color="text.secondary">
              {attendanceStatusLabel(row)}
            </Typography>
          )}
          <Box
            role="group"
            aria-label={`Attendance: ${attendanceStudentName(row)}`}
            sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}
          >
            {marks.map((mark) => {
              const selected =
                row.isExpected &&
                (mark.value === 'full'
                  ? row.status === AttendanceStatus.Present && !row.halfDay
                  : mark.value === 'half'
                    ? row.status === AttendanceStatus.Present && row.halfDay
                    : mark.value === 'absent'
                      ? row.status === AttendanceStatus.Absent
                      : row.status === AttendanceStatus.Pending);
              const unavailable =
                mark.value === 'half' && !policy?.allowHalfDay
                  ? 'Half-day attendance is disabled by school policy.'
                  : mark.value === 'pending' && submitted
                    ? 'Submitted attendance cannot be changed to Pending.'
                    : blockedReason;
              return (
                <Tooltip key={mark.value} title={unavailable || mark.label}>
                  <span>
                    <IconButton
                      aria-label={`${mark.label}: ${attendanceStudentName(row)}`}
                      aria-pressed={selected}
                      size="small"
                      disabled={Boolean(unavailable)}
                      onClick={() =>
                        onChange(row.studentId, (previous) =>
                          changeAttendanceMark(previous, mark.value)
                        )
                      }
                      sx={{
                        width: { xs: 44, sm: 36 },
                        height: { xs: 44, sm: 36 },
                        border: 1,
                        borderRadius: 1,
                        borderColor: unavailable ? 'divider' : `${mark.color}.main`,
                        bgcolor: selected ? `${mark.color}.main` : 'background.paper',
                        color: selected ? `${mark.color}.contrastText` : `${mark.color}.main`,
                        '&:hover': {
                          bgcolor: selected ? `${mark.color}.dark` : `${mark.color}.lighter`,
                        },
                        '&.Mui-disabled': {
                          color: 'text.disabled',
                          bgcolor: 'action.disabledBackground',
                          borderColor: 'divider',
                        },
                      }}
                    >
                      <Iconify icon={mark.icon} width={20} />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })}
          </Box>
        </Stack>
      );
    },
  },
];
