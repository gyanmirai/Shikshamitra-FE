import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { FormBuilderReview } from './form-builder-review';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [], isLoading: false, isError: false }),
  useGetAdmissionFormDataSourcesQuery: () => ({ data: [] }),
}));

function reviewForm(): CreateUpdateAdmissionForm {
  const form = getBlankAdmissionFormInitialValues();
  form.name = 'School application';
  form.sections[0].fields = [
    {
      id: 'student-name',
      code: 'STUDENT_NAME',
      label: 'Student name',
      fieldType: 0,
      bindingType: 1,
      bindingKey: 'STUDENT_NAME',
      required: true,
      readOnly: false,
      displayOrder: 0,
    },
    {
      id: 'consent',
      code: 'CONSENT',
      label: 'Parent consent',
      fieldType: 9,
      bindingType: 1,
      bindingKey: 'CONSENT',
      required: false,
      readOnly: false,
      displayOrder: 1,
    },
  ];
  form.sections.push({
    ...form.sections[0],
    id: 'address-section',
    code: 'ADDRESS',
    name: 'Address',
    displayOrder: 1,
    fields: [
      {
        ...form.sections[0].fields[0],
        id: 'town',
        code: 'TOWN',
        bindingKey: 'TOWN',
        label: 'Town',
      },
    ],
  });
  return form;
}

function mountReview(values = reviewForm()) {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={values} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormBuilderReview formik={formik} />
            <output data-testid="form-json">{JSON.stringify(formik.values)}</output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}
function definition(): CreateUpdateAdmissionForm {
  return JSON.parse(screen.getByTestId('form-json').textContent ?? '{}');
}

it('switches review field translations independently of headings without modifying the draft or answers', async () => {
  const user = userEvent.setup();
  const values = reviewForm();
  values.supportedLanguages = ['en', 'gu', 'hi'];
  values.sections[0].fields[0].translations = {
    gu: { label: 'વિદ્યાર્થીનું નામ', placeholder: 'નામ લખો' },
    hi: { label: 'विद्यार्थी का नाम', placeholder: 'नाम लिखें' },
  };
  mountReview(values);
  await user.type(screen.getByRole('textbox', { name: 'Student name' }), 'QA student');
  const checkLanguage = async (language: string, label: string, placeholder: string) => {
    await user.click(screen.getByRole('combobox', { name: 'Form language' }));
    await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: language }));
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('QA student');
    expect(screen.getByRole('textbox', { name: label })).toHaveAttribute(
      'placeholder',
      placeholder
    );
    expect(screen.getByRole('checkbox', { name: 'Parent consent' })).not.toBeChecked();
    expect(screen.getByText('Parent consent')).toBeVisible();
  };
  await checkLanguage('Gujarati', 'વિદ્યાર્થીનું નામ', 'નામ લખો');
  await checkLanguage('Hindi', 'विद्यार्थी का नाम', 'नाम लिखें');
  expect(definition()).toEqual(values);
});

it('renders actual controls and keeps preview answers separate from the saved definition', async () => {
  const user = userEvent.setup({ delay: null });
  mountReview();
  const before = definition();
  await user.type(screen.getByRole('textbox', { name: 'Student name' }), 'Sample student');
  await user.click(screen.getByRole('checkbox', { name: 'Parent consent' }));
  expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('Sample student');
  expect(screen.getByRole('checkbox', { name: 'Parent consent' })).toBeChecked();
  expect(
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Student name' }), {
      key: 'Enter',
      code: 'Enter',
    })
  ).toBe(false);
  expect(definition()).toEqual(before);
});

it('provides a preview without edit, delete, or field settings actions and shows its description in the info tooltip', async () => {
  const user = userEvent.setup({ delay: null });
  const values = reviewForm();
  values.description = 'Application for prospective students.';
  mountReview(values);
  expect(screen.getByRole('heading', { name: 'School application' })).toBeVisible();
  expect(screen.queryByText(values.description)).not.toBeInTheDocument();
  await user.hover(screen.getByRole('button', { name: 'About this admission form' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(values.description);
  expect(screen.queryByRole('button', { name: /Edit|Delete|Actions for/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText(/Use Edit to change/)).not.toBeInTheDocument();
  expect(definition()).toEqual(values);
});

it('navigates steps in the card while preserving preview entries and the definition', async () => {
  const user = userEvent.setup({ delay: null });
  const values = reviewForm();
  values.layoutType = 1;
  Object.assign(values.sections[0], {
    stepId: 'student-step',
    stepName: 'Student',
    stepDisplayOrder: 0,
  });
  Object.assign(values.sections[1], {
    stepId: 'address-step',
    stepName: 'Location',
    stepDisplayOrder: 1,
  });
  mountReview(values);
  expect(screen.getByRole('complementary', { name: 'Form step navigation' })).toBeVisible();
  await user.type(screen.getByRole('textbox', { name: 'Student name' }), 'Preview student');
  await user.click(screen.getByRole('button', { name: 'Location' }));
  expect(screen.getByRole('textbox', { name: 'Town' })).toBeVisible();
  expect(screen.queryByRole('textbox', { name: 'Student name' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Student' }));
  expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('Preview student');
  expect(definition()).toEqual(values);
});

it('shows publishing issues without opening an editor from review', async () => {
  const user = userEvent.setup({ delay: null });
  const values = reviewForm();
  values.sections[0].fields[0].bindingKey = '';
  mountReview(values);
  await user.click(screen.getByRole('button', { name: '1 check to review' }));
  expect(screen.getByText('Student name needs a custom binding key.')).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Student name needs a custom binding key.' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog', { name: 'Field settings' })).not.toBeInTheDocument();
  expect(definition()).toEqual(values);
});

it('puts a later profile photo in the left rail and preserves preview answers and definition order', async () => {
  const user = userEvent.setup({ delay: null });
  const values = reviewForm();
  values.fieldsPerRow = 4;
  values.sections[0].fields.push({
    id: 'profile-photo',
    code: 'PROFILE_PHOTO',
    label: 'Student photo',
    fieldType: 0,
    bindingType: 0,
    bindingKey: 'Applicant.ProfilePhoto',
    required: false,
    readOnly: false,
    displayOrder: 2,
    validationJson: '{"format":"photo"}',
  });
  mountReview(values);

  const photo = screen.getByRole('button', { name: 'Choose student photo' });
  const name = screen.getByRole('textbox', { name: 'Student name' });
  expect(screen.getByLabelText('Profile photos')).toContainElement(photo);
  expect(photo.compareDocumentPosition(name)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  await user.type(name, 'Preview student');
  expect(name).toHaveValue('Preview student');
  expect(definition()).toEqual(values);
  expect(definition().sections[0].fields.map((field) => field.code)).toEqual([
    'STUDENT_NAME',
    'CONSENT',
    'PROFILE_PHOTO',
  ]);
});
