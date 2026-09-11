import { vi, it, expect } from 'vitest';
import { addIcon } from '@iconify/react';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

['mdi:close', 'mdi:account-question-outline', 'basil:cross-solid'].forEach((name) =>
  addIcon(name, {
    body: '<path d="M0 0h16v16H0z"/>',
    width: 16,
    height: 16,
  })
);
const stage: AdmissionWorkflowStage = {
  id: 'inquiry',
  code: 'INQUIRY',
  name: 'Inquiry',
  stageType: 0,
  displayOrder: 0,
  isRequired: false,
  allowManualSkip: true,
  isEntryStage: false,
  isTerminalStage: false,
  configurationJson: JSON.stringify({ layout: 'compact' }),
};
const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 0,
  displayName: 'Inquiry',
  description: 'Manage prospective families',
  icon: 'mdi:account-question-outline',
  defaultColor: '',
  supportedConfiguration: ['inquiry'],
  runtimeHandler: 'Inquiry',
  nextRequiredAction: 'Manage inquiry',
  canBeEntryStage: true,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};

it(
  'enables a managed Inquiry with ownership and safe stage behavior',
  { timeout: 30000 },
  async () => {
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/inquiry-settings/counsellors', () =>
        HttpResponse.json({
          data: [
            { id: '11111111-1111-4111-8111-111111111111', name: 'Asha Shah', userName: 'asha' },
          ],
        })
      )
    );
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={stage}
        forms={[]}
        stages={[stage]}
        stageTypes={[metadata]}
        readOnly={false}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );
    await user.click(
      screen.getByRole('radio', { name: 'Managed inquiry, follow-up and qualification' })
    );
    await user.click(screen.getByRole('combobox', { name: 'Assignment method' }));
    await user.click(screen.getByRole('option', { name: 'Round robin across a team' }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Counsellor team *' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );
    await user.click(screen.getByRole('combobox', { name: 'Counsellor team *' }));
    await user.click(await screen.findByRole('option', { name: 'Asha Shah (asha)' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      isRequired: true,
      isEntryStage: true,
      allowManualSkip: false,
    });
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toMatchObject({
      layout: 'compact',
      inquiry: {
        enabled: true,
        assignmentMode: 1,
        counsellorPoolUserIds: ['11111111-1111-4111-8111-111111111111'],
      },
    });
  }
);
