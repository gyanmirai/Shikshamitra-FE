import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { WorkflowSimulationPanel } from './components/workflow-simulation-panel';

const stages: AdmissionWorkflowStage[] = [
  {
    id: 'review',
    code: 'REVIEW',
    name: 'Review',
    stageType: 1,
    displayOrder: 0,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: true,
    isTerminalStage: false,
  },
  {
    id: 'complete',
    code: 'COMPLETE',
    name: 'Complete',
    stageType: 7,
    displayOrder: 1,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: false,
    isTerminalStage: true,
  },
];

const transitions: AdmissionWorkflowTransition[] = [
  {
    id: 'complete-route',
    fromStageId: 'review',
    toStageId: 'complete',
    priority: 0,
    isDefault: true,
  },
];

describe('WorkflowSimulationPanel', () => {
  it('summarizes all release scenarios and opens a selected scenario', () => {
    render(<WorkflowSimulationPanel stages={stages} transitions={transitions} />);

    expect(screen.getByText('6 of 6 complete')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Fee structure unconfirmed/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('All scenario checks'));
    fireEvent.click(screen.getByRole('button', { name: /Fee structure unconfirmed/i }));

    expect(screen.getByText(/Finance fee structure/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Test scenario')).toHaveTextContent('Fee structure unconfirmed');
  });
});
