import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import CustomDialog from '.';

describe('custom dialog close guard', () => {
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
