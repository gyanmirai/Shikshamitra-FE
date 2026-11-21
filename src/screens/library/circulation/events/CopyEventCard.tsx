import type { LibraryCopyEvent } from 'src/redux/library/copy-events-types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Collapse, Typography } from '@mui/material';

import { CopyEventChanges } from './CopyEventChanges';
import { copyEventLabel } from './copy-event-display';

export function CopyEventCard({ event }: { event: LibraryCopyEvent }) {
  const [expanded, setExpanded] = useState(false);
  const changesId = `copy-event-${event.id}-changes`;
  return (
    <FormSectionCard
      title={copyEventLabel(event.eventType)}
      icon={GlobalIcons.history}
      descriptionTooltip="A historical copy event. Recorded changes cannot be edited or deleted here. Location and actor IDs are retained when readable names are unavailable."
      action={
        <Button
          type="button"
          size="small"
          color="inherit"
          variant="text"
          aria-expanded={expanded}
          aria-controls={changesId}
          onClick={() => setExpanded((value) => !value)}
          startIcon={<Iconify icon={GlobalIcons.eye} />}
        >
          {expanded ? 'Hide changes' : 'View changes'}
        </Button>
      }
    >
      <Stack spacing={1}>
        <Typography component="time" dateTime={event.occurredAt} variant="body2">
          {fDateTime(event.occurredAt)}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {event.reason || 'No reason recorded'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          Actor account ID: {event.actorId || 'Not available'} · Event sequence: {event.sequence}
        </Typography>
        {event.relatedLoanId && (
          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            Related loan ID: {event.relatedLoanId}
          </Typography>
        )}
        <Collapse in={expanded} id={changesId}>
          <CopyEventChanges event={event} />
        </Collapse>
      </Stack>
    </FormSectionCard>
  );
}
