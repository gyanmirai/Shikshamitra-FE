import { it, expect, describe } from 'vitest';

import {
  toHrAuditLabel,
  formatHrAuditText,
  formatHrAuditActor,
  formatHrAuditValue,
  getHrAuditValueText,
  parseHrAuditContext,
  toHrAuditRenderValue,
  formatHrAuditDateTime,
  formatHrAuditRelativeTime,
} from './hr-audit-format';

describe('HR audit formatting', () => {
  it('provides full readable and redacted table accessors for computed audit values', () => {
    expect(getHrAuditValueText([1], 'customWeeklyOffs')).toBe('Monday');
    expect(
      getHrAuditValueText({ sourcePolicyId: '3a216aea-8273-8586-a1a3-3bffdc298e2e', enabled: true })
    ).toContain('Linked record');
    expect(
      getHrAuditValueText({ sourcePolicyId: '3a216aea-8273-8586-a1a3-3bffdc298e2e' })
    ).not.toContain('3a216aea');
    expect(getHrAuditValueText('2026-10-26', 'effectiveFrom')).toBe('26 Oct 2026');
    expect(getHrAuditValueText([1, 2, 3, 4, 5, 6], 'customWeeklyOffs')).toContain('Saturday');
  });
  it('formats timestamps with display override when supplied', () => {
    expect(formatHrAuditDateTime('2026-05-24T10:00:00Z', '24 May 2026, 03:30 PM')).toBe(
      '24 May 2026, 03:30 PM'
    );
    expect(formatHrAuditDateTime('2026-06-08T17:51:05.304718+00:00')).toBe('08 Jun 2026, 11:21 PM');
    expect(formatHrAuditDateTime('20260525T10:19:04.4720646+00:00')).toBe('25 May 2026, 03:49 PM');
    expect(formatHrAuditDateTime('not-a-date')).toBe('-');
    expect(formatHrAuditRelativeTime('not-a-date')).toBe('-');
  });

  it('formats null, scalar, arrays, objects, date strings, and long values safely', () => {
    expect(formatHrAuditValue(null)).toBe('-');
    expect(formatHrAuditValue('approved')).toBe('approved');
    expect(formatHrAuditValue(['Mon', 'Tue'])).toBe('Mon, Tue');
    expect(formatHrAuditValue({ reason: 'manual lock', scope: { month: '2026-05' } })).toBe(
      'Reason: manual lock; Scope: Month: 2026-05'
    );
    expect(formatHrAuditValue('2026-05-24T15:30:00')).toBe('24 May 2026, 09:00 PM');
    expect(formatHrAuditValue('x'.repeat(125))).toBe(`${'x'.repeat(120)}...`);
  });

  it('formats compact database timestamps and hides raw references', () => {
    expect(formatHrAuditValue('20260525T10:19:04.4720646+00:00')).toContain('25 May 2026');
    expect(formatHrAuditValue('20260525T10:19:04.4720646+00:00')).not.toContain('T');
    expect(formatHrAuditValue('20250601T00:00:00+00:00')).toContain('01 Jun 2025');
    expect(formatHrAuditValue('20250601T00:00:00+00:00')).not.toContain('T');
    expect(formatHrAuditValue('297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7')).toBe('Unknown reference');
  });

  it('renders business date fields without timezone-shifted clock times', () => {
    const cases = [
      [{ date: '20250601T00:00:00+00:00' }, 'Date: 01 Jun 2025'],
      [{ fromDate: '2025-06-02T00:00:00+00:00' }, 'From Date: 02 Jun 2025'],
      [{ toDate: '20250603' }, 'To Date: 03 Jun 2025'],
      [{ effectiveFrom: '20250604T00:00:00+00:00' }, 'Effective From: 04 Jun 2025'],
      [{ effectiveTo: '2025-06-05' }, 'Effective To: 05 Jun 2025'],
      [{ holiday_date: '2025-06-06T00:00:00+00:00' }, 'Holiday Date: 06 Jun 2025'],
    ] as const;

    cases.forEach(([value, expected]) => {
      const rendered = formatHrAuditValue(value);
      expect(rendered).toContain(expected);
      expect(rendered).not.toContain('05:30 AM');
    });

    expect(formatHrAuditValue({ candidate: '20250601T00:00:00+00:00' })).toContain(
      'Candidate: 01 Jun 2025, 05:30 AM'
    );
  });

  it('uses direct changed-field keys when formatting scalar business dates', () => {
    const formatted = formatHrAuditValue('20250601T00:00:00+00:00', 120, 'effectiveFrom');
    const rendered = toHrAuditRenderValue('20250601T00:00:00+00:00', 'effectiveFrom');

    expect(formatted).toBe('01 Jun 2025');
    expect(formatted).not.toContain('05:30 AM');
    expect(rendered).toEqual({ kind: 'date', text: '01 Jun 2025' });
  });

  it('renders JSON strings as readable summaries instead of raw payloads', () => {
    const rendered = formatHrAuditValue(
      '{"employeeId":"297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7","effectiveFrom":"20250601T00:00:00+00:00"}'
    );

    expect(rendered).toContain('Employee ID: Linked record');
    expect(rendered).toContain('Effective From: 01 Jun 2025');
    expect(rendered).not.toContain('05:30 AM');
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

    expect(rendered).toContain('Employee ID: Linked record');
    expect(rendered).toContain('Effective From: 01 Jun 2025');
    expect(rendered).toContain('Payroll Policy ID: Linked record');
    expect(rendered).toContain('Status: active');
    expect(rendered).not.toContain('05:30 AM');
    expect(rendered).not.toContain('{');
    expect(rendered).not.toContain('297f91e4-1d0c-4c6e-b823-7df6f0c8f9a7');
  });

  it('formats policy holiday summaries without leaking raw JSON syntax', () => {
    const rendered = formatHrAuditValue(
      '{"totalCount":8,"includedCount":3,"removedCount":5,"manualCount":0,"centralCount":3}'
    );

    expect(rendered).toBe('Total: 8; Included: 3; Removed: 5; Manual: 0; Central: 3');
    expect(rendered).not.toContain('{');
    expect(rendered).not.toContain('"');
  });

  it('renders custom weekly-off numbers as weekday names', () => {
    expect(formatHrAuditValue('[0,2,6]', 120, 'customWeeklyOffs')).toBe(
      'Sunday, Tuesday, Saturday'
    );

    const rendered = toHrAuditRenderValue('[1,5]', 'customWeeklyOffs');
    expect(rendered).toEqual({
      kind: 'list',
      text: 'Monday, Friday',
      items: [
        { kind: 'scalar', text: 'Monday' },
        { kind: 'scalar', text: 'Friday' },
      ],
    });
  });

  it('builds structured render values for count summaries and references', () => {
    const summary = toHrAuditRenderValue(
      '{"totalCount":8,"includedCount":3,"removedCount":5,"manualCount":0}'
    );
    const reference = toHrAuditRenderValue(
      '{"sourcePolicyId":"3a216aea-8273-8586-a1a3-3bffdc298e2e"}'
    );

    expect(summary.kind).toBe('countSummary');
    if (summary.kind === 'countSummary') {
      expect(summary.items).toEqual([
        { label: 'Total', value: '8' },
        { label: 'Included', value: '3' },
        { label: 'Removed', value: '5' },
        { label: 'Manual', value: '0' },
      ]);
    }

    expect(reference.kind).toBe('object');
    if (reference.kind === 'object') {
      expect(reference.entries[0].label).toBe('Source Policy ID');
      expect(reference.entries[0].value).toEqual({ kind: 'reference', text: 'Linked record' });
    }
  });

  it('builds structured render values for holiday object arrays', () => {
    const rendered = toHrAuditRenderValue(
      '[{"id":"3a2170d2-084c-e067-2a5c-0539716dd973","holidayName":"Annual day","date":"20250601T00:00:00+00:00","source":"manual"}]'
    );

    expect(rendered.kind).toBe('list');
    if (rendered.kind === 'list') {
      expect(rendered.items[0].kind).toBe('object');
      expect(rendered.text).not.toContain('{');
      expect(rendered.text).not.toContain('3a2170d2-084c-e067-2a5c-0539716dd973');
      expect(rendered.text).toContain('Holiday Name: Annual day');
      expect(rendered.text).toContain('Date: 01 Jun 2025');
      expect(rendered.text).not.toContain('05:30 AM');
    }
  });

  it('formats cloned policy source references without exposing raw GUIDs', () => {
    const rendered = formatHrAuditValue(
      '{"sourcePolicyId":"3a216aea-8273-8586-a1a3-3bffdc298e2e"}'
    );

    expect(rendered).toBe('Source Policy ID: Linked record');
    expect(rendered).not.toContain('3a216aea-8273-8586-a1a3-3bffdc298e2e');
  });

  it('redacts GUIDs from audit text and actor fallbacks', () => {
    const sourceId = '3a216aea-8273-8586-a1a3-3bffdc298e2e';

    expect(formatHrAuditText(`SourcePolicyId: ${sourceId}`)).toBe('SourcePolicyId: Linked record');
    expect(formatHrAuditText(`{"sourcePolicyId":"${sourceId}"}`)).toBe(
      'Source Policy ID: Linked record'
    );
    expect(formatHrAuditActor(sourceId)).toBe('Unknown actor');
    expect(formatHrAuditActor('Admin')).toBe('Admin');
  });

  it('formats embedded JSON payloads in fallback audit summary text', () => {
    const rendered = formatHrAuditText(
      'HolidaySummary: {"totalCount":8,"includedCount":3} -> {"totalCount":9,"includedCount":4}'
    );

    expect(rendered).toContain('HolidaySummary: Total: 8; Included: 3');
    expect(rendered).toContain('-> Total: 9; Included: 4');
    expect(rendered).not.toContain('{');
    expect(rendered).not.toContain('"');
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
