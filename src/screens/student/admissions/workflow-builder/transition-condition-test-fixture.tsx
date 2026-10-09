import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { vi } from 'vitest';
import { addIcon } from '@iconify/react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

['close', 'content-save-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});
const source: AdmissionWorkflowStage = {
  id: 'form-1',
  code: 'FORM',
  name: 'Application form',
  stageType: 1,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
  configurationJson: undefined,
};
const destination: AdmissionWorkflowStage = {
  ...source,
  id: 'decision-1',
  code: 'DECISION',
  name: 'Decision',
  stageType: 7,
  displayOrder: 1,
  configurationJson: undefined,
};
const otherStage = {
  ...destination,
  id: 'decision-2',
  code: 'SECOND_DECISION',
  name: 'Second decision',
};
const otherForm = {
  ...source,
  id: 'form-2',
  code: 'SECOND_CHECK',
  name: 'Second form',
};
export function renderConditionRoute(conditionRuleJson?: string, readOnly = false) {
  const onSave = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionWorkflowTransitionDrawer
        open
        stages={[source, destination, otherStage, otherForm]}
        readOnly={readOnly}
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
  return { onSave };
}
