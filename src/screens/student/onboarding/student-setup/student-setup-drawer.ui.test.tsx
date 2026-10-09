import type { ComponentProps } from 'react';

import { Tabs } from '@mui/material';
import { it, vi, expect, describe } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentSetupDrawer from './student-setup-drawer';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';

const mocks = vi.hoisted(() => ({
  activationPreview: {
    status: 2,
    primaryBlocker: 'Final readiness and activation',
    progressPercent: 100,
    concurrencyStamp: 'latest-case-stamp',
  },
  capturedFields: [
    { key: 'Medical.BloodGroup', label: 'Blood group', value: 'O+' },
    { key: 'PreviousSchool.Name', label: 'Previous school name', value: 'Sample School' },
  ],
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children, guardUnsavedChanges, ...props }: ComponentProps<typeof Tabs> & {
    guardUnsavedChanges?: boolean;
  }) => <Tabs {...props}>{children}</Tabs>,
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ confirmPopup: { isChanges: false } }),
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => ({
    data: { capturedStudentFields: mocks.capturedFields },
  }),
  usePreviewStudentOnboardingActivationQuery: () => ({
    data: mocks.activationPreview,
    isFetching: false,
    isError: false,
  }),
  useUpdateStudentOnboardingStepMutation: () => [vi.fn(), { isLoading: false }],
  useReviewStudentOnboardingRequirementsMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('./student-onboarding-workflow-documents', () => ({ default: () => null }));
vi.mock('./student-onboarding-fees', () => ({ default: () => null }));
vi.mock('./student-onboarding-portal-accounts', () => ({ default: () => null }));
vi.mock('./student-onboarding-case-operations', () => ({ default: () => null }));

const student = studentOnboardingTestData[0];

