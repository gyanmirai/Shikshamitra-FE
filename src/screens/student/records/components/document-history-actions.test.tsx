import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import DocumentHistoryActions from './document-history-actions';

// Icon assets come from an external provider; these tests exercise the real UI controls.
vi.mock('@iconify/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@iconify/react')>()),
  Icon: () => <svg aria-hidden="true" />,
  disableCache: vi.fn(),
}));

it('keeps the complete action menu keyboard accessible and preserves disabled decisions', async () => {
  const user = userEvent.setup();
  const reprint = vi.fn();
  const duplicate = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DocumentHistoryActions
        number="TEST-001"
        actions={[
          { label: 'Download', icon: 'mdi:download', onClick: vi.fn() },
          { label: 'Reprint', icon: 'mdi:printer', onClick: reprint },
          { label: 'Duplicate', icon: 'mdi:content-copy', onClick: duplicate },
          { label: 'Void', icon: 'mdi:cancel', disabled: true, danger: true, onClick: vi.fn() },
        ]}
      />
    </ThemeProvider>
  );
  expect(screen.getByRole('button', { name: 'Download TEST-001' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Reprint TEST-001' })).toBeEnabled();
  await user.click(screen.getByRole('button', { name: 'More actions for TEST-001' }));
  const menu = screen.getByRole('menu', { name: 'More actions for TEST-001' });
  expect(
    within(menu)
      .getAllByRole('menuitem')
      .map((item) => item.textContent)
  ).toEqual(['Duplicate', 'Void']);
  expect(screen.getByRole('menuitem', { name: 'Void TEST-001' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await waitFor(() =>
    expect(screen.getByRole('menuitem', { name: 'Duplicate TEST-001' })).toHaveFocus()
  );
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'More actions for TEST-001' }));
  await user.keyboard('{Enter}');
  expect(duplicate).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'Reprint TEST-001' }));
  expect(reprint).toHaveBeenCalledOnce();
});
