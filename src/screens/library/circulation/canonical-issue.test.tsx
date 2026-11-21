import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useIssueDraft } from './useIssueDraft';
import { canonicalCopy, canonicalLookupHandlers } from './canonical-test-fixtures';
import { lookupMember, makeCirculationTestWrapper } from './circulation-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(...canonicalLookupHandlers);
});
const values = {
  accessionNumber: 'SMSC:scan-token',
  memberId: 'selected-member-id',
  issueDate: dayjs('2026-11-16'),
  dueDate: dayjs('2026-11-30'),
};
function setup() {
  const onClose = vi.fn();
  return {
    onClose,
    ...renderHook(() => useIssueDraft(null, true, onClose), makeCirculationTestWrapper()),
  };
}
it('does not invent a browser-local issue date before a confirmed school day is available', () => {
  expect(setup().result.current.formik.values.issueDate).toBeNull();
});
it('posts the exact saved copy and preview revision with civil dates and retains a conflicted draft', async () => {
  let sent: { path: string; body: unknown } | undefined;
  const reject = async ({ request }: { request: Request }) => {
    sent = { path: new URL(request.url).pathname, body: await request.json() };
    return HttpResponse.json({ detail: 'The copy changed. Review the preview.' }, { status: 409 });
  };
  mswServer.use(
    http.post('http://library.test/api/library/issues', reject),
    http.post('http://library.test/api/library/circulation/loans', reject)
  );
  const { result, onClose } = setup();
  await act(async () => {
    await result.current.formik.setValues(values);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(sent).toMatchObject({
    path: '/api/library/circulation/loans',
    body: {
      copyId: canonicalCopy.copyId,
      memberId: lookupMember.id,
      issueDate: '2026-11-16',
      requestedDueDate: '2026-11-30',
      revision: 'saved-plan-revision',
    },
  });
  expect(result.current.formik.values.dueDate?.format('YYYY-MM-DD')).toBe('2026-11-30');
  expect(result.current.formik.dirty).toBe(true);
  expect(result.current.error).toContain('Review the preview');
  expect(onClose).not.toHaveBeenCalled();
});
it('retains one nonempty idempotency key for an identical payload retried after a network failure', async () => {
  const bodies: Record<string, unknown>[] = [];
  const respond = async ({ request }: { request: Request }) => {
    bodies.push((await request.json()) as Record<string, unknown>);
    return bodies.length === 1
      ? HttpResponse.error()
      : HttpResponse.json({ loan: { id: 'loan-id' }, wasReplay: true, assessmentIds: [] });
  };
  mswServer.use(
    http.post('http://library.test/api/library/issues', respond),
    http.post('http://library.test/api/library/circulation/loans', respond)
  );
  const { result, onClose } = setup();
  await act(async () => {
    await result.current.formik.setValues(values);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(bodies).toHaveLength(2);
  expect(bodies[0].idempotencyKey).toEqual(expect.any(String));
  expect(String(bodies[0].idempotencyKey).length).toBeGreaterThan(0);
  expect(bodies[1]).toEqual(bodies[0]);
  expect(onClose).toHaveBeenCalledOnce();
});
