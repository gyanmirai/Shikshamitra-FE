import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights/types';

import dayjs from 'dayjs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

type InsightInput = {
  summary?: any;
  rows: any[];
};

const parseDate = (dateStr: any) => {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-').map(Number);
    if (year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const parsed = dayjs(
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      );
      return parsed.isValid() ? parsed : null;
    }
  }
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed : null;
};

const count = (apiCount: unknown, visiblePageCount: number) =>
  typeof apiCount === 'number'
    ? { value: apiCount }
    : { value: visiblePageCount, helper: 'Visible page only' };

export const buildScheduleExamInsightMetrics = ({
  summary,
  rows,
}: InsightInput): AcademicInsightMetric[] => {
  const todayStart = dayjs().startOf('day');
  const nextSevenDays = dayjs().add(7, 'day').endOf('day');

  return [
    {
      id: 'draft-exams',
      label: 'Draft exams',
      icon: 'solar:document-text-bold-duotone',
      ...count(
        summary?.pendingCount,
        rows.filter((row) => row.status === examScheduledStatus.Pending).length
      ),
    },
    {
      id: 'published-exams',
      label: 'Published',
      icon: 'solar:cloud-upload-bold-duotone',
      ...count(
        summary?.publishedCount,
        rows.filter((row) => row.status === examScheduledStatus.Published).length
      ),
    },
    {
      id: 'upcoming-exams',
      label: 'Upcoming 7 days',
      icon: 'solar:calendar-mark-bold-duotone',
      ...count(
        summary?.upcomingCount,
        rows.filter((row) => {
          const startDate = parseDate(row.startDate);
          return startDate && !startDate.isBefore(todayStart) && startDate.isBefore(nextSevenDays);
        }).length
      ),
    },
    {
      id: 'unassigned-rooms',
      label: 'Unassigned rooms',
      icon: 'fluent:conference-room-24-filled',
      ...count(
        summary?.unassignedRoomsCount,
        rows.filter((row) => (row.missingRoomAssignmentCount ?? 0) > 0).length
      ),
    },
    {
      id: 'needs-attention',
      label: 'Needs attention',
      icon: 'solar:danger-triangle-bold-duotone',
      ...count(
        summary?.needsAttentionCount,
        rows.filter(
          (row) => (row.issueCount ?? 0) > 0 || (row.missingRoomAssignmentCount ?? 0) > 0
        ).length
      ),
    },
    {
      id: 'completed-exams',
      label: 'Completed',
      icon: 'solar:verified-check-bold-duotone',
      ...count(
        summary?.completedCount,
        rows.filter((row) => row.status === examScheduledStatus.Completed).length
      ),
    },
  ];
};
