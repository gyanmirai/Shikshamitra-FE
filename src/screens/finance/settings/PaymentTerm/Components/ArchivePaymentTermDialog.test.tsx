import { it, vi, expect } from 'vitest';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { ArchivePaymentTermDialog } from './ArchivePaymentTermDialog';

vi.mock('react-redux', () => ({
  useSelector: () => ({ isChanges: false }),
  useDispatch: () => vi.fn(),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('shows the record and consequence, and dismisses through the header close control', () => {
  const onClose = vi.fn();
  render(
    <ArchivePaymentTermDialog name="One Time Payment" onClose={onClose} onArchive={vi.fn()} />
  );

  const dialog = within(screen.getByRole('dialog', { name: 'Archive Payment Term' }));
  expect(dialog.getByText('One Time Payment')).toBeInTheDocument();
  expect(
    dialog.getByText('Will no longer be available for new fee structures.')
  ).toBeInTheDocument();
  expect(dialog.getByRole('textbox', { name: /Archive reason/ })).toBeRequired();
  expect(dialog.getByRole('button', { name: 'Archive' })).toBeDisabled();
  fireEvent.click(dialog.getByRole('button', { name: 'close' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('rejects whitespace and submits a trimmed reason while locking dismissal during the request', async () => {
  const onClose = vi.fn();
  let finish!: () => void;
  const onArchive = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  render(
    <ArchivePaymentTermDialog name="One Time Payment" onClose={onClose} onArchive={onArchive} />
  );

  const dialog = within(screen.getByRole('dialog', { name: 'Archive Payment Term' }));
  const reason = dialog.getByRole('textbox', { name: /Archive reason/ });
  const archive = dialog.getByRole('button', { name: 'Archive' });
  fireEvent.change(reason, { target: { value: '   ' } });
  expect(archive).toBeDisabled();

  fireEvent.change(reason, { target: { value: ' Replaced by annual schedule ' } });
  await waitFor(() => expect(archive).toBeEnabled());
  fireEvent.click(archive);
  await waitFor(() =>
    expect(onArchive).toHaveBeenCalledExactlyOnceWith('Replaced by annual schedule')
  );
  expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(dialog.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.keyDown(reason, { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();

  await act(async () => finish());
  expect(reason).toHaveValue(' Replaced by annual schedule ');
  expect(dialog.getByRole('button', { name: 'Cancel' })).toBeEnabled();
});
