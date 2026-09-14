import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderWithProviders } from 'src/test/test-utils';
import { vi, it, expect, describe, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from '.';

describe('custom dialog close guard', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses local dirty state for header close and keeps edits when discard is declined', () => {
    const handleClose = vi.fn();
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);
    renderWithProviders(
      <CustomDialog open title="Local form" hasUnsavedChanges handleClose={handleClose}>
        <div>Edited form</div>
      </CustomDialog>
    );
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(handleClose).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it.each([false, true])('does not consume parent dirty state when local dirty is %s', (dirty) => {
    const store = configureStore({
      reducer: { confirmPopup },
      preloadedState: {
        confirmPopup: { isChanges: true, currentRoute: '', nextRoute: '', dialog: false },
      },
    });
    const confirm = vi.fn().mockReturnValue(true);
    vi.stubGlobal('confirm', confirm);
    const handleClose = vi.fn();
    render(
      <Provider store={store}>
        <CustomDialog open title="Nested form" hasUnsavedChanges={dirty} handleClose={handleClose}>
          <div>Nested form</div>
        </CustomDialog>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(handleClose).toHaveBeenCalledOnce();
    expect(confirm).toHaveBeenCalledTimes(dirty ? 1 : 0);
    expect(store.getState().confirmPopup.isChanges).toBe(true);
  });

  it('retains the existing global dirty guard when local state is omitted', () => {
    const handleClose = vi.fn();
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);
    renderWithProviders(
      <CustomDialog open title="Existing form" handleClose={handleClose}>
        <div>Existing form</div>
      </CustomDialog>,
      { preloadedState: { confirmPopup: { isChanges: true } } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('registers an unload warning only while the local form is dirty', () => {
    const { rerender } = renderWithProviders(
      <CustomDialog open title="Clean form" hasUnsavedChanges={false} handleClose={vi.fn()}>
        <div>Clean</div>
      </CustomDialog>
    );
    const clean = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);
    rerender(
      <CustomDialog open title="Dirty form" hasUnsavedChanges handleClose={vi.fn()}>
        <div>Dirty</div>
      </CustomDialog>
    );
    const dirty = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
  });

  it('disables the close control and Escape dismissal during a critical save', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <CustomDialog
        open
        disableClose
        hasForm={false}
        title="Finalizing employee"
        handleClose={handleClose}
      >
        <div>Saving</div>
      </CustomDialog>
    );

    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });
});
