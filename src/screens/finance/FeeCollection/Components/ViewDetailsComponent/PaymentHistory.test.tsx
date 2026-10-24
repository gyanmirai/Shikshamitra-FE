import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { matchesTableRowFilters } from 'src/components/customizabaleTable/hooks/table-row-filter';

import PaymentHistory from './PaymentHistory';

const mocks = vi.hoisted(() => ({
  canView: true,
  download: vi.fn(),
  error: vi.fn(),
  table: {} as any,
}));
vi.mock('src/screens/finance/hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({ canView: mocks.canView }),
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({
  useDownloadReceiptPdfMutation: () => [mocks.download],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: mocks.error } }));
vi.mock('src/components/detail-view', () => ({ DetailSection: ({ children }: any) => children }));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) =>
    actions.map((action: any) => (
      <button type="button" key={action.id} disabled={action.disabled} onClick={action.onClick}>
        {action.label}
      </button>
    )),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    mocks.table = props;
    return props.data.map((row: any) => (
      <div key={row.paymentId}>
        {props.columns.map((column: any) => (
          <div key={column.id}>
            {column.render ? column.render(row[column.id], row) : row[column.id]}
          </div>
        ))}
      </div>
    ));
  },
}));

const payments = [
  {
    paymentId: 'collection-id',
    receiptNumber: 'REC-2026-1',
    date: '2026-10-23',
    amount: 12500,
    paymentMethods: [0, 2],
    status: 1,
    receipts: [
      {
        receiptId: 'document-id',
        receiptNumber: 'FIN-2026-1',
        scope: 'Fee' as const,
        hasPdf: true,
      },
    ],
  },
];

describe('fee detail payment history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.canView = true;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:receipt'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  });

  it('displays payment names and supports typed criteria on every data column', () => {
    render(<PaymentHistory payments={payments} />);
    expect(screen.getByText('Cash, Demand Draft (DD)')).toBeInTheDocument();
    const { data, columns } = mocks.table;
    const criteria: Array<[string, string, string | number]> = [
      ['receiptNumber', 'string', 'REC-2026-1'],
      ['date', 'date', '2026-10-23'],
      ['amount', 'number', 12500],
      ['paymentMethodLabel', 'string', 'Cash'],
      ['status', 'enum', 1],
    ];
    criteria.forEach(([column, valueType, value]) => {
      expect(columns.find((item: any) => item.id === column).isFilter).toBe(true);
      expect(
        matchesTableRowFilters(
          data[0],
          [{ column, valueType, value, type: valueType === 'string' ? 'contains' : 'equals' }],
          columns
        )
      ).toBe(true);
    });
    expect(columns.find((column: any) => column.id === 'actions')).toMatchObject({
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
    });
    expect(
      matchesTableRowFilters(
        data[0],
        [{ column: 'paymentMethodLabel', valueType: 'string', value: 'Cheque', type: 'contains' }],
        columns
      )
    ).toBe(false);
  });

  it('downloads the saved document using its document ID', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    mocks.download.mockReturnValue({ unwrap: () => Promise.resolve(new Blob(['%PDF'])) });
    render(<PaymentHistory payments={payments} />);
    fireEvent.click(screen.getByRole('button', { name: 'Download receipt FIN-2026-1' }));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(mocks.download).toHaveBeenCalledWith({ receiptId: 'document-id' });
    click.mockRestore();
  });

  it('preserves the row and allows retry when download fails', async () => {
    mocks.download.mockReturnValue({ unwrap: () => Promise.reject(new Error('offline')) });
    render(<PaymentHistory payments={payments} />);
    fireEvent.click(screen.getByRole('button', { name: 'Download receipt FIN-2026-1' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledOnce());
    expect(screen.getByText('REC-2026-1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download receipt FIN-2026-1' })).toBeEnabled();
  });

  it('can generate an uncached PDF for an existing receipt', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    mocks.download.mockReturnValue({ unwrap: () => Promise.resolve(new Blob(['%PDF'])) });
    render(
      <PaymentHistory
        payments={[{ ...payments[0], receipts: [{ ...payments[0].receipts[0], hasPdf: false }] }]}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Download receipt FIN-2026-1' }));
    await waitFor(() => expect(mocks.download).toHaveBeenCalledWith({ receiptId: 'document-id' }));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    click.mockRestore();
  });

  it('hides downloads without InvoiceReceipt View permission', () => {
    mocks.canView = false;
    render(<PaymentHistory payments={payments} />);
    expect(screen.queryByRole('button', { name: /Download receipt/ })).not.toBeInTheDocument();
    expect(mocks.download).not.toHaveBeenCalled();
  });
});
