import { it, expect, describe } from 'vitest';

import { financeAuditApi } from './financeAuditApi';

describe('financeAuditApi contracts', () => {
  it('exposes audit read endpoints', () => {
    expect(financeAuditApi.endpoints.getFinanceAuditEvents).toBeTruthy();
    expect(financeAuditApi.endpoints.getFinanceStudentAuditEvents).toBeTruthy();
    expect(financeAuditApi.endpoints.getFinanceEntityAuditEvents).toBeTruthy();
    expect(financeAuditApi.endpoints.getFinanceAuditCorrelation).toBeTruthy();
    expect(financeAuditApi.endpoints.getFinanceAuditEvent).toBeTruthy();
    expect(financeAuditApi.endpoints.getFinanceAuditStudentLookup).toBeTruthy();
  });
});
