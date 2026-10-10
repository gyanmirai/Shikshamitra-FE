import dayjs from 'dayjs';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationFollowUps } from './application-follow-ups';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  schedule: vi.fn(),
  complete: vi.fn(),
  cancel: vi.fn(),
  refetch: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  scheduling: { isLoading: false },
}));
vi.mock('src/redux/student/admissions/admission-application-follow-ups-api', () => ({
  useGetAdmissionApplicationFollowUpsQuery: mocks.query,
  useScheduleAdmissionApplicationFollowUpMutation: () => [mocks.schedule, mocks.scheduling],
  useCompleteAdmissionApplicationFollowUpMutation: () => [mocks.complete, { isLoading: false }],
  useCancelAdmissionApplicationFollowUpMutation: () => [mocks.cancel, { isLoading: false }],
}));
vi.mock('src/redux/student/admissions/admission-inquiry-management-api', () => ({}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
// Picker interaction is verified in the browser; these tests cover application payloads and locks.
vi.mock('@mui/x-date-pickers', () => ({
  DateTimePicker: ({
    label,
    value,
    disabled,
    onChange,
  }: {
    label: string;
    value: dayjs.Dayjs | null;
    disabled: boolean;
    onChange: (value: dayjs.Dayjs | null) => void;
  }) => (
    <input
      type="datetime-local"
      aria-label={`${label} *`}
      disabled={disabled}
      value={value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : ''}
      onChange={(event) => onChange(event.target.value ? dayjs(event.target.value) : null)}
    />
  ),
}));
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
    mocks.scheduling.isLoading = false;
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

  it('opens the compact scheduler on demand and reveals existing cancel commands through history', async () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationFollowUps applicationId="application-1" compact />
      </ThemeProvider>
    );
    expect(screen.getByLabelText('Purpose *')).not.toBeVisible();
    const trigger = screen.getByRole('button', { name: 'Schedule follow-up' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Schedule follow-up' });
    expect(within(dialog).getByLabelText('Purpose *')).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('button', { name: 'Schedule' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Call parent')).not.toBeVisible();
    const history = screen.getByRole('button', { name: 'Follow-up history' });
    expect(history).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(history);
    await waitFor(() => expect(screen.getByText('Call parent')).toBeVisible());
    expect(history).toHaveAttribute('aria-expanded', 'true');
    fireEvent.change(screen.getByLabelText('Completion or cancellation note *'), {
      target: { value: 'Parent requested a new date' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(mocks.cancel).toHaveBeenCalledWith({
        applicationId: 'application-1',
        followUpId: 'follow-up-1',
        concurrencyStamp: 'inquiry-stamp',
        followUpConcurrencyStamp: 'follow-up-stamp',
        note: 'Parent requested a new date',
      })
    );
  });

  it('keeps compact history read-only when backend management capability is false', async () => {
    mocks.query.mockReturnValue(query({ currentData: { ...value, canManageFollowUps: false } }));
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationFollowUps applicationId="application-1" compact />
      </ThemeProvider>
    );
    expect(screen.queryByLabelText('Purpose *')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Follow-up history' }));
    await waitFor(() => expect(screen.getByText('Call parent')).toBeVisible());
    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('reports pending follow-up work and lets its initiating request finish through the workspace lock', async () => {
    let finish: () => void = () => undefined;
    const pending = new Promise((resolve) => {
      finish = () => resolve(value);
    });
    mocks.schedule.mockReturnValue({ unwrap: () => pending });
    const onBusyChange = vi.fn();
    const content = (disabled = false) => (
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationFollowUps
          applicationId="application-1"
          compact
          disabled={disabled}
          onBusyChange={onBusyChange}
        />
      </ThemeProvider>
    );
    const view = render(content());
    fireEvent.click(screen.getByRole('button', { name: 'Schedule follow-up' }));
    fireEvent.change(screen.getByLabelText('Next follow-up *'), {
      target: { value: '2026-10-10T10:00' },
    });
    fireEvent.change(screen.getByLabelText('Purpose *'), {
      target: { value: 'Documents reminder' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(mocks.schedule).toHaveBeenCalledOnce();
    mocks.scheduling.isLoading = true;
    view.rerender(content(true));
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByLabelText('Purpose *')).toBeDisabled();
    finish();
    await waitFor(() =>
      expect(mocks.success).toHaveBeenCalledWith({ message: 'Follow-up scheduled' })
    );
    expect(screen.getByLabelText('Purpose *')).toHaveValue('');
    mocks.scheduling.isLoading = false;
    view.rerender(content());
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
    view.unmount();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });

  it('preserves the popover draft across closing and failed scheduling, then closes on success', async () => {
    mocks.schedule.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('The inquiry changed.'), {
            data: { detail: 'The inquiry changed.' },
          })
        ),
    });
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationFollowUps applicationId="application-1" compact />
      </ThemeProvider>
    );
    const trigger = screen.getByRole('button', { name: 'Schedule follow-up' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Schedule follow-up' });
    fireEvent.change(within(dialog).getByLabelText('Next follow-up *'), {
      target: { value: '2026-10-11T10:00' },
    });
    fireEvent.change(within(dialog).getByLabelText('Purpose *'), {
      target: { value: ' Discuss documents ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(dialog).not.toBeVisible());
    fireEvent.click(trigger);
    expect(within(dialog).getByLabelText('Purpose *')).toHaveValue(' Discuss documents ');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Schedule' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('The inquiry changed.');
    expect(within(dialog).getByLabelText('Purpose *')).toHaveValue(' Discuss documents ');
    mocks.schedule.mockReturnValue({ unwrap: () => Promise.resolve(value) });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Schedule' }));
    await waitFor(() => expect(dialog).not.toBeVisible());
    expect(mocks.schedule).toHaveBeenLastCalledWith({
      applicationId: 'application-1',
      concurrencyStamp: 'inquiry-stamp',
      scheduledAt: new Date('2026-10-11T10:00').toISOString(),
      purpose: 'Discuss documents',
    });
  });
});
