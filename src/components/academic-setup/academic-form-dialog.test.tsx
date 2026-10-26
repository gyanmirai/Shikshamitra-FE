import { useState } from 'react';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { MediumForm } from './medium-form';
import { AcademicFormDialog } from './academic-form-dialog';
import { renderAcademicOrder, createAcademicOrderStore } from './academic-order-test-utils';

const mocks = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
  return { mutate: vi.fn(), busy: false };
});
let store: ReturnType<typeof createAcademicOrderStore>;
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [mocks.mutate, { isLoading: mocks.busy }],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));

function Fixture({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(true);
  const close = () => {
    setOpen(false);
    onClose();
  };
  return (
    <AcademicFormDialog kind="medium" title="Add Medium" open={open} handleClose={close}>
      <MediumForm boardId="board-1" editData={null} handleClose={close} />
    </AcademicFormDialog>
  );
}

function setup() {
  const onClose = vi.fn();
  renderAcademicOrder(<Fixture onClose={onClose} />, store);
  return onClose;
}

beforeEach(() => {
  vi.clearAllMocks();
  store = createAcademicOrderStore();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-field-formatting', () =>
      HttpResponse.json({
        board: 0,
        medium: 0,
        stage: 0,
        standard: 0,
        division: 0,
      })
    )
  );
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
  mocks.busy = false;
  mocks.mutate.mockReturnValue({ unwrap: async () => ({}) });
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.unstubAllGlobals();
});

describe('Academic hierarchy form close ownership', () => {
  it.each(['Cancel', 'close', 'Escape'])(
    'preserves the draft on %s until discard is chosen',
    async (control) => {
      const close = setup();
      fireEvent.change(screen.getByRole('textbox', { name: /Medium name/ }), {
        target: { value: 'UI review draft' },
      });
      const requestClose = () => {
        if (control === 'Escape') {
          fireEvent.keyDown(screen.getByRole('dialog', { name: 'Add Medium' }), { key: 'Escape' });
        } else fireEvent.click(screen.getByRole('button', { name: control }));
      };
      requestClose();
      expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
      expect(close).not.toHaveBeenCalled();
      if (control === 'Escape') {
        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' }), {
          key: 'Escape',
        });
      } else fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
      expect(screen.getByRole('textbox', { name: /Medium name/ })).toHaveValue('UI review draft');
      requestClose();
      fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(close).toHaveBeenCalledOnce();
      expect(window.confirm).not.toHaveBeenCalled();
      expect(mocks.mutate).not.toHaveBeenCalled();
    }
  );

  it('closes an unchanged form directly and does not treat blur as an edit', async () => {
    const close = setup();
    fireEvent.blur(screen.getByRole('textbox', { name: /Medium name/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(close).toHaveBeenCalledOnce();
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('closes after the existing confirmed save without another discard decision', async () => {
    const close = setup();
    fireEvent.change(screen.getByRole('textbox', { name: /Medium name/ }), {
      target: { value: 'English' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    const confirmation = await screen.findByRole('dialog', { name: 'Create Medium' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(close).toHaveBeenCalledOnce();
    expect(mocks.mutate).toHaveBeenCalledExactlyOnceWith({
      name: 'English',
      educationBoardId: 'board-1',
    });
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('locks footer and shell close controls during a save', () => {
    mocks.busy = true;
    const close = setup();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Add Medium' }), { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
  });
});
