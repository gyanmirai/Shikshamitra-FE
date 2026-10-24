import { createApi } from '@reduxjs/toolkit/query/react';
import { financeModuleType, financePolicyType } from 'src/redux/tagTypes';
import type { IProrationPolicy } from 'src/screens/finance/policies/types/finance-policy.types';

const policies = new Map<string, IProrationPolicy>();
export const api = createApi({
  reducerPath: 'fixtureApi',
  tagTypes: [...Object.values(financeModuleType), ...Object.values(financePolicyType)],
  baseQuery: async (input: any) => {
    const args = typeof input === 'string' ? { url: input } : input;
    if (args.url === '/fee-heads/active') {
      return {
        data: [
          { id: 'tuition', name: 'Tuition fee', academicYearId: 'synthetic-year' },
          { id: 'transport', name: 'Transport fee', academicYearId: 'synthetic-year' },
          ...(new URLSearchParams(window.location.search).get('scroll') === 'long'
            ? Array.from({ length: 34 }, (_, index) => ({
                id: `synthetic-${index + 3}`,
                name: `Synthetic Fee ${String(index + 3).padStart(2, '0')}`,
                academicYearId: 'synthetic-year',
              }))
            : []),
        ],
      };
    }
    if (args.url === '/finance/proration-policies' && args.method !== 'POST')
      return { data: { totalCount: policies.size, items: [...policies.values()] } };
    if (args.url === '/finance/proration-policies' || args.method === 'PUT') {
      const id = args.method === 'PUT' ? args.url.split('/').pop() : 'fixture-policy';
      const policy: IProrationPolicy = {
        ...args.body,
        id,
        policyType: 'proration',
        policyCode: args.body.policyCode || 'PRO-01',
        description: args.body.description || '',
        version: (policies.get(id)?.version ?? 0) + 1,
        isUsedInDownstream: false,
        concurrencyStamp: 'fixture-stamp',
        academicYearName: '2026–27',
      };
      policies.set(id, policy);
      return { data: policy };
    }
    if (args.url.startsWith('/finance/proration-policies/')) {
      const policy = policies.get(args.url.split('/').pop());
      if (policy) return { data: policy };
    }
    return {
      error: {
        status: 404,
        data: { detail: 'No fixture response is configured for this operation.' },
      },
    };
  },
  endpoints: () => ({}),
});
