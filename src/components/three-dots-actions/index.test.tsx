import { it, vi, expect, describe } from 'vitest';
import { MenuItem, MenuList } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ThreeDotsActions from './index';

vi.mock('../iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('ThreeDotsActions', () => {
  const theme = createTheme(defaultSettings);

  it('opens contextual actions from the project-standard menu button', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ThreeDotsActions
          actions={({ popover }) => (
            <MenuList>
              <MenuItem onClick={popover.onClose}>Eligibility Handoff</MenuItem>
            </MenuList>
          )}
        />
      </ThemeProvider>
    );

    const moreActions = screen.getByRole('button', { name: 'More actions' });
    expect(moreActions).toHaveStyle({ width: '30px', height: '30px' });
    fireEvent.click(moreActions);

    expect(await screen.findByRole('menuitem', { name: 'Eligibility Handoff' })).toBeVisible();
  });

  it('does not bubble a popover action to its parent table row', async () => {
    const onRowClick = vi.fn();
    const onDuplicate = vi.fn();

    render(
      <ThemeProvider theme={theme}>
        <div role="button" tabIndex={0} onClick={onRowClick} onKeyDown={() => undefined}>
          <ThreeDotsActions
            actions={({ popover }) => (
              <button
                type="button"
                onClick={() => {
                  popover.onClose();
                  onDuplicate();
                }}
              >
                Duplicate
              </button>
            )}
          />
        </div>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Duplicate' }));

    expect(onDuplicate).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
