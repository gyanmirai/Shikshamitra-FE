import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const stage: AdmissionWorkflowStage = {
  id: 'saved-payment',
  code: 'COLLECT_FEES',
  name: 'Collect admission fees',
  description: 'Saved payment instructions',
  stageType: 4,
  displayOrder: 2,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
};
const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 4,
  displayName: 'Payment',
  description: 'Collect fees through the payment workflow',
  icon: 'mdi:cash',
  defaultColor: '',
  supportedConfiguration: [],
  runtimeHandler: 'Payment',
  nextRequiredAction: 'Collect fees',
  canBeEntryStage: false,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};

it('shows actual published Payment stage values with help and one Close action, without disabled form controls', () => {
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={stage}
      stageTypes={[metadata]}
      forms={[]}
      stages={[stage]}
      readOnly
      onClose={vi.fn()}
      onSave={vi.fn()}
    />
  );
  expect(screen.getByRole('dialog', { name: /View Payment/ })).toBeVisible();
  expect(screen.getByText('COLLECT_FEES')).toBeVisible();
  expect(screen.getByText('Saved payment instructions')).toBeVisible();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(1);
});
