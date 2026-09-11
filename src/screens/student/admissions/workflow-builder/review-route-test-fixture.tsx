import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { DEFAULT_REVIEW_POLICY } from 'src/redux/student/admissions/admission-review-policy';

import { reviewEditorStage } from './review-editor-test-fixture';
import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

export function renderReviewRoute(conditionRuleJson?: string, readOnly = false) {
  const onSave = vi.fn();
  const source = {
    ...reviewEditorStage,
    configurationJson: JSON.stringify({ review: DEFAULT_REVIEW_POLICY }),
  };
  const destination = {
    ...reviewEditorStage,
    id: 'approval',
    code: 'APPROVAL',
    name: 'Admission approval',
    stageType: 7 as const,
  };
  const basic = { ...reviewEditorStage, id: 'basic', code: 'BASIC', name: 'Basic review' };
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionWorkflowTransitionDrawer
        open
        stages={[source, destination, basic]}
        readOnly={readOnly}
        transition={{
          id: 'route',
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
export const reviewRouteJson = (value: string) =>
  JSON.stringify({ field: 'review.decision', operator: 'Equals', value });
