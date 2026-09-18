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
    stageType: 6,
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
    stageType: 11,
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

    expect(screen.getByText('13 of 13 complete')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Review correction/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('All scenario checks'));
    fireEvent.click(screen.getByRole('button', { name: /Review correction/i }));

    expect(screen.getByText(/controlled return route/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Test scenario')).toHaveTextContent('Review correction');
  });
});
