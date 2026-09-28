import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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
  useGetAdmissionClassCapacityQuery: () => ({ currentData: undefined }),
  useGetAdmissionOfferingsQuery: () => ({
    data: {
      items: [
        {
          id: 'offering-1',
          entryMode: 0,
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
  mocks.push.mockReset();
  mocks.startApplication.mockReset();
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

it('disables another offering while an application is active', () => {
  render(
    <AdmissionApplicantStartCard
      applicantId="applicant-1"
      applications={[
        {
          id: 'application-1',
          applicationNumber: 'APP/2026/3a23c67c84f',
          status: 1,
          creationTime: '2026-09-18T06:09:00Z',
          currentStageInstanceId: 'stage-1',
          stages: [
            {
              code: 'APPLICATION_FORM',
              name: 'Application form submitted',
              stageType: 1,
              status: 1,
              displayOrder: 0,
              enteredAt: '2026-09-18T06:09:00Z',
            },
          ],
        },
      ]}
    />
  );

  expect(screen.getByRole('combobox', { name: 'Admission offering' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByRole('button', { name: 'Start application' })).toBeDisabled();
  expect(screen.getByText('Continue application')).toBeInTheDocument();
  expect(screen.queryByText('APP/2026/3a23c67c84f')).not.toBeInTheDocument();
});

it('opens the created application in the full application page', async () => {
  mocks.management.managed = false;
  mocks.management.canStartApplication = true;
  mocks.management.blockers = [];
  mocks.startApplication.mockReturnValue({
    unwrap: () => Promise.resolve({ id: 'application-1' }),
  });

  render(<AdmissionApplicantStartCard applicantId="applicant-1" applications={[]} />);

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Admission offering' }));
  fireEvent.click(await screen.findByRole('option', { name: /Class 4/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Start application' }));

  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledWith('/student/admissions/applications/application-1')
  );
});
