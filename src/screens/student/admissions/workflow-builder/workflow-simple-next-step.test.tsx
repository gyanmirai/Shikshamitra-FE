import type { AdmissionWorkflowTransition } from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { getAdmissionWorkflowTemplate } from '../workflow-template';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function renderNextStep(conditional = false, creating = false) {
  const graph = getAdmissionWorkflowTemplate('standard', 'form-1');
  const transition: AdmissionWorkflowTransition = {
    ...graph.transitions[0],
    ...(creating && { id: '' }),
    ...(conditional && {
      isDefault: false,
      conditionRuleJson: JSON.stringify({
        field: 'assessment.outcome',
        operator: 'Equals',
        value: 'failed',
      }),
    }),
  };
  const onSave = vi.fn();
  renderDocumentUi(
    <AdmissionWorkflowTransitionDrawer
      open
      simpleNextStep
      readOnly={false}
      transition={transition}
      transitions={creating ? [] : [transition]}
      stages={graph.stages}
      onClose={vi.fn()}
      onSave={onSave}
    />
  );
  return { transition, onSave };
}

it('creates one usual route for an unconnected stage', async () => {
  const { transition, onSave } = renderNextStep(false, true);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Save path' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  const saved = onSave.mock.calls[0][0];
  expect(saved.id).toBeTruthy();
  expect(saved).toMatchObject({
    fromStageId: transition.fromStageId,
    toStageId: transition.toStageId,
    isDefault: true,
  });
  expect(saved.conditionRuleJson).toBeUndefined();
});

it('saves a usual next step without exposing assessment outcomes or condition fields', async () => {
  const { transition, onSave } = renderNextStep();
  expect(screen.getByRole('heading', { name: 'Choose next step' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Continue to *' })).toBeEnabled();
  expect(screen.queryByRole('combobox', { name: 'Continue after' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Application field *' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Comparison *' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Value *' })).not.toBeInTheDocument();
  expect(screen.queryByText('Use a saved field code (advanced)')).not.toBeInTheDocument();
  expect(
    screen.getByText(/Failed, absent or retake outcomes stay at Assessment/)
  ).toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Save path' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  expect(onSave.mock.calls[0][0]).toMatchObject({
    id: transition.id,
    fromStageId: transition.fromStageId,
    toStageId: transition.toStageId,
    isDefault: true,
  });
  expect(onSave.mock.calls[0][0].conditionRuleJson).toBeUndefined();
});

it('preserves saved special routes as read-only and blocks form submission', async () => {
  const { onSave } = renderNextStep(true);
  expect(screen.getByRole('heading', { name: 'Next-step details' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Continue to *' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.queryByRole('button', { name: 'Save path' })).not.toBeInTheDocument();
  expect(screen.getByText(/Existing special paths remain read-only/)).toBeInTheDocument();
  fireEvent.submit(screen.getByRole('heading', { name: 'Next-step details' }).closest('form')!);
  await waitFor(() => expect(screen.queryByText('Saving...')).not.toBeInTheDocument());
  expect(onSave).not.toHaveBeenCalled();
});
