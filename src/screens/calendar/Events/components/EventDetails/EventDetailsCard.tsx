import React from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Grid, Card, Typography } from '@mui/material';
import { EventStatus, EventStatusColor } from 'src/enums/event-type';
import { Category, EventNote, LocationOn, AccessTime, Link as LinkIcon } from '@mui/icons-material';

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
        {React.cloneElement(
          icon as React.ReactElement<{ sx?: { color: string; fontSize?: number } }>,
          {
            sx: { color, fontSize: 17 },
          }
        )}
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
          <InfoItem icon={<EventNote />} label="Title" value={event?.title || '-'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem icon={<Category />} label="Type" value={event?.type || '-'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={event?.eventMode === 'online' ? <LinkIcon /> : <LocationOn />}
            label={event?.eventMode === 'online' ? 'Online Link' : 'Venue'}
            value={event?.eventMode === 'online' ? event?.onlineLink || '-' : event?.venue || '-'}
          />
        </Grid>
        {/* Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<AccessTime sx={{ fontSize: 17 }} />}
            label="Status"
            value={
              <Label variant="soft" color={EventStatusColor[event?.status as EventStatus] as any}>
                {EventStatus[event?.status as EventStatus]}
              </Label>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem icon={<EventNote />} label="Description" value={event?.description || '-'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<EventNote />}
            label="Recurrence"
            value={event?.recurrenceSummary || '-'}
          />
        </Grid>

        {/* Venue or Online Link */}
      </Grid>
    </Card>
  );
};

export default EventDetailsCard;
