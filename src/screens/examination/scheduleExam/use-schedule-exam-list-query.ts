import type { Dayjs } from 'dayjs';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

export const SCHEDULE_EXAM_STATUS_REFRESH_INTERVAL_MS = 60_000;

export const SCHEDULE_EXAM_LIST_QUERY_OPTIONS = Object.freeze({
  pollingInterval: SCHEDULE_EXAM_STATUS_REFRESH_INTERVAL_MS,
  skipPollingIfUnfocused: true,
});

type ScheduleExamListQueryInput = {
  mediumId?: string;
  activeStatus: number;
  selectedClass: string;
  dateRange: [Dayjs | null, Dayjs | null];
  page: number;
  pageSize: number;
};

export const buildScheduleExamListQueryParams = ({
  mediumId,
  activeStatus,
  selectedClass,
  dateRange,
  page,
  pageSize,
}: ScheduleExamListQueryInput) => {
  const isPendingStatus = activeStatus === examScheduledStatus.Pending;

  return {
    AcademicMediumId: mediumId,
    Status: activeStatus,
    StandardId: selectedClass !== 'all' && selectedClass ? selectedClass : undefined,
    StartDate:
      !isPendingStatus && dateRange[0]?.isValid()
        ? dateConvertor(dateRange[0].format(dateFormat))
        : undefined,
    EndDate:
      !isPendingStatus && dateRange[1]?.isValid()
        ? dateConvertor(dateRange[1].format(dateFormat))
        : undefined,
    SkipCount: (page - 1) * pageSize,
    MaxResultCount: pageSize,
  };
};

export const useScheduleExamListQuery = (input: ScheduleExamListQueryInput) => {
  const params = buildScheduleExamListQueryParams(input);
  const query = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params,
    // Effective status is time-derived on the server. Polling refreshes tab membership,
    // counters, and row badges even when no user interaction causes a new request.
    options: SCHEDULE_EXAM_LIST_QUERY_OPTIONS,
  });

  return { query, params };
};
