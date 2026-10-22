import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
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
const path = '*/api/student/enrollment/admissions/applications/application';
const input = {
  concurrencyStamp: 'stamp',
  idempotencyKey: 'key',
  confirmCreateNew: true,
  confirmGuardianContactVerified: true,
};

it('uses the committed finalization result while an unrelated pending read delays tag invalidation', async () => {
  let finishRead!: () => void;
  const blocked = new Promise<void>((resolve) => {
    finishRead = resolve;
  });
  let reads = 0;
  mswServer.use(
    http.get(path, () => {
      reads += 1;
      return HttpResponse.json({
        data: { id: 'application', status: 6, concurrencyStamp: 'stamp' },
      });
    }),
    http.get(`${path}/workflow`, async () => {
      await blocked;
      return HttpResponse.json({ data: { stages: [] } });
    }),
    http.post(`${path}/finalize`, () =>
      HttpResponse.json({
        data: {
          application: {
            id: 'application',
            status: 11,
            studentId: 'student',
            onboardingCaseId: 'case',
            concurrencyStamp: 'finalized',
          },
          studentId: 'student',
          onboardingCaseId: 'case',
          reusedExistingStudent: false,
        },
      })
    )
  );
  const application = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('application')
  );
  await application.unwrap();
  const workflow = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplicationWorkflow.initiate('application')
  );
  try {
    await store
      .dispatch(
        admissionApplicationsApi.endpoints.finalizeAdmissionApplication.initiate({
          id: 'application',
          input,
        })
      )
      .unwrap();
    await waitFor(() =>
      expect(
        admissionApplicationsApi.endpoints.getAdmissionApplication.select('application')(
          store.getState()
        ).data
      ).toMatchObject({ status: 11, onboardingCaseId: 'case', concurrencyStamp: 'finalized' })
    );
    expect(reads).toBe(1);
  } finally {
    application.unsubscribe();
    workflow.unsubscribe();
    finishRead();
    await workflow;
  }
});

it('does not fabricate a finalized outcome after the API rejects finalization', async () => {
  mswServer.use(
    http.get(path, () =>
      HttpResponse.json({ data: { id: 'application', status: 6, concurrencyStamp: 'stamp' } })
    ),
    http.post(`${path}/finalize`, () =>
      HttpResponse.json({ detail: 'Finalization blocked' }, { status: 400 })
    )
  );
  const application = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('application')
  );
  await application.unwrap();
  await expect(
    store
      .dispatch(
        admissionApplicationsApi.endpoints.finalizeAdmissionApplication.initiate({
          id: 'application',
          input,
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 400 });
  expect(
    admissionApplicationsApi.endpoints.getAdmissionApplication.select('application')(
      store.getState()
    ).data?.status
  ).toBe(6);
  application.unsubscribe();
});
