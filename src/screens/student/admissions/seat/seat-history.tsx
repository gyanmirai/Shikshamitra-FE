import type { AdmissionSeatEvent } from 'src/redux/student/admissions/admission-seat-types';

import { fDateTime } from 'src/utils/format-time';
import { Stack, Divider, Typography } from '@mui/material';

import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';

export function SeatHistory({ events }: { events: AdmissionSeatEvent[] }) {
  if (!events.length) return <Typography variant="body2" color="text.secondary">No seat actions have been recorded.</Typography>;
  return (
    <Stack divider={<Divider flexItem />}>
      {events.slice().reverse().map((event) => <Stack key={event.id} direction="row" justifyContent="space-between" py={1} gap={2}>
        <Stack><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{event.action.replace('seat-', '')}</Typography>
          {event.reason && <Typography variant="caption" color="text.secondary">{event.reason}</Typography>}</Stack>
        <Typography variant="caption" color="text.secondary">{fDateTime(event.occurredAt, ADMISSION_DATE_TIME_FORMAT)}</Typography>
      </Stack>)}
    </Stack>
  );
}
