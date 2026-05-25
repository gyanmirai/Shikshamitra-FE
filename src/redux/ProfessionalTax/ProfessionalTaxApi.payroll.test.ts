import { it, expect, describe } from 'vitest';

import { professionalTaxEndpoint } from './ProfessionalTaxApi';

describe('professional tax payroll API contract', () => {
  it('uses the payroll professional taxes endpoint', () => {
    expect(professionalTaxEndpoint).toBe('/payroll/professional-taxes');
  });
});
