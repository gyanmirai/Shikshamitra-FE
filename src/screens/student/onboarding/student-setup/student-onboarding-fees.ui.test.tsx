import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

import StudentOnboardingFees from './student-onboarding-fees';

const mocks = vi.hoisted(() => ({
  refreshReadiness: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  refetch: vi.fn(),
  isError: false,
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/screens/finance/FeeStructureAssign/Components/AssignmentDrawer', () => ({ default: () => null }));
vi.mock('react-redux', () => ({ useSelector: (select: (state: unknown) => unknown) => select({
  auth: { permissions: [
    { name: `${financePermissions.fees.collections}.Add`, isGranted: true },
    { name: 'Students.Onboarding.Add', isGranted: true },
  ] },
}) }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => ({ data: mocks.isError ? undefined : {
    id: 'case-1', studentName: 'Jay QA', grNumber: 'QA29-000001', academicYearName: '2026-2027',
    feeAssignmentConfirmed: true, firstPaymentConfirmed: true, status: 6,
    studentEnrollmentId: 'enrollment-1', concurrencyStamp: 'case-stamp-1',
  }, isError: mocks.isError, isFetching: false, refetch: mocks.refetch }),
  useRefreshStudentOnboardingReadinessMutation: () => [mocks.refreshReadiness, { isLoading: false }],
}));

describe('Onboarding uses unchanged Finance navigation', () => {
  it('opens the standard Finance route and tells staff to select the student themselves', () => {
    render(<StudentOnboardingFees caseId="case-1" canManage />);
    expect(screen.getByRole('link', { name: 'Open Finance collections' }))
      .toHaveAttribute('href', financePaths.fees.collections);
    expect(screen.getByText(/find Jay QA/)).toHaveTextContent('GR QA29-000001');
    expect(screen.getByText(/does not preselect this onboarding case/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View fee account' })).not.toBeInTheDocument();
  });

  it('rechecks the backend completion gate after Finance confirms payment', async () => {
    mocks.refreshReadiness.mockClear();
    render(<StudentOnboardingFees caseId="case-1" canManage />);
    fireEvent.click(screen.getByRole('button', { name: 'Recheck payment and onboarding' }));
    await waitFor(() => expect(mocks.refreshReadiness).toHaveBeenCalledWith({
      id: 'case-1', concurrencyStamp: 'case-stamp-1',
    }));
  });

  it('explains why a viewer cannot recheck the completion gate', () => {
    render(<StudentOnboardingFees caseId="case-1" canManage={false} />);
    expect(screen.getByRole('button', { name: 'Recheck payment and onboarding' })).toBeDisabled();
    expect(screen.getByText(/authorized Student Onboarding user/)).toBeInTheDocument();
  });

  it('offers a retry when fee readiness cannot be loaded', () => {
    mocks.isError = true;
    mocks.refetch.mockClear();
    try {
      render(<StudentOnboardingFees caseId="case-1" canManage />);
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(mocks.refetch).toHaveBeenCalledOnce();
    } finally {
      mocks.isError = false;
    }
  });
});
