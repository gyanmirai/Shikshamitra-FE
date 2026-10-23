import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';

import { employeeApi } from './employeeApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('reads and saves staff scope through the employee boundary and preserves global scope management', async () => {
  const requests: { method: string; path: string; body?: unknown }[] = [];
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/employees/staff-1/academic-permission', ({ request }) => {
      expect(new URL(request.url).searchParams.get('academicYearId')).toBe('year-1');
      requests.push({ method: request.method, path: new URL(request.url).pathname });
      return HttpResponse.json({ userId: 'user-1', accessibleHierarchy: [] });
    }),
    http.put('*/api/employees/staff-1/academic-permission', async ({ request }) => {
      requests.push({
        method: request.method,
        path: new URL(request.url).pathname,
        body: await request.json(),
      });
      return HttpResponse.json({ assignmentsCreated: 1 });
    }),
    http.post('*/api/app/user-scope/bulk-assign', async ({ request }) => {
      requests.push({
        method: request.method,
        path: new URL(request.url).pathname,
        body: await request.json(),
      });
      return HttpResponse.json({ assignmentsCreated: 1 });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const body = {
    academicYearId: 'year-1',
    userIds: ['user-1'],
    scopes: [{ educationBoardId: 'board-1' }],
    clearExisting: false,
  };
  try {
    const read = store.dispatch(
      employeeApi.endpoints.getAccessControl.initiate(
        { employeeId: 'staff-1', userId: 'user-1', academicYearId: 'year-1' },
        { subscribe: false }
      )
    );
    expect(await read.unwrap()).toMatchObject({ userId: 'user-1' });
    await store
      .dispatch(employeeApi.endpoints.addAccessControl.initiate({ ...body, employeeId: 'staff-1' }))
      .unwrap();
    await store.dispatch(employeeApi.endpoints.addAccessControl.initiate(body)).unwrap();
    expect(requests).toEqual([
      { method: 'GET', path: '/api/employees/staff-1/academic-permission' },
      { method: 'PUT', path: '/api/employees/staff-1/academic-permission', body },
      { method: 'POST', path: '/api/app/user-scope/bulk-assign', body },
    ]);
  } finally {
    store.dispatch(api.util.resetApiState());
  }
});
