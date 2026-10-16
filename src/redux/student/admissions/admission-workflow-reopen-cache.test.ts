import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

import { admissionOfferingsApi } from './admission-offerings-api';
import { admissionWorkflowsApi } from './admission-workflows-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));

it('refreshes cached Offering list and detail readiness after reopening its workflow', async () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  let restored = false;
  const offering = () => ({
    id: 'offering-1',
    workflowDefinitionId: 'workflow-1',
    isActive: false,
    canActivate: restored,
    configurationStatus: restored ? 1 : 0,
  });
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/offerings', () =>
      HttpResponse.json({ data: { items: [offering()], totalCount: 1 } })
    ),
    http.get('*/api/student/enrollment/admissions/offerings/offering-1', () =>
      HttpResponse.json({ data: offering() })
    ),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/reopen', () => {
      restored = true;
      return HttpResponse.json({
        data: { id: 'workflow-1', status: 1, stages: [], transitions: [] },
      });
    })
  );
  const list = store.dispatch(admissionOfferingsApi.endpoints.getAdmissionOfferings.initiate({}));
  const detail = store.dispatch(
    admissionOfferingsApi.endpoints.getAdmissionOffering.initiate('offering-1')
  );
  try {
    expect((await list.unwrap()).items[0].canActivate).toBe(false);
    expect((await detail.unwrap()).canActivate).toBe(false);
    await store
      .dispatch(
        admissionWorkflowsApi.endpoints.reopenAdmissionWorkflow.initiate({
          id: 'workflow-1',
          concurrencyStamp: 'archived-stamp',
        })
      )
      .unwrap();
    await waitFor(() => {
      const listData = admissionOfferingsApi.endpoints.getAdmissionOfferings.select({})(
        store.getState()
      ).data;
      const detailData = admissionOfferingsApi.endpoints.getAdmissionOffering.select('offering-1')(
        store.getState()
      ).data;
      expect(listData?.items[0].canActivate).toBe(true);
      expect(detailData?.canActivate).toBe(true);
      expect(detailData?.isActive).toBe(false);
    });
  } finally {
    list.unsubscribe();
    detail.unsubscribe();
    store.dispatch(api.util.resetApiState());
  }
});
