import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import AdaptiveThreeDotsActions from './index';

import type { AdaptiveThreeDotsAction } from './types';

vi.mock('../iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('AdaptiveThreeDotsActions', () => {
  const theme = createTheme(defaultSettings);

  const renderActions = (
    actions: readonly AdaptiveThreeDotsAction[],
    onClosePopover?: () => void
  ) =>
    render(
      <ThemeProvider theme={theme}>
        <AdaptiveThreeDotsActions actions={actions} onClosePopover={onClosePopover} />
      </ThemeProvider>
    );

  it('renders up to three actions as direct icon buttons', () => {
    const handlers = [vi.fn(), vi.fn(), vi.fn()];
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

  it('renders the first three actions directly and remaining actions in the overflow menu', async () => {
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
    expect(screen.getByRole('button', { name: 'Action 3' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Action 4' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));

    expect(await screen.findAllByRole('menuitem')).toHaveLength(2);
    expect(screen.queryByRole('menuitem', { name: 'Action 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Action 5' })).toBeVisible();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Action 4' }));

    expect(handlers[3]).toHaveBeenCalledOnce();
    expect(onClosePopover).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Action 4' })).not.toBeInTheDocument();
    });
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
