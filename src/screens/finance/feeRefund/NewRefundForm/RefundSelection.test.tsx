import { useFormik } from 'formik';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FeeHeadRefundTable from './FeeHeadRefundTable';
import { buildRefundInitialValues, buildFeeRefundApiPayload } from './initialValuesAndValidation';

const mocks = vi.hoisted(() => ({ eligibility: {} as any }));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year' } }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useGetRefundEligibilityQuery: () => mocks.eligibility,
}));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({
  useGetAdjustmentEligibilityQuery: () => mocks.eligibility,
}));

function Request({ mode = 'refund' }: { mode?: 'refund' | 'adjustment' }) {
  const formik = useFormik({
    initialValues: buildRefundInitialValues({ studentId: 'student' }),
    onSubmit: () => {},
  });
  const months = formik.values.feeHeadRefunds.flatMap((head) => head.months);
  return (
    <>
      <FeeHeadRefundTable compact formik={formik} mode={mode} />
      <output aria-label="Selection total">
        {months.length} installments ·{' '}
        {months.reduce((sum, month) => sum + Number(month.amount), 0)}
      </output>
      <output aria-label="Request payload">
        {JSON.stringify(buildFeeRefundApiPayload(formik.values, 'year'))}
      </output>
    </>
  );
}

describe('refund receipt selection', () => {
  beforeEach(() => {
    mocks.eligibility = {
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
      currentData: {
        totalPaid: 400,
        totalRefundable: 400,
        feeHeads: [
          {
            feeHeadId: 'exam',
            feeHeadName: 'Examination fee',
            months: [FeeMonth.December, FeeMonth.June].map((month, index) => ({
              month,
              year: 2026,
              dueFeeId: `due-${index}`,
              sourceAllocationId: `allocation-${index}`,
              sourceReceiptId: `receipt-${index}`,
              receiptNumber: `FIN-${index}`,
              paid: 200,
              total: 200,
              refunded: 0,
              refundable: 200,
              adjustable: 200,
            })),
          },
        ],
      },
    };
  });

  it('keeps both receipts visible and selects only one receipt with the group checkbox', async () => {
    render(<Request />);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select refundable installments for Examination fee' })
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('1 installments · 200')
    );
    expect(screen.getByRole('checkbox', { name: 'Select December 2026 · FIN-0' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select June 2026 · FIN-1' })).toBeDisabled();
    expect(screen.getByText('2 refundable')).toBeVisible();
    const payload = JSON.parse(screen.getByLabelText('Request payload').textContent!);
    expect(payload.originalReceiptId).toBe('receipt-0');
    expect(payload.lines).toEqual([
      { dueFeeId: 'due-0', sourceAllocationId: 'allocation-0', amount: 200 },
    ]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/This request is locked/)).not.toBeInTheDocument();
  });

  it('unlocks the other receipt when the selection is cleared', async () => {
    render(<Request />);
    const first = screen.getByRole('checkbox', { name: 'Select December 2026 · FIN-0' });
    const second = screen.getByRole('checkbox', { name: 'Select June 2026 · FIN-1' });
    fireEvent.click(first);
    expect(second).toBeDisabled();
    fireEvent.click(first);
    expect(second).toBeEnabled();
    fireEvent.click(second);
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('1 installments · 200')
    );
    expect(first).toBeDisabled();
    expect(second).toBeChecked();
  });

  it('allows all installments from the same receipt and clears them together', async () => {
    const months = mocks.eligibility.currentData.feeHeads[0].months;
    months[1].sourceReceiptId = 'receipt-0';
    render(<Request />);
    const group = screen.getByRole('checkbox', {
      name: 'Select refundable installments for Examination fee',
    });
    fireEvent.click(group);
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 400')
    );
    expect(group).toBeChecked();
    fireEvent.click(group);
    expect(screen.getByLabelText('Selection total')).toHaveTextContent('0 installments · 0');
  });

  it('keeps bulk adjustment selection available across receipts', async () => {
    render(<Request mode="adjustment" />);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select refundable installments for Examination fee' })
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 400')
    );
  });
});
