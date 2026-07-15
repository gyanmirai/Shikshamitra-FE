import { it, expect, describe } from 'vitest';
import { MenuItem, MenuList } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ThreeDotsActions from './index';

describe('ThreeDotsActions', () => {
  it('opens contextual actions from the project-standard menu button', async () => {
    const theme = createTheme(defaultSettings);
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

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));

    expect(await screen.findByRole('menuitem', { name: 'Eligibility Handoff' })).toBeVisible();
  });
});
