import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RefundFeeHeadViewTable from './RefundFeeHeadViewTable';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));

describe('read-only refund amounts', () => {
  it('uses informational refund chips without positive-credit signs and preserves installment details', () => {
    render(
      <RefundFeeHeadViewTable
        data={[
          {
            feeHeadId: 'FH1',
            feeHeadName: 'FH1',
            totalPaid: 15000,
            totalRefunded: 10829,
            items: [
              { month: 'June 2026', total: 15000, paid: 15000, refundAmount: 10829, status: 1 },
            ],
          },
        ]}
      />
    );
    const refundedChip = screen.getByText('Refunded : ₹ 10,829').closest('.MuiChip-root');
    expect(refundedChip).toHaveClass('MuiChip-colorInfo', 'MuiChip-soft');
    expect(refundedChip).not.toHaveClass('MuiChip-colorPrimary', 'MuiChip-colorSuccess');
    expect(screen.getByRole('region', { name: 'FH1 installments' })).toHaveTextContent('June 2026');
    expect(screen.getByRole('region', { name: 'FH1 installments' })).toHaveTextContent('₹ 15,000');
    expect(screen.queryByText(/\+₹/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'FH1 refund details' }));
    expect(screen.getByRole('button', { name: 'FH1 refund details' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
