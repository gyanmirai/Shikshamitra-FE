import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useFormik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { createStage } from '../workflow-builder-utils';
import { WorkflowStageTypeSelect } from './components/workflow-stage-type-select';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const formType: AdmissionWorkflowStageTypeMetadata = {
  type: 1,
  displayName: 'Form',
  description: 'Collect application details',
  icon: 'mdi:file',
  defaultColor: '',
  supportedConfiguration: ['form'],
  runtimeHandler: 'Form',
  nextRequiredAction: 'Submit form',
  canBeEntryStage: true,
  canBeTerminalStage: true,
  supportsFormAttachment: true,
  supportsConditions: true,
  isRuntimeReady: true,
};
const types: AdmissionWorkflowStageTypeMetadata[] = [
  formType,
  {
    ...formType,
    type: 2,
    displayName: 'Assessment',
    description: 'Record an assessment result',
    canBeEntryStage: false,
    canBeTerminalStage: false,
  },
];
const initial: AdmissionWorkflowStage = {
  id: 'form',
  code: 'FORM',
  name: 'Form',
  description: formType.description,
  stageType: 1,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
  configurationJson: JSON.stringify({ formDefinitionId: 'published-form' }),
};

function Fixture({
  stage = initial,
  readOnly = false,
  isNewStage = false,
}: {
  stage?: AdmissionWorkflowStage;
  readOnly?: boolean;
  isNewStage?: boolean;
}) {
  const formik = useFormik({ initialValues: stage, onSubmit: vi.fn() });
  return (
    <>
      <WorkflowStageTypeSelect
        formik={formik}
        metadata={types.find((item) => item.type === formik.values.stageType)}
        stageTypes={types}
        readOnly={readOnly}
        isNewStage={isNewStage}
      />
      <output data-testid="draft">{JSON.stringify(formik.values)}</output>
    </>
  );
}
const draft = () => JSON.parse(screen.getByTestId('draft').textContent!);

describe('safe stage type changes', () => {
  it('protects an attached form on a new stage until its type change is confirmed', async () => {
    const user = userEvent.setup();
    render(<Fixture isNewStage />);
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Assessment' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(draft()).toEqual(initial);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(draft()).toEqual(initial);
  });
  it('changes a newly created normalized stage without a destructive confirmation', async () => {
    const user = userEvent.setup();
    const stage = createStage(formType, 1, false);
    expect(stage.configurationJson).toBeTruthy();
    render(<Fixture stage={stage} isNewStage />);
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Assessment' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(draft()).toMatchObject({ stageType: 2, code: stage.code, id: stage.id });
  });
  it('preserves the chosen ending when changing to another stage type', async () => {
    const user = userEvent.setup();
    render(<Fixture stage={{ ...initial, isTerminalStage: true }} />);
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Assessment' }));
    await user.click(screen.getByRole('button', { name: 'Change type' }));
    expect(draft()).toMatchObject({ stageType: 2, isTerminalStage: true });
  });

  it('keeps configured form on cancel and clears it only after confirmation', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Assessment' }));
    expect(draft()).toEqual(initial);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(draft()).toEqual(initial);
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Assessment' }));
    await user.click(screen.getByRole('button', { name: 'Change type' }));
    expect(draft()).toMatchObject({
      name: 'Assessment',
      description: 'Record an assessment result',
      stageType: 2,
      code: 'FORM',
      isEntryStage: false,
    });
    expect(JSON.parse(draft().configurationJson).assessment).toMatchObject({
      enabled: true,
      reviewRequired: false,
    });
  });
  it('keeps custom copy and changes an unconfigured stage without a destructive confirmation', async () => {
    const user = userEvent.setup();
    render(
      <Fixture
        stage={{
          ...initial,
          name: 'Class 10 admission',
          description: 'Call the guardian first',
          configurationJson: undefined,
        }}
      />
    );
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Assessment' }));
    expect(draft()).toMatchObject({
      stageType: 2,
      name: 'Class 10 admission',
      description: 'Call the guardian first',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('disables type selection in read-only view', () => {
    render(<Fixture readOnly />);
    expect(screen.getByRole('combobox', { name: 'Stage type *' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(draft()).toEqual(initial);
  });
});
