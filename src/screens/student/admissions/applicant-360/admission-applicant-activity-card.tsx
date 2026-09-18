import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { useState } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import { EmptyContent } from 'src/components/empty-content';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { Box, Card, Stack, Button, Typography, CardContent } from '@mui/material';

import { getActivityPresentation } from './admission-applicant-360-model';

type Activity = AdmissionApplicant360['activities'][number];

export function AdmissionApplicantActivityCard({ activities }: { activities: Activity[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleActivities = expanded ? activities : activities.slice(0, 6);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6">Activity timeline</Typography>
            <Typography variant="body2" color="text.secondary">
              A single history of Inquiry, communication, profile, and application activity.
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {activities.length} {activities.length === 1 ? 'event' : 'events'}
          </Typography>
        </Stack>

        {activities.length === 0 ? (
          <EmptyContent
            filled
            title="No activity recorded"
            description="Inquiry and application events will appear here as the family progresses."
            sx={{ minHeight: 200, mt: 2 }}
            slotProps={{ img: { maxWidth: 88 } }}
          />
        ) : (
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
                      >
                        <Iconify icon={presentation.icon} width={18} />
                      </TimelineDot>
                      {!isLast && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent sx={{ pt: 0.75, pb: 2.5 }}>
                      <Typography variant="subtitle2">{presentation.title}</Typography>
                      {activity.description && activity.description !== presentation.title && (
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {fDateTime(activity.occurredAt) || 'Time not recorded'}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
            {activities.length > 6 && (
              <Button
                size="small"
                onClick={() => setExpanded((value) => !value)}
                endIcon={<Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
              >
                {expanded ? 'Show recent activity' : `Show all ${activities.length} events`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
