import dayjs from 'dayjs';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';

import type { CycleConfigurationState } from './use-cycle-configuration';

export function CycleWindowFields({ state }: { state: CycleConfigurationState }) {
  const { startDate, setStartDate, endDate, setEndDate, datesInvalid } = state;
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={!startDate}>
          <DatePicker
            label="Applications open"
            format={ADMISSION_DATE_FORMAT}
            value={startDate ? dayjs(startDate) : null}
            onChange={(value) => setStartDate(value?.isValid() ? value.format('YYYY-MM-DD') : '')}
            slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={datesInvalid}>
          <DatePicker
            label="Applications close"
            format={ADMISSION_DATE_FORMAT}
            value={endDate ? dayjs(endDate) : null}
            onChange={(value) => setEndDate(value?.isValid() ? value.format('YYYY-MM-DD') : '')}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                size: 'small',
                error: datesInvalid,
                helperText: datesInvalid ? 'Close date must be after open date' : undefined,
              },
            }}
          />
        </ShakingTextField>
      </Grid>
    </>
  );
}
