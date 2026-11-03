import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FeeCollectionTable from './FeeCollectionTable';

const mocks = vi.hoisted(() => ({
  row: {
    studentId: 'diya',
    studentName: 'Diya Sweta Badgujar',
    grNumber: '10092',
    totalFees: 40800,
    paidFees: 12396,
    pendingFees: 9600,
    totalCharges: 800,
    paidCharges: 300 as number | null | undefined,
    pendingCharges: 500,
    chargesPaid: 999,
    status: 0,
  },
}));

vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year' } }) }));
vi.mock('src/components/adaptive-three-dots-actions', () => ({ default: () => null }));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({ useGetFeeCollectionListQuery: vi.fn() }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({ data: { totalCount: 1, items: [mocks.row] } }),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <table>
      <thead>
        <tr>
          {columns
            .filter((column: any) =>
              ['totalCharges', 'paidCharges', 'pendingCharges'].includes(column.id)
            )
            .map((column: any) => (
              <th key={column.id} scope="col">
                {column.label}
              </th>
            ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.studentId}>
            <td>{row.name}</td>
            {columns
              .filter((column: any) =>
                ['totalCharges', 'paidCharges', 'pendingCharges'].includes(column.id)
              )
              .map((column: any) => (
                <td
                  key={column.id}
                  aria-label={column.id}
                  style={{ textAlign: column.cellSx?.textAlign ?? column.align }}
                >
                  {column.render(row[column.id], row)}
                </td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

describe('Collections canonical charge columns', () => {
  it('renders server charge totals and refreshed pending balances independently of fee balances', () => {
    const props = {
      academicFilters: { selectedMedium: 'english', isReady: true, filterPayload: {} } as any,
      onAddFee: {} as any,
      onCollectFee: vi.fn(),
      onView: vi.fn(),
      onGiveAdjustment: vi.fn(),
      onDelete: vi.fn(),
    };
    const view = render(<FeeCollectionTable {...props} />);
    expect(screen.getByText('Diya Sweta Badgujar (10092)')).toBeVisible();
    expect(
      within(screen.getByRole('cell', { name: 'totalCharges' })).getByText(/^₹\s*800$/)
    ).toBeVisible();
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Total Charges',
      'Paid Charges',
      'Pending Charges',
    ]);
    expect(screen.getByRole('cell', { name: 'paidCharges' })).toHaveStyle({ textAlign: 'right' });
    expect(
      within(screen.getByRole('cell', { name: 'paidCharges' })).getByText(/^₹\s*300$/)
    ).toBeVisible();
    expect(
      within(screen.getByRole('cell', { name: 'pendingCharges' })).getByText(/^₹\s*500$/)
    ).toBeVisible();

    mocks.row = { ...mocks.row, paidCharges: 800, pendingCharges: 0 };
    view.rerender(<FeeCollectionTable {...props} />);
    expect(
      within(screen.getByRole('cell', { name: 'totalCharges' })).getByText(/^₹\s*800$/)
    ).toBeVisible();
    expect(
      within(screen.getByRole('cell', { name: 'paidCharges' })).getByText(/^₹\s*800$/)
    ).toBeVisible();
    expect(
      within(screen.getByRole('cell', { name: 'pendingCharges' })).getByText(/^₹\s*0$/)
    ).toBeVisible();
    [undefined, null].forEach((unavailable) => {
      mocks.row = { ...mocks.row, paidCharges: unavailable };
      view.rerender(<FeeCollectionTable {...props} />);
      expect(screen.getByRole('cell', { name: 'paidCharges' })).toHaveTextContent('—');
      expect(screen.getByRole('cell', { name: 'paidCharges' })).not.toHaveTextContent('₹');
    });
    mocks.row = { ...mocks.row, paidCharges: 0, pendingCharges: 800 };
    view.rerender(<FeeCollectionTable {...props} />);
    expect(
      within(screen.getByRole('cell', { name: 'paidCharges' })).getByText(/^₹\s*0$/)
    ).toBeVisible();
  });
});
