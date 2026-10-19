import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdaptiveThreeDotsActions from './index';

import type { AdaptiveThreeDotsAction } from './types';

vi.mock('../iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('AdaptiveThreeDotsActions', () => {
  const theme = createTheme(defaultSettings);

  it('keeps the complete action set in one menu when collapseOnOverflow is enabled', async () => {
    const actions = ['View', 'Edit', 'Clone', 'Archive'].map((label) => ({
      id: label.toLowerCase(),
      label,
      icon: 'mdi:circle',
      onClick: vi.fn(),
    }));
    render(
      <ThemeProvider theme={theme}>
        <AdaptiveThreeDotsActions actions={actions} collapseOnOverflow />
      </ThemeProvider>
    );
    expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(await screen.findAllByRole('menuitem')).toHaveLength(4);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(actions[1].onClick).toHaveBeenCalledOnce();
  });

  const renderActions = (
    actions: readonly AdaptiveThreeDotsAction[],
    onClosePopover?: () => void
  ) =>
    render(
      <ThemeProvider theme={theme}>
        <AdaptiveThreeDotsActions actions={actions} onClosePopover={onClosePopover} />
      </ThemeProvider>
    );

  it('keeps native navigation links direct or in overflow and removes disabled destinations', async () => {
    const href = '/student/profile?student=one&board=cbse&page=2';
    renderActions([
      { id: 'view', label: 'View student', icon: 'mdi:eye', href },
      { id: 'disabled', label: 'Unavailable student', icon: 'mdi:eye', href, disabled: true },
      { id: 'history', label: 'Student history', icon: 'mdi:history', href: '/student/history' },
    ]);
    expect(screen.getByRole('link', { name: 'View student' })).toHaveAttribute('href', href);
    expect(screen.getByRole('button', { name: 'Unavailable student' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'Unavailable student' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(await screen.findByRole('menuitem', { name: 'Student history' })).toHaveAttribute(
      'href',
      '/student/history'
    );
  });

  it('renders up to two actions as direct icon buttons', () => {
    const handlers = [vi.fn(), vi.fn()];
    const actions = handlers.map((onClick, index) => ({
      id: `action-${index + 1}`,
      label: `Action ${index + 1}`,
      icon: `mdi:action-${index + 1}`,
      onClick,
    }));

    renderActions(actions);

    expect(screen.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();
    actions.forEach((action) => {
      expect(screen.getByRole('button', { name: action.label })).toBeVisible();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Action 2' }));
    expect(handlers[1]).toHaveBeenCalledOnce();
  });

  it('renders the first two actions directly and remaining actions in the overflow menu', async () => {
    const onClosePopover = vi.fn();
    const handlers = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    const actions = handlers.map((onClick, index) => ({
      id: `action-${index + 1}`,
      label: `Action ${index + 1}`,
      icon: `mdi:action-${index + 1}`,
      onClick,
    }));

    renderActions(actions, onClosePopover);

    expect(screen.getByRole('button', { name: 'Action 1' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Action 2' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Action 3' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));

    expect(await screen.findAllByRole('menuitem')).toHaveLength(3);
    expect(screen.queryByRole('menuitem', { name: 'Action 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Action 5' })).toBeVisible();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Action 4' }));

    expect(handlers[3]).toHaveBeenCalledOnce();
    expect(onClosePopover).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Action 4' })).not.toBeInTheDocument();
    });
  });

  it('allows a table to keep two primary actions visible and move the rest into the menu', async () => {
    const actions = ['Edit', 'Clone', 'Archive', 'Audit Trail'].map((label) => ({
      id: label.toLowerCase(),
      label,
      icon: 'mdi:circle',
      onClick: vi.fn(),
    }));

    render(
      <ThemeProvider theme={theme}>
        <AdaptiveThreeDotsActions actions={actions} directActionLimit={2} />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Clone' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(await screen.findAllByRole('menuitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(actions[2].onClick).toHaveBeenCalledOnce();
  });

  it('keeps every action available in the menu on narrow screens', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      const actions = ['Edit', 'Delete', 'Clone'].map((label) => ({
        id: label.toLowerCase(),
        label,
        icon: 'mdi:circle',
        onClick: vi.fn(),
      }));
      render(
        <ThemeProvider theme={theme}>
          <AdaptiveThreeDotsActions actions={actions} mobileDirectActionLimit={0} />
        </ThemeProvider>
      );

      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
      expect(await screen.findAllByRole('menuitem')).toHaveLength(3);
      fireEvent.click(screen.getByRole('menuitem', { name: 'Clone' }));
      expect(actions[2].onClick).toHaveBeenCalledOnce();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('preserves the disabled state in direct and overflow modes', async () => {
    const disabledDirectAction = vi.fn();
    const { unmount } = renderActions([
      {
        id: 'disabled',
        label: 'Disabled direct action',
        icon: 'mdi:cancel',
        disabled: true,
        onClick: disabledDirectAction,
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Disabled direct action' }));
    expect(disabledDirectAction).not.toHaveBeenCalled();
    unmount();

    const overflowActions = Array.from({ length: 4 }, (_, index) => ({
      id: `overflow-${index + 1}`,
      label: `Overflow ${index + 1}`,
      icon: `mdi:overflow-${index + 1}`,
      disabled: index === 3,
      onClick: vi.fn(),
    }));
    renderActions(overflowActions);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));

    expect(await screen.findByRole('menuitem', { name: 'Overflow 4' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('renders nothing when no actions are provided', () => {
    const { container } = renderActions([]);

    expect(container).toBeEmptyDOMElement();
  });
});
