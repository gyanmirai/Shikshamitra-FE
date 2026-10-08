import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { FormFooter } from './FormFooter';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('payment term Submit', () => {
  it('blocks an invalid payment term and becomes actionable once corrected', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const props = { isSubmitting: false, onSubmit, onCancel: vi.fn() };
    const { rerender } = render(<FormFooter {...props} disabled disabledReason="Percentage allocations must total 100%" />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(<FormFooter {...props} disabled={false} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
