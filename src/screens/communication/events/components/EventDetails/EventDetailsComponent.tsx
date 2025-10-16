import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { EventStatus, EventStatusColor } from 'src/enums/event-type';

import EventDetailsCard from './EventDetailsCard';
import EventDescriptionComponent from './EventDescriptionComponent';

import type { IEventAnnouncement } from '../../type';

const EventDetailsComponent = ({ event }: { event: IEventAnnouncement | null }) => (
  <Scrollbar sx={{ height: '500px', p: 2 }}>
    <Box
      sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 1, mb: 1 }}
    >
      <Label variant="soft" color={EventStatusColor[event?.status as EventStatus] as any}>
        {EventStatus[event?.status as EventStatus]}
      </Label>
    </Box>
    <EventDetailsCard event={event} />
    <EventDescriptionComponent event={event} />
    {/* <EventModeCard event={event} /> */}
  </Scrollbar>
);

export default EventDetailsComponent;
