import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { Snackbar } from 'src/components/snackbar';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { shikshaMitraToast } from 'src/components/toast';
import { iconApiHandlers } from 'src/test/icon-api-handlers';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { academicPermissions } from 'src/constants/academic-menu';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, renderHook } from '@testing-library/react';

import CurriculumReportList from './CurriculumReportList';
import { useCurriculumReportPreview } from './hooks/useCurriculumReportPreview';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const reportType = 'Chapter Progress Report';
const filters = {
  academicYearId: 'saved-year',
  classIds: ['saved-class'],
  divisionIds: ['saved-division'],
  subjectIds: ['computer-science'],
  chapterIds: ['first-chapter'],
};
const summary = {
  id: 'saved-pdf',
  reportType,
  format: 'pdf',
  status: 'Completed',
  isDynamic: false,
  requestJson: null,
};

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(
    ...iconApiHandlers,
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-report/exports', () => HttpResponse.json([summary]))
  );
});
afterEach(() => {
  clearCachedAuthSession();
  vi.restoreAllMocks();
});

function mountHistory() {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: () => ({
        permissions: [{ name: `${academicPermissions.curriculum.reports}.Add`, isGranted: true }],
      }),
      globalState: () => ({ currentYear: null, currentBoard: null, currentMedium: null }),
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CurriculumReportList />
        <Snackbar />
      </ThemeProvider>
    </Provider>
  );
  return { ...view, store };
}

it.each(['camelCase', 'PascalCase'])(
  'loads saved %s filters before previewing a history report and reuses its PDF',
  async (casing) => {
    const previewRequests: unknown[] = [];
    let detailReads = 0;
    let exports = 0;
    const saved =
      casing === 'camelCase'
        ? { reportType, filters }
        : {
            ReportType: reportType,
            Filters: {
              AcademicYearId: filters.academicYearId,
              ClassIds: filters.classIds,
              DivisionIds: filters.divisionIds,
              SubjectIds: filters.subjectIds,
              ChapterIds: filters.chapterIds,
            },
          };
    mswServer.use(
      http.get('*/api/app/academic-report/exports/saved-pdf', () => {
        detailReads += 1;
        return HttpResponse.json({ ...summary, requestJson: JSON.stringify(saved) });
      }),
      http.post('*/api/app/academic-report/preview', async ({ request }) => {
        const body = (await request.json()) as { filters: typeof filters };
        previewRequests.push(body);
        const matching = JSON.stringify(body.filters) === JSON.stringify(filters);
        return HttpResponse.json({
          reportType,
          totalCount: matching ? 1 : 3,
          page: 1,
          pageSize: 10,
          columns: [{ id: 'SubjectName', label: 'Subject Name' }],
          rows: matching
            ? [{ SubjectName: 'Computer Science' }]
            : [
                { SubjectName: 'Computer Science' },
                { SubjectName: 'Mathematics' },
                { SubjectName: 'Other Mathematics' },
              ],
        });
      }),
      http.post('*/api/app/academic-report/exports', () => {
        exports += 1;
        return HttpResponse.json({ jobId: 'unexpected', status: 'Queued' });
      })
    );
    const downloadClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const view = mountHistory();
    try {
      await userEvent.click(await screen.findByRole('button', { name: 'View report' }));
      await screen.findByText('Computer Science');
      expect(detailReads).toBe(1);
      expect(previewRequests).toEqual([expect.objectContaining({ reportType, filters })]);
      expect(screen.queryByText('Mathematics')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
      await waitFor(() => expect(downloadClick).toHaveBeenCalledOnce());
      expect(exports).toBe(0);
      expect((downloadClick.mock.contexts[0] as HTMLAnchorElement).getAttribute('href')).toBe(
        '/api/academic-reports/saved-pdf/download'
      );
    } finally {
      shikshaMitraToast.dismiss();
      await waitFor(() =>
        expect(screen.queryAllByText('Failed to parse report parameters.')).toHaveLength(0)
      );
      view.unmount();
      view.store.dispatch(api.util.resetApiState());
    }
  }
);

it.each([403, 500])(
  'does not open a broad preview when job details return HTTP %i',
  async (status) => {
    let previews = 0;
    mswServer.use(
      http.get('*/api/app/academic-report/exports/saved-pdf', () =>
        HttpResponse.json({ error: { message: 'Unavailable' } }, { status })
      ),
      http.post('*/api/app/academic-report/preview', () => {
        previews += 1;
        return HttpResponse.json({ rows: [] });
      })
    );
    const view = mountHistory();
    try {
      await userEvent.click(await screen.findByRole('button', { name: 'View report' }));
      await screen.findByText('Failed to load report parameters. Please try again.');
      expect(previews).toBe(0);
    } finally {
      shikshaMitraToast.dismiss();
      await waitFor(() =>
        expect(
          screen.queryAllByText('Failed to load report parameters. Please try again.')
        ).toHaveLength(0)
      );
      view.unmount();
      view.store.dispatch(api.util.resetApiState());
    }
  }
);

it.each([false, true])(
  'waits for saved parameters and ignores a late response after unmount: %s',
  async (unmount) => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let previews = 0;
    mswServer.use(
      http.get('*/api/app/academic-report/exports/saved-pdf', async () => {
        await gate;
        return HttpResponse.json({
          ...summary,
          requestJson: JSON.stringify({ reportType, filters }),
        });
      }),
      http.post('*/api/app/academic-report/preview', () => {
        previews += 1;
        return HttpResponse.json({
          totalCount: 1,
          columns: [{ id: 'SubjectName', label: 'Subject Name' }],
          rows: [{ SubjectName: 'Computer Science' }],
        });
      })
    );
    const view = mountHistory();
    try {
      await userEvent.click(await screen.findByRole('button', { name: 'View report' }));
      expect(screen.getByRole('button', { name: 'View report' })).toBeDisabled();
      expect(previews).toBe(0);
      if (unmount) view.unmount();
      release();
      if (unmount) {
        await waitFor(() =>
          expect(
            Object.values(view.store.getState()[api.reducerPath].queries).some(
              (query) =>
                query?.endpointName === 'getAcademicReportExportJob' && query.status === 'fulfilled'
            )
          ).toBe(true)
        );
        expect(previews).toBe(0);
      } else {
        await screen.findByText('Computer Science');
        expect(previews).toBe(1);
      }
    } finally {
      release();
      view.unmount();
      view.store.dispatch(api.util.resetApiState());
    }
  }
);

