import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionOfferingsApi } from './admission-offerings-api';
import { admissionInquiriesApi } from './admission-inquiries-api';
import { admissionApplicantsApi } from './admission-applicants-api';
import { admissionInquiryManagementApi } from './admission-inquiry-management-api';

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

it('posts one atomic follow-up with both stamps and refreshes inquiry and typed note history', async () => {
  let detailReads = 0;
  let managementReads = 0;
  let posts = 0;
  let sentBody: unknown;
  const note = {
    id: 'note-1',
    occurredAt: '2026-10-07T10:00:00Z',
    note: 'Parent wants to proceed',
    status: 2,
    reminderAt: '2026-10-09T18:30:00.000Z',
    authorName: 'Asha Shah',
  };
  const management = () => ({
    inquiryId: 'inquiry-1',
    concurrencyStamp: posts ? 'management-new' : 'management-old',
    notes: posts ? [note] : [],
  });
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/inquiries/inquiry-1', () => {
      detailReads += 1;
      return HttpResponse.json({
        data: {
          id: 'inquiry-1',
          status: posts ? 2 : 0,
          concurrencyStamp: posts ? 'inquiry-new' : 'inquiry-old',
        },
      });
    }),
    http.get('*/api/student/enrollment/admissions/inquiries/inquiry-1/management', () => {
      managementReads += 1;
      return HttpResponse.json({ data: management() });
    }),
    http.post(
      '*/api/student/enrollment/admissions/inquiries/inquiry-1/management/follow-up-notes',
      async ({ request }) => {
        posts += 1;
        sentBody = await request.json();
        return HttpResponse.json({ data: management() });
      }
    )
  );
  await Promise.all([
    store
      .dispatch(admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('inquiry-1'))
      .unwrap(),
    store
      .dispatch(
        admissionInquiryManagementApi.endpoints.getAdmissionInquiryManagement.initiate('inquiry-1')
      )
      .unwrap(),
  ]);
  const result = await store
    .dispatch(
      admissionInquiryManagementApi.endpoints.recordAdmissionInquiryFollowUpNote.initiate({
        inquiryId: 'inquiry-1',
        concurrencyStamp: 'management-old',
        inquiryConcurrencyStamp: 'inquiry-old',
        note: note.note,
        status: 2,
        reminderAt: note.reminderAt,
      })
    )
    .unwrap();
  expect(sentBody).toEqual({
    concurrencyStamp: 'management-old',
    inquiryConcurrencyStamp: 'inquiry-old',
    note: note.note,
    status: 2,
    reminderAt: note.reminderAt,
  });
  expect(result.notes).toEqual([note]);
  expect(posts).toBe(1);
  await vi.waitFor(() => {
    expect(detailReads).toBe(2);
    expect(managementReads).toBe(2);
  });
});

it('does not reread capture configuration after a follow-up note', async () => {
  let catalogueReads = 0;
  let activityReads = 0;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/activities/applicant/applicant-1', () => {
      activityReads += 1;
      return HttpResponse.json({ data: [] });
    }),
    http.get('*/api/student/enrollment/admissions/inquiries/capture-catalogue', () => {
      catalogueReads += 1;
      return HttpResponse.json({ data: { offerings: [] } });
    }),
    http.post(
      '*/api/student/enrollment/admissions/inquiries/inquiry-1/management/follow-up-notes',
      () => HttpResponse.json({ data: {} })
    )
  );
  await store
    .dispatch(
      admissionApplicantsApi.endpoints.getAdmissionJourneyActivities.initiate('applicant-1')
    )
    .unwrap();
  await store
    .dispatch(admissionInquiriesApi.endpoints.getAdmissionInquiryCaptureCatalogue.initiate({}))
    .unwrap();
  await store
    .dispatch(
      admissionInquiryManagementApi.endpoints.recordAdmissionInquiryFollowUpNote.initiate({
        inquiryId: 'inquiry-1',
        concurrencyStamp: 'a',
        inquiryConcurrencyStamp: 'b',
        note: 'Called',
        status: 0,
        reminderAt: null,
      })
    )
    .unwrap();
  await vi.waitFor(() =>
    expect(
      admissionInquiriesApi.endpoints.getAdmissionInquiryCaptureCatalogue.select({})(
        store.getState()
      ).status
    ).toBe('fulfilled')
  );
  await new Promise((resolve) => setTimeout(resolve, 30));
  expect(catalogueReads).toBe(1);
  expect(activityReads).toBe(2);
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/inquiries/inquiry-1', () =>
      HttpResponse.json({ data: { id: 'inquiry-1' } })
    )
  );
  await store
    .dispatch(
      admissionInquiriesApi.endpoints.updateAdmissionInquiry.initiate({
        id: 'inquiry-1',
        body: {
          applicantName: 'Updated child',
          phone: '9876543210',
          preferredLanguageCode: 'en',
          source: 0,
          concurrencyStamp: 'stamp',
        },
      })
    )
    .unwrap();
  await vi.waitFor(() => expect(activityReads).toBe(3));
  expect(catalogueReads).toBe(1);
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/offerings/offering-1/deactivate', () =>
      HttpResponse.json({ data: { id: 'offering-1' } })
    )
  );
  await store
    .dispatch(
      admissionOfferingsApi.endpoints.deactivateAdmissionOffering.initiate({
        id: 'offering-1',
        concurrencyStamp: 'stamp',
      })
    )
    .unwrap();
  await vi.waitFor(() => expect(catalogueReads).toBe(2));
});
