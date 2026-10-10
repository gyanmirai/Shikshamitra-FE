import type { Dayjs } from 'dayjs';

import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { Box, Alert, Stack, Button, TextField, Typography } from '@mui/material';

import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';

type Props = {
  scheduledAt: Dayjs | null;
  purpose: string;
  disabled: boolean;
  scheduling: boolean;
  dateError: boolean;
  error: string;
  titleId?: string;
  onDateChange: (value: Dayjs | null) => void;
  onDateError: (invalid: boolean) => void;
  onPurposeChange: (value: string) => void;
  onSchedule: () => void;
  onClose?: () => void;
  embedded?: boolean;
};

/** The owning inquiry/application panel retains the draft and supplies the authorized command. */
export function InquiryFollowUpScheduler({
  scheduledAt,
  purpose,
  disabled,
  scheduling,
  dateError,
  error,
  titleId,
  onDateChange,
  onDateError,
  onPurposeChange,
  onSchedule,
  onClose,
  embedded = false,
}: Props) {
  const theme = useTheme();
  const locked = disabled || scheduling;
  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSchedule();
      }}
      sx={{ minWidth: 0 }}
    >
      <FormBusyRegion busy={scheduling} label="Scheduling follow-up…">
        {onClose && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 2, pb: 0 }}>
            <Iconify icon="mdi:calendar-clock-outline" width={20} />
            <Typography id={titleId} variant="subtitle1">
              Schedule follow-up
            </Typography>
          </Stack>
        )}
        <Box
          component={embedded ? 'div' : Scrollbar}
          sx={{ flexGrow: 0, maxHeight: onClose ? 'calc(100dvh - 180px)' : undefined }}
        >
          <Stack spacing={1.5} sx={onClose ? { p: 2 } : undefined}>
            {error && <Alert severity="error">{error}</Alert>}
            <DateTimePicker
              desktopModeMediaQuery={theme.breakpoints.up('sm')}
              label="Next follow-up"
              format={ADMISSION_DATE_TIME_FORMAT}
              value={scheduledAt}
              disabled={locked}
              onChange={onDateChange}
              onError={(reason) => onDateError(Boolean(reason))}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  required: true,
                  error: dateError,
                  helperText: dateError ? 'Choose a valid date and time.' : undefined,
                },
              }}
            />
            <TextField
              required
              fullWidth
              size="small"
              label="Purpose"
              value={purpose}
              disabled={locked}
              multiline
              minRows={2}
              slotProps={{ htmlInput: { maxLength: 512 } }}
              onChange={(event) => onPurposeChange(event.target.value)}
            />
          </Stack>
        </Box>
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={onClose ? { p: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' } : { mt: 1.5 }}
        >
          {onClose && (
            <Button size="small" disabled={locked} onClick={onClose}>
              Cancel
            </Button>
          )}
          <LoadingButton
            type="submit"
            variant={onClose || embedded ? 'contained' : 'outlined'}
            size="small"
            loading={scheduling}
            disabled={locked || dateError || !purpose.trim() || !scheduledAt?.isValid()}
          >
            {onClose ? 'Schedule' : 'Schedule follow-up'}
          </LoadingButton>
        </Stack>
      </FormBusyRegion>
    </Box>
  );
}
