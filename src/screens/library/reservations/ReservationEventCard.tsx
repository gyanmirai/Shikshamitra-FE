import type { ReservationEvent } from 'src/redux/library/reservation-types';

import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import { Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { reservationStates } from './reservation-display';

export function ReservationEventCard({ event }: { event: ReservationEvent }) {
  const actor =
    event.actorKind === 2
      ? `System · ${event.systemPurpose === 1 ? 'Hold allocator' : event.systemPurpose === 2 ? 'Hold expiry' : 'Purpose unavailable'}`
      : event.actorKind === 1
        ? `User account ID: ${event.actorId || 'Unavailable'}`
        : 'Actor unavailable';
  return (
    <FormSectionCard
      title={event.eventType.replace(/([a-z])([A-Z])/g, '$1 $2')}
      icon={GlobalIcons.history}
      descriptionTooltip="An immutable recorded reservation event. Account, copy and loan IDs remain visible when names are unavailable."
    >
      <Stack spacing={1} sx={{ overflowWrap: 'anywhere' }}>
        <Typography variant="body2" component="time" dateTime={event.occurredAt}>
          {fDateTime(event.occurredAt)}
        </Typography>
        <Typography variant="body2">
          {reservationStates[event.previousState] || 'Unknown'} →{' '}
          {reservationStates[event.nextState] || 'Unknown'}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {event.reason || 'No reason recorded'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {actor} · Sequence: {event.sequence}
        </Typography>
        {event.copyId && <Typography variant="caption">Copy ID: {event.copyId}</Typography>}
        {event.holdId && <Typography variant="caption">Hold ID: {event.holdId}</Typography>}
        {event.loanId && <Typography variant="caption">Loan ID: {event.loanId}</Typography>}
      </Stack>
    </FormSectionCard>
  );
}
