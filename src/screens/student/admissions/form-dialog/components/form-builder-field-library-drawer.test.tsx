import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderFieldLibraryDrawer } from './form-builder-field-library-drawer';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('FormBuilderFieldLibraryDrawer', () => {
  it('stays open while multiple fields are added and closes on request', async () => {
    const user = userEvent.setup();
    const onAddField = vi.fn();
    const onClose = vi.fn();

    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FormBuilderFieldLibraryDrawer
          open
          targetLabel="Bank Details"
          systemFields={[]}
          loading={false}
          error={false}
          onRetry={vi.fn()}
          onClose={onClose}
          onAddField={onAddField}
        />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('tab', { name: 'Custom fields' }));
    await user.click(screen.getByRole('button', { name: 'More field formats' }));
    await user.click(screen.getByRole('button', { name: 'Add Text' }));
    await user.click(screen.getByRole('button', { name: 'Add Number' }));

    expect(onAddField).toHaveBeenNthCalledWith(1, 0);
    expect(onAddField).toHaveBeenNthCalledWith(2, 2);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Close field library' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
