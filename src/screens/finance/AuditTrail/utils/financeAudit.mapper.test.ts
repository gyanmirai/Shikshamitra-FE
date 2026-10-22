import { it, expect, describe } from 'vitest';
import { FinanceAuditSubModule } from 'src/enums/financeAudit.enum';

import {
  mapActionFilterToApiCode,
  mapSubModuleFilterToApiCode,
  mapFinanceAuditEventDtoToLog,
} from './financeAudit.mapper';

describe('financeAudit.mapper', () => {
  it('uses policy form labels and hides representation-only Apply On changes', () => {
    const event = {
      id: 'policy-event',
      subModuleCode: 'concession_policy',
      entityType: 'concession_policy',
      action: 'update',
      occurredAt: '2026-10-21T00:00:00Z',
      changedFields: [{ field: 'ApplyOn', oldValue: '1', newValue: '3' }],
    } as never;
    const log = mapFinanceAuditEventDtoToLog(event);
    expect(log.beforeData?.ApplyOn).toBe('Current unpaid installment');
    expect(log.afterData?.ApplyOn).toBe('All installments, including paid');
    const unchanged = mapFinanceAuditEventDtoToLog({
      ...(event as object),
      changedFields: [{ field: 'ApplyOn', oldValue: '3', newValue: 'AllFees' }],
    } as never);
    expect(unchanged.beforeData).toBeUndefined();
    expect(unchanged.afterData).toBeUndefined();
  });
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
