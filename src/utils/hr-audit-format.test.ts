import { it, expect, describe } from 'vitest';

import {
  toHrAuditLabel,
  formatHrAuditValue,
  parseHrAuditContext,
  formatHrAuditDateTime,
} from './hr-audit-format';

describe('HR audit formatting', () => {
  it('formats timestamps with display override when supplied', () => {
    expect(formatHrAuditDateTime('2026-05-24T10:00:00Z', '24 May 2026, 03:30 PM')).toBe(
      '24 May 2026, 03:30 PM'
    );
  });

  it('formats null, scalar, arrays, objects, date strings, and long values safely', () => {
    expect(formatHrAuditValue(null)).toBe('-');
    expect(formatHrAuditValue('approved')).toBe('approved');
    expect(formatHrAuditValue(['Mon', 'Tue'])).toBe('Mon, Tue');
    expect(formatHrAuditValue({ reason: 'manual lock', scope: { month: '2026-05' } })).toBe(
      '{"reason":"manual lock","scope":{"month":"2026-05"}}'
    );
    expect(formatHrAuditValue('2026-05-24T15:30:00')).toBe('24 May 2026, 03:30 PM');
    expect(formatHrAuditValue('x'.repeat(125))).toBe(`${'x'.repeat(120)}...`);
  });

  it('parses structured context and ignores malformed context', () => {
    expect(parseHrAuditContext('{"reason":"correction"}')).toEqual({ reason: 'correction' });
    expect(parseHrAuditContext('[1,2,3]')).toBeNull();
    expect(parseHrAuditContext('{bad json')).toBeNull();
  });

  it('creates business labels from technical names', () => {
    expect(toHrAuditLabel('payroll_run')).toBe('Payroll Run');
    expect(toHrAuditLabel('set-default')).toBe('Set Default');
  });
});
