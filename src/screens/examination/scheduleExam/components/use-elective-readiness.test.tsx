import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { useElectiveReadiness } from './use-elective-readiness';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
afterEach(() => clearCachedAuthSession());

const setup = () => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const hook = renderHook(({ classId }) => useElectiveReadiness({ academicMediumId: 'medium', classId, divisionIds: ['d1', 'd2'] }), {
    wrapper, initialProps: { classId: 'class-1' },
  });
  return { hook, cleanup: () => { hook.unmount(); store.dispatch(api.util.resetApiState()); } };
};

it('batches groups and divisions, shares in-flight reads, and keeps context changes separate', async () => {
  const requests: Array<{ classId: string; electiveGroupIds: string[]; divisionIds: string[] }> = [];
  let rosterReads = 0;
  mswServer.use(
    http.post('*/api/class-management/student-elective-assignments/selection-counts', async ({ request }) => {
      const body = await request.json() as (typeof requests)[number]; requests.push(body);
      return HttpResponse.json(body.electiveGroupIds.flatMap((id) => [
        { electiveGroupId: id.toLowerCase(), divisionId: 'd1', subjectId: 'Subject-1', count: body.classId === 'class-1' ? 2 : 7 },
        { electiveGroupId: id.toLowerCase(), divisionId: 'd2', subjectId: 'subject-1', count: 3 },
      ]));
    }),
    http.get('*/api/class-management/student-elective-assignments', () => { rosterReads += 1; return HttpResponse.json({ records: [] }); }),
  );
  const { hook, cleanup } = setup();
  try {
    await act(async () => {
      const [first, shared] = await Promise.all([hook.result.current(['G1', 'G2']), hook.result.current(['G2'])]);
      expect(first.G1.assignedCounts).toEqual({ 'subject-1': 5 });
      expect(shared.G2).toEqual(first.G2);
    });
    expect(requests).toEqual([{ academicMediumId: 'medium', classId: 'class-1', divisionIds: ['d1', 'd2'], electiveGroupIds: ['G1', 'G2'] }]);
    hook.rerender({ classId: 'class-2' });
    await act(async () => { expect((await hook.result.current(['G1'])).G1.assignedCounts).toEqual({ 'subject-1': 10 }); });
    expect(requests).toHaveLength(2);
    expect(rosterReads).toBe(0);
  } finally { cleanup(); }
});

it('returns the existing retry message and permits retry after a failed grouped request', async () => {
  let reads = 0;
  mswServer.use(http.post('*/api/class-management/student-elective-assignments/selection-counts', () => {
    reads += 1;
    return reads === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json([]);
  }));
  const { hook, cleanup } = setup();
  try {
    await act(async () => {
      const first = await hook.result.current(['G1']);
      expect(first.G1).toEqual({ isReady: false, assignedCounts: {}, message: 'Unable to load elective subject assignments. Please try again.' });
    });
    await act(async () => { expect((await hook.result.current(['G1'])).G1.isReady).toBe(true); });
    expect(reads).toBe(2);
  } finally { cleanup(); }
});
