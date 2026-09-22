import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentSetupDrawer from './student-setup-drawer';
import { studentOnboardingPreviewData } from './student-onboarding-preview-data';

const mocks = vi.hoisted(() => ({
  activationPreview: {
    status: 2,
    primaryBlocker: 'Final readiness and activation',
    progressPercent: 100,
    concurrencyStamp: 'latest-case-stamp',
  },
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ confirmPopup: { isChanges: false } }),
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  usePreviewStudentOnboardingActivationQuery: () => ({
    data: mocks.activationPreview,
    isFetching: false,
    isError: false,
  }),
  useUpdateStudentOnboardingStepMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('./student-onboarding-documents', () => ({ default: () => null }));
vi.mock('./student-onboarding-case-operations', () => ({ default: () => null }));

const student = studentOnboardingPreviewData[0];

describe('Student Setup drawer readiness UI', () => {
  it('shows the focused onboarding sections and keeps preview actions disabled', () => {
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
    expect(screen.getByRole('heading', { name: 'Admission handoff' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Placement' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Identifiers' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Accounts & access' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Readiness & activation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Activity & audit' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Change Division' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assign GR No.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assign Roll No.' }));
    expect(onAssignDivision).toHaveBeenCalledOnce();
    expect(onAssignGrNumber).toHaveBeenCalledOnce();
    expect(onAssignRollNumber).toHaveBeenCalledOnce();

    expect(screen.getByRole('button', { name: 'Refresh Readiness' })).toBeDisabled();
    expect(screen.getByText(/preview changes are not persisted/i)).toBeInTheDocument();
  });

  it('does not render a drawer when no student is selected', () => {
    render(<StudentSetupDrawer open student={null} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
    expect(screen.getByText('Backend readiness confirmed at 100%.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm activation' }));

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
    expect(screen.getByRole('heading', { name: 'Activate student?' })).toBeInTheDocument();
  });

  it('offers an audited exception review for a failed blocking requirement', () => {
    const liveStudent = {
      ...student,
      id: 'case-1',
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

    fireEvent.click(
      screen.getByRole('button', { name: 'Review exception for Address and communication' })
    );
    expect(
      screen.getByRole('heading', { name: 'Review onboarding exception' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Waive requirement' })).toBeDisabled();
  });
});
