import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

import StudentOnboardingFees from './student-onboarding-fees';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/finance/FeeStructureAssign/Components/AssignmentDrawer', () => ({ default: () => null }));
vi.mock('react-redux', () => ({ useSelector: (select: (state: unknown) => unknown) => select({
  auth: { permissions: [{ name: `${financePermissions.fees.collections}.Add`, isGranted: true }] },
}) }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => ({ data: {
    id: 'case-1', studentName: 'Jay QA', grNumber: 'QA29-000001', academicYearName: '2026-2027',
    feeAssignmentConfirmed: true, firstPaymentConfirmed: true, status: 4,
  }, isFetching: false, refetch: vi.fn() }),
}));

describe('Onboarding uses unchanged Finance navigation', () => {
  it('opens the standard Finance route and tells staff to select the student themselves', () => {
    render(<StudentOnboardingFees caseId="case-1" />);
    expect(screen.getByRole('link', { name: 'Open Finance collections' }))
      .toHaveAttribute('href', financePaths.fees.collections);
    expect(screen.getByText(/find Jay QA/)).toHaveTextContent('GR QA29-000001');
    expect(screen.getByText(/does not preselect this onboarding case/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View fee account' })).not.toBeInTheDocument();
  });
});
