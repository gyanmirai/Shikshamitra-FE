import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AdmissionApplicantStartCard } from './admission-applicant-start-card';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  startApplication: vi.fn(),
  management: {
    managed: true,
    canStartApplication: false,
    blockers: ['Record the first contact.', 'Record a qualified outcome.'],
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams('inquiryId=inquiry-1'),
}));

vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionOfferingsQuery: () => ({
    data: {
      items: [
        {
          id: 'offering-1',
          standardName: 'Class 4',
          boardName: 'CBSE',
          mediumName: 'English',
          admissionCycleName: '2026-2027',
        },
      ],
    },
    isFetching: false,
  }),
}));

vi.mock('src/redux/student/admissions/admission-inquiry-management-api', () => ({
  useGetAdmissionInquiryManagementQuery: () => ({
    data: mocks.management,
    isError: false,
  }),
}));

vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useStartAdmissionApplicationMutation: () => [mocks.startApplication, { isLoading: false }],
}));

beforeEach(() => {
  mocks.management.managed = true;
  mocks.management.canStartApplication = false;
  mocks.management.blockers = ['Record the first contact.', 'Record a qualified outcome.'];
});

it('explains the CRM blocker before staff try to start an application', () => {
  render(<AdmissionApplicantStartCard applicantId="applicant-1" applications={[]} />);

  expect(screen.getByText('Complete the Inquiry handoff first')).toBeInTheDocument();
  expect(screen.getByText(/Record the first contact/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Manage inquiry' })).toHaveAttribute(
    'href',
    '/student/admissions/inquiries?inquiryId=inquiry-1'
  );
  expect(screen.getByRole('button', { name: 'Start application' })).toBeDisabled();
});

it('keeps the application action available for schools using the Basic Inquiry workflow', () => {
  mocks.management.managed = false;
  mocks.management.blockers = [];

  render(<AdmissionApplicantStartCard applicantId="applicant-1" applications={[]} />);

  expect(screen.queryByText('Complete the Inquiry handoff first')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Admission offering' })).toBeEnabled();
});
