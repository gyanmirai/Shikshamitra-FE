import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

import { admissionFormsApi } from './admission-forms-api';
import { admissionOfferingsApi } from './admission-offerings-api';
import { admissionInquiriesApi } from './admission-inquiries-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));

it('refreshes a cached version comparison after saving a draft', async () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  let saved = false;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/forms/draft/compare/published', () =>
      HttpResponse.json({
        data: {
          fromId: 'draft',
          toId: 'published',
          changes: saved ? ['Field changed: CONTACT.PARENT_EMAIL'] : [],
        },
      })
    ),
    http.put('*/api/student/enrollment/admissions/forms/draft', () => {
      saved = true;
      return HttpResponse.json({ data: { id: 'draft', status: 0 } });
    })
  );
  const args = { id: 'draft', otherId: 'published' };
  const comparison = store.dispatch(
    admissionFormsApi.endpoints.compareAdmissionFormVersions.initiate(args)
  );
  try {
    expect((await comparison.unwrap()).changes).toEqual([]);
    comparison.unsubscribe();
    await store
      .dispatch(
        admissionFormsApi.endpoints.updateAdmissionForm.initiate({
          id: 'draft',
          body: {
            name: 'Draft',
            code: 'FORM',
            purpose: 0,
            layoutType: 0,
            fieldsPerRow: 1,
            defaultLanguage: 'en',
            supportedLanguages: ['en'],
            sections: [],
          },
        })
      )
      .unwrap();
    const reopened = store.dispatch(
      admissionFormsApi.endpoints.compareAdmissionFormVersions.initiate(args)
    );
    try {
      expect((await reopened.unwrap()).changes).toEqual(['Field changed: CONTACT.PARENT_EMAIL']);
    } finally {
      reopened.unsubscribe();
    }
  } finally {
    comparison.unsubscribe();
    store.dispatch(api.util.resetApiState());
  }
});

it.each(['archive', 'restore', 'publish'] as const)(
  'refreshes offering, catalogue and capture readiness after form %s',
  async (action) => {
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    let available = action === 'archive';
    const state = () => ({ isAvailable: available, canCreateInquiry: available });
    const offering = () => ({ id: 'offering-1', canActivate: available, availability: state() });
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/offerings', () =>
        HttpResponse.json({ data: { items: [offering()], totalCount: 1 } })
      ),
      http.get('*/api/student/enrollment/admissions/offerings/offering-1/availability', () =>
        HttpResponse.json({ data: state() })
      ),
      http.get('*/api/student/enrollment/admissions/inquiries/capture-catalogue', () =>
        HttpResponse.json({ data: { marker: available } })
      ),
      http.get('*/api/student/enrollment/admissions/inquiries/capture-context/offering-1', () =>
        HttpResponse.json({ data: { marker: available } })
      ),
      http.post(`*/api/student/enrollment/admissions/forms/form-1/${action}`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('concurrencyStamp')).toBe('verified');
        available = !available;
        return HttpResponse.json({ data: { id: 'form-1', status: action === 'archive' ? 2 : 1 } });
      })
    );
    const requests = [
      store.dispatch(admissionOfferingsApi.endpoints.getAdmissionOfferings.initiate({})),
      store.dispatch(
        admissionOfferingsApi.endpoints.getAdmissionOfferingAvailability.initiate('offering-1')
      ),
      store.dispatch(
        admissionInquiriesApi.endpoints.getAdmissionInquiryCaptureCatalogue.initiate({
          academicYearId: 'year-1',
        })
      ),
      store.dispatch(
        admissionInquiriesApi.endpoints.getAdmissionInquiryCaptureContext.initiate('offering-1')
      ),
    ];
    try {
      await Promise.all(requests.map((request) => request.unwrap()));
      const endpoint =
        action === 'archive'
          ? admissionFormsApi.endpoints.archiveAdmissionForm
          : action === 'restore'
            ? admissionFormsApi.endpoints.restoreAdmissionForm
            : admissionFormsApi.endpoints.publishAdmissionForm;
      await store
        .dispatch(endpoint.initiate({ id: 'form-1', concurrencyStamp: 'verified' }))
        .unwrap();
      await waitFor(() => {
        expect(
          admissionOfferingsApi.endpoints.getAdmissionOfferings.select({})(store.getState()).data
            ?.items[0].canActivate
        ).toBe(available);
        expect(
          admissionOfferingsApi.endpoints.getAdmissionOfferingAvailability.select('offering-1')(
            store.getState()
          ).data?.canCreateInquiry
        ).toBe(available);
        expect(
          (
            admissionInquiriesApi.endpoints.getAdmissionInquiryCaptureCatalogue.select({
              academicYearId: 'year-1',
            })(store.getState()).data as any
          )?.marker
        ).toBe(available);
        expect(
          (
            admissionInquiriesApi.endpoints.getAdmissionInquiryCaptureContext.select('offering-1')(
              store.getState()
            ).data as any
          )?.marker
        ).toBe(available);
      });
    } finally {
      requests.forEach((request) => request.unsubscribe());
      store.dispatch(api.util.resetApiState());
    }
  }
);
