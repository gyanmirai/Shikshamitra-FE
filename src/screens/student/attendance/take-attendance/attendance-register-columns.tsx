import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AttendanceStudent,
  AttendancePolicySummary,
} from 'src/redux/student/take-attendance/attendance-types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import { Box, Stack, Avatar, TextField, ButtonBase, Typography } from '@mui/material';

import {
  changeAttendanceMark,
  attendanceStudentName,
  getAttendanceMarkRestriction,
} from './attendance-draft';

import type { AttendanceCounts, AttendanceMarkChoice } from './attendance-draft';

const marks = [
  { value: 'full', label: 'Present', icon: 'mdi:check', color: 'success' },
  { value: 'half', label: 'Half-day', icon: 'mdi:fraction-one-half', color: 'info' },
  { value: 'pending', label: 'Pending', icon: 'mdi:minus', color: 'warning' },
  { value: 'absent', label: 'Absent', icon: 'mdi:close', color: 'error' },
] as const;

const segmentGridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  width: 1,
  maxWidth: 230,
  p: 0.25,
  gap: 0.25,
} as const;

const segmentButtonSx = {
  width: 1,
  height: { xs: 44, sm: 32 },
  borderRadius: 0.5,
  '&.Mui-focusVisible': {
    outline: '2px solid',
    outlineColor: 'text.primary',
    outlineOffset: 2,
  },
} as const;

function AttendanceColumnHeader({
  counts,
  canBulkMark,
  allowHalfDay,
  submitted,
  onBulkMark,
}: {
  counts: AttendanceCounts;
  canBulkMark: boolean;
  allowHalfDay?: boolean;
  submitted: boolean;
  onBulkMark: (mark: AttendanceMarkChoice) => void;
}) {
  const totals = {
    full: counts.present,
    half: counts.halfDay,
    pending: counts.unmarked,
    absent: counts.absent,
  };
  return (
    <Stack role="group" aria-label="Attendance" spacing={0.25} sx={{ width: 1, maxWidth: 230 }}>
      <Box
        role="group"
        aria-label="Class attendance counts"
        aria-live="polite"
        aria-atomic
        sx={segmentGridSx}
      >
        {marks.map((mark) => (
          <CustomTooltip
            key={mark.value}
            title={`${mark.label}: ${totals[mark.value]}`}
            arrow
            disableInteractive
          >
            <Label
              color={mark.color}
              aria-label={`${mark.label}: ${totals[mark.value]}`}
              sx={{ width: 1, height: 20, borderRadius: 10 }}
            >
              {totals[mark.value]}
            </Label>
          </CustomTooltip>
        ))}
      </Box>
      <Box role="group" aria-label="Bulk attendance actions" sx={segmentGridSx}>
        {marks.map((mark) => {
          const label = `Mark all eligible students as ${mark.label}`;
          const restriction = getAttendanceMarkRestriction(mark.value, allowHalfDay, submitted);
          const tooltip =
            restriction || (canBulkMark ? label : 'No students are available for bulk marking.');
          return (
            <CustomTooltip
              key={mark.value}
              title={tooltip}
              arrow
              placement="top"
              disableInteractive
            >
              <span>
                <ButtonBase
                  type="button"
                  aria-label={label}
                  disabled={!canBulkMark || Boolean(restriction)}
                  onClick={() => onBulkMark(mark.value)}
                  sx={{
                    ...segmentButtonSx,
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                    '&.Mui-disabled': { color: 'text.disabled' },
                  }}
                >
                  <Iconify icon={mark.icon} width={20} />
                </ButtonBase>
              </span>
            </CustomTooltip>
          );
        })}
      </Box>
    </Stack>
  );
}

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
  counts: AttendanceCounts;
  editable: boolean;
  canBulkMark: boolean;
  broad: boolean;
  submitted: boolean;
  policy?: AttendancePolicySummary;
  onChange: (studentId: string, change: (row: AttendanceStudent) => AttendanceStudent) => void;
  onBulkMark: (mark: AttendanceMarkChoice) => void;
};

export const buildAttendanceColumns = ({
  counts,
  editable,
  canBulkMark,
  broad,
  submitted,
  policy,
  onChange,
  onBulkMark,
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
    label: broad ? (
      <Box
        component="span"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        Attendance
      </Box>
    ) : (
      <AttendanceColumnHeader
        counts={counts}
        canBulkMark={canBulkMark}
        allowHalfDay={policy?.allowHalfDay}
        submitted={submitted}
        onBulkMark={onBulkMark}
      />
    ),
    width: 264,
    minWidth: 216,
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
            sx={{
              ...segmentGridSx,
              bgcolor: 'background.neutral',
              borderRadius: 0.75,
            }}
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
                getAttendanceMarkRestriction(mark.value, policy?.allowHalfDay, submitted) ||
                blockedReason;
              return (
                <CustomTooltip
                  key={mark.value}
                  title={unavailable || mark.label}
                  arrow
                  placement="top"
                >
                  <span>
                    <ButtonBase
                      type="button"
                      aria-label={`${mark.label}: ${attendanceStudentName(row)}`}
                      aria-pressed={selected}
                      disabled={Boolean(unavailable)}
                      onClick={() =>
                        onChange(row.studentId, (previous) =>
                          changeAttendanceMark(previous, mark.value)
                        )
                      }
                      sx={{
                        ...segmentButtonSx,
                        bgcolor: selected ? `${mark.color}.main` : 'transparent',
                        color: selected ? `${mark.color}.contrastText` : 'text.secondary',
                        '&:hover': {
                          bgcolor: selected ? `${mark.color}.dark` : 'action.hover',
                        },
                        '&.Mui-disabled': {
                          opacity: 0.48,
                          color: selected ? `${mark.color}.contrastText` : 'text.disabled',
                        },
                      }}
                    >
                      <Iconify icon={mark.icon} width={20} />
                    </ButtonBase>
                  </span>
                </CustomTooltip>
              );
            })}
          </Box>
        </Stack>
      );
    },
  },
];
