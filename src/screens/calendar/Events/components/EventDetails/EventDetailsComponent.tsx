import { Label } from 'src/components/label';
import React, { useMemo, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEventByIdQuery } from 'src/redux/calendar/events/eventApi';
import {
  Close,
  Group,
  AccessTime,
  LocationOn,
  InfoTwoTone,
  CalendarToday,
  Link as LinkIcon,
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Link,
  Stack,
  Dialog,
  Divider,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import type { IEventAnnouncement } from '../../type';

type EventDetails = Partial<IEventAnnouncement> & {
  mode?: number | string;
  poster?: string | null;
  eventType?: {
    name?: string;
    typeName?: string;
    color?: string;
  } | null;
  audienceIds?: string[];
  recurrenceJson?: string | null;
};

const EventDetailsComponent = ({
  open,
  event,
  onClose,
}: {
  event: IEventAnnouncement | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEventByIdQuery,
    params: { id: event?.id || '' },
    options: { skip: !event?.id },
  });

  const eventData = useMemo(() => (data || event || {}) as EventDetails, [data, event]);
  const title = eventData.title || 'Event details';
  const eventType = eventData.eventType?.name || eventData.typeName || eventData.type || 'General';
  const mode = getEventMode(eventData);
  const isOnline = mode === 'Online';
  const startDate = eventData.meetingDate || eventData.startDate;
  const endDate = eventData.endDate || eventData.meetingDate || eventData.startDate;
  const audienceCount = eventData.audienceIds?.length ?? eventData.audience?.length ?? 0;
  const meetingTarget = isOnline ? eventData.onlineLink || eventData.link : eventData.venue;
  const attachment = useMemo(() => resolveAttachment(eventData), [eventData]);

  useEffect(() => {
    if (!attachment.objectUrl) {
      return undefined;
    }

    return () => URL.revokeObjectURL(attachment.objectUrl!);
  }, [attachment.objectUrl]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
          sx={{ px: 3, py: 2.5 }}
        >
          <Stack gap={1} minWidth={0}>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Label color="primary">{eventType}</Label>
              <Label color={isOnline ? 'info' : 'default'}>{mode}</Label>
              <Label color={getStatusColor(eventData.status)}>
                {getStatusLabel(eventData.status)}
              </Label>
            </Stack>
            <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
              {title}
            </Typography>
          </Stack>

          <IconButton onClick={onClose} aria-label="Close dialog" sx={{ flexShrink: 0 }}>
            <Close />
          </IconButton>
        </Stack>
        <Divider />
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Scrollbar sx={{ maxHeight: { xs: '72vh', md: '68vh' } }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <InfoCard
                  icon={<CalendarToday color="primary" />}
                  title="Date"
                  value={formatDateRange(startDate, endDate)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <InfoCard
                  icon={<AccessTime color="primary" />}
                  title="Time"
                  value={formatTimeRange(eventData.startTime, eventData.endTime)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <InfoCard
                  icon={<Group color="primary" />}
                  title="Audience"
                  value={`${audienceCount} ${audienceCount === 1 ? 'group' : 'groups'}`}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <InfoCard
                  icon={isOnline ? <LinkIcon color="primary" /> : <LocationOn color="primary" />}
                  title={isOnline ? 'Meeting Link' : 'Venue'}
                  value={
                    isOnline && meetingTarget ? (
                      <Link href={meetingTarget} target="_blank" rel="noopener" underline="hover">
                        {meetingTarget}
                      </Link>
                    ) : (
                      meetingTarget || '-'
                    )
                  }
                />
              </Grid>

              {eventData.isRecurring && (
                <Grid size={{ xs: 12 }}>
                  <InfoCard
                    icon={<AccessTime color="primary" />}
                    title="Recurrence"
                    value={
                      eventData.recurrenceSummary || eventData.recurrenceJson || 'Recurring event'
                    }
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <InfoCard
                  icon={<InfoTwoTone color="primary" />}
                  title="Description"
                  value={
                    eventData.description ? (
                      <Typography
                        component="div"
                        variant="body2"
                        sx={{ color: 'text.primary', wordBreak: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(eventData.description) }}
                      />
                    ) : (
                      '-'
                    )
                  }
                />
              </Grid>

              {attachment.url && (
                <Grid size={{ xs: 12 }}>
                  <InfoCard
                    icon={<LinkIcon color="primary" />}
                    title="Poster"
                    value={
                      <Link href={attachment.url} download={attachment.name} underline="hover">
                        {attachment.name}
                      </Link>
                    }
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </Scrollbar>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsComponent;

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
};

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value }) => (
  <Box
    sx={{
      p: 2,
      height: '100%',
      borderRadius: 1,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
    }}
  >
    <Stack direction="row" gap={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          display: 'flex',
          borderRadius: 1,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.neutral',
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Stack gap={0.5} minWidth={0}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Typography component="div" variant="body2" sx={{ wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  </Box>
);

const getEventMode = (eventData: EventDetails) => {
  if (typeof eventData.eventMode === 'string' && eventData.eventMode) {
    return eventData.eventMode.toLowerCase() === 'online' ? 'Online' : 'Offline';
  }

  if (typeof eventData.mode === 'number') {
    return eventData.mode === 0 ? 'Online' : 'Offline';
  }

  if (typeof eventData.mode === 'string') {
    return eventData.mode.toLowerCase() === 'online' || eventData.mode === '0'
      ? 'Online'
      : 'Offline';
  }

  return 'Offline';
};

const resolveAttachment = (eventData: EventDetails) => {
  const { attachment } = eventData;
  if (attachment instanceof File) {
    const objectUrl = URL.createObjectURL(attachment);
    return {
      name: attachment.name,
      url: objectUrl,
      objectUrl,
    };
  }

  if (attachment && typeof attachment === 'object') {
    return {
      name: attachment.name || attachment.url || attachment.base64 || 'Poster',
      url: attachment.url || attachment.base64 || '',
      objectUrl: undefined,
    };
  }

  if (typeof eventData.poster === 'string' && eventData.poster) {
    const posterName = eventData.poster.split('/').pop();
    return {
      name: posterName || eventData.poster,
      url: eventData.poster,
      objectUrl: undefined,
    };
  }

  return { name: '', url: '', objectUrl: undefined };
};

const getStatusLabel = (status?: number) => {
  switch (status) {
    case 0:
      return 'Upcoming';
    case 1:
      return 'Active';
    case 2:
      return 'Completed';
    default:
      return 'Draft';
  }
};

const getStatusColor = (status?: number): 'default' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 0:
      return 'info';
    case 1:
      return 'success';
    case 2:
      return 'default';
    default:
      return 'warning';
  }
};

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) {
    return '-';
  }

  if (!end || start === end) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTimeRange = (start?: unknown, end?: unknown) => {
  const startText = typeof start === 'string' ? start : '';
  const endText = typeof end === 'string' ? end : '';

  if (!startText && !endText) {
    return '-';
  }

  if (!endText) {
    return startText;
  }

  return `${startText} - ${endText}`;
};
