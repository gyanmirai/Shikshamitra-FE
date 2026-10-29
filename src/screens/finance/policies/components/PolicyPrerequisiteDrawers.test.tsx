import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RefundPolicyDrawer from './RefundPolicyDrawer';
import ProrationPolicyDrawer from './ProrationPolicyDrawer';
import CollectionPolicyDrawer from './CollectionPolicyDrawer';

const state = vi.hoisted(() => ({
  submit: vi.fn(),
  close: vi.fn(),
  refresh: vi.fn(),
  setFieldValue: vi.fn(),
  requirements: [{ key: 'fee-head' }],
  values: {} as any,
  headsError: false,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      globalState: { currentYear: { id: 'year', name: '2026' } },
      auth: { permissions: [] },
    }),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/screens/finance/components/FinancePrerequisiteState', () => ({
  default: ({ onRefresh }: any) => (
    <div>
      <span>Missing setup</span>
      <button type="button" onClick={onRefresh}>
        Refresh setup
      </button>
    </div>
  ),
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/custom-select', () => ({
  default: ({ name, label, value, onChange, options, multiple }: any) => (
    <select
      aria-label={label}
      name={name}
      multiple={multiple}
      value={value}
      onChange={(event) =>
        onChange(
          multiple
            ? Array.from(event.target.selectedOptions, (item: any) => item.value)
            : event.target.value
        )
      }
    >
      {options.map((item: any) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('./FinancePolicyDrawerHeader', () => ({ default: ({ title }: any) => <h2>{title}</h2> }));
vi.mock('../hooks/useProrationValidationFocus', () => ({ useProrationValidationFocus: () => {} }));
const hookState = () => ({
  formik: {
    values: state.values,
    initialValues: {},
    isSubmitting: false,
    setFieldValue: state.setFieldValue,
  },
  prerequisites: state.requirements,
  isFeeHeadsError: state.headsError,
  refreshPrerequisites: state.refresh,
  checks: { numericValid: true },
  unsavedChangesDialog: { value: false },
  handleCustomSubmit: state.submit,
  handleCloseAttempt: state.close,
});
vi.mock('../hooks/useRefundPolicyForm', () => ({
  useRefundPolicyForm: () => hookState(),
  PAYOUT_METHODS: [
    { value: 'Cash', label: 'Cash' },
    { value: 'Cheque', label: 'Cheque' },
  ],
}));
vi.mock('../hooks/useProrationPolicyForm', () => ({ useProrationPolicyForm: () => hookState() }));
vi.mock('../hooks/useCollectionPolicyForm', () => ({ useCollectionPolicyForm: () => hookState() }));
vi.mock('./refund/RefundGeneralSection', () => ({ default: () => <div>Refund fields</div> }));
vi.mock('./proration/ProrationGeneralSection', () => ({
  default: () => <div>Proration fields</div>,
}));
vi.mock('./proration/ProrationFeeHeadsSection', () => ({
  default: () => <div>Fee head configuration</div>,
}));
vi.mock('./collection/CollectionGeneralSection', () => ({
  default: () => <div>Collection fields</div>,
}));
vi.mock('./refund/RefundFooterActions', () => ({
  default: ({ disabled, onCancel }: any) => (
    <>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" disabled={disabled}>
        Submit
      </button>
    </>
  ),
}));
vi.mock('./proration/ProrationFooterActions', () => ({
  default: ({ disabled, onCancel }: any) => (
    <>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" disabled={disabled}>
        Submit
      </button>
    </>
  ),
}));
vi.mock('./collection/CollectionFooterActions', () => ({
  default: ({ invalid, onCancel }: any) => (
    <>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" disabled={invalid}>
        Submit
      </button>
    </>
  ),
}));

describe('policy prerequisite drawers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.headsError = false;
    state.requirements = [{ key: 'fee-head' }];
    state.values = {
      status: 'Draft',
      academicYearId: 'year',
      feeHeadScope: 'SelectedFeeHeads',
      allowedPayoutMethods: ['Cash'],
      enableLateFee: true,
      feeHeadRules: [],
    };
  });
  it('keeps a failed head lookup as an error without showing empty setup guidance', () => {
    state.requirements = [];
    state.headsError = true;
    render(<ProrationPolicyDrawer open onClose={state.close} academicYearId="year" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Active fee heads could not be loaded');
    expect(screen.queryByText('Missing setup')).not.toBeInTheDocument();
    expect(screen.queryByText('Fee head configuration')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });
  it.each([
    [RefundPolicyDrawer, 'Refund fields'],
    [ProrationPolicyDrawer, 'Proration fields'],
    [CollectionPolicyDrawer, 'Collection fields'],
  ] as const)(
    'keeps the shell and Cancel, blocks submit and replaces fields for %s',
    (Drawer, fieldText) => {
      render(<Drawer open onClose={vi.fn()} academicYearId="year" />);
      expect(screen.getByText('Missing setup')).toBeInTheDocument();
      expect(screen.queryByText(fieldText)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(state.close).toHaveBeenCalledOnce();
      fireEvent.click(screen.getByRole('button', { name: 'Refresh setup' }));
      expect(state.refresh).toHaveBeenCalledOnce();
      fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
      expect(state.submit).not.toHaveBeenCalled();
    }
  );
  it('keeps refund scope, status and payout choices available while blocked', () => {
    render(<RefundPolicyDrawer open onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Refundable fee heads'), {
      target: { value: 'AllFeeHeads' },
    });
    expect(state.setFieldValue).toHaveBeenCalledWith('feeHeadScope', 'AllFeeHeads');
    expect(screen.getByLabelText('Status')).toBeEnabled();
    expect(screen.getByLabelText('Payment methods')).toBeEnabled();
  });
  it('keeps collection late-fee and status choices available while blocked', () => {
    render(<CollectionPolicyDrawer open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Enable late fee charges' }));
    expect(state.setFieldValue).toHaveBeenCalledWith('enableLateFee', false);
    expect(screen.getByLabelText('Status')).toBeEnabled();
  });
});
