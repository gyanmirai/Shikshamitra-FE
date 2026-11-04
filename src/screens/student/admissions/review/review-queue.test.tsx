import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import globalState, { setCurrentYear } from 'src/redux/globalState/globalSlice';

import AdmissionReviewsScreen from '../admission-reviews';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/student/admissions/reviews',
  useSearchParams: () => new URLSearchParams('board=board-1&medium=medium-1'),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const path = '*/api/student/enrollment/admissions/reviews/queue';
const createStore = () =>
  configureStore({
    reducer: { auth, confirmPopup, globalState, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
const stores: ReturnType<typeof createStore>[] = [];
function renderReviewUi(children: ReactNode, actions: string[]) {
  const store = createStore();
  stores.push(store);
  store.dispatch(setCurrentYear({ id: 'year-1' }));
  store.dispatch(
    setPermissions(
      actions.map((action) => ({
        name: `Students.Admissions.Reviews.${action}`,
        isGranted: true,
      }))
    )
  );
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
    </Provider>
  );
}
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-organization-options', () =>
      HttpResponse.json({
        items: [
          {
            id: 'stage-1',
            label: 'Primary',
            stageName: 'Primary',
            academicYearId: 'year-1',
            boardId: 'board-1',
            boardName: 'Board',
            mediumId: 'medium-1',
            mediumName: 'English',
          },
        ],
      })
    ),
    http.get('*/api/education-medium/medium-1/standards', () => HttpResponse.json([]))
  );
});
afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
});

it('does not query the queue when Review View is absent', async () => {
  const reads = vi.fn();
  mswServer.use(
    http.get(path, () => {
      reads();
      return HttpResponse.json({ items: [], totalCount: 0 });
    })
  );
  renderReviewUi(<AdmissionReviewsScreen />, []);
  expect(screen.getByText('Review access is required to view this queue.')).toBeInTheDocument();
  await waitFor(() => expect(reads).not.toHaveBeenCalled());
});

it('loads server pages, resets pagination when filters change, and links the real application workspace', async () => {
  const reads: Record<string, string>[] = [];
  mswServer.use(
    http.get(path, ({ request }) => {
      const params = Object.fromEntries(new URL(request.url).searchParams);
      reads.push(params);
      return HttpResponse.json({
        data: {
          totalCount: 42,
          items: [
            {
              applicationId: 'application-1',
              stageId: 'review-1',
              applicationNumber: `APP-${params.skipCount}`,
              applicantName: 'Test applicant',
              stageName: 'Admission review',
              status: 'submitted',
              assignedReviewerId: 'reviewer-1',
              assignedReviewerName: 'Reviewer',
              dueAt: '2026-09-11T08:00:00Z',
              isOverdue: true,
              isStale: false,
            },
          ],
        },
      });
    })
  );
  const user = userEvent.setup();
  renderReviewUi(<AdmissionReviewsScreen />, ['View']);
  expect(await screen.findByRole('link', { name: 'APP-0' })).toHaveAttribute(
    'href',
    '/student/admissions/applications/application-1'
  );
  await user.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(await screen.findByRole('link', { name: 'APP-20' })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Overdue Only' }));
  await waitFor(() => expect(reads.at(-1)).toMatchObject({ skipCount: '0', overdueOnly: 'true' }));
  await user.click(screen.getByRole('checkbox', { name: 'Assigned to Me' }));
  await waitFor(() =>
    expect(reads.at(-1)).toEqual({
      overdueOnly: 'true',
      assignedToMe: 'true',
      academicYearId: 'year-1',
      boardId: 'board-1',
      mediumId: 'medium-1',
      skipCount: '0',
      maxResultCount: '20',
    })
  );
}, 15000);
