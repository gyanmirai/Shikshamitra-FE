import React from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Grid, Card, Typography } from '@mui/material';
import { EventStatus, EventStatusColor } from 'src/enums/event-type';
import {
  Today,
  Repeat,
  Category,
  EventNote,
  AccessTime,
  LocationOn,
  EventRepeat,
  PriorityHigh,
  CalendarMonth,
  Link as LinkIcon,
  Event as EventIcon,
} from '@mui/icons-material';

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
          width: 36,
          height: 36,
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
      {/* Status */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Label variant="soft" color={EventStatusColor[event?.status as EventStatus] as any}>
          {EventStatus[event?.status as EventStatus]}
        </Label>
      </Box>

      <Grid container spacing={2}>
        {/* Category */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem icon={<Category />} label="Category" value={event?.type || '—'} />
        </Grid>

        {/* Importance */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<PriorityHigh />}
            label="Importance"
            value={event?.importance_level || 'Normal'}
            color="error.main"
          />
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<AccessTime />}
            label="Start Date"
            value={
              event?.startDate
                ? new Date(event.startDate as string).toLocaleDateString('en-GB')
                : '—'
            }
          />
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<AccessTime />}
            label="End Date"
            value={
              event?.endDate ? new Date(event.endDate as string).toLocaleDateString('en-GB') : '—'
            }
          />
        </Grid>

        {/* Event Mode */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<EventIcon />}
            label="Event Mode"
            value={event?.eventMode === 'online' ? 'Online' : 'Offline'}
          />
        </Grid>

        {/* Venue or Online Link */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={event?.eventMode === 'online' ? <LinkIcon /> : <LocationOn />}
            label={event?.eventMode === 'online' ? 'Online Link' : 'Venue'}
            value={event?.eventMode === 'online' ? event?.onlineLink || '—' : event?.venue || '—'}
          />
        </Grid>

        {/* Recurring */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem icon={<Repeat />} label="Recurring" value={event?.isRecurring ? 'Yes' : 'No'} />
        </Grid>

        {/* Repeat Frequency */}
        {event?.isRecurring && (
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              icon={<CalendarMonth />}
              label="Repeat Frequency"
              value={event?.repeatFrequency || '—'}
            />
          </Grid>
        )}

        {/* Meeting Date */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<Today />}
            label="Meeting Date"
            value={
              event?.meetingDate
                ? new Date(event.meetingDate as string).toLocaleDateString('en-GB')
                : '—'
            }
          />
        </Grid>

        {/* Meeting Time */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoItem
            icon={<AccessTime />}
            label="Meeting Time"
            value={
              event?.meetingTime
                ? new Date(event.meetingTime as string).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'
            }
          />
        </Grid>

        {/* Repeat Until */}
        {event?.isRecurring && (
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              icon={<EventRepeat />}
              label="Repeat Until"
              value={
                event?.repeatUntil
                  ? new Date(event.repeatUntil as string).toLocaleDateString('en-GB')
                  : '—'
              }
            />
          </Grid>
        )}

        {/* Day (for Weekly) */}
        {event?.repeatFrequency === 'Weekly' && (
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem icon={<EventNote />} label="Day" value={event?.day || '—'} />
          </Grid>
        )}
      </Grid>
    </Card>
  );
};

export default EventDetailsCard;