it('invalidates a pending preview when switching accounts and returning to the original account', async () => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get('*/api/app/academic-report/exports/saved-pdf', async () => {
      await gate;
      return HttpResponse.json({
        ...summary,
        requestJson: JSON.stringify({ reportType, filters }),
      });
    })
  );
  const account = createSlice({
    name: 'history-account',
    initialState: {
      sessionContext: { tenantId: 'school-A' },
      user: { sub: 'user-A' },
    },
    reducers: {
      change: (_state, action: { payload: string }) => ({
        sessionContext: { tenantId: action.payload },
        user: { sub: 'user-A' },
      }),
    },
  });
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: account.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const hook = renderHook(useCurriculumReportPreview, {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  let pending: Promise<void> | undefined;
  try {
    act(() => {
      pending = hook.result.current.handleView(summary);
    });
    await waitFor(() => expect(hook.result.current.loadingJobId).toBe(summary.id));
    act(() => {
      store.dispatch(account.actions.change('school-B'));
    });
    expect(hook.result.current.selection).toBeNull();
    expect(hook.result.current.loadingJobId).toBeNull();
    act(() => {
      store.dispatch(account.actions.change('school-A'));
    });
    expect(hook.result.current.loadingJobId).toBeNull();
    release();
    await act(async () => {
      await pending;
    });
    expect(hook.result.current.selection).toBeNull();
  } finally {
    release();
    await act(async () => {
      await pending;
    });
    hook.unmount();
    store.dispatch(api.util.resetApiState());
  }
});

it.each([null, '{}', '{invalid', '{"reportType":"Chapter Progress Report","filters":null}'])(
  'does not request an unfiltered preview when saved parameters are invalid: %s',
  async (requestJson) => {
    let previews = 0;
    mswServer.use(
      http.get('*/api/app/academic-report/exports/saved-pdf', () =>
        HttpResponse.json({ ...summary, requestJson })
      ),
      http.post('*/api/app/academic-report/preview', () => {
        previews += 1;
        return HttpResponse.json({ columns: [], rows: [] });
      })
    );
    const view = mountHistory();
    try {
      await userEvent.click(await screen.findByRole('button', { name: 'View report' }));
      await screen.findByText('Failed to parse report parameters.');
      expect(previews).toBe(0);
    } finally {
      shikshaMitraToast.dismiss();
      await waitFor(() =>
        expect(screen.queryAllByText('Failed to parse report parameters.')).toHaveLength(0)
      );
      view.unmount();
      view.store.dispatch(api.util.resetApiState());
    }
  }
);
