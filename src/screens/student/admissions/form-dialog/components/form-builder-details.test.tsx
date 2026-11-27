import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderDetails } from './form-builder-details';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { getNewAdmissionFormInitialValues } from '../admission-form-template-catalog';

function renderDetails(purpose: 0 | 1, editing = false) {
  const initialValues = editing
    ? getBlankAdmissionFormInitialValues(purpose)
    : getNewAdmissionFormInitialValues(purpose);
  const starter = { current: initialValues };
  let values: CreateUpdateAdmissionForm = initialValues;
  const content = (visible: boolean) => (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={initialValues} onSubmit={() => undefined}>
        {(formik) => {
          ({ values } = formik);
          return visible ? (
            <FormBuilderDetails formik={formik} editing={editing} starter={starter} />
          ) : null;
        }}
      </Formik>
    </ThemeProvider>
  );
  const view = render(content(true));
  return {
    values: () => values,
    returnToDetails: () => {
      view.rerender(content(false));
      view.rerender(content(true));
    },
  };
}

async function selectType(
  user: ReturnType<typeof userEvent.setup>,
  type: 'Inquiry' | 'Registration'
) {
  await user.click(screen.getByRole('radio', { name: new RegExp(`${type} Form`, 'i') }));
}

it('uses the standard headers on the two details cards', () => {
  renderDetails(0);
  expect(screen.getByRole('heading', { name: 'Form Type', level: 2 })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Form Details', level: 2 })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Form Type information' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Form Details information' })).toBeVisible();
});

it('loads a matching starter on type change and carries the form details across switches', async () => {
  const user = userEvent.setup();
  const view = renderDetails(0);
  await user.type(screen.getByRole('textbox', { name: 'Form Name *' }), 'My school form');
  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'School notes');

  await selectType(user, 'Registration');
  expect(view.values()).toMatchObject({
    name: 'My school form',
    description: 'School notes',
    purpose: 1,
    fieldsPerRow: 2,
    layoutType: 1,
  });
  expect(view.values().sections.map((section) => section.stepName)).toEqual([
    'Student',
    'Family',
    'Address',
    'Academic history',
  ]);
  expect(screen.queryByRole('dialog', { name: /Switch to/ })).not.toBeInTheDocument();

  view.returnToDetails();
  await selectType(user, 'Inquiry');
  expect(view.values()).toMatchObject({
    name: 'My school form',
    description: 'School notes',
    purpose: 0,
    fieldsPerRow: 2,
    layoutType: 0,
  });
  expect(view.values().sections.flatMap((section) => section.fields)).toHaveLength(6);
  expect(screen.queryByRole('dialog', { name: /Switch to/ })).not.toBeInTheDocument();
});

it('asks before replacing a customized layout and keeps the draft when canceled', async () => {
  const user = userEvent.setup();
  const view = renderDetails(1);
  await user.click(screen.getByRole('combobox', { name: /Form Layout/i }));
  await user.click(screen.getByRole('option', { name: 'Single Page' }));
  const edited = view.values();

  view.returnToDetails();
  await selectType(user, 'Inquiry');
  expect(screen.getByRole('dialog', { name: 'Switch to Inquiry?' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(view.values()).toEqual(edited);

  await selectType(user, 'Inquiry');
  await user.click(screen.getByRole('button', { name: 'Switch form type' }));
  expect(view.values().purpose).toBe(0);
  expect(view.values().sections.flatMap((section) => section.fields)).toHaveLength(6);
});

it.each([0, 1] as const)(
  'keeps the saved type %s and its one-column layout when editing',
  (purpose) => {
    const view = renderDetails(purpose, true);
    const type = screen.getByRole('radio', {
      name: purpose === 0 ? /Inquiry Form/i : /Registration Form/i,
    });
    expect(type).toBeDisabled();
    expect(type).toBeChecked();
    expect(screen.getByText('Inquiry Form')).toHaveStyle({ fontWeight: '700' });
    expect(screen.getByText('Registration Form')).toHaveStyle({ fontWeight: '700' });
    expect(view.values().fieldsPerRow).toBe(1);
  }
);
