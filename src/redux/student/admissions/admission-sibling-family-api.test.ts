import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionInquiriesApi } from './admission-inquiries-api';
import { createDocumentTestStore } from './document-test-fixture';
import { admissionApplicationsApi } from './admission-applications-api';

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

it('sends parent email for Direct Registration and retains parent selection metadata in matches', async () => {
  let params!: URLSearchParams;
  const parent = {
    sourceApplicantId: 'child-1',
    relationship: 'father',
    name: 'Rahul Shah',
    firstName: 'Rahul',
    email: 'parent@example.com',
  };
  mswServer.use(
    http.get(
      '*/api/student/enrollment/admissions/applications/direct-registration/family-matches',
      ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({
          data: [
            {
              familyId: 'family-1',
              familyNumber: 'FAM-1',
              primaryGuardianName: 'Rahul Shah',
              applicants: ['Aarav'],
              parents: [parent],
              matchByEmail: true,
              matchByMobile: false,
            },
          ],
        });
      }
    )
  );
  const result = await store
    .dispatch(
      admissionApplicationsApi.endpoints.findAdmissionDirectFamilies.initiate({
        offeringId: 'offering-1',
        guardianMobile: '9876543210',
        guardianEmail: 'parent@example.com',
      })
    )
    .unwrap();
  expect(params.get('guardianEmail')).toBe('parent@example.com');
  expect(result[0]).toMatchObject({ parents: [parent], matchByEmail: true, matchByMobile: false });
});

it('posts Father and Mother contacts for inquiry duplicate matching without dropping legacy identity fields', async () => {
  let body: unknown;
  mswServer.use(
    http.post(
      '*/api/student/enrollment/admissions/inquiries/duplicate-check',
      async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: [] });
      }
    )
  );
  const input = {
    admissionCycleId: 'cycle-1',
    applicantName: 'Anaya',
    guardianPhone: '9876543210',
    parentContacts: [
      { relationship: 'father' as const, email: 'dad@example.com' },
      { relationship: 'mother' as const, mobile: '9876543211' },
    ],
  };
  await store
    .dispatch(admissionInquiriesApi.endpoints.checkAdmissionInquiryDuplicates.initiate(input))
    .unwrap();
  expect(body).toEqual(input);
});

it('posts confirmed sibling family, source applicant and explicit parent relationship unchanged', async () => {
  let body: unknown;
  mswServer.use(
    http.post(
      '*/api/student/enrollment/admissions/applications/direct-registration',
      async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { id: 'new-child-application' } });
      }
    )
  );
  const input = {
    requestId: 'request-1',
    admissionOfferingId: 'offering-1',
    existingFamilyId: 'family-1',
    existingParentApplicantId: 'child-1',
    parentRelationship: 'mother' as const,
    createSeparateFamily: false,
    applicantFirstName: 'Anaya',
    guardianFirstName: 'Meera',
    guardianMobile: '9876543210',
    guardianRelationship: 0 as const,
  };
  await store
    .dispatch(admissionApplicationsApi.endpoints.startAdmissionDirectRegistration.initiate(input))
    .unwrap();
  expect(body).toEqual(input);
});
