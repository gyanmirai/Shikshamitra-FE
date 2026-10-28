import { parseDateOnly } from 'src/utils/date-only';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';

import type { useAdmissionJoiningDate } from './use-admission-joining-date';

export function AdmissionJoiningDateField({
  controller,
  disabled,
}: {
  controller: ReturnType<typeof useAdmissionJoiningDate>;
  disabled: boolean;
}) {
  const { state, query, value, error, stale, previewPending, previewQuery } = controller;
  if (!state && (query.isLoading || query.isFetching))
    return <Skeleton aria-label="Loading actual joining date" variant="rounded" height={44} />;
  if (!state || query.isError || stale)
    return (
      <Stack spacing={1} alignItems="flex-start">
        <StudentFeedback
          notificationKey="admission-joining-date-read"
          presentation="persistent"
          severity="error"
        >
          {stale
            ? 'The application changed. Refresh the saved joining date before collecting fees.'
            : 'The actual joining date could not be loaded. Retry before collecting fees.'}
        </StudentFeedback>
        <Button
          size="small"
          variant="outlined"
          onClick={() => controller.retry()}
          disabled={query.isFetching}
        >
          Refresh joining date
        </Button>
      </Stack>
    );
  return (
    <Stack spacing={1}>
      {state.isLocked || !state.canEdit ? (
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Actual joining date
            </Typography>
            <InfoTooltipIcon
              label="About actual joining date"
              title={
                state.lockReason ||
                'The saved joining date is shared with Registration and Onboarding. An authorized user can confirm it before fees are prepared.'
              }
            />
          </Stack>
          <Typography variant="body2">
            {value?.isValid() ? value.format('DD/MM/YYYY') : '—'}
          </Typography>
        </Stack>
      ) : (
        <Stack direction="row" spacing={0.5} alignItems="flex-start">
          <ShakingTextField error={Boolean(error)} sx={{ flex: 1, minWidth: 0 }}>
            <DatePicker
              label="Actual joining date"
              format="DD/MM/YYYY"
              value={value}
              maxDate={parseDateOnly(state.academicYearEndDate) ?? undefined}
              onChange={controller.change}
              disabled={disabled || query.isFetching || controller.saving}
              slotProps={{
                textField: {
                  name: 'actualJoiningDate',
                  required: true,
                  fullWidth: true,
                  size: 'small',
                  error: Boolean(error),
                  helperText: error || undefined,
                  onBlur: controller.blur,
                },
              }}
            />
          </ShakingTextField>
          <InfoTooltipIcon
            label="About actual joining date"
            title="Confirm when the student actually joins. Registration and Onboarding use this same date. Finance applies the configured policy automatically; the payment date is separate."
          />
        </Stack>
      )}
      {previewPending && <LinearProgress aria-label="Calculating fee preview" />}
      {state.canPreview && !state.isLocked && controller.previewFailed && (
        <Stack spacing={1} alignItems="flex-start">
          <StudentFeedback
            notificationKey="admission-joining-date-preview"
            presentation="persistent"
            severity="error"
          >
            {parseApiProblemDetail(previewQuery.error).detail ||
              'The fee preview could not be calculated. Retry before collecting fees.'}
          </StudentFeedback>
          <Button
            size="small"
            variant="outlined"
            disabled={disabled || previewQuery.isFetching}
            onClick={() => previewQuery.refetch()}
          >
            Retry fee preview
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
