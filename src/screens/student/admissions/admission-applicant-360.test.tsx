import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import AdmissionApplicant360Screen from './admission-applicant-360';

const refetch = vi.fn();
const push = vi.fn();
let queryState: {
  data?: AdmissionApplicant360;
  isLoading: boolean;
  isError: boolean;
  refetch: typeof refetch;
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'applicant-1' }),
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams('inquiryId=inquiry-1'),
}));

vi.mock('src/redux/student/admissions/admission-applicants-api', () => ({
  useGetAdmissionApplicant360Query: () => queryState,
}));

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));

vi.mock('./applicant-360/admission-applicant-profile-card', () => ({
  AdmissionApplicantProfileCard: () => <div>Applicant identity summary</div>,
}));

vi.mock('./applicant-360/admission-applicant-applications-card', () => ({
  AdmissionApplicantApplicationsCard: () => <div>Applicant admission workspace</div>,
}));

const data: AdmissionApplicant360 = {
  applicant: {
    id: 'applicant-1',
    familyId: 'family-1',
    firstName: 'Parth',
    lastName: 'Patel',
  },
  applications: [],
  activities: [],
  notes: [],
};

describe('AdmissionApplicant360Screen', () => {
  beforeEach(() => {
    refetch.mockReset();
    push.mockReset();
  });

  it('shows the applicant workspace loading state', () => {
    queryState = { isLoading: true, isError: false, refetch };
    render(<AdmissionApplicant360Screen />);

    expect(screen.getByRole('heading', { name: 'Applicant 360' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading applicant workspace' })).toBeInTheDocument();
  });

  it('shows a recoverable error state', () => {
    queryState = { isLoading: false, isError: true, refetch };
    render(<AdmissionApplicant360Screen />);

    expect(screen.getByText(/Applicant 360 could not be loaded/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('renders the identity summary and admission workspace from fetched data', () => {
    queryState = { data, isLoading: false, isError: false, refetch };
    render(<AdmissionApplicant360Screen />);

    expect(screen.getByText('Applicant identity summary')).toBeInTheDocument();
    expect(screen.getByText('Applicant admission workspace')).toBeInTheDocument();
  });
});
