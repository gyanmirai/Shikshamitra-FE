import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionAssessmentCatalog } from 'src/redux/student/admissions/admission-assessment-catalog-api';
import type {
  AdmissionAssessmentPolicy,
  AdmissionAssessmentClassProfile,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { useFormik } from 'formik';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, screen, within, waitFor } from '@testing-library/react';
import { admissionAssessmentCatalogApi } from 'src/redux/student/admissions/admission-assessment-catalog-api';
import {
  DEFAULT_ASSESSMENT_POLICY,
  getAssessmentConfigurationError,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { WorkflowAssessmentSettings } from './components/workflow-assessment-settings';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
const toast = vi.hoisted(() => ({ error: vi.fn(), dismiss: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));

const catalog: AdmissionAssessmentCatalog = {
  classes: [
    {
      id: 'class-5',
      name: 'Class 5',
      boardId: 'board-1',
      boardName: 'CBSE',
      mediumId: 'medium-1',
      mediumName: 'English',
      academicYearId: 'year-1',
      academicYearName: '2026–2027',
    },
    {
      id: 'class-6',
      name: 'Class 6',
      boardId: 'board-1',
      boardName: 'CBSE',
      mediumId: 'medium-1',
      mediumName: 'English',
      academicYearId: 'year-1',
      academicYearName: '2026–2027',
    },
  ],
  subjects: [
    { id: 'english', name: 'English', mediumId: 'medium-1', assignedStandardIds: ['class-5'] },
    { id: 'maths', name: 'Mathematics', mediumId: 'medium-1', assignedStandardIds: [] },
  ],
};
const catalogPath = '*/api/student/enrollment/admissions/workflows/assessment-catalog';
const configuredProfile: AdmissionAssessmentClassProfile = {
  id: 'profile-1',
  name: 'Class 5',
  boardId: 'board-1',
  mediumId: 'medium-1',
  standardIds: ['class-5'],
  passRule: 'overall',
  passingMarks: 20,
  subjects: [{ code: 'subject-1', subjectId: 'english', name: 'English', totalMarks: 50 }],
};
const subjectPolicy: AdmissionAssessmentPolicy = {
  ...DEFAULT_ASSESSMENT_POLICY,
  version: 2,
  scoringMode: 'subjects',
  classProfiles: [configuredProfile],
};
function Harness({
  policy,
  onSave,
  readOnly = false,
}: {
  policy: AdmissionAssessmentPolicy;
  onSave: (values: AdmissionWorkflowStage) => void;
  readOnly?: boolean;
}) {
  const formik = useFormik<AdmissionWorkflowStage>({
    initialValues: {
      id: 'stage-1',
      code: 'ASSESSMENT',
      name: 'Entrance assessment',
      stageType: 2,
      displayOrder: 1,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: true,
      isTerminalStage: false,
      configurationJson: JSON.stringify({ assessment: policy, extension: 'preserve' }),
    },
    validate: (values) => {
      const error = getAssessmentConfigurationError(values.configurationJson);
      return error ? { configurationJson: error } : {};
    },
    onSubmit: onSave,
  });
  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <WorkflowAssessmentSettings formik={formik} available readOnly={readOnly} />
      {!readOnly && <button type="submit">Apply changes</button>}
    </form>
  );
}
function setup(policy = DEFAULT_ASSESSMENT_POLICY, readOnly = false, catalogError = false) {
  const onSave = vi.fn();
  const request = vi.fn();
  mswServer.use(
    http.get(catalogPath, () => {
      request();
      return catalogError
        ? HttpResponse.json({ error: { message: 'Catalog unavailable' } }, { status: 503 })
        : HttpResponse.json({ data: catalog });
    })
  );
  const store = renderDocumentUi(<Harness policy={policy} onSave={onSave} readOnly={readOnly} />);
  return { onSave, request, store, user: userEvent.setup() };
}
const savedPolicy = (onSave: ReturnType<typeof vi.fn>) =>
  JSON.parse(onSave.mock.calls.at(-1)![0].configurationJson)
    .assessment as AdmissionAssessmentPolicy;

describe('class subject assessment configuration', { timeout: 20000 }, () => {
  it('waits for the first catalog response before labeling saved profile selections', async () => {
    let resolveCatalog!: () => void;
    const responseGate = new Promise<void>((resolve) => {
      resolveCatalog = resolve;
    });
    const request = vi.fn();
    mswServer.use(
      http.get(catalogPath, async () => {
        request();
        await responseGate;
        return HttpResponse.json({ data: catalog });
      })
    );
    const onSave = vi.fn();
    renderDocumentUi(<Harness policy={subjectPolicy} onSave={onSave} />);
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
    expect(screen.getByLabelText('Loading assessment classes and subjects')).toBeVisible();
    expect(
      screen.queryByText(/Unavailable board|Unavailable medium|Unavailable class/)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /^Board/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add class profile' })).toBeDisabled();
    await act(async () => resolveCatalog());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add class profile' })).toBeEnabled()
    );
    expect(
      screen.queryByLabelText('Loading assessment classes and subjects')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Board/ })).toHaveTextContent('CBSE');
    expect(screen.getByRole('combobox', { name: /^Medium/ })).toHaveTextContent('English');
    expect(screen.getByRole('combobox', { name: /^Applies to classes/ })).toHaveTextContent(
      'Class 5'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(savedPolicy(onSave).classProfiles).toEqual([configuredProfile]);
  });
  it('keeps scalar mode default without fetching the subject catalog', async () => {
    const { user, onSave, request } = setup();
    expect(screen.getByRole('spinbutton', { name: 'Total marks *' })).toBeVisible();
    expect(screen.queryByText('Class assessment profiles')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(savedPolicy(onSave)).toEqual(DEFAULT_ASSESSMENT_POLICY);
    expect(request).not.toHaveBeenCalled();
  });

  it('opts in, configures multiple classes and school/custom subjects, and derives total before saving', async () => {
    const { user, onSave, request } = setup();
    await user.click(screen.getByRole('combobox', { name: /Scoring method/ }));
    await user.click(screen.getByRole('option', { name: 'Subject-wise marks' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add class profile' })).toBeEnabled()
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add class profile' }));
    await user.click(screen.getByRole('combobox', { name: /^Board/ }));
    await user.click(screen.getByRole('option', { name: 'CBSE · 2026–2027' }));
    await user.click(screen.getByRole('combobox', { name: /^Medium/ }));
    await user.click(screen.getByRole('option', { name: 'English' }));
    await user.click(screen.getByRole('combobox', { name: /^Applies to classes/ }));
    await user.click(screen.getByRole('option', { name: 'Class 5' }));
    await user.click(screen.getByRole('option', { name: 'Class 6' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Add school subject' }));
    await user.click(screen.getByRole('combobox', { name: 'School subject' }));
    await user.click(screen.getByRole('option', { name: 'English · For selected classes' }));
    const englishMaximum = screen.getByRole('textbox', { name: 'Maximum marks — English' });
    await user.clear(englishMaximum);
    await user.type(englishMaximum, '30');
    await user.click(screen.getByRole('button', { name: 'Add custom subject' }));
    await user.type(screen.getByRole('textbox', { name: /Custom subject name/ }), 'Reasoning');
    const reasoningMaximum = screen.getByRole('textbox', { name: 'Maximum marks — Reasoning' });
    await user.clear(reasoningMaximum);
    await user.type(reasoningMaximum, '20');
    expect(screen.getByRole('textbox', { name: 'Total marks' })).toHaveValue('50');
    await user.clear(screen.getByRole('textbox', { name: 'Overall passing marks' }));
    await user.type(screen.getByRole('textbox', { name: 'Overall passing marks' }), '20');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(savedPolicy(onSave)).toMatchObject({
      version: 2,
      scoringMode: 'subjects',
      classProfiles: [
        {
          standardIds: ['class-5', 'class-6'],
          name: 'Class 5, Class 6',
          passRule: 'overall',
          passingMarks: 20,
          subjects: [
            { subjectId: 'english', name: 'English', totalMarks: 30 },
            { subjectId: null, name: 'Reasoning', totalMarks: 20 },
          ],
        },
      ],
    });
    const { subjects } = savedPolicy(onSave).classProfiles![0];
    expect(subjects[0].code).not.toBe(subjects[1].code);
    expect(subjects[0].code).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).extension).toBe('preserve');
    expect(request).toHaveBeenCalledOnce();
  });

  it('requires every subject threshold for per-subject rules and retains the same subject identity', async () => {
    const { user, onSave } = setup(subjectPolicy);
    await screen.findByRole('combobox', { name: /Pass rule/ });
    await user.click(screen.getByRole('combobox', { name: /Pass rule/ }));
    await user.click(screen.getByRole('option', { name: 'Every subject' }));
    expect(
      screen.queryByRole('textbox', { name: 'Overall passing marks' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await screen.findAllByText(
      'Enter passing marks between zero and the maximum for every subject.'
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox', { name: 'Passing marks — English' }), '20');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(savedPolicy(onSave).classProfiles![0]).toMatchObject({
      passRule: 'everySubject',
      passingMarks: 0,
      subjects: [{ code: 'subject-1', passingMarks: 20 }],
    });
  });

  it('blocks duplicate classes in another profile', async () => {
    const { user } = setup(subjectPolicy);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add class profile' })).toBeEnabled()
    );
    await user.click(screen.getByRole('button', { name: 'Add class profile' }));
    const profile = screen
      .getByRole('button', { name: /Class profile 0 subjects/ })
      .closest('.MuiAccordion-root')!;
    const editor = within(profile as HTMLElement);
    await user.click(editor.getByRole('combobox', { name: /^Board/ }));
    await user.click(screen.getByRole('option', { name: 'CBSE · 2026–2027' }));
    await user.click(editor.getByRole('combobox', { name: /^Medium/ }));
    await user.click(screen.getByRole('option', { name: 'English' }));
    await user.click(editor.getByRole('combobox', { name: /^Applies to classes/ }));
    expect(screen.getByRole('option', { name: /Class 5/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('option', { name: 'Class 6' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('announces catalog errors and preserves configured values through a catalog refresh', async () => {
    const { user, store, request } = setup(subjectPolicy, false, true);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Assessment classes and subjects could not load. Your configuration is retained.',
        })
      )
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Maximum marks — English' })).toHaveValue('50');
    expect(screen.getByRole('combobox', { name: /^Board/ })).toHaveTextContent('Saved board');
    expect(screen.getByRole('combobox', { name: /^Medium/ })).toHaveTextContent('Saved medium');
    expect(screen.getByRole('combobox', { name: /^Applies to classes/ })).toHaveTextContent(
      '1 saved class'
    );
    expect(
      screen.queryByText(/Unavailable board|Unavailable medium|Unavailable class/)
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add school subject' })).toBeDisabled();
    await user.clear(screen.getByRole('textbox', { name: 'Maximum marks — English' }));
    await user.type(screen.getByRole('textbox', { name: 'Maximum marks — English' }), '45');
    let resolveCatalog!: () => void;
    const responseGate = new Promise<void>((resolve) => {
      resolveCatalog = resolve;
    });
    mswServer.use(
      http.get(catalogPath, async () => {
        await responseGate;
        return HttpResponse.json(catalog);
      })
    );
    // The shared toast intentionally omits page Retry actions. A subscribed query can
    // still refresh independently; preserve the draft during that request.
    act(() => {
      store.dispatch(
        admissionAssessmentCatalogApi.endpoints.getAdmissionAssessmentCatalog.initiate(undefined, {
          forceRefetch: true,
          subscribe: false,
        })
      );
    });
    expect(screen.getByRole('textbox', { name: 'Maximum marks — English' })).toHaveValue('45');
    expect(
      screen.queryByText(/No classes are available in your permitted scope/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Loading assessment classes and subjects')
    ).not.toBeInTheDocument();
    await act(async () => resolveCatalog());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add school subject' })).toBeEnabled()
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Maximum marks — English' })).toHaveValue('45');
    expect(screen.getByRole('combobox', { name: /^Board/ })).toHaveTextContent('CBSE');
  });

  it('keeps published settings read-only', async () => {
    const { request } = setup(subjectPolicy, true);
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
    await screen.findByRole('textbox', { name: 'Maximum marks — English' });
    screen.getAllByRole('textbox').forEach((input) => expect(input).toBeDisabled());
    screen
      .getAllByRole('combobox')
      .forEach((input) => expect(input).toHaveAttribute('aria-disabled', 'true'));
    expect(screen.getByRole('button', { name: 'Add class profile' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove profile' })).toBeDisabled();
  });
});
