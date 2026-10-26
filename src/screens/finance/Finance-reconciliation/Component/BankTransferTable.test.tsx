import { vi, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import BankTransferTable from './BankTransferTable';

const state = vi.hoisted(() => ({ items: [] as any[] }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: [] }, globalState: {} }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: any) =>
    type === 'query'
      ? { data: { items: state.items }, isLoading: false, isFetching: false }
      : [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/finance/reconciliation', () => ({
  useGetReconciliationListQuery: vi.fn(),
  useDownloadReconciliationReceiptPdfMutation: vi.fn(),
}));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('./DemandDraftTable', () => ({ ApproveRejectForm: () => null }));
vi.mock('./ReconciliationReceiptDialog', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <table>
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.id}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.id}>
            {columns
              .filter((col: any) => col.id !== 'action')
              .map((col: any) => (
                <td key={col.id}>
                  {col.render ? col.render(row[col.id], row) : row[col.id] || '-'}
                </td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

it('shows the stored transfer evidence and masked receiving bank for pending and approved receipts', () => {
  state.items = [0, 1].map((status) => ({
    id: `transfer-${status}`,
    studentName: status === 0 ? 'Pending transfer' : 'Approved transfer',
    amount: 1250,
    status,
    receiptDate: '2026-10-26',
    bankAccountId: 'school-bank',
    bankLabel: 'HDFC Bank - ****1234',
    instrumentDetails: {
      transactionReferenceNumber: 'N123456789876',
      transferDate: '2026-10-20',
      accountHolderName: 'Rahul Sharma',
    },
  }));
  render(<BankTransferTable />);
  expect(screen.getByRole('columnheader', { name: 'Target Bank Account' })).toBeInTheDocument();
  ['Pending transfer', 'Approved transfer'].forEach((name) => {
    const row = within(screen.getByText(name).closest('tr')!);
    expect(row.getByText('N123456789876')).toBeInTheDocument();
    expect(row.getByText('20-10-2026')).toBeInTheDocument();
    expect(row.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(row.getByText('HDFC Bank - ****1234')).toBeInTheDocument();
  });
  expect(screen.queryAllByText('26-10-2026')).toHaveLength(0);
});

it('does not substitute the receipt creation date for missing or invalid transfer evidence', () => {
  state.items = [null, '', 'invalid'].map((transferDate, index) => ({
    id: `legacy-${index}`,
    studentName: `Legacy ${index}`,
    status: 0,
    receiptDate: '2026-10-26',
    instrumentDetails: { transferDate },
  }));
  render(<BankTransferTable />);
  expect(screen.queryAllByText('26-10-2026')).toHaveLength(0);
  expect(screen.queryByText('Invalid Date')).toBeNull();
});
