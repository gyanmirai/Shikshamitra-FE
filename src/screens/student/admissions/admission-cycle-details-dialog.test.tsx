import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  useGetAdmissionCycleImpactQuery,
  useGetAdmissionCycleHistoryQuery,
} from 'src/redux/student/admissions/admission-cycles-api';

import { AdmissionCycleDetailsDialog } from './admission-cycle-details-dialog';

vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useGetAdmissionCycleImpactQuery: vi.fn(),
  useGetAdmissionCycleHistoryQuery: vi.fn(),
}));

const cycle: AdmissionCycle = {
  id: 'cycle-1',
  name: 'Regular Admission',
  code: 'REG-ADM',
  academicYearId: 'year-1',
  academicYearName: '2026-2027',
  startDate: '2026-09-28T00:00:00+05:30',
  endDate: '2026-09-30T00:00:00+05:30',
  status: 1,
  windowStatus: 2,
  isAcceptingApplications: false,
  linkedOfferingCount: 6,
  activeOfferingCount: 2,
  applicationCount: 1,
  concurrencyStamp: 'stamp-1',
};

const setImpact = (value: Record<string, unknown>) =>
  vi
    .mocked(useGetAdmissionCycleImpactQuery)
    .mockReturnValue(value as ReturnType<typeof useGetAdmissionCycleImpactQuery>);

const setHistory = (value: Record<string, unknown>) =>
  vi
    .mocked(useGetAdmissionCycleHistoryQuery)
    .mockReturnValue(value as ReturnType<typeof useGetAdmissionCycleHistoryQuery>);

function renderDialog() {
  const store = configureStore({ reducer: { confirmPopup } });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionCycleDetailsDialog cycle={cycle} onClose={vi.fn()} />
      </ThemeProvider>
    </Provider>
  );
}

describe('Admission cycle details dialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows the period, current usage, and recorded activity together', () => {
    setImpact({
      data: {
        linkedOfferingCount: 6,
        activeOfferingCount: 2,
        applicationCount: 1,
        submittedApplicationCount: 0,
      },
      isLoading: false,
      isError: false,
    });
    setHistory({
      data: [
        {
          id: 'event-1',
          description: 'Admission cycle published.',
          occurredAt: '2026-09-29T06:05:00+05:30',
        },
      ],
      isLoading: false,
      isError: false,
    });

    renderDialog();

    expect(screen.getByRole('dialog', { name: 'Admission period details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Regular Admission' })).toBeInTheDocument();
    expect(screen.getByText('28 Sep 2026')).toBeInTheDocument();
    expect(screen.getByText('30 Sep 2026')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Admission cycle published.')).toBeInTheDocument();
  });

  it('keeps the dialog usable during loading and offers retry for failed sections', async () => {
    const user = userEvent.setup();
    const retryImpact = vi.fn();
    const retryHistory = vi.fn();
    setImpact({ isLoading: true, isError: false });
    setHistory({ isLoading: true, isError: false });

    const view = renderDialog();
    expect(screen.getByLabelText('Loading linked offerings')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading activity history')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();

    setImpact({ isLoading: false, isError: true, refetch: retryImpact });
    setHistory({ isLoading: false, isError: true, refetch: retryHistory });
    view.rerender(
      <Provider store={configureStore({ reducer: { confirmPopup } })}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <AdmissionCycleDetailsDialog cycle={cycle} onClose={vi.fn()} />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText(/Current usage could not be refreshed/)).toBeInTheDocument();
    expect(screen.getByText('Activity history could not be loaded.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry loading current usage' }));
    await user.click(screen.getByRole('button', { name: 'Retry loading activity history' }));
    expect(retryImpact).toHaveBeenCalledOnce();
    expect(retryHistory).toHaveBeenCalledOnce();
  });
});
