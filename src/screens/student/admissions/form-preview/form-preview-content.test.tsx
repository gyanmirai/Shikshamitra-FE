import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';

import { FormPreviewContent } from './form-preview-content';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <svg aria-hidden="true" data-icon={icon} />,
}));

vi.mock('../admission-runtime-field', () => ({
  default: ({
    field,
    value,
    onChange,
  }: {
    field: { label: string };
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      aria-label={field.label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

function photoPreviewForm(): AdmissionForm {
  return {
    id: 'photo-preview',
    name: 'Student form',
    code: 'STUDENT',
    version: 1,
    status: 0,
    sectionCount: 1,
    layoutType: 0,
    fieldsPerRow: 3,
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    sections: [
      {
        id: 'profile',
        code: 'PROFILE',
        name: 'Student profile',
        displayOrder: 0,
        fields: [
          {
            id: 'name',
            code: 'NAME',
            label: 'Student name',
            fieldType: 0,
            bindingType: 1,
            bindingKey: 'NAME',
            required: false,
            readOnly: false,
            displayOrder: 0,
          },
          {
            id: 'photo',
            code: 'PHOTO',
            label: 'Student photo',
            fieldType: 0,
            bindingType: 0,
            bindingKey: 'Applicant.ProfilePhoto',
            required: false,
            readOnly: false,
            displayOrder: 1,
            validationJson: '{"format":"photo"}',
          },
        ],
      },
    ],
  } as AdmissionForm;
}

function previewFormik(values: Record<string, string>) {
  return {
    values,
    errors: {},
    touched: {},
    submitForm: vi.fn(),
    handleSubmit: vi.fn(),
    setFieldValue: vi.fn().mockResolvedValue(undefined),
    setFieldTouched: vi.fn().mockResolvedValue(undefined),
  } as unknown as FormikProps<Record<string, string>>;
}

describe('embedded admission form preview', () => {
  it('uses the standard section icon alongside the configured section heading', () => {
    render(
      <FormPreviewContent
        form={photoPreviewForm()}
        formik={previewFormik({})}
        resolvedOptions={{}}
        preview
      />
    );
    const heading = screen.getByRole('heading', { name: 'Student profile' });
    const section = heading.closest('section');
    expect(section?.querySelector('[data-icon="mdi:clipboard-text-outline"]')).toBeInTheDocument();
    expect(within(section!).getByRole('textbox', { name: 'Student name' })).toBeVisible();
  });
  it('places the language selector with the form title and switches the preview language', async () => {
    const user = userEvent.setup();
    const form = photoPreviewForm();
    form.supportedLanguages = ['en', 'hi'];
    form.sections[0].fields[0].translations = { hi: { label: 'विद्यार्थी का नाम' } };
    render(<FormPreviewContent form={form} formik={previewFormik({})} resolvedOptions={{}} />);

    const title = screen.getByRole('heading', { name: 'Student form · v1' });
    const language = within(title.closest('header')!).getByRole('combobox', {
      name: 'Form Language',
    });
    expect(language).toHaveTextContent('English');
    await user.click(language);
    await user.click(screen.getByRole('option', { name: 'Hindi' }));
    expect(screen.getByRole('textbox', { name: 'विद्यार्थी का नाम' })).toBeVisible();
  });

  it('renders a later photo first while preserving answer values and saved field order', async () => {
    const user = userEvent.setup();
    const form = photoPreviewForm();
    const original = structuredClone(form);
    const formik = previewFormik({ NAME: 'Existing student', PHOTO: 'existing-photo' });
    render(<FormPreviewContent form={form} formik={formik} resolvedOptions={{}} embedded />);

    expect(screen.getAllByRole('textbox').map((field) => field.getAttribute('aria-label'))).toEqual(
      ['Student photo', 'Student name']
    );
    expect(screen.getByRole('textbox', { name: 'Student photo' })).toHaveValue('existing-photo');
    expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('Existing student');
    await user.type(screen.getByRole('textbox', { name: 'Student name' }), 'X');
    expect(formik.setFieldValue).toHaveBeenLastCalledWith('NAME', 'Existing studentX');
    expect(form).toEqual(original);
    expect(formik.values).toEqual({ NAME: 'Existing student', PHOTO: 'existing-photo' });
  });

  it('does not reserve a photo rail for a photo hidden by its existing visibility rule', () => {
    const form = photoPreviewForm();
    form.sections[0].fields[1].visibilityRuleJson = JSON.stringify({
      field: 'SHOW_PHOTO',
      operator: 'equals',
      value: 'true',
    });
    render(
      <FormPreviewContent
        form={form}
        formik={previewFormik({ SHOW_PHOTO: 'false' })}
        resolvedOptions={{}}
        embedded
      />
    );
    expect(screen.queryByLabelText('Profile Photos')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Student photo' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Student name' })).toBeVisible();
  });

  it('keeps each repeatable entry photo and writes changes to the corresponding entry', async () => {
    const user = userEvent.setup();
    const form = photoPreviewForm();
    Object.assign(form.sections[0], {
      isRepeatable: true,
      minEntries: 1,
      maxEntries: 3,
      entryLabel: 'Student',
    });
    const values = {
      NAME: '["First student","Second student"]',
      PHOTO: '["first-photo","second-photo"]',
    };
    const formik = previewFormik(values);
    render(<FormPreviewContent form={form} formik={formik} resolvedOptions={{}} embedded />);
    const photos = screen.getAllByRole('textbox', { name: 'Student photo' });
    expect(photos[0]).toHaveValue('first-photo');
    expect(photos[1]).toHaveValue('second-photo');
    expect(screen.getAllByLabelText('Profile Photos')).toHaveLength(2);
    await user.type(photos[1], 'X');
    expect(formik.setFieldValue).toHaveBeenLastCalledWith(
      'PHOTO',
      '["first-photo","second-photoX"]'
    );
    expect(formik.values).toEqual(values);
    expect(form.sections[0].fields.map((field) => field.code)).toEqual(['NAME', 'PHOTO']);
  });

  it('puts preview steps in a dedicated panel and keeps all sections of the selected step visible', async () => {
    const user = userEvent.setup();
    const formik = {
      values: {},
      errors: {},
      touched: {},
      submitForm: vi.fn(),
      handleSubmit: vi.fn(),
    } as unknown as FormikProps<Record<string, string>>;
    const form = {
      id: 'preview',
      name: 'Application',
      version: 1,
      layoutType: 1,
      fieldsPerRow: 2,
      sections: [
        {
          id: 'basic',
          code: 'BASIC',
          name: 'Basic details',
          stepId: 'personal',
          stepName: 'Personal information',
          stepDisplayOrder: 0,
          displayOrder: 0,
          fields: [],
        },
        {
          id: 'contact',
          code: 'CONTACT',
          name: 'Contact details',
          stepId: 'personal',
          stepName: 'Personal information',
          stepDisplayOrder: 0,
          displayOrder: 1,
          fields: [],
        },
        {
          id: 'health',
          code: 'HEALTH',
          name: 'Health details',
          stepId: 'medical',
          stepName: 'Medical information',
          stepDisplayOrder: 1,
          displayOrder: 2,
          fields: [],
        },
      ],
    } as unknown as AdmissionForm;
    render(
      <FormPreviewContent form={form} formik={formik} resolvedOptions={{}} preview fillAvailable />
    );
    const panel = screen.getByRole('complementary', { name: 'Form Step Navigation' });
    const navigation = within(panel).getByRole('navigation', { name: 'Form Steps' });
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.getByText('Contact details')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Health details')).toBeVisible();
    expect(within(navigation).getByRole('button', { name: 'Medical information' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.getByText('Contact details')).toBeVisible();
  });

  it('shows only the preview without validation actions or a nested form', () => {
    const submitForm = vi.fn().mockResolvedValue(undefined);
    const formik = {
      values: {},
      errors: {},
      touched: {},
      submitForm,
      handleSubmit: vi.fn(),
    } as unknown as FormikProps<Record<string, string>>;
    const form = {
      id: 'preview',
      name: 'Application',
      code: 'APPLICATION',
      version: 1,
      status: 0,
      sectionCount: 0,
      layoutType: 0,
      fieldsPerRow: 4,
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
      sections: [],
    } as AdmissionForm;

    render(
      <form data-testid="builder-form">
        <FormPreviewContent form={form} formik={formik} resolvedOptions={{}} embedded />
      </form>
    );

    expect(screen.getByTestId('builder-form').querySelectorAll('form')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Validate preview' })).not.toBeInTheDocument();
    expect(submitForm).not.toHaveBeenCalled();
  });
});
