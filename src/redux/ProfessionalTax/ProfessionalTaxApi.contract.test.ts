import { it, vi, expect, describe } from 'vitest';

import './ProfessionalTaxApi';

const captured = vi.hoisted(() => ({ endpoints: {} as any }));
vi.mock('src/redux/service', () => ({
  api: {
    injectEndpoints: ({ endpoints }: any) => {
      captured.endpoints = endpoints({
        query: (definition: any) => definition,
        mutation: (definition: any) => definition,
      });
      return {};
    },
  },
}));

describe('professional tax list paging', () => {
  it('forwards the selected page and size instead of repeatedly returning the default page', () => {
    expect(captured.endpoints.getProfessionalTax.query({ page: 4, pageSize: 50 })).toEqual({
      url: '/payroll/professional-taxes',
      method: 'GET',
      params: { page: 4, pageSize: 50 },
    });
  });
  it('retains selector calls without parameters', () => {
    expect(captured.endpoints.getProfessionalTax.query().params).toEqual({ page: 1, pageSize: 20 });
  });
});
