import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { waitFor } from '@testing-library/react';

import { admissionCyclesApi } from './admission-cycles-api';
import { admissionOfferingsApi } from './admission-offerings-api';
import { createDocumentTestStore } from './document-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createDocumentTestStore>;

beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('refreshes offering list, detail and availability after the selected cycle window changes', async () => {
  let revised = false;
  const requests = { list: 0, detail: 0, availability: 0 };
  const basePath = '*/api/student/enrollment/admissions';
  const listInput = { admissionCycleId: 'cycle-1' };
  const currentOffering = () => ({
    id: 'offering-1',
    admissionCycleId: 'cycle-1',
    standardId: 'class-1',
    useCycleDates: true,
    openDate: null,
    closeDate: null,
    effectiveOpenDate: revised ? '2026-10-15' : '2026-10-01',
    effectiveCloseDate: revised ? '2026-10-31' : '2026-10-20',
  });
  mswServer.use(
    http.get(`${basePath}/offerings`, () => {
      requests.list++;
      return HttpResponse.json({ data: { items: [currentOffering()], totalCount: 1 } });
    }),
    http.get(`${basePath}/offerings/offering-1`, () => {
      requests.detail++;
      return HttpResponse.json({ data: currentOffering() });
    }),
    http.get(`${basePath}/offerings/offering-1/availability`, () => {
      requests.availability++;
      return HttpResponse.json({
        data: {
          isAvailable: !revised,
          status: revised ? 1 : 2,
          canCreateInquiry: !revised,
          canStartApplication: !revised,
        },
      });
    }),
    http.put(`${basePath}/cycles/cycle-1/window`, () => {
      revised = true;
      return HttpResponse.json({
        data: { id: 'cycle-1', startDate: '2026-10-15', endDate: '2026-10-31' },
      });
    })
  );

  const endpoints = admissionOfferingsApi.endpoints;
  await Promise.all([
    store.dispatch(endpoints.getAdmissionOfferings.initiate(listInput)).unwrap(),
    store.dispatch(endpoints.getAdmissionOffering.initiate('offering-1')).unwrap(),
    store.dispatch(endpoints.getAdmissionOfferingAvailability.initiate('offering-1')).unwrap(),
  ]);
  expect(requests).toEqual({ list: 1, detail: 1, availability: 1 });

  await store
    .dispatch(
      admissionCyclesApi.endpoints.updateAdmissionCycleWindow.initiate({
        id: 'cycle-1',
        body: {
          startDate: '2026-10-15',
          endDate: '2026-10-31',
          reason: 'Revise admission dates',
          concurrencyStamp: 'cycle-stamp',
        },
      })
    )
    .unwrap();

  await waitFor(() => {
    const state = store.getState();
    expect(endpoints.getAdmissionOfferings.select(listInput)(state).data?.items[0]).toMatchObject({
      effectiveOpenDate: '2026-10-15',
      effectiveCloseDate: '2026-10-31',
    });
    expect(endpoints.getAdmissionOffering.select('offering-1')(state).data).toMatchObject({
      useCycleDates: true,
      openDate: null,
      closeDate: null,
      effectiveOpenDate: '2026-10-15',
      effectiveCloseDate: '2026-10-31',
    });
    expect(
      endpoints.getAdmissionOfferingAvailability.select('offering-1')(state).data
    ).toMatchObject({
      isAvailable: false,
      canCreateInquiry: false,
      canStartApplication: false,
    });
  });
  expect(requests).toEqual({ list: 2, detail: 2, availability: 2 });
});
