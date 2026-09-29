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

  const fetchFormsByPurpose = useCallback(
    async (purpose: 0 | 1, query: string, page: number) => {
      if (!open) return { data: [], hasMore: false };
      const skipCount = (page - 1) * PAGE_SIZE;
      const result = await getForms({
        search: query || undefined,
        status: 1,
        purpose,
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

  const fetchInquiryForms = useCallback<AdmissionDefinitionFetcher>(
    (query, page) => fetchFormsByPurpose(0, query, page),
    [fetchFormsByPurpose]
  );
  const fetchRegistrationForms = useCallback<AdmissionDefinitionFetcher>(
    (query, page) => fetchFormsByPurpose(1, query, page),
    [fetchFormsByPurpose]
  );

  return { fetchWorkflows, fetchInquiryForms, fetchRegistrationForms };
}
