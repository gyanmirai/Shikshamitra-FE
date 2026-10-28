import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import EmployeeOnboardingScreen from './index';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/hr/employee/onboarding',
  useSearchParams: () => new URLSearchParams(),
}));
// Importing the list must not load the salary wizard, even before React renders.
vi.mock('../payroll/structure/SalaryStructureBuilder', () => {
  throw new Error('The initial list imported the salary workflow');
});
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/phone-input', () => ({ default: () => null }));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: any) => <h1>{heading}</h1>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => (
    <div>
      {props.isLoading ? <p>Loading applications</p> : <p>{props.data[0]?.fullName}</p>}
      <p>Count: {props.totalCount}</p>
      {props.error && <p role="alert">List failed</p>}
      <button type="button" onClick={props.onRetry}>
        Retry list
      </button>
      <button type="button" onClick={() => props.onServerPagination(2, 20)}>
        Page two
      </button>
      <button type="button" onClick={() => props.onServerSearch('teacher')}>
        Search teacher
      </button>
      <button
        type="button"
        onClick={() => props.onServerFilter([{ column: 'status', type: 'equals', value: 5 }])}
      >
        Filter status
      </button>
      <button type="button" onClick={() => props.onServerFilter([])}>
        Clear filters
      </button>
    </div>
  ),
}));

let store: ReturnType<typeof configureStore>;
let requests: URL[];
let fail: boolean;
let filterBodies: any[];
beforeEach(() => {
  clearCachedAuthSession();
  requests = [];
  filterBodies = [];
  fail = false;
  store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: (): { permissions: unknown[] } => ({ permissions: [] }),
      globalState: (): { currentYear: { id: string } } => ({ currentYear: { id: 'year' } }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'synthetic-token' })),
    http.get('*/api/employee-applications', ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      return fail
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
        : HttpResponse.json({
            totalCount: 41,
            items: [
              {
                id: 'application',
                fullName: `Page ${url.searchParams.get('skipCount')}`,
                status: 0,
              },
            ],
          });
    }),
    http.post('*/api/hr/table-query', async ({ request }) => {
      filterBodies.push(await request.json());
      return fail
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
        : HttpResponse.json({
            totalCount: 1,
            items: [{ id: 'filtered', fullName: 'Filtered application', status: 5 }],
          });
    })
  );
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});
const mount = () =>
  render(
    <Provider store={store}>
      <EmployeeOnboardingScreen />
    </Provider>
  );

it('loads one paged request without detail, export, lookup, or salary reads; search resets paging', async () => {
  mount();
  expect(await screen.findByText('Page 0')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Staff Onboarding' })).toBeInTheDocument();
  expect(requests).toHaveLength(1);
  expect(filterBodies).toHaveLength(0);
  expect(requests[0].searchParams.get('maxResultCount')).toBe('10');
  fireEvent.click(screen.getByRole('button', { name: 'Page two' }));
  expect(await screen.findByText('Page 20')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Search teacher' }));
  expect(await screen.findByText('Page 0')).toBeInTheDocument();
  expect(requests.at(-1)?.searchParams.get('search')).toBe('teacher');
  expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('0');
});

it('keeps list errors explicit and retries the owning query', async () => {
  fail = true;
  mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('List failed');
  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry list' }));
  expect(await screen.findByText('Page 0')).toBeInTheDocument();
  expect(requests).toHaveLength(2);
});

it('uses accurate operational filter results, retries that query, and returns to the paged list', async () => {
  mount();
  await screen.findByText('Page 0');
  fireEvent.click(screen.getByRole('button', { name: 'Filter status' }));
  expect(await screen.findByText('Filtered application')).toBeInTheDocument();
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
  expect(filterBodies[0]).toMatchObject({
    table: 'employee-onboarding-table',
    offset: 0,
    size: 10,
    criteria: { filters: [{ column: 'status', type: 'equals', value: 5 }] },
  });
  fail = true;
  fireEvent.click(screen.getByRole('button', { name: 'Retry list' }));
  await screen.findByRole('alert');
  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry list' }));
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  expect(screen.getByText('Filtered application')).toBeInTheDocument();
  expect(filterBodies).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(await screen.findByText('Page 0')).toBeInTheDocument();
  expect(screen.getByText('Count: 41')).toBeInTheDocument();
});
