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
    expect(moreActions).toHaveAttribute('aria-haspopup', 'menu');
    expect(moreActions).toHaveAttribute('aria-expanded', 'false');
    // Decorative SVG children must not become separate pointer targets during icon hydration.
    expect(moreActions.querySelector('[data-icon]')).toHaveStyle({ pointerEvents: 'none' });
    fireEvent.click(moreActions);

    expect(await screen.findByRole('menuitem', { name: 'Eligibility Handoff' })).toBeVisible();
    expect(moreActions).toHaveAttribute('aria-expanded', 'true');
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

  it('renders feature-specific direct actions with the common icon treatment', () => {
    const onAssign = vi.fn();

    render(
      <ThemeProvider theme={theme}>
        <ThreeDotsActions
          showThreeDots={false}
          directActions={[
            {
              id: 'assign',
              label: 'Assign Riya Shah',
              icon: 'mdi:account-arrow-right-outline',
              onClick: onAssign,
            },
          ]}
        />
      </ThemeProvider>
    );

    const assign = screen.getByRole('button', { name: 'Assign Riya Shah' });
    expect(assign).toHaveStyle({ width: '30px', height: '30px' });
    fireEvent.click(assign);
    expect(onAssign).toHaveBeenCalledOnce();
  });

  it('renders a native View link and preserves modifier click without bubbling', () => {
    const onRowClick = vi.fn();
    const onView = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <div role="button" tabIndex={0} onClick={onRowClick} onKeyDown={() => undefined}>
          <ThreeDotsActions
            showViewIcon
            showThreeDots={false}
            viewHref="/student/profile?student=student-1&population=Former"
            viewLabel="View profile for Riya Shah"
            handleViewClick={onView}
          />
        </div>
      </ThemeProvider>
    );
    const view = screen.getByRole('link', { name: 'View profile for Riya Shah' });
    expect(view).toHaveAttribute('href', '/student/profile?student=student-1&population=Former');
    expect(fireEvent.click(view, { ctrlKey: true })).toBe(true);
    expect(onView).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('keeps an unavailable View action disabled without exposing a link', () => {
    render(
      <ThemeProvider theme={theme}>
        <ThreeDotsActions
          showViewIcon
          showThreeDots={false}
          disableViewIcon
          viewHref="/student/profile?student=student-1"
          viewLabel="View Riya Shah"
        />
      </ThemeProvider>
    );
    expect(screen.queryByRole('link', { name: 'View Riya Shah' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Riya Shah' })).toBeDisabled();
  });
});
