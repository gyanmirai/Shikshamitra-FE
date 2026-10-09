import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionApplicantsApi } from './admission-applicants-api';
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

it('refreshes Applicant360 after an application decision and journey advancement', async () => {
  let status = 1;
  let stageType = 7;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applicants/applicant', () =>
      HttpResponse.json({
        data: {
          applicant: { id: 'applicant', firstName: 'QA' },
          applications: [{ id: 'application', status, stages: [{ stageType }] }],
          activities: [],
          notes: [],
        },
      })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/application/decision/approve',
      () => {
        status = 6;
        return HttpResponse.json({ data: { id: 'application', status } });
      }
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/application/workflow/advance',
      () => {
        stageType = 4;
        return HttpResponse.json({ data: { applicationId: 'application', stages: [] } });
      }
    )
  );
  const query = store.dispatch(
    admissionApplicantsApi.endpoints.getAdmissionApplicant360.initiate('applicant')
  );
  expect((await query.unwrap()).applications[0].status).toBe(1);
  await store
    .dispatch(
      admissionApplicationsApi.endpoints.approveAdmissionApplication.initiate({
        id: 'application',
        input: { concurrencyStamp: 'stamp' },
      })
    )
    .unwrap();
  await waitFor(() =>
    expect(
      admissionApplicantsApi.endpoints.getAdmissionApplicant360.select('applicant')(
        store.getState()
      ).data?.applications[0].status
    ).toBe(6)
  );
  await store
    .dispatch(
      admissionApplicationsApi.endpoints.advanceAdmissionApplicationWorkflow.initiate({
        id: 'application',
        expectedCurrentStageInstanceId: 'decision',
        idempotencyKey: 'advance',
        concurrencyStamp: 'next-stamp',
      })
    )
    .unwrap();
  await waitFor(() =>
    expect(
      admissionApplicantsApi.endpoints.getAdmissionApplicant360.select('applicant')(
        store.getState()
      ).data?.applications[0].stages[0].stageType
    ).toBe(4)
  );
  query.unsubscribe();
});
