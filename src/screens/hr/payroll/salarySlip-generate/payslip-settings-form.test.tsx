import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import PayslipSettingsForm from './payslip-settings-form';

const state = vi.hoisted(() => ({
  query: {
    data: { schoolName: 'Original school', schoolAddress: 'Original address', automaticEmail: false,
      concurrencyStamp: 'version-1', idempotencyKey: 'request-1' },
    isError: false,
    refetch: vi.fn(),
  },
  save: vi.fn(),
}));

vi.mock('src/redux/hr/payslip-api', () => ({
  useGetPayslipSettingsQuery: () => state.query,
  useSavePayslipSettingsMutation: () => [state.save, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ requestNavigation: (proceed: () => void) => proceed(), confirmation: null }),
}));

describe('payslip settings background refresh', () => {
  beforeEach(() => {
    state.query.data = { schoolName: 'Original school', schoolAddress: 'Original address', automaticEmail: false,
      concurrencyStamp: 'version-1', idempotencyKey: 'request-1' };
    state.save.mockReset();
  });
  afterEach(cleanup);

  it('adopts refreshed server settings while the form is clean', async () => {
    const view = render(<PayslipSettingsForm canEdit />);
    state.query.data = { ...state.query.data, schoolName: 'Updated school', concurrencyStamp: 'version-2' };
    view.rerender(<PayslipSettingsForm canEdit />);
    await waitFor(() => expect(screen.getByLabelText('School name')).toHaveValue('Updated school'));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('preserves an unsaved draft when refreshed server settings arrive', () => {
    const view = render(<PayslipSettingsForm canEdit />);
    fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'My unsaved draft' } });
    state.query.data = { ...state.query.data, schoolName: 'Updated school', concurrencyStamp: 'version-2' };
    view.rerender(<PayslipSettingsForm canEdit />);
    expect(screen.getByLabelText('School name')).toHaveValue('My unsaved draft');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('discarding a preserved draft restores the latest server values', async () => {
    const view = render(<PayslipSettingsForm canEdit />);
    fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'My unsaved draft' } });
    state.query.data = { ...state.query.data, schoolName: 'Updated school', concurrencyStamp: 'version-2' };
    view.rerender(<PayslipSettingsForm canEdit />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.getByLabelText('School name')).toHaveValue('Updated school'));
  });

  it('preserves a failed write and retries the same payload with the same key', async () => {
    state.save.mockReturnValueOnce({ unwrap: () => Promise.reject(Object.assign(new Error('Synthetic write failure'), { data: { error: { message: 'Synthetic write failure' } } })) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ ...state.query.data, schoolName: 'My unsaved draft', concurrencyStamp: 'version-3' }) });
    render(<PayslipSettingsForm canEdit />);
    fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'My unsaved draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
    expect(screen.getByLabelText('School name')).toHaveValue('My unsaved draft');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledTimes(2));
    expect(state.save.mock.calls[1][0]).toEqual(state.save.mock.calls[0][0]);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
  });

  it('keeps the draft concurrency token until discard instead of silently overwriting a server edit', async () => {
    state.save.mockReturnValue({ unwrap: () => Promise.reject(new Error('Conflict')) });
    const view = render(<PayslipSettingsForm canEdit />);
    fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'My unsaved draft' } });
    state.query.data = { ...state.query.data, schoolName: 'Updated school', concurrencyStamp: 'version-2' };
    view.rerender(<PayslipSettingsForm canEdit />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    expect(state.save.mock.calls[0][0].concurrencyStamp).toBe('version-1');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.getByLabelText('School name')).toHaveValue('Updated school'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('does not roll back an acknowledged save to a refresh observed while saving', async () => {
    let finishSave!: (value: typeof state.query.data) => void;
    state.save.mockReturnValue({ unwrap: () => new Promise<typeof state.query.data>((resolve) => { finishSave = resolve; }) });
    const view = render(<PayslipSettingsForm canEdit />);
    fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'My saved school' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
    // A same-value clone models the independently reported component reproduction.
    state.query.data = { ...state.query.data };
    view.rerender(<PayslipSettingsForm canEdit />);
    finishSave({ ...state.query.data, schoolName: 'My saved school', concurrencyStamp: 'version-2', idempotencyKey: 'saved-request' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
    expect(screen.getByLabelText('School name')).toHaveValue('My saved school');
  });
});

