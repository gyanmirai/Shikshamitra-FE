import type { Dayjs } from 'dayjs';

import { useId, useRef } from 'react';
import { parseDateOnly } from 'src/utils/date-only';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { skeletonReducedMotionSx } from 'src/theme/styles/skeleton';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { renderDateViewCalendar } from '@mui/x-date-pickers/dateViewRenderers';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import DatePickerCalendarHeader from 'src/components/date-picker-calendar-header';
import { Stack, Button, Skeleton, FormLabel, TextField, Typography } from '@mui/material';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';

import type { useAdmissionJoiningDate } from './use-admission-joining-date';

export function AdmissionJoiningDateField({
  controller,
  disabled,
  compact = false,
  onDateCommit,
}: {
  controller: ReturnType<typeof useAdmissionJoiningDate>;
  disabled: boolean;
  compact?: boolean;
  onDateCommit?: (value: Dayjs | null) => void;
}) {
  const fieldId = useId();
  const typedDate = useRef<Dayjs | null | undefined>(undefined);
  const calendarOpen = useRef(false);
  const { state, query, value, error, stale, previewPending, previewQuery } = controller;
  if (!state && (query.isLoading || query.isFetching))
    return (
      <Stack
        role="status"
        aria-label="Loading Actual Joining Date"
        aria-busy
        sx={skeletonReducedMotionSx}
      >
        <Skeleton aria-hidden variant="rounded" height={44} />
      </Stack>
    );
  if (!state || query.isError || stale)
    return (
      <Stack spacing={1} alignItems="flex-start">
        <StudentFeedback
          notificationKey="admission-joining-date-read"
          presentation="persistent"
          severity="error"
        >
          {stale
            ? 'The Application Changed. Refresh the Saved Joining Date Before Collecting Fees.'
            : 'The Actual Joining Date Could Not Be Loaded. Retry Before Collecting Fees.'}
        </StudentFeedback>
        <Button
          size="small"
          variant="outlined"
          onClick={() => controller.retry()}
          disabled={query.isFetching}
        >
          Refresh Joining Date
        </Button>
      </Stack>
    );
  const readOnly = state.isLocked || !state.canEdit;
  const purpose = 'Used to calculate fees and any proration.';
  const readOnlyReason = state.lockReason || 'This joining date is read-only.';
  return (
    <Stack spacing={compact ? 0.5 : 1} sx={skeletonReducedMotionSx}>
      <Stack direction="row" alignItems="center" spacing={compact ? 0.5 : 0}>
        <FormLabel
          id={`${fieldId}-label`}
          htmlFor={fieldId}
          required={!readOnly}
          error={Boolean(error)}
          sx={{ typography: 'body2' }}
        >
          Actual Joining Date
        </FormLabel>
        <InfoTooltipIcon
          label="About Actual Joining Date"
          title={
            compact
              ? 'Use the date the student started attending school. This can differ from the day you collect payment.'
              : readOnly
                ? state.lockReason ||
                  'Registration and Onboarding share this saved joining date. An authorized user can confirm it before fees are prepared.'
                : 'Registration and Onboarding share this date. Finance uses it to calculate fees. The payment date is separate.'
          }
        />
      </Stack>
      {readOnly && !compact ? (
        <TextField
          id={fieldId}
          value={value?.isValid() ? value.format(ADMISSION_DATE_FORMAT) : '—'}
          fullWidth
          size="small"
          slotProps={{ input: { readOnly: true } }}
        />
      ) : (
        <ShakingTextField
          error={Boolean(error)}
          onBlur={(event) => {
            if (calendarOpen.current || event.currentTarget.contains(event.relatedTarget)) return;
            controller.blur();
            if (typedDate.current !== undefined) {
              const next = typedDate.current;
              typedDate.current = undefined;
              onDateCommit?.(next);
            }
          }}
        >
          <DatePicker
            format="DD/MM/YYYY"
            views={compact ? ['year', 'month', 'day'] : undefined}
            openTo={compact ? 'day' : undefined}
            slots={compact ? { calendarHeader: DatePickerCalendarHeader } : undefined}
            value={value}
            maxDate={parseDateOnly(state.academicYearEndDate) ?? undefined}
            onChange={(next, context) => {
              // The field can publish changes without a source in its event context.
              typedDate.current =
                !calendarOpen.current && context.source !== 'view' ? next : undefined;
              controller.change(next);
            }}
            onOpen={() => {
              calendarOpen.current = true;
            }}
            onClose={() => {
              calendarOpen.current = false;
            }}
            closeOnSelect={onDateCommit ? true : undefined}
            viewRenderers={
              onDateCommit
                ? {
                    day: (props) =>
                      renderDateViewCalendar({
                        ...props,
                        onChange: (next, selectionState, view) => {
                          props.onChange?.(next, selectionState, view);
                          if (view === 'day' && selectionState === 'finish') {
                            typedDate.current = undefined;
                            onDateCommit(next);
                          }
                        },
                      }),
                  }
                : undefined
            }
            readOnly={readOnly}
            disabled={disabled || query.isFetching || controller.saving}
            slotProps={{
              ...(onDateCommit && { actionBar: { actions: [] } }),
              textField: {
                id: fieldId,
                InputProps: { 'aria-labelledby': `${fieldId}-label` },
                name: 'actualJoiningDate',
                required: !readOnly,
                fullWidth: true,
                size: 'small',
                error: Boolean(error),
                helperText:
                  error ||
                  (compact
                    ? readOnly
                      ? readOnlyReason
                      : purpose
                    : value === null
                      ? 'Required before collecting fees.'
                      : undefined),
              },
            }}
          />
        </ShakingTextField>
      )}
      {previewPending && (
        <Stack role="status" aria-label="Calculating Fee Preview" aria-busy spacing={0.5}>
          <Skeleton aria-hidden variant="text" width="45%" height={18} />
          <Skeleton aria-hidden variant="text" width="65%" height={24} />
        </Stack>
      )}
      {state.canPreview && !state.isLocked && controller.previewFailed && (
        <Stack spacing={1} alignItems="flex-start">
          <StudentFeedback
            notificationKey="admission-joining-date-preview"
            presentation="persistent"
            severity="error"
          >
            {parseApiProblemDetail(previewQuery.error).detail ||
              'The Fee Preview Could Not Be Calculated. Retry Before Collecting Fees.'}
          </StudentFeedback>
          <Button
            size="small"
            variant="outlined"
            disabled={disabled || previewQuery.isFetching}
            onClick={() => previewQuery.refetch()}
          >
            Retry Fee Preview
          </Button>
        </Stack>
      )}
      {controller.preview?.warnings?.map((warning) => (
        <Typography key={warning} variant="body2" color="text.secondary">
          {warning}
        </Typography>
      ))}
    </Stack>
  );
}
