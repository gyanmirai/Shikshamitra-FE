import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import FeeCollectionTable from './FeeCollectionTable';

vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'academic-year' } }),
}));

vi.mock('src/screens/finance/hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({ isReady: true, canView: true, canAdd: true, canDelete: true }),
}));

vi.mock('src/hooks/use-boolean', () => ({ useBoolean: vi.fn() }));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <>
      {actions.map((action: any) => (
        <button
          type="button"
          key={action.id}
          disabled={action.disabled}
          title={action.tooltip}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </>
  ),
}));
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
      totalCount: 5,
      items: [
        {
          studentId: 'future-installments',
          studentName: 'Future Installment Student',
          totalFees: 43000,
          paidFees: 13224,
          pendingFees: 29776,
          overdueFees: 3306,
          isFeeStructureAssigned: true,
          status: FeeCollectionStatusType.Overdue,
        },
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
        {
          studentId: 'partly-overdue',
          studentName: 'Partly Overdue Student',
          totalFees: 18000,
          paidFees: 6000,
          pendingFees: 12000,
          overdueFees: 6000,
          isFeeStructureAssigned: true,
          status: FeeCollectionStatusType.Overdue,
        },
        {
          studentId: 'fully-overdue',
          studentName: 'Fully Overdue Student',
          totalFees: 6000,
          paidFees: 0,
          pendingFees: 6000,
          overdueFees: 6000,
          isFeeStructureAssigned: true,
          status: FeeCollectionStatusType.Overdue,
        },
      ],
    },
    isLoading: false,
    isFetching: false,
  }),
}));

// Keep the real column rendering and Label while isolating table infrastructure.
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data, getRowAction }: any) => {
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
        <table data-status-sort={String(statusColumn.isSort)}>
          <thead>
            <tr>
              {columns.map((column: any) => (
                <th key={column.id}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr
                key={row.studentId}
                tabIndex={getRowAction?.(row) ? 0 : -1}
                onClick={() => getRowAction?.(row)?.onClick()}
              >
                {columns.map((column: any) => (
                  <td
                    key={column.id}
                    onClick={
                      column.id === 'action' ? (event) => event.stopPropagation() : undefined
                    }
                  >
                    {column.render ? column.render(row[column.id], row) : row[column.id]}
                  </td>
                ))}
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
    expect(within(paidRow).getByRole('button', { name: /Collect fee/ })).toBeEnabled();
    expect(
      within(unassignedRow).queryByRole('button', { name: /View details/ })
    ).not.toBeInTheDocument();
    expect(unassignedRow).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('option', { name: 'No Fee Assigned' })).toHaveValue('7');
    expect(screen.getByRole('table')).toHaveAttribute('data-status-sort', 'true');
    const collect = within(unassignedRow).getByRole('button', { name: /Collect fee/ });
    expect(collect).toBeDisabled();
    expect(collect).toHaveAttribute(
      'title',
      'No fee structure assigned. Assign a fee structure to collect fees.'
    );
    expect(screen.queryByRole('button', { name: /Give fee adjustment/ })).not.toBeInTheDocument();
  });

  it('shows the complete pending balance including overdue fees without a separate overdue column', () => {
    render(
      <FeeCollectionTable
        academicFilters={{ selectedMedium: 'medium', isReady: true, filterPayload: {} } as any}
        onAddFee={{} as any}
        onCollectFee={vi.fn()}
        onView={vi.fn()}
        onGiveAdjustment={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByRole('columnheader', { name: 'Overdue Fees' })).not.toBeInTheDocument();
    const pendingIndex = screen
      .getAllByRole('columnheader')
      .findIndex((header) => header.textContent === 'Pending Fees');
    expect(pendingIndex).toBeGreaterThanOrEqual(0);
    [
      ['Future Installment Student', '₹ 29,776'],
      ['Partly Overdue Student', '₹ 12,000'],
      ['Fully Overdue Student', '₹ 6,000'],
      ['Paid Student', '₹ 0'],
    ].forEach(([name, expected]) => {
      const row = screen.getByText(name).closest('tr')!;
      expect(within(row).getAllByRole('cell')[pendingIndex]).toHaveTextContent(expected);
      if (name !== 'Paid Student') expect(within(row).getByText('Overdue')).toBeVisible();
    });
  });
});
