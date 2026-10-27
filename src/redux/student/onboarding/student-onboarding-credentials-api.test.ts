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

it('saves only the reviewed email edit without an implicit send or Finance write', async () => {
  const writes: string[] = [];
  let submitted: unknown;
  mswServer.use(
    http.put('*/api/student/onboarding/case-1/credentials/email', async ({ request }) => {
      writes.push(new URL(request.url).pathname.replace(/^\/undefined/, ''));
      submitted = await request.json();
      return HttpResponse.json({ data: workspace });
    })
  );
  const input = {
    id: 'case-1',
    accountType: 'student' as const,
    relationship: 'self' as const,
    expectedEmail: null,
    email: 'jay@example.test',
    concurrencyStamp: 'current-stamp',
    emailEditToken: 'profile-token',
    confirmSharedParent: false,
  };
  await store
    .dispatch(studentOnboardingApi.endpoints.updateStudentCredentialsEmail.initiate(input))
    .unwrap();
  const { id, ...body } = input;
  expect(submitted).toEqual(body);
  expect(writes).toEqual(['/api/student/onboarding/case-1/credentials/email']);
});

it('confirms an owner email through the normal school tenant header without leaking the token into its URL', async () => {
  let header: string | null = null;
  let body: unknown;
  let query: string | undefined;
  mswServer.use(
    http.post('*/api/student/portal/email/confirm', async ({ request }) => {
      header = request.headers.get('__tenant');
      body = await request.json();
      query = new URL(request.url).search;
      return HttpResponse.json({ data: null });
    })
  );
  const input = {
    tenantId: 'school-1',
    userId: 'owner-1',
    requestId: 'request-1',
    token: 'test-protected-token',
  };
  await store
    .dispatch(studentOnboardingApi.endpoints.confirmStudentPortalEmail.initiate(input))
    .unwrap();
  expect(header).toBe('school-1');
  expect(body).toEqual(input);
  expect(query).toBe('');
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
        confirmRecipientAccess: true,
        concurrencyStamp: 'current-stamp',
      })
    )
    .unwrap();
  expect(body).toEqual({
    accountType: 'guardian',
    relationship: 'father',
    expectedEmail: 'raj@example.com',
    confirmRecipientAccess: true,
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
          confirmRecipientAccess: false,
          concurrencyStamp: 'old-stamp',
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 409 });
  expect(requests).toBe(1);
});

it('retries the original parent setup without arbitrary recipient or password fields', async () => {
  let body: unknown;
  mswServer.use(
    http.post(
      '*/api/student/onboarding/case-1/credentials/retry-parent-setup',
      async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: workspace });
      }
    )
  );
  const result = await store
    .dispatch(
      studentOnboardingApi.endpoints.retryStudentOnboardingParentSetup.initiate({
        id: 'case-1',
        concurrencyStamp: 'current-stamp',
      })
    )
    .unwrap();
  expect(body).toEqual({ concurrencyStamp: 'current-stamp' });
  expect(result.caseId).toBe('case-1');
});

it('passes an explicit guardian access choice through activation without adding a sibling parent identity', async () => {
  let body: unknown;
  mswServer.use(
    http.post('*/api/student/onboarding/case-1/activate', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ id: 'case-1' });
    })
  );
  const guardianAccessSelection = {
    expectedEmail: 'aunt@example.test',
    confirmRecipientAccess: true,
  };
  await store
    .dispatch(
      studentOnboardingApi.endpoints.activateStudentOnboarding.initiate({
        id: 'case-1',
        concurrencyStamp: 'current-stamp',
        idempotencyKey: 'request-1',
        guardianAccessSelection,
      })
    )
    .unwrap();
  expect(body).toEqual({
    concurrencyStamp: 'current-stamp',
    idempotencyKey: 'request-1',
    guardianAccessSelection,
  });
  expect(body).not.toHaveProperty('siblingParentSelection');
});

it('passes the reviewed sibling parent identity with activation without sending credentials', async () => {
  let body: unknown;
  mswServer.use(
    http.post('*/api/student/onboarding/case-1/activate', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: { id: 'case-1', studentEnrollmentId: 'enrollment-1' } });
    })
  );
  const selection = {
    relationship: 'father' as const,
    expectedEmail: 'parent@example.com',
    expectedUserId: 'parent-1',
  };
  await store
    .dispatch(
      studentOnboardingApi.endpoints.activateStudentOnboarding.initiate({
        id: 'case-1',
        concurrencyStamp: 'stamp',
        idempotencyKey: 'key',
        siblingParentSelection: selection,
      })
    )
    .unwrap();
  expect(body).toEqual({
    concurrencyStamp: 'stamp',
    idempotencyKey: 'key',
    siblingParentSelection: selection,
  });
});

it('links an enrolled parent with one credential-boundary write and no activation, academic or fee command', async () => {
  const writes: string[] = [];
  let body: unknown;
  const capture = ({ request }: { request: Request }) => {
    if (request.method !== 'GET') writes.push(new URL(request.url).pathname);
  };
  mswServer.events.on('request:start', capture);
  const siblingParentSelection = {
    relationship: 'mother' as const,
    expectedEmail: 'mother@example.com',
    expectedUserId: 'parent-2',
  };
  mswServer.use(
    http.post('*/api/student/onboarding/case-1/credentials/link-parent', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: { ...workspace, parentSibling: { isLinked: true } } });
    })
  );
  try {
    const result = await store
      .dispatch(
        studentOnboardingApi.endpoints.linkStudentOnboardingParent.initiate({
          id: 'case-1',
          concurrencyStamp: 'current-stamp',
          siblingParentSelection,
        })
      )
      .unwrap();
    expect(result.parentSibling?.isLinked).toBe(true);
    expect(body).toEqual({ concurrencyStamp: 'current-stamp', siblingParentSelection });
    expect(writes).toEqual([
      expect.stringMatching(/\/api\/student\/onboarding\/case-1\/credentials\/link-parent$/),
    ]);
  } finally {
    mswServer.events.removeListener('request:start', capture);
  }
});
