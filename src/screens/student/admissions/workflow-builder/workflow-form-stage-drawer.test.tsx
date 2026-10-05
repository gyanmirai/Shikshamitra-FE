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
  it.each([
    {
      type: 1 as const,
      displayName: 'Form',
      configurationJson: JSON.stringify({ formDefinitionId: form.id }),
    },
    { type: 2 as const, displayName: 'Assessment', configurationJson: undefined },
  ])(
    'saves $displayName as the end of journey even with older stage metadata',
    async ({ type, displayName, configurationJson }) => {
      const onSave = vi.fn();
      const user = userEvent.setup();
      renderDocumentUi(
        <AdmissionWorkflowStageDrawer
          open
          stage={{ ...stage, stageType: type, name: displayName, configurationJson }}
          stageTypes={[{ ...metadata, type, displayName, canBeTerminalStage: false }]}
          forms={[form]}
          readOnly={false}
          onClose={vi.fn()}
          onSave={onSave}
        />
      );
      await user.click(screen.getByRole('button', { name: 'Next' }));
      if (type === 2) {
        await user.click(screen.getByRole('button', { name: 'Journey position (advanced)' }));
      }
      const ending = screen.getByRole('switch', {
        name: type === 1 ? 'End of journey' : 'Admission journey ends here',
      });
      expect(ending).toBeEnabled();
      await user.click(ending);
      await user.click(screen.getByRole('button', { name: 'Save stage' }));
      await waitFor(() =>
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({ stageType: type, isTerminalStage: true })
        )
      );
    }
  );

  it('keeps two steps and matching cards when switching stage types', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderDocumentUi(
      <AdmissionWorkflowStageDrawer
        open
        stage={stage}
        stageTypes={[
          metadata,
          {
            ...metadata,
            type: 2,
            displayName: 'Assessment',
            supportedConfiguration: ['assessment'],
            supportsFormAttachment: false,
          },
        ]}
        forms={[form]}
        readOnly={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );
    const expectStageLayout = () => {
      expect(screen.getByRole('button', { name: 'Step 1: Basics' })).toHaveAttribute(
        'aria-current',
        'step'
      );
      expect(screen.getByRole('button', { name: 'Step 2: Settings' })).toBeDisabled();
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Basics' }).closest('section')).toHaveStyle({
        borderRadius: 'calc(2 * var(--shape-borderRadius))',
      });
    };
    expectStageLayout();
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Assessment' }));
    expectStageLayout();
    await user.click(screen.getByRole('combobox', { name: 'Stage type *' }));
    await user.click(screen.getByRole('option', { name: 'Form' }));
    expectStageLayout();
    expect(screen.getByRole('textbox', { name: 'Stage code *' })).toHaveValue(stage.code);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('uses compact right-aligned actions and preserves one draft through keyboard navigation', async () => {
    const { user, onSave } = setup(
      JSON.stringify({ formDefinitionId: form.id, form: DEFAULT_FORM_STAGE_POLICY })
    );
    await user.clear(screen.getByRole('textbox', { name: 'Stage name *' }));
    await user.type(screen.getByRole('textbox', { name: 'Stage name *' }), 'Updated form');
    const next = screen.getByRole('button', { name: 'Next' });
    expect(
      screen.getByRole('textbox', { name: 'Stage name *' }).closest('form')
    ).not.toHaveAttribute('novalidate');
    expect(next.parentElement?.parentElement).toHaveStyle({ justifyContent: 'space-between' });
    expect(next).toHaveClass('MuiButton-sizeSmall');
    next.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('heading', { name: 'Form process' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step 2: Settings' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.getByRole('heading', { name: 'Stage settings' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toHaveValue('Updated form');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('keeps assessment settings and rejects invalid marks without losing the draft', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.clear(screen.getByRole('spinbutton', { name: 'Passing marks *' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Passing marks *' }), '110');
    expect(screen.getByText('Stage completes when…')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Step 2: Settings' })).toHaveAttribute(
        'aria-current',
        'step'
      )
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.clear(screen.getByRole('spinbutton', { name: 'Passing marks *' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Passing marks *' }), '50');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).assessment.passingMarks).toBe(50);
  });
  it('merges Process into Settings while preserving the saved payload', async () => {
    const configurationJson = JSON.stringify({
      formDefinitionId: form.id,
      form: DEFAULT_FORM_STAGE_POLICY,
    });
    const { user, onSave } = setup(configurationJson);

    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toHaveValue('Form');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Form process' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Managed submission/ })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    await user.click(screen.getByRole('switch', { name: 'Show Save draft' }));

    expect(screen.getByRole('heading', { name: 'Stage settings' })).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'Required stage' }));
    await user.click(screen.getByRole('switch', { name: 'Allow authorized skip' }));
    await user.click(screen.getByRole('button', { name: /Save stage/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const saved = onSave.mock.calls[0][0] as AdmissionWorkflowStage;
    expect(saved).toMatchObject({ isRequired: false, allowManualSkip: true });
    expect(JSON.parse(saved.configurationJson ?? '{}').form.allowSaveAndResume).toBe(false);
  });

  it('blocks Next and marks the published-form error in Basics', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(await screen.findByText('Select a published form version.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step 1: Basics' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.getByRole('button', { name: 'Step 2: Settings' })).toBeDisabled();
  });

  it('blocks invalid Basics and preserves its error feedback', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }));
    await user.clear(screen.getByRole('textbox', { name: 'Stage name *' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Stage name is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step 1: Basics' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it('protects unsaved changes when cancelling the wizard', async () => {
    const { user, onSave } = setup(JSON.stringify({ formDefinitionId: form.id }));
    await user.type(screen.getByRole('textbox', { name: 'Stage name *' }), ' changed');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      await screen.findByRole('heading', { name: 'Discard stage changes?', level: 6 })
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('allows read-only navigation without validating or saving the record', async () => {
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
    const user = userEvent.setup();
    expect(screen.getByRole('textbox', { name: 'Stage name *' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('switch', { name: 'Required stage' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save stage' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
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

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('checkbox', { name: 'Applicant details' });
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText('Choose at least one section that staff must verify.')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('combobox', { name: 'Published form version *' })).not.toHaveAttribute(
      'aria-invalid',
      'true'
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await user.click(screen.getByRole('checkbox', { name: 'Applicant details' }));
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
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
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Applicant details' }));
    await user.click(screen.getByRole('button', { name: 'Save stage' }));

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

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText(/Unable to load this form's sections/)).toBeInTheDocument();
    expect(
      screen.queryByText('Choose at least one section that staff must verify.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save stage' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('checkbox', { name: 'Applicant details' })).toBeInTheDocument();
  });
});
