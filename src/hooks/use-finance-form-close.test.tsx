import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';

import { useFinanceFormClose } from './use-finance-form-close';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const storeFor = () =>
  configureStore({
    reducer: { confirmPopup },
    preloadedState: {
      confirmPopup: { isChanges: true, currentRoute: '', nextRoute: '', dialog: false },
    },
  });

function Fixture({
  open = true,
  busy = false,
  localDirty,
  close,
}: {
  open?: boolean;
  busy?: boolean;
  localDirty?: boolean;
  close: () => void;
}) {
  const { handleClose, confirmation } = useFinanceFormClose(open, close, busy, localDirty);
  return (
    <>
      <button onClick={() => handleClose()}>Close editor</button>
      {confirmation}
    </>
  );
}

it('clears a pending discard when its editor closes externally and does not resurrect it on reopen', () => {
  const store = storeFor();
  const close = vi.fn();
  const view = (open: boolean) => (
    <Provider store={store}>
      <Fixture open={open} localDirty close={close} />
    </Provider>
  );
  const { rerender } = render(view(true));
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
  rerender(view(false));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  expect(close).not.toHaveBeenCalled();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  rerender(view(true));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('clears its owned global dirty flag when its editor closes externally', () => {
  const store = storeFor();
  const close = vi.fn();
  const view = (open: boolean) => (
    <Provider store={store}>
      <Fixture open={open} close={close} />
    </Provider>
  );
  const { rerender } = render(view(true));
  rerender(view(false));
  expect(store.getState().confirmPopup.isChanges).toBe(false);
});

it('does not consume a parent dirty flag when the editor owns local form state', () => {
  const store = storeFor();
  const close = vi.fn();
  render(
    <Provider store={store}>
      <Fixture localDirty close={close} />
    </Provider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(close).toHaveBeenCalledOnce();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});

it('locks an already open discard confirmation when saving begins', () => {
  const store = storeFor();
  const close = vi.fn();
  const view = (busy: boolean) => (
    <Provider store={store}>
      <Fixture busy={busy} close={close} />
    </Provider>
  );
  const { rerender } = render(view(false));
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  rerender(view(true));
  expect(screen.getByRole('button', { name: 'Discard changes' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Keep editing' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(close).not.toHaveBeenCalled();
});
