import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';

import PayrollComponentDialog from './PayrollComponentDialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({
    data: {
      items: [
        { _id: 'basic', earningComponentName: 'Basic salary' },
        { _id: 'travel', earningComponentName: 'Travel allowance' },
      ],
    },
    isLoading: false,
  }),
}));

it('selects and deselects all through the listbox keyboard contract, then submits once', async () => {
  const user = userEvent.setup();
  const add = vi.fn();
  const close = vi.fn();
  renderWithProviders(<PayrollComponentDialog open type="earning" onAdd={add} onClose={close} />);
  const input = screen.getByRole('combobox', { name: 'Components *' });
  input.focus();
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  await waitFor(() => expect(screen.getByText('2 selected')).toBeInTheDocument());
  expect(add).not.toHaveBeenCalled();
  await user.keyboard('{Home}{Enter}');
  await waitFor(() => expect(screen.queryByText('2 selected')).not.toBeInTheDocument());
  await user.keyboard('{Home}{Enter}{Escape}');
  await waitFor(() => expect(screen.getByText('2 selected')).toBeInTheDocument());
  expect(close).not.toHaveBeenCalled();
  const submit = screen.getByRole('button', { name: 'Submit' });
  submit.focus();
  await user.keyboard(' ');
  await waitFor(() => expect(add).toHaveBeenCalledOnce());
  expect(add.mock.calls[0][0]).toHaveLength(2);
  expect(close).toHaveBeenCalledOnce();
});
