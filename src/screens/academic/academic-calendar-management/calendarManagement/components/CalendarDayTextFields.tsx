import type { FormikHandlers } from 'formik';

import { Box, Grid, Stack, TextField } from '@mui/material';

import { getVisibleCalendarDayDescription } from '../calendarDayText';
import {
  CALENDAR_DAY_TITLE_MAX_LENGTH,
  CALENDAR_DAY_DESCRIPTION_MAX_LENGTH,
} from '../calendarDay.constants';

interface Props {
  title: string;
  description: string;
  titleError?: string;
  descriptionError?: string;
  onChange: FormikHandlers['handleChange'];
  onBlur: FormikHandlers['handleBlur'];
}

const FieldHelper = ({
  valueLength,
  maxLength,
  error,
}: {
  valueLength: number;
  maxLength: number;
  error?: string;
}) => (
  <Stack component="span" direction="row" justifyContent="space-between" gap={1}>
    <Box component="span" role={error ? 'alert' : undefined}>
      {error || `Maximum ${maxLength} characters`}
    </Box>
    <Box component="span" sx={{ flexShrink: 0 }}>
      {valueLength} / {maxLength}
    </Box>
  </Stack>
);

/** Text inputs for a calendar marker, bounded to the backend persistence contract. */
const CalendarDayTextFields = ({
  title,
  description,
  titleError,
  descriptionError,
  onChange,
  onBlur,
}: Props) => {
  const visibleDescription = getVisibleCalendarDayDescription(description);

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          label="Title *"
          name="title"
          value={title}
          onChange={onChange}
          onBlur={onBlur}
          error={Boolean(titleError)}
          helperText={
            <FieldHelper
              valueLength={title.length}
              maxLength={CALENDAR_DAY_TITLE_MAX_LENGTH}
              error={titleError}
            />
          }
          placeholder="e.g. Independence Day, Diwali Break, Sports Day..."
          slotProps={{ htmlInput: { maxLength: CALENDAR_DAY_TITLE_MAX_LENGTH } }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          multiline
          rows={2}
          label="Description"
          name="description"
          value={visibleDescription}
          onChange={onChange}
          onBlur={onBlur}
          error={Boolean(descriptionError)}
          helperText={
            <FieldHelper
              valueLength={visibleDescription.length}
              maxLength={CALENDAR_DAY_DESCRIPTION_MAX_LENGTH}
              error={descriptionError}
            />
          }
          placeholder="Optional details or notes..."
          slotProps={{ htmlInput: { maxLength: CALENDAR_DAY_DESCRIPTION_MAX_LENGTH } }}
        />
      </Grid>
    </>
  );
};

export default CalendarDayTextFields;
