import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, expect } from 'vitest';
import { addIcon } from '@iconify/react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

['mdi:close', 'mdi:shield-check-outline', 'basil:cross-solid'].forEach((name) =>
  addIcon(name, {
    body: '<path d="M0 0h16v16H0z"/>',
    width: 16,
    height: 16,
  })
);

export const eligibilityEditorStage: AdmissionWorkflowStage = {
  id: 'eligibility-stage',
  name: 'Eligibility',
  code: 'ELIGIBILITY',
  stageType: 3,
  displayOrder: 3,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
};
const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 3,
  displayName: 'Eligibility',
  description: 'Check eligibility',
  icon: 'mdi:shield-check-outline',
  defaultColor: '',
  supportedConfiguration: ['eligibility'],
  runtimeHandler: 'Eligibility',
  nextRequiredAction: 'Check eligibility',
  canBeEntryStage: false,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};
export const eligibilityForm: AdmissionForm = {
  id: '11111111-1111-1111-1111-111111111111',
  code: 'APPLICATION',
  name: 'Application form',
  version: 1,
  status: 1,
  layoutType: 0,
  sectionCount: 1,
  sections: [],
};
export const eligibilityFormDetail: AdmissionForm = {
  ...eligibilityForm,
  sections: [
    {
      id: 'section',
      code: 'ACADEMIC',
      name: 'Academic history',
      displayOrder: 0,
      fields: [
        {
          id: 'marks',
          code: 'PERCENTAGE',
          label: 'Previous marks',
          fieldType: 2,
          bindingType: 1,
          required: true,
          readOnly: false,
          displayOrder: 0,
        },
        {
          id: 'note',
          code: 'NOTE',
          label: 'Information only',
          fieldType: 12,
          bindingType: 1,
          required: false,
          readOnly: true,
          displayOrder: 1,
        },
      ],
    },
  ],
};
export async function setupEligibilityEditor(
  configurationJson?: string,
  readOnly = false,
  available = true
) {
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/eligibility/reviewer-roles', () =>
      HttpResponse.json([{ id: 'reviewer', name: 'Admissions lead' }])
    ),
    http.get(`*/api/student/enrollment/admissions/forms/${eligibilityForm.id}`, () =>
      HttpResponse.json(eligibilityFormDetail)
    )
  );
  const onSave = vi.fn();
  const onClose = vi.fn();
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={{ ...eligibilityEditorStage, configurationJson }}
      forms={[eligibilityForm]}
      stages={[eligibilityEditorStage]}
      stageTypes={[{ ...metadata, supportedConfiguration: available ? ['eligibility'] : [] }]}
      readOnly={readOnly}
      onSave={onSave}
      onClose={onClose}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('button', { name: readOnly ? 'Close' : 'Apply changes' });
  return { onSave, onClose };
}
export async function chooseEligibilityOption(
  user: { click: (element: Element) => Promise<void> },
  label: string,
  name: string
) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name }));
  await waitFor(() =>
    expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
  );
}
