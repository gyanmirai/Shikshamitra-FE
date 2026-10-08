import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FeeRefundDetailsForm from './FeeRefundDetailForm';
import { normalizeRefundMethod, getAllowedRefundMethodOptions } from './refundPayoutMethods';

const mocks = vi.hoisted(() => ({
  eligibility: { currentData: undefined as any, isFetching: false, isError: false },
  setFieldValue: vi.fn(),
  setFieldTouched: vi.fn(),
}));

vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year-1' } }) }));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useGetRefundEligibilityQuery: () => mocks.eligibility,
}));
vi.mock('src/redux/finance/BankAccountManage/bankAccountApi', () => ({ useGetBankAccountQuery: vi.fn() }));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => ({ data: { items: [] } }) }));
vi.mock('src/components/shaking-text-field', () => ({ default: ({ children }: any) => children }));
vi.mock('src/components/custom-select', () => ({
  default: ({ options, label, value, disabled, helperText }: any) => (
    <>
      <select aria-label={label} value={value} disabled={disabled} onChange={() => {}}>
        <option value="">Choose</option>
        {options.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <span>{helperText}</span>
    </>
  ),
}));
vi.mock('./FeeHeadRefundTable', async () => {
  const { useEffect } = await import('react');
  return { default: ({ onHasRecords }: any) => {
    useEffect(() => { onHasRecords(true); }, [onHasRecords]);
    return null;
  } };
});

const formik = (refundMethod = '') => ({
  values: { studentId: 'student-1', refundMethod, paymentDetails: {} },
  touched: {}, errors: {}, setFieldValue: mocks.setFieldValue, setFieldTouched: mocks.setFieldTouched,
} as any);
const eligible = (allowedPayoutMethods: string[]) => ({
  allowedPayoutMethods,
  totalRefundable: 100,
  feeHeads: [{ months: [{ refundable: 100 }] }],
});

describe('refund policy payment methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.eligibility = { currentData: undefined, isFetching: false, isError: false };
  });

  it('offers only the policy methods, using API display labels', () => {
    expect(getAllowedRefundMethodOptions(['Cash', 'UPI'])).toEqual([
      { value: 'Cash', label: 'Cash' }, { value: 'UPI', label: 'UPI' },
    ]);
    expect(getAllowedRefundMethodOptions(['Demand Draft (DD)', 'Bank Transfer (NEFT/RTGS/IMPS)'])).toHaveLength(2);
    expect(getAllowedRefundMethodOptions([])).toEqual([]);
    expect(getAllowedRefundMethodOptions()).toEqual([]);
    expect(getAllowedRefundMethodOptions(['Upi', 'BankTransfer', 'DemandDraft'])).toHaveLength(3);
    expect(normalizeRefundMethod('Upi')).toBe('UPI');
  });

  it.each([
    { isFetching: true, isError: false },
    { isFetching: false, isError: true },
  ])('hides refund controls while eligibility is unresolved: $isError', (state) => {
    mocks.eligibility = { ...state, currentData: undefined };
    render(<FeeRefundDetailsForm formik={formik()} />);
    expect(screen.queryByText('Refund Type')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Refund Method *' })).not.toBeInTheDocument();
  });

  it('hides refund controls when no paid fees are refundable', () => {
    mocks.eligibility.currentData = { allowedPayoutMethods: ['Cash'], totalRefundable: 0, feeHeads: [] };
    render(<FeeRefundDetailsForm formik={formik()} />);
    expect(screen.queryByText('Refund Type')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Refund Method *' })).not.toBeInTheDocument();
  });

  it('hides refund controls when paid fees have no refundable balance left', () => {
    mocks.eligibility.currentData = {
      allowedPayoutMethods: ['Cash'], totalPaid: 100, totalRefundable: 0,
      feeHeads: [{ months: [{ paid: 100, refundable: 0 }] }],
    };
    render(<FeeRefundDetailsForm formik={formik()} />);
    expect(screen.queryByText('Refund Type')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Refund Method *' })).not.toBeInTheDocument();
  });

  it('clears a method and its details when the resolved policy excludes it', () => {
    mocks.eligibility.currentData = eligible(['Cash']);
    render(<FeeRefundDetailsForm formik={formik('Cheque')} />);
    expect(mocks.setFieldValue).toHaveBeenCalledWith('refundMethod', '', false);
    expect(mocks.setFieldValue).toHaveBeenCalledWith('paymentDetails', {}, false);
    expect(screen.queryByRole('option', { name: 'Cheque' })).not.toBeInTheDocument();
  });

  it('uses the existing request snapshot when its current policy has changed', () => {
    mocks.eligibility.currentData = eligible(['Cheque']);
    render(<FeeRefundDetailsForm formik={formik()} allowedPayoutMethods={['Cash']} />);
    expect(screen.getByRole('option', { name: 'Cash' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Cheque' })).not.toBeInTheDocument();
  });
});
