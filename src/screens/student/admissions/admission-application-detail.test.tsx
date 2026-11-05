import { createPortal } from 'react-dom';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionApplicationDetailScreen from './admission-application-detail';

const push = vi.fn();
const replace = vi.fn();
let pathname = '/student/admissions/pipeline/applications/application-1';
let returnParams = new URLSearchParams();
const applicationRefetch = vi.fn();
const formRefetch = vi.fn();
const workflowRefetch = vi.fn();
let detailState: any;
let permissions = [{ name: 'Students.Admissions.Applicants.View', isGranted: true }];
const offeringContext = vi.hoisted(() => vi.fn());
const decisionCardProps = vi.hoisted(() => ({ current: null as any }));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionOfferingQuery: offeringContext,
}));
beforeEach(() => offeringContext.mockReturnValue({ currentData: undefined }));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({ auth: { permissions } }),
}));

vi.mock('./application-detail/application-journey-history', () => ({
  ApplicationJourneyHistory: ({ applicantId }: { applicantId: string }) => (
    <div data-testid="journey-history">Handling history for {applicantId}</div>
  ),
}));
vi.mock('./application-detail/application-activity-drawer', () => ({
  ApplicationActivityDrawer: ({ open, onClose, onBusyChange }: any) =>
    open
      ? createPortal(
          <div role="dialog" aria-label="Notes & Follow-ups">
            <button type="button" onClick={() => onBusyChange(true)}>
              Start saving note
            </button>
            <button type="button" onClick={onClose}>
              Close notes
            </button>
          </div>,
          document.body
        )
      : null,
}));
vi.mock('./application-detail/application-form-correction-drawer', () => ({
  ApplicationFormCorrectionDrawer: ({ open, applicationId, onClose, onSaved, onRefresh }: any) =>
    open ? (
      <div role="dialog" aria-label="Edit Application Form" data-application-id={applicationId}>
        <button type="button" onClick={onClose}>
          Cancel correction
        </button>
        <button
          type="button"
          onClick={() => {
            onSaved();
            onClose();
          }}
        >
          Save correction
        </button>
        <button
          type="button"
          onClick={() => {
            onRefresh();
            onClose();
          }}
        >
          Refresh correction
        </button>
      </div>
    ) : null,
}));

vi.mock('src/components/custom-tooltip', () => ({ default: ({ children }: any) => children }));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({ actions }: any) => <div>{actions({ popover: { onClose: vi.fn() } })}</div>,
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
// Exercise the screen's retry callbacks independently of the shared toast host.
vi.mock('./admission-query-error', () => ({
  AdmissionQueryError: ({ onRetry }: { onRetry: () => void }) => (
    <button type="button" onClick={onRetry}>
      Retry
    </button>
  ),
}));
vi.mock('./application-detail/application-resume-journey', () => ({
  ApplicationResumeJourney: () => (
    <div role="dialog" aria-label="Resume Admission">
      Resume preview
    </div>
  ),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'application-1' }),
  usePathname: () => pathname,
  useSearchParams: () => returnParams,
}));

vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) =>
    createPortal(
      <div role="dialog" aria-label={typeof title === 'string' ? title : undefined}>
        <div>{title}</div>
        {children}
      </div>,
      document.body
    ),
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action, isBack, onBack, backDisabled }: any) => (
    <div>
      {isBack && (
        <button type="button" aria-label="Back" disabled={backDisabled} onClick={onBack} />
      )}
      <h1>{heading}</h1>
      {action}
    </div>
  ),
}));

vi.mock('./application-detail/use-application-detail', () => ({
  useApplicationDetail: () => detailState,
}));

vi.mock('./application-detail/application-progress-card', () => ({
  ApplicationProgressCard: () => <div>Journey workspace</div>,
}));

vi.mock('./application-detail/application-counsellor-card', () => ({
  ApplicationCounsellorCard: ({
    onBusyChange,
    presentation,
    renderHeaderAction,
    disabled,
  }: {
    onBusyChange?: (busy: boolean) => void;
    presentation?: string;
    renderHeaderAction?: (context: {
      canEdit: boolean;
      busy: boolean;
      onEdit: () => void;
    }) => React.ReactNode;
    disabled?: boolean;
  }) => (
    <div data-testid="counsellor-control" data-presentation={presentation}>
      Journey counsellor
      {renderHeaderAction?.({ canEdit: false, busy: Boolean(disabled), onEdit: vi.fn() })}
      <button type="button" onClick={() => onBusyChange?.(true)}>
        Start counsellor update
      </button>
    </div>
  ),
}));

vi.mock('./application-detail/application-current-task', () => ({
  ApplicationCurrentTask: ({ onReviewForm }: { onReviewForm: () => void }) => (
    <button type="button" onClick={onReviewForm}>
      Review form from current step
    </button>
  ),
}));

