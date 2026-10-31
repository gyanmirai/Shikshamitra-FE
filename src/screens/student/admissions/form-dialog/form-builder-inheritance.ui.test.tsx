import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderSections } from './form-builder-sections';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

const state = vi.hoisted(() => ({
  value: null as unknown,
  selectField: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [], isLoading: false, isError: false }),
  useGetAdmissionFormDataSourcesQuery: () => ({ data: [] }),
}));
vi.mock('./hooks/use-form-inheritance', () => ({ useFormInheritance: () => state.value }));
vi.mock('./form-builder-palette', () => ({ FormBuilderPalette: () => null }));
vi.mock('./components/form-inheritance-panel', () => ({
  FormInheritancePanel: () => null,
  InheritedFieldDrawer: () => null,
  InheritedFieldSettings: () => null,
  InheritedFieldsCanvas: () => null,
}));
vi.mock('./components/form-builder-live-preview', () => ({
  FormBuilderLivePreview: ({ form }: { form: CreateUpdateAdmissionForm }) => (
    <output data-testid="preview-form">{JSON.stringify(form)}</output>
  ),
}));

function renderInheritedBuilder(
  overrides: { loading?: boolean; failed?: boolean; valid?: boolean; sourceLayout?: 0 | 1 } = {}
) {
  const base = getBlankAdmissionFormInitialValues(1);
  base.layoutType = 0;
  base.inheritance = { enabled: true, sources: [] };
  base.fieldsPerRow = 2;
  const sourceField = {
    ...newField('inquiry-section', 0),
    label: 'Source visit date',
    inheritedFrom: {
      inquiryFormDefinitionId: 'inquiry-a',
      sourceFieldCode: 'VISIT',
      fieldIdentity: 'custom:visit',
    },
  };
  const sourceSection = {
    id: 'inquiry-section',
    code: 'INQ_SECTION',
    name: 'Published Inquiry section',
    displayOrder: 0,
    fieldsPerRow: 3 as const,
    ...(overrides.sourceLayout === 1 && {
      stepId: 'source-step',
      stepName: 'Inquiry step',
      stepDisplayOrder: 1,
    }),
    fields: [sourceField],
  };
  function Builder({ formik }: { formik: FormikProps<CreateUpdateAdmissionForm> }) {
    state.value = {
      formik,
      enabled: true,
      approved: false,
      loading: overrides.loading ?? false,
      failed: overrides.failed ?? false,
      sourceFailed: false,
      sourceId: 'inquiry-a',
      selectField: state.selectField,
      preview: {
        isValid: overrides.valid ?? true,
        definition: {
          ...base,
          layoutType: overrides.sourceLayout ?? base.layoutType,
          fieldsPerRow: 1,
          sections: [
            sourceSection,
            ...formik.values.sections.map((section) =>
              overrides.sourceLayout === 1 && formik.values.layoutType === 0
                ? {
                    ...section,
                    stepId: 'registration-page',
                    stepName: 'Registration page',
                    stepDisplayOrder: 0,
                  }
                : section
            ),
          ],
        },
      },
    };
    return (
      <>
        <FormBuilderSections formik={formik} />
        <output data-testid="base-form">{JSON.stringify(formik.values)}</output>
      </>
    );
  }
  state.selectField.mockClear();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={base} onSubmit={() => undefined}>
        {(formik) => <Builder formik={formik} />}
      </Formik>
    </ThemeProvider>
  );
  return { base, sourceField };
}

describe('Registration effective canvas integration', () => {
  it('opens the selected Inquiry step with its own grid while the single-page base remains unchanged', () => {
    renderInheritedBuilder({ sourceLayout: 1 });
    expect(screen.getByRole('button', { name: 'Inquiry step' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Published Inquiry section' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Student Details' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Actions for Registration page step' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    const view = JSON.parse(screen.getByTestId('preview-form').textContent!);
    expect(view.layoutType).toBe(1);
    expect(view.sections[0].fieldsPerRow).toBe(3);
    expect(JSON.parse(screen.getByTestId('base-form').textContent!).layoutType).toBe(0);
  });
  it('offers Add step on a single-page draft and retains its content after converting', async () => {
    const { base } = renderInheritedBuilder();
    expect(screen.queryByRole('navigation', { name: 'Form steps' })).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add step' }));
    });
    const saved = JSON.parse(screen.getByTestId('base-form').textContent!);
    expect(saved.layoutType).toBe(1);
    expect(saved.sections).toHaveLength(base.sections.length + 1);
    expect(saved.sections[0].id).toBe(base.sections[0].id);
    expect(screen.getByRole('navigation', { name: 'Form steps' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add step' })).toBeVisible();
  });
  it('allows a valid source preview before approval and applies current grid changes without copying source questions', async () => {
    const { sourceField } = renderInheritedBuilder();
    expect(screen.getByRole('heading', { name: 'Published Inquiry section' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Grid layout' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: '4 columns' }));
    });
    const preview = screen.getByRole('button', { name: 'Preview' });
    expect(preview).toBeEnabled();
    fireEvent.click(preview);
    const values = JSON.parse(screen.getByTestId('preview-form').textContent!);
    expect(values.fieldsPerRow).toBe(4);
    expect(values.sections[0].fields[0]).toEqual(sourceField);
    const saved = JSON.parse(screen.getByTestId('base-form').textContent!);
    expect(saved.sections).toHaveLength(1);
    expect(saved.sections[0].fields).toEqual([]);
    expect(saved.inheritance.sources).toEqual([]);
  });

  it.each([{ loading: true }, { failed: true }, { valid: false }])(
    'keeps an unresolved source preview disabled for %j',
    (overrides) => {
      renderInheritedBuilder(overrides);
      expect(screen.getByRole('button', { name: 'Preview' })).toBeDisabled();
    }
  );

  it('hides an open preview while its current source recheck is pending and keeps return navigation available', async () => {
    const source = { loading: false };
    renderInheritedBuilder(source);
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.getByTestId('preview-form')).toBeVisible();
    source.loading = true;
    fireEvent.click(screen.getByRole('button', { name: 'Grid layout' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: '3 columns' }));
    });
    expect(screen.queryByTestId('preview-form')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to builder' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back to builder' }));
    expect(screen.getByRole('heading', { name: 'Published Inquiry section' })).toBeVisible();
  });

  it('routes a source question to its locked Inquiry settings', async () => {
    const { sourceField } = renderInheritedBuilder();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Source visit date field' }));
    expect(state.selectField).toHaveBeenCalledWith(sourceField);
    expect(screen.queryByRole('textbox', { name: 'Field label' })).not.toBeInTheDocument();
  });
});
