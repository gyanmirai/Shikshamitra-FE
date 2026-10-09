import { createPortal } from 'react-dom';
import { Children, isValidElement } from 'react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionApplicationDetailScreen from './admission-application-detail';

const push = vi.fn();
const applicationRefetch = vi.fn();
const formRefetch = vi.fn();
const workflowRefetch = vi.fn();
let detailState: any;
let permissions = [{ name: 'Students.Admissions.Applicants.View', isGranted: true }];

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({ auth: { permissions } }),
}));

vi.mock('./application-detail/application-applicant-notes-dialog', () => ({
  ApplicationApplicantNotesDialog: ({ open, onClose, onBusyChange }: any) =>
    open
      ? createPortal(
          <div role="dialog" aria-label="Applicant Notes">
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

vi.mock('src/components/custom-tooltip', () => ({ default: ({ children }: any) => children }));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({ actions }: any) => <div>{actions({ popover: { onClose: vi.fn() } })}</div>,
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'application-1' }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push }),
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

vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({
    children,
    value,
    onChange,
  }: {
    children: React.ReactNode;
    value: string;
    onChange: (event: React.SyntheticEvent, value: string) => void;
  }) => (
    <div role="tablist">
      {Children.map(children, (child) =>
        isValidElement<{ value: string; label: string; id: string; disabled?: boolean }>(child) ? (
          <button
            type="button"
            role="tab"
            id={child.props.id}
            aria-selected={child.props.value === value}
            disabled={child.props.disabled}
            onClick={(event) => onChange(event, child.props.value)}
          >
            {child.props.label}
          </button>
        ) : (
          child
        )
      )}
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
  }: {
    onBusyChange?: (busy: boolean) => void;
    presentation?: string;
  }) => (
    <div data-testid="counsellor-control" data-presentation={presentation}>
      Journey counsellor
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
  ApplicationRuntimeForm: ({ readOnly }: { readOnly: boolean }) => (
    <div data-testid="runtime-form" data-read-only={String(readOnly)}>
      Runtime application form
    </div>
  ),
}));

