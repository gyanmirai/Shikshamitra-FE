import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, expect } from 'vitest';
import { addIcon } from '@iconify/react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

['mdi:close', 'mdi:clipboard-check-outline', 'basil:cross-solid'].forEach((name) =>
  addIcon(name, {
    body: '<path d="M0 0h16v16H0z"/>',
    width: 16,
    height: 16,
  })
);
export const reviewEditorStage: AdmissionWorkflowStage = {
  id: 'review-stage',
  name: 'Admissions review',
  code: 'REVIEW',
  stageType: 6,
  displayOrder: 4,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
};
export const reviewSourceStage: AdmissionWorkflowStage = {
  ...reviewEditorStage,
  id: 'exam',
  name: 'Entrance assessment',
  code: 'EXAM',
  stageType: 2,
  displayOrder: 1,
  configurationJson: JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }),
};
const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 6,
  displayName: 'Review',
  description: 'Review applicant evidence',
  icon: 'mdi:clipboard-check-outline',
  defaultColor: '',
  supportedConfiguration: ['review'],
  runtimeHandler: 'Review',
  nextRequiredAction: 'Review',
  canBeEntryStage: false,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};
export const reviewerId = '11111111-1111-4111-8111-111111111111';
export async function setupReviewEditor(
  configurationJson?: string,
  readOnly = false,
  available = true,
  sources: AdmissionWorkflowStage[] = [reviewSourceStage],
  stageOverrides: Partial<AdmissionWorkflowStage> = {}
) {
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/reviews/reviewer-roles', () =>
      HttpResponse.json({ data: [{ id: 'role', name: 'Admissions lead' }] })
    ),
    http.get('*/api/student/enrollment/admissions/reviews/reviewers', () =>
      HttpResponse.json({ data: [{ id: reviewerId, name: 'Asha Shah', userName: 'asha' }] })
    )
  );
  const onSave = vi.fn();
  const onClose = vi.fn();
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={{ ...reviewEditorStage, configurationJson, ...stageOverrides }}
      forms={[]}
      stages={[...sources, reviewEditorStage]}
      stageTypes={[{ ...metadata, supportedConfiguration: available ? ['review'] : [] }]}
      readOnly={readOnly}
      onSave={onSave}
      onClose={onClose}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('button', { name: readOnly ? 'Close' : 'Apply changes' });
  return { onSave, onClose };
}
export async function chooseReviewOption(
  user: { click: (element: Element) => Promise<unknown> },
  label: string,
  name: string
) {
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: label })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  );
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name }));
  await waitFor(() =>
    expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
  );
}
