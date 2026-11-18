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
const path = '*/api/student/enrollment/admissions/applications/qa-application';

it('loads readiness for approval without recording a decision', async () => {
  let intent: string | null = null;
  mswServer.use(
    http.get(`${path}/finalization-preview`, ({ request }) => {
      intent = new URL(request.url).searchParams.get('forApproval');
      return HttpResponse.json({
        data: { applicationId: 'qa-application', items: [], possibleMatches: [] },
      });
    })
  );
  await store
    .dispatch(
      admissionApplicationsApi.endpoints.getAdmissionApprovalPreview.initiate('qa-application')
    )
    .unwrap();
  expect(intent).toBe('true');
});

it('sends one combined command without inventing contact verification and patches the committed outcome', async () => {
  let submitted: unknown;
  let saved = false;
  mswServer.use(
    http.get(path, () =>
      HttpResponse.json({ data: { id: 'qa-application', status: saved ? 11 : 1 } })
    ),
    http.post(`${path}/approve-and-finalize`, async ({ request }) => {
      submitted = await request.json();
      saved = true;
      return HttpResponse.json({
        data: {
          application: { id: 'qa-application', status: 11 },
          studentId: 'qa-student',
          onboardingCaseId: 'qa-case',
        },
      });
    })
  );
  await store
    .dispatch(admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('qa-application'))
    .unwrap();
  const input = { concurrencyStamp: 'stamp', idempotencyKey: 'key', confirmCreateNew: true };
  await store
    .dispatch(
      admissionApplicationsApi.endpoints.approveAndFinalizeAdmissionApplication.initiate({
        id: 'qa-application',
        input,
      })
    )
    .unwrap();
  expect(submitted).toEqual(input);
  expect(
    admissionApplicationsApi.endpoints.getAdmissionApplication.select('qa-application')(
      store.getState()
    ).data?.status
  ).toBe(11);
});
