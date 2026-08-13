import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ApplicantContextRail } from './applicant-context-rail';

vi.mock('react-redux', () => ({
  useSelector: () => [],
}));

vi.mock('src/redux/student/admissions-crm/core-leads-api', () => ({
  useGetAdmissionCrmStaffQuery: () => ({ data: [], isFetching: false, isError: false }),
  useAssignAdmissionCrmLeadOwnerMutation: () => [vi.fn(), { isLoading: false }],
  useChangeAdmissionCrmLeadPriorityMutation: () => [vi.fn(), { isLoading: false }],
}));

const lead = {
  id: 'lead-1',
  leadScore: 60,
  priority: 2,
  intendedRouteNameSnapshot: 'Sibling Priority',
  intendedRouteDefinitionVersion: 1,
} as AdmissionCrmLeadDto;

const renderRail = (hasRegistration: boolean, canViewGovernance: boolean) => {
  const onOpenGovernance = vi.fn();
  render(
    <ApplicantContextRail
      lead={lead}
      academicYearId="year-1"
      hasRegistration={hasRegistration}
      canViewGovernance={canViewGovernance}
      onOpenGovernance={onOpenGovernance}
      refetchLead={() => Promise.resolve()}
    />
  );
  return onOpenGovernance;
};

describe('Applicant context rail', () => {
  it.each([
    [false, false],
    [true, false],
    [false, true],
  ])(
    'omits the Additional Checks card when availability is %s and permission is %s',
    (hasRegistration, canViewGovernance) => {
      renderRail(hasRegistration, canViewGovernance);

      expect(screen.queryByTestId('applicant-additional-checks')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Additional Checks' })).not.toBeInTheDocument();
    }
  );

  it('shows Additional Checks only when registration and permission are both available', () => {
    const onOpenGovernance = renderRail(true, true);

    expect(screen.getByTestId('applicant-additional-checks')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Additional Checks' }));
    expect(onOpenGovernance).toHaveBeenCalledOnce();
  });
});
