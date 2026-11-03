import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';

import { lectureSlotsApi } from './lectureSlotsApi';
import { weeklyLecturesApi } from './weeklyLecturesApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  getAuthSessionCacheRevision: () => 1,
  isAuthSessionCacheCurrent: () => true,
}));

const api = weeklyLecturesApi;
const stores: Array<ReturnType<typeof createStore>> = [];
function createStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
}
function setupStore() {
  const store = createStore();
  stores.push(store);
  return store;
}
afterEach(() => {
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
});

const queries = [
  { path: 'weekly-lecture-slots', endpoint: weeklyLecturesApi.endpoints.getWeeklyLectureSlots },
  { path: 'lecture-slots', endpoint: lectureSlotsApi.endpoints.getLectureSlots },
];

it.each(queries)('loads KG beyond the first page of $path', async ({ path, endpoint }) => {
  const rows = Array.from({ length: 13 }, (_, index) => ({
    id: `setting-${index}`,
    standardId: index === 12 ? 'kg' : `class-${index}`,
    weeklyTeachingCapacity: 36,
  }));
  const offsets: number[] = [];
  mswServer.use(
    http.get(`http://localhost:5000/api/academics/timetable/settings/${path}`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('AcademicMediumId')).toBe('english');
      const offset = Number(params.get('SkipCount') ?? 0);
      offsets.push(offset);
      return HttpResponse.json({ totalCount: rows.length, items: rows.slice(offset, offset + 10) });
    })
  );
  const result = await setupStore().dispatch(endpoint.initiate({ AcademicMediumId: 'english' }));
  expect(result.isSuccess).toBe(true);
  expect(result.data).toEqual({ totalCount: 13, items: rows });
  expect(offsets).toEqual([0, 10]);
});

it.each(queries)(
  'does not expose a partial $path list when a later page fails',
  async ({ path, endpoint }) => {
    let requests = 0;
    mswServer.use(
      http.get(`http://localhost:5000/api/academics/timetable/settings/${path}`, () => {
        requests += 1;
        return requests === 1
          ? HttpResponse.json({ totalCount: 2, items: [{ id: 'first' }] })
          : HttpResponse.json({ title: 'Unavailable' }, { status: 503 });
      })
    );
    const result = await setupStore().dispatch(endpoint.initiate({ AcademicMediumId: 'english' }));
    expect(result.isError).toBe(true);
    expect(result.data).toBeUndefined();
    expect(result.error).toMatchObject({ status: 503 });
  }
);

it.each(queries)(
  'rejects an incomplete $path response instead of looping or hiding records',
  async ({ path, endpoint }) => {
    let requests = 0;
    mswServer.use(
      http.get(`http://localhost:5000/api/academics/timetable/settings/${path}`, () => {
        requests += 1;
        return HttpResponse.json({ totalCount: 2, items: requests === 1 ? [{ id: 'first' }] : [] });
      })
    );
    const result = await setupStore().dispatch(endpoint.initiate({ AcademicMediumId: 'english' }));
    expect(result.isError).toBe(true);
    expect(result.data).toBeUndefined();
    expect(requests).toBe(2);
  }
);