describe('Student Setup drawer readiness UI', () => {
  it('shows only GR requirements and actions from the GR tab', () => {
    render(<StudentSetupDrawer open taskView="gr-number" canManage student={{ ...student, source: 'onboarding-case', backendStatus: 1 }} onClose={vi.fn()} onAssignGrNumber={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'GR number' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign / Change GR' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Details' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Documents' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Fee structure' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate Student' })).not.toBeInTheDocument();
  });
  it('shows the focused onboarding sections and keeps unlinked record actions disabled', () => {
    const onAssignDivision = vi.fn();
    const onAssignGrNumber = vi.fn();
    const onAssignRollNumber = vi.fn();
    render(
      <StudentSetupDrawer
        open
        canManage
        student={student}
        onClose={vi.fn()}
        onAssignDivision={onAssignDivision}
        onAssignGrNumber={onAssignGrNumber}
        onAssignRollNumber={onAssignRollNumber}
      />
    );

    expect(screen.getByRole('heading', { name: student.studentName })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Tasks' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Student onboarding case information' }))
      .toBeInTheDocument();
    expect(screen.queryByText('Read-only admission context handed over from Enrollment.'))
      .not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Admission' })).toBeInTheDocument();
    expect(screen.getByText('Admission reference').tagName).toBe('DT');
    expect(screen.getByRole('heading', { name: 'Placement & Identifiers' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Accounts & access' })).not.toBeInTheDocument();
    expect(screen.queryByText('GR preview')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Change Division' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assign GR No.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assign Roll No.' }));
    expect(onAssignDivision).toHaveBeenCalledOnce();
    expect(onAssignGrNumber).toHaveBeenCalledOnce();
    expect(onAssignRollNumber).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('tab', { name: 'Checks' }));
    expect(screen.getByRole('heading', { name: 'Readiness & Activation' })).toBeInTheDocument();
    expect(screen.queryByText('Admission approved')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show 3 passed checks' }));
    expect(screen.getByText('Admission approved')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'History' }));
    expect(screen.getByRole('heading', { name: 'Activity & Audit' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Refresh Readiness' })).toBeDisabled();
    expect(screen.getByText(/no onboarding case, so activation is unavailable/i)).toBeInTheDocument();
  });

  it('does not render a drawer when no student is selected', () => {
    render(<StudentSetupDrawer open student={null} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('distinguishes completed readiness checks from an action-required case', () => {
    render(<StudentSetupDrawer open onClose={vi.fn()} student={{
      ...student,
      source: 'onboarding-case',
      status: 'action-required',
      readinessItems: student.readinessItems.map((check) => ({ ...check, status: 'passed' })),
    }} />);

    expect(screen.getByRole('tab', { name: 'Tasks' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Complete service handoffs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5 of 5 checks passed' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Checks' }));
    expect(screen.getByRole('button', { name: 'Show 5 passed checks' })).toBeInTheDocument();
  });

  it('does not offer a nonfunctional student-record action or misleading optional Finance check', () => {
    render(<StudentSetupDrawer open canManage onClose={vi.fn()} student={{
      ...student, source: 'onboarding-case', status: 'completed', backendStatus: 4,
      studentEnrollmentId: 'enrollment-1',
      readinessItems: [{ key: 'finance_accounts_services', label: 'Finance, accounts, and optional services',
        detail: '', status: 'not-required', blocking: false, owner: 'Student Onboarding' }],
    }} />);
    expect(screen.queryByRole('button', { name: 'View Student Record' })).not.toBeInTheDocument();
    expect(screen.queryByText('Finance, accounts, and optional services')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Admission' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Placement & Identifiers' })).toBeInTheDocument();
    expect(screen.getByText('Blood group')).toBeInTheDocument();
    expect(screen.getByText('O+')).toBeInTheDocument();
    expect(screen.getByText('Sample School')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Tasks' }));
    expect(screen.getByRole('heading', { name: 'Fee structure' })).toBeInTheDocument();
    expect(screen.getByText('Portal & Emails')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Case Actions' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Checks' }));
    expect(screen.queryByText('Finance, accounts, and optional services')).not.toBeInTheDocument();
  });

  it('uses the latest backend activation-preview stamp when activation is confirmed', async () => {
    const onPrimaryAction = vi.fn();
    const liveStudent = {
      ...student,
      id: 'case-1',
      source: 'onboarding-case' as const,
      status: 'ready-to-activate' as const,
      backendStatus: 2 as const,
      concurrencyStamp: 'stale-list-stamp',
    };

    render(
      <StudentSetupDrawer
        open
        canManage
        student={liveStudent}
        onClose={vi.fn()}
        onPrimaryAction={onPrimaryAction}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Activate student' })).toBeEnabled()
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Activate student' }));
    });

    expect(onPrimaryAction).toHaveBeenCalledWith(liveStudent, 'latest-case-stamp', 'activate');
  });

  it('offers activation when only the system-owned final-readiness step is pending', () => {
    const onPrimaryAction = vi.fn();
    const liveStudent = {
      ...student,
      id: 'case-1',
      source: 'onboarding-case' as const,
      status: 'awaiting-approval' as const,
      backendStatus: 1 as const,
      readinessItems: [
        {
          key: 'final_readiness',
          label: 'Final readiness',
          detail: 'Completed automatically during activation.',
          status: 'pending' as const,
          blocking: false,
          owner: 'Student Onboarding',
        },
      ],
    };

    render(
      <StudentSetupDrawer
        open
        canManage
        student={liveStudent}
        onClose={vi.fn()}
        onPrimaryAction={onPrimaryAction}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
    expect(screen.getByRole('heading', { name: 'Activate Student' })).toBeInTheDocument();
  });

  it('links a failed communication requirement to the existing student record', () => {
    const liveStudent = {
      ...student,
      id: 'case-1',
      studentId: 'student-1',
      source: 'onboarding-case' as const,
      readinessItems: [
        {
          key: 'communication',
          label: 'Address and communication',
          detail: 'Communication details are incomplete.',
          status: 'failed' as const,
          blocking: true,
          owner: 'Student Onboarding',
        },
      ],
    };

    render(<StudentSetupDrawer open canManage student={liveStudent} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Checks' }));
    expect(screen.getByRole('link', { name: 'Open student record' })).toHaveAttribute(
      'href',
      `/student/profile?student=${liveStudent.studentId}&tab=general`
    );
    expect(screen.queryByRole('button', { name: 'Review exception for Address and communication' })).not.toBeInTheDocument();
  });

  it('offers a pending approval as a distinct audited action', () => {
    const liveStudent = {
      ...student,
      id: 'case-1',
      source: 'onboarding-case' as const,
      readinessItems: [
        {
          key: 'approval_review',
          label: 'Onboarding approval',
          detail: 'Review is required before activation.',
          status: 'pending' as const,
          blocking: true,
          owner: 'Student Onboarding',
        },
      ],
    };

    render(<StudentSetupDrawer open canManage student={liveStudent} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Checks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record approval for Onboarding approval' }));
    expect(screen.getByRole('heading', { name: 'Approve Onboarding' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve onboarding' })).toBeDisabled();
  });
});
