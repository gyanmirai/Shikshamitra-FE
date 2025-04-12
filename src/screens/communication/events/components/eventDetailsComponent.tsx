import React from 'react';

import { Box, Typography } from '@mui/material';

import type { IEventDetailsCardProps } from '../type';

const EventDetailsCard: React.FC<IEventDetailsCardProps> = ({ event }) => {
  if (!event) return null;

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        {event.eventTitle}
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="body1">
          <strong>Organizer:</strong> {event.eventOrganizer}
        </Typography>
        <Typography variant="body1">
          <strong>Venue:</strong> {event.eventVenue}
        </Typography>
        <Typography variant="body1">
          <strong>Type:</strong> {event.eventType}
        </Typography>
        <Typography variant="body1">
          <strong>Audience:</strong> {event.audience.join(', ')}
        </Typography>
        <Typography variant="body1">
          <strong>Description:</strong> {event.description}
        </Typography>
        <Typography variant="body1">
          <strong>Budget:</strong> ${Number(event.eventBudget).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default EventDetailsCard;
