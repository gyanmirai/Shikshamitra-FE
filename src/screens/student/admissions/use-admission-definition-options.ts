'use client';

import { useCallback } from 'react';
import { useLazyGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useLazyGetAdmissionWorkflowsQuery } from 'src/redux/student/admissions/admission-workflows-api';

export type AdmissionDefinitionOption = {
  id: string;
  name: string;
  version: number;
};

export type AdmissionDefinitionFetcher = (
  query: string,
  page: number
) => Promise<{ data: AdmissionDefinitionOption[]; hasMore: boolean }>;

const PAGE_SIZE = 25;

export function useAdmissionDefinitionOptions(open: boolean) {
  const [getWorkflows] = useLazyGetAdmissionWorkflowsQuery();
  const [getForms] = useLazyGetAdmissionFormsQuery();

  const fetchWorkflows = useCallback<AdmissionDefinitionFetcher>(
    async (query, page) => {
      if (!open) return { data: [], hasMore: false };
      const skipCount = (page - 1) * PAGE_SIZE;
      const result = await getWorkflows({
        search: query || undefined,
        status: 1,
        skipCount,
        maxResultCount: PAGE_SIZE,
      }).unwrap();
      return {
        data: result.items,
        hasMore: skipCount + result.items.length < result.totalCount,
      };
    },
    [getWorkflows, open]
  );

  const fetchForms = useCallback<AdmissionDefinitionFetcher>(
    async (query, page) => {
      if (!open) return { data: [], hasMore: false };
      const skipCount = (page - 1) * PAGE_SIZE;
      const result = await getForms({
        search: query || undefined,
        status: 1,
        skipCount,
        maxResultCount: PAGE_SIZE,
      }).unwrap();
      return {
        data: result.items,
        hasMore: skipCount + result.items.length < result.totalCount,
      };
    },
    [getForms, open]
  );

  return { fetchWorkflows, fetchForms };
}
