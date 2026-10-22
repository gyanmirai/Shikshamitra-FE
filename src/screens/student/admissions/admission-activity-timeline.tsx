import { useState } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Button, Typography } from '@mui/material';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import { EmptyContent } from 'src/components/empty-content';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { getActivityPresentation } from './applicant-360/admission-applicant-360-model';

export type AdmissionActivityTimelineItem = {
  id: string;
  activityType: string;
  description: string;
  occurredAt: string;
  actorName?: string | null;
  creatorId?: string | null;
};

type Props = {
  activities: AdmissionActivityTimelineItem[];
  emptyDescription: string;
  initiallyVisible?: number;
};

export function AdmissionActivityTimeline({
  activities,
  emptyDescription,
  initiallyVisible = 6,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleActivities = expanded ? activities : activities.slice(0, initiallyVisible);

  if (!activities.length)
    return (
      <EmptyContent
        filled
        title="No activity recorded"
        description={emptyDescription}
        sx={{ minHeight: 180, mt: 2 }}
        slotProps={{ img: { maxWidth: 80 } }}
      />
    );

  return (
    <>
      <Timeline
        sx={{
          px: 0,
          mt: 2,
          mb: 0,
          [`& .${timelineItemClasses.root}:before`]: { display: 'none' },
        }}
      >
        {visibleActivities.map((activity, index) => {
          const presentation = getActivityPresentation(activity);
          const isLast = index === visibleActivities.length - 1;
          return (
            <TimelineItem key={activity.id}>
              <TimelineSeparator>
                <TimelineDot
                  variant="outlined"
                  color={presentation.color === 'default' ? 'grey' : presentation.color}
                  sx={{ m: 0, mt: 0.5 }}
                >
                  <Iconify icon={presentation.icon} width={17} />
                </TimelineDot>
                {!isLast && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ pt: 0.25, pb: 2.25, minWidth: 0 }}>
                <Typography variant="subtitle2">{presentation.title}</Typography>
                {activity.description && activity.description !== presentation.title && (
                  <Typography variant="body2" color="text.secondary">
                    {activity.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Handled by:{' '}
                  {activity.actorName ||
                    (activity.creatorId ? 'Staff name unavailable' : 'No staff recorded')}
                  {' · '}
                  {fDateTime(activity.occurredAt) || 'Time not recorded'}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
      {activities.length > initiallyVisible && (
        <Button
          size="small"
          onClick={() => setExpanded((value) => !value)}
          endIcon={<Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
        >
          {expanded ? 'Show recent activity' : `Show all ${activities.length} events`}
        </Button>
      )}
    </>
  );
}
