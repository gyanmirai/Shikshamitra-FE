import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderWithProviders } from 'src/test/test-utils';
import { vi, it, expect, describe, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from '.';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('custom dialog close guard', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the supplied submit handler on the dialog form', () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    renderWithProviders(
      <CustomDialog
        open
        title="Submit form"
        handleClose={vi.fn()}
        formProps={{ onSubmit, noValidate: true }}
      >
        <button type="submit">Submit</button>
      </CustomDialog>
    );

    const form = screen.getByRole('button', { name: 'Submit' }).closest('form');
    expect(form).toHaveAttribute('novalidate');
    fireEvent.submit(form!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('keeps the dialog title accessible when header guidance is available', async () => {
    renderWithProviders(
      <CustomDialog
        open
        title="Review Readiness Rule"
        titleInfo="This preview shows your unsaved rule."
        handleClose={vi.fn()}
      >
        <div>Rule summary</div>
      </CustomDialog>
    );

    expect(screen.getByRole('dialog', { name: 'Review Readiness Rule' })).toBeInTheDocument();
    const info = screen.getByRole('button', { name: 'Review Readiness Rule information' });
    fireEvent.mouseOver(info);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This preview shows your unsaved rule.'
    );
  });

  it('uses local dirty state for header close and keeps edits when discard is declined', async () => {
    const handleClose = vi.fn();
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);
    renderWithProviders(
      <CustomDialog open title="Local form" hasUnsavedChanges handleClose={handleClose}>
        <div>Edited form</div>
      </CustomDialog>
    );
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(confirm).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(handleClose).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Local form' })).toBeVisible());
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Local form' }), {
      key: 'Escape',
      code: 'Escape',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
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
    if (dirty) fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(handleClose).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
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
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
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
