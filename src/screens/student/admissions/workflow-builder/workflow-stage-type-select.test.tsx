import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useFormik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

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
}: {
  stage?: AdmissionWorkflowStage;
  readOnly?: boolean;
}) {
  const formik = useFormik({ initialValues: stage, onSubmit: vi.fn() });
  return (
    <>
      <WorkflowStageTypeSelect
        formik={formik}
        metadata={types.find((item) => item.type === formik.values.stageType)}
        stageTypes={types}
        readOnly={readOnly}
      />
      <output data-testid="draft">{JSON.stringify(formik.values)}</output>
    </>
  );
}
const draft = () => JSON.parse(screen.getByTestId('draft').textContent!);

describe('safe stage type changes', () => {
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
    expect(draft().configurationJson).toBeUndefined();
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
