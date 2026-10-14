import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { studentOnboardingApi } from './student-onboarding-api';

const workspace = {
  caseId: 'case-1',
  concurrencyStamp: 'current-stamp',
  recipients: [
    {
      accountType: 'guardian',
      relationship: 'father',
      name: 'Raj Patel',
      email: 'raj@example.com',
      canSend: true,
      blockedReason: null,
      delivery: null,
    },
  ],
};
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

it('loads canonical recipients through the Onboarding boundary', async () => {
  mswServer.use(
    http.get('*/api/student/onboarding/case-1/credentials', () =>
      HttpResponse.json({ data: workspace })
    )
  );
  const query = store.dispatch(
    studentOnboardingApi.endpoints.getStudentOnboardingCredentials.initiate('case-1')
  );
  expect(await query.unwrap()).toEqual(workspace);
  query.unsubscribe();
});

it('sends one bounded owner intent, not an arbitrary email or verification claim', async () => {
  let body: unknown;
  mswServer.use(
    http.post('*/api/student/onboarding/case-1/credentials', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ ...workspace, concurrencyStamp: 'refreshed-stamp' });
    })
  );
  const result = await store
    .dispatch(
      studentOnboardingApi.endpoints.sendStudentOnboardingCredentials.initiate({
        id: 'case-1',
        accountType: 'guardian',
        relationship: 'father',
        expectedEmail: 'raj@example.com',
        concurrencyStamp: 'current-stamp',
      })
    )
    .unwrap();
  expect(body).toEqual({
    accountType: 'guardian',
    relationship: 'father',
    expectedEmail: 'raj@example.com',
    concurrencyStamp: 'current-stamp',
  });
  expect(result.concurrencyStamp).toBe('refreshed-stamp');
});

it('does not silently retry a conflicted send', async () => {
  let requests = 0;
  mswServer.use(
    http.post('*/api/student/onboarding/case-1/credentials', () => {
      requests += 1;
      return HttpResponse.json(
        { error: { message: 'Saved email changed. Refresh and review.' } },
        { status: 409 }
      );
    })
  );
  await expect(
    store
      .dispatch(
        studentOnboardingApi.endpoints.sendStudentOnboardingCredentials.initiate({
          id: 'case-1',
          accountType: 'student',
          relationship: 'self',
          expectedEmail: 'jay@example.com',
          concurrencyStamp: 'old-stamp',
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 409 });
  expect(requests).toBe(1);
});
