import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { iconApiHandlers } from 'src/test/icon-api-handlers';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
  });
});