vi.mock('./application-detail/application-runtime-form', () => ({
  ApplicationRuntimeForm: ({
    readOnly,
    canSubmitForm,
    documents,
  }: {
    readOnly: boolean;
    canSubmitForm: boolean;
    documents?: React.ReactNode;
  }) => (
    <div
      data-testid="runtime-form"
      data-read-only={String(readOnly)}
      data-can-submit={String(canSubmitForm)}
      data-has-documents={String(Boolean(documents))}
    >
      Runtime application form
    </div>
  ),
}));

vi.mock('./application-detail/parent-registration/parent-registration-panel', () => ({
  ParentRegistrationPanel: ({ applicationId, canManage }: any) => (
    <div
      data-testid="parent-registration-panel"
      data-application-id={applicationId}
      data-can-manage={String(canManage)}
    >
      Parent registration controls
    </div>
  ),
}));

vi.mock('./application-detail/application-managed-stages', () => ({
  ApplicationManagedStages: ({
    onFeeSelectionStateChange,
    onReadinessChange,
    workflow,
  }: {
    onFeeSelectionStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
    onReadinessChange?: (state: {
      stageId: string;
      canComplete: boolean;
      busy: boolean;
      dirty?: boolean;
    }) => void;
    workflow?: { stages: { paymentStageEnabled?: boolean }[] };
  }) =>
    workflow?.stages.some((stage) => stage.paymentStageEnabled) ? (
      <div>
        Fee selection editor
        <button
          type="button"
          onClick={() =>
            onReadinessChange?.({
              stageId: 'payment',
              canComplete: false,
              busy: false,
              dirty: true,
            })
          }
        >
          Enter inline result
        </button>
        <button
          type="button"
          onClick={() => onFeeSelectionStateChange?.({ dirty: true, busy: false })}
        >
          Change fee selection
        </button>
        <button
          type="button"
          onClick={() => onFeeSelectionStateChange?.({ dirty: true, busy: true })}
        >
          Start saving fee selection
        </button>
      </div>
    ) : null,
}));

vi.mock('./application-detail/application-decision-card', () => ({
  ApplicationDecisionCard: (props: any) => {
    decisionCardProps.current = props;
    return null;
  },
}));

vi.mock('./application-detail/form-history-card', () => ({ FormHistoryCard: () => null }));
vi.mock('./application-detail/transition-history-card', () => ({
  TransitionHistoryCard: () => null,
}));
vi.mock('./application-detail/admission-stage-completion-dialog', () => ({
  AdmissionStageCompletionDialog: () => null,
}));
vi.mock('./admission-workflow-runtime-action-dialog', () => ({
  AdmissionWorkflowRuntimeActionDialog: () => null,
}));

const query = (overrides: Record<string, unknown> = {}) => ({
  isLoading: false,
  isError: false,
  error: undefined,
  data: undefined,
  refetch: vi.fn(),
  ...overrides,
});

describe('approval finalization handoff', () => {
  it('offers Resume only for a withdrawn application with the existing manage permission', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.status = 2;
    detailState.canEndJourney = false;
    detailState.workflowQuery.data.status = 2;
    const view = render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByRole('button', { name: 'Resume Admission' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Continue Admission' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume Admission' }));
    expect(screen.getByRole('dialog', { name: 'Resume Admission' })).toBeVisible();
    view.unmount();
    detailState.canEdit = false;
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.queryByRole('button', { name: 'Resume Admission' })).not.toBeInTheDocument();
  });
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    permissions = [{ name: 'Students.Onboarding.View', isGranted: true }];
    pathname = '/student/admissions/applications/application-1';
    returnParams = new URLSearchParams();
    loadPaymentDetail();
    detailState.applicationQuery.data.status = 6;
    detailState.applicationQuery.data.hasReachedDecision = true;
    detailState.workflowQuery.data.currentStageInstanceId = 'decision';
    detailState.workflowQuery.data.stages = [
      {
        id: 'decision',
        code: 'VERIFY_APPROVE_ADMISSION',
        name: 'Admission decision',
        stageType: 7,
        status: 1,
      },
    ];
    decisionCardProps.current = null;
  });

  it('reuses the guarded workflow advance and opens the exact returned Onboarding case', async () => {
    render(<AdmissionApplicationDetailScreen />);
    await decisionCardProps.current.onPrepareFinalization();
    expect(detailState.advance).toHaveBeenCalledOnce();
    decisionCardProps.current.onFinalized({
      onboardingCaseId: 'case-finalized',
      studentId: 'student-finalized',
    });
    expect(push).toHaveBeenCalledWith('/student/onboarding/setup?case=case-finalized');
  });

  it('does not navigate to Onboarding without its View permission', () => {
    permissions = [];
    render(<AdmissionApplicationDetailScreen />);
    decisionCardProps.current.onFinalized({ onboardingCaseId: 'case-finalized' });
    expect(push).not.toHaveBeenCalled();
  });

  it('does not offer automatic stage completion while there are unsaved answers', () => {
    detailState.hasUnsavedAnswers = true;
    render(<AdmissionApplicationDetailScreen />);
    expect(decisionCardProps.current.onPrepareFinalization).toBeUndefined();
    expect(detailState.advance).not.toHaveBeenCalled();
  });
});

