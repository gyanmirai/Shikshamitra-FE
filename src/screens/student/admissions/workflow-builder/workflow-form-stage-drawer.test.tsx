import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';

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
  description: 'Saved staff instructions',
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

function setup(
  configurationJson?: string,
  stageChanges: Partial<AdmissionWorkflowStage> = {},
  stages: AdmissionWorkflowStage[] = []
) {
  const onSave = vi.fn();
  const editorStage = {
    ...stage,
    ...stageChanges,
    ...(configurationJson === undefined ? {} : { configurationJson }),
  };
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={editorStage}
      stageTypes={[metadata]}
      forms={[form]}
      stages={stages}
      readOnly={false}
      onClose={vi.fn()}
      onSave={onSave}
    />
  );
  return { onSave, user: userEvent.setup() };
}

describe('single-page stage drawer', { timeout: 15000 }, () => {
  it.each([1, 2, 4, 5, 7] as const)('omits next-step settings for stage type %s', (type) => {
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={{ ...stage, stageType: type }}
        stageTypes={[
          {
            ...metadata,
            type,
            supportsFormAttachment: type === 1,
            supportedConfiguration:
              type === 1
                ? ['form']
                : type === 2
                  ? ['assessment']
                  : type === 5
                    ? ['documentVerification']
                    : [],
          },
        ]}
        forms={[form]}
        stages={[{ ...stage, stageType: type }]}
        readOnly={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: 'Stage details' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Next step' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choose next step' })).not.toBeInTheDocument();
  });
  it('shows Form details, completion and advanced controls together without the stepper or removed fields', async () => {
    const { user, onSave } = setup(
      JSON.stringify({
        formDefinitionId: form.id,
        form: {
          ...DEFAULT_FORM_STAGE_POLICY,
          maxSubmissionAttempts: 5,
          allowSaveAndResume: false,
          responsibility: 'staff',
          dueInDays: 7,
          allowLateSubmission: true,
        },
        extension: 'keep',
      })
    );
    ['Stage details', 'Form completion', 'Stage behavior', 'Advanced submission settings'].forEach(
      (name) => expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    );
    expect(screen.queryByRole('heading', { name: 'Next step' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choose next step' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Advanced settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Completed by' })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: 'Due after in days' })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: 'Submission limit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Show Save draft' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: 'Move to the next stage automatically' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply changes' })).toHaveClass(
      'MuiButton-sizeSmall'
    );
    expect(screen.getByRole('button', { name: 'Back' }).parentElement).toHaveStyle({
      justifyContent: 'flex-end',
    });
    await user.click(screen.getByRole('switch', { name: 'Allow corrections' }));
    await user.click(screen.getByRole('switch', { name: 'End of journey' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const saved = onSave.mock.calls[0][0];
    expect(saved).toMatchObject({
      isTerminalStage: true,
      code: stage.code,
      description: stage.description,
    });
    expect(JSON.parse(saved.configurationJson)).toMatchObject({
      extension: 'keep',
      form: {
        enabled: true,
        allowSaveAndResume: true,
        maxSubmissionAttempts: 5,
        responsibility: 'staff',
        dueInDays: 7,
        allowLateSubmission: true,
        allowCorrectionRequests: !DEFAULT_FORM_STAGE_POLICY.allowCorrectionRequests,
      },
    });
  });
  it('collapses Form completion without changing submission settings and keeps common controls visible', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }));
    const completion = screen.getByRole('button', { name: 'Submission and verification' });
    expect(completion).toHaveAttribute('aria-expanded', 'true');
    await user.click(completion);
    expect(completion).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Required stage')).toBeVisible();
    expect(screen.getByText('Entry stage')).toBeVisible();
    expect(
      screen.getByText('End of journey', { selector: '.MuiFormControlLabel-label' })
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).form).toMatchObject(
      DEFAULT_FORM_STAGE_POLICY
    );
  });
  it('keeps completion validation visible when staff attempt to collapse an invalid section', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }));
    const completion = screen.getByRole('button', { name: 'Submission and verification' });
    await user.click(
      screen.getByRole('switch', {
        name: 'Require staff verification before completing this stage',
      })
    );
    await user.click(completion);
    expect(completion).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Choose at least one section that staff must verify.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onSave).not.toHaveBeenCalled();
  });
  it('hides Entry stage on other stages when a starting stage is already selected', () => {
    setup(JSON.stringify({ formDefinitionId: form.id }), { isEntryStage: false }, [
      stage,
      { ...stage, id: 'other-entry', code: 'OTHER_ENTRY' },
    ]);
    expect(screen.queryByRole('switch', { name: 'Entry stage' })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'End of journey' })).toBeInTheDocument();
  });
  it('keeps the current Entry stage toggle available so staff can change the starting stage', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }), {}, [stage]);
    expect(screen.getByRole('switch', { name: 'Entry stage' })).toBeChecked();
    await user.click(screen.getByRole('switch', { name: 'Entry stage' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].isEntryStage).toBe(false);
  });
  it('blocks an unattached form and exposes the published-form validation', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(await screen.findByText('Select a published form version.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('preserves field validation and entered values when applying invalid stage details', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }));
    await user.clear(screen.getByRole('textbox', { name: 'Stage name *' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(await screen.findByText('Stage name is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('explains invalid saved internal references without exposing a code input', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }), { code: '' });
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(await screen.findByText(/This stage has invalid saved details/)).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Stage code *' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toHaveValue(stage.name);
    expect(onSave).not.toHaveBeenCalled();
  });
  it('protects unsaved changes when Back closes the editor', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }));
    await user.type(screen.getByRole('textbox', { name: 'Stage name *' }), ' changed');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      await screen.findByRole('heading', { name: 'Discard stage changes?', level: 2 })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toHaveValue('Form changed');
    expect(onSave).not.toHaveBeenCalled();
  });
  it('allows read-only closing without validating or saving', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={stage}
        stageTypes={[metadata]}
        forms={[form]}
        readOnly
        onClose={onClose}
        onSave={onSave}
      />
    );
    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Required stage' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('loads sections for a selected published form from its detail endpoint', async () => {
    mswServer.use(
      http.get('*/student/enrollment/admissions/forms/form-1', () =>
        HttpResponse.json({ data: form })
      )
    );
    const onSave = vi.fn();
    const configurationJson = JSON.stringify({
      formDefinitionId: form.id,
      form: {
        ...DEFAULT_FORM_STAGE_POLICY,
        requireSectionVerification: true,
        autoAdvanceOnSubmit: false,
      },
    });
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={{ ...stage, configurationJson }}
        stageTypes={[metadata]}
        forms={[{ ...form, sections: [] }]}
        readOnly={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );
    const user = userEvent.setup();

    await screen.findByRole('checkbox', { name: 'Applicant details' });
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText('Choose at least one section that staff must verify.')
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Published form version *' })).not.toHaveAttribute(
      'aria-invalid',
      'true'
    );

    await user.click(screen.getByRole('checkbox', { name: 'Applicant details' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).form.verificationSectionCodes
    ).toEqual(['APPLICANT']);
  });

  it('loads sections when a published form is attached after opening the stage', async () => {
    mswServer.use(
      http.get('*/student/enrollment/admissions/forms/form-1', () =>
        HttpResponse.json({ data: form })
      )
    );
    const onSave = vi.fn();
    const configurationJson = JSON.stringify({
      form: {
        ...DEFAULT_FORM_STAGE_POLICY,
        requireSectionVerification: true,
        autoAdvanceOnSubmit: false,
      },
    });
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={{ ...stage, configurationJson }}
        stageTypes={[metadata]}
        forms={[{ ...form, sections: [] }]}
        readOnly={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox', { name: 'Published form version *' }));
    await user.click(screen.getByRole('option', { name: 'Application form · v2' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Applicant details' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toMatchObject({
      formDefinitionId: form.id,
      form: { verificationSectionCodes: ['APPLICANT'] },
    });
  });

  it('shows a retry path when the selected form sections cannot be loaded', async () => {
    let attempts = 0;
    mswServer.use(
      http.get('*/student/enrollment/admissions/forms/form-1', () => {
        attempts += 1;
        return attempts === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({ data: form });
      })
    );
    const configurationJson = JSON.stringify({
      formDefinitionId: form.id,
      form: { ...DEFAULT_FORM_STAGE_POLICY, requireSectionVerification: true },
    });
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={{ ...stage, configurationJson }}
        stageTypes={[metadata]}
        forms={[{ ...form, sections: [] }]}
        readOnly={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    const user = userEvent.setup();

    expect(await screen.findByText(/Unable to load this form's sections/)).toBeInTheDocument();
    expect(
      screen.queryByText('Choose at least one section that staff must verify.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('checkbox', { name: 'Applicant details' })).toBeInTheDocument();
  });
});