vi.mock('./application-detail/application-managed-stages', () => ({
  ApplicationManagedStages: ({
    onFeeSelectionStateChange,
    workflow,
  }: {
    onFeeSelectionStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
    workflow?: { stages: { paymentStageEnabled?: boolean }[] };
  }) =>
    workflow?.stages.some((stage) => stage.paymentStageEnabled) ? (
      <div>
        Fee selection editor
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
  ApplicationDecisionCard: () => null,
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
  beforeEach(() => {
    permissions = [{ name: 'Students.Admissions.Applicants.View', isGranted: true }];
    push.mockReset();
    applicationRefetch.mockReset();
    formRefetch.mockReset();
    workflowRefetch.mockReset();
  });

  it('retains applicant notes without discarding unsaved application answers and locks navigation while saving', () => {
    loadPaymentDetail();
    detailState.applicationQuery.data.applicantId = 'applicant-1';
    detailState.hasUnsavedAnswers = true;
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByText('Applicant Notes'));
    expect(screen.getByRole('dialog', { name: 'Applicant Notes' })).toBeInTheDocument();
    expect(detailState.discardUnsavedAnswers).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Start saving note' }));
    expect(screen.getByRole('button', { name: 'Close application details' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Fee structure confirmation' })).toBeDisabled();
  });

  it('does not expose applicant notes without canonical applicant view access', () => {
    permissions = [{ name: 'Students.Admissions.Applications.View', isGranted: true }];
    loadPaymentDetail();
    detailState.applicationQuery.data.applicantId = 'applicant-1';
    render(<AdmissionApplicationDetailScreen />);
    expect(screen.queryByText('Applicant Notes')).not.toBeInTheDocument();
  });

  it('keeps the current draft form read-only without application management access', () => {
    detailState = {
      ...baseDetail(),
      canAdvance: false,
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

  it('locks drawer dismissal and stage navigation while a child mutation is running', () => {
    loadPaymentDetail();
    const onClose = vi.fn();
    render(<AdmissionApplicationDetailScreen applicationId="application-1" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start counsellor update' }));
    expect(screen.getByRole('button', { name: /^Close$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close application details' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Fee structure confirmation' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Close application details' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps a stable loading state inside the application dialog', () => {
    detailState = {
      ...baseDetail(),
      applicationQuery: query({ isLoading: true, refetch: applicationRefetch }),
    };

    render(<AdmissionApplicationDetailScreen />);

    expect(screen.getByRole('status', { name: 'Loading application details' })).toBeInTheDocument();
  });

  it('keeps a recoverable error state and retries all application resources', () => {
    detailState = {
      ...baseDetail(),
      applicationQuery: query({ isError: true, refetch: applicationRefetch }),
      formQuery: query({ isError: true, refetch: formRefetch }),
      workflowQuery: query({ isError: true, refetch: workflowRefetch }),
    };

    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(applicationRefetch).toHaveBeenCalledOnce();
    expect(formRefetch).toHaveBeenCalledOnce();
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
    fireEvent.click(screen.getByRole('button', { name: 'Review form from current step' }));

    expect(screen.getByText('Runtime application form')).toBeInTheDocument();
    expect(screen.getByText('Application record')).toBeInTheDocument();
  });
  it('keeps unsaved fee selection mounted when a local section change is cancelled, then permits explicit discard', async () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Change fee selection' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Application History' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Fee Selection?' })
    ).toBeInTheDocument();
    expect(screen.getByText('Fee selection editor')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(
      await screen.findByRole('tabpanel', { name: 'Fee structure confirmation' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review form from current step' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Fee Selection?' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(await screen.findByText('Application record')).toBeInTheDocument();
    expect(screen.queryByText('Fee selection editor')).not.toBeInTheDocument();
  });
  it('blocks local section changes and review shortcuts while the fee selection is saving', () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Start saving fee selection' }));
    expect(screen.getByRole('tab', { name: 'Fee structure confirmation' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'Application History' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Review form from current step' }));
    expect(
      screen.getByRole('tabpanel', { name: 'Fee structure confirmation' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Discard Unsaved Fee Selection?' })
    ).not.toBeInTheDocument();
  });
});

describe('Application save navigation locks', () => {
  it.each(['updateState', 'submitState', 'advanceState', 'reopenState'])(
    'locks workspace tabs while %s is busy and restores them afterwards',
    (state) => {
      loadPaymentDetail();
      detailState[state].isLoading = true;
      const { rerender } = render(<AdmissionApplicationDetailScreen />);
      expect(screen.getByRole('tab', { name: 'Fee structure confirmation' })).toBeDisabled();
      fireEvent.click(screen.getByRole('tab', { name: 'Fee structure confirmation' }));
      expect(screen.getByRole('tab', { name: 'Fee structure confirmation' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      detailState[state].isLoading = false;
      rerender(<AdmissionApplicationDetailScreen />);
      expect(screen.getByRole('tab', { name: 'Fee structure confirmation' })).toBeEnabled();
    }
  );
});

describe('Compact admission drawer', () => {
  it('keeps one counsellor control in the applicant header across workspace views', () => {
    loadPaymentDetail();
    render(<AdmissionApplicationDetailScreen />);
    const control = screen.getByTestId('counsellor-control');
    expect(control).toHaveAttribute('data-presentation', 'header');
    expect(control.closest('header')).toContainElement(screen.getByText('Applicant 360'));
    expect(screen.getByRole('tabpanel')).not.toContainElement(control);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Application History' }));
    expect(screen.getAllByTestId('counsellor-control')).toHaveLength(1);
    expect(screen.getByTestId('counsellor-control')).toBe(control);
  });

  it('uses the same safe-close guard for unsaved answers and returns to its opening list', () => {
    loadPaymentDetail();
    const onClose = vi.fn();
    detailState.hasUnsavedAnswers = true;
    render(<AdmissionApplicationDetailScreen applicationId="application-1" onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Applicant 360' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Application Changes?' })
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(detailState.discardUnsavedAnswers).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });

  it('allows completed-form review without changing the real current stage and locks future steps', () => {
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
    expect(screen.getByRole('tab', { name: 'Document verification' })).toBeDisabled();
    fireEvent.click(screen.getByRole('tab', { name: 'Application form' }));
    expect(screen.getByTestId('runtime-form')).toHaveAttribute('data-read-only', 'true');
    expect(detailState.workflowQuery.data.currentStageInstanceId).toBe('payment');
    expect(detailState.advance).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
  });
});
