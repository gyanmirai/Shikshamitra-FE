import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { iconApiHandlers } from 'src/test/icon-api-handlers';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, render, screen, waitFor } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import ExaminationPreview from 'src/screens/examination/ExaminationReports/ExaminationReportPreviewDrawer';
import CurriculumPreview from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewDrawer';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const theme = createTheme({ cssVariables: true });
const request = { reportType: 'Subject-wise Chapter Coverage', filters: {} };

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(...iconApiHandlers, http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => { clearCachedAuthSession(); vi.restoreAllMocks(); });

([['Curriculum', CurriculumPreview], ['Examination', ExaminationPreview]] as const).forEach(([name, Preview]) => {
  describe(`${name} report preview lifecycle`, () => {
    const createStore = () => configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });

    it('reopens at page one with one preview request rather than fetching the previous page first', async () => {
      const pages: number[] = [];
      mswServer.use(http.post('*/api/app/academic-report/preview', async ({ request: incoming }) => {
        const body = await incoming.json() as { page: number; pageSize: number };
        pages.push(body.page);
        return HttpResponse.json({ reportType: request.reportType, totalCount: 30, ...body,
          columns: [{ id: 'subject', label: 'Subject' }], rows: [{ subject: `subject-row-${body.page}` }] });
      }));
      const store = createStore();
      const view = (open: boolean) => <Provider store={store}><ThemeProvider theme={theme}>
        <Preview open={open} onClose={() => undefined} reportRequest={request} reportTitle="Report" />
      </ThemeProvider></Provider>;
      const mounted = render(view(true));
      try {
        await screen.findByText('subject-row-1');
        await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
        await screen.findByText('subject-row-2');
        mounted.rerender(view(false));
        mounted.rerender(view(true));
        await screen.findByText('subject-row-1');
        expect(pages).toEqual([1, 2, 1]);
      } finally { mounted.unmount(); store.dispatch(api.util.resetApiState()); }
    });

    it('downloads an existing completed PDF without queuing another export', async () => {
      let exports = 0;
      mswServer.use(
        http.post('*/api/app/academic-report/preview', () => HttpResponse.json({
          reportType: request.reportType, totalCount: 1, page: 1, pageSize: 10,
          columns: [{ id: 'subject', label: 'Subject' }], rows: [{ subject: 'ready-report' }],
        })),
        http.post('*/api/app/academic-report/exports', () => { exports += 1; return HttpResponse.json({ jobId: 'unexpected', status: 'Queued' }); }),
      );
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      const store = createStore();
      const mounted = render(<Provider store={store}><ThemeProvider theme={theme}>
        <Preview open onClose={() => undefined} reportRequest={request} reportTitle="Report" existingExportJobId="existing-pdf" />
      </ThemeProvider></Provider>);
      try {
        await screen.findByText('ready-report');
        await userEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
        await waitFor(() => expect(click).toHaveBeenCalledOnce());
        expect(exports).toBe(0);
      } finally { mounted.unmount(); store.dispatch(api.util.resetApiState()); }
    });

    it('does not start polling when export creation completes after closing the drawer', async () => {
      let resolveExport!: () => void;
      const release = new Promise<void>((resolve) => { resolveExport = resolve; });
      let creates = 0;
      let statusRequests = 0;
      mswServer.use(
        http.post('*/api/app/academic-report/preview', () => HttpResponse.json({
          reportType: request.reportType, totalCount: 1, page: 1, pageSize: 10,
          columns: [{ id: 'subject', label: 'Subject' }], rows: [{ subject: 'delayed-report' }],
        })),
        http.post('*/api/app/academic-report/exports', async () => {
          creates += 1;
          await release;
          return HttpResponse.json({ jobId: 'late-job', status: 'Completed' });
        }),
        http.get('*/api/app/academic-report/exports/:jobId', () => {
          statusRequests += 1;
          return HttpResponse.json({ id: 'late-job', status: 'Processing' });
        }),
      );
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      const store = createStore();
      const mounted = render(<Provider store={store}><ThemeProvider theme={theme}>
        <Preview open onClose={() => undefined} reportRequest={request} reportTitle="Report" />
      </ThemeProvider></Provider>);
      try {
        await screen.findByText('delayed-report');
        await userEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
        await waitFor(() => expect(creates).toBe(1));
        mounted.unmount();
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
        await act(async () => { resolveExport(); await Promise.all(store.dispatch(api.util.getRunningMutationsThunk())); });
        await act(() => vi.advanceTimersByTimeAsync(6000));
        expect(statusRequests).toBe(0);
        expect(click).not.toHaveBeenCalled();
      } finally {
        resolveExport();
        vi.clearAllTimers();
        vi.useRealTimers();
        mounted.unmount();
        store.dispatch(api.util.resetApiState());
      }
    });

    it('preserves export progress and downloads the generated PDF once', async () => {
      let resolveExport!: () => void;
      const release = new Promise<void>((resolve) => { resolveExport = resolve; });
      let statusRequests = 0;
      let fileRequests = 0;
      mswServer.use(
        http.post('*/api/app/academic-report/preview', () => HttpResponse.json({
          reportType: request.reportType, totalCount: 1, page: 1, pageSize: 10,
          columns: [{ id: 'subject', label: 'Subject' }], rows: [{ subject: 'export-report' }],
        })),
        http.post('*/api/app/academic-report/exports', async () => {
          await release;
          return HttpResponse.json({ jobId: 'ready-job', status: 'Queued' });
        }),
        http.get('*/api/app/academic-report/exports/:jobId', () => {
          statusRequests += 1;
          return HttpResponse.json({ id: 'ready-job', status: statusRequests === 1 ? 'Processing' : 'Completed' });
        }),
        http.get('*/api/app/academic-report/exports/:jobId/download', () => {
          fileRequests += 1;
          return new HttpResponse('%PDF-report', { headers: { 'Content-Type': 'application/pdf' } });
        }),
      );
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report-download');
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      const store = createStore();
      const mounted = render(<Provider store={store}><ThemeProvider theme={theme}>
        <Preview open onClose={() => undefined} reportRequest={request} reportTitle="Report" />
      </ThemeProvider></Provider>);
      try {
        await screen.findByText('export-report');
        await userEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
        expect(screen.getByRole('button', { name: 'Creating export...' })).toBeDisabled();
        await act(async () => { resolveExport(); await Promise.all(store.dispatch(api.util.getRunningMutationsThunk())); });
        expect(screen.getByRole('button', { name: 'Generating PDF (Queued)' })).toBeDisabled();
        await screen.findByRole('button', { name: 'Generating PDF (Processing)' }, { timeout: 4000 });
        await waitFor(() => expect(click).toHaveBeenCalledOnce(), { timeout: 5000 });
        expect(fileRequests).toBe(name === 'Curriculum' ? 0 : 1);
        expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled();
      } finally {
        resolveExport();
        vi.useRealTimers();
        mounted.unmount();
        store.dispatch(api.util.resetApiState());
      }
    });
  });
});
