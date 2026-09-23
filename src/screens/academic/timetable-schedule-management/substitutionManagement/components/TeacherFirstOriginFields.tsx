'use client';

import type { Dayjs } from 'dayjs';
import type { FetchOptionsResponse } from 'src/components/paginated-search-select/types';

import dayjs from 'dayjs';
import CustomSelect from 'src/components/custom-select';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Grid, Stack, Switch, Typography, FormControlLabel } from '@mui/material';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';

import {
  buildFullDayOriginPatch,
  type CreateTeacherOrigin,
} from '../services/create-substitution-origin';

export type CreateTeacherOption = {
  id: string;
  label: string;
  departmentName?: string;
  shiftName?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
};

type TeacherFirstOriginFieldsProps = {
  value: CreateTeacherOrigin;
  reasonOptions: { value: string; label: string }[];
  minDate?: Dayjs;
  maxDate?: Dayjs;
  dateFormat: string;
  loadingTeachers: boolean;
  loadingShift: boolean;
  reasonError: boolean;
  reasonHelperText: string;
  fetchTeachers: (
    query: string,
    page: number
  ) => Promise<FetchOptionsResponse<CreateTeacherOption>>;
  onChange: (patch: Partial<CreateTeacherOrigin>) => void;
};

const timeValue = (value: string) => (value ? dayjs(`2000-01-01T${value}`) : null);

export function TeacherFirstOriginFields({
  value,
  reasonOptions,
  minDate,
  maxDate,
  dateFormat,
  loadingTeachers,
  loadingShift,
  reasonError,
  reasonHelperText,
  fetchTeachers,
  onChange,
}: TeacherFirstOriginFieldsProps) {
  const hasTeacher = Boolean(value.teacherId || value.teacherName);
  const hasAssignedShift = Boolean(value.shiftStartTime && value.shiftEndTime);
  const shiftCaption = loadingShift
    ? 'Loading the assigned shift…'
    : !hasTeacher
      ? 'Select a teacher to load the assigned shift.'
      : hasAssignedShift
        ? `Assigned shift${value.shiftName ? `: ${value.shiftName}` : ''} (${value.shiftStartTime}–${value.shiftEndTime})`
        : 'No valid shift timing is assigned to this teacher.';

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <PaginatedSearchSelect<CreateTeacherOption>
          size="small"
          label="Unavailable Teacher *"
          placeholder="Search teacher"
          fetchOptions={fetchTeachers}
          isLoading={loadingTeachers}
          value={
            value.teacherId || value.teacherName
              ? {
                  id: value.teacherId,
                  label: value.teacherName,
                  departmentName: value.departmentName,
                  shiftName: value.shiftName,
                  shiftStartTime: value.shiftStartTime,
                  shiftEndTime: value.shiftEndTime,
                }
              : null
          }
          onChange={(_, option) => {
            const shiftStartTime = option?.shiftStartTime || '';
            const shiftEndTime = option?.shiftEndTime || '';
            onChange({
              teacherId: option?.id || '',
              teacherName: option?.label || '',
              departmentName: option?.departmentName || '',
              shiftName: option?.shiftName || '',
              shiftStartTime,
              shiftEndTime,
              ...(value.isFullDay ? { startTime: shiftStartTime, endTime: shiftEndTime } : {}),
            });
          }}
          getOptionLabel={(option) => option.label}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, selected) => option.id === selected.id}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <DatePicker
          label="Date *"
          value={value.date}
          format={dateFormat}
          disablePast
          minDate={minDate}
          maxDate={maxDate}
          onChange={(date) => onChange({ date })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={value.isFullDay}
                onChange={(event) => onChange(buildFullDayOriginPatch(value, event.target.checked))}
              />
            }
            label="Full day"
          />
          <Typography
            variant="caption"
            color={
              value.isFullDay && hasTeacher && !loadingShift && !hasAssignedShift
                ? 'error'
                : 'text.secondary'
            }
          >
            {value.isFullDay
              ? shiftCaption
              : 'Timetable lectures in this window are detected automatically.'}
          </Typography>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TimePicker
          label="Start Time *"
          value={timeValue(value.startTime)}
          disabled={value.isFullDay}
          onChange={(time) => onChange({ startTime: time?.isValid() ? time.format('HH:mm') : '' })}
          viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TimePicker
          label="End Time *"
          value={timeValue(value.endTime)}
          disabled={value.isFullDay}
          onChange={(time) => onChange({ endTime: time?.isValid() ? time.format('HH:mm') : '' })}
          viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomSelect
          label="Reason *"
          options={reasonOptions}
          value={value.reason}
          error={reasonError}
          helperText={reasonHelperText}
          onChange={(reason) => onChange({ reason: reason as string })}
        />
      </Grid>
    </>
  );
}
