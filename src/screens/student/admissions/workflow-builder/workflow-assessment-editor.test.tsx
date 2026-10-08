import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('button', { name: readOnly ? 'Close' : 'Apply changes' });
  return { onSave, onClose, user: userEvent.setup() };
}
async function chooseProcess(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('radio', { name }));
}

// Real MUI transitions and keyboard entry need a bounded allowance on busy Windows hosts.
describe('assessment stage editor interactions', { timeout: 15000 }, () => {
  it('preserves an assessment entry-stage flag while editing visible stage details', async () => {
    const { user, onSave } = await setup(undefined, false, undefined, { isEntryStage: true });
    expect(screen.queryByRole('switch', { name: 'Entry stage' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    const name = screen.getByRole('textbox', { name: 'Stage name *' });
    await user.clear(name);
    await user.type(name, 'School entrance assessment');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ isEntryStage: true, name: 'School entrance assessment' })
      )
    );
  });

  it('opts into result recording without enabling scheduling', async () => {
    const { user, onSave } = await setup('{"extension":{"source":"intake"}}');
    await chooseProcess(user, 'Record an assessment result');
    expect(screen.getByRole('radio', { name: 'Record an assessment result' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Schedule an entrance exam' })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toEqual({
      extension: { source: 'intake' },
      assessment: { ...DEFAULT_ASSESSMENT_POLICY, schedulingEnabled: false },
    });
  });

  it('leaves basic legacy assessment configuration untouched when saving unrelated stage details', async () => {
    const original = '{"integration":{"rubric":"existing"}}';
    const { user, onSave } = await setup(original, false, 'Keep the original instructions');
    expect(screen.getByRole('radio', { name: 'Complete manually' })).toBeChecked();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Record an assessment result' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Schedule an entrance exam' })).not.toBeChecked();
    expect(screen.queryByRole('spinbutton', { name: /Total marks/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    const name = screen.getByRole('textbox', { name: 'Stage name *' });
    await user.clear(name);
    await user.type(name, 'School entrance assessment');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          configurationJson: original,
          name: 'School entrance assessment',
          description: 'Keep the original instructions',
        })
      )
    );
  });

  it('opts into scheduled assessment and preserves sibling settings when saving the draft stage', async () => {
    const { user, onSave } = await setup(
      '{"formDefinitionId":"frozen-form","extension":{"rubric":"A"}}'
    );
    await chooseProcess(user, 'Schedule an entrance exam');
    await user.click(screen.getByRole('switch', { name: 'Require attendance' }));
    await user.click(screen.getByRole('switch', { name: 'Require result review' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toEqual({
      formDefinitionId: 'frozen-form',
      extension: { rubric: 'A' },
      assessment: {
        ...DEFAULT_ASSESSMENT_POLICY,
        schedulingEnabled: true,
        attendanceRequired: true,
        reviewRequired: true,
      },
    });
  });

  it('blocks invalid passing marks and preserves settings when returning to basic completion', async () => {
    const { user, onSave } = await setup(JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }));
    const input = screen.getByRole('spinbutton', { name: /Passing marks/ });
    await user.clear(input);
    await user.type(input, '101');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Passing marks must be between zero and the total marks.')
    ).toBeInTheDocument();
    await chooseProcess(user, 'Complete manually');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment).toMatchObject({
      enabled: false,
      passingMarks: 101,
    });
  });

  it('prevents future policy versions from being silently downgraded or saved', async () => {
    const { user, onSave } = await setup(
      JSON.stringify({ assessment: { ...DEFAULT_ASSESSMENT_POLICY, version: 2 } })
    );
    screen.getAllByRole('radio').forEach((option) => expect(option).toBeDisabled());
    expect(screen.getByText(/unsupported or incomplete/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('keeps published stage controls read-only', async () => {
    await setup(JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }), true);
    screen.getAllByRole('radio').forEach((option) => expect(option).toBeDisabled());
    expect(screen.getByRole('spinbutton', { name: /Total marks/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument();
  });
});
