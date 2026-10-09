import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { addIcon } from '@iconify/react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderDetails } from './form-builder-details';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';

[
  'file-outline',
  'file-document-edit-outline',
  'account-question-outline',
  'check',
  'swap-horizontal',
  'close',
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

function renderDetails(purpose: 0 | 1, editing = false) {
  let values: CreateUpdateAdmissionForm;
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik
        initialValues={getBlankAdmissionFormInitialValues(purpose)}
        onSubmit={() => undefined}
      >
        {(formik) => {
          ({ values } = formik);
          return <FormBuilderDetails formik={formik} editing={editing} />;
        }}
      </Formik>
    </ThemeProvider>
  );
  return () => values;
}

describe('FormBuilderDetails purpose-specific starters', () => {
  it.each([
    { purpose: 0 as const, starter: 'Use inquiry form: Inquiry form' },
    { purpose: 1 as const, starter: 'Use recommended: Admission application' },
  ])(
    'preserves purpose $purpose while applying and replacing starters',
    async ({ purpose, starter }) => {
      const user = userEvent.setup();
      const getValues = renderDetails(purpose);

      await user.click(screen.getByRole('button', { name: starter }));
      await waitFor(() =>
        expect(getValues().sections.some((section) => section.fields.length > 0)).toBe(true)
      );
      expect(getValues().purpose).toBe(purpose);
      expect(getValues().code).toBe('');

      const templateName = getValues().name;
      await user.clear(screen.getByRole('textbox', { name: 'Form name *' }));
      await user.type(screen.getByRole('textbox', { name: 'Form name *' }), 'My school form');
      await user.click(screen.getByRole('button', { name: 'Start blank: Blank form' }));
      expect(screen.getByRole('button', { name: 'Replace draft' })).toBeInTheDocument();
      expect(getValues().name).toBe('My school form');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(getValues().name).toBe('My school form');
      expect(getValues().purpose).toBe(purpose);

      await user.click(screen.getByRole('button', { name: 'Start blank: Blank form' }));
      await user.click(screen.getByRole('button', { name: 'Replace draft' }));
      await waitFor(() => expect(getValues().sections[0].fields).toHaveLength(0));
      expect(getValues().name).not.toBe(templateName);
      expect(getValues().purpose).toBe(purpose);
      expect(getValues().code).toBe('');
    }
  );

  it.each([0, 1] as const)(
    'keeps purpose %s hidden and unchanged when editing details',
    async (purpose) => {
      const user = userEvent.setup();
      const getValues = renderDetails(purpose, true);
      expect(
        screen.queryByRole('button', { name: 'Start blank: Blank form' })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox', { name: /Form purpose/i })).not.toBeInTheDocument();
      await user.type(screen.getByRole('textbox', { name: 'Form name *' }), 'Updated form');
      expect(getValues().purpose).toBe(purpose);
    }
  );
});
