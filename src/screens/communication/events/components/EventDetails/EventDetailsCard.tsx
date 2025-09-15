import React from 'react';
import { Label } from 'src/components/label';
import { Box, Grid, Card, Chip, Typography } from '@mui/material';
import { EventStatus, EventStatusColor } from 'src/enums/event-type';

import type { IEventAnnouncement } from '../../type';

const EventDetailsCard = ({ event }: { event: IEventAnnouncement | null }) => (
  <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" color="primary.main">
        Event Mode
      </Typography>

      <Label variant="soft" color={EventStatusColor[event?.status as EventStatus] as any}>
        {EventStatus[event?.status as EventStatus]}
      </Label>
    </Box>

    <Grid container spacing={2}>
      {/* Title */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Title
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {event?.title}
        </Typography>
      </Grid>

      {/* Category */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Category
        </Typography>
        <Chip label={event?.type || 'N/A'} size="small" color="default" variant="outlined" />
      </Grid>

      {/* Importance */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Important Level
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {event?.importance_level || 'Normal'}
        </Typography>
      </Grid>

      {/* Start Date */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Start Date
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {event?.startDate ? new Date(event.startDate as string).toLocaleDateString('en-GB') : '—'}
        </Typography>
      </Grid>

      {/* End Date */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="body2" color="text.secondary">
          End Date
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {event?.endDate ? new Date(event.endDate as string).toLocaleDateString('en-GB') : '—'}
        </Typography>
      </Grid>

      {/* Event Mode */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Event Mode
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {event?.eventMode === 'online' ? 'Online' : 'Offline'}
        </Typography>
      </Grid>

      {/* Venue or Online Link */}
      {event?.eventMode === 'online' ? (
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Online Link
          </Typography>
          <Typography
            variant="body1"
            fontWeight="600"
            sx={{ color: 'primary.main', wordBreak: 'break-word' }}
          >
            {event?.onlineLink || '—'}
          </Typography>
        </Grid>
      ) : (
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Venue
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {event?.venue || '—'}
          </Typography>
        </Grid>
      )}
    </Grid>
  </Card>
);

export default EventDetailsCard;
