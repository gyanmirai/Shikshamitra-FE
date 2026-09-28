import { it, expect, describe } from 'vitest';

import { formatWorkflowDateTime, formatWorkflowListDate } from './workflow-list-format';

describe('formatWorkflowDateTime', () => {
  it.each([null, undefined, '', 'not-a-date'])('uses a neutral value for %s', (value) => {
    expect(formatWorkflowDateTime(value)).toBe('—');
  });

  it('formats a valid timestamp', () => {
    expect(formatWorkflowDateTime('2026-08-20T06:37:00Z')).toContain('20 Aug 2026');
  });

  it('treats timezone-less API timestamps as UTC before displaying local time', () => {
    expect(formatWorkflowDateTime('2026-09-30T11:30:00')).toBe('30 Sep 2026 5:00 pm');
  });
});

describe('formatWorkflowListDate', () => {
  it('shows dates in the admission table format and keeps empty values neutral', () => {
    expect(formatWorkflowListDate('2026-09-24T11:30:00Z')).toBe('24-09-2026');
    expect(formatWorkflowListDate(null)).toBe('—');
  });
});
