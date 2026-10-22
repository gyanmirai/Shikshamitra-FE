import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import DefaultPolicyToggle from './DefaultPolicyToggle';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('DefaultPolicyToggle', () => {
  it('uses one concise label and information control in compact forms', () => {
    render(
      <DefaultPolicyToggle
        policyLabel="Concession"
        status="Draft"
        checked={false}
        onChange={vi.fn()}
        compact
        descriptionDisplay="tooltip"
      />
    );
    expect(screen.getByText('Set as default')).toBeVisible();
    expect(screen.queryByText('Default Concession Policy')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Activate this policy to make it the default.')
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Default concession policy information' })
    ).toBeVisible();
  });
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

  it.each(['Concession', 'Collection', 'Refund', 'Proration'])(
    'protects the persisted %s default until a replacement is designated',
    (policyLabel) => {
      const onChange = vi.fn();
      render(
        <DefaultPolicyToggle
          policyLabel={policyLabel}
          status="Active"
          checked
          currentDefault
          onChange={onChange}
        />
      );
      expect(screen.getByRole('switch')).toBeDisabled();
      expect(screen.getByRole('switch')).toBeChecked();
      fireEvent.click(screen.getByText(`Default ${policyLabel} Policy`));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByText(/Designate another Active policy/)).not.toBeInTheDocument();
    }
  );

  it('handles the native switch once and allows undoing an unsaved default selection', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DefaultPolicyToggle
        policyLabel="Collection"
        status="Active"
        checked={false}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
    rerender(
      <DefaultPolicyToggle policyLabel="Collection" status="Active" checked onChange={onChange} />
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
