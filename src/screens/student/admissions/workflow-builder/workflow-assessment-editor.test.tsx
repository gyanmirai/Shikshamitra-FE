import type { AdmissionWorkflowStage, AdmissionWorkflowStageTypeMetadata } from 'src/redux/student/admissions/admission-workflows-api';

import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';

// Load the same rendered icons directly; avoid transforming the unrelated MUI icon catalogue.
vi.mock('@mui/icons-material', async () => {
  const [Info, Error, CheckCircle, WarningAmber] = await Promise.all([
    import('@mui/icons-material/Info'), import('@mui/icons-material/Error'),
    import('@mui/icons-material/CheckCircle'), import('@mui/icons-material/WarningAmber'),
  ]);
  return { Info: Info.default, Error: Error.default, CheckCircle: CheckCircle.default, WarningAmber: WarningAmber.default };
});
['close', 'content-save-outline', 'clipboard-check-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 2, displayName: 'Assessment', description: 'Evaluate applicants',
  icon: 'mdi:clipboard-check-outline', defaultColor: '#1976d2', supportedConfiguration: ['assessment'],
  runtimeHandler: 'Assessment', nextRequiredAction: 'Record assessment', canBeEntryStage: true,
  canBeTerminalStage: false, supportsFormAttachment: false, supportsConditions: true, isRuntimeReady: true,
};
const stage: AdmissionWorkflowStage = {
  id: 'stage-1', code: 'ENTRANCE_EXAM', name: 'Entrance assessment', stageType: 2,
  displayOrder: 1, isRequired: true, allowManualSkip: false, isEntryStage: false, isTerminalStage: false,
};
function setup(configurationJson?: string, readOnly = false) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(<ThemeProvider theme={createTheme(defaultSettings)}>
    <AdmissionWorkflowStageDrawer open stage={{ ...stage, configurationJson }} stageTypes={[metadata]}
      forms={[]} readOnly={readOnly} onSave={onSave} onClose={onClose} />
  </ThemeProvider>);
  return { onSave, onClose, user: userEvent.setup() };
}
async function chooseProcess(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('combobox', { name: 'Assessment process' }));
  await user.click(screen.getByRole('option', { name }));
  await waitFor(() => expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument());
}

// Real MUI transitions and keyboard entry need a bounded allowance on busy Windows hosts.
describe('assessment stage editor interactions', { timeout: 15000 }, () => {
it('leaves basic legacy assessment configuration untouched when saving unrelated stage details', async () => {
  const original = '{"integration":{"rubric":"existing"}}';
  const { user, onSave } = setup(original);
  expect(screen.getByRole('combobox', { name: 'Assessment process' })).toHaveTextContent('Basic completion');
  expect(screen.queryByRole('spinbutton', { name: /Total marks/ })).not.toBeInTheDocument();
  await user.type(screen.getByRole('textbox', { name: 'Staff instructions' }), 'Bring a pencil');
  await user.click(screen.getByRole('button', { name: 'Save stage' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ configurationJson: original, description: 'Bring a pencil' })));
});

it('opts into scheduled assessment and preserves sibling settings when saving the draft stage', async () => {
  const { user, onSave } = setup('{"formDefinitionId":"frozen-form","extension":{"rubric":"A"}}');
  await chooseProcess(user, 'Schedule an entrance exam');
  await user.click(screen.getByRole('switch', { name: 'Require attendance' }));
  await user.click(screen.getByRole('switch', { name: 'Require result review' }));
  await user.click(screen.getByRole('button', { name: 'Save stage' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toEqual({
    formDefinitionId: 'frozen-form', extension: { rubric: 'A' },
    assessment: { ...DEFAULT_ASSESSMENT_POLICY, schedulingEnabled: true, attendanceRequired: true, reviewRequired: true },
  });
});

it('blocks invalid passing marks and preserves settings when returning to basic completion', async () => {
  const { user, onSave } = setup(JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }));
  const input = screen.getByRole('spinbutton', { name: /Passing marks/ });
  await user.clear(input); await user.type(input, '101');
  await user.click(screen.getByRole('button', { name: 'Save stage' }));
  expect(onSave).not.toHaveBeenCalled();
  expect(await screen.findByText('Passing marks must be between zero and the total marks.')).toBeInTheDocument();
  await chooseProcess(user, 'Basic completion (existing process)');
  await user.click(screen.getByRole('button', { name: 'Save stage' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment).toMatchObject({ enabled: false, passingMarks: 101 });
});

it('prevents future policy versions from being silently downgraded or saved', async () => {
  const { user, onSave } = setup(JSON.stringify({ assessment: { ...DEFAULT_ASSESSMENT_POLICY, version: 2 } }));
  expect(screen.getByRole('combobox', { name: 'Assessment process' })).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByText(/unsupported or incomplete/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save stage' }));
  expect(onSave).not.toHaveBeenCalled();
});

it('keeps published stage controls read-only', () => {
  setup(JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }), true);
  expect(screen.getByRole('combobox', { name: 'Assessment process' })).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('spinbutton', { name: /Total marks/ })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Save stage' })).not.toBeInTheDocument();
});
});
