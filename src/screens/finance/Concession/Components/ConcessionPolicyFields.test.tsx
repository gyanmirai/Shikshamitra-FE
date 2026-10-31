import type { ReactNode } from 'react';

import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

import ConcessionPolicyFields from './ConcessionPolicyFields';
import { useRefreshFinancePrerequisites } from '../../hooks/useRefreshFinancePrerequisites';
import { policy } from '../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function RequestRefreshBoundary({
  children,
  onRefresh,
}: {
  children: ReactNode;
  onRefresh: () => void;
}) {
  useRefreshFinancePrerequisites(onRefresh);
  return children;
}

describe('concession policy field consistency', () => {
  it('opens the selected policy rules from inside the dropdown without changing the request', async () => {
    const onPolicyChange = vi.fn();
    const refreshEligibility = vi.fn();
    const store = configureStore({
      reducer: { confirmPopup: () => ({ isChanges: true }) },
    });
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <RequestRefreshBoundary onRefresh={refreshEligibility}>
          <ConcessionPolicyFields
            policies={policies.map((item) => ({ ...item, applyOn: 'AllOutstanding' }))}
            types={[]}
            policyVersionId="version-2"
            typeId=""
            onPolicyChange={onPolicyChange}
            onTypeChange={vi.fn()}
            onPolicyBlur={vi.fn()}
            onTypeBlur={vi.fn()}
          />
        </RequestRefreshBoundary>
      </Provider>
    );
    const view = screen.getByRole('button', { name: 'View selected concession policy' });
    await user.click(view);
    expect(screen.getByRole('dialog', { name: 'Concession Policy' })).toBeVisible();
    expect(screen.getByText('Sibling policy')).toBeVisible();
    expect(screen.getByText('v2')).toBeVisible();
    expect(screen.getByText('25%')).toBeVisible();
    expect(screen.getByText('All unpaid installments')).toBeVisible();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onPolicyChange).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(store.getState().confirmPopup.isChanges).toBe(true);
    expect(view).toHaveFocus();
    act(() => window.dispatchEvent(new Event('focus')));
    expect(refreshEligibility).not.toHaveBeenCalled();
    act(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
    });
    expect(refreshEligibility).toHaveBeenCalledOnce();
  });
  it('shows a readable selected-type helper when the API returns only its pending code', () => {
    render(
      <ConcessionPolicyFields
        policies={policies}
        types={[
          {
            id: 'school',
            name: 'School concession',
            benefitBlocker: {
              code: 'Finance:Concession:010010',
              message: 'Finance:Concession:010010',
              blockingRequestId: 'pending',
              blockingStatus: 'Pending',
            },
          },
        ]}
        policyVersionId="version"
        typeId="school"
        onPolicyChange={vi.fn()}
        onTypeChange={vi.fn()}
        onPolicyBlur={vi.fn()}
        onTypeBlur={vi.fn()}
      />
    );
    expect(screen.getByRole('combobox', { name: 'Concession type' })).toHaveAccessibleDescription(
      'A pending concession request already exists for this concession type in this academic year. Review the existing request.'
    );
    expect(screen.queryByText('Finance:Concession:010010')).not.toBeInTheDocument();
  });

  it('disables an already granted type and shows the exact eligibility reason beside that option', async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();
    const message =
      'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.';
    const types = [
      {
        id: 'school',
        name: 'School concession',
        benefitBlocker: {
          code: 'Finance:Concession:010034',
          message: 'Finance:Concession:010034',
          blockingRequestId: 'approved-200',
          blockingStatus: 'Approved' as const,
        },
      },
      { id: 'other', name: 'Other concession', benefitBlocker: null },
    ];
    render(
      <ConcessionPolicyFields
        policies={policies}
        types={types}
        policyVersionId="version"
        typeId=""
        onPolicyChange={vi.fn()}
        onTypeChange={onTypeChange}
        onPolicyBlur={vi.fn()}
        onTypeBlur={vi.fn()}
      />
    );
    await user.click(screen.getByRole('combobox', { name: 'Concession type' }));
    const blocked = screen.getByRole('option', { name: /School concession/ });
    expect(blocked).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(message)).toBeVisible();
    fireEvent.click(blocked);
    expect(onTypeChange).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.click(screen.getByRole('combobox', { name: 'Concession type' }));
    await user.click(screen.getByRole('option', { name: 'Other concession' }));
    expect(onTypeChange).toHaveBeenCalledExactlyOnceWith('other');
  });

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
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('option', { name: 'Sibling policy (SIB, v2)' }));
    expect(onPolicyChange).toHaveBeenCalledWith(policies[1]);
    fireEvent.blur(select);
    expect(onPolicyBlur).toHaveBeenCalled();
  });

  it('keeps one search per menu, filters without selecting, and clears the query on reopen', async () => {
    const user = userEvent.setup();
    const onPolicyChange = vi.fn();
    const onTypeChange = vi.fn();
    const meritPolicy = {
      ...policy,
      policyCode: 'MERIT',
      policyName: 'Merit policy',
      concessionPolicyVersionId: 'merit-version',
    };
    render(
      <ConcessionPolicyFields
        policies={[...policies, meritPolicy]}
        types={[
          { id: 'sibling', name: 'Sibling concession' },
          { id: 'merit', name: 'Merit concession' },
        ]}
        policyVersionId=""
        typeId=""
        onPolicyChange={onPolicyChange}
        onTypeChange={onTypeChange}
        onPolicyBlur={vi.fn()}
        onTypeBlur={vi.fn()}
      />
    );

    const policySelect = screen.getByRole('combobox', { name: 'Concession policy' });
    await user.click(policySelect);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Concession policy' }), {
      target: { value: 'merit' },
    });
    expect(screen.queryByRole('option', { name: 'Sibling policy (SIB, v2)' })).toBeNull();
    expect(onPolicyChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('option', { name: /Merit policy/ }));
    expect(onPolicyChange).toHaveBeenCalledExactlyOnceWith(meritPolicy);

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.click(policySelect);
    const policySearch = screen.getByRole('textbox', { name: 'Search Concession policy' });
    expect(policySearch).toHaveValue('');
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Sibling policy (SIB, v2)' })).toBeVisible();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    await user.click(screen.getByRole('combobox', { name: 'Concession type' }));
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Concession type' }), {
      target: { value: 'merit' },
    });
    expect(screen.queryByRole('option', { name: 'Sibling concession' })).toBeNull();
    expect(onTypeChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('option', { name: 'Merit concession' }));
    expect(onTypeChange).toHaveBeenCalledExactlyOnceWith('merit');
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
