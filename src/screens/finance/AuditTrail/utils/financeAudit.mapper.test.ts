import { it, expect, describe } from 'vitest';
import { FinanceAuditSubModule } from 'src/enums/financeAudit.enum';

import {
  mapActionFilterToApiCode,
  mapSubModuleFilterToApiCode,
  mapFinanceAuditEventDtoToLog,
} from './financeAudit.mapper';

describe('financeAudit.mapper', () => {
  it('maps API event to FinanceAuditLog', () => {
    const log = mapFinanceAuditEventDtoToLog({
      id: 'evt-1',
      subModuleCode: 'collections',
      subModuleDisplayName: 'Collections',
      entityType: 'fee_payment',
      entityId: 'ent-1',
      entityName: 'REC-001',
      action: 'payment',
      actionLabel: 'Payment',
      summary: 'Fee payment received',
      actorDisplayName: 'Admin',
      occurredAt: '2026-06-03T10:00:00Z',
      occurredAtDisplay: '03 Jun 2026, 03:30 PM',
      changedFields: [{ field: 'pendingAmount', oldValue: '100', newValue: '0' }],
      studentId: 'stu-1',
      studentNameSnapshot: 'Test Student',
      studentGrNoSnapshot: '101',
      studentRollNoSnapshot: '5',
      correlationId: 'fc-abc',
    });

    expect(log.subModule).toBe(FinanceAuditSubModule.COLLECTIONS);
    expect(log.description).toBe('Fee payment received');
    expect(log.beforeData?.pendingAmount).toBe('100');
    expect(log.afterData?.pendingAmount).toBe('0');
    expect(log.correlationId).toBe('fc-abc');
    expect(log.createdAtDisplay).toBe('03 Jun 2026, 03:30 PM');
  });

  it('maps UI filters to API codes', () => {
    expect(mapSubModuleFilterToApiCode(FinanceAuditSubModule.COLLECTIONS)).toBe('collections');
    expect(mapActionFilterToApiCode('PAYMENT')).toBe('payment');
  });
});
