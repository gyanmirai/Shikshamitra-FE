import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { studentOnboardingApi } from './student-onboarding-api';

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

it('sends a selected division only to the read-only preview endpoint, preserving its response scope', async () => {
  let body: unknown;
  const paths: string[] = [];
  const result = {
    divisionId: 'new-division',
    concurrencyStamp: 'v1',
    schoolAssignmentMode: 'both',
    rollAssignmentMode: 'automatic',
    proposedRollNumber: 8,
  };
  mswServer.use(
    http.post('*/api/student/onboarding/case-1/roll-preview', async ({ request }) => {
      body = await request.json();
      paths.push(new URL(request.url).pathname.replace(/^\/undefined/, ''));
      return HttpResponse.json({ data: result });
    })
  );
  const response = await store
    .dispatch(
      studentOnboardingApi.endpoints.previewStudentOnboardingRoll.initiate({
        id: 'case-1',
        divisionId: 'new-division',
        rollAssignmentMode: 'automatic',
      })
    )
    .unwrap();
  expect(body).toEqual({ divisionId: 'new-division', rollAssignmentMode: 'automatic' });
  expect(response).toEqual(result);
  expect(paths).toEqual(['/api/student/onboarding/case-1/roll-preview']);
});
