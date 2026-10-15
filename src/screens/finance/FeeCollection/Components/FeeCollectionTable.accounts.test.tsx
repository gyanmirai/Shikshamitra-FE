import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import FeeCollectionTable from './FeeCollectionTable';

const { rows } = vi.hoisted(() => ({
  rows: [
    {
      studentId: null,
      financeFeeAccountId: 'account-one',
      studentName: 'QA Applicant One',
      totalFees: 1000,
      paidFees: 200,
      pendingFees: 800,
      status: 0,
    },
    {
      studentId: null,
      financeFeeAccountId: 'account-two',
      studentName: 'QA Applicant Two',
      totalFees: 500,
      paidFees: 100,
      pendingFees: 400,
      status: 0,
    },
    {
      studentId: 'real-student',
      financeFeeAccountId: 'linked-account',
      studentName: 'QA Linked Student',
      totalFees: 1000,
      paidFees: 400,
      pendingFees: 600,
      status: 0,
    },
  ],
}));

vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year' } }) }));
vi.mock('src/redux/feeCollection/feeCollection', () => ({ useGetFeeCollectionListQuery: vi.fn() }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({ data: { items: rows, totalCount: 3 }, isLoading: false, isFetching: false }),
}));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <>
      {actions.map((action: any) => (
        <button type="button" key={action.id} disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <table>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.id} data-testid={row.id}>
            <td>{row.name}</td>
            <td>{row.pendingFees}</td>
            <td>{columns.find((column: any) => column.id === 'action').render(undefined, row)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

describe('Finance applicant summary actions', () => {
  it('uses account row identity and preserves balances without sending fake Student IDs', () => {
    const collect = vi.fn();
    const view = vi.fn();
    const adjust = vi.fn();
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
        onDelete={vi.fn()}
        onCollectFee={collect}
        onView={view}
        onGiveAdjustment={adjust}
      />
    );

    const applicant = within(screen.getByTestId('account-one'));
    expect(applicant.getByText('800')).toBeVisible();
    expect(applicant.getByRole('button', { name: 'Collect Fee' })).toBeDisabled();
    expect(applicant.getByRole('button', { name: 'View Details' })).toBeDisabled();
    expect(applicant.getByRole('button', { name: 'Give Fees Adjustment' })).toBeDisabled();
    fireEvent.click(applicant.getByRole('button', { name: 'Collect Fee' }));
    expect(collect).not.toHaveBeenCalled();
    expect(view).not.toHaveBeenCalled();
    expect(adjust).not.toHaveBeenCalled();
    expect(screen.getByTestId('account-two')).toBeVisible();

    fireEvent.click(
      within(screen.getByTestId('real-student')).getByRole('button', { name: 'Collect Fee' })
    );
    expect(collect).toHaveBeenCalledOnce();
    expect(collect.mock.calls[0][0].id).toBe('real-student');
    expect(collect.mock.calls[0][0].financeFeeAccountId).toBe('linked-account');
  });
});
