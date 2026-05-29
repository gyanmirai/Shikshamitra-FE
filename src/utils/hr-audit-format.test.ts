import { it, expect, describe } from 'vitest';

import {
  toHrAuditLabel,
  formatHrAuditValue,
  parseHrAuditContext,
  formatHrAuditDateTime,
  formatHrAuditRelativeTime,
} from './hr-audit-format';

describe('HR audit formatting', () => {
  it('formats timestamps with display override when supplied', () => {
    expect(formatHrAuditDateTime('2026-05-24T10:00:00Z', '24 May 2026, 03:30 PM')).toBe(
      '24 May 2026, 03:30 PM'
    );
    expect(formatHrAuditDateTime('20260525T10:19:04.4720646+00:00')).toContain('25 May 2026');
    expect(formatHrAuditDateTime('not-a-date')).toBe('-');
    expect(formatHrAuditRelativeTime('not-a-date')).toBe('-');
  });

  it('formats null, scalar, arrays, objects, date strings, and long values safely', () => {
    expect(formatHrAuditValue(null)).toBe('-');
    expect(formatHrAuditValue('approved')).toBe('approved');
    expect(formatHrAuditValue(['Mon', 'Tue'])).toBe('Mon, Tue');
    expect(formatHrAuditValue({ reason: 'manual lock', scope: { month: '2026-05' } })).toBe(
      'Reason: manual lock, Scope: Month: 2026-05'
    );
    expect(formatHrAuditValue('2026-05-24T15:30:00')).toBe('24 May 2026, 03:30 PM');
    expect(formatHrAuditValue('x'.repeat(125))).toBe(`${'x'.repeat(120)}...`);
  });

  it('formats compact database timestamps and hides raw references', () => {
    expect(formatHrAuditValue('20260525T10:19:04.4720646+00:00')).toContain('25 May 2026');
    expect(formatHrAuditValue('20260525T10:19:04.4720646+00:00')).not.toContain('T');
    expect(formatHrAuditValue('20250601T00:00:00+00:00')).toContain('01 Jun 2025');
    expect(formatHrAuditValue('20250601T00:00:00+00:00')).not.toContain('T');
    expect(formatHrAuditValue('297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7')).toBe('Unknown reference');
  });

  it('renders JSON strings as readable summaries instead of raw payloads', () => {
    const rendered = formatHrAuditValue(
      '{"employeeId":"297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7","effectiveFrom":"20250601T00:00:00+00:00"}'
    );

    expect(rendered).toContain('Employee ID: Unknown reference');
    expect(rendered).toContain('Effective From: 01 Jun 2025');
    expect(rendered).not.toContain('{');
    expect(rendered).not.toContain('297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7');
  });

  it('renders arrays and nested object summaries without raw payloads', () => {
    const rendered = formatHrAuditValue(
      [
        {
          employeeId: '297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7',
          effectiveFrom: '20250601T00:00:00+00:00',
        },
        { payrollPolicyId: '2a7f91e4-1d0c-4c6e-b823-7df6f0c8f9a8', status: 'active' },
      ],
      240
    );

    expect(rendered).toContain('Employee ID: Unknown reference');
    expect(rendered).toContain('Effective From: 01 Jun 2025');
    expect(rendered).toContain('Payroll Policy ID: Unknown reference');
    expect(rendered).toContain('Status: active');
    expect(rendered).not.toContain('{');
    expect(rendered).not.toContain('297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7');
  });

  it('parses structured context and ignores malformed context', () => {
    expect(parseHrAuditContext('{"reason":"correction"}')).toEqual({ reason: 'correction' });
    expect(parseHrAuditContext('[1,2,3]')).toBeNull();
    expect(parseHrAuditContext('{bad json')).toBeNull();
  });

  it('creates business labels from technical names', () => {
    expect(toHrAuditLabel('payroll_run')).toBe('Payroll Run');
    expect(toHrAuditLabel('set-default')).toBe('Set Default');
    expect(toHrAuditLabel('effectiveFrom')).toBe('Effective From');
    expect(toHrAuditLabel('employeeId')).toBe('Employee ID');
    expect(toHrAuditLabel('lastModificationTime')).toBe('Last Modification Time');
    expect(toHrAuditLabel('ipAddress')).toBe('IP Address');
  });
});
