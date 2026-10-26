import { useFormik } from 'formik';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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

function Request({
  mode = 'refund',
  partial = false,
}: {
  mode?: 'refund' | 'adjustment';
  partial?: boolean;
}) {
  const formik = useFormik({
    initialValues: {
      ...buildRefundInitialValues({ studentId: 'student' }),
      refundType: partial ? 'partial' : 'full',
    },
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

  it('selects paid charges with fees and submits their charge payment reference', async () => {
    const data = mocks.eligibility.currentData;
    data.totalPaid = 650;
    data.totalRefundable = 650;
    data.feeHeads.push({
      feeHeadId: null,
      feeHeadName: 'Paid charges',
      months: [
        {
          chargeId: 'charge-1',
          chargeName: 'Exam materials',
          dueFeeId: null,
          sourceAllocationId: 'charge-payment-1',
          sourceReceiptId: 'receipt-0',
          receiptNumber: 'FIN-0',
          month: FeeMonth.December,
          year: 2026,
          total: 250,
          paid: 250,
          refunded: 0,
          refundable: 250,
        },
      ],
    });
    render(<Request />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select December 2026 · FIN-0' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Exam materials · FIN-0' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 450')
    );
    const payload = JSON.parse(screen.getByLabelText('Request payload').textContent!);
    expect(payload.originalReceiptId).toBe('receipt-0');
    expect(payload.lines).toEqual([
      { dueFeeId: 'due-0', sourceAllocationId: 'allocation-0', amount: 200 },
      { chargeId: 'charge-1', sourceAllocationId: 'charge-payment-1', amount: 250 },
    ]);
    expect(screen.getByRole('checkbox', { name: 'Select June 2026 · FIN-1' })).toBeDisabled();
  });

  it('bulk selects charge payments from one receipt', async () => {
    mocks.eligibility.currentData.feeHeads = [
      {
        feeHeadId: null,
        feeHeadName: 'Paid charges',
        months: [0, 1].map((index) => ({
          chargeId: `charge-${index}`,
          chargeName: `Materials ${index}`,
          dueFeeId: null,
          sourceAllocationId: `charge-payment-${index}`,
          sourceReceiptId: `receipt-${index}`,
          receiptNumber: `FIN-${index}`,
          month: FeeMonth.December,
          year: 2026,
          total: 200,
          paid: 200,
          refunded: 0,
          refundable: 200,
        })),
      },
    ];
    render(<Request />);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select refundable installments for Paid charges' })
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('1 installments · 200')
    );
    const payload = JSON.parse(screen.getByLabelText('Request payload').textContent!);
    expect(payload.lines).toEqual([
      { chargeId: 'charge-0', sourceAllocationId: 'charge-payment-0', amount: 200 },
    ]);
    expect(screen.getByRole('checkbox', { name: 'Select Materials 1 · FIN-1' })).toBeDisabled();
  });

  it('keeps paid charges and paid late fees separate and submits the late fee source', async () => {
    mocks.eligibility.currentData.feeHeads = [
      {
        feeHeadId: null,
        feeHeadName: 'Paid charges',
        months: [
          {
            month: 6,
            year: 2026,
            chargeId: 'charge',
            chargeName: 'Materials',
            sourceAllocationId: 'charge-payment',
            sourceReceiptId: 'receipt',
            receiptNumber: 'FIN-1',
            total: 100,
            paid: 100,
            refunded: 0,
            refundable: 100,
          },
        ],
      },
      {
        feeHeadId: null,
        feeHeadName: 'Paid late fees',
        months: [
          {
            month: 6,
            year: 2026,
            lateFeeDueFeeId: 'late-due',
            chargeName: 'Late Fee - Tuition',
            sourceAllocationId: 'late-payment',
            sourceReceiptId: 'receipt',
            receiptNumber: 'FIN-1',
            total: 250,
            paid: 250,
            refunded: 0,
            refundable: 250,
          },
        ],
      },
    ];
    render(<Request />);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select refundable installments for Paid late fees' })
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('1 installments · 250')
    );
    expect(screen.getByRole('checkbox', { name: 'Select Materials · FIN-1' })).not.toBeChecked();
    expect(JSON.parse(screen.getByLabelText('Request payload').textContent!).lines).toEqual([
      { lateFeeDueFeeId: 'late-due', sourceAllocationId: 'late-payment', amount: 250 },
    ]);
  });

  it('preserves every source for a capped whole-receipt refund so the server can allocate the cap', async () => {
    mocks.eligibility.currentData.allowPartialRefund = false;
    mocks.eligibility.currentData.totalRefundable = 1000;
    mocks.eligibility.currentData.feeHeads = [
      {
        feeHeadId: 'tuition',
        feeHeadName: 'Tuition',
        months: [
          {
            month: 6,
            year: 2026,
            dueFeeId: 'principal',
            sourceAllocationId: 'principal-payment',
            sourceReceiptId: 'receipt',
            receiptNumber: 'FIN-1',
            total: 1000,
            paid: 1000,
            refunded: 0,
            refundable: 1000,
          },
        ],
      },
      {
        feeHeadId: null,
        feeHeadName: 'Paid late fees',
        months: [
          {
            month: 6,
            year: 2026,
            lateFeeDueFeeId: 'principal',
            chargeName: 'Late Fee - Tuition',
            sourceAllocationId: 'late-payment',
            sourceReceiptId: 'receipt',
            receiptNumber: 'FIN-1',
            total: 250,
            paid: 250,
            refunded: 0,
            refundable: 250,
          },
        ],
      },
    ];
    render(<Request />);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select refundable installments for Tuition' })
    );
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select refundable installments for Paid late fees' })
    );
    await waitFor(() =>
      expect(JSON.parse(screen.getByLabelText('Request payload').textContent!).lines).toEqual([
        { dueFeeId: 'principal', sourceAllocationId: 'principal-payment', amount: 1000 },
        { lateFeeDueFeeId: 'principal', sourceAllocationId: 'late-payment', amount: 250 },
      ])
    );
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
    const { months } = mocks.eligibility.currentData.feeHeads[0];
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

  it('applies repeatedly without clearing and uses the latest bulk amount with each line cap', async () => {
    const { months } = mocks.eligibility.currentData.feeHeads[0];
    months[1].sourceReceiptId = 'receipt-0';
    months[1].refundable = 75;
    render(<Request partial />);
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Select refundable installments for Examination fee',
      })
    );
    const amount = screen.getByRole('textbox', {
      name: 'Amount for selected installments in Examination fee',
    });
    const apply = screen.getByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();
    fireEvent.change(amount, { target: { value: '100.25' } });
    fireEvent.click(apply);
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 175.25')
    );
    fireEvent.click(apply);
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 175.25')
    );
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
    fireEvent.change(amount, { target: { value: '25.50' } });
    fireEvent.click(apply);
    await waitFor(() =>
      expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 51')
    );
    fireEvent.click(apply);
    expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 51');
    fireEvent.change(amount, { target: { value: '0' } });
    expect(apply).toBeDisabled();
    expect(screen.getByLabelText('Selection total')).toHaveTextContent('2 installments · 51');
  });
});
