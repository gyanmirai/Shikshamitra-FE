import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionApplicationDetailScreen from './admission-application-detail';

const push = vi.fn();
const applicationRefetch = vi.fn();
const formRefetch = vi.fn();
const workflowRefetch = vi.fn();
let detailState: any;

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'application-1' }),
}));

vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./application-detail/use-application-detail', () => ({
  useApplicationDetail: () => detailState,
}));

vi.mock('./application-detail/application-progress-card', () => ({
  ApplicationProgressCard: () => <div>Journey workspace</div>,
}));

vi.mock('./application-detail/application-counsellor-card', () => ({
  ApplicationCounsellorCard: () => <div>Journey counsellor</div>,
}));

vi.mock('./application-detail/application-current-task', () => ({
  ApplicationCurrentTask: ({ onReviewForm }: { onReviewForm: () => void }) => (
    <button type="button" onClick={onReviewForm}>
      Review form from current step
    </button>
  ),
}));

vi.mock('./application-detail/application-runtime-form', () => ({
  ApplicationRuntimeForm: () => <div>Runtime application form</div>,
}));

vi.mock('./application-detail/application-managed-stages', () => ({
  ApplicationManagedStages: () => null,
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

describe('AdmissionApplicationDetailScreen', () => {
  beforeEach(() => {
    push.mockReset();
    applicationRefetch.mockReset();
    formRefetch.mockReset();
    workflowRefetch.mockReset();
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
    expect(screen.getByRole('tabpanel', { name: 'Application form' })).toBeInTheDocument();
  });
});