const baseDetail = () => ({
  applicationQuery: query({ refetch: applicationRefetch }),
  formQuery: query({ refetch: formRefetch }),
  workflowQuery: query({ refetch: workflowRefetch }),
  formStageQuery: query(),
  formHistoryQuery: query({ data: [] }),
  currentValues: {},
  hasUnsavedAnswers: false,
  discardUnsavedAnswers: vi.fn(),
  errors: [],
  fieldErrors: {},
  runtimeAction: null,
  setRuntimeAction: vi.fn(),
  updateState: { isLoading: false },
  submitState: { isLoading: false },
  advanceState: { isLoading: false },
  reopenState: { isLoading: false },
  save: vi.fn(),
  advance: vi.fn(),
  submitApplication: vi.fn(),
  reopenApplication: vi.fn(),
  validateStep: vi.fn(),
  setFieldValue: vi.fn(),
  setFieldTouched: vi.fn(),
  canAdvance: true,
  canEdit: true,
  canEndJourney: true,
  endJourneyState: { isLoading: false },
  endJourney: vi.fn(async () => true),
  canSkip: true,
  canOverride: true,
  canReopen: true,
});

const loadPaymentDetail = () => {
  detailState = {
    ...baseDetail(),
    applicationQuery: query({
      data: {
        id: 'application-1',
        applicationNumber: 'APP/2026/001',
        applicantName: 'Test applicant',
        status: 4,
      },
    }),
    formQuery: query({ data: { definition: { name: 'Application', sections: [] }, values: [] } }),
    workflowQuery: query({
      data: {
        status: 0,
        currentStageInstanceId: 'payment',
        stages: [
          {
            id: 'payment',
            name: 'Fee structure confirmation',
            displayOrder: 1,
            stageType: 4,
            status: 1,
            paymentStageEnabled: true,
          },
        ],
        availableTransitions: [],
        history: [],
      },
    }),
  };
};

