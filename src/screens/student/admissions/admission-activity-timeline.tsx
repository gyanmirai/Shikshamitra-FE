import { EmptyContent } from 'src/components/empty-content';
import { ActivityHistoryTimeline } from 'src/screens/student/components/activity-history-timeline';

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
  if (!activities.length)
    return (
      <EmptyContent
        filled
        title="No Activity Recorded"
        description={emptyDescription}
        sx={{ minHeight: 160 }}
        slotProps={{ img: { maxWidth: 80 } }}
      />
    );

  return (
    <ActivityHistoryTimeline
      ariaLabel="Admission activity"
      initiallyVisible={initiallyVisible}
      items={activities.map((activity) => {
        const { title, icon } = getActivityPresentation(activity);
        const staff =
          activity.actorName?.trim() ||
          (activity.creatorId ? 'Staff name unavailable' : 'No staff recorded');
        const description = activity.description?.trim();
        return {
          id: activity.id,
          title,
          icon,
          occurredAt: activity.occurredAt,
          actor: `Handled by: ${staff}`,
          description: description?.toLowerCase() === title.toLowerCase() ? undefined : description,
        };
      })}
    />
  );
}
