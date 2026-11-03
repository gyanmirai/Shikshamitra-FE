import { it, expect, describe } from 'vitest';

import { esiRequestError } from './esi-request-error';

describe('ESIC failure guidance', () => {
  it.each(['HR:Payroll:EsiPolicyNotEffective', 'HR:Payroll:EsiPolicySelectionInvalid'])(
    'explains unavailable monthly policy %s without echoing server data',
    (code) => {
      const message = esiRequestError(
        { status: 400, data: { errorCode: code, detail: 'sensitive server context' } },
        'Retry'
      );
      expect(message).toContain('policy effective for this month');
      expect(message).not.toContain('sensitive');
      expect(message).not.toBe('Retry');
    }
  );
  it('distinguishes historical safeguards, access failures, and transient failures', () => {
    expect(
      esiRequestError({ data: { errorCode: 'HR:Payroll:EsiConfigurationLocked' } }, 'Retry')
    ).toContain('locked, finalized, or paid');
    expect(
      esiRequestError(
        { data: { error: { code: 'HR:Payroll:EsiConfigurationPastMonth' } } },
        'Retry'
      )
    ).toContain('past month');
    expect(esiRequestError({ status: 403 }, 'Retry')).toContain('permissions and HR scope');
    expect(esiRequestError({ status: 503 }, 'Try again')).toBe('Try again');
  });
});
