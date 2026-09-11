import type { AdmissionOfferEvent } from 'src/redux/student/admissions/admission-offer-types';

import { Stack, Divider, Typography } from '@mui/material';

export function OfferHistory({ events }: { events: AdmissionOfferEvent[] }) {
  if (!events.length) return <Typography variant="body2" color="text.secondary">No offer actions have been recorded.</Typography>;
  return (
    <Stack divider={<Divider flexItem />}>
      {events.slice().reverse().map((event) => <Stack key={event.id} direction="row" justifyContent="space-between" py={1} gap={2}>
        <Stack><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{event.action}</Typography>
          {event.reason && <Typography variant="caption" color="text.secondary">{event.reason}</Typography>}</Stack>
        <Typography variant="caption" color="text.secondary">{new Date(event.occurredAt).toLocaleString()}</Typography>
      </Stack>)}
    </Stack>
  );
}
