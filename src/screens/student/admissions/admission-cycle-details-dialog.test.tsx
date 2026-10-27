import type { ReactNode } from 'react';
import type { AlertProps } from '@mui/material';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, cleanup } from '@testing-library/react';
import {
  useGetAdmissionCycleImpactQuery,
  useGetAdmissionCycleHistoryQuery,
} from 'src/redux/student/admissions/admission-cycles-api';

import { AdmissionCycleDetailsDialog } from './admission-cycle-details-dialog';

const toast = vi.hoisted(() => ({
  error: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string) => AlertProps }) => 'error-id'
  ),
  warning: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string) => AlertProps }) => 'warning-id'
  ),
  dismiss: vi.fn(),
}));

vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

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

function renderDialog(onClose = vi.fn()) {
  const store = configureStore({ reducer: { confirmPopup } });
  const view = (selectedCycle: AdmissionCycle | null) => (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionCycleDetailsDialog cycle={selectedCycle} onClose={onClose} />
      </ThemeProvider>
    </Provider>
  );
  const result = render(view(cycle));
  return {
    ...result,
    rerenderCycle: (selectedCycle: AdmissionCycle | null) => result.rerender(view(selectedCycle)),
  };
}

describe('Admission cycle details dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    cleanup();
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
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

  it('keeps the dialog usable while loading and announces failed requests once by toast', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    setImpact({ isLoading: true, isError: false });
    setHistory({ isLoading: true, isError: false });

    const view = renderDialog(onClose);
    expect(screen.getByLabelText('Loading linked offerings')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading activity history')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
    expect(
      screen.queryByText('No activity has been recorded for this period yet.')
    ).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();

    setImpact({ isLoading: false, isError: true });
    setHistory({ isLoading: false, isError: true });
    view.rerenderCycle(cycle);
    view.rerenderCycle(cycle);

    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Current usage could not be refreshed. Showing available counts.',
      })
    );
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Activity history could not be loaded.',
      })
    );
    expect(toast.warning).not.toHaveBeenCalled();
    expect(screen.queryByText(/Current usage could not be refreshed/)).not.toBeInTheDocument();
    expect(screen.queryByText('Activity history could not be loaded.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry|reload/i })).not.toBeInTheDocument();
    expect(
      screen.queryByText('No activity has been recorded for this period yet.')
    ).not.toBeInTheDocument();
    const usage = within(screen.getByRole('region', { name: 'Usage' }));
    ['6', '2', '1', '—'].forEach((count) => {
      expect(usage.getByText(count)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps failed history hidden even when cached data exists', () => {
    setImpact({ isLoading: false, isError: false });
    setHistory({
      data: [
        {
          id: 'stale-event',
          description: 'Cached activity',
          occurredAt: '2026-09-29T06:05:00+05:30',
        },
      ],
      isLoading: false,
      isError: true,
    });
    renderDialog();

    expect(toast.error).toHaveBeenCalledOnce();
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Activity history could not be loaded.' })
    );
    expect(screen.queryByText('Cached activity')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No activity has been recorded for this period yet.')
    ).not.toBeInTheDocument();
  });

  it('shows empty history only after a successful empty response', () => {
    setImpact({ isLoading: false, isError: false });
    setHistory({ data: [], isLoading: false, isError: false });
    renderDialog();

    expect(
      screen.getByText('No activity has been recorded for this period yet.')
    ).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it('supports closing and reopening after a failed request', async () => {
    setImpact({ isLoading: false, isError: false });
    setHistory({ isLoading: false, isError: true });
    const view = renderDialog();
    expect(toast.error).toHaveBeenCalledOnce();

    view.rerenderCycle(null);
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useGetAdmissionCycleHistoryQuery).toHaveBeenLastCalledWith('', { skip: true });
    view.rerenderCycle(cycle);

    expect(screen.getByRole('dialog', { name: 'Admission period details' })).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(useGetAdmissionCycleHistoryQuery).toHaveBeenLastCalledWith(cycle.id, { skip: false });
  });
});
