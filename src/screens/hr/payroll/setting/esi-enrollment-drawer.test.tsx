import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { EsiEnrollmentDrawer } from './esi-enrollment-drawer';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  error: vi.fn(),
  fetching: false,
  data: {
    employeeId: 'employee-1',
    status: 'PendingReview',
    wageCeilingCategory: 'Standard',
    insuranceNumber: '1234567890',
    employerShareReliefEligible: false,
  } as any,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: mocks.error },
}));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  useGetEsiEnrollmentQuery: () => ({ currentData: mocks.data, isFetching: mocks.fetching }),
  useGetEsiOverridesQuery: () => ({ data: [] }),
  useUpdateEsiEnrollmentMutation: () => [mocks.save, { isLoading: false }],
}));
beforeEach(() => {
  mocks.save.mockReset();
  mocks.error.mockReset();
  mocks.fetching = false;
  mocks.data = {
    employeeId: 'employee-1',
    status: 'PendingReview',
    wageCeilingCategory: 'Standard',
    insuranceNumber: '1234567890',
    employerShareReliefEligible: false,
  };
});
function setup(onSaved = async () => undefined) {
  const close = vi.fn();
  const store = configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } });
  const view = () => (
    <Provider store={store}>
      <EsiEnrollmentDrawer
        open
        employee={{
          employeeId: 'employee-1',
          employeeName: 'Review Employee',
          employeeIdentifier: 'E1',
        }}
        canManageEnrollment
        canApproveOverride={false}
        onClose={close}
        onSaved={onSaved}
      />
    </Provider>
  );
  const result = render(view());
  return { close, ...result, refresh: () => result.rerender(view()) };
}
function edit() {
  fireEvent.change(screen.getByLabelText(/ESIC insurance number/), {
    target: { value: '9876543210' },
  });
}
it.each(['Close employee ESIC details', 'Cancel'])(
  'guards %s and retains edits when discard is declined',
  (name) => {
    const { close } = setup();
    edit();
    fireEvent.click(screen.getByRole('button', { name }));
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText(/ESIC insurance number/)).toHaveValue('9876543210');
    fireEvent.click(screen.getByRole('button', { name }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(close).toHaveBeenCalledOnce();
  }
);
it('closes a clean form without confirmation', () => {
  const { close } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledOnce();
});
it('blocks dismissal during initial loading', () => {
  mocks.data = undefined;
  mocks.fetching = true;
  const { close } = setup();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Close employee ESIC details' })).toBeDisabled();
  fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
  expect(close).not.toHaveBeenCalled();
});
it('preserves edits when background data refreshes', () => {
  const { refresh } = setup();
  edit();
  mocks.data = { ...mocks.data, insuranceNumber: '2222222222' };
  mocks.fetching = true;
  refresh();
  expect(screen.getByLabelText(/ESIC insurance number/)).toHaveValue('9876543210');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('button', { name: 'Keep editing' })).toBeVisible();
});
it('blocks competing saves and dismissal until a save finishes', async () => {
  let finish!: (value: unknown) => void;
  const pending = new Promise((resolve) => {
    finish = resolve;
  });
  mocks.save.mockReturnValue({ unwrap: () => pending });
  const { close } = setup();
  edit();
  const save = screen.getByRole('button', { name: 'Save enrollment' });
  fireEvent.click(save);
  expect(save).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
  fireEvent.click(save);
  expect(close).not.toHaveBeenCalled();
  expect(mocks.save).toHaveBeenCalledOnce();
  finish({});
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
});
it.each(['escape', 'backdrop'])('guards %s dismissal', (method) => {
  const { close } = setup();
  edit();
  if (method === 'escape')
    fireEvent.keyDown(screen.getByLabelText(/ESIC insurance number/), { key: 'Escape' });
  else fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Keep editing' })).toBeVisible();
});
it('preserves the draft after a failed save', async () => {
  mocks.save.mockReturnValue({ unwrap: () => Promise.reject(new Error('offline')) });
  const { close } = setup();
  edit();
  fireEvent.click(screen.getByRole('button', { name: 'Save enrollment' }));
  await waitFor(() => expect(mocks.error).toHaveBeenCalledOnce());
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/ESIC insurance number/)).toHaveValue('9876543210');
});
it('closes after success even when the follow-up refresh fails', async () => {
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  const { close } = setup(async () => {
    throw new Error('refresh failed');
  });
  edit();
  fireEvent.click(screen.getByRole('button', { name: 'Save enrollment' }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(screen.queryByRole('button', { name: 'Discard changes' })).not.toBeInTheDocument();
  expect(mocks.error).toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringContaining('Enrollment saved.') })
  );
});
