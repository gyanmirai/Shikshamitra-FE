import { it, expect, describe } from 'vitest';

import { getExamMonthRange } from '../exam-month-filter';
import {
  ALL_EXAM_MONTHS,
  buildResultExamQuery,
  buildResultExamMonthOptions,
} from './result-exam-filter';

describe('Result Creation exam filters', () => {
  const options = buildResultExamMonthOptions({
    startDate: '2026-04-01',
    endDate: '2027-03-31',
  });

  it('filters September exams by their scheduled date range without requiring published marks', () => {
    expect(buildResultExamQuery('medium', 'class-10', 'division-a', getExamMonthRange(options, '2026-09')))
      .toEqual({
        AcademicMediumId: 'medium',
        StandardId: 'class-10',
        DivisionId: 'division-a',
        Status: 2,
        StartDate: '2026-09-01T00:00:00.000',
        EndDate: '2026-09-30T23:59:59.999',
        MaxResultCount: 1000,
      });
  });

  it('offers the full academic year without falling back to the API current-week range', () => {
    expect(options[0]).toMatchObject({ value: ALL_EXAM_MONTHS, label: 'All months' });
    expect(buildResultExamQuery('medium', 'class-10', 'division-a', getExamMonthRange(options, ALL_EXAM_MONTHS)))
      .toMatchObject({
        StartDate: '2026-04-01T00:00:00.000',
        EndDate: '2027-03-31T23:59:59.999',
      });
  });
});
