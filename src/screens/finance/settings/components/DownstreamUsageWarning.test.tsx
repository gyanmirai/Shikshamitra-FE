import { it, vi, expect } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, within, fireEvent } from '@testing-library/react';

import DownstreamUsageWarning from './DownstreamUsageWarning';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it(
  'names the affected category and offers a neutral, safely focused update decision',
  { timeout: 15_000 },
  () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithProviders(
      <DownstreamUsageWarning
        open
        itemName="24 Fee Category"
        itemType="Fee Category"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Item is Already in Use' });
    expect(dialog).toHaveAccessibleDescription(/24 Fee Category.*wherever this item is used/);
    expect(within(dialog).getByText('24 Fee Category')).toBeVisible();
    expect(within(dialog).getByText('Do you want to continue?')).toBeVisible();

    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    const update = within(dialog).getByRole('button', { name: 'Continue Update' });
    expect(cancel).toHaveFocus();
    expect(update).toHaveClass('MuiButton-colorInherit');
    fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(update);
    expect(onConfirm).toHaveBeenCalledOnce();
  }
);
