import { it, expect, describe } from 'vitest';

import { formatWorkflowDateTime } from './workflow-list-format';

describe('formatWorkflowDateTime', () => {
  it.each([null, undefined, '', 'not-a-date'])('uses a neutral value for %s', (value) => {
    expect(formatWorkflowDateTime(value)).toBe('—');
  });

  it('formats a valid timestamp', () => {
    expect(formatWorkflowDateTime('2026-08-20T06:37:00Z')).toContain('20 Aug 2026');
  });
});
