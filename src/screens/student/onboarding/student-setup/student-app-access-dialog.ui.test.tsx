import { vi, it, expect, beforeEach } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentAppAccessDialog from './student-app-access-dialog';

const state = vi.hoisted(() => ({
  enable: vi.fn(),
  close: vi.fn(),
  saved: vi.fn(),
  success: vi.fn(),
  busy: false,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: any) => select({ confirmPopup: { isChanges: false } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: state.success } }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useEnableStudentAppAccessMutation: () => [state.enable, { isLoading: state.busy }],
}));

const panel = () => (
  <ThemeProvider theme={createTheme()}>
    <StudentAppAccessDialog
      caseId="case-1"
      caseLabel="Jay Patel"
      concurrencyStamp="case-stamp"
      onClose={state.close}
      onSaved={state.saved}
    />
  </ThemeProvider>
);
beforeEach(() => {
  vi.clearAllMocks();
  state.busy = false;
});

it('validates the reason and enables only the current case without sending credentials', async () => {
  state.enable.mockReturnValue({ unwrap: async () => ({}) });
  render(panel());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Enter a correction reason.')).toBeVisible();
  expect(state.enable).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
    target: { value: ' Student requested access ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.close).toHaveBeenCalledOnce());
  expect(state.enable).toHaveBeenCalledExactlyOnceWith({
    id: 'case-1',
    reason: 'Student requested access',
    concurrencyStamp: 'case-stamp',
  });
  expect(state.saved).toHaveBeenCalledOnce();
});

it('retains the draft on failure and uses the shared discard confirmation', async () => {
  state.enable.mockReturnValue({
    unwrap: async () => {
      throw new Error('offline');
    },
  });
  render(panel());
  const reason = screen.getByRole('textbox', { name: /Correction reason/ });
  fireEvent.change(reason, { target: { value: 'Student requested access' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Student login could not be enabled');
  expect(reason).toHaveValue('Student requested access');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByRole('button', { name: 'Keep editing' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(reason).toHaveValue('Student requested access');
  expect(state.close).not.toHaveBeenCalled();
});

it('locks close and submit while busy and ignores a stale completion after unmount', async () => {
  let finish!: () => void;
  state.enable.mockReturnValue({
    unwrap: () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  });
  const view = render(panel());
  fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
    target: { value: 'Student requested access' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.enable).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  view.unmount();
  finish();
  await waitFor(() => expect(state.saved).not.toHaveBeenCalled());
  expect(state.close).not.toHaveBeenCalled();
  expect(state.success).not.toHaveBeenCalled();
});
