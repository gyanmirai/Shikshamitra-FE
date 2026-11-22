import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowStageType,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { WorkflowPanelContent } from './components/workflow-panel-content';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span aria-hidden="true" data-testid={icon} />,
}));

const makeStage = (
  id: string,
  name: string,
  stageType: AdmissionWorkflowStageType,
  displayOrder: number,
  flags?: Partial<AdmissionWorkflowStage>
): AdmissionWorkflowStage => ({
  id,
  name,
  stageType,
  displayOrder,
  code: `INTERNAL_${id}`,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
  ...flags,
});

const assessment = makeStage('assessment', 'Entrance interview', 2, 10, { isEntryStage: true });
const form = makeStage('form', 'Parent forms', 1, 20);
const decision = makeStage('decision', 'Final decision', 7, 30, { isTerminalStage: true });
const stages = [decision, assessment, form];
const transitions: AdmissionWorkflowTransition[] = [
  {
    id: 'usual',
    fromStageId: assessment.id,
    toStageId: form.id,
    priority: 20,
    isDefault: true,
  },
  {
    id: 'accepted',
    fromStageId: assessment.id,
    toStageId: decision.id,
    priority: 10,
    isDefault: false,
    conditionRuleJson: JSON.stringify({
      field: 'Assessment.Outcome',
      operator: 'Equals',
      value: 'Pass',
    }),
  },
  {
    id: 'legacy',
    fromStageId: form.id,
    toStageId: 'removed-stage',
    priority: 10,
    isDefault: false,
    conditionRuleJson: '{"all":[]}',
  },
];
const stageTypes = [
  {
    type: 2,
    displayName: 'Assessment',
    icon: 'mdi:clipboard-text-outline',
  },
] as AdmissionWorkflowStageTypeMetadata[];
const props = {
  panel: 'preview' as const,
  workflow: { id: 'workflow', name: 'Admission stages' } as AdmissionWorkflow,
  stages,
  transitions,
  stageTypes,
  usageLoading: false,
  canCreateVersion: false,
  governanceLoading: false,
};

describe('workflow preview', () => {
  it('displays the saved stage sequence with numbers, canonical types and meaningful badges', () => {
    render(<WorkflowPanelContent {...props} />);

    const sequence = screen.getByRole('list', { name: 'Journey Stage Sequence' });
    expect(
      within(sequence)
        .getAllByRole('heading', { level: 3 })
        .map((item) => item.textContent)
    ).toEqual(['Entrance interview', 'Parent forms', 'Final decision']);
    const [first, second, third] = Array.from(sequence.children) as HTMLElement[];
    expect(within(first).getByText('1', { exact: true })).toBeVisible();
    expect(within(first).getByText('Assessment', { exact: true })).toBeVisible();
    expect(within(first).getByTestId('mdi:clipboard-text-outline')).toBeVisible();
    expect(within(first).getByText('Entry', { exact: true })).toBeVisible();
    expect(within(second).getByText('Saved type 1')).toBeVisible();
    expect(within(third).getByText('Final', { exact: true })).toBeVisible();
    expect(within(sequence).queryByText(/INTERNAL_/)).not.toBeInTheDocument();
    expect(within(sequence).queryByRole('button')).not.toBeInTheDocument();
  });

  it('identifies configured route direction, priority, conditions and unknown destinations', () => {
    render(<WorkflowPanelContent {...props} />);

    const [first, second] = Array.from(
      screen.getByRole('list', { name: 'Journey Stage Sequence' }).children
    ) as HTMLElement[];
    const outgoing = within(first).getByRole('list', { name: 'Next Stages' });
    const [conditional, usual] = within(outgoing).getAllByRole('listitem');
    expect(conditional).toHaveTextContent('To stage 3 · Final decision');
    expect(conditional).toHaveTextContent('Outcome Is Pass');
    expect(usual).toHaveTextContent('To stage 2 · Parent forms');
    expect(usual).toHaveTextContent('Usual path');
    expect(within(second).getByText('Missing stage')).toBeVisible();
    expect(within(second).getByText('Advanced path')).toBeVisible();
  });

  it('shows both saved roles when a stage starts and ends the journey and flags only non-final dead ends', () => {
    render(
      <WorkflowPanelContent
        {...props}
        stages={[form, { ...assessment, isTerminalStage: true }]}
        transitions={[]}
      />
    );

    const [first, second] = Array.from(
      screen.getByRole('list', { name: 'Journey Stage Sequence' }).children
    ) as HTMLElement[];
    expect(within(first).getByText('Entry', { exact: true })).toBeVisible();
    expect(within(first).getByText('Final', { exact: true })).toBeVisible();
    expect(within(first).queryByText('No onward route')).not.toBeInTheDocument();
    expect(within(second).getByText('No onward route')).toBeVisible();
  });
});
