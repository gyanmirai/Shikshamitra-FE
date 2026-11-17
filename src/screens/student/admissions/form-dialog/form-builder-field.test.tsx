import { Formik } from 'formik';
import { DndContext } from '@dnd-kit/core';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';
import { FormBuilderField, FormBuilderFieldDragPreview } from './form-builder-field';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

function mountField(format?: string, placeholder?: string) {
  const form = getBlankAdmissionFormInitialValues(1);
  const section = form.sections[0];
  const field = {
    ...newField(section.id, 0),
    label: format ? format[0].toUpperCase() + format.slice(1) : 'Country',
    validationJson: format ? JSON.stringify({ format }) : undefined,
    placeholder,
  };
  section.fields = [field];
  const onSelect = vi.fn();
  const original = JSON.stringify(form);
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DndContext>
        <Formik initialValues={form} onSubmit={() => undefined}>
          {(formik) => (
            <>
              <FormBuilderField
                formik={formik}
                sectionIndex={0}
                fieldIndex={0}
                selected={false}
                onSelect={onSelect}
                onDelete={vi.fn()}
              />
              <output data-testid="form-values">{JSON.stringify(formik.values)}</output>
            </>
          )}
        </Formik>
      </DndContext>
    </ThemeProvider>
  );
  return { field, original, onSelect };
}

describe('form builder location summaries', () => {
  it.each(['country', 'state', 'city'])(
    'shows the existing %s selector while retaining the field editor trigger',
    (format) => {
      const { field, original, onSelect } = mountField(format);
      const edit = screen.getByRole('button', { name: `Edit ${field.label} Field` });
      expect(within(edit).getByText(`Select ${format}`)).toBeVisible();
      expect(within(edit).queryByRole('textbox')).not.toBeInTheDocument();
      expect(within(edit).queryByRole('combobox')).not.toBeInTheDocument();
      fireEvent.click(edit);
      expect(onSelect).toHaveBeenCalledOnce();
      expect(screen.getByTestId('form-values').textContent).toBe(original);
    }
  );

  it('keeps a historical free-text Country field as text without inferring a format', () => {
    mountField();
    expect(screen.getByText('Enter country')).toBeVisible();
  });

  it('keeps an authored placeholder for a configured selector', () => {
    mountField('country', 'Choose your home country');
    expect(screen.getByText('Choose your home country')).toBeVisible();
  });

  it('uses the same selector prompt in the drag preview', () => {
    const field = {
      ...newField('section', 0),
      label: 'State',
      validationJson: JSON.stringify({ format: 'state', countryField: 'COUNTRY' }),
    };
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FormBuilderFieldDragPreview field={field} />
      </ThemeProvider>
    );
    expect(screen.getByText('Select state')).toBeInTheDocument();
  });
});
