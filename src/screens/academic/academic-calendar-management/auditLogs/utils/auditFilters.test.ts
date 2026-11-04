import { it, expect, describe } from 'vitest';

import { matchesAuditFilters } from './auditFilters';
import { EMPTY_FILTERS } from '../constants/auditLogs.constants';

import type { AuditLog } from '../types/auditLogs.types';

const log = { timestamp: '2026-11-04T09:00:00', action: 4, entityName: 'Holiday' } as AuditLog;
const now = new Date('2026-11-04T12:00:00');

describe('audit page filters', () => {
  it('does not treat an absent approval status as Not required', () => {
    expect(matchesAuditFilters(log, { ...EMPTY_FILTERS, approvalStatus: '0' }, now)).toBe(false);
  });
  it('matches dates using the selected local calendar day', () => {
    expect(matchesAuditFilters(log, { ...EMPTY_FILTERS, dateRange: 'today' }, now)).toBe(true);
    expect(matchesAuditFilters(log, { ...EMPTY_FILTERS, dateRange: 'yesterday' }, now)).toBe(false);
  });

  it('includes the complete last seven calendar days and excludes older records', () => {
    const filters = { ...EMPTY_FILTERS, dateRange: 'last7' as const };
    expect(matchesAuditFilters({ ...log, timestamp: '2026-10-29T00:00:00' }, filters, now)).toBe(
      true
    );
    expect(matchesAuditFilters({ ...log, timestamp: '2026-10-28T23:59:59' }, filters, now)).toBe(
      false
    );
  });

  it('combines search with an inclusive custom date range', () => {
    const filters = {
      ...EMPTY_FILTERS,
      search: ' holiday ',
      dateRange: 'custom' as const,
      fromDate: '2026-11-04',
      toDate: '2026-11-04',
    };
    expect(matchesAuditFilters(log, filters, now)).toBe(true);
    expect(matchesAuditFilters({ ...log, timestamp: '2026-11-05T00:00:00' }, filters, now)).toBe(
      false
    );
  });
});
