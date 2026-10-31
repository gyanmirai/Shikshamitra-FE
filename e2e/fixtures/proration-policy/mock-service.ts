import { createApi } from '@reduxjs/toolkit/query/react';
import { financeModuleType, financePolicyType } from 'src/redux/tagTypes';
import type { IProrationPolicy } from 'src/screens/finance/policies/types/finance-policy.types';

const policies = new Map<string, IProrationPolicy>();
const cloneScenario = new URLSearchParams(window.location.search).get('clone');
if (cloneScenario) {
  const source = {
    id: 'default-policy',
    academicYearId: 'synthetic-year',
    academicYearName: '2026–27',
    policyType: 'proration',
    policyName: 'Mid-Session Admission & Withdrawal Proration Policy (2026-27)',
    policyCode: 'PRO-DEFAULT',
    description: 'Independent admission and withdrawal rules.',
    status: 'Active',
    isDefault: true,
    version: 3,
    concurrencyStamp: 'default-stamp',
    isUsedInDownstream: false,
    creationTime: '2026-10-01T10:00:00Z',
    feeHeadRules: ['tuition', 'transport', 'hostel', 'library', 'activity'].map((feeHeadId) => ({
      feeHeadId,
      feeHeadName: `${feeHeadId} fee`,
      ruleType: 'Daily',
      roundingMode: 'RoundUpRupee',
      applyOnAdmission: true,
      applyOnEarlyWithdrawal: true,
      earlyWithdrawalRuleType: 'MonthlyCutoff',
      earlyWithdrawalCutoffDay: 19,
      earlyWithdrawalBeforeCutoffAction: 'HalfCharge',
    })),
  } as unknown as IProrationPolicy;
  policies.set(source.id!, source);
  policies.set('existing-copy', {
    ...source,
    id: 'existing-copy',
    policyName: `${source.policyName} Copy`,
    policyCode: 'PRO-COPY',
    status: 'Draft',
    isDefault: false,
    version: 1,
  });
}
export const api = createApi({
  reducerPath: 'fixtureApi',
  tagTypes: [...Object.values(financeModuleType), ...Object.values(financePolicyType)],
  baseQuery: async (input: any) => {
    const args = typeof input === 'string' ? { url: input } : input;
    if (args.url.endsWith('/clone') && args.method === 'POST') {
      const source = policies.get(args.url.split('/').at(-2));
      if (source && cloneScenario === 'blocked')
        return {
          error: {
            status: 400,
            data: {
              title: 'Bad Request',
              detail: 'One or more business rules were violated.',
              errorCode: 'Finance:ProrationPolicy:010027',
            },
          },
        };
      if (source) {
        const occupied = new Set([...policies.values()].map((policy) => policy.policyName));
        let number = 1;
        let name = `${source.policyName} Copy`;
        while (occupied.has(name)) name = `${source.policyName} Copy ${++number}`;
        const id = `cloned-policy-${policies.size}`;
        const clone = {
          ...structuredClone(source),
          id,
          policyName: name,
          policyCode: `PRO-${id}`,
          status: 'Draft',
          isDefault: false,
          version: 1,
        } as IProrationPolicy;
        policies.set(id, clone);
        return { data: clone };
      }
    }
    if (args.url === '/fee-heads/active') {
      if (new URLSearchParams(window.location.search).has('skeletonFetch'))
        await new Promise((resolve) => setTimeout(resolve, 30000));
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
    if (args.url === '/finance/proration-policies' && args.method !== 'POST') {
      const items = [...policies.values()].filter((policy) =>
        args.params?.status ? policy.status === args.params.status : policy.status !== 'Archived'
      );
      return { data: { totalCount: items.length, items } };
    }
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
