import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';

import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, Stack, TextField, Typography } from '@mui/material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import { ADMISSION_DATE_FORMAT, ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import {
  sessionClassKey,
  sessionSlotCount,
  sessionAssessmentKey,
  selectSessionClasses,
  setSessionScheduleDate,
  selectSessionAssessment,
  updateSessionSetupValues,
} from './assessment-session-setup-model';

import type {
  SessionRoomChoice,
  SessionSetupValues,
  SessionStaffChoice,
} from './assessment-session-setup-model';

type Props = {
  formik: FormikProps<SessionSetupValues>;
  scopes: AssessmentScope[];
  rooms: SessionRoomChoice[];
  interviewers: SessionStaffChoice[];
  onSearchInterviewers?: (query: string) => Promise<SessionStaffChoice[]>;
  interviewersLoading?: boolean;
  disabled: boolean;
  identityLocked?: boolean;
  bookedCount: number;
  pipeline?: boolean;
  classSummary?: ReactNode;
};

export function AssessmentSessionSetupFields({
  formik,
  scopes,
  rooms,
  interviewers,
  onSearchInterviewers,
  interviewersLoading = false,
  disabled,
  identityLocked = false,
  bookedCount,
  pipeline = false,
  classSummary,
}: Props) {
  const feedback = (key: keyof SessionSetupValues) => ({
    error: Boolean(formik.touched[key] && formik.errors[key]),
    helperText: formik.touched[key] ? String(formik.errors[key] ?? '') : '',
  });
  const update = (key: keyof SessionSetupValues, value: unknown) => {
    formik.setFieldTouched(key, true, false);
    formik.setValues(
      updateSessionSetupValues(formik.values, key, value, scopes, rooms, bookedCount),
      true
    );
  };
  const classes = Array.from(
    new Map(
      scopes.map((scope) => [
        sessionClassKey(scope),
        {
          value: sessionClassKey(scope),
          label: scope.className || 'Class unavailable',
        },
      ])
    ).values()
  );
  const classIds = Array.from(
    new Set([
      ...formik.values.classIds,
      ...scopes
        .filter((scope) => formik.values.offeringIds.includes(scope.admissionOfferingId))
        .map(sessionClassKey),
    ])
  );
  const setSelection = (values: SessionSetupValues) => {
    formik.setFieldTouched('offeringIds', true, false);
    formik.setFieldTouched('classIds', true, false);
    formik.setValues(
      updateSessionSetupValues(values, 'stageIds', values.stageIds, scopes, rooms, bookedCount),
      true
    );
  };
  const room = rooms.find((r) => r.id === formik.values.roomId);
  return (
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:clipboard-text-outline"
        title={pipeline ? 'Session Details' : 'Assessment Details'}
        descriptionTooltip={
          pipeline
            ? "Create a slot for this student's current assessment."
            : 'Choose the classes attending this session. Assessment choices appear only when a class has multiple eligible assessments.'
        }
      >
        <Grid container spacing={1}>
          <Grid size={12}>
            <ShakingTextField error={feedback('name').error}>
              <TextField
                size="small"
                fullWidth
                required
                label="Session name"
                disabled={disabled}
                {...formik.getFieldProps('name')}
                onChange={(event) => update('name', event.target.value)}
                {...feedback('name')}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={12}>
            <ShakingTextField error={feedback('sessionType').error}>
              <CustomSelect
                size="small"
                fullWidth
                required
                label="Assessment type"
                options={[
                  { value: 'exam', label: 'School exam' },
                  { value: 'individualInterview', label: 'Individual interview' },
                  { value: 'groupInterview', label: 'Group interview' },
                ]}
                value={formik.values.sessionType}
                onChange={(value) => update('sessionType', value)}
                disabled={disabled || identityLocked || bookedCount > 0}
                {...feedback('sessionType')}
              />
            </ShakingTextField>
          </Grid>
          {!pipeline && (
            <Grid size={12}>
              <ShakingTextField error={feedback('offeringIds').error}>
                <CustomSelect
                  size="small"
                  fullWidth
                  required
                  multiple
                  isSearch
                  label="Classes"
                  options={classes}
                  value={classIds}
                  disabled={disabled || identityLocked || bookedCount > 0}
                  onChange={(value) => {
                    setSelection(selectSessionClasses(formik.values, value as string[], scopes));
                  }}
                  error={feedback('offeringIds').error || feedback('classIds').error}
                  helperText={feedback('classIds').helperText || feedback('offeringIds').helperText}
                  noOptionsMessage="No classes with eligible assessments are available"
                />
              </ShakingTextField>
            </Grid>
          )}
          {pipeline && classSummary && <Grid size={12}>{classSummary}</Grid>}
          {!pipeline &&
            classIds.map((id) => {
              const matches = scopes.filter((scope) => sessionClassKey(scope) === id);
              if (matches.length <= 1) return null;
              const selected = matches.find(
                (scope) =>
                  formik.values.offeringIds.includes(scope.admissionOfferingId) &&
                  formik.values.stageIds[scope.admissionOfferingId] ===
                    scope.workflowStageDefinitionId
              );
              return (
                <Grid key={id} size={12}>
                  <ShakingTextField error={feedback('classIds').error}>
                    <CustomSelect
                      size="small"
                      fullWidth
                      required
                      isSearch
                      label={`${classes.find((item) => item.value === id)?.label ?? 'Class'} — Select assessment`}
                      options={matches.map((scope) => ({
                        value: sessionAssessmentKey(scope),
                        label: `${scope.stageName} · ${scope.offeringName} · ${scope.workflowName || 'Workflow'} v${scope.workflowVersion}`,
                      }))}
                      value={selected ? sessionAssessmentKey(selected) : ''}
                      disabled={disabled || identityLocked || bookedCount > 0}
                      onChange={(value) =>
                        setSelection(
                          selectSessionAssessment(formik.values, id, String(value), scopes)
                        )
                      }
                      {...feedback('classIds')}
                    />
                  </ShakingTextField>
                </Grid>
              );
            })}
        </Grid>
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:calendar-clock-outline"
        title="Schedule And Room"
        descriptionTooltip="Rooms come from Institute Setup. Availability and capacity are checked again before confirmation."
      >
        <Grid container spacing={1}>
          {pipeline && (
            <Grid size={12}>
              <DatePicker
                label="Date"
                format={ADMISSION_DATE_FORMAT}
                value={formik.values.startsAt}
                disabled={disabled}
                onChange={(date) => {
                  const dated = setSessionScheduleDate(formik.values, date);
                  formik.setFieldTouched('startsAt', true, false);
                  formik.setFieldTouched('endsAt', true, false);
                  formik.setValues(
                    updateSessionSetupValues(
                      dated,
                      'startsAt',
                      dated.startsAt,
                      scopes,
                      rooms,
                      bookedCount
                    ),
                    true
                  );
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    required: true,
                    ...feedback('startsAt'),
                  },
                }}
              />
            </Grid>
          )}
          {(['startsAt', 'endsAt'] as const).map((key) => (
            <Grid key={key} size={{ xs: 12, sm: 6 }}>
              <ShakingTextField error={feedback(key).error}>
                {pipeline ? (
                  <TimePicker
                    format="hh:mm A"
                    label={key === 'startsAt' ? 'Starts at' : 'Ends at'}
                    value={formik.values[key]}
                    disabled={disabled || !formik.values.startsAt}
                    onChange={(value) => {
                      const date = formik.values.startsAt;
                      update(
                        key,
                        value && date
                          ? date.hour(value.hour()).minute(value.minute()).second(0).millisecond(0)
                          : null
                      );
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        required: true,
                        name: key,
                        onBlur: formik.handleBlur,
                        ...feedback(key),
                      },
                    }}
                  />
                ) : (
                  <DateTimePicker
                    label={key === 'startsAt' ? 'Starts at' : 'Ends at'}
                    format={ADMISSION_DATE_TIME_FORMAT}
                    value={formik.values[key]}
                    onChange={(value) => update(key, value)}
                    disabled={
                      disabled ||
                      (bookedCount > 0 && formik.values.sessionType === 'individualInterview')
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        required: true,
                        name: key,
                        onBlur: formik.handleBlur,
                        ...feedback(key),
                      },
                    }}
                  />
                )}
              </ShakingTextField>
            </Grid>
          ))}
          <Grid size={12}>
            <ShakingTextField error={feedback('roomId').error}>
              <PaginatedSearchSelect<SessionRoomChoice>
                key={rooms
                  .map(
                    (option) =>
                      `${option.id}:${option.capacity}:${option.roomName}:${option.buildingName}:${option.floorName}`
                  )
                  .join('|')}
                size="small"
                fullWidth
                required
                minChars={0}
                debounceMs={150}
                label="Institute room"
                name="roomId"
                placeholder="Search room or building"
                value={room ?? null}
                getOptionLabel={(option) => option.roomName}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                groupBy={(option) => option.buildingName || 'Other rooms'}
                filterOptions={(options) => options}
                fetchOptions={async (query, page) => ({
                  hasMore: false,
                  data:
                    page > 1
                      ? []
                      : rooms
                          .filter((option) =>
                            `${option.roomName} ${option.buildingName} ${option.floorName}`
                              .toLocaleLowerCase()
                              .includes(query.trim().toLocaleLowerCase())
                          )
                          .sort(
                            (a, b) =>
                              a.buildingName.localeCompare(b.buildingName) ||
                              a.roomName.localeCompare(b.roomName, undefined, { numeric: true })
                          ),
                })}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <Box component="li" key={key} {...optionProps} sx={{ gap: 1, minHeight: 48 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2">{option.roomName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.floorName}
                        </Typography>
                      </Box>
                      <Label color="default">{option.capacity} seats</Label>
                    </Box>
                  );
                }}
                disabled={
                  disabled ||
                  (bookedCount > 0 && formik.values.sessionType === 'individualInterview')
                }
                onChange={(_, option) => update('roomId', option?.id ?? '')}
                onBlur={() => formik.setFieldTouched('roomId', true, false)}
                error={feedback('roomId').error}
                helperText={
                  feedback('roomId').helperText ||
                  (room ? [room.buildingName, room.floorName].filter(Boolean).join(' / ') : '')
                }
                noOptionsText="No matching rooms with usable capacity in Institute Setup"
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={feedback('capacity').error}>
              <NumericFormatCustom
                size="small"
                fullWidth
                required
                label={pipeline ? 'Capacity' : 'Session capacity'}
                name="capacity"
                prefix=""
                decimalScale={0}
                value={formik.values.capacity}
                onValueChange={({ floatValue }) => update('capacity', floatValue ?? '')}
                onBlur={formik.handleBlur}
                disabled={disabled}
                {...feedback('capacity')}
              />
            </ShakingTextField>
          </Grid>
          {room && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Room capacity: {room.capacity}
              </Typography>
            </Grid>
          )}
        </Grid>
      </FormSectionCard>
      {formik.values.sessionType !== 'exam' && (
        <FormSectionCard
          icon="mdi:account-clock-outline"
          title="Interview Arrangement"
          descriptionTooltip="Individual interviews use one applicant per generated slot. Group interviews share the session time."
        >
          <Grid container spacing={1}>
            <Grid size={12}>
              <ShakingTextField error={feedback('interviewerId').error}>
                <PaginatedSearchSelect<SessionStaffChoice>
                  size="small"
                  fullWidth
                  required
                  label="Interviewer"
                  name="interviewerId"
                  value={
                    formik.values.interviewerId
                      ? (interviewers.find((s) => s.id === formik.values.interviewerId) ?? {
                          id: formik.values.interviewerId,
                          name: formik.values.interviewerName || 'Selected interviewer',
                        })
                      : null
                  }
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, option) => {
                    formik.setFieldTouched('interviewerId', true, false);
                    formik.setValues({
                      ...formik.values,
                      interviewerId: option?.id ?? '',
                      interviewerName: option?.name ?? '',
                    });
                  }}
                  fetchOptions={async (query, page) => ({
                    data:
                      page > 1
                        ? []
                        : query.trim() && onSearchInterviewers
                          ? await onSearchInterviewers(query)
                          : interviewers.filter(
                              (s) =>
                                !query.trim() ||
                                s.name.toLowerCase().includes(query.trim().toLowerCase())
                            ),
                    hasMore: false,
                  })}
                  minChars={0}
                  debounceMs={300}
                  isLoading={interviewersLoading}
                  disabled={disabled}
                  {...feedback('interviewerId')}
                  noOptionsText="No selectable interviewers match your search"
                />
              </ShakingTextField>
            </Grid>
            {formik.values.sessionType === 'individualInterview' && (
              <>
                {(['slotDurationMinutes', 'breakMinutes'] as const).map((key) => (
                  <Grid key={key} size={{ xs: 12, sm: 6 }}>
                    <ShakingTextField error={feedback(key).error}>
                      <NumericFormatCustom
                        size="small"
                        fullWidth
                        required
                        label={
                          key === 'slotDurationMinutes'
                            ? 'Duration per applicant (minutes)'
                            : 'Gap between slots (minutes)'
                        }
                        name={key}
                        prefix=""
                        decimalScale={0}
                        value={formik.values[key]}
                        onValueChange={({ floatValue }) => update(key, floatValue ?? '')}
                        onBlur={formik.handleBlur}
                        disabled={disabled || bookedCount > 0}
                        {...feedback(key)}
                      />
                    </ShakingTextField>
                  </Grid>
                ))}
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    {sessionSlotCount(formik.values)} slots fit this schedule. Exact applicant times
                    appear in the booking preview.
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </FormSectionCard>
      )}
    </Stack>
  );
}
