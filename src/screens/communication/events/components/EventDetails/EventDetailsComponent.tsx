import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';

import EventDetailsCard from './EventDetailsCard';
import EventDescriptionComponent from './EventDescriptionComponent';

import type { IEventAnnouncement } from '../../type';

const EventDetailsComponent = ({ event }: { event: IEventAnnouncement | null }) => (
  <Scrollbar sx={{ height: '350px', p: 2 }}>
    <EventDetailsCard event={event} />
    <EventDescriptionComponent event={event} />
    {/* <EventModeCard event={event} /> */}
  </Scrollbar>
);

export default EventDetailsComponent;
