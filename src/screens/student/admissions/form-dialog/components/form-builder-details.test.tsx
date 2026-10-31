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
    { purpose: 0 as const, starter: 'Use inquiry form: Inquiry form' },
    { purpose: 1 as const, starter: 'Use recommended: Registration form' },
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
      await user.paste('My school form');
      await user.click(screen.getByRole('button', { name: 'Start blank: Blank form' }));
      expect(screen.getByRole('button', { name: 'Replace draft' })).toBeInTheDocument();
      expect(getValues().name).toBe('My school form');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(getValues().name).toBe('My school form');
      expect(getValues().purpose).toBe(purpose);

      await user.click(screen.getByRole('button', { name: 'Start blank: Blank form' }));
      await user.click(screen.getByRole('button', { name: 'Replace draft' }));
      await waitFor(() =>
        expect(getValues().sections[0].fields).toHaveLength(purpose === 0 ? 4 : 0)
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
      starter: 'Use inquiry form: Inquiry form',
      nextStarter: 'Use recommended: Registration form',
    },
    {
      purpose: 1 as const,
      nextPurpose: 0 as const,
      type: 'Inquiry',
      starter: 'Use recommended: Registration form',
      nextStarter: 'Use inquiry form: Inquiry form',
    },
  ])(
    'switches $purpose to $nextPurpose without replacing draft details or fields',
    async ({ purpose, nextPurpose, type, starter, nextStarter }) => {
      const user = userEvent.setup();
      const getValues = renderDetails(purpose);
      await user.click(screen.getByRole('button', { name: starter }));
      await user.clear(screen.getByRole('textbox', { name: 'Form name *' }));
      await user.paste('My saved draft');
      await user.click(screen.getByRole('textbox', { name: 'Description (optional)' }));
      await user.paste('School notes');
      const previousValues = structuredClone(getValues());

      await user.click(screen.getByRole('combobox', { name: /Form type/ }));
      await user.click(screen.getByRole('option', { name: type }));

      const expected = { ...previousValues, purpose: nextPurpose };
      const actual = structuredClone(getValues());
      if (nextPurpose === 0) {
        expect(
          actual.sections
            .flatMap((section) => section.fields)
            .find((field) => field.bindingKey === 'Inquiry.ParentRelationship')
        ).toMatchObject({ required: true, label: 'Primary contact' });
        actual.sections.forEach((section) => {
          section.fields = section.fields.filter(
            (field) => field.bindingKey !== 'Inquiry.ParentRelationship'
          );
        });
      }
      expect(actual).toEqual(expected);
      const switchedValues = structuredClone(getValues());
      expect(screen.queryByRole('button', { name: starter })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: nextStarter })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.getByRole('button', { name: 'Start blank: Blank form' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.queryByRole('button', { name: 'Replace draft' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: nextStarter }));
      expect(screen.getByRole('button', { name: 'Replace draft' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(getValues()).toEqual(switchedValues);

      await user.click(screen.getByRole('button', { name: nextStarter }));
      await user.click(screen.getByRole('button', { name: 'Replace draft' }));
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
    expect(screen.getByRole('combobox', { name: /Form type/ })).toHaveTextContent('Inquiry');
    await user.click(screen.getByRole('combobox', { name: /Form type/ }));
    await user.click(screen.getByRole('option', { name: 'Registration' }));
    await user.click(screen.getByRole('button', { name: 'Use recommended: Registration form' }));
    expect(screen.queryByRole('button', { name: 'Replace draft' })).not.toBeInTheDocument();
    expect(getValues().purpose).toBe(1);
    expect(getValues().sections.some((section) => section.fields.length > 0)).toBe(true);
  });

  it('keeps a blank draft selected and preserves its data when changing form type', async () => {
    const user = userEvent.setup();
    const getValues = renderDetails(0);
    await user.click(screen.getByRole('textbox', { name: 'Form name *' }));
    await user.paste('Custom blank draft');
    const previousValues = structuredClone(getValues());
    await user.click(screen.getByRole('combobox', { name: /Form type/ }));
    await user.click(screen.getByRole('option', { name: 'Registration' }));
    expect(getValues()).toEqual({
      ...previousValues,
      purpose: 1,
      sections: previousValues.sections.map((section) => ({ ...section, fields: [] })),
    });
    expect(screen.getByRole('button', { name: 'Start blank: Blank form' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('does not mark a populated template as blank after returning to details and switching type', async () => {
    const user = userEvent.setup();
    const getValues = renderDetails(0);
    await user.click(screen.getByRole('button', { name: 'Use inquiry form: Inquiry form' }));
    const previousValues = structuredClone(getValues());
    getValues.leaveDetails();
    getValues.returnToDetails();
    expect(screen.getByRole('button', { name: 'Start blank: Blank form' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    await user.click(screen.getByRole('combobox', { name: /Form type/ }));
    await user.click(screen.getByRole('option', { name: 'Registration' }));
    expect(getValues()).toEqual({ ...previousValues, purpose: 1 });
    expect(screen.getByRole('button', { name: 'Start blank: Blank form' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('button', { name: 'Use recommended: Registration form' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it.each([0, 1] as const)(
    'shows saved purpose %s as a disabled form type while editing details',
    async (purpose) => {
      const user = userEvent.setup();
      const getValues = renderDetails(purpose, true);
      expect(
        screen.queryByRole('button', { name: 'Start blank: Blank form' })
      ).not.toBeInTheDocument();
      const typeSelect = screen.getByRole('combobox', { name: /Form type/i });
      expect(typeSelect).toHaveAttribute('aria-disabled', 'true');
      expect(typeSelect).toHaveTextContent(purpose === 0 ? 'Inquiry' : 'Registration');
      await user.click(typeSelect);
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
      await user.click(screen.getByRole('textbox', { name: 'Form name *' }));
      await user.paste('Updated form');
      expect(getValues().purpose).toBe(purpose);
    }
  );
});
