import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderProperties } from '../form-builder-properties';
import { newField, getAdmissionFormInitialValues } from '../form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormDataSourcesQuery: () => ({ data: [] }),
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [] }),
}));

function renderFieldSettings(fieldType: 6 | 7 | 8, patch: Partial<AdmissionFormField> = {}) {
  const form = getAdmissionFormInitialValues();
  const section = form.sections[0];
  section.fields = [{ ...newField(section.id!, 0, fieldType), ...patch }];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={form} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormBuilderProperties
              formik={formik}
              selectedLocation={{ sectionIndex: 0, fieldIndex: 0 }}
            />
            <output data-testid="choices-json">
              {formik.values.sections[0].fields[0].optionsJson}
            </output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}

describe('Admission Form Builder choice field settings', () => {
  it('repairs the known draft Other choice before a label translation is edited', async () => {
    renderFieldSettings(6, {
      bindingType: 0,
      bindingKey: 'Applicant.Gender',
      optionsJson:
        '[{"value":"Male","label":"Male"},{"value":"Female","label":"Female"},{"value":"OPTION_3","label":"Other"}]',
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Option 3' }), {
      target: { value: 'अन्य' },
    });
    expect(JSON.parse(screen.getByTestId('choices-json').textContent!)[2]).toEqual({
      value: 'Other',
      label: 'अन्य',
    });
  });
  it('adds canonical Other to linked gender while keeping translated labels and disabling generic paste', async () => {
    renderFieldSettings(6, {
      bindingType: 0,
      bindingKey: 'Applicant.Gender',
      optionsJson: '[{"value":"Male","label":"लड़का"},{"value":"Female","label":"लड़की"}]',
    });
    await userEvent.click(screen.getByRole('button', { name: 'Add Choice' }));
    expect(JSON.parse(screen.getByTestId('choices-json').textContent!)).toEqual([
      { value: 'Male', label: 'लड़का' },
      { value: 'Female', label: 'लड़की' },
      { value: 'Other', label: 'Other' },
    ]);
    expect(screen.getByRole('button', { name: 'Add Choice' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Paste Choices' })).not.toBeInTheDocument();
    await userEvent.clear(screen.getByRole('textbox', { name: 'Option 3' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Option 3' }), 'अन्य');
    expect(JSON.parse(screen.getByTestId('choices-json').textContent!)[2]).toEqual({
      value: 'Other',
      label: 'अन्य',
    });
  });
  it('keeps class interest on the live Institute Setup selector without manual option editing', () => {
    renderFieldSettings(6, {
      code: 'CLASS_INTERESTED',
      label: 'Class interested in',
      optionsJson: '{"source":"Standards"}',
    });
    expect(screen.getByRole('combobox', { name: 'Field Type' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.queryByRole('button', { name: 'Enter My Own Options' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Choice' })).not.toBeInTheDocument();
    expect(screen.getByTestId('choices-json')).toHaveTextContent('{"source":"Standards"}');
  });
  it('repairs a legacy manual class alias explicitly, without altering ordinary custom choice fields', async () => {
    renderFieldSettings(6, {
      code: 'FIELD_1',
      label: 'Interested Class',
      optionsJson: '["Class 1"]',
    });
    await userEvent.click(screen.getByRole('button', { name: 'Use Institute Setup Classes' }));
    expect(screen.getByTestId('choices-json')).toHaveTextContent('{"source":"Standards"}');
    expect(screen.queryByRole('button', { name: 'Add Choice' })).not.toBeInTheDocument();
  });
  it.each([6, 7, 8] as const)(
    'lets a custom field of type %s replace the default option name',
    async (fieldType) => {
      const user = userEvent.setup();
      renderFieldSettings(fieldType);

      expect(screen.queryByRole('combobox', { name: 'Options source' })).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox', { name: 'Depends on field' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Add Choice' }));
      const firstOption = screen.getByRole('textbox', { name: 'Option 1' });
      await user.clear(firstOption);
      expect(firstOption).toHaveValue('');
      expect(screen.getByText('Enter an option name.')).toBeVisible();

      await user.type(firstOption, 'School bus');
      expect(firstOption).toHaveValue('School bus');
      expect(screen.queryByText('Enter an option name.')).not.toBeInTheDocument();
      expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
        { value: 'OPTION_1', label: 'School bus' },
      ]);
    }
  );

  it('keeps radio option values stable while renaming, reordering, and deleting choices', async () => {
    const user = userEvent.setup();
    renderFieldSettings(8);

    await user.click(screen.getByRole('button', { name: 'Add Choice' }));
    await user.click(screen.getByRole('button', { name: 'Add Choice' }));
    await user.clear(screen.getByRole('textbox', { name: 'Option 1' }));
    await user.type(screen.getByRole('textbox', { name: 'Option 1' }), 'Yes');
    await user.clear(screen.getByRole('textbox', { name: 'Option 2' }));
    await user.type(screen.getByRole('textbox', { name: 'Option 2' }), 'No');

    await user.click(screen.getByRole('button', { name: 'Move No Up' }));
    expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
      { value: 'OPTION_2', label: 'No' },
      { value: 'OPTION_1', label: 'Yes' },
    ]);

    await user.click(screen.getByRole('button', { name: 'Delete Yes' }));
    expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
      { value: 'OPTION_2', label: 'No' },
    ]);
  }, 10000);

  it('adds pasted radio choices with distinct stored values', async () => {
    const user = userEvent.setup();
    renderFieldSettings(8);

    await user.click(screen.getByRole('button', { name: 'Paste Choices' }));
    await user.type(screen.getByRole('textbox', { name: 'Paste Choices' }), 'Bus{enter}Bus');
    await user.click(screen.getByRole('button', { name: 'Add Choices' }));

    expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
      { value: 'BUS', label: 'Bus' },
      { value: 'BUS_2', label: 'Bus' },
    ]);
  });

  it('protects an academic lookup and its parent dependency from manual options', () => {
    const optionsJson = '{"source":"EducationMediums","parentField":"BOARD"}';
    renderFieldSettings(6, { optionsJson });

    expect(screen.getByTestId('choices-json')).toHaveTextContent(optionsJson);
    expect(screen.queryByRole('combobox', { name: 'Options source' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Depends on field' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Choice' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enter My Own Options' })).not.toBeInTheDocument();
  });

  it('preserves the automatic options and parent dependency of a linked Student field', () => {
    const optionsJson = '{"source":"EducationMediums","parentField":"BOARD"}';
    renderFieldSettings(6, { optionsJson, bindingType: 0, bindingKey: 'Admission.Medium' });

    expect(screen.getByTestId('choices-json')).toHaveTextContent(optionsJson);
    expect(screen.queryByText('Answer Options')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enter My Own Options' })).not.toBeInTheDocument();
  });
});
