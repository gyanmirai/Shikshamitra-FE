import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import DefaultPolicyToggle from './DefaultPolicyToggle';

describe('DefaultPolicyToggle', () => {
  it('disables default selection for a Draft policy', () => {
    const onChange = vi.fn();

    render(
      <DefaultPolicyToggle
        policyLabel="Collection"
        status="Draft"
        checked={false}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('switch')).toBeDisabled();
    fireEvent.click(screen.getByText('Default Collection Policy'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows default selection for an Active policy', () => {
    const onChange = vi.fn();

    render(
      <DefaultPolicyToggle
        policyLabel="Refund"
        status="Active"
        checked={false}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('switch')).toBeEnabled();
    fireEvent.click(screen.getByText('Default Refund Policy'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
