/* eslint-disable @typescript-eslint/no-throw-literal -- Synthetic RTK Query problem response. */
import type { EsiPolicy } from 'src/redux/hr/esi-policy-api';

import { useState } from 'react';

export const policy: EsiPolicy = {
  id: 'p1',
  name: 'ESIC DM Policy',
  code: 'DM',
  concurrencyStamp: 'reviewed',
  isArchived: false,
  isDefault: false,
  versions: [
    {
      id: 'v1',
      version: 1,
      effectiveFrom: '2026-01-01',
      appliesUntil: '2026-12-31',
      schemeCode: 'ESI',
      jurisdictionCode: 'IN-GJ',
      establishmentThreshold: 10,
      standardWageCeiling: 21000,
      disabilityWageCeiling: 25000,
      employeePercentage: 0.75,
      employerPercentage: 3.25,
      employeeShareDailyWageExemption: 176,
      exclusionCapPercentage: 50,
      inKindCapPercentage: 15,
      roundingPolicy: 'NextHigherRupee',
      sourceUrl: 'https://example.invalid/synthetic-policy',
      sourceVerifiedOn: '2026-10-01',
    },
  ],
};
const scenario = new URLSearchParams(window.location.search).get('scenario') || 'used';
export function useGetEsiPolicyArchiveReviewQuery() {
  const [retry, setRetry] = useState(false);
  return {
    isFetching: scenario === 'loading',
    isError: scenario === 'failed' && !retry,
    currentData: {
      policy,
      canArchive: scenario !== 'used',
      templates:
        scenario === 'used'
          ? [
              {
                templateId: 't1',
                templateName: 'DM Salary Template',
                version: 2,
                status: 'Published',
              },
            ]
          : [],
    },
    refetch: () => setRetry(true),
  };
}
export function useArchiveEsiPolicyMutation() {
  const [isLoading, setBusy] = useState(false);
  return [
    (body: unknown) => ({
      unwrap: async () => {
        setBusy(true);
        document.body.dataset.requests = String(Number(document.body.dataset.requests || 0) + 1);
        document.body.dataset.payload = JSON.stringify(body);
        await new Promise((resolve) => setTimeout(resolve, 250));
        setBusy(false);
        if (scenario === 'stale') throw { data: { detail: 'Dependencies changed. Review again.' } };
      },
    }),
    { isLoading },
  ] as const;
}
