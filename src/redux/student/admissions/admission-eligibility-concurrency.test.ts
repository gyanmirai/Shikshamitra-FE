import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionEligibilityApi } from './admission-eligibility-api';
import { eligibilityKey, eligibilityPath, eligibilitySummary } from './eligibility-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
it('surfaces a stale-stamp rejection and refreshes authoritative eligibility instead of accepting it', async () => {
  const store = createDocumentTestStore();
  clearCachedAuthSession();
  let conflict = false;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        concurrencyStamp: conflict ? 'latest-stamp' : 'old-stamp',
      })
    ),
    http.post(`${eligibilityPath}/evaluate`, () => {
      conflict = true;
      return HttpResponse.json(
        { detail: 'Application changed. Refresh eligibility.' },
        { status: 409 }
      );
    })
  );
  try {
    const { endpoints } = admissionEligibilityApi;
    await store.dispatch(endpoints.getApplicationEligibility.initiate(eligibilityKey)).unwrap();
    await expect(
      store
        .dispatch(
          endpoints.evaluateAdmissionEligibility.initiate({
            ...eligibilityKey,
            concurrencyStamp: 'old-stamp',
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 409 });
    await waitFor(() =>
      expect(
        endpoints.getApplicationEligibility.select(eligibilityKey)(store.getState()).data
          ?.concurrencyStamp
      ).toBe('latest-stamp')
    );
  } finally {
    store.dispatch(api.util.resetApiState());
    clearCachedAuthSession();
  }
});
