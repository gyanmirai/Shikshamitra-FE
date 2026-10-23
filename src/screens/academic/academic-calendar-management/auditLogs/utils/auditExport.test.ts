import { it, expect, describe } from 'vitest';

import { auditCsv, auditExportRows } from './auditExport';

import type { AuditLog } from '../types/auditLogs.types';

describe('displayed audit export', () => {
  it('includes only supplied rows and honors the diff option', () => {
    const log = {
      timestamp: '2026-10-23T00:00:00Z',
      actionLabel: 'Updated',
      entityName: 'Term',
      changedByName: 'Actor',
      reason: 'Corrected',
      diff: [{ displayName: 'Name', oldValue: 'A', newValue: 'B' }],
    } as AuditLog;
    expect(auditExportRows([log], true)).toHaveLength(1);
    expect(auditExportRows([log], true)[0].changes).toBe('Name: A -> B');
    expect(auditExportRows([log], false)[0]).not.toHaveProperty('changes');
  });
  it('escapes quotes and spreadsheet formulas without dropping data', () => {
    const csv = auditCsv([
      { timestamp: 'now', action: 'Updated', entity: 'A,"B"', user: '=1+1', reason: 'line\nbreak' },
    ]);
    expect(csv).toContain('"A,""B"""');
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"line\nbreak"');
  });
});
