import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionApplicationsApi } from './admission-applications-api';

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

it('returns the durable onboarding case created by final admission', async () => {
  let requestBody: Record<string, unknown> = {};

  mswServer.use(
    http.post(
      '*/api/student/enrollment/admissions/applications/application-1/finalize',
      async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({
          data: {
            application: {
              id: 'application-1',
              applicationNumber: 'APP-0001',
              applicantId: 'applicant-1',
              applicantName: 'Aarav Shah',
              admissionCycleId: 'cycle-1',
              admissionOfferingId: 'offering-1',
              status: 11,
              studentId: 'student-1',
              onboardingCaseId: 'case-1',
            },
            studentId: 'student-1',
            onboardingCaseId: 'case-1',
            reusedExistingStudent: false,
          },
        });
      }
    )
  );

  const result = await store
    .dispatch(
      admissionApplicationsApi.endpoints.finalizeAdmissionApplication.initiate({
        id: 'application-1',
        input: {
          concurrencyStamp: 'application-stamp-1',
          idempotencyKey: 'finalize-1',
          confirmCreateNew: true,
          confirmGuardianContactVerified: true,
        },
      })
    )
    .unwrap();

  expect(requestBody).toEqual({
    concurrencyStamp: 'application-stamp-1',
    idempotencyKey: 'finalize-1',
    confirmCreateNew: true,
    confirmGuardianContactVerified: true,
  });
  expect(result.onboardingCaseId).toBe('case-1');
  expect(result.application.onboardingCaseId).toBe('case-1');
  expect(result.application.studentEnrollmentId).toBeUndefined();
});
