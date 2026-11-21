import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { libraryModuleApi } from 'src/redux/library/libraryModuleApi';

import BackendReportPanel from './BackendReportPanel';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: Record<string, string | null>[] }) => (
    <div>
      {data.map((row) => (
        <span key={row.title || 'unavailable'}>{row.title}</span>
      ))}
    </div>
  ),
}));

function mountReport() {
  const store = configureStore({
    reducer: {
      [libraryModuleApi.reducerPath]: libraryModuleApi.reducer,
      globalState: () => ({ currentYear: { id: 'year-id' } }),
    },
    middleware: (defaults) => defaults().concat(libraryModuleApi.middleware),
  });
  render(
    <Provider store={store}>
      <BackendReportPanel report={{ id: 'Overdue Books Report', name: 'Overdue Books Report' }} />
    </Provider>
  );
}

it('shows unavailable school-day evidence from an actual preview response', async () => {
  mswServer.use(
    http.post('http://library.test/api/library/reports/preview', () =>
      HttpResponse.json({
        reportType: 'Overdue Books Report',
        totalCount: 1,
        page: 1,
        pageSize: 50,
        columns: [{ id: 'title', label: 'Title' }],
        rows: [{ title: 'Transport verified title' }],
        schoolAsOfDate: null,
        schoolDateSource: 'Unavailable',
        schoolDateUnavailableReason: 'The Library school clock is not configured.',
        overdueClassificationAvailable: false,
        unknownDueDateCount: 1,
        overdueUnavailableReason: 'One saved due date needs review.',
        queryWarnings: [],
      })
    )
  );
  mountReport();
  await userEvent.click(screen.getByRole('button', { name: 'Preview' }));
  expect(await screen.findByText('Transport verified title')).toBeInTheDocument();
  expect(screen.getByText(/The Library school clock is not configured/)).toBeInTheDocument();
  expect(screen.getByText(/One saved due date needs review/)).toBeInTheDocument();
});

it('offers explicit manual school as-of entry without a browser-day default', () => {
  mountReport();
  expect(screen.getByLabelText('School as-of date')).toHaveValue('');
});
