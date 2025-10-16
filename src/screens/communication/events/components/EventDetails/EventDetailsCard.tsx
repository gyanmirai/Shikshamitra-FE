import React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Grid, Card, Typography } from '@mui/material';
import { Category, EventNote, LocationOn, Link as LinkIcon } from '@mui/icons-material';

import type { IEventAnnouncement } from '../../type';

const EventDetailsCard = ({ event }: { event: IEventAnnouncement | null }) => {
  if (!event) return null;

  // eslint-disable-next-line react/no-unstable-nested-components
  const InfoItem = ({
    icon,
    label,
    value,
    color = 'primary.main',
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    color?: string;
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 1,
        }}
      >
        {React.cloneElement(icon as React.ReactElement<{ sx?: { color: string } }>, {
          sx: { color },
        })}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card sx={{ p: 3, borderRadius: 2, boxShadow: 4, mb: 2 }}>
      <Grid container spacing={2}>
        {/* Category */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem icon={<EventNote />} label="Title" value={event?.title || '—'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem icon={<Category />} label="Type" value={event?.type || '—'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={event?.eventMode === 'online' ? <LinkIcon /> : <LocationOn />}
            label={event?.eventMode === 'online' ? 'Online Link' : 'Venue'}
            value={event?.eventMode === 'online' ? event?.onlineLink || '—' : event?.venue || '—'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem icon={<EventNote />} label="Description" value={event?.description || '—'} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon={<EventNote />}
            label="Recurrence"
            value={event?.recurrenceSummary || '—'}
          />
        </Grid>

        {/* Venue or Online Link */}
      </Grid>
    </Card>
  );
};

export default EventDetailsCard;
