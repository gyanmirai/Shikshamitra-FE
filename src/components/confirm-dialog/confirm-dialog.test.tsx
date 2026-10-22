import { describe, it, expect, vi } from 'vitest';
import { Button, TextField } from '@mui/material';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './confirm-dialog';
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('confirmation dismissal', () => {
  it('preserves entered reasons through backdrop and Escape, closes explicitly', () => {
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
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.parentElement!);
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('Replaced this year');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalledOnce();
  });

  it('locks cancellation and input during the action', () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Archive category"
        onClose={vi.fn()}
        content={<TextField label="Archive reason" />}
        action={<Button loading>Archiving</Button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
