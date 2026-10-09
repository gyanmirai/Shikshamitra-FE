import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function setup(type: 4 | 7, readOnly = false) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  const name = type === 4 ? 'Payment' : 'Admission Decision';
  const metadata: AdmissionWorkflowStageTypeMetadata = {
    type,
    displayName: name,
    description: name,
    icon: '',
    defaultColor: '',
    supportedConfiguration: [],
    runtimeHandler: name,
    nextRequiredAction: '',
    canBeEntryStage: false,
    canBeTerminalStage: true,
    supportsFormAttachment: false,
    supportsConditions: true,
    isRuntimeReady: true,
  };
  const stage: AdmissionWorkflowStage = {
    id: 'stage',
    code: 'STAGE',
    name,
    stageType: type,
    displayOrder: 0,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: false,
    isTerminalStage: type === 7,
    configurationJson:
      type === 4
        ? JSON.stringify({
            payment: { enabled: true, purposeCode: 'LEGACY', amount: 500 },
            extension: 'preserve',
          })
        : undefined,
  };
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={stage}
      stageTypes={[metadata]}
      forms={[]}
      stages={[stage]}
      readOnly={readOnly}
      onClose={onClose}
      onSave={onSave}
    />
  );
  return { onSave, onClose, user: userEvent.setup() };
}

describe('Finance fee confirmation and admission decision setup', () => {
  it('uses runtime readiness for fee confirmation and removes stale payment configuration without losing extensions', async () => {
    const { user, onSave } = setup(4);
    expect(screen.getByRole('heading', { name: 'Fee structure confirmation' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Completion requirement' })).toHaveValue(
      'Confirmed Finance fee structure'
    );
    expect(screen.queryByText(/not available in this environment/)).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Purpose code/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: /Amount/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toEqual({
      extension: 'preserve',
    });
  });
  it('keeps Admission Decision terminal behavior on the same page', async () => {
    const { user, onSave } = setup(7);
    expect(screen.getByRole('heading', { name: 'Stage details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stage behavior' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Advanced settings' })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'End of journey' })).toBeChecked();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({ stageType: 7, isTerminalStage: true });
  });
  it('shows Payment read-only and closes without saving', async () => {
    const { user, onSave, onClose } = setup(4, true);
    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
