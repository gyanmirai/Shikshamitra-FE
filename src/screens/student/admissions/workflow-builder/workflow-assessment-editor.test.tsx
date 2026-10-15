import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

// Load the same rendered icons directly; avoid transforming the unrelated MUI icon catalogue.
vi.mock('@mui/icons-material', async () => {
  const [Info, Error, CheckCircle, WarningAmber] = await Promise.all([
    import('@mui/icons-material/Info'),
    import('@mui/icons-material/Error'),
    import('@mui/icons-material/CheckCircle'),
    import('@mui/icons-material/WarningAmber'),
  ]);
  return {
    Info: Info.default,
    Error: Error.default,
    CheckCircle: CheckCircle.default,
    WarningAmber: WarningAmber.default,
  };
});
['close', 'content-save-outline', 'clipboard-check-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 2,
  displayName: 'Assessment',
  description: 'Evaluate applicants',
  icon: 'mdi:clipboard-check-outline',
  defaultColor: '#1976d2',
  supportedConfiguration: ['assessment'],
  runtimeHandler: 'Assessment',
  nextRequiredAction: 'Record assessment',
  canBeEntryStage: true,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};
const stage: AdmissionWorkflowStage = {
  id: 'stage-1',
  code: 'ENTRANCE_EXAM',
  name: 'Entrance assessment',
  stageType: 2,
  displayOrder: 1,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
};
async function setup(
  configurationJson?: string,
  readOnly = false,
  description?: string,
  stageChanges: Partial<AdmissionWorkflowStage> = {}
) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={{ ...stage, configurationJson, description, ...stageChanges }}
      stageTypes={[metadata]}
      forms={[]}
      readOnly={readOnly}
      onSave={onSave}
      onClose={onClose}
    />
  );
  await screen.findByRole('button', { name: readOnly ? 'Close' : 'Apply changes' });
  return { onSave, onClose, user: userEvent.setup() };
}
describe('combined assessment setup', { timeout: 15000 }, () => {
  it('shows assessment settings directly without changing its policy or hiding stage controls', async () => {
    const { user, onSave } = await setup();
    expect(screen.queryByRole('button', { name: 'Assessment settings' })).not.toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Total marks *' })).toBeVisible();
    expect(screen.getByText('Required stage')).toBeVisible();
    expect(screen.getByText('End of journey')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment).toMatchObject(
      DEFAULT_ASSESSMENT_POLICY
    );
  });
  it('uses direct result recording by default and preserves sibling configuration and entry flags', async () => {
    const { user, onSave } = await setup(
      '{"extension":{"source":"intake"}}',
      false,
      'Saved instructions',
      { isEntryStage: true }
    );
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Schedule an entrance exam' })).not.toBeChecked();
    expect(screen.getByRole('spinbutton', { name: 'Maximum attempts *' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Entry stage' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toMatchObject({
      extension: { source: 'intake' },
      assessment: { enabled: true, schedulingEnabled: false, reviewRequired: false },
    });
    expect(onSave.mock.calls[0][0]).toMatchObject({
      isEntryStage: true,
      description: 'Saved instructions',
    });
  });
  it('enables exam scheduling and attendance in the same managed setup', async () => {
    const { user, onSave } = await setup();
    await user.click(screen.getByRole('switch', { name: 'Schedule an entrance exam' }));
    await user.click(screen.getByRole('switch', { name: 'Require attendance' }));
    expect(screen.queryByRole('switch', { name: 'Require result review' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment).toMatchObject({
      enabled: true,
      schedulingEnabled: true,
      attendanceRequired: true,
      reviewRequired: false,
    });
  });
  it('clears retired result-review rules while retaining valid saved scoring and attempt limits', async () => {
    const { user, onSave } = await setup(
      JSON.stringify({
        assessment: { ...DEFAULT_ASSESSMENT_POLICY, reviewRequired: true, maxAttempts: 3 },
      })
    );
    expect(screen.getByRole('spinbutton', { name: 'Maximum attempts *' })).toHaveValue(3);
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment).toMatchObject({
      reviewRequired: false,
      maxAttempts: 3,
    });
  });
  it('rejects invalid marks without an alternate manual bypass and preserves the draft for correction', async () => {
    const { user, onSave } = await setup();
    const input = screen.getByRole('spinbutton', { name: 'Passing marks *' });
    await user.clear(input);
    await user.type(input, '101');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(
      await screen.findByText('Passing marks must be between zero and the total marks.')
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, '50');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment.passingMarks).toBe(50);
  });
  it('blocks unsupported policy versions rather than silently replacing them', async () => {
    const { user, onSave } = await setup(
      JSON.stringify({ assessment: { ...DEFAULT_ASSESSMENT_POLICY, version: 2 } })
    );
    expect(screen.getByText(/unsupported or incomplete/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assessment settings' })).not.toBeInTheDocument();
    expect(screen.getByText(/unsupported or incomplete/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onSave).not.toHaveBeenCalled();
  });
  it('keeps all published settings read-only', async () => {
    await setup(JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }), true);
    screen.getAllByRole('switch').forEach((option) => expect(option).toBeDisabled());
    expect(screen.getByRole('spinbutton', { name: 'Total marks *' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument();
  });
});
