import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { screen, fireEvent } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';

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

describe('stage special outcomes', () => {
  it('adds an outcome through the existing route editor without removing the usual path', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Add special outcome' }));
    expect(onAddPath).toHaveBeenCalledExactlyOnceWith(stage);
    await user.click(screen.getByRole('button', { name: 'Change' }));
    expect(onEditPath).toHaveBeenCalledExactlyOnceWith(defaultPath);
  });
  it('uses the same outcome action before the first route is configured', async () => {
    const onAddPath = vi.fn();
    renderDocumentUi(
      <WorkflowStageNextSteps stage={stage} stages={[stage]} onAddPath={onAddPath} />
    );
    expect(screen.getByText('No next step configured.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choose next step' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Add special outcome' }));
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
    expect(screen.getByRole('button', { name: 'Add special outcome' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Change' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add special outcome' }));
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
