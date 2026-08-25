import { it, expect, describe } from 'vitest';

import { esiStatutoryEndpoint, buildEsiImpactPreviewRequest } from './statutory-scheme-api';

describe('ESI statutory scheme API contract', () => {
  it('uses the payroll statutory scheme route', () => {
    expect(esiStatutoryEndpoint).toBe('/payroll/statutory-schemes/esi');
  });

  it('sends payroll month in the backend contract format', () => {
    expect(buildEsiImpactPreviewRequest('08-2026')).toEqual({
      url: '/payroll/statutory-schemes/esi/impact-preview',
      method: 'POST',
      body: { monthYear: '08-2026' },
    });
  });
});
