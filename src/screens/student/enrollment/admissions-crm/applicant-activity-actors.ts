import type { AdmissionCrmTimelineEventDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

export const buildActivityActorLookupIds = (
  events: ReadonlyArray<Pick<AdmissionCrmTimelineEventDto, 'actorUserId'>>
) =>
  Array.from(
    new Set(
      events
        .map((event) => event.actorUserId)
        .filter((actorUserId): actorUserId is string => Boolean(actorUserId))
    )
  )
    .sort()
    .join(',');

export const getActivityActorLabel = (
  actorUserId: string | null | undefined,
  staffById: ReadonlyMap<string, string>,
  isLoading: boolean
) => {
  if (!actorUserId) return 'System';

  return staffById.get(actorUserId) || (isLoading ? 'Loading staff…' : 'Staff identity unavailable');
};
