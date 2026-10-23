import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const stages: AdmissionWorkflowStage[] = [
  {
    id: 'source',
    code: 'SOURCE',
    name: 'Source',
    stageType: 7,
    displayOrder: 0,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: true,
    isTerminalStage: false,
  },
  {
    id: 'approved',
    code: 'APPROVED',
    name: 'Approved',
    stageType: 7,
    displayOrder: 1,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: false,
    isTerminalStage: true,
  },
  {
    id: 'rejected',
    code: 'REJECTED',
    name: 'Rejected',
    stageType: 7,
    displayOrder: 2,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: false,
    isTerminalStage: true,
  },
];

const condition = JSON.stringify({
  field: 'application.status',
  operator: 'Equals',
  value: 'approved',
});

const renderDrawer = (
  transition: AdmissionWorkflowTransition | null,
  transitions: AdmissionWorkflowTransition[] = [],
  availableStages: AdmissionWorkflowStage[] = stages
) => {
  const onSave = vi.fn();
  render(
    <AdmissionWorkflowTransitionDrawer
      open
      stages={availableStages}
      readOnly={false}
      transition={transition}
      transitions={transitions}
      onClose={vi.fn()}
      onSave={onSave}
    />
  );
  return onSave;
};

describe('workflow transition safety', () => {
  it('excludes retired types when selecting a new route destination', async () => {
    const user = userEvent.setup();
    renderDrawer(
      null,
      [],
      [...stages, { ...stages[2], id: 'retired', name: 'Offer', stageType: 8 }]
    );
    await user.click(screen.getByRole('combobox', { name: 'Continue to *' }));
    expect(screen.queryByRole('option', { name: 'Offer' })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
  });
  it('always saves a route without a condition as the default route', async () => {
    const user = userEvent.setup();
    const onSave = renderDrawer(null);

    expect(screen.getByRole('region', { name: 'Next-step configuration' })).toBeInTheDocument();
    expect(screen.getByText('This is the default route', { exact: false })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save path' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      fromStageId: 'source',
      toStageId: 'approved',
      isDefault: true,
    });
  });

  it('prevents a second default route from the same stage', async () => {
    const user = userEvent.setup();
    const existing: AdmissionWorkflowTransition = {
      id: 'existing-default',
      fromStageId: 'source',
      toStageId: 'rejected',
      priority: 0,
      isDefault: true,
    };
    const onSave = renderDrawer(null, [existing]);

    await user.click(screen.getByRole('button', { name: 'Save path' }));

    expect(await screen.findByText('This stage already has a default route')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('requires unique priorities for conditional routes from the same stage', async () => {
    const user = userEvent.setup();
    const current: AdmissionWorkflowTransition = {
      id: 'current',
      fromStageId: 'source',
      toStageId: 'approved',
      priority: 0,
      isDefault: false,
      conditionRuleJson: condition,
    };
    const other: AdmissionWorkflowTransition = {
      id: 'other',
      fromStageId: 'source',
      toStageId: 'rejected',
      priority: 0,
      isDefault: false,
      conditionRuleJson: condition,
    };
    const onSave = renderDrawer(current, [current, other]);

    await user.click(screen.getByRole('button', { name: 'Save path' }));

    expect(
      await screen.findByText('Use a unique priority for each conditional route from this stage')
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
