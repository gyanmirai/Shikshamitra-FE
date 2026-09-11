import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionFormStageApi } from './admission-form-stage-api';

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

it('uses scoped Form stage routes and excludes identifiers from command bodies', async () => {
  const root =
    '*/api/student/enrollment/admissions/applications/application-1/form-stages/stage-1';
  const requests: { path: string; body: unknown }[] = [];
  const response = {
    data: {
      applicationId: 'application-1',
      stageId: 'stage-1',
      formStageEnabled: true,
      isActive: true,
      formStatus: 1,
      isOverdue: false,
      submissionAttempts: 1,
      concurrencyStamp: 'next-stamp',
      canSaveDraft: false,
      canSubmit: false,
      canVerify: true,
      canRequestCorrection: true,
      canComplete: false,
      blockers: [],
      sections: [],
    },
  };
  mswServer.use(
    http.get(root, () => HttpResponse.json(response)),
    http.post(`${root}/*`, async ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname.split('/stage-1/')[1],
        body: await request.json(),
      });
      return HttpResponse.json(response);
    })
  );

  const { endpoints } = admissionFormStageApi;
  const input = { applicationId: 'application-1', stageId: 'stage-1' };
  const summary = await store.dispatch(endpoints.getAdmissionFormStage.initiate(input)).unwrap();
  expect(summary.formStageEnabled).toBe(true);
  await store
    .dispatch(
      endpoints.verifyAdmissionFormSection.initiate({
        ...input,
        sectionId: 'section-1',
        concurrencyStamp: 'stamp-1',
        verified: false,
        reason: 'Guardian details changed',
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.requestAdmissionFormCorrection.initiate({
        ...input,
        concurrencyStamp: 'stamp-2',
        reason: 'Correct the address',
      })
    )
    .unwrap();

  expect(requests).toEqual([
    {
      path: 'sections/section-1/verification',
      body: {
        concurrencyStamp: 'stamp-1',
        verified: false,
        reason: 'Guardian details changed',
      },
    },
    {
      path: 'correction',
      body: { concurrencyStamp: 'stamp-2', reason: 'Correct the address' },
    },
  ]);
});
