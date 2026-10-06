import { createApi } from '@reduxjs/toolkit/query/react';
import { financePolicyType } from 'src/redux/tagTypes';

const common = {
  policyType: 'concession',
  academicYearId: 'synthetic-year',
  academicYearName: '2026–27',
  description: 'Support eligible students with a concession on tuition fees.',
  policyCode: '',
  effectiveFrom: null,
  effectiveTo: null,
  updatedBy: 'Finance team',
  creationTime: '2026-10-01T09:00:00Z',
  concurrencyStamp: 'synthetic-stamp',
  version: 2,
  isUsedInDownstream: false,
  valueSource: 'RequestEnteredWithinLimits',
  calculationMethod: 'Percentage',
  maximumPercentage: 25,
  percentageValue: null,
  fixedAmount: null,
  maximumFixedAmount: null,
  applyOn: 'AllOutstanding',
};
const policies = new Map<string, any>([
  [
    'sibling',
    {
      ...common,
      id: 'sibling',
      policyName: 'Sibling tuition assistance',
      status: 'Active',
      isDefault: true,
      updatedAt: '2026-10-05T09:00:00Z',
    },
  ],
  [
    'merit',
    {
      ...common,
      id: 'merit',
      policyName: 'Merit scholarship',
      status: 'Active',
      isDefault: false,
      calculationMethod: 'FixedAmount',
      maximumFixedAmount: 40000,
      updatedAt: 'not-a-date',
    },
  ],
  [
    'draft',
    {
      ...common,
      id: 'draft',
      policyName: 'Financial support for students with an extended policy name',
      status: 'Draft',
      isDefault: false,
    },
  ],
  [
    'archived',
    {
      ...common,
      id: 'archived',
      policyName: 'Previous year tuition assistance',
      status: 'Archived',
      isDefault: false,
    },
  ],
]);
export const api = createApi({
  reducerPath: 'fixtureApi',
  tagTypes: Object.values(financePolicyType),
  baseQuery: async (input: any) => {
    const args = typeof input === 'string' ? { url: input } : input;
    if (!args.url.startsWith('/finance/concession-policies'))
      return { data: { items: [], totalCount: 0 } };
    const path = args.url.split('/');
    const id = path[3];
    const policy = policies.get(id);
    if (path[4] === 'versions')
      return {
        data: {
          totalCount: 2,
          items: [1, 2].map((versionNumber) => ({
            id: `version-${versionNumber}`,
            policyId: id,
            policyType: 'concession',
            versionNumber,
            policyName: policy.policyName,
            status: versionNumber === 1 ? 'Draft' : policy.status,
            changeAction: versionNumber === 1 ? 'Created' : 'Updated',
            changeReason:
              versionNumber === 1 ? null : 'Updated the concession limit for this academic year.',
            creatorDisplayName: 'Finance administrator',
            creationTime: `2026-10-0${versionNumber}T09:00:00Z`,
            snapshotJson: JSON.stringify({
              ...policy,
              status: versionNumber === 1 ? 'Draft' : policy.status,
              maximumPercentage: versionNumber === 1 ? 20 : 25,
            }),
          })),
        },
      };
    if (path[4] === 'impact')
      return {
        data: {
          currentVersion: policy.version,
          attachedFeeStructureCount: 0,
          studentAssignmentCount: 0,
          concessionRequestCount: 2,
        },
      };
    if (args.method === 'DELETE') {
      policies.set(id, { ...policy, status: 'Archived' });
      return { data: null };
    }
    if (path[4] === 'unarchive') {
      const restored = { ...policy, status: 'Draft' };
      policies.set(id, restored);
      return { data: restored };
    }
    if (path[4] === 'clone') {
      const clone = {
        ...policy,
        id: `copy-${policies.size}`,
        policyName: `${policy.policyName} (copy)`,
        status: 'Draft',
        isDefault: false,
      };
      policies.set(clone.id, clone);
      return { data: clone };
    }
    if (args.method === 'POST' || args.method === 'PUT') {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const saved = {
        ...common,
        ...args.body,
        id: id || `policy-${policies.size}`,
        version: (policy?.version || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      if (saved.isDefault)
        for (const [key, row] of policies) policies.set(key, { ...row, isDefault: false });
      policies.set(saved.id, saved);
      return { data: saved };
    }
    if (id)
      return policy
        ? { data: policy }
        : { error: { status: 404, data: { detail: 'Synthetic policy not found.' } } };
    const params = args.params || {};
    const rows = [...policies.values()].filter(
      (row) =>
        (params.status ? row.status === params.status : row.status !== 'Archived') &&
        row.policyName.toLowerCase().includes((params.search || '').toLowerCase())
    );
    return {
      data: {
        totalCount: rows.length,
        items: rows.slice(
          params.skipCount || 0,
          (params.skipCount || 0) + (params.maxResultCount || 10)
        ),
      },
    };
  },
  endpoints: () => ({}),
});
