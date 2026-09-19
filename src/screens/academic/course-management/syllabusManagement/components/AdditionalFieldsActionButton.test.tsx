import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AdditionalFieldsActionButton } from './AdditionalFieldsActionButton';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('AdditionalFieldsActionButton', () => {
  it('presents an add action before any fields are configured', () => {
    render(<AdditionalFieldsActionButton configuredCount={0} onClick={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Add Additional Fields' });
    expect(button).toHaveClass('MuiButton-contained');
    expect(button.querySelector('[data-icon="solar:add-circle-linear"]')).toBeInTheDocument();
  });

  it('updates to an edit action when configured fields become available', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <AdditionalFieldsActionButton configuredCount={0} onClick={onClick} />
    );

    rerender(<AdditionalFieldsActionButton configuredCount={20} onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Edit Additional Fields' });
    expect(button).toHaveClass('MuiButton-outlined');
    expect(button.querySelector('[data-icon="solar:pen-bold"]')).toBeInTheDocument();
  });
});
