import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import PayslipSettingsForm from './payslip-settings-form';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./payslip-settings-preview', () => ({ default: () => <div>Sample preview</div> }));

const state = vi.hoisted(() => ({
  query: {
    data: {
      schoolName: 'Institute school',
      schoolAddress: 'Institute address',
      automaticEmail: false,
      concurrencyStamp: 'version-1',
      idempotencyKey: 'request-1',
    },
    isError: false,
    refetch: vi.fn(),
  },
  save: vi.fn(),
}));
vi.mock('src/redux/hr/payslip-api', async (original) => ({
  ...(await original<typeof import('src/redux/hr/payslip-api')>()),
  useGetPayslipSettingsQuery: () => state.query,
  useSavePayslipSettingsMutation: () => [state.save, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({
    requestNavigation: (proceed: () => void) => proceed(),
    confirmation: null,
  }),
}));
const email = () =>
  screen.getByRole('switch', { name: 'Email each employee after payroll finalization' });
const save = () => screen.getByRole('button', { name: 'Save' });

describe('payroll document settings', () => {
  beforeEach(() => {
    state.query.data = {
      schoolName: 'Institute school',
      schoolAddress: 'Institute address',
      automaticEmail: false,
      concurrencyStamp: 'version-1',
      idempotencyKey: 'request-1',
    };
    state.query.isError = false;
    state.save.mockReset();
  });
  afterEach(cleanup);

  it('uses Institute Setup details without editable identity or payroll logo upload', () => {
    render(<PayslipSettingsForm canEdit />);
    expect(screen.getByText('Institute school')).toBeVisible();
    expect(screen.getByText('Institute address')).toBeVisible();
    expect(screen.queryByLabelText('School name')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('School address')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Upload.*logo/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Institute Setup' })).toHaveAttribute(
      'href',
      '/setting/school-identity'
    );
  });

  it('adopts a completed refresh while clean', async () => {
    const view = render(<PayslipSettingsForm canEdit />);
    state.query.data = { ...state.query.data, automaticEmail: true, concurrencyStamp: 'version-2' };
    view.rerender(<PayslipSettingsForm canEdit />);
    await waitFor(() => expect(email()).toBeChecked());
    expect(save()).toBeDisabled();
  });

  it('preserves the draft and concurrency token until discard, then restores latest server settings', async () => {
    state.save.mockReturnValue({ unwrap: () => vi.fn().mockRejectedValue({ status: 409 })() });
    const view = render(<PayslipSettingsForm canEdit />);
    fireEvent.click(email());
    state.query.data = {
      ...state.query.data,
      schoolName: 'Changed in Institute Setup',
      concurrencyStamp: 'version-2',
    };
    view.rerender(<PayslipSettingsForm canEdit />);
    expect(email()).toBeChecked();
    expect(screen.getByText('Changed in Institute Setup')).toBeVisible();
    fireEvent.click(save());
    await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
    expect(state.save.mock.calls[0][0].concurrencyStamp).toBe('version-1');
    expect(state.save.mock.calls[0][0]).not.toHaveProperty('schoolName');
    expect(state.save.mock.calls[0][0]).not.toHaveProperty('schoolAddress');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(email()).not.toBeChecked());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(save()).toBeDisabled();
  });

  it.each(['FETCH_ERROR', 'TIMEOUT_ERROR', 'PARSING_ERROR', 'empty'])(
    'keeps the draft and reuses the idempotency key after %s',
    async (status) => {
      state.save
        .mockReturnValueOnce({
          unwrap: () =>
            vi
              .fn()
              .mockRejectedValue(
                status === 'empty'
                  ? { status: 400, data: null }
                  : { status, error: 'TypeError: Failed to fetch' }
              )(),
        })
        .mockReturnValueOnce({
          unwrap: () =>
            Promise.resolve({
              ...state.query.data,
              automaticEmail: true,
              concurrencyStamp: 'version-2',
            }),
        });
      render(<PayslipSettingsForm canEdit />);
      fireEvent.click(email());
      fireEvent.click(save());
      expect(await screen.findByRole('alert')).toHaveTextContent(
        status === 'PARSING_ERROR'
          ? 'The server response could not be read. Try again.'
          : status === 'empty'
            ? 'Settings could not be saved. Try again.'
            : 'The request could not be confirmed. Check your connection and try again.'
      );
      expect(email()).toBeChecked();
      expect(screen.queryByText(/TypeError|Failed to fetch/)).not.toBeInTheDocument();
      fireEvent.click(save());
      await waitFor(() => expect(state.save).toHaveBeenCalledTimes(2));
      expect(state.save.mock.calls[1][0]).toEqual(state.save.mock.calls[0][0]);
      await waitFor(() => expect(save()).toBeDisabled());
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
  );

  it('keeps the acknowledged save after a refresh observed during the write', async () => {
    let finish!: (value: typeof state.query.data) => void;
    state.save.mockReturnValue({
      unwrap: () =>
        new Promise<typeof state.query.data>((resolve) => {
          finish = resolve;
        }),
    });
    const view = render(<PayslipSettingsForm canEdit />);
    fireEvent.click(email());
    fireEvent.click(save());
    await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
    state.query.data = { ...state.query.data };
    view.rerender(<PayslipSettingsForm canEdit />);
    await act(async () =>
      finish({ ...state.query.data, automaticEmail: true, concurrencyStamp: 'version-2' })
    );
    await waitFor(() => expect(save()).toBeDisabled());
    expect(email()).toBeChecked();
  });

  it('disables every editable setting for view-only access', () => {
    render(<PayslipSettingsForm canEdit={false} />);
    screen.getAllByRole('switch').forEach((control) => expect(control).toBeDisabled());
    expect(save()).toBeDisabled();
  });

  it('resets defaults as an unsaved draft and cancel restores the saved baseline', async () => {
    state.query.data = { ...state.query.data, automaticEmail: true };
    render(<PayslipSettingsForm canEdit />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset defaults' }));
    await waitFor(() => expect(email()).not.toBeChecked());
    expect(state.save).not.toHaveBeenCalled();
    expect(save()).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(email()).toBeChecked());
    expect(save()).toBeDisabled();
  });
});
