import { useState } from 'react';
import { useGetLessonPlansQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import type { ReviewStatusFilter } from '../components/ReviewStatusTabs';

const REVIEW_STATUS_QUERY_VALUE: Record<Exclude<ReviewStatusFilter, 'all'>, number> = {
  pending: 1,
  approved: 2,
  rejected: 3,
  changes: 4,
};

export type ReviewQueueQueryArgs = {
  academicYearId?: string;
  status?: number;
  maxResultCount: number;
};

export function getReviewQueueQueryArgs(
  academicYearId: string | undefined,
  statusFilter: ReviewStatusFilter
): ReviewQueueQueryArgs {
  return {
    academicYearId,
    status: statusFilter === 'all' ? undefined : REVIEW_STATUS_QUERY_VALUE[statusFilter],
    maxResultCount: 1000,
  };
}

type UseReviewQueueQueryOptions = {
  academicYearId?: string;
  enabled: boolean;
};

export function useReviewQueueQuery({ academicYearId, enabled }: UseReviewQueueQueryOptions) {
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('pending');
  const query = useGetLessonPlansQuery(getReviewQueueQueryArgs(academicYearId, statusFilter), {
    skip: !enabled || !academicYearId,
    // A cached status must still be refreshed when the reviewer returns to its tab.
    refetchOnMountOrArgChange: true,
  });

  return {
    ...query,
    statusFilter,
    setStatusFilter,
  };
}
