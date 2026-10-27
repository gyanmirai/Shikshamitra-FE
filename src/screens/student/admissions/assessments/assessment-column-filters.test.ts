import { it, expect } from 'vitest';

import {
  readAssessmentColumnFilters,
  serializeAssessmentColumnFilters,
} from './assessment-column-filters';

it('round-trips scalar server criteria and reconstructs readable enum chips', () => {
  const raw =
    '[{"column":"className","type":"contains","value":"Grade","valueType":"string"},{"column":"attendance","type":"equals","value":"absent","valueType":"enum"}]';
  const filters = readAssessmentColumnFilters(raw);
  expect(filters[1]).toMatchObject({ label: 'Attendance', displayValue: 'Absent' });
  expect(serializeAssessmentColumnFilters(filters)).toBe(raw);
});

it.each([
  '[null]',
  '{}',
  'not json',
  '[{"column":"className","type":"contains","value":{},"valueType":"string"}]',
  '[{"column":"attendance","type":"equals","value":"other","valueType":"enum"}]',
  '[{"column":"nextAction","type":"equals","value":"Continue","valueType":"string"}]',
])('does not render malformed or ambiguous URL criterion chips: %s', (raw) => {
  expect(readAssessmentColumnFilters(raw)).toEqual([]);
});
