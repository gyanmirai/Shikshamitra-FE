import { it, vi, expect, describe } from 'vitest';
import { Button, TextField } from '@mui/material';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import { ConfirmDialog } from './confirm-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('confirmation dismissal', () => {
  it('ignores the backdrop and routes Escape through safe cancellation', () => {
    const close = vi.fn();
    renderWithProviders(
      <ConfirmDialog
        open
        title="Archive category"
        onClose={close}
        content={<TextField label="Archive reason" defaultValue="Replaced this year" />}
        action={<Button>Archive</Button>}
      />
    );
    const dialog = screen.getByRole('dialog', { name: 'Archive category' });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.click(dialog.parentElement!);
    expect(close).not.toHaveBeenCalled();
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox')).toHaveValue('Replaced this year');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalledTimes(2);
  });

  it('locks cancellation and input during the action', () => {
    const close = vi.fn();
    renderWithProviders(
      <ConfirmDialog
        open
        title="Archive category"
        onClose={close}
        content={<TextField label="Archive reason" />}
        action={<Button loading>Archiving</Button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
  });
});
