import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { StudentLeaveApi } from 'src/redux/student/student-leave/student-leave-api';

import LeaveRequests from './leave-requests';

const state = vi.hoisted(() => ({ params: new URLSearchParams(), update: vi.fn() }));

// Use real endpoint subscriptions/cache invalidation. Only the authenticated
// transport is replaced with a synthetic MSW origin; no school API is contacted.
vi.mock('src/redux/service', async () => {
  const { createApi, fetchBaseQuery } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'attendanceRequestTestApi',
      baseQuery: fetchBaseQuery({ baseUrl: 'http://attendance.test/api' }),
      tagTypes,
      endpoints: () => ({}),
    }),
  };
});
vi.mock('../setting/attendance-context', () => ({
  useAttendanceContext: () => ({ params: state.params, update: state.update }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: { id: string; studentName: string }[] }) => (
    <div>
      {data.map((row) => (
        <div key={row.id}>{row.studentName}</div>
      ))}
    </div>
  ),
}));

const scope = { academicYearId: 'year', educationMediumId: 'medium', organizationId: 'stage' };
const requests: { path: string; params: URLSearchParams }[] = [];
let store: ReturnType<typeof makeStore>;
let approved = false;
let rejectMutation = false;

function makeStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: () => ({
        permissions: [{ name: 'Students.Attendance.LeaveAndAbsent.Add', isGranted: true }],
      }),
      confirmPopup: () => ({ isChanges: false }),
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
}

beforeEach(() => {
  requests.length = 0;
  approved = false;
  rejectMutation = false;
  state.params = new URLSearchParams('leaveSearch=Riya&leavePage=2&leaveSize=25');
  state.update.mockImplementation((values: Record<string, string | undefined>) => {
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined) state.params.delete(key);
      else state.params.set(key, value);
    });
  });
  store = makeStore();
  mswServer.use(
    http.get('http://attendance.test/api/students/attendance/leaves', ({ request }) => {
      const url = new URL(request.url);
      requests.push({ path: url.pathname, params: url.searchParams });
      const status = Number(url.searchParams.get('status'));
      return HttpResponse.json({
        totalCount: status === 1 ? (approved ? 7 : 6) : status === 2 ? 3 : approved ? 11 : 12,
        items: [{ id: 'leave', studentName: 'Riya', status }],
      });
    }),
    http.get(
      'http://attendance.test/api/students/attendance/leaves/status-counts',
      ({ request }) => {
        const url = new URL(request.url);
        requests.push({ path: url.pathname, params: url.searchParams });
        return HttpResponse.json({
          pendingCount: approved ? 11 : 12,
          approvedCount: approved ? 7 : 6,
          rejectedCount: 3,
        });
      }
    ),
    http.post('http://attendance.test/api/students/attendance/leaves/leave/approve', () => {
      if (rejectMutation)
        return HttpResponse.json({ error: 'Synthetic rejection' }, { status: 409 });
      approved = true;
      return HttpResponse.json({ id: 'leave', status: 1 });
    })
  );
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  state.update.mockReset();
});

it('loads one page and one grouped counter with the same scope and search', async () => {
  state.params.set(
    'leaveFilters',
    JSON.stringify([
      { column: 'studentName', type: 'contains', value: 'Riya', valueType: 'string' },
      { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
    ])
  );
  render(
    <Provider store={store}>
      <LeaveRequests scope={scope} />
    </Provider>
  );
  await screen.findByText('Riya');
  expect(await screen.findByRole('tab', { name: 'Pending 12' })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Approved 6' })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Rejected 3' })).toBeVisible();
  await waitFor(() => expect(requests).toHaveLength(2));
  const page = requests.find((request) => request.path.endsWith('/leaves'))!;
  const counts = requests.find((request) => request.path.endsWith('/status-counts'))!;
  expect(Object.fromEntries(page.params)).toMatchObject({
    ...scope,
    status: '0',
    skipCount: '50',
    maxResultCount: '25',
    filterText: 'Riya',
  });
  expect(Object.fromEntries(counts.params)).toMatchObject({ ...scope, filterText: 'Riya' });
  expect(counts.params.has('status')).toBe(false);
  expect(counts.params.has('maxResultCount')).toBe(false);
  expect(JSON.parse(counts.params.get('tableFilters')!)).toEqual([
    { column: 'studentName', type: 'contains', value: 'Riya' },
  ]);
  expect(JSON.parse(page.params.get('tableFilters')!)).toContainEqual({
    column: 'status',
    type: 'equals',
    value: '0',
  });
});

