import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';
import { libraryModuleApi } from 'src/redux/library/libraryModuleApi';

import BackendReportPanel from './BackendReportPanel';
import { LibraryAiReportDrawer } from './LibraryAiReportDrawer';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: Record<string, string | null>[] }) => (
    <div>
      {data.map((row) => (
        <span key={row.title}>{row.title}</span>
      ))}
    </div>
  ),
}));

const view = 'Library.Reports.View';
const create = 'Library.Reports.Export';
const report = { id: 'Fine Collection Report', name: 'Fine Collection Report' };
function mountReport(initial: string[], useAi = false) {
  const received: unknown[] = [];
  const onExportQueued = vi.fn();
  const plan = {
    reportType: report.id,
    format: 'pdf',
    page: 1,
    pageSize: 50,
    filters: { academicYearId: 'active-year' },
  };
  mswServer.use(
    http.post('http://library.test/api/library/reports/ai/plan', () =>
      HttpResponse.json({
        status: 'Ready',
        plan,
        interpretedRequest: 'Review Library fines for the current year',
        summary: 'Fine Collection for the current year',
        permissionSummary: 'Scope granted for this report',
        clarificationQuestions: [],
        assumptions: [],
        confidence: 1,
      })
    ),
    http.post('http://library.test/api/library/reports/preview', () =>
      HttpResponse.json({
        reportType: report.id,
        columns: [{ id: 'title', label: 'Title' }],
        rows: [{ title: 'Authorized report preview' }],
        totalCount: 1,
        queryWarnings: [],
      })
    ),
    http.post('http://library.test/api/library/reports/exports', async ({ request }) => {
      received.push(await request.json());
      return HttpResponse.json({ jobId: 'saved-report-job', status: 'Queued' });
    })
  );
  const initialAuth = { permissions: initial.map((name) => ({ name, isGranted: true })) };
  const store = configureStore({
    reducer: {
      [libraryModuleApi.reducerPath]: libraryModuleApi.reducer,
      auth: (state: typeof initialAuth | undefined, action: { type: string }) =>
        action.type === 'report-test/revoke-export'
          ? { permissions: [{ name: view, isGranted: true }] }
          : (state ?? initialAuth),
      globalState: (
        state: { currentYear: { id: string } } | undefined,
        action: { type: string }
      ) =>
        action.type === 'report-test/change-year'
          ? { currentYear: { id: 'another-year' } }
          : (state ?? { currentYear: { id: 'active-year' } }),
    },
    middleware: (defaults) => defaults().concat(libraryModuleApi.middleware),
  });
  render(
    <Provider store={store}>
      {useAi ? (
        <LibraryAiReportDrawer open onClose={vi.fn()} onExportQueued={onExportQueued} />
      ) : (
        <BackendReportPanel report={report} />
      )}
    </Provider>
  );
  return { store, received, plan, onExportQueued };
}

async function requestAiPlan() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('textbox', { name: 'What report would you like?' }));
  await user.paste('Review Library fines for the current year');
  await user.click(screen.getByRole('button', { name: 'Create report plan' }));
  return screen.findByText('Library report plan ready');
}

it('keeps report preview usable without exposing an unrelated export action', async () => {
  const { received } = mountReport([view, 'HR.Reports.Export']);
  await userEvent.click(screen.getByRole('button', { name: 'Preview' }));
  expect(await screen.findByText('Authorized report preview')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Generate report' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Export' })).toBeNull();
  expect(received).toEqual([]);
});

it('creates the requested manual export with the exact action and removes it when revoked', async () => {
  const { store, received } = mountReport([view, create]);
  await userEvent.click(screen.getByRole('button', { name: 'Generate report' }));
  await waitFor(() =>
    expect(received).toEqual([
      expect.objectContaining({
        reportType: report.id,
        format: 'excel',
        filters: expect.objectContaining({ academicYearId: 'active-year' }),
      }),
    ])
  );
  await act(async () => {
    store.dispatch({ type: 'report-test/revoke-export' });
  });
  expect(screen.queryByRole('button', { name: 'Generate report' })).toBeNull();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Preview' })).toBeEnabled());
  expect(received).toHaveLength(1);
});

it('clears the visible preview when the selected academic year changes', async () => {
  const { store } = mountReport([view]);
  await userEvent.click(screen.getByRole('button', { name: 'Preview' }));
  expect(await screen.findByText('Authorized report preview')).toBeVisible();
  act(() => store.dispatch({ type: 'report-test/change-year' }));
  expect(screen.queryByText('Authorized report preview')).toBeNull();
});

it('keeps the AI plan readable and removes generation and format controls when Export is revoked', async () => {
  const { store, received } = mountReport([view, create], true);
  expect(await requestAiPlan()).toBeVisible();
  expect(screen.getByRole('button', { name: 'Approve & generate PDF' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Excel' })).toBeEnabled();

  act(() => store.dispatch({ type: 'report-test/revoke-export' }));

  expect(screen.getByText('Library report plan ready')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Approve & generate PDF' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Excel' })).toBeNull();
  expect(screen.getByText('PDF')).toBeVisible();
  expect(received).toEqual([]);
});

it('queues the approved AI plan with both report grants', async () => {
  const { received, plan, onExportQueued } = mountReport([view, create], true);
  expect(await requestAiPlan()).toBeVisible();

  await userEvent.click(screen.getByRole('button', { name: 'Approve & generate PDF' }));

  expect(await screen.findByText('Library report queued')).toBeVisible();
  expect(received).toEqual([plan]);
  expect(onExportQueued).toHaveBeenCalledExactlyOnceWith('saved-report-job');
});
