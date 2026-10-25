import { render } from '@testing-library/react';
import { it, vi, expect, beforeEach } from 'vitest';
import { useGetReconciliationListQuery } from 'src/redux/finance/reconciliation';

import UpiTable from './UpiTable';
import WalletTable from './WalletTable';
import DebitCardTable from './DebitCardTable';
import CreditCardTable from './CreditCardTable';
import CashReceiptTable from './CashReceiptTable';
import DemandDraftTable from './DemandDraftTable';
import BankTransferTable from './BankTransferTable';
import ChequeDetailsTable from './ChequeDetailsTable';
import OnlineGatewayTable from './OnlineGatewayTable';

vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: [] }, globalState: {} }),
}));
vi.mock('src/redux/finance/reconciliation', () => ({
  useGetReconciliationListQuery: vi.fn(() => ({ isLoading: false, isFetching: false })),
  useRejectReconciliationMutation: vi.fn(() => [vi.fn(), {}]),
  useApproveReconciliationMutation: vi.fn(() => [vi.fn(), {}]),
  useDownloadReconciliationReceiptPdfMutation: vi.fn(() => [vi.fn(), {}]),
}));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: () => null,
}));
vi.mock('./ReconciliationReceiptDialog', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));

const tables = [
  ['Cash', CashReceiptTable],
  ['Cheque', ChequeDetailsTable],
  ['DemandDraft', DemandDraftTable],
  ['BankTransfer', BankTransferTable],
  ['CreditCard', CreditCardTable],
  ['DebitCard', DebitCardTable],
  ['UPI', UpiTable],
  ['OnlineGateway', OnlineGatewayTable],
  ['Wallet', WalletTable],
] as const;

beforeEach(() => vi.clearAllMocks());

it.each(tables)(
  '%s waits for the academic year, then queries the selected scope',
  (paymentMethod, Table) => {
    const params = { academicYearId: '', month: 10, year: 2026, paymentMethod };
    const { rerender } = render(<Table queryParams={params} />);
    expect(useGetReconciliationListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining(params),
      expect.objectContaining({ skip: true })
    );

    const readyParams = { ...params, academicYearId: '11111111-1111-1111-1111-111111111111' };
    rerender(<Table queryParams={readyParams} />);
    expect(useGetReconciliationListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining(readyParams),
      expect.objectContaining({ skip: false })
    );

    const nextYearParams = {
      ...readyParams,
      academicYearId: '22222222-2222-2222-2222-222222222222',
      month: 4,
      year: 2027,
    };
    rerender(<Table queryParams={nextYearParams} />);
    expect(useGetReconciliationListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining(nextYearParams),
      expect.objectContaining({ skip: false })
    );

    rerender(<Table queryParams={params} />);
    expect(useGetReconciliationListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining(params),
      expect.objectContaining({ skip: true })
    );
  }
);

it.each(tables.filter(([method]) => method !== 'Cash'))(
  '%s waits when query parameters have not arrived',
  (_paymentMethod, Table) => {
    render(<Table queryParams={undefined as any} />);
    expect(useGetReconciliationListQuery).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({ skip: true })
    );
  }
);
