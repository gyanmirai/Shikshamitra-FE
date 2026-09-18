'use client';

import { useCallback } from 'react';
import { useLazyGetAdmissionCampusesQuery } from 'src/redux/student/admissions/admission-campuses-api';

import type { AdmissionCampus } from 'src/redux/student/admissions/admission-campuses-api';

export type AdmissionCampusFetcher = (
  query: string,
  page: number
) => Promise<{ data: AdmissionCampus[]; hasMore: boolean }>;

const PAGE_SIZE = 25;

export function useAdmissionCampusOptions(open = true) {
  const [getCampuses] = useLazyGetAdmissionCampusesQuery();
  const fetchCampuses = useCallback<AdmissionCampusFetcher>(
    async (query, page) => {
      if (!open) return { data: [], hasMore: false };
      const skipCount = (page - 1) * PAGE_SIZE;
      const result = await getCampuses({
        search: query || undefined,
        isActive: true,
        skipCount,
        maxResultCount: PAGE_SIZE,
      }).unwrap();
      return {
        data: result.items,
        hasMore: skipCount + result.items.length < result.totalCount,
      };
    },
    [getCampuses, open]
  );

  return fetchCampuses;
}
