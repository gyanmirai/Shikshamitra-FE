import { vi, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import DebitCardTable from './DebitCardTable';
import CreditCardTable from './CreditCardTable';

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
      <tbody>
        {data.map((row: any) => (
          <tr key={row.id}>
            {columns.filter((col: any) => col.id !== 'action').map((col: any) => (
              <td key={col.id}>{col.render ? col.render(row[col.id], row) : row[col.id] || '-'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

it.each([['Credit Card', CreditCardTable], ['Debit Card', DebitCardTable]] as const)(
  '%s shows stored holder and masked last four for pending and approved receipts',
  (_method, Table) => {
    state.items = [0, 1].map((status) => ({
      id: `card-${status}`, studentName: `Card ${status}`, amount: 1250, status,
      instrumentDetails: { cardHolderName: 'Rahul Sharma', cardLast4: '0123' },
    }));
    render(<Table />);
    ['Card 0', 'Card 1'].forEach((name) => {
      const row = within(screen.getByText(name).closest('tr')!);
      expect(row.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(row.getByText('•••• 0123')).toBeInTheDocument();
      expect(row.queryByText('0123')).toBeNull();
    });
  }
);

it.each([CreditCardTable, DebitCardTable])('does not invent missing card evidence', (Table) => {
  state.items = [{ id: 'legacy', studentName: 'Legacy card', status: 0, instrumentDetails: {} }];
  render(<Table />);
  expect(screen.queryByText(/••••/)).toBeNull();
});
