import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkflowSidePanel } from './components/workflow-side-panel';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
const workflow = {
  id: 'workflow',
  name: 'Admission journey',
  status: 1,
  version: 1,
} as AdmissionWorkflow;
it('names the read-only usage panel, retains metrics/help and closes through the stationary footer', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  renderDocumentUi(
    <WorkflowSidePanel
      panel="usage"
      workflow={workflow}
      stages={[]}
      transitions={[]}
      usage={{
        workflowDefinitionId: 'workflow',
        offeringCount: 3,
        applicationCount: 2,
        canDelete: false,
        offerings: [],
      }}
      usageLoading={false}
      canCreateVersion={false}
      governanceLoading={false}
      onClose={onClose}
    />
  );
  expect(screen.getByRole('dialog', { name: 'Workflow Usage' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Workflow Usage', level: 2 })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Workflow Usage information' })).toBeVisible();
  expect(screen.getByText('3')).toBeVisible();
  expect(screen.getByText('2')).toBeVisible();
  const close = screen.getByRole('button', { name: 'Close' });
  expect(close).toBeVisible();
  await user.click(close);
  expect(onClose).toHaveBeenCalledOnce();
});
it('keeps simulation controls outside the read-only footer treatment', () => {
  renderDocumentUi(
    <WorkflowSidePanel
      panel="simulation"
      workflow={workflow}
      stages={[]}
      transitions={[]}
      usageLoading={false}
      canCreateVersion={false}
      governanceLoading={false}
      onClose={vi.fn()}
    />
  );
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
});
