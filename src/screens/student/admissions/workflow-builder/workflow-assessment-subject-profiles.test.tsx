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
  it('shows one field error after blur and never toasts local validation', async () => {
    const { user } = setup(subjectPolicy);
    await screen.findByRole('textbox', { name: 'Maximum marks — English' });
    await user.click(screen.getByRole('button', { name: 'Add Custom Subject' }));
    const name = screen.getByRole('textbox', { name: /Custom Subject Name/ });
    const maximum = screen.getByRole('textbox', { name: 'Maximum marks — subject 2' });
    expect(name).not.toHaveAttribute('aria-invalid', 'true');
    expect(maximum).not.toHaveAttribute('aria-invalid', 'true');
    await user.click(name);
    await user.tab();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(maximum).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByText('Enter a subject name (1–128 characters).')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(maximum).toHaveAttribute('aria-invalid', 'true'));
    expect(screen.getAllByText('Enter a subject name (1–128 characters).')).toHaveLength(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('keeps a new row neutral after a failed attempt until blur or the next submission', async () => {
    const { user } = setup(subjectPolicy);
    await screen.findByRole('textbox', { name: 'Maximum marks — English' });
    await user.click(screen.getByRole('button', { name: 'Add Custom Subject' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /Custom Subject Name/ })).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    );
    await user.click(screen.getByRole('button', { name: 'Add Custom Subject' }));
    const names = screen.getAllByRole('textbox', { name: /Custom Subject Name/ });
    expect(names[1]).not.toHaveAttribute('aria-invalid', 'true');
    const maximum = screen.getByRole('textbox', { name: 'Maximum marks — subject 3' });
    expect(maximum).not.toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(names[1]).toHaveAttribute('aria-invalid', 'true'));
    expect(maximum).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not transfer touched errors when a preceding subject is removed', async () => {
    const { user } = setup(subjectPolicy);
    await screen.findByRole('textbox', { name: 'Maximum marks — English' });
    await user.click(screen.getByRole('button', { name: 'Add Custom Subject' }));
    await user.click(screen.getByRole('button', { name: 'Add Custom Subject' }));
    const names = screen.getAllByRole('textbox', { name: /Custom Subject Name/ });
    await user.click(names[0]);
    await user.tab();
    expect(names[0]).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'Remove subject 2' }));
    expect(screen.getByRole('textbox', { name: /Custom Subject Name/ })).not.toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('retains a neutral disabled passing draft until a positive decimal total exists', async () => {
    const { user, onSave } = setup({
      ...subjectPolicy,
      classProfiles: [{ ...configuredProfile, passingMarks: 40, subjects: [] }],
    });
    await screen.findByRole('combobox', { name: /Pass Rule/ });
    await user.click(screen.getByRole('button', { name: 'Add Custom Subject' }));
    const passing = screen.getByRole('textbox', { name: 'Overall Passing Marks' });
    expect(passing).toBeDisabled();
    expect(passing).toHaveValue('40');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(screen.queryByText('Enter 0 to 0.')).not.toBeInTheDocument();
    expect(passing).not.toHaveAttribute('aria-invalid', 'true');
    await user.type(screen.getByRole('textbox', { name: /Custom Subject Name/ }), 'Reasoning');
    const maximum = screen.getByRole('textbox', { name: 'Maximum marks — Reasoning' });
    await user.clear(maximum);
    await user.type(maximum, '0.5');
    expect(passing).toBeEnabled();
    expect(passing).toHaveValue('40');
    await user.clear(passing);
    await user.type(passing, '0.25');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(savedPolicy(onSave).classProfiles![0]).toMatchObject({
      passingMarks: 0.25,
      subjects: [{ totalMarks: 0.5 }],
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('retains existing row validation when profiles collapse or scoring controls remount', async () => {
    const { user } = setup({
      ...subjectPolicy,
      classProfiles: [
        { ...configuredProfile, subjects: [{ code: 'custom-1', name: '', totalMarks: 0 }] },
      ],
    });
    await screen.findByRole('textbox', { name: /Custom Subject Name/ });
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /Custom Subject Name/ })).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    );
    const summary = screen.getByRole('button', { name: /Class 5 1 Subjects/ });
    await user.click(summary);
    await user.click(summary);
    expect(screen.getByRole('textbox', { name: /Custom Subject Name/ })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    await user.click(screen.getByRole('combobox', { name: /Scoring Method/ }));
    await user.click(screen.getByRole('option', { name: 'Total Marks' }));
    await user.click(screen.getByRole('combobox', { name: /Scoring Method/ }));
    await user.click(screen.getByRole('option', { name: 'Subject-Wise Marks' }));
    expect(screen.getByRole('textbox', { name: /Custom Subject Name/ })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('textbox', { name: 'Maximum marks — subject 1' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('localizes loaded name and maximum bounds without duplicate section errors', async () => {
    const { user, onSave } = setup({
      ...subjectPolicy,
      classProfiles: [
        {
          ...configuredProfile,
          subjects: [{ code: 'custom-1', name: 'n'.repeat(129), totalMarks: 10001 }],
        },
      ],
    });
    await screen.findByRole('textbox', { name: /Custom Subject Name/ });
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /Custom Subject Name/ })).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    );
    expect(screen.getAllByText('Enter a subject name (1–128 characters).')).toHaveLength(1);
    expect(
      screen.getAllByText('Enter maximum marks greater than 0 and no more than 10,000.')
    ).toHaveLength(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each(['', '   '])('localizes a malformed saved class identity %j', async (standardId) => {
    const { user, onSave } = setup({
      ...subjectPolicy,
      classProfiles: [{ ...configuredProfile, standardIds: [standardId] }],
    });
    await screen.findByRole('combobox', { name: /Applies to Classes/ });
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(await screen.findAllByText('Choose at least one class.')).toHaveLength(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
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
    expect(screen.getByLabelText('Loading Assessment Classes and Subjects')).toBeVisible();
    expect(
      screen.queryByText(/Unavailable Board|Unavailable Medium|Unavailable Class/)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /^Board/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Class Profile' })).toBeDisabled();
    await act(async () => resolveCatalog());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add Class Profile' })).toBeEnabled()
    );
    expect(
      screen.queryByLabelText('Loading Assessment Classes and Subjects')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Board/ })).toHaveTextContent('CBSE');
    expect(screen.getByRole('combobox', { name: /^Medium/ })).toHaveTextContent('English');
    expect(screen.getByRole('combobox', { name: /^Applies to Classes/ })).toHaveTextContent(
      'Class 5'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(savedPolicy(onSave).classProfiles).toEqual([configuredProfile]);
  });
  it('keeps scalar mode default without fetching the subject catalog', async () => {
    const { user, onSave, request } = setup();
    expect(screen.getByRole('textbox', { name: 'Total Marks *' })).toBeVisible();
    expect(screen.queryByText('Class Assessment Profiles')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(savedPolicy(onSave)).toEqual(DEFAULT_ASSESSMENT_POLICY);
    expect(request).not.toHaveBeenCalled();
  });

  it('opts in, configures multiple classes and school/custom subjects, and derives total before saving', async () => {
    const { user, onSave, request } = setup();
    await user.click(screen.getByRole('combobox', { name: /Scoring Method/ }));
    await user.click(screen.getByRole('option', { name: 'Subject-Wise Marks' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add Class Profile' })).toBeEnabled()
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add Class Profile' }));
    await user.click(screen.getByRole('combobox', { name: /^Board/ }));
    await user.click(screen.getByRole('option', { name: 'CBSE · 2026–2027' }));
    await user.click(screen.getByRole('combobox', { name: /^Medium/ }));
    await user.click(screen.getByRole('option', { name: 'English' }));
    await user.click(screen.getByRole('combobox', { name: /^Applies to Classes/ }));
    await user.click(screen.getByRole('option', { name: 'Class 5' }));
    await user.click(screen.getByRole('option', { name: 'Class 6' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Add School Subject' }));
    await user.click(screen.getByRole('combobox', { name: 'School Subject' }));
    await user.click(screen.getByRole('option', { name: 'English · For selected classes' }));
    const englishMaximum = screen.getByRole('textbox', { name: 'Maximum marks — English' });
    await user.clear(englishMaximum);
    await user.type(englishMaximum, '30');
    await user.click(screen.getByRole('button', { name: 'Add Custom Subject' }));
    await user.type(screen.getByRole('textbox', { name: /Custom Subject Name/ }), 'Reasoning');
    const reasoningMaximum = screen.getByRole('textbox', { name: 'Maximum marks — Reasoning' });
    await user.clear(reasoningMaximum);
    await user.type(reasoningMaximum, '20');
    expect(screen.getByRole('textbox', { name: 'Total Marks' })).toHaveValue('50');
    await user.clear(screen.getByRole('textbox', { name: 'Overall Passing Marks' }));
    await user.type(screen.getByRole('textbox', { name: 'Overall Passing Marks' }), '20');
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
    await screen.findByRole('combobox', { name: /Pass Rule/ });
    await user.click(screen.getByRole('combobox', { name: /Pass Rule/ }));
    await user.click(screen.getByRole('option', { name: 'Every Subject' }));
    expect(
      screen.queryByRole('textbox', { name: 'Overall Passing Marks' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Passing marks — English' })).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    );
    expect(screen.getAllByText('Enter passing marks between zero and 50.')).toHaveLength(1);
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
      expect(screen.getByRole('button', { name: 'Add Class Profile' })).toBeEnabled()
    );
    await user.click(screen.getByRole('button', { name: 'Add Class Profile' }));
    const profile = screen
      .getByRole('button', { name: /Class profile 0 Subjects/ })
      .closest('.MuiAccordion-root')!;
    const editor = within(profile as HTMLElement);
    await user.click(editor.getByRole('combobox', { name: /^Board/ }));
    await user.click(screen.getByRole('option', { name: 'CBSE · 2026–2027' }));
    await user.click(editor.getByRole('combobox', { name: /^Medium/ }));
    await user.click(screen.getByRole('option', { name: 'English' }));
    await user.click(editor.getByRole('combobox', { name: /^Applies to Classes/ }));
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
    expect(screen.getByRole('combobox', { name: /^Board/ })).toHaveTextContent('Saved Board');
    expect(screen.getByRole('combobox', { name: /^Medium/ })).toHaveTextContent('Saved Medium');
    expect(screen.getByRole('combobox', { name: /^Applies to Classes/ })).toHaveTextContent(
      '1 saved class'
    );
    expect(
      screen.queryByText(/Unavailable Board|Unavailable Medium|Unavailable Class/)
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add School Subject' })).toBeDisabled();
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
      screen.queryByText(/No Classes are available in your permitted scope/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Loading Assessment Classes and Subjects')
    ).not.toBeInTheDocument();
    await act(async () => resolveCatalog());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add School Subject' })).toBeEnabled()
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
    expect(screen.getByRole('button', { name: 'Add Class Profile' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Profile' })).toBeDisabled();
  });
});
