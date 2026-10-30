import type { ComponentProps } from 'react';

import { Tabs } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import StudentSetupDrawer from './student-setup-drawer';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';

const mocks = vi.hoisted(() => ({
  activationPreview: {
    status: 2,
    primaryBlocker: 'Final readiness and activation',
    progressPercent: 100,
    concurrencyStamp: 'latest-case-stamp',
    lastError: null as string | null,
    studentEnrollmentId: null as string | null,
  },
  caseEvents: null as
    | null
    | {
        id: string;
        eventType: string;
        description: string;
        occurredAt: string;
        actorName: string;
      }[],
  activationPreviewFetching: false,
  activationPreviewError: false,
  capturedFields: [
    { key: 'Medical.BloodGroup', label: 'Blood group', value: 'O+' },
    { key: 'PreviousSchool.Name', label: 'Previous school name', value: 'Sample School' },
  ],
  capturedFieldsAvailable: true,
  capturedFieldsLoading: false,
  capturedFieldsError: false,
  refetchCapturedFields: vi.fn(),
  feesRendered: vi.fn(),
  detailsCaseId: undefined as string | undefined,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({
    children,
    guardUnsavedChanges,
    ...props
  }: ComponentProps<typeof Tabs> & {
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
    currentData:
      mocks.detailsCaseId && mocks.capturedFieldsAvailable
        ? { id: mocks.detailsCaseId, events: [], capturedStudentFields: mocks.capturedFields }
        : mocks.caseEvents
          ? { id: 'case-1', applicantId: 'applicant-1', events: mocks.caseEvents }
          : undefined,
    data: mocks.capturedFieldsAvailable
      ? { capturedStudentFields: mocks.capturedFields }
      : undefined,
    isFetching: mocks.capturedFieldsLoading,
    isError: mocks.capturedFieldsError,
    refetch: mocks.refetchCapturedFields,
  }),
  usePreviewStudentOnboardingActivationQuery: () => ({
    data: mocks.activationPreview,
    isFetching: mocks.activationPreviewFetching,
    isError: mocks.activationPreviewError,
  }),
  useUpdateStudentOnboardingStepMutation: () => [vi.fn(), { isLoading: false }],
  useReviewStudentOnboardingRequirementsMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('./student-onboarding-workflow-documents', () => ({ default: () => null }));
vi.mock('./student-onboarding-fees', () => ({
  default: () => {
    mocks.feesRendered();
    return null;
  },
}));
vi.mock('./student-onboarding-portal-accounts', () => ({
  default: ({
    onBusyChange,
    onParentStateChange,
    student: current,
  }: {
    onBusyChange?: (busy: boolean) => void;
    onParentStateChange?: (state: any) => void;
    student: { id: string };
  }) => (
    <>
      <button type="button" onClick={() => onBusyChange?.(true)}>
        Simulate credential request
      </button>
      <button type="button" onClick={() => onBusyChange?.(false)}>
        Complete credential request
      </button>
      <button
        type="button"
        onClick={() =>
          onParentStateChange?.({
            caseId: current.id,
            loaded: true,
            selection: {
              relationship: 'mother',
              expectedEmail: 'mother@example.com',
              expectedUserId: 'parent-2',
            },
          })
        }
      >
        Choose sibling parent
      </button>
    </>
  ),
}));
vi.mock('./student-onboarding-case-operations', () => ({ default: () => null }));

const student = studentOnboardingTestData[0];

beforeEach(async () => {
  // Let the previous mount's StrictMode-safe notice release finish before reusing its message.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});

describe('Student Setup drawer readiness UI', () => {
  it('explains in Fees help that fee assignment and payment do not block activation', async () => {
    render(
      <StudentSetupDrawer
        open
        taskView="fees"
        student={{ ...student, source: 'onboarding-case' }}
        onClose={vi.fn()}
      />
    );
    fireEvent.mouseOver(screen.getByRole('button', { name: 'Fee structure information' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Fee assignment and payment are optional and do not block activation.'
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.caseEvents = null;
    mocks.detailsCaseId = undefined;
    mocks.activationPreview = {
      status: 2,
      primaryBlocker: 'Final readiness and activation',
      progressPercent: 100,
      concurrencyStamp: 'latest-case-stamp',
      lastError: null,
      studentEnrollmentId: null,
    };
    mocks.activationPreviewFetching = false;
    mocks.activationPreviewError = false;
    mocks.capturedFieldsAvailable = true;
    mocks.capturedFieldsLoading = false;
    mocks.capturedFieldsError = false;
  });

  it('keeps the credentials drawer open while its send action is pending', () => {
    const onClose = vi.fn();
    render(
      <StudentSetupDrawer
        open
        taskView="credentials"
        canManage
        student={{ ...student, source: 'onboarding-case' }}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Simulate credential request' }));
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close Student Setup' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('heading', { name: student.studentName }), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Complete credential request' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows only saved Admission and Placement & Identifiers in the dedicated details drawer', () => {
    mocks.detailsCaseId = student.id;
    const onClose = vi.fn();
    render(
      <StudentSetupDrawer
        open
        presentation="details"
        initialView="tasks"
        canManage
        student={{ ...student, source: 'onboarding-case', studentEnrollmentId: null, rollNo: null }}
        onClose={onClose}
        onAssignDivision={vi.fn()}
        onAssignGrNumber={vi.fn()}
        onAssignRollNumber={vi.fn()}
        onPrimaryAction={vi.fn()}
      />
    );
    const drawer = screen.getByRole('dialog', { name: student.studentName });
    expect(
      within(drawer)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual(['Admission', 'Placement & Identifiers']);
    expect(screen.getByText('Blood group')).toBeVisible();
    expect(screen.getByText('O+')).toBeVisible();
    expect(screen.getByText('Roll number').nextElementSibling).toHaveTextContent('0');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    expect(screen.queryByText('Documents')).not.toBeInTheDocument();
    expect(screen.queryByText('Readiness & Activation')).not.toBeInTheDocument();
    expect(screen.queryByText('Case Actions')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate Student' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assign Division' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Simulate credential request' })
    ).not.toBeInTheDocument();
    expect(mocks.feesRendered).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('retains details-only loading and reports admission detail failures through the standard toast', async () => {
    mocks.capturedFieldsAvailable = false;
    mocks.capturedFieldsLoading = true;
    const props = {
      open: true,
      presentation: 'details' as const,
      student: { ...student, source: 'onboarding-case' as const },
      onClose: vi.fn(),
    };
    const { rerender } = render(<StudentSetupDrawer {...props} />);
    expect(screen.getByLabelText('Loading additional admission details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
    mocks.capturedFieldsLoading = false;
    mocks.capturedFieldsError = true;
    rerender(<StudentSetupDrawer {...props} />);
    await waitFor(() =>
      expect(shikshaMitraToast.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Additional admission details could not be loaded.' })
      )
    );
    expect(
      screen.queryByText('Additional admission details could not be loaded.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(mocks.refetchCapturedFields).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('does not show captured fields from a previous case in the read-only drawer', () => {
    mocks.detailsCaseId = 'previous-case';
    mocks.capturedFieldsLoading = true;
    render(
      <StudentSetupDrawer
        open
        presentation="details"
        student={{ ...student, source: 'onboarding-case' }}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText('Blood group')).not.toBeInTheDocument();
    expect(screen.queryByText('O+')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Loading additional admission details')).toBeInTheDocument();
  });

  it('offers assignment for a pending division and change only after an actual placement', () => {
    const onAssignDivision = vi.fn();
    const pendingStudent = {
      ...student,
      source: 'onboarding-case' as const,
      divisionId: null,
      divisionName: 'Pending',
      studentEnrollmentId: null,
    };
    const { rerender } = render(
      <StudentSetupDrawer
        open
        canManage
        student={pendingStudent}
        onClose={vi.fn()}
        onAssignDivision={onAssignDivision}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Details & Checks' }));
    expect(screen.queryByRole('button', { name: 'Change Division' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Assign Division' }));
    expect(onAssignDivision).toHaveBeenCalledOnce();
    rerender(
      <StudentSetupDrawer
        open
        canManage
        student={{ ...pendingStudent, divisionId: 'division-a', divisionName: 'A' }}
        onClose={vi.fn()}
        onAssignDivision={onAssignDivision}
      />
    );
    expect(screen.getByRole('button', { name: 'Change Division' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assign Division' })).not.toBeInTheDocument();
  });
  it('shows only GR requirements and actions from the GR tab', () => {
    render(
      <StudentSetupDrawer
        open
        taskView="gr-number"
        canManage
        student={{ ...student, source: 'onboarding-case', backendStatus: 1 }}
        onClose={vi.fn()}
        onAssignGrNumber={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: 'GR number' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign / Change GR' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Details & Checks' })).not.toBeInTheDocument();
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
    expect(screen.getByRole('tab', { name: 'Details & Checks' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.queryByRole('tab', { name: 'Checks' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Student onboarding case information' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Read-only admission context handed over from Enrollment.')
    ).not.toBeInTheDocument();
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

    expect(screen.getByRole('heading', { name: 'Readiness & Activation' })).toBeInTheDocument();
    expect(screen.queryByText(/Owner:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Admission approved')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show 3 passed checks' }));
    expect(screen.getByText('Admission approved')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'History' }));
    expect(screen.getByRole('heading', { name: 'Activity & Audit' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Refresh Readiness' })).toBeDisabled();
    expect(
      screen.getByText(/no onboarding case, so activation is unavailable/i)
    ).toBeInTheDocument();
  });

  it('does not render a drawer when no student is selected', () => {
    render(<StudentSetupDrawer open student={null} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('distinguishes completed readiness checks from an action-required case', () => {
    render(
      <StudentSetupDrawer
        open
        onClose={vi.fn()}
        student={{
          ...student,
          source: 'onboarding-case',
          status: 'action-required',
          readinessItems: student.readinessItems.map((check) => ({ ...check, status: 'passed' })),
        }}
      />
    );

    expect(screen.getByRole('tab', { name: 'Tasks' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Complete service handoffs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5 of 5 checks passed' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '5 of 5 checks passed' }));
    expect(screen.getByRole('tab', { name: 'Details & Checks' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    const combinedPanel = screen.getByRole('tabpanel', { name: 'Details & Checks' });
    expect(within(combinedPanel).getByRole('heading', { name: 'Admission' })).toBeInTheDocument();
    expect(
      within(combinedPanel).getByRole('heading', { name: 'Placement & Identifiers' })
    ).toBeInTheDocument();
    expect(
      within(combinedPanel).getByRole('heading', { name: 'Readiness & Activation' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show 5 passed checks' })).toBeInTheDocument();
  });

  it('shows incomplete readiness and the next required service when preparation checks have passed', () => {
    render(
      <StudentSetupDrawer
        open
        onClose={vi.fn()}
        student={{
          ...student,
          source: 'onboarding-case',
          status: 'action-required',
          studentEnrollmentId: 'enrollment-1',
          readinessItems: [
            ...Array.from({ length: 8 }, (_, index) => ({
              ...student.readinessItems[0],
              key: `preparation-${index}`,
              label: `Preparation ${index + 1}`,
              status: 'passed' as const,
              blocking: false,
            })),
            {
              key: 'guardian-account',
              label: 'Parent app login',
              detail: 'Parent account could not be linked.',
              status: 'failed',
              blocking: true,
              owner: 'Onboarding',
            },
          ],
        }}
      />
    );
    expect(screen.getByRole('button', { name: '8 of 9 checks passed' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '8 of 8 checks passed' })).not.toBeInTheDocument();
    expect(screen.getByText('Next: Parent app login')).toBeInTheDocument();
    expect(screen.queryByText('Ready to activate')).not.toBeInTheDocument();
  });

  it('does not offer a nonfunctional student-record action or misleading optional Finance check', () => {
    render(
      <StudentSetupDrawer
        open
        canManage
        onClose={vi.fn()}
        student={{
          ...student,
          source: 'onboarding-case',
          status: 'completed',
          backendStatus: 4,
          studentEnrollmentId: 'enrollment-1',
          readinessItems: [
            {
              key: 'finance_accounts_services',
              label: 'Finance, accounts, and optional services',
              detail: '',
              status: 'not-required',
              blocking: false,
              owner: 'Student Onboarding',
            },
          ],
        }}
      />
    );
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
    fireEvent.click(screen.getByRole('tab', { name: 'Details & Checks' }));
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
  it('passes an explicitly selected sibling parent from App Login through the legacy activation callback', async () => {
    const onPrimaryAction = vi.fn();
    const liveStudent = {
      ...student,
      id: 'case-1',
      source: 'onboarding-case' as const,
      status: 'ready-to-activate' as const,
      backendStatus: 2 as const,
      studentEnrollmentId: undefined,
    };
    const view = render(
      <StudentSetupDrawer
        open
        canManage
        student={liveStudent}
        taskView="credentials"
        onClose={vi.fn()}
        onPrimaryAction={onPrimaryAction}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Choose sibling parent' }));
    view.rerender(
      <StudentSetupDrawer
        open
        canManage
        student={liveStudent}
        taskView="readiness"
        onClose={vi.fn()}
        onPrimaryAction={onPrimaryAction}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Activate student' })).toBeEnabled()
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Activate student' }));
    });
    expect(onPrimaryAction).toHaveBeenCalledWith(liveStudent, 'latest-case-stamp', 'activate', {
      relationship: 'mother',
      expectedEmail: 'mother@example.com',
      expectedUserId: 'parent-2',
    });
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

  it.each([1, 2])(
    'shows the actual preview blocker and prevents activation for status %s',
    (status) => {
      mocks.activationPreview.status = status;
      mocks.activationPreview.lastError = 'The seat reservation has expired.';
      const onPrimaryAction = vi.fn();
      render(
        <StudentSetupDrawer
          open
          canManage
          student={{ ...student, source: 'onboarding-case', backendStatus: 2 }}
          onClose={vi.fn()}
          onPrimaryAction={onPrimaryAction}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
      const dialog = screen.getByRole('dialog', { name: 'Activate Student' });
      expect(
        within(dialog).getByText('The seat reservation has expired.', { exact: false })
      ).toBeVisible();
      expect(within(dialog).queryByText('Final readiness and activation')).not.toBeInTheDocument();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Activate student' }));
      expect(within(dialog).getByRole('button', { name: 'Activate student' })).toBeDisabled();
      expect(onPrimaryAction).not.toHaveBeenCalled();
    }
  );

  it('keeps the primary-blocker fallback for older preview responses', () => {
    mocks.activationPreview.status = 1;
    mocks.activationPreview.primaryBlocker = 'Documents and compliance';
    render(
      <StudentSetupDrawer
        open
        canManage
        student={{ ...student, source: 'onboarding-case', backendStatus: 2 }}
        onClose={vi.fn()}
        onPrimaryAction={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
    expect(screen.getByText('Documents and compliance', { exact: false })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Activate student' })).toBeDisabled();
  });

  it.each(['loading', 'error'] as const)(
    'keeps activation disabled during preview %s without showing stale blockers',
    async (state) => {
      mocks.activationPreview.lastError = 'An outdated blocker';
      mocks.activationPreviewFetching = state === 'loading';
      mocks.activationPreviewError = state === 'error';
      render(
        <StudentSetupDrawer
          open
          canManage
          student={{ ...student, source: 'onboarding-case', backendStatus: 2 }}
          onClose={vi.fn()}
          onPrimaryAction={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
      expect(screen.getByRole('button', { name: 'Activate student' })).toBeDisabled();
      expect(screen.queryByText('An outdated blocker')).not.toBeInTheDocument();
      if (state === 'loading')
        expect(
          screen.getByRole('progressbar', { name: 'Checking activation readiness' })
        ).toBeInTheDocument();
      else {
        await waitFor(() =>
          expect(shikshaMitraToast.error).toHaveBeenCalledWith(
            expect.objectContaining({
              message: expect.stringContaining(
                'The latest activation preview could not be loaded.'
              ),
            })
          )
        );
        expect(
          screen.queryByText('The latest activation preview could not be loaded.', { exact: false })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
        expect(
          within(screen.getByRole('dialog', { name: 'Activate Student' })).getByRole('button', {
            name: 'Cancel',
          })
        ).toBeEnabled();
      }
    }
  );

  it('keeps activation unavailable to a view-only user', () => {
    render(
      <StudentSetupDrawer
        open
        canManage={false}
        student={{ ...student, source: 'onboarding-case', backendStatus: 2 }}
        onClose={vi.fn()}
        onPrimaryAction={vi.fn()}
      />
    );
    const activate = screen.getByRole('button', { name: 'Activate Student' });
    expect(activate).toBeDisabled();
    fireEvent.click(activate);
    expect(screen.queryByRole('dialog', { name: 'Activate Student' })).not.toBeInTheDocument();
  });

  it('locks the activation dialog against competing close actions while activation is pending', () => {
    const liveStudent = {
      ...student,
      source: 'onboarding-case' as const,
      backendStatus: 2 as const,
    };
    const props = {
      open: true,
      canManage: true,
      student: liveStudent,
      onClose: vi.fn(),
      onPrimaryAction: vi.fn(),
    };
    const { rerender } = render(<StudentSetupDrawer {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Activate Student' }));
    rerender(<StudentSetupDrawer {...props} primaryActionLoading />);
    const dialog = screen.getByRole('dialog', { name: 'Activate Student' });
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'close' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Activating...' })).toBeDisabled();
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(screen.getByRole('dialog', { name: 'Activate Student' })).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('tab', { name: 'Details & Checks' }));
    expect(screen.getByRole('link', { name: 'Open student record' })).toHaveAttribute(
      'href',
      `/student/profile?student=${liveStudent.studentId}&tab=general`
    );
    expect(
      screen.queryByRole('button', { name: 'Review exception for Address and communication' })
    ).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('tab', { name: 'Details & Checks' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Record approval for Onboarding approval' })
    );
    expect(screen.getByRole('heading', { name: 'Approve Onboarding' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve onboarding' })).toBeDisabled();
  });

  it('retains combined-panel loading and reports admission detail failures through the standard toast', async () => {
    mocks.capturedFieldsAvailable = false;
    mocks.capturedFieldsLoading = true;
    const liveStudent = {
      ...student,
      source: 'onboarding-case' as const,
      backendStatus: 4 as const,
    };
    const { rerender } = render(
      <StudentSetupDrawer open student={liveStudent} onClose={vi.fn()} />
    );

    expect(
      screen.getByRole('status', { name: 'Loading additional admission details' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Readiness & Activation' })).toBeInTheDocument();
    mocks.capturedFieldsLoading = false;
    mocks.capturedFieldsError = true;
    rerender(<StudentSetupDrawer open student={liveStudent} onClose={vi.fn()} />);

    await waitFor(() =>
      expect(shikshaMitraToast.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Additional admission details could not be loaded.' })
      )
    );
    expect(
      screen.queryByText('Additional admission details could not be loaded.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(mocks.refetchCapturedFields).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  });

  it('keeps requirement review actions unavailable without manage permission', () => {
    const liveStudent = {
      ...student,
      source: 'onboarding-case' as const,
      readinessItems: [
        {
          key: 'approval_review',
          label: 'Onboarding approval',
          detail: '',
          status: 'pending' as const,
          blocking: true,
          owner: 'Student Onboarding',
        },
        {
          key: 'documents',
          label: 'Required evidence',
          detail: '',
          status: 'failed' as const,
          blocking: true,
          owner: 'Student Onboarding',
        },
      ],
    };
    render(<StudentSetupDrawer open student={liveStudent} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Details & Checks' }));

    expect(screen.getByText('Onboarding approval')).toBeInTheDocument();
    expect(screen.getByText('Required evidence')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Record approval for Onboarding approval' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Review exception for Required evidence' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change Division' })).not.toBeInTheDocument();
  });

  it('locks combined-panel actions, tab navigation and close during the primary mutation', () => {
    const onAssignDivision = vi.fn();
    const onAssignGrNumber = vi.fn();
    const onAssignRollNumber = vi.fn();
    const onClose = vi.fn();
    const liveStudent = {
      ...student,
      source: 'onboarding-case' as const,
      readinessItems: [
        {
          key: 'approval_review',
          label: 'Onboarding approval',
          detail: '',
          status: 'pending' as const,
          blocking: true,
          owner: 'Student Onboarding',
        },
        {
          key: 'documents',
          label: 'Required evidence',
          detail: '',
          status: 'failed' as const,
          blocking: true,
          owner: 'Student Onboarding',
        },
        {
          key: 'admission',
          label: 'Admission approved',
          detail: '',
          status: 'passed' as const,
          blocking: true,
          owner: 'Student Onboarding',
        },
      ],
    };
    const drawerProps = {
      open: true,
      canManage: true,
      student: liveStudent,
      onClose,
      onAssignDivision,
      onAssignGrNumber,
      onAssignRollNumber,
    };
    const { rerender } = render(<StudentSetupDrawer {...drawerProps} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Details & Checks' }));
    rerender(<StudentSetupDrawer {...drawerProps} primaryActionLoading />);

    [
      'Change Division',
      'Assign GR No.',
      'Assign Roll No.',
      'Record approval for Onboarding approval',
      'Review exception for Required evidence',
      'Show 1 passed check',
      'Close',
      'Close Student Setup',
    ].forEach((name) => {
      const button = screen.getByRole('button', { name });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    });
    expect(screen.getByRole('tab', { name: 'Tasks' })).toBeDisabled();
    fireEvent.click(screen.getByRole('tab', { name: 'Tasks' }));
    expect(screen.getByRole('tab', { name: 'Details & Checks' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.queryByRole('heading', { name: 'Approve Onboarding' })).not.toBeInTheDocument();
    expect(onAssignDivision).not.toHaveBeenCalled();
    expect(onAssignGrNumber).not.toHaveBeenCalled();
    expect(onAssignRollNumber).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    rerender(<StudentSetupDrawer {...drawerProps} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Record approval for Onboarding approval' })
    );
    expect(screen.getByRole('heading', { name: 'Approve Onboarding' })).toBeInTheDocument();
  });
});

it('loads full event history even when the paged worklist has no events', () => {
  mocks.caseEvents = [
    {
      id: 'event-1',
      eventType: 'ReadinessRefreshed',
      description: 'Prepared without an owner',
      occurredAt: '2026-10-22T09:00:00Z',
      actorName: 'Asha Sharma',
    },
  ];
  render(
    <StudentSetupDrawer
      open
      student={{ ...student, id: 'case-1', source: 'onboarding-case', activity: [] }}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('tab', { name: 'History' }));
  expect(screen.getByText(/Handled by: Asha Sharma/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Activity & Audit' })).toBeInTheDocument();
});

it('shows a pending history read instead of treating the paged worklist as empty history', () => {
  mocks.caseEvents = null;
  mocks.capturedFieldsLoading = true;
  mocks.capturedFieldsError = false;
  render(
    <StudentSetupDrawer
      open
      student={{ ...student, id: 'case-1', source: 'onboarding-case', activity: [] }}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('tab', { name: 'History' }));
  expect(screen.getByLabelText('Loading handling history')).toBeVisible();
  expect(screen.queryByText('No onboarding activity recorded yet.')).not.toBeInTheDocument();
});

it('uses the standard history-error toast and withholds stale events after a failed case read', async () => {
  mocks.caseEvents = null;
  mocks.capturedFieldsLoading = false;
  mocks.capturedFieldsError = true;
  mocks.refetchCapturedFields.mockClear();
  render(
    <StudentSetupDrawer
      open
      student={{ ...student, id: 'case-1', source: 'onboarding-case', activity: [] }}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('tab', { name: 'History' }));
  await waitFor(() =>
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Handling history could not be loaded.' })
    )
  );
  expect(screen.queryByText('Handling history could not be loaded.')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  expect(screen.queryByText('No onboarding activity recorded yet.')).not.toBeInTheDocument();
  expect(screen.queryByText(/Handled by:/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  expect(mocks.refetchCapturedFields).not.toHaveBeenCalled();
});

it('does not show the previous student actor when the current case changes', () => {
  mocks.caseEvents = [
    {
      id: 'old-event',
      eventType: 'ReadinessRefreshed',
      description: 'Old case action',
      occurredAt: '2026-10-22T09:00:00Z',
      actorName: 'Previous Student Staff',
    },
  ];
  mocks.capturedFieldsLoading = false;
  mocks.capturedFieldsError = false;
  render(
    <StudentSetupDrawer
      open
      student={{ ...student, id: 'case-2', source: 'onboarding-case', activity: [] }}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('tab', { name: 'History' }));
  expect(screen.queryByText(/Previous Student Staff/)).not.toBeInTheDocument();
});
