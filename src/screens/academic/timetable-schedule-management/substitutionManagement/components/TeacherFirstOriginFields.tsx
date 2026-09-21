'use client';

import type { Dayjs } from 'dayjs';
import type { FetchOptionsResponse } from 'src/components/paginated-search-select/types';

import dayjs from 'dayjs';
import CustomSelect from 'src/components/custom-select';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Grid, Stack, Switch, Typography, FormControlLabel } from '@mui/material';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';

import type { CreateTeacherOrigin } from '../services/create-substitution-origin';

export type CreateTeacherOption = {
  id: string;
  label: string;
  departmentName?: string;
};

type TeacherFirstOriginFieldsProps = {
  value: CreateTeacherOrigin;
  reasonOptions: { value: string; label: string }[];
  minDate?: Dayjs;
  maxDate?: Dayjs;
  dateFormat: string;
  loadingTeachers: boolean;
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
  fetchTeachers,
  onChange,
}: TeacherFirstOriginFieldsProps) {
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
                }
              : null
          }
          onChange={(_, option) =>
            onChange({
              teacherId: option?.id || '',
              teacherName: option?.label || '',
              departmentName: option?.departmentName || '',
            })
          }
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
                onChange={(event) => onChange({ isFullDay: event.target.checked })}
              />
            }
            label="Full day"
          />
          <Typography variant="caption" color="text.secondary">
            Timetable lectures in this window are detected automatically.
          </Typography>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TimePicker
          label="Start Time *"
          value={timeValue(value.isFullDay ? '09:00' : value.startTime)}
          disabled={value.isFullDay}
          onChange={(time) => onChange({ startTime: time?.isValid() ? time.format('HH:mm') : '' })}
          viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TimePicker
          label="End Time *"
          value={timeValue(value.isFullDay ? '14:15' : value.endTime)}
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
          onChange={(reason) => onChange({ reason: reason as string })}
        />
      </Grid>
    </>
  );
}
