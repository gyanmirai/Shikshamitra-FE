import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 1,
  displayName: 'Form',
  description: 'Collect application details',
  icon: 'mdi:file-document-outline',
  defaultColor: '#1976d2',
  supportedConfiguration: ['form'],
  runtimeHandler: 'Form',
  nextRequiredAction: 'Submit form',
  canBeEntryStage: true,
  canBeTerminalStage: true,
  supportsFormAttachment: true,
  supportsConditions: true,
  isRuntimeReady: true,
};

const stage: AdmissionWorkflowStage = {
  id: 'stage-form',
  code: 'STAGE_1',
  name: 'Form',
  stageType: 1,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
};

const form: AdmissionForm = {
  id: 'form-1',
  name: 'Application form',
  code: 'APPLICATION',
  version: 2,
  status: 1,
  layoutType: 0,
  sectionCount: 1,
  sections: [
    {
      id: 'section-1',
      code: 'APPLICANT',
      name: 'Applicant details',
      displayOrder: 0,
      fields: [],
    },
  ],
};

function setup(configurationJson?: string) {
  const onSave = vi.fn();
  const editorStage = configurationJson === undefined ? stage : { ...stage, configurationJson };
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={editorStage}
      stageTypes={[metadata]}
      forms={[form]}
      readOnly={false}
      onClose={vi.fn()}
      onSave={onSave}
    />
  );
  return { onSave, user: userEvent.setup() };
}

describe('Form stage drawer', { timeout: 15000 }, () => {
  it('keeps assessment settings across tabs and opens Process for invalid marks', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const assessment: AdmissionWorkflowStage = {
      ...stage,
      stageType: 2,
      name: 'Readiness assessment',
      isEntryStage: false,
      configurationJson: JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }),
    };
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={assessment}
        forms={[]}
        stageTypes={[
          {
            ...metadata,
            type: 2,
            displayName: 'Assessment',
            supportedConfiguration: ['assessment'],
            supportsFormAttachment: false,
          },
        ]}
        readOnly={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );
    await user.click(screen.getByRole('tab', { name: 'Process' }));
    await user.clear(screen.getByRole('spinbutton', { name: 'Passing marks *' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Passing marks *' }), '110');
    await user.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.getByText('Stage completes when…')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Process' })).toHaveAttribute('aria-selected', 'true')
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.clear(screen.getByRole('spinbutton', { name: 'Passing marks *' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Passing marks *' }), '50');
    await user.click(screen.getByRole('tab', { name: 'Basics' }));
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment.passingMarks).toBe(50);
  });
  it('separates Basics, Process, and Settings while keeping one stage draft', async () => {
    const configurationJson = JSON.stringify({
      formDefinitionId: form.id,
      form: DEFAULT_FORM_STAGE_POLICY,
    });
    const { user, onSave } = setup(configurationJson);

    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toHaveValue('Form');
    await user.click(screen.getByRole('tab', { name: 'Process' }));
    expect(screen.getByRole('heading', { name: 'Form process' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Managed submission/ })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    await user.click(screen.getByRole('switch', { name: 'Show Save draft' }));
    await user.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.getByRole('heading', { name: 'Stage settings' })).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'Required stage' }));
    await user.click(screen.getByRole('switch', { name: 'Allow authorized skip' }));
    await user.click(screen.getByRole('button', { name: /Save stage/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const saved = onSave.mock.calls[0][0] as AdmissionWorkflowStage;
    expect(saved).toMatchObject({ isRequired: false, allowManualSkip: true });
    expect(JSON.parse(saved.configurationJson ?? '{}').form.allowSaveAndResume).toBe(false);
  });

  it('returns to Basics and shows the published-form error on invalid save', async () => {
    const { user, onSave } = setup();

    await user.click(screen.getByRole('tab', { name: 'Process' }));
    expect(
      screen.getByText('Choose a published form in Basics to finish setup.')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Save stage/ }));

    expect(onSave).not.toHaveBeenCalled();
    expect(await screen.findByText('Select a published form version.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Basics' })).toHaveAttribute('aria-selected', 'true');
  });
});
