import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { SessionProvider } from 'next-auth/react';
import { vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import StudentDashboard from './index';
import {
  dashboardContext,
  dashboardSection,
  createDashboardStore,
  dashboardPermissions,
} from './dashboard-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
// Decorative icons do not participate in dashboard behavior; avoid third-party TLS requests.
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
let store: ReturnType<typeof createDashboardStore>;
export const getDashboardStore = () => store;
export const requests: string[] = [];
const session = {
  profile: { sub: 'teacher-1' },
  user: { name: 'Test teacher' },
  expires: '2099-01-01T00:00:00Z',
};

beforeEach(() => {
  requests.length = 0;
  clearCachedAuthSession();
  store = createDashboardStore();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(session)),
    http.get(
      /^https:\/\/(api\.iconify\.design|api\.simplesvg\.com|api\.unisvg\.com)\//,
      ({ request }) => {
        const url = new URL(request.url);
        const prefix = url.pathname.split('/').pop()?.replace('.json', '') ?? 'mdi';
        const icons = Object.fromEntries(
          (url.searchParams.get('icons') ?? '')
            .split(',')
            .map((name) => [name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 }])
        );
        return HttpResponse.json({ prefix, icons });
      }
    ),
    http.get('*/api/students/dashboard/context', () => {
      requests.push('context');
      return HttpResponse.json(dashboardContext);
    }),
    http.get('*/api/students/dashboard/sections/:section', ({ params, request }) => {
      const section = String(params.section) as 'records' | 'admissions' | 'attendance';
      requests.push(section);
      return HttpResponse.json({
        data: dashboardSection(
          section,
          new URL(request.url).searchParams.get('academicYearId') ?? ''
        ),
      });
    })
  );
});
afterEach(async () => {
  cleanup();
  await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

export function mount(permissions = dashboardPermissions) {
  store = createDashboardStore(permissions);
  return render(
    <ThemeProvider theme={createTheme()}>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <Provider store={store}>
          <StudentDashboard />
        </Provider>
      </SessionProvider>
    </ThemeProvider>
  );
}
