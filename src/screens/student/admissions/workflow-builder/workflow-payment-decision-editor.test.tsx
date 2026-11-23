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

function setup(
  type: 4 | 7,
  readOnly = false,
  position: 'existing' | 'earlier' | 'before-final' | 'after-last' | 'first' = 'existing'
) {
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
    isTerminalStage: type === 7 && position !== 'after-last' && position !== 'first',
    configurationJson:
      type === 4
        ? JSON.stringify({
            payment: { enabled: true, purposeCode: 'LEGACY', amount: 500 },
            paymentCompletion: { version: 1, paymentRule: 'full', allowCollectionLater: false },
            extension: 'preserve',
          })
        : undefined,
  };
  const other: AdmissionWorkflowStage = {
    ...stage,
    id: 'other-stage',
    code: 'OTHER_STAGE',
    name: 'Other stage',
    displayOrder: 1,
    stageType: position === 'after-last' ? 4 : 7,
    isTerminalStage: position !== 'after-last',
  };
  const stages =
    position === 'first'
      ? []
      : position === 'existing'
        ? [stage]
        : position === 'earlier'
          ? [stage, other]
          : [other];
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={stage}
      stageTypes={[metadata]}
      forms={[]}
      stages={stages}
      insertionSourceId={position === 'before-final' || position === 'after-last' ? other.id : null}
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
    expect(screen.queryByRole('heading', { name: 'Payment Completion' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Completion requirement' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Payment rule/ })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: 'Allow collection later in Onboarding' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stage Details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stage Behavior' })).toBeInTheDocument();
    expect(screen.queryByText(/not available in this environment/)).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Purpose Code/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: /Amount/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toEqual({
      extension: 'preserve',
    });
  });
  it('keeps the last Admission decision checked and locked', async () => {
    const { user, onSave } = setup(7);
    expect(screen.getByRole('heading', { name: 'Stage Details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stage Behavior' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Advanced Settings' })).not.toBeInTheDocument();
    const ending = screen.getByRole('switch', { name: 'End Of Journey' });
    expect(ending).toBeChecked();
    expect(ending).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({ stageType: 7, isTerminalStage: true });
  });
  it.each([
    ['earlier', false],
    ['before-final', false],
    ['after-last', true],
    ['first', true],
  ] as const)(
    'derives End of Journey for an Admission decision at %s',
    async (position, terminal) => {
      const { user, onSave } = setup(7, false, position);
      const ending = screen.getByRole('switch', { name: 'End Of Journey' });
      expect(ending).toBeDisabled();
      expect((ending as HTMLInputElement).checked).toBe(terminal);
      await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
      await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
      expect(onSave.mock.calls[0][0]).toMatchObject({ stageType: 7, isTerminalStage: terminal });
    }
  );
  it('shows Payment read-only and closes without saving', async () => {
    const { user, onSave, onClose } = setup(4, true);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Stage name', { selector: 'dt' })).toBeVisible();
    expect(screen.getAllByText('Payment', { selector: 'dd' })).toHaveLength(2);
    expect(screen.queryByRole('heading', { name: 'Payment Completion' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply Changes' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
