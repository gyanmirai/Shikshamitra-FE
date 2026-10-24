import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import ConcessionPolicyFields from './ConcessionPolicyFields';
import { policy } from '../../../../../e2e/fixtures/concession-request-ui/data';

describe('concession policy field consistency', () => {
  const policies = [
    { ...policy, policyCode: 'SIB', policyName: 'Sibling policy' },
    {
      ...policy,
      policyCode: 'SIB',
      policyName: 'Sibling policy',
      concessionPolicyVersionId: 'version-2',
      version: 2,
    },
  ];

  it('uses required, named searchable shared selects and preserves the chosen policy version', () => {
    const onPolicyChange = vi.fn();
    const onPolicyBlur = vi.fn();
    render(
      <ConcessionPolicyFields
        policies={policies}
        types={[{ id: 'sibling', name: 'Sibling concession' }]}
        policyVersionId="version"
        typeId="sibling"
        onPolicyChange={onPolicyChange}
        onTypeChange={vi.fn()}
        onPolicyBlur={onPolicyBlur}
        onTypeBlur={vi.fn()}
      />
    );
    const select = screen.getByRole('combobox', { name: 'Concession policy' });
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('combobox', { name: 'Concession type' })).toHaveAttribute(
      'aria-required',
      'true'
    );
    fireEvent.mouseDown(select);
    expect(screen.getByRole('textbox', { name: 'Search Concession policy' })).toBeVisible();
    fireEvent.click(screen.getByRole('option', { name: 'Sibling policy (SIB, v2)' }));
    expect(onPolicyChange).toHaveBeenCalledWith(policies[1]);
    fireEvent.blur(select);
    expect(onPolicyBlur).toHaveBeenCalled();
  });

  it('associates visible validation feedback and disables policy/type edits during saving', () => {
    const props = {
      policies,
      types: [{ id: 'sibling', name: 'Sibling concession' }],
      policyVersionId: '',
      typeId: '',
      onPolicyChange: vi.fn(),
      onTypeChange: vi.fn(),
      onPolicyBlur: vi.fn(),
      onTypeBlur: vi.fn(),
    };
    const { rerender } = render(
      <ConcessionPolicyFields
        {...props}
        policyError
        policyHelperText="Concession policy is required"
      />
    );
    expect(screen.getByText('Concession policy is required')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Concession policy' })).toHaveAccessibleDescription(
      'Concession policy is required'
    );
    expect(screen.getByRole('combobox', { name: 'Concession policy' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    rerender(<ConcessionPolicyFields {...props} policyDisabled typeDisabled />);
    expect(screen.getByRole('combobox', { name: 'Concession policy' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('combobox', { name: 'Concession type' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
