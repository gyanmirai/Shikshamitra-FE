import { vi, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import DemandDraftTable from './DemandDraftTable';

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
  useRejectReconciliationMutation: vi.fn(),
  useApproveReconciliationMutation: vi.fn(),
  useDownloadReconciliationReceiptPdfMutation: vi.fn(),
}));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: () => null,
}));
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
            {columns.map((col: any) => (
              <td key={col.id}>
                {['ddIssueDate', 'paymentDate'].includes(col.id)
                  ? col.render(row[col.id], row)
                  : row[col.id]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

it('shows independently entered DD issue/payment dates, recorded legacy payment date, and missing values', () => {
  state.items = [
    {
      id: 'entered',
      studentName: 'Entered dates',
      receiptDate: '2026-10-24',
      paymentDate: '2026-10-23T12:00:00+05:30',
      instrumentDetails: {
        ddDate: '2026-10-10',
        paymentDate: '2026-10-15',
      },
    },
    {
      id: 'legacy',
      studentName: 'Legacy dates',
      receiptDate: '2026-10-24',
      paymentDate: '2026-10-20T12:00:00+05:30',
      instrumentDetails: { ddDate: null },
    },
    {
      id: 'missing',
      studentName: 'Missing dates',
      receiptDate: '2026-10-24',
      paymentDate: null,
      instrumentDetails: { ddDate: 'invalid' },
    },
  ];
  render(<DemandDraftTable />);
  expect(screen.getByRole('columnheader', { name: 'DD Issue Date' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Payment Date' })).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'DD Date' })).toBeNull();
  const entered = screen.getByText('Entered dates').closest('tr')!;
  expect(within(entered).getByText('10-10-2026')).toBeInTheDocument();
  expect(within(entered).getByText('15-10-2026')).toBeInTheDocument();
  const legacy = screen.getByText('Legacy dates').closest('tr')!;
  expect(within(legacy).getByText('-')).toBeInTheDocument();
  expect(within(legacy).getByText('20-10-2026')).toBeInTheDocument();
  expect(within(screen.getByText('Missing dates').closest('tr')!).getAllByText('-')).toHaveLength(
    2
  );
  expect(screen.queryByText('24-10-2026')).toBeNull();
});