it('changes the active list without fetching rich rows for the other status totals', async () => {
  const view = render(
    <Provider store={store}>
      <LeaveRequests scope={scope} />
    </Provider>
  );
  await screen.findByRole('tab', { name: 'Approved 6' });
  fireEvent.click(screen.getByRole('tab', { name: 'Approved 6' }));
  view.rerender(
    <Provider store={store}>
      <LeaveRequests scope={scope} />
    </Provider>
  );
  await waitFor(() =>
    expect(
      requests
        .filter((request) => request.path.endsWith('/leaves'))
        .at(-1)
        ?.params.get('status')
    ).toBe('1')
  );
  expect(requests.filter((request) => request.path.endsWith('/status-counts'))).toHaveLength(1);
  expect(requests.filter((request) => request.path.endsWith('/leaves'))).toHaveLength(2);
});

it('refreshes both the active page and all counters after an accepted decision', async () => {
  render(
    <Provider store={store}>
      <LeaveRequests scope={scope} />
    </Provider>
  );
  await screen.findByRole('tab', { name: 'Pending 12' });
  await act(async () => {
    await store
      .dispatch(
        StudentLeaveApi.endpoints.approveStudentLeave.initiate({ id: 'leave', data: { status: 1 } })
      )
      .unwrap();
  });
  expect(await screen.findByRole('tab', { name: 'Pending 11' })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Approved 7' })).toBeVisible();
  expect(requests.filter((request) => request.path.endsWith('/leaves'))).toHaveLength(2);
  expect(requests.filter((request) => request.path.endsWith('/status-counts'))).toHaveLength(2);
});

it('keeps counters and visible rows after a rejected decision without refreshing unrelated data', async () => {
  render(
    <Provider store={store}>
      <LeaveRequests scope={scope} />
    </Provider>
  );
  await screen.findByRole('tab', { name: 'Pending 12' });
  const before = requests.length;
  rejectMutation = true;
  await act(async () => {
    await expect(
      store
        .dispatch(
          StudentLeaveApi.endpoints.approveStudentLeave.initiate({
            id: 'leave',
            data: { status: 1 },
          })
        )
        .unwrap()
    ).rejects.toBeDefined();
  });
  expect(screen.getByText('Riya')).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Pending 12' })).toBeVisible();
  expect(requests).toHaveLength(before);
});

it('keeps queries skipped until the academic prerequisites are present', async () => {
  render(
    <Provider store={store}>
      <LeaveRequests scope={{}} />
    </Provider>
  );
  await act(async () => {});
  expect(requests).toHaveLength(0);
});

it('replaces counters for a changed scope and preserves genuine zero totals', async () => {
  const view = render(
    <Provider store={store}>
      <LeaveRequests scope={scope} />
    </Provider>
  );
  await screen.findByRole('tab', { name: 'Pending 12' });
  mswServer.use(
    http.get(
      'http://attendance.test/api/students/attendance/leaves/status-counts',
      ({ request }) => {
        const url = new URL(request.url);
        requests.push({ path: url.pathname, params: url.searchParams });
        return HttpResponse.json({ pendingCount: 1, approvedCount: 0, rejectedCount: 0 });
      }
    )
  );
  view.rerender(
    <Provider store={store}>
      <LeaveRequests scope={{ ...scope, academicYearId: 'other-year' }} />
    </Provider>
  );
  expect(screen.queryByRole('tab', { name: 'Pending 12' })).not.toBeInTheDocument();
  expect(await screen.findByRole('tab', { name: 'Pending 1' })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Approved 0' })).toBeVisible();
  expect(
    requests
      .filter((request) => request.path.endsWith('/status-counts'))
      .at(-1)
      ?.params.get('academicYearId')
  ).toBe('other-year');
});
