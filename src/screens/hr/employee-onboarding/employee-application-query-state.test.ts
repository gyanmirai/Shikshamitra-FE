import { it, expect, describe } from 'vitest';

import { resolveCurrentEmployeeApplication } from './employee-application-query-state';

describe('resolveCurrentEmployeeApplication', () => {
  const applicationA = { id: 'application-a', firstName: 'Asha' } as any;
  const applicationB = { id: 'application-b', firstName: 'Bina' } as any;

  it('does not expose prior query data while a different application is requested', () => {
    expect(resolveCurrentEmployeeApplication('application-b', applicationA)).toBeUndefined();
  });

  it('uses only a matching current response or matching list fallback', () => {
    expect(resolveCurrentEmployeeApplication('application-b', applicationB)).toBe(applicationB);
    expect(
      resolveCurrentEmployeeApplication('application-b', applicationA, [applicationA, applicationB])
    ).toBe(applicationB);
  });
});
