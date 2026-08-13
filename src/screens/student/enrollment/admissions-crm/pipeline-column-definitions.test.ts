import { it, expect, describe } from 'vitest';

import {
  enrollmentPipelineColumns,
  getEnrollmentPipelineColumn,
} from './pipeline-column-definitions';

describe('Enrollment Pipeline column presentation', () => {
  it('keeps one labelled, theme-backed definition per Pipeline column', () => {
    const keys = enrollmentPipelineColumns.map((column) => column.key);

    expect(new Set(keys).size).toBe(keys.length);
    enrollmentPipelineColumns.forEach((column) => {
      expect(column.label).not.toBe('');
      expect(column.description).not.toBe('');
      expect(column.color).toMatch(/^(primary|secondary|success|warning|info|error)$/);
    });
  });

  it('resolves a column without duplicating its visible metadata', () => {
    const first = enrollmentPipelineColumns[0];
    expect(getEnrollmentPipelineColumn(first.key)).toBe(first);
    expect(getEnrollmentPipelineColumn(undefined)).toBeUndefined();
  });
});
