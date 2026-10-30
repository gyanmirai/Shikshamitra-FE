import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { academicInsightsApi as api } from './academicInsightsApi';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  getAuthSessionCacheRevision: () => 1, isAuthSessionCacheCurrent: () => true,
}));

const payload = { role: 'teacher', scopeLabel: 'Assigned classes',
  generatedAt: '2026-10-29T10:00:00Z', sections: [], students: [] };
const input = { academicYearId: 'year-a', boardId: 'board-a', educationMediumId: 'medium-a',
  accessKey: 'tenant-a:user-a:1' };
const endpoint = 'http://localhost:5000/api/academic/dashboard/insights';
const createStore = () => configureStore({ reducer: { [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware) });
let store: ReturnType<typeof createStore>;
beforeEach(() => { store = createStore(); });
afterEach(() => { store.dispatch(api.util.resetApiState()); });

describe('Academic Insights request and cache boundary', () => {
  it('sends the exact scope and child filters without the cache identity', async () => {
    let received: URL | undefined;
    mswServer.use(http.get(endpoint, ({ request }) => {
      received = new URL(request.url);
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      return HttpResponse.json(payload);
    }));
    const result = await store.dispatch(api.endpoints.getAcademicInsights.initiate({ ...input,
      standardId: 'standard-a', divisionId: 'division-a', studentId: 'child-a' }));
    expect(result.data).toEqual(payload);
    expect(Object.fromEntries(received!.searchParams)).toEqual({ academicYearId: 'year-a',
      boardId: 'board-a', educationMediumId: 'medium-a', standardId: 'standard-a',
      divisionId: 'division-a', studentId: 'child-a' });
  });

  it('partitions cached responses by context, account and permission revision', async () => {
    let requests = 0;
    mswServer.use(http.get(endpoint, () => {
      requests += 1;
      return HttpResponse.json({ ...payload, scopeLabel: `Response ${requests}` });
    }));
    const query = api.endpoints.getAcademicInsights;
    expect((await store.dispatch(query.initiate(input))).data?.scopeLabel).toBe('Response 1');
    expect((await store.dispatch(query.initiate(input))).data?.scopeLabel).toBe('Response 1');
    await Promise.all([{ educationMediumId: 'medium-b' }, { accessKey: 'tenant-b:user-a:1' },
      { accessKey: 'tenant-a:user-b:1' }, { accessKey: 'tenant-a:user-a:2' }, { studentId: 'child-b' }]
      .map((change) => store.dispatch(query.initiate({ ...input, ...change }))));
    expect(requests).toBe(6);
  });

  it('rejects malformed success data, then refetches a valid empty response', async () => {
    mswServer.use(http.get(endpoint, () => HttpResponse.json({ totalCount: 0, items: [] })));
    const pending = store.dispatch(api.endpoints.getAcademicInsights.initiate(input));
    expect((await pending).error).toMatchObject({ status: 'CUSTOM_ERROR' });
    mswServer.use(http.get(endpoint, () => HttpResponse.json(payload)));
    expect((await pending.refetch()).data).toEqual(payload);
  });

  it('refreshes active insights after an academic workflow invalidates a shared tag', async () => {
    let requests = 0;
    mswServer.use(http.get(endpoint, () => { requests += 1; return HttpResponse.json(payload); }));
    await store.dispatch(api.endpoints.getAcademicInsights.initiate(input));
    store.dispatch(api.util.invalidateTags(['ClassTeacherAssignment', 'Student-Take-Attendance']));
    await vi.waitFor(() => expect(requests).toBe(2));
  });

  it.each(['SubjectProgress', 'Class', 'Division'] as const)(
    'refreshes a subscribed dashboard when %s changes', async (tag) => {
      let requests = 0;
      mswServer.use(http.get(endpoint, () => {
        requests += 1;
        return HttpResponse.json({ ...payload, scopeLabel: `Saved revision ${requests}` });
      }));
      await store.dispatch(api.endpoints.getAcademicInsights.initiate(input));
      store.dispatch(api.util.invalidateTags([tag]));
      await vi.waitFor(() => expect(requests).toBe(2));
      expect(api.endpoints.getAcademicInsights.select(input)(store.getState()).data?.scopeLabel)
        .toBe('Saved revision 2');
    }
  );

  it.each(['Student', { type: 'Student', id: 'RECORDS-DIRECTORY' }] as const)(
    'refreshes enrollment totals after student record invalidation %j', async (tag) => {
      let requests = 0;
      mswServer.use(http.get(endpoint, () => {
        requests += 1;
        return HttpResponse.json(payload);
      }));
      await store.dispatch(api.endpoints.getAcademicInsights.initiate(input));
      store.dispatch(api.util.invalidateTags([tag]));
      await vi.waitFor(() => expect(requests).toBe(2));
    }
  );
});
