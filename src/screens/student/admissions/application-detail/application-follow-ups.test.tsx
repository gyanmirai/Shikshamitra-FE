import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationFollowUps } from './application-follow-ups';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  schedule: vi.fn(),
  complete: vi.fn(),
  cancel: vi.fn(),
  refetch: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock('src/redux/student/admissions/admission-application-follow-ups-api', () => ({
  useGetAdmissionApplicationFollowUpsQuery: mocks.query,
  useScheduleAdmissionApplicationFollowUpMutation: () => [mocks.schedule, { isLoading: false }],
  useCompleteAdmissionApplicationFollowUpMutation: () => [mocks.complete, { isLoading: false }],
  useCancelAdmissionApplicationFollowUpMutation: () => [mocks.cancel, { isLoading: false }],
}));
vi.mock('src/redux/student/admissions/admission-inquiry-management-api', () => ({}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: mocks.success, error: mocks.error },
}));
const followUp = {
  id: 'follow-up-1',
  purpose: 'Call parent',
  status: 0,
  scheduledAt: '2026-10-08T10:00:00+05:30',
  concurrencyStamp: 'follow-up-stamp',
};
const value = {
  inquiryId: 'inquiry-1',
  concurrencyStamp: 'inquiry-stamp',
  isLocked: true,
  canManageFollowUps: true,
  followUps: [followUp],
};
const query = (extra = {}) => ({
  currentData: value,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: mocks.refetch,
  ...extra,
});

describe('application follow-ups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockReturnValue(query());
    [mocks.schedule, mocks.complete, mocks.cancel].forEach((mutation) =>
      mutation.mockReturnValue({ unwrap: () => Promise.resolve(value) })
    );
  });

  it('reads application scope and allows follow-ups despite the transferred inquiry edit lock', async () => {
    render(<ApplicationFollowUps applicationId="application-1" />);
    expect(mocks.query).toHaveBeenCalledWith('application-1', {
      skip: false,
      refetchOnMountOrArgChange: true,
    });
    fireEvent.change(screen.getByLabelText('Next follow-up *'), {
      target: { value: '2026-10-09T10:00' },
    });
    fireEvent.change(screen.getByLabelText('Purpose *'), {
      target: { value: ' Discuss documents ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule follow-up' }));
    await waitFor(() =>
      expect(mocks.schedule).toHaveBeenCalledWith({
        applicationId: 'application-1',
        concurrencyStamp: 'inquiry-stamp',
        scheduledAt: new Date('2026-10-09T10:00').toISOString(),
        purpose: 'Discuss documents',
      })
    );
  });

  it('completes a follow-up using inquiry and follow-up concurrency stamps', async () => {
    render(<ApplicationFollowUps applicationId="application-1" />);
    fireEvent.change(screen.getByLabelText('Completion or cancellation note *'), {
      target: { value: 'Parent confirmed' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    await waitFor(() =>
      expect(mocks.complete).toHaveBeenCalledWith({
        applicationId: 'application-1',
        followUpId: 'follow-up-1',
        concurrencyStamp: 'inquiry-stamp',
        followUpConcurrencyStamp: 'follow-up-stamp',
        note: 'Parent confirmed',
      })
    );
  });

  it('shows history while withholding all mutations when backend capability is false', () => {
    mocks.query.mockReturnValue(query({ currentData: { ...value, canManageFollowUps: false } }));
    render(<ApplicationFollowUps applicationId="application-1" />);
    expect(screen.getByText('Call parent')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Schedule follow-up' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('withholds stale follow-up controls on query failure and offers retry', () => {
    mocks.query.mockReturnValue(query({ isError: true }));
    render(<ApplicationFollowUps applicationId="application-1" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load application follow-ups');
    expect(screen.queryByText('Call parent')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it('locks controls while refreshing the current inquiry concurrency stamp', () => {
    mocks.query.mockReturnValue(query({ isFetching: true }));
    render(<ApplicationFollowUps applicationId="application-1" />);
    expect(screen.getByLabelText('Purpose *')).toBeDisabled();
    expect(screen.getByLabelText('Completion or cancellation note *')).toBeDisabled();
  });

  it('shows a missing source reason without suggesting an ineffective retry', () => {
    mocks.query.mockReturnValue(
      query({
        isError: true,
        error: {
          status: 404,
          data: { detail: 'The linked source inquiry no longer exists.' },
        },
      })
    );
    render(<ApplicationFollowUps applicationId="application-1" />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The linked source inquiry no longer exists.'
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('keeps the business error reason visible when a linked source was removed', () => {
    mocks.query.mockReturnValue(
      query({
        isError: true,
        error: {
          status: 403,
          data: {
            error: {
              message:
                'The source inquiry is unavailable. Continue admission work in the application; follow-ups require its linked inquiry.',
            },
          },
        },
      })
    );
    render(<ApplicationFollowUps applicationId="application-1" />);
    expect(screen.getByRole('alert')).toHaveTextContent('The source inquiry is unavailable.');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('preserves entered values and reports the backend reason when scheduling fails', async () => {
    mocks.schedule.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('The inquiry changed.'), {
            data: { detail: 'The inquiry changed.' },
          })
        ),
    });
    render(<ApplicationFollowUps applicationId="application-1" />);
    fireEvent.change(screen.getByLabelText('Next follow-up *'), {
      target: { value: '2026-10-09T10:00' },
    });
    fireEvent.change(screen.getByLabelText('Purpose *'), { target: { value: 'Retry call' } });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule follow-up' }));
    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith({ message: 'The inquiry changed.' })
    );
    expect(screen.getByLabelText('Purpose *')).toHaveValue('Retry call');
  });
});
