import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

['close', 'content-save-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});
const source: AdmissionWorkflowStage = {
  id: 'assessment-1',
  code: 'ASSESSMENT',
  name: 'Entrance assessment',
  stageType: 2,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
  configurationJson: JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }),
};
const destination: AdmissionWorkflowStage = {
  ...source,
  id: 'registration-1',
  code: 'REGISTRATION',
  name: 'Registration',
  stageType: 7,
  displayOrder: 1,
  isEntryStage: false,
  configurationJson: undefined,
};
const otherStage: AdmissionWorkflowStage = {
  ...destination,
  id: 'review-1',
  code: 'REVIEW',
  name: 'Staff review',
};
function setup(conditionRuleJson?: string) {
  const onSave = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionWorkflowTransitionDrawer
        open
        stages={[source, destination, otherStage]}
        readOnly={false}
        transition={{
          id: 'transition-1',
          fromStageId: source.id,
          toStageId: destination.id,
          priority: 0,
          isDefault: !conditionRuleJson,
          conditionRuleJson,
        }}
        onClose={vi.fn()}
        onSave={onSave}
      />
    </ThemeProvider>
  );
  return { user: userEvent.setup(), onSave };
}

describe('assessment route interactions', { timeout: 15000 }, () => {
  it('serializes a failed assessment route as an explicit outcome condition without UI-only fields', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('combobox', { name: 'Continue after' }));
    await user.click(screen.getByRole('option', { name: /^Failed$/ }));
    await waitFor(() =>
      expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toEqual({
      id: 'transition-1',
      fromStageId: source.id,
      toStageId: destination.id,
      priority: 0,
      isDefault: false,
      conditionRuleJson: JSON.stringify({
        operator: 'Equals',
        field: 'assessment.outcome',
        value: 'failed',
      }),
    });
  });

  it.each([
    ['{"field":"assessment.outcome","operator":"Equals","value":"failed"}'],
    ['{"field":"application.score","operator":"GreaterThan","value":"50"}'],
  ] as const)('keeps the path attached to its assessment stage: %s', async (condition) => {
    const { user, onSave } = setup(condition);
    expect(screen.getByRole('heading', { name: 'Entrance assessment' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'From stage *' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const saved = onSave.mock.calls[0][0];
    expect(saved.fromStageId).toBe(source.id);
    expect(saved.isDefault).toBe(false);
    expect(JSON.parse(saved.conditionRuleJson)).toEqual(JSON.parse(condition));
  });

  it('reopens an existing failed route and can return it to the default passing route', async () => {
    const { user, onSave } = setup(
      '{"field":"assessment.outcome","operator":"Equals","value":"failed"}'
    );
    expect(screen.getByRole('combobox', { name: 'Continue after' })).toHaveTextContent('Failed');
    await user.click(screen.getByRole('combobox', { name: 'Continue after' }));
    await user.click(screen.getByRole('option', { name: 'Passed or waived (default route)' }));
    await waitFor(() =>
      expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      isDefault: true,
      conditionRuleJson: undefined,
    });
  });
});
