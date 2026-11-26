import { Formik } from 'formik';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderDetailFields } from './form-builder-detail-fields';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';

describe('FormBuilderDetailFields', () => {
  it('checks name availability inside the input and shows actual conflicts below it', () => {
    const draft = getBlankAdmissionFormInitialValues(0);
    const theme = createTheme(defaultSettings);
    const renderFields = (checkingName: boolean, nameConflictMessage?: string) => (
      <ThemeProvider theme={theme}>
        <Formik initialValues={draft} onSubmit={() => undefined}>
          {(formik) => (
            <FormBuilderDetailFields {...{ formik, checkingName, nameConflictMessage }} />
          )}
        </Formik>
      </ThemeProvider>
    );
    const { rerender } = render(renderFields(true));
    const nameField = screen.getByRole('textbox', { name: 'Form Name *' });
    expect(nameField.closest('.MuiInputBase-root')).toContainElement(
      screen.getByRole('progressbar', { name: 'Checking form name availability' })
    );
    expect(nameField).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText(/Checking name availability/)).not.toBeInTheDocument();

    rerender(renderFields(false, 'A form with this name already exists.'));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(nameField).toHaveAccessibleDescription('A form with this name already exists.');
    expect(nameField).toHaveAttribute('aria-invalid', 'true');
  });

  it('confirms a multi-step inquiry switch without losing fields, groups or visibility rules', async () => {
    const user = userEvent.setup();
    const draft = getBlankAdmissionFormInitialValues(0);
    draft.layoutType = 1;
    const firstSection = draft.sections[0];
    draft.sections = [
      { ...firstSection, stepId: 'student-step', stepName: 'Student', stepDisplayOrder: 0 },
      {
        ...firstSection,
        id: 'contact-section',
        code: 'CONTACT',
        name: 'Contact',
        displayOrder: 1,
        stepId: 'contact-step',
        stepName: 'Contact details',
        stepDisplayOrder: 1,
        stepVisibilityRuleJson: '{"field":"CONTACT_REQUIRED","equals":true}',
        fields: firstSection.fields.map((field) => ({
          ...field,
          id: `contact-${field.id}`,
          code: `CONTACT_${field.code}`,
          sectionId: 'contact-section',
        })),
      },
    ];
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik initialValues={draft} onSubmit={() => undefined}>
          {(formik) => (
            <>
              <FormBuilderDetailFields formik={formik} />
              <output data-testid="form-draft">{JSON.stringify(formik.values)}</output>
            </>
          )}
        </Formik>
      </ThemeProvider>
    );
    const chooseLayout = async (name: string) => {
      await user.click(screen.getByRole('combobox', { name: /Form Layout/ }));
      await user.click(screen.getByRole('option', { name }));
    };
    const currentDraft = () => JSON.parse(screen.getByTestId('form-draft').textContent ?? '{}');

    await chooseLayout('Single Page');
    const dialog = screen.getByRole('dialog', { name: 'Switch to Single Page?' });
    expect(currentDraft()).toEqual(draft);
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(currentDraft()).toEqual(draft);

    await chooseLayout('Single Page');
    await user.click(screen.getByRole('button', { name: 'Switch to single page' }));
    expect(currentDraft()).toEqual({ ...draft, layoutType: 0 });
    await chooseLayout('Step by Step');
    expect(currentDraft()).toEqual(draft);
  });

  it('offers only English, Gujarati, and Hindi and keeps the default within selected languages', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik initialValues={getBlankAdmissionFormInitialValues(0)} onSubmit={() => undefined}>
          {(formik) => <FormBuilderDetailFields formik={formik} />}
        </Formik>
      </ThemeProvider>
    );
    await user.click(screen.getByRole('combobox', { name: 'Applicant Languages *' }));
    const choices = within(screen.getByRole('listbox'));
    expect(choices.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'English',
      'Gujarati',
      'Hindi',
    ]);
    await user.click(choices.getByRole('option', { name: 'Gujarati' }));
    await user.click(choices.getByRole('option', { name: 'Hindi' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('combobox', { name: /Default Language/ }));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'English',
      'Gujarati',
      'Hindi',
    ]);
    await user.click(screen.getByRole('option', { name: 'Gujarati' }));
    expect(screen.getByRole('combobox', { name: /Default Language/ })).toHaveTextContent(
      'Gujarati'
    );
    await user.click(screen.getByRole('button', { name: 'Gujarati' }).querySelector('svg')!);
    expect(screen.getByRole('combobox', { name: /Default Language/ })).toHaveTextContent('English');
  });
  it('keeps empty labels inside their fields until focus and omits the duplicate grid setting', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik initialValues={getBlankAdmissionFormInitialValues(0)} onSubmit={() => undefined}>
          {(formik) => <FormBuilderDetailFields formik={formik} />}
        </Formik>
      </ThemeProvider>
    );

    const nameLabel = screen.getByText('Form Name *', { selector: 'label' });
    const descriptionLabel = screen.getByText('Description', { selector: 'label' });

    expect(nameLabel).not.toHaveClass('MuiInputLabel-shrink');
    expect(descriptionLabel).not.toHaveClass('MuiInputLabel-shrink');
    expect(screen.queryByRole('combobox', { name: /Fields per row/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Form purpose/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('textbox', { name: 'Form Name *' }));
    expect(nameLabel).toHaveClass('MuiInputLabel-shrink');

    await user.click(screen.getByRole('textbox', { name: 'Description' }));
    expect(nameLabel).not.toHaveClass('MuiInputLabel-shrink');
    expect(descriptionLabel).toHaveClass('MuiInputLabel-shrink');
  });
});
