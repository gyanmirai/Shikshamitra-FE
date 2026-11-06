import dayjs from 'dayjs';
import { Grid } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { StudentFeedback } from 'src/components/student-feedback';

import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';

import type { CycleConfigurationState } from './use-cycle-configuration';

export function CycleScheduleFields({
  status,
  state,
}: {
  status: number;
  state: CycleConfigurationState;
}) {
  const {
    publishAt,
    setPublishAt,
    closeAt,
    setCloseAt,
    scheduleInvalid,
    dismissedNotice,
    setDismissedNotice,
  } = state;
  return (
    <>
      {status === 0 && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <DateTimePicker
            label="Publish at"
            format={ADMISSION_DATE_TIME_FORMAT}
            value={publishAt ? dayjs(publishAt) : null}
            onChange={(value) => {
              setPublishAt(value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : '');
              setDismissedNotice(null);
            }}
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <DateTimePicker
          label="Close at"
          format={ADMISSION_DATE_TIME_FORMAT}
          value={closeAt ? dayjs(closeAt) : null}
          onChange={(value) => {
            setCloseAt(value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : '');
            setDismissedNotice(null);
          }}
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
        />
      </Grid>
      {scheduleInvalid && dismissedNotice !== 'schedule' && (
        <Grid size={{ xs: 12 }}>
          <StudentFeedback
            notificationKey="STU-0042"
            presentation="inline"
            severity="warning"
            onClose={() => setDismissedNotice('schedule')}
            closeText="Dismiss schedule warning"
          >
            Choose a future time. Close time must be later than publish time.
          </StudentFeedback>
        </Grid>
      )}
    </>
  );
}
