import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, fireEvent } from '@testing-library/react';

import { WorkflowStageNextSteps } from './components/workflow-stage-next-steps';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const stage: AdmissionWorkflowStage = {
  id: 'form',
  code: 'FORM',
  name: 'Application form',
  stageType: 1,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
};
const destination = { ...stage, id: 'assessment', code: 'ASSESSMENT', name: 'Entrance exam' };
const defaultPath: AdmissionWorkflowTransition = {
  id: 'usual-path',
  fromStageId: stage.id,
  toStageId: destination.id,
  priority: 1,
  isDefault: true,
};

describe('stage next steps', () => {
  it('keeps the usual path editable without offering special outcomes', async () => {
    const onAddPath = vi.fn();
    const onEditPath = vi.fn();
    renderDocumentUi(
      <WorkflowStageNextSteps
        stage={stage}
        stages={[stage, destination]}
        transitions={[defaultPath]}
        onAddPath={onAddPath}
        onEditPath={onEditPath}
      />
    );
    const user = userEvent.setup();
    expect(screen.getByText(destination.name)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add special outcome' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choose next step' })).not.toBeInTheDocument();
    expect(onAddPath).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Change' }));
    expect(onEditPath).toHaveBeenCalledExactlyOnceWith(defaultPath);
  });
  it('can configure a usual next step when there is no default route', async () => {
    const onAddPath = vi.fn();
    renderDocumentUi(
      <WorkflowStageNextSteps stage={stage} stages={[stage]} onAddPath={onAddPath} />
    );
    expect(screen.getByText('No next step configured.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add special outcome' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Choose next step' }));
    expect(onAddPath).toHaveBeenCalledExactlyOnceWith(stage);
  });
  it('locks outcome actions until pending stage changes are applied', () => {
    const onAddPath = vi.fn();
    const onEditPath = vi.fn();
    renderDocumentUi(
      <WorkflowStageNextSteps
        stage={stage}
        stages={[stage, destination]}
        transitions={[defaultPath]}
        routeEditingDisabled
        onAddPath={onAddPath}
        onEditPath={onEditPath}
      />
    );
    expect(screen.queryByRole('button', { name: 'Add special outcome' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(onAddPath).not.toHaveBeenCalled();
    expect(onEditPath).not.toHaveBeenCalled();
  });
  it('preserves destination summaries without offering route changes for published workflows', () => {
    renderDocumentUi(
      <WorkflowStageNextSteps
        stage={stage}
        stages={[stage, destination]}
        transitions={[defaultPath]}
        readOnly
        onAddPath={vi.fn()}
        onEditPath={vi.fn()}
      />
    );
    expect(screen.getByText(destination.name)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add special outcome' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument();
  });
  it('keeps end-of-journey stages free of outgoing outcome actions', () => {
    renderDocumentUi(
      <WorkflowStageNextSteps
        stage={{ ...stage, isTerminalStage: true }}
        stages={[stage]}
        onAddPath={vi.fn()}
      />
    );
    expect(screen.getByText('End of journey')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add special outcome' })).not.toBeInTheDocument();
  });
});
