import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { exportTable } from 'src/components/customizabaleTable/table-export';

import { exportIdentityTable } from './identity-table-export';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'fixture' }),
  signOut: vi.fn(),
}));
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: vi.fn() }));
const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.clearAllMocks();
});
const params = { skipCount: 10, maxResultCount: 10, sorting: 'name desc,id' };
const request = {
  format: 'excel' as const,
  searchTerm: 'Record',
  sorts: [],
  filters: [],
  columns: [{ id: 'name', label: 'Name' }],
};

it.each(['users', 'roles'] as const)(
  'exports every matching %s page independently of the visible page',
  async (kind) => {
    const offsets: string[] = [];
    mswServer.use(
      http.get(
        `*/api/${kind === 'users' ? 'security/user-directory' : 'identity/roles'}`,
        ({ request: read }) => {
          const query = new URL(read.url).searchParams;
          const skip = query.get('skipCount')!;
          offsets.push(skip);
          expect(query.get('filter')).toBe('Record');
          expect(query.get('sorting')).toBe('name desc,id');
          expect(query.get('maxResultCount')).toBe('1000');
          return HttpResponse.json({
            items: [{ id: skip, name: `Record ${skip}`, userName: skip }],
            totalCount: 3,
          });
        }
      )
    );
    await exportIdentityTable(store.dispatch, kind, params, request);
    expect(offsets).toEqual(['0', '1', '2']);
    expect(exportTable).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: expect.arrayContaining([expect.objectContaining({ id: '2' })]),
      })
    );
    expect(vi.mocked(exportTable).mock.calls[0][0].rows).toHaveLength(3);
  }
);

it('rejects an incomplete export without downloading a partial file', async () => {
  mswServer.use(
    http.get('*/api/identity/roles', () => HttpResponse.json({ items: [], totalCount: 3 }))
  );
  await expect(exportIdentityTable(store.dispatch, 'roles', params, request)).rejects.toThrow(
    'incomplete'
  );
  expect(exportTable).not.toHaveBeenCalled();
});

it('cancels export before making requests or downloading', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(
    exportIdentityTable(store.dispatch, 'roles', params, { ...request, signal: controller.signal })
  ).rejects.toThrow();
  expect(exportTable).not.toHaveBeenCalled();
});