describe('AdmissionApplicationDetailScreen', () => {
  it.each([1, 4, 6])(
    'opens corrections from a completed registration stage without reopening status %s',
    (status) => {
      loadPaymentDetail();
      detailState.applicationQuery.data.status = status;
      detailState.formQuery.data.canCorrectForm = true;
      detailState.workflowQuery.data.stages.unshift({
        id: 'form',
        name: 'Registration Form',
        stageType: 1,
        displayOrder: 0,
        status: 2,
      });
      render(<AdmissionApplicationDetailScreen />);
      fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
      fireEvent.click(screen.getByRole('button', { name: 'Registration Form' }));
      expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
      fireEvent.click(screen.getByRole('button', { name: 'Edit form' }));
      expect(screen.getByRole('dialog', { name: 'Edit Application Form' })).toHaveAttribute(
        'data-application-id',
        'application-1'
      );
      expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));
      expect(detailState.applicationQuery.refetch).toHaveBeenCalled();
      expect(detailState.formQuery.refetch).toHaveBeenCalled();
      expect(detailState.workflowQuery.refetch).toHaveBeenCalled();
      expect(detailState.applicationQuery.data.status).toBe(status);
      expect(detailState.applicationQuery.data.applicationNumber).toBe('APP/2026/001');
      expect(detailState.workflowQuery.data.currentStageInstanceId).toBe('payment');
      expect(detailState.reopenApplication).not.toHaveBeenCalled();
      expect(detailState.submitApplication).not.toHaveBeenCalled();
      expect(detailState.advance).not.toHaveBeenCalled();
    }
  );

  it.each([
    { status: 6, canEdit: false, capability: true },
    { status: 6, canEdit: true, capability: false },
    { status: 11, canEdit: true, capability: true },
    { status: 2, canEdit: true, capability: true },
  ])('keeps stage corrections unavailable when blocked: %s', ({ status, canEdit, capability }) => {
    loadPaymentDetail();
    detailState.applicationQuery.data.status = status;
    detailState.canEdit = canEdit;
    detailState.formQuery.data.canCorrectForm = capability;
    detailState.workflowQuery.data.stages.unshift({
      id: 'form',
      name: 'Registration Form',
      stageType: 1,
      displayOrder: 0,
      status: 2,
    });
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    fireEvent.click(screen.getByRole('button', { name: 'Registration Form' }));
    expect(screen.queryByRole('button', { name: 'Edit form' })).not.toBeInTheDocument();
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
  });

  it('opens an approved record correction, locks parent navigation and refreshes the same application after saving', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.status = 6;
    detailState.applicationQuery.refetch = applicationRefetch;
    detailState.formQuery.data.canCorrectForm = true;
    detailState.formQuery.refetch = formRefetch;
    detailState.workflowQuery.refetch = workflowRefetch;
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Review Application Form' }));
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Edit form' }));
    expect(screen.getByRole('dialog', { name: 'Edit Application Form' })).toHaveAttribute(
      'data-application-id',
      'application-1'
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Current Step' }));
    expect(screen.getByText('Application Record')).toBeInTheDocument();
    expect(screen.getByTestId('parent-registration-panel')).toHaveAttribute(
      'data-application-id',
      'application-1'
    );
    expect(detailState.discardUnsavedAnswers).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));
    expect(applicationRefetch).toHaveBeenCalledOnce();
    expect(formRefetch).toHaveBeenCalledOnce();
    expect(workflowRefetch).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog', { name: 'Edit Application Form' })).not.toBeInTheDocument();
    expect(screen.getByText('APP-2026-000001')).toBeInTheDocument();
    expect(detailState.applicationQuery.data.applicationNumber).toBe('APP/2026/001');
    expect(detailState.submitApplication).not.toHaveBeenCalled();
    expect(detailState.reopenApplication).not.toHaveBeenCalled();
  });

  it.each([
    { status: 6, canEdit: false, capability: true },
    { status: 6, canEdit: true, capability: false },
    { status: 6, canEdit: true, capability: undefined },
    { status: 11, canEdit: true, capability: true },
    { status: 2, canEdit: true, capability: true },
  ])(
    'keeps the record read-only when correction is unavailable: %s',
    ({ status, canEdit, capability }) => {
      loadPaymentDetail();
      detailState.applicationQuery.data.status = status;
      detailState.canEdit = canEdit;
      detailState.formQuery.data.canCorrectForm = capability;
      render(<AdmissionApplicationDetailScreen />);
      fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Review Application Form' }));
      expect(screen.queryByRole('button', { name: 'Edit form' })).not.toBeInTheDocument();
      expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
    }
  );
  it('keeps the shared body in the flex chain while a stage changes from idle to saving', () => {
    loadPaymentDetail();
    const { rerender } = render(<AdmissionApplicationDetailScreen presentation="drawer" />);
    const editor = screen.getByText('Fee selection editor');
    const fieldset = editor.closest('fieldset')!;
    const body = fieldset.parentElement!;
    expect(getComputedStyle(body).display).toBe('flex');
    expect(getComputedStyle(fieldset).display).toBe('flex');
    expect(getComputedStyle(fieldset.firstElementChild!).display).toBe('flex');
    detailState.advanceState.isLoading = true;
    rerender(<AdmissionApplicationDetailScreen presentation="drawer" />);
    expect(screen.getByText('Fee selection editor')).toBe(editor);
    expect(fieldset).toBeDisabled();
    expect(getComputedStyle(body).display).toBe('flex');
    detailState.advanceState.isLoading = false;
    rerender(<AdmissionApplicationDetailScreen presentation="drawer" />);
    expect(fieldset).not.toBeDisabled();
    expect(screen.getByText('Fee selection editor')).toBe(editor);
  });
  it.each(['applicationQuery', 'workflowQuery'] as const)(
    'refreshes status with a skeleton while retaining the dirty payment editor (%s)',
    (queryName) => {
      loadPaymentDetail();
      const { rerender } = render(<AdmissionApplicationDetailScreen />);
      const editor = screen.getByText('Fee selection editor');
      fireEvent.click(screen.getByRole('button', { name: 'Change fee selection' }));
      detailState[queryName].isFetching = true;
      rerender(<AdmissionApplicationDetailScreen />);
      expect(screen.getByRole('status', { name: 'Refreshing Application Status' })).toBeVisible();
      expect(screen.getByText('Test applicant')).toBeVisible();
      expect(screen.getByText('Fee selection editor')).toBe(editor);
      expect(
        screen.queryByRole('progressbar', { name: 'Refreshing application details' })
      ).not.toBeInTheDocument();
      expect(detailState.discardUnsavedAnswers).not.toHaveBeenCalled();
      detailState[queryName].isFetching = false;
      rerender(<AdmissionApplicationDetailScreen />);
      expect(
        screen.queryByRole('status', { name: 'Refreshing Application Status' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Fee selection editor')).toBe(editor);
    }
  );
  it('expands a drawer in place without discarding or remounting the active form', () => {
    loadPaymentDetail();
    const onClose = vi.fn();
    render(
      <AdmissionApplicationDetailScreen
        applicationId="application-1"
        presentation="drawer"
        onClose={onClose}
      />
    );
    const workspace = screen.getByTestId('admission-application-workspace');
    expect(screen.getByRole('dialog', { name: 'Test applicant' })).toContainElement(workspace);
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('counsellor-control')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Focus Mode' }));
    expect(screen.getByRole('button', { name: 'Exit Focus Mode' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('admission-application-workspace')).toBe(workspace);
    fireEvent.click(screen.getByRole('button', { name: 'Exit Focus Mode' }));
    expect(screen.getByTestId('admission-application-workspace')).toBe(workspace);
    expect(detailState.discardUnsavedAnswers).not.toHaveBeenCalled();
    expect(detailState.save).not.toHaveBeenCalled();
  });

  it('uses the existing unsaved guard for drawer Escape dismissal', () => {
    loadPaymentDetail();
    detailState.hasUnsavedAnswers = true;
    const onClose = vi.fn();
    render(
      <AdmissionApplicationDetailScreen
        applicationId="application-1"
        presentation="drawer"
        onClose={onClose}
      />
    );
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Test applicant' }), { key: 'Escape' });
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Application Changes?' })
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('button', { name: 'Focus Mode' })).toBeInTheDocument();
    expect(detailState.discardUnsavedAnswers).not.toHaveBeenCalled();
  });
  it('hands a decision-phase case back to Applications instead of keeping it in the Pipeline drawer', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.hasReachedDecision = true;
    render(
      <AdmissionApplicationDetailScreen
        applicationId="application-1"
        presentation="drawer"
        onClose={vi.fn()}
      />
    );
    expect(replace).toHaveBeenCalledWith(
      '/student/admissions/applications/application-1?returnTo=%2Fstudent%2Fadmissions%2Fapplications',
      { scroll: false }
    );
  });
  beforeEach(() => {
    permissions = [{ name: 'Students.Admissions.Applicants.View', isGranted: true }];
    push.mockReset();
    replace.mockReset();
    pathname = '/student/admissions/pipeline/applications/application-1';
    returnParams = new URLSearchParams();
    applicationRefetch.mockReset();
    formRefetch.mockReset();
    workflowRefetch.mockReset();
  });

  it('opens a managed stage without waiting for unrelated form data', () => {
    loadPaymentDetail();
    detailState.formQuery = query({ isLoading: true });
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    expect(screen.getByRole('button', { name: 'Fee structure confirmation' })).toBeEnabled();
  });

  it('retains the known journey and header while the selected admission form is loading', () => {
    loadPaymentDetail();
    detailState.workflowQuery.data.stages[0].stageType = 1;
    detailState.formQuery = query({ isLoading: true });
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByRole('status', { name: 'Loading Admission Form' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeEnabled();
  });

  it('keeps stage content accessible during a write instead of covering action feedback with a workspace overlay', () => {
    loadPaymentDetail();
    detailState.advanceState.isLoading = true;
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByText('Fee selection editor')).toBeVisible();
    expect(screen.queryByRole('status', { name: 'Updating application…' })).not.toBeInTheDocument();
    expect(screen.getByText('Fee selection editor').closest('fieldset')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
  });

  it('shows loading instead of empty history while the on-demand history request is pending', () => {
    loadPaymentDetail();
    detailState.formQuery = query();
    detailState.formHistoryQuery = query({ isLoading: true });
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Application History' }));
    expect(screen.getByLabelText('Loading Application History')).toBeInTheDocument();
    expect(
      screen.queryByText('No Application History has been recorded yet.')
    ).not.toBeInTheDocument();
  });

  it('retries failed history independently of the unopened form', () => {
    loadPaymentDetail();
    detailState.formQuery = query();
    const retry = vi.fn();
    detailState.formHistoryQuery = query({ isError: true, refetch: retry });
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Application History' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(formRefetch).not.toHaveBeenCalled();
  });

  it('uses the application Offering for academic context without borrowing list-filter identity', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.admissionOfferingId = 'actual-offering';
    detailState.applicationQuery.data.standardName = 'Class 1';
    permissions.push({ name: 'Students.Admissions.Offerings.View', isGranted: true });
    offeringContext.mockReturnValue({
      currentData: { standardName: 'Class 1', boardName: 'CBSE', mediumName: 'English' },
    });
    render(<AdmissionApplicationDetailScreen />);
    expect(offeringContext).toHaveBeenCalledWith('actual-offering', { skip: false });
    expect(screen.getByLabelText('Application Academic Context')).toHaveTextContent('Class 1');
    expect(screen.getByLabelText('Application Academic Context')).toHaveTextContent('CBSE');
    expect(screen.getByLabelText('Application Academic Context')).toHaveTextContent('English');
  });

  it('keeps application access without issuing an unauthorized Offering context read', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.admissionOfferingId = 'actual-offering';
    detailState.applicationQuery.data.standardName = 'Class 1';
    offeringContext.mockReturnValue({
      currentData: { boardName: 'Cached board', mediumName: 'Cached medium' },
    });
    render(<AdmissionApplicationDetailScreen />);
    expect(offeringContext).toHaveBeenCalledWith('actual-offering', { skip: true });
    expect(screen.getByLabelText('Application Academic Context')).toHaveTextContent('Class 1');
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeEnabled();
    expect(screen.queryByText('Cached board')).not.toBeInTheDocument();
    expect(screen.queryByText('Cached medium')).not.toBeInTheDocument();
  });

  it('retains applicant notes without discarding unsaved application answers and locks navigation while saving', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.applicantId = 'applicant-1';
    detailState.hasUnsavedAnswers = true;
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Notes & Follow-Ups' }));
    expect(screen.getByRole('dialog', { name: 'Notes & Follow-ups' })).toBeInTheDocument();
    expect(detailState.discardUnsavedAnswers).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Start saving note' }));
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
  });

  it('does not expose applicant notes without canonical applicant view access', () => {
    permissions = [{ name: 'Students.Admissions.Applications.View', isGranted: true }];
    loadPaymentDetail();
    detailState.applicationQuery.data.applicantId = 'applicant-1';
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.queryByRole('button', { name: 'Notes & Follow-Ups' })).not.toBeInTheDocument();
  });

  it('keeps the current draft form read-only without application management access', () => {
    detailState = {
      ...baseDetail(),
      canAdvance: false,
      canEdit: false,
      applicationQuery: query({
        data: { id: 'application-1', status: 0, applicantName: 'QA applicant' },
      }),
      formQuery: query({ data: { definition: { sections: [] }, values: [] } }),
      workflowQuery: query({
        data: {
          status: 0,
          currentStageInstanceId: 'form',
          stages: [
            { id: 'form', name: 'Application form', displayOrder: 1, stageType: 1, status: 1 },
          ],
          availableTransitions: [],
          history: [],
        },
      }),
    };
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
    expect(detailState.save).not.toHaveBeenCalled();
    expect(detailState.submitApplication).not.toHaveBeenCalled();
  });

  it('locks page return and stage navigation while a child mutation is running', () => {
    loadPaymentDetail();
    const onClose = vi.fn();
    render(<AdmissionApplicationDetailScreen applicationId="application-1" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start saving fee selection' }));
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps a stable loading state inside the application workspace', () => {
    detailState = {
      ...baseDetail(),
      applicationQuery: query({ isLoading: true, refetch: applicationRefetch }),
    };

    render(<AdmissionApplicationDetailScreen />);

    expect(screen.getByRole('status', { name: 'Loading Application Details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });

  it('retries application and workflow without refetching an unopened form', () => {
    detailState = {
      ...baseDetail(),
      applicationQuery: query({ isError: true, refetch: applicationRefetch }),
      formQuery: query({ isUninitialized: true, refetch: formRefetch }),
      workflowQuery: query({ isError: true, refetch: workflowRefetch }),
    };

    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(applicationRefetch).toHaveBeenCalledOnce();
    expect(formRefetch).not.toHaveBeenCalled();
    expect(workflowRefetch).toHaveBeenCalledOnce();
  });

  it('preserves the current-step handoff to the existing application-form panel', () => {
    const application = {
      id: 'application-1',
      applicationNumber: 'APP/2026/001',
      applicantId: 'applicant-1',
      applicantName: 'Parth Patel',
      admissionCycleId: 'cycle-1',
      admissionOfferingId: 'offering-1',
      status: 4,
    };
    const form = {
      formInstanceId: 'form-instance-1',
      formDefinitionId: 'form-1',
      formVersion: 1,
      status: 1,
      academicYearId: 'year-1',
      definition: { name: 'Registration form', layoutType: 0, fieldsPerRow: 1, sections: [] },
      values: [],
    };
    const stage = {
      id: 'stage-1',
      definitionStageId: 'definition-1',
      code: 'DOCUMENTS',
      name: 'Documents verified',
      stageType: 11,
      displayOrder: 1,
      status: 1,
      allowManualSkip: false,
    };
    const workflow = {
      workflowDefinitionId: 'workflow-1',
      status: 0,
      startedAt: '2026-09-18T08:00:00Z',
      currentStageInstanceId: stage.id,
      stages: [stage],
      availableTransitions: [],
      history: [],
    };
    detailState = {
      ...baseDetail(),
      applicationQuery: query({ data: application, refetch: applicationRefetch }),
      formQuery: query({ data: form, refetch: formRefetch }),
      workflowQuery: query({ data: workflow, refetch: workflowRefetch }),
    };

    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Review Application Form' }));

    expect(screen.getByText('Runtime application form')).toBeInTheDocument();
    expect(screen.getByText('Application Record')).toBeInTheDocument();
  });
  it('keeps unsaved fee selection mounted when a local section change is cancelled, then permits explicit discard', async () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Change fee selection' }));
    fireEvent.click(screen.getByRole('button', { name: 'Application History' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Fee Selection?' })
    ).toBeInTheDocument();
    expect(screen.getByText('Fee selection editor')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(
      await screen.findByRole('region', { name: 'Fee structure confirmation' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Review Application Form' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Fee Selection?' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(await screen.findByText('Application Record')).toBeInTheDocument();
    expect(screen.queryByText('Fee selection editor')).not.toBeInTheDocument();
  });
  it('blocks local section changes and review shortcuts while the fee selection is saving', () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Start saving fee selection' }));
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
    expect(screen.getByRole('region', { name: 'Fee structure confirmation' })).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Discard Unsaved Fee Selection?' })
    ).not.toBeInTheDocument();
  });
  it('protects child stage drafts when returning to the list and keeps the panel after cancellation', () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Enter inline result' }));
    expect(screen.getByRole('button', { name: 'Continue Admission' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Application Changes?' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByText('Fee selection editor')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

describe('Application save navigation locks', () => {
  it.each(['updateState', 'submitState', 'advanceState', 'reopenState'])(
    'locks workspace tabs while %s is busy and restores them afterwards',
    (state) => {
      loadPaymentDetail();
      detailState[state].isLoading = true;
      const { rerender } = render(<AdmissionApplicationDetailScreen />);
      expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
      expect(detailState.advance).not.toHaveBeenCalled();
      detailState[state].isLoading = false;
      rerender(<AdmissionApplicationDetailScreen />);
      expect(screen.getByRole('button', { name: 'Admission Journey' })).toBeEnabled();
    }
  );
});

describe('Applicant 360 full-page workspace', () => {
  it('shows the closure reason and date as history even when a journey ended before its first transition', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.status = 2;
    detailState.applicationQuery.data.decisionReason = 'Parent selected another school';
    detailState.applicationQuery.data.decisionAt = '2026-10-10T12:00:00Z';
    detailState.canEdit = false;
    detailState.canEndJourney = false;
    detailState.workflowQuery.data.status = 2;
    detailState.workflowQuery.data.currentStageInstanceId = null;
    detailState.workflowQuery.data.stages = [
      { id: 'form', name: 'Application form', stageType: 1, displayOrder: 1, status: 5 },
    ];
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Application History' }));
    expect(screen.getByText('Admission Journey Ended')).toBeInTheDocument();
    expect(screen.getByText('Parent selected another school')).toBeInTheDocument();
    expect(screen.getByText(/10 Oct 2026/)).toBeInTheDocument();
    expect(
      screen.queryByText('No Application History has been recorded yet.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue Admission' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resume Admission' })).not.toBeInTheDocument();
  });

  it('permits editing a future draft form without submitting it or advancing the real current stage', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.status = 0;
    detailState.workflowQuery.data.stages.push({
      id: 'future-form',
      name: 'Registration form',
      stageType: 1,
      displayOrder: 2,
      status: 0,
    });
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    fireEvent.click(screen.getByRole('button', { name: 'Registration form' }));
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'false');
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-can-submit', 'false');
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-has-documents', 'false');
    expect(screen.getByRole('button', { name: 'Continue Admission' })).toBeDisabled();
    expect(detailState.workflowQuery.data.currentStageInstanceId).toBe('payment');
    expect(detailState.advance).not.toHaveBeenCalled();
  });

  it('keeps compact journey actions adjacent and requires a reason to end an application', async () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    const end = screen.getByRole('button', { name: 'End Journey' });
    const next = screen.getByRole('button', { name: 'Continue Admission' });
    expect(end.parentElement).toBe(next.parentElement);
    expect(end).toHaveClass('MuiButton-sizeSmall');
    expect(next).toHaveClass('MuiButton-sizeSmall');
    expect(screen.queryByText('Next Action')).not.toBeInTheDocument();
    fireEvent.click(end);
    expect(screen.getByRole('dialog', { name: 'End Admission Journey' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Reason/ })).toBeRequired();
  });

  it('does not expose ending a journey without the backend action permission', () => {
    loadPaymentDetail();
    detailState.canEndJourney = false;
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.queryByRole('button', { name: 'End Journey' })).not.toBeInTheDocument();
  });

  it('locks Continue admission while the application has unsaved answers', () => {
    loadPaymentDetail();
    detailState.workflowQuery.data.stages[0].stageType = 11;
    detailState.hasUnsavedAnswers = true;
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue Admission' }));
    expect(screen.getByRole('button', { name: 'Continue Admission' })).toBeDisabled();
    expect(detailState.advance).not.toHaveBeenCalled();
  });
  it('replaces counsellor and More with named icon actions and keeps history available', () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.queryByTestId('counsellor-control')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admission Journey' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Application History' }));
    expect(screen.getByRole('button', { name: 'Application History' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.queryByTestId('counsellor-control')).not.toBeInTheDocument();
  });

  it('uses the same safe-close guard for unsaved answers and returns to its opening list', () => {
    loadPaymentDetail();
    const onClose = vi.fn();
    detailState.hasUnsavedAnswers = true;
    render(<AdmissionApplicationDetailScreen applicationId="application-1" onClose={onClose} />);
    expect(screen.queryByRole('dialog', { name: 'Applicant 360' })).not.toBeInTheDocument();
    expect(screen.getByTestId('admission-application-workspace')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Application Changes?' })
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(detailState.discardUnsavedAnswers).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });

  it('allows future-stage navigation and completed-form review without changing the current stage', () => {
    loadPaymentDetail();
    detailState.workflowQuery.data.stages.unshift({
      id: 'form',
      name: 'Application form',
      stageType: 1,
      displayOrder: 0,
      status: 2,
    });
    detailState.workflowQuery.data.stages.push({
      id: 'documents',
      name: 'Document verification',
      stageType: 5,
      displayOrder: 2,
      status: 0,
    });
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    expect(screen.getByRole('button', { name: 'Document verification' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Application form' }));
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
    expect(detailState.workflowQuery.data.currentStageInstanceId).toBe('payment');
    expect(detailState.advance).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Admission Journey' }));
    fireEvent.click(screen.getByRole('button', { name: 'Document verification' }));
    expect(screen.getByRole('region', { name: 'Document verification' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue Admission' })).toBeDisabled();
  });
});

describe('Applicant 360 phase navigation', () => {
  beforeEach(() => {
    replace.mockReset();
    push.mockReset();
    pathname = '/student/admissions/pipeline/applications/application-1';
    returnParams = new URLSearchParams({
      returnTo: '/student/admissions/pipeline?page=3&stage=form',
    });
    loadPaymentDetail();
    detailState.applicationQuery.data.hasReachedDecision = true;
  });

  it('moves to Applications and returns to its decision worklist after the handoff', () => {
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByRole('heading', { name: 'Applications' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Applicant 360' })).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith(
      '/student/admissions/applications/application-1?returnTo=%2Fstudent%2Fadmissions%2Fapplications',
      { scroll: false }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(push).toHaveBeenCalledWith('/student/admissions/applications');
  });

  it('keeps a correction in Applications even when its current task is before Decision', () => {
    pathname = '/student/admissions/applications/application-1';
    returnParams = new URLSearchParams({
      returnTo: '/student/admissions/applications?search=Test',
    });
    render(<AdmissionApplicationDetailScreen />);
    expect(replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(push).toHaveBeenCalledWith('/student/admissions/applications?search=Test');
  });

  it('returns to the opening Assessments context through the breadcrumb back action', () => {
    pathname = '/student/admissions/applications/application-1';
    returnParams = new URLSearchParams({
      returnTo: '/student/admissions/assessments?tab=students&search=Test',
    });
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.queryByRole('button', { name: 'Back to list' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(push).toHaveBeenCalledWith('/student/admissions/assessments?tab=students&search=Test');
  });

  it('keeps a predecision withdrawn case in Applications history', () => {
    pathname = '/student/admissions/applications/application-1';
    returnParams = new URLSearchParams({
      returnTo: '/student/admissions/applications?status=2',
    });
    detailState.applicationQuery.data.hasReachedDecision = false;
    detailState.applicationQuery.data.status = 2;
    render(<AdmissionApplicationDetailScreen />);
    expect(replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(push).toHaveBeenCalledWith('/student/admissions/applications?status=2');
  });

  it('moves a just-withdrawn Pipeline case to Applications history', () => {
    detailState.applicationQuery.data.hasReachedDecision = false;
    detailState.applicationQuery.data.status = 2;
    render(<AdmissionApplicationDetailScreen />);
    expect(replace).toHaveBeenCalledWith(
      '/student/admissions/applications/application-1?returnTo=%2Fstudent%2Fadmissions%2Fapplications',
      { scroll: false }
    );
  });

  it.each(['dirty', 'mutation', 'applicationFetch', 'workflowFetch', 'mismatchedStage'])(
    'waits before canonicalizing while %s is unresolved',
    (blocker) => {
      if (blocker === 'dirty') detailState.hasUnsavedAnswers = true;
      if (blocker === 'mutation') detailState.advanceState.isLoading = true;
      if (blocker === 'applicationFetch') detailState.applicationQuery.isFetching = true;
      if (blocker === 'workflowFetch') detailState.workflowQuery.isFetching = true;
      if (blocker === 'mismatchedStage')
        detailState.applicationQuery.data.currentStageInstanceId = 'stale';
      const { rerender } = render(<AdmissionApplicationDetailScreen />);
      expect(replace).not.toHaveBeenCalled();
      detailState.hasUnsavedAnswers = false;
      detailState.advanceState.isLoading = false;
      detailState.applicationQuery.isFetching = false;
      detailState.workflowQuery.isFetching = false;
      detailState.applicationQuery.data.currentStageInstanceId = 'payment';
      rerender(<AdmissionApplicationDetailScreen />);
      expect(replace).toHaveBeenCalledOnce();
    }
  );

  it('repairs an early-stage old Applications bookmark without changing failed or unknown state', () => {
    pathname = '/student/admissions/applications/application-1';
    returnParams = new URLSearchParams();
    detailState.applicationQuery.data.hasReachedDecision = false;
    const { rerender } = render(<AdmissionApplicationDetailScreen />);
    expect(screen.getByRole('heading', { name: 'Pipeline' })).toBeInTheDocument();
    expect(replace.mock.calls[0][0]).toContain(
      '/student/admissions/pipeline/applications/application-1?'
    );
    replace.mockReset();
    detailState.applicationQuery.isError = true;
    rerender(<AdmissionApplicationDetailScreen />);
    expect(replace).not.toHaveBeenCalled();
  });

  it('waits for an authoritative GET phase instead of treating an unknown mutation phase as Pipeline', () => {
    detailState.applicationQuery.data.hasReachedDecision = null;
    render(<AdmissionApplicationDetailScreen />);
    expect(replace).not.toHaveBeenCalled();
  });
});
