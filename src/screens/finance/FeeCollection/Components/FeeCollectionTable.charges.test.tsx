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
    totalCharges: 400,
    pendingCharges: 400,
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
      <tbody>
        {data.map((row: any) => (
          <tr key={row.studentId}>
            <td>{row.name}</td>
            {['totalCharges', 'pendingCharges'].map((id) => (
              <td key={id} aria-label={id}>
                {columns.find((column: any) => column.id === id).render(row[id], row)}
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
      within(screen.getByRole('cell', { name: 'totalCharges' })).getByText(/^₹\s*400\.\s*00$/)
    ).toBeVisible();
    expect(
      within(screen.getByRole('cell', { name: 'pendingCharges' })).getByText(/^₹\s*400\.\s*00$/)
    ).toBeVisible();

    mocks.row = { ...mocks.row, pendingCharges: 100 };
    view.rerender(<FeeCollectionTable {...props} />);
    expect(
      within(screen.getByRole('cell', { name: 'totalCharges' })).getByText(/^₹\s*400\.\s*00$/)
    ).toBeVisible();
    expect(
      within(screen.getByRole('cell', { name: 'pendingCharges' })).getByText(/^₹\s*100\.\s*00$/)
    ).toBeVisible();
  });
});
