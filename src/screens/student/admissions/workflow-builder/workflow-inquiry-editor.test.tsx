import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const stage: AdmissionWorkflowStage = {
  id: 'inquiry',
  code: 'INQUIRY',
  name: 'Inquiry',
  stageType: 0,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
  configurationJson: JSON.stringify({ inquiry: { enabled: true, assignmentMode: 1 } }),
};
const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 0,
  displayName: 'Inquiry',
  description: 'Historical inquiry stage',
  icon: '',
  defaultColor: '',
  supportedConfiguration: ['inquiry'],
  runtimeHandler: 'Inquiry',
  nextRequiredAction: 'Manage inquiry',
  canBeEntryStage: true,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};
const stageTypes: AdmissionWorkflowStageTypeMetadata[] = [
  metadata,
  { ...metadata, type: 7, displayName: 'Admission decision', supportedConfiguration: [] },
];

it('requires explicit replacement of a saved inquiry stage and offers no inquiry settings', async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={stage}
      forms={[]}
      stages={[stage]}
      stageTypes={stageTypes}
      readOnly={false}
      onSave={onSave}
      onClose={vi.fn()}
    />
  );
  expect(screen.getByText(/retained for existing applications/)).toBeInTheDocument();
  expect(screen.queryByRole('radio', { name: /Managed inquiry/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Assignment method' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('button', { name: 'Apply changes' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Back' }));
  await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
  await user.click(screen.getByRole('option', { name: 'Admission decision' }));
  expect(onSave).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Change type' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Apply changes' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  expect(onSave.mock.calls[0][0]).toMatchObject({ stageType: 7, configurationJson: undefined });
  expect(JSON.parse(stage.configurationJson!)).toEqual({
    inquiry: { enabled: true, assignmentMode: 1 },
  });
});

it('keeps a published inquiry stage readable without editable controls', () => {
  const onSave = vi.fn();
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={stage}
      forms={[]}
      stages={[stage]}
      stageTypes={stageTypes}
      readOnly
      onSave={onSave}
      onClose={vi.fn()}
    />
  );
  expect(screen.getByText(/retained for existing applications/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});
