import type { FormikProps } from 'formik';

import React from 'react';
import { vi, it, expect, describe } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import CollectionPolicyDrawer from './CollectionPolicyDrawer';

import type { IFinancePolicyRow, ICollectionPolicyFormValues } from '../types/finance-policy.types';

vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'year-1', name: '2026' } }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('src/redux/feeHeadManage/feeHeadManageApi', () => ({
  useGetActiveFeeHeadsQuery: () => ({ data: [] }),
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => ({
    currentData: { incomeCategories: [], bankAccounts: [], expenseCategories: [] },
    refetch: vi.fn(),
  }),
}));
vi.mock('src/redux/finance/collectionPolicy', () => ({
  useGetCollectionPoliciesQuery: () => ({ data: { items: [] } }),
  useCreateCollectionPolicyMutation: vi.fn(),
  useUpdateCollectionPolicyMutation: vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, action, onClose }: any) =>
    open && (
      <div role="alertdialog">
        {action}
        <button type="button" onClick={onClose}>
          Keep editing
        </button>
      </div>
    ),
}));
vi.mock('./FinancePolicyDrawerHeader', () => ({
  default: ({ onClose }: any) => (
    <button type="button" onClick={onClose}>
      Close drawer
    </button>
  ),
}));
vi.mock('./collection/CollectionFooterActions', () => ({
  default: ({ onCancel }: any) => (
    <button type="button" onClick={onCancel}>
      Cancel form
    </button>
  ),
}));
vi.mock('./collection/CollectionLateFeeSection', () => ({ default: () => null }));
vi.mock('./collection/CollectionGeneralSection', () => ({
  default: ({ formik }: { formik: FormikProps<ICollectionPolicyFormValues> }) => (
    <>
      <input
        aria-label="Policy name"
        name="policyName"
        value={formik.values.policyName}
        onChange={formik.handleChange}
      />
      <input
        aria-label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
      />
      <input
        aria-label="Grace period"
        name="gracePeriodDays"
        value={formik.values.gracePeriodDays}
        onChange={formik.handleChange}
      />
    </>
  ),
}));

describe('collection policy drawer sessions', () => {
  it.each(['Close drawer', 'Cancel form'])(
    'discards all draft values after %s and reopens cleanly',
    async (closeAction) => {
      const props = { open: true, onClose: vi.fn(), academicYearId: 'year-1' };
      const { rerender } = render(<CollectionPolicyDrawer {...props} />);
      fireEvent.change(screen.getByLabelText('Policy name'), {
        target: { value: '10th Coll policy' },
      });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'TEST CMT ONE' } });
      fireEvent.change(screen.getByLabelText('Grace period'), { target: { value: '22' } });
      fireEvent.click(screen.getByRole('button', { name: closeAction }));
      fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
      expect(props.onClose).toHaveBeenCalledOnce();
      rerender(<CollectionPolicyDrawer {...props} open={false} />);
      expect(screen.queryByLabelText('Policy name')).not.toBeInTheDocument();
      rerender(<CollectionPolicyDrawer {...props} />);
      expect(screen.getByLabelText('Policy name')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Grace period')).toHaveValue('0');
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    }
  );

  it('keeps the draft when discard confirmation is canceled', async () => {
    render(<CollectionPolicyDrawer open onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Policy name'), {
      target: { value: 'Keep this policy' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('Policy name')).toHaveValue('Keep this policy');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('restores saved edit values and drops drafts on any completed close', () => {
    const editData = {
      id: 'policy-1',
      policyName: 'Saved policy',
      description: 'Saved description',
      gracePeriodDays: 9,
      status: 'Draft',
    } as unknown as IFinancePolicyRow;
    const props = { open: true, onClose: vi.fn(), editData };
    const { rerender } = render(<CollectionPolicyDrawer {...props} />);
    fireEvent.change(screen.getByLabelText('Policy name'), { target: { value: 'Unsaved edit' } });
    fireEvent.change(screen.getByLabelText('Grace period'), { target: { value: '22' } });
    rerender(<CollectionPolicyDrawer {...props} open={false} />);
    rerender(<CollectionPolicyDrawer {...props} />);
    expect(screen.getByLabelText('Policy name')).toHaveValue('Saved policy');
    expect(screen.getByLabelText('Description')).toHaveValue('Saved description');
    expect(screen.getByLabelText('Grace period')).toHaveValue('9');
    rerender(<CollectionPolicyDrawer {...props} open={false} />);
    rerender(<CollectionPolicyDrawer {...props} editData={null} />);
    expect(screen.getByLabelText('Policy name')).toHaveValue('');
  });
});
