import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AcademicReportRecoveryScreen } from './AcademicReportRecoveryScreen';

const mocks = vi.hoisted(() => ({
  status: 'Expired',
  canRegenerate: true,
  query: vi.fn(),
  regenerate: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('src/redux/academicAPI/AcademicReportApi', () => ({
  academicReportApi: { endpoints: { getAcademicReportRecovery: {
    useQueryState: () => ({
      currentData: { reportType: 'ChapterDescriptionSummary', status: mocks.status, format: 'pdf', canRegenerate: mocks.canRegenerate },
    }),
    useQuery: mocks.query,
  } } },
  useRegenerateAcademicReportExportMutation: () => [mocks.regenerate, { isLoading: false }],
}));

const jobId = '3a23a6b6-f55d-bc60-28c5-e3599a88f7c1';

function renderScreen() {
  const store = configureStore({
    reducer: { auth: () => ({ user: { sub: 'requester' }, sessionContext: { tenantId: 'school' } }) },
  });
  const renderPage = () => (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}><AcademicReportRecoveryScreen jobId={jobId} /></ThemeProvider>
    </Provider>
  );
  const view = render(renderPage());
  return () => view.rerender(renderPage());
}

describe('Academic report recovery screen', () => {
  beforeEach(() => {
    mocks.status = 'Expired';
    mocks.canRegenerate = true;
    mocks.query.mockReturnValue({ isError: false, refetch: mocks.refetch });
    mocks.regenerate.mockReset().mockReturnValue({ unwrap: async () => ({ jobId, status: 'Queued' }) });
  });

  it('waits for an explicit request, prevents duplicate submissions and offers the same download when ready', async () => {
    const rerender = renderScreen();
    expect(screen.getByRole('status')).toHaveTextContent('Report expired');
    expect(mocks.regenerate).not.toHaveBeenCalled();
    const generate = screen.getByRole('button', { name: 'Generate again' });
    fireEvent.click(generate);
    fireEvent.click(generate);
    expect(mocks.regenerate).toHaveBeenCalledExactlyOnceWith({ jobId, owner: 'school:requester' });
    await waitFor(() => expect(mocks.refetch).toHaveBeenCalled());
    mocks.status = 'Queued';
    mocks.canRegenerate = false;
    rerender();
    expect(screen.getByRole('status')).toHaveTextContent('Queued');
    expect(screen.queryByRole('link', { name: 'Download report' })).not.toBeInTheDocument();
    mocks.status = 'Completed';
    rerender();
    expect(screen.getByRole('link', { name: 'Download report' })).toHaveAttribute(
      'href', `/api/academic-reports/${jobId}/download`
    );
  });

  it('explains when the requester cannot generate the expired report again', () => {
    mocks.canRegenerate = false;
    renderScreen();
    expect(screen.getByRole('alert')).toHaveTextContent('Your account does not have permission');
    expect(screen.queryByRole('button', { name: 'Generate again' })).not.toBeInTheDocument();
  });
});
