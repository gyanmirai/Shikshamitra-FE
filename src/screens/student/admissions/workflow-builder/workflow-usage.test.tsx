import type {
  AdmissionWorkflow,
  AdmissionWorkflowUsage,
} from 'src/redux/student/admissions/admission-workflows-api';

import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { WorkflowPanelContent } from './components/workflow-panel-content';

const notices = vi.hoisted(() => ({
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  dismiss: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: notices }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const workflow = { id: 'published', name: 'Published admission', status: 1 } as AdmissionWorkflow;
const usage: AdmissionWorkflowUsage = {
  workflowDefinitionId: workflow.id,
  offeringCount: 2,
  campusCount: 1,
  applicationCount: 3,
  canDelete: false,
  offerings: [
    {
      id: 'offering',
      admissionCycleId: 'cycle',
      admissionCycleName: 'October intake',
      code: 'G6-GENERAL',
      isActive: true,
    },
  ],
  runtimeAnalytics: {
    startedCount: 3,
    activeCount: 2,
    completedCount: 1,
    completionRatePercent: 33,
    stages: [
      {
        definitionStageId: 'assessment',
        code: 'EXAM',
        name: 'Entrance assessment',
        stageType: 2,
        displayOrder: 0,
        enteredCount: 3,
        activeCount: 2,
        completedCount: 1,
        skippedCount: 0,
        completionRatePercent: 33,
      },
    ],
  },
};
const props = {
  panel: 'usage' as const,
  workflow,
  stages: [],
  transitions: [],
  usage,
  usageLoading: false,
  canCreateVersion: false,
  governanceLoading: false,
};

describe('workflow usage read-only feedback', () => {
  beforeEach(() => vi.clearAllMocks());
  it('shows used workflow statistics without deletion messaging or warning toasts', () => {
    render(<WorkflowPanelContent {...props} />);
    expect(screen.getByText('Admission offerings')).toBeVisible();
    expect(screen.getByText('Applications')).toBeVisible();
    expect(screen.getByText('G6-GENERAL')).toBeVisible();
    expect(screen.getByText('Entrance assessment')).toBeVisible();
    expect(screen.queryByText(/cannot be deleted/i)).not.toBeInTheDocument();
    expect(notices.warning).not.toHaveBeenCalled();
    expect(notices.error).not.toHaveBeenCalled();
  });

  it('shows an unused version as zero usage without deletion advice', () => {
    render(
      <WorkflowPanelContent
        {...props}
        usage={{
          ...usage,
          canDelete: true,
          offeringCount: 0,
          campusCount: 0,
          applicationCount: 0,
          offerings: [],
          runtimeAnalytics: undefined,
        }}
      />
    );
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.queryByText(/draft is not in use/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Stage performance appears after applications start/i)).toBeVisible();
    expect(notices.warning).not.toHaveBeenCalled();
  });

  it('keeps the loading state free of usage and deletion feedback', () => {
    render(<WorkflowPanelContent {...props} usageLoading />);
    expect(screen.queryByText('Admission offerings')).not.toBeInTheDocument();
    expect(notices.warning).not.toHaveBeenCalled();
    expect(notices.error).not.toHaveBeenCalled();
  });

  it('reports the actual failed usage read and withholds cached usage', () => {
    const failedProps = { ...props, usageError: true };
    render(<WorkflowPanelContent {...failedProps} />);
    expect(notices.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Workflow usage could not be loaded. Refresh the page to try again.',
      })
    );
    expect(screen.queryByText('Admission offerings')).not.toBeInTheDocument();
    expect(screen.queryByText('G6-GENERAL')).not.toBeInTheDocument();
    expect(notices.warning).not.toHaveBeenCalled();
  });
  it('does not announce background usage errors when the usage panel is closed', () => {
    render(<WorkflowPanelContent {...props} panel={null} usageError />);
    expect(notices.error).not.toHaveBeenCalled();
    expect(notices.warning).not.toHaveBeenCalled();
  });
});
