import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { addIcon } from '@iconify/react';
import { it, expect, describe } from 'vitest';
import { GlobalIcons } from 'src/utils/icons';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderDetails } from './form-builder-details';
import { changeNewFormPurpose } from '../inquiry-default-fields';
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
addIcon(GlobalIcons.cancel, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });

function renderDetails(purpose: 0 | 1, editing = false) {
  let values: CreateUpdateAdmissionForm;
  const content = (showDetails: boolean) => (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik
        initialValues={getBlankAdmissionFormInitialValues(purpose)}
        onSubmit={() => undefined}
      >
        {(formik) => {
          ({ values } = formik);
          return showDetails ? <FormBuilderDetails formik={formik} editing={editing} /> : null;
        }}
      </Formik>
    </ThemeProvider>
  );
  const view = render(content(true));
  return Object.assign(() => values, {
    leaveDetails: () => view.rerender(content(false)),
    returnToDetails: () => view.rerender(content(true)),
  });
}

describe('FormBuilderDetails purpose-specific starters', () => {
  it.each([
    { purpose: 0 as const, starter: 'Use Inquiry Form: Inquiry Form' },
    { purpose: 1 as const, starter: 'Use Recommended: Registration Form' },
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
      await user.clear(screen.getByRole('textbox', { name: 'Form Name *' }));
      await user.paste('My school form');
      await user.click(screen.getByRole('button', { name: 'Start Blank: Blank Form' }));
      expect(screen.getByRole('button', { name: 'Replace Draft' })).toBeInTheDocument();
      expect(getValues().name).toBe('My school form');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(getValues().name).toBe('My school form');
      expect(getValues().purpose).toBe(purpose);

      await user.click(screen.getByRole('button', { name: 'Start Blank: Blank Form' }));
      await user.click(screen.getByRole('button', { name: 'Replace Draft' }));
      await waitFor(() =>
        expect(getValues().sections[0].fields).toHaveLength(purpose === 0 ? 6 : 7)
      );
      expect(getValues().name).not.toBe(templateName);
      expect(getValues().purpose).toBe(purpose);
      expect(getValues().code).toBe('');
    }
  );

  it.each([
    {
      purpose: 0 as const,
      nextPurpose: 1 as const,
      type: 'Registration',
      starter: 'Use Inquiry Form: Inquiry Form',
      nextStarter: 'Use Recommended: Registration Form',
    },
    {
      purpose: 1 as const,
      nextPurpose: 0 as const,
      type: 'Inquiry',
      starter: 'Use Recommended: Registration Form',
      nextStarter: 'Use Inquiry Form: Inquiry Form',
    },
  ])(
    'switches $purpose to $nextPurpose without replacing draft details or fields',
    async ({ purpose, nextPurpose, type, starter, nextStarter }) => {
      const user = userEvent.setup();
      const getValues = renderDetails(purpose);
      await user.click(screen.getByRole('button', { name: starter }));
      await user.clear(screen.getByRole('textbox', { name: 'Form Name *' }));
      await user.paste('My saved draft');
      await user.click(screen.getByRole('textbox', { name: 'Description (Optional)' }));
      await user.paste('School notes');
      const previousValues = structuredClone(getValues());

      await user.click(screen.getByRole('combobox', { name: /Form Type/ }));
      await user.click(screen.getByRole('option', { name: type }));

      const expected = changeNewFormPurpose(previousValues, nextPurpose);
      const actual = structuredClone(getValues());
      // Newly created policy fields have fresh IDs in each materialization.
      expected.sections.forEach((section) =>
        section.fields.forEach((field) => {
          const persisted = actual.sections
            .flatMap((item) => item.fields)
            .find((item) => item.bindingKey === field.bindingKey);
          if (persisted) field.id = persisted.id;
        })
      );
      expect(actual).toEqual(expected);
      const switchedValues = structuredClone(getValues());
      expect(screen.queryByRole('button', { name: starter })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: nextStarter })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.getByRole('button', { name: 'Start Blank: Blank Form' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.queryByRole('button', { name: 'Replace Draft' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: nextStarter }));
      expect(screen.getByRole('button', { name: 'Replace Draft' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(getValues()).toEqual(switchedValues);

      await user.click(screen.getByRole('button', { name: nextStarter }));
      await user.click(screen.getByRole('button', { name: 'Replace Draft' }));
      await waitFor(() => expect(getValues().name).not.toBe('My saved draft'));
      expect(getValues().purpose).toBe(nextPurpose);
      expect(getValues().sections.some((section) => section.fields.length > 0)).toBe(true);
      expect(screen.getByRole('button', { name: nextStarter })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    }
  );

  it('applies the registration starter directly after changing only the form type', async () => {
    const user = userEvent.setup();
    const getValues = renderDetails(0);
    expect(screen.getByRole('combobox', { name: /Form Type/ })).toHaveTextContent('Inquiry');
    await user.click(screen.getByRole('combobox', { name: /Form Type/ }));
    await user.click(screen.getByRole('option', { name: 'Registration' }));
    await user.click(screen.getByRole('button', { name: 'Use Recommended: Registration Form' }));
    expect(screen.queryByRole('button', { name: 'Replace Draft' })).not.toBeInTheDocument();
    expect(getValues().purpose).toBe(1);
    expect(getValues().sections.some((section) => section.fields.length > 0)).toBe(true);
  });

  it('keeps a blank draft selected and preserves its data when changing form type', async () => {
    const user = userEvent.setup();
    const getValues = renderDetails(0);
    await user.click(screen.getByRole('textbox', { name: 'Form Name *' }));
    await user.paste('Custom blank draft');
    const previousValues = structuredClone(getValues());
    await user.click(screen.getByRole('combobox', { name: /Form Type/ }));
    await user.click(screen.getByRole('option', { name: 'Registration' }));
    expect(getValues()).toMatchObject({ name: previousValues.name, purpose: 1 });
    expect(getValues().sections[0].fields).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'Start Blank: Blank Form' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('does not mark a populated template as blank after returning to details and switching type', async () => {
    const user = userEvent.setup();
    const getValues = renderDetails(0);
    await user.click(screen.getByRole('button', { name: 'Use Inquiry Form: Inquiry Form' }));
    const previousValues = structuredClone(getValues());
    getValues.leaveDetails();
    getValues.returnToDetails();
    expect(screen.getByRole('button', { name: 'Start Blank: Blank Form' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    await user.click(screen.getByRole('combobox', { name: /Form Type/ }));
    await user.click(screen.getByRole('option', { name: 'Registration' }));
    expect(getValues()).toMatchObject({ name: previousValues.name, purpose: 1 });
    expect(
      getValues()
        .sections.flatMap((section) => section.fields)
        .filter((field) => !field.bindingKey?.startsWith('Inquiry.')).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Start Blank: Blank Form' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('button', { name: 'Use Recommended: Registration Form' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it.each([0, 1] as const)(
    'shows saved purpose %s as a disabled form type while editing details',
    async (purpose) => {
      const user = userEvent.setup();
      const getValues = renderDetails(purpose, true);
      expect(
        screen.queryByRole('button', { name: 'Start Blank: Blank Form' })
      ).not.toBeInTheDocument();
      const typeSelect = screen.getByRole('combobox', { name: /Form Type/i });
      expect(typeSelect).toHaveAttribute('aria-disabled', 'true');
      expect(typeSelect).toHaveTextContent(purpose === 0 ? 'Inquiry' : 'Registration');
      await user.click(typeSelect);
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
      await user.click(screen.getByRole('textbox', { name: 'Form Name *' }));
      await user.paste('Updated form');
      expect(getValues().purpose).toBe(purpose);
    }
  );
});
