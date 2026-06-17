import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  parseAcademicYearDateForPicker,
  formatAcademicYearDateForPayload,
} from './academic-year-date-utils';

describe('academic year date utilities', () => {
  it('formats academic-year payload dates without timezone conversion', () => {
    expect(formatAcademicYearDateForPayload(dayjs('2027-05-31'))).toBe('2027-05-31');
  });

  it('parses API timestamps by business-date prefix for picker values', () => {
    const parsed = parseAcademicYearDateForPicker('2027-05-31T00:00:00+00:00');

    expect(parsed.format('YYYY-MM-DD')).toBe('2027-05-31');
  });
});
