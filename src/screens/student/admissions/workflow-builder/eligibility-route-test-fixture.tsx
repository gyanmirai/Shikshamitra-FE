import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { vi } from 'vitest';
import { addIcon } from '@iconify/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { DEFAULT_ELIGIBILITY_POLICY } from 'src/redux/student/admissions/admission-eligibility-policy';

import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

['close', 'content-save-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});
const source: AdmissionWorkflowStage = {
  id: 'eligibility-1',
  code: 'ELIGIBILITY',
  name: 'Eligibility check',
  stageType: 3,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
  configurationJson: JSON.stringify({
    eligibility: {
      ...DEFAULT_ELIGIBILITY_POLICY,
      criteria: [
        {
          code: 'MINIMUM_AGE',
          name: 'Minimum age',
          kind: 'age',
          minAgeMonths: 60,
          cutoffDate: '2026-06-01',
        },
      ],
    },
  }),
};
const destination: AdmissionWorkflowStage = {
  ...source,
  id: 'offer-1',
  code: 'OFFER',
  name: 'Offer',
  stageType: 11,
  displayOrder: 1,
  configurationJson: undefined,
};
const otherStage = { ...destination, id: 'review-1', code: 'REVIEW', name: 'Staff review' };
const otherEligibility = {
  ...source,
  id: 'eligibility-2',
  code: 'SECOND_CHECK',
  name: 'Second eligibility check',
};
export function renderEligibilityRoute(conditionRuleJson?: string, readOnly = false) {
  const onSave = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionWorkflowTransitionDrawer
        open
        stages={[source, destination, otherStage, otherEligibility]}
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
export const eligibilityRouteJson = (value: string) =>
  JSON.stringify({ field: 'eligibility.status', operator: 'Equals', value });
export async function chooseEligibilityRouteOption(
  user: { click: (element: Element) => Promise<unknown> },
  label: string,
  name: string
) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(screen.getByRole('option', { name }));
  await waitFor(() => {
    if (screen.queryByRole('listbox', { hidden: true }))
      throw new Error('Wait for the menu to close');
  });
}
