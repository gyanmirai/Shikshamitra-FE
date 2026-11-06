import { Provider } from 'react-redux';
import { vi, it, expect } from 'vitest';
import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { CollectLaterDialog } from './collect-later-dialog';

[GlobalIcons.admissionDetails, GlobalIcons.cancel, GlobalIcons.submit, GlobalIcons.delete].forEach(
  (icon) => addIcon(icon, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 })
);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock('@mui/icons-material', async () => ({
  Close: (await import('@mui/icons-material/Close')).default,
}));

const renderDialog = (onSubmit = vi.fn().mockResolvedValue(true), onClose = vi.fn()) => {
  render(
    <Provider store={configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } })}>
      <CollectLaterDialog busy={false} onClose={onClose} onSubmit={onSubmit} />
    </Provider>
  );
  return { onSubmit, onClose };
};

it('rejects an empty or whitespace-only reason', async () => {
  const { onSubmit, onClose } = renderDialog();
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), { target: { value: '   ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Enter a reason for collecting later.')).toBeVisible();
  expect(onSubmit).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it('keeps a deferral reason until the user explicitly discards it', () => {
  const { onClose, onSubmit } = renderDialog();
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), {
    target: { value: 'Parent requested collection next week.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: /Reason/ })).toHaveValue(
    'Parent requested collection next week.'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
});

it('submits one trimmed reason while duplicate clicks are blocked', async () => {
  let finish!: (value: boolean) => void;
  const callback = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      })
  );
  const { onClose } = renderDialog(callback);
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), {
    target: { value: '  Pay after confirmation.  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(callback).toHaveBeenCalledOnce());
  expect(callback).toHaveBeenCalledWith('Pay after confirmation.');
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await act(async () => finish(true));
  expect(onClose).toHaveBeenCalledOnce();
});

it('preserves the reason and permits retry after failure', async () => {
  const callback = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const { onClose } = renderDialog(callback);
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), {
    target: { value: 'Payment pending.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(/Your reason is preserved/)).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Reason/ })).toHaveValue('Payment pending.');
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(callback).toHaveBeenCalledTimes(2);
});
