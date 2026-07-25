'use client';

import type { AdmissionCrmTimelineEventDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useState } from 'react';
import { Box, Alert, Stack, Button, Divider, Typography, LinearProgress } from '@mui/material';
import {
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmTimelineQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnrollmentDate, joinEnrollmentMetadata } from './enrollment-display';
import {
  ApplicantSection,
  ApplicantInlineNotice,
} from './applicant-workspace-primitives';
import {
  getActivityActorLabel,
  buildActivityActorLookupIds,
} from './applicant-activity-actors';

type Props = {
  leadId: string;
};

const initialEventCount = 20;
const emptyEvents: AdmissionCrmTimelineEventDto[] = [];

export function ApplicantActivityTimeline({ leadId }: Props) {
  const [eventLimit, setEventLimit] = useState(initialEventCount);
  const timelineQuery = useGetAdmissionCrmTimelineQuery({
    leadId,
    maxResultCount: eventLimit,
    sorting: 'OccurredAt DESC',
  });
  const events = timelineQuery.data?.items ?? emptyEvents;
  const totalCount = timelineQuery.data?.totalCount || 0;
  const remainingCount = Math.max(0, totalCount - events.length);
  const academicYearId = events[0]?.academicYearId;
  const actorLookupIds = useMemo(() => buildActivityActorLookupIds(events), [events]);
  const actorLookupCount = actorLookupIds ? actorLookupIds.split(',').length : 0;
  const actorStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      ids: actorLookupIds || undefined,
      maxResultCount: actorLookupCount,
      academicYearId,
    },
    { skip: !academicYearId || !actorLookupIds }
  );
  const actorStaffById = useMemo(
    () =>
      new Map(
        (actorStaffQuery.data || []).map((staff) => [
          staff.id,
          joinEnrollmentMetadata(staff.displayName, staff.employeeCode),
        ])
      ),
    [actorStaffQuery.data]
  );

  return (
    <ApplicantSection
      title="Activity & Audit"
      description="A chronological record of applicant, workflow, and automated changes."
    >
      {timelineQuery.isFetching ? (
        <LinearProgress aria-label="Loading applicant activity" />
      ) : null}
      {timelineQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => timelineQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Applicant activity could not be loaded.
        </Alert>
      ) : null}
      <Stack divider={<Divider flexItem />}>
        {events.map((event) => (
          <Box key={event.id} py={1.25} sx={{ minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ sm: 'baseline' }}
              justifyContent="space-between"
              gap={0.5}
            >
              <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                {event.title}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                gap={0.75}
                flexWrap="wrap"
                sx={{ flexShrink: 0 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Actor:{' '}
                  {getActivityActorLabel(
                    event.actorUserId,
                    actorStaffById,
                    actorStaffQuery.isFetching
                  )}
                </Typography>
                <Typography component="span" variant="caption" color="text.disabled" aria-hidden>
                  ·
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatEnrollmentDate(event.occurredAt, true)}
                </Typography>
              </Stack>
            </Stack>
            {event.details ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
              >
                {event.details}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Stack>
      {!timelineQuery.isFetching && !timelineQuery.isError && events.length === 0 ? (
        <ApplicantInlineNotice>No applicant activity has been recorded yet.</ApplicantInlineNotice>
      ) : null}
      {remainingCount > 0 ? (
        <Button
          size="small"
          disabled={timelineQuery.isFetching}
          onClick={() =>
            setEventLimit((current) => Math.min(totalCount, current + initialEventCount))
          }
        >
          Load Older Activity ({remainingCount})
        </Button>
      ) : null}
    </ApplicantSection>
  );
}
