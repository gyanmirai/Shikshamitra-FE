import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { studentRecordChangesApi } from 'src/redux/student/records/student-record-changes-api';

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

it('sends explicit profile review consent and refreshes the Records review queue after successful finalization', async () => {
  let reads = 0;
  let submitted: unknown;
  mswServer.use(
    http.get('*/api/students/records/changes', () => {
      reads += 1;
      return HttpResponse.json({ data: { items: [], totalCount: 0 } });
    }),
    http.post(
      '*/api/student/enrollment/admissions/applications/application-1/finalize',
      async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({
          data: {
            application: { id: 'application-1' },
            studentId: 'student-1',
            onboardingCaseId: 'case-1',
            reusedExistingStudent: true,
          },
        });
      }
    )
  );
  await store
    .dispatch(
      studentRecordChangesApi.endpoints.getStudentRecordChanges.initiate({ studentId: 'student-1' })
    )
    .unwrap();
  const input = {
    concurrencyStamp: 'stamp-1',
    idempotencyKey: 'request-1',
    existingStudentId: 'student-1',
    confirmCreateNew: false,
    confirmGuardianContactVerified: true,
    applyStudentProfileFields: true,
  };
  await store
    .dispatch(
      admissionApplicationsApi.endpoints.finalizeAdmissionApplication.initiate({
        id: 'application-1',
        input,
      })
    )
    .unwrap();
  expect(submitted).toEqual(input);
  await waitFor(() => expect(reads).toBe(2));
});

it('keeps the Records review queue cached when finalization fails', async () => {
  let reads = 0;
  mswServer.use(
    http.get('*/api/students/records/changes', () => {
      reads += 1;
      return HttpResponse.json({ data: { items: [], totalCount: 0 } });
    }),
    http.post('*/api/student/enrollment/admissions/applications/application-1/finalize', () =>
      HttpResponse.json({ error: { message: 'Review permission required' } }, { status: 403 })
    )
  );
  await store
    .dispatch(
      studentRecordChangesApi.endpoints.getStudentRecordChanges.initiate({ studentId: 'student-1' })
    )
    .unwrap();
  await expect(
    store
      .dispatch(
        admissionApplicationsApi.endpoints.finalizeAdmissionApplication.initiate({
          id: 'application-1',
          input: {
            concurrencyStamp: 'stamp-1',
            idempotencyKey: 'request-1',
            existingStudentId: 'student-1',
            confirmCreateNew: false,
            confirmGuardianContactVerified: true,
            applyStudentProfileFields: true,
          },
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 403 });
  expect(reads).toBe(1);
});
