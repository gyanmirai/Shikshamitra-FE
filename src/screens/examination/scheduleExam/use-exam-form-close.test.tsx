import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { useExamFormClose } from './use-exam-form-close';

const mocks = vi.hoisted(() => ({ dispatch: vi.fn(), push: vi.fn(), close: vi.fn() }));
vi.mock('react-redux', () => ({ useDispatch: () => mocks.dispatch }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

function Harness({ busy = false }: { busy?: boolean }) {
  const { handleClose, confirmation } = useExamFormClose(true, true, mocks.close, busy);
  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        Leave exam
      </button>
      <button type="button" onClick={() => handleClose(null, true)}>
        Complete exam
      </button>
      {confirmation}
    </>
  );
}

function renderForm(busy = false) {
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Harness busy={busy} />
    </ThemeProvider>
  );
}

beforeEach(() => vi.clearAllMocks());

it('preserves the draft when keeping editing and closes only after explicit discard', async () => {
  renderForm();
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Leave exam' }));
  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(mocks.close).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Leave exam' }));
  await user.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(mocks.close).toHaveBeenCalledOnce();
  expect(mocks.dispatch).toHaveBeenCalledWith({
    type: 'confirmPopup/setIsChanges',
    payload: false,
  });
});

it('blocks leaving while a step save is in flight', async () => {
  renderForm(true);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Leave exam' }));
  expect(mocks.close).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('clears the dirty flag after successful completion without a discard prompt', async () => {
  renderForm();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Complete exam' }));
  expect(mocks.close).toHaveBeenCalledOnce();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
