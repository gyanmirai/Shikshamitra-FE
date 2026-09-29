import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

import {
  type ExamMonthOption,
  buildExamMonthOptions,
  type AcademicYearForMonthFilter,
} from '../exam-month-filter';

export const ALL_EXAM_MONTHS = 'all-months';

export const buildResultExamMonthOptions = (
  academicYear?: AcademicYearForMonthFilter | null
): ExamMonthOption[] => {
  const months = buildExamMonthOptions(academicYear);
  if (months.length === 0) return [];

  return [
    {
      value: ALL_EXAM_MONTHS,
      label: 'All months',
      startDate: months[0].startDate,
      endDate: months[months.length - 1].endDate,
    },
    ...months,
  ];
};

export const buildResultExamQuery = (
  academicMediumId: string | undefined,
  standardId: string,
  divisionId: string,
  monthRange: ExamMonthOption | undefined
) => ({
  AcademicMediumId: academicMediumId,
  StandardId: standardId,
  DivisionId: divisionId,
  Status: examScheduledStatus.Completed,
  StartDate: monthRange?.startDate,
  EndDate: monthRange?.endDate,
  MaxResultCount: 1000,
});
