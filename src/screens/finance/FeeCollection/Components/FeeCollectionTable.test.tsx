import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import FeeCollectionTable from './FeeCollectionTable';

vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'academic-year' } }),
}));

vi.mock('src/hooks/use-boolean', () => ({ useBoolean: vi.fn() }));
vi.mock('src/components/adaptive-three-dots-actions', () => ({ default: () => null }));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({ useGetFeeCollectionListQuery: vi.fn() }));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({
    data: {
      totalCount: 2,
      items: [
        {
          studentId: 'unassigned',
          studentName: 'Sara Hiren Akbari',
          grNumber: '10096',
          totalFees: 0,
          paidFees: 0,
          pendingFees: 0,
          overdueFees: 0,
          isFeeStructureAssigned: false,
          status: FeeCollectionStatusType.NoFeeAssigned,
        },
        {
          studentId: 'paid',
          studentName: 'Paid Student',
          totalFees: 40800,
          paidFees: 40800,
          pendingFees: 0,
          overdueFees: 0,
          isFeeStructureAssigned: true,
          status: FeeCollectionStatusType.Paid,
        },
      ],
    },
    isLoading: false,
    isFetching: false,
  }),
}));

// Keep the real column rendering and Label while isolating table infrastructure.
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) => {
    const statusColumn = columns.find((column: any) => column.id === 'status');
    return (
      <>
        <select aria-label="Status filter">
          {statusColumn.enumOptions.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <table>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.studentId}>
                <td>{row.name}</td>
                <td>{statusColumn.render(row.status, row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  },
}));

describe('Collections status', () => {
  it('displays No Fee Assigned separately from fully paid students and offers it as a filter', () => {
    render(
      <FeeCollectionTable
        academicFilters={
          {
            selectedMedium: 'medium',
            isReady: true,
            filterPayload: { boardId: 'board', educationMediumId: 'medium' },
          } as any
        }
        onAddFee={{} as any}
        onCollectFee={vi.fn()}
        onView={vi.fn()}
        onGiveAdjustment={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const unassignedRow = screen.getByText('Sara Hiren Akbari (10096)').closest('tr')!;
    expect(within(unassignedRow).getByText('No Fee Assigned')).toBeVisible();
    expect(within(unassignedRow).queryByText('Paid')).not.toBeInTheDocument();
    const paidRow = screen.getByText('Paid Student').closest('tr')!;
    expect(within(paidRow).getByText('Paid')).toBeVisible();
    expect(screen.getByRole('option', { name: 'No Fee Assigned' })).toHaveValue('7');
  });
});
