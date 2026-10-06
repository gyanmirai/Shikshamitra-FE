import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { CustomFieldPalette } from './custom-field-palette';
import { CUSTOM_FIELD_PRESETS } from '../form-field-presets';
import { CREATABLE_FIELD_TYPES } from '../form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

describe('Admission Form Builder custom field palette', () => {
  it('collects choices while creating the question without a second settings visit', () => {
    const onAddField = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette onAddField={onAddField} />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByLabelText('Question'), {
      target: { value: 'Preferred activity' },
    });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Answer type' }));
    fireEvent.click(screen.getByRole('option', { name: 'Select' }));
    expect(screen.getByRole('button', { name: 'Add custom field' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Choices'), { target: { value: 'Art\nMusic' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add custom field' }));
    expect(onAddField).toHaveBeenLastCalledWith(
      6,
      undefined,
      expect.objectContaining({
        label: 'Preferred activity',
        optionsJson: '[{"value":"ART","label":"Art"},{"value":"MUSIC","label":"Music"}]',
      })
    );
  });
  it('creates a named required question directly and suggests existing Student fields', () => {
    const onAddField = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette
          onAddField={onAddField}
          systemFields={[
            {
              key: 'Medical.BloodGroup',
              displayName: 'Blood group',
              description: '',
              fieldType: 6,
              readOnly: false,
            },
          ]}
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: 'Add custom field' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Blood group' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Blood group' }));
    expect(onAddField).toHaveBeenLastCalledWith(6, 'Medical.BloodGroup');
    fireEvent.change(screen.getByLabelText('Question'), {
      target: { value: 'Preferred activity' },
    });
    fireEvent.click(screen.getByLabelText('Required'));
    fireEvent.click(screen.getByRole('button', { name: 'Add custom field' }));
    expect(onAddField).toHaveBeenLastCalledWith(
      0,
      undefined,
      expect.objectContaining({ label: 'Preferred activity', required: true })
    );
  });
  it('offers every supported custom field and passes its type to the builder', () => {
    const onAddField = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette onAddField={onAddField} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'More field formats' }));

    CREATABLE_FIELD_TYPES.forEach(([label, fieldType]) => {
      fireEvent.click(screen.getByRole('button', { name: `Add ${label}` }));
      expect(onAddField).toHaveBeenLastCalledWith(fieldType);
    });
    expect(screen.queryByRole('button', { name: 'Add File placeholder' })).not.toBeInTheDocument();
  });

  it('offers every ready-to-use preset with its saved configuration', () => {
    const onAddField = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette onAddField={onAddField} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'More field formats' }));

    CUSTOM_FIELD_PRESETS.forEach((preset) => {
      fireEvent.click(screen.getByRole('button', { name: `Add ${preset.label}` }));
      expect(onAddField).toHaveBeenLastCalledWith(preset.fieldType, undefined, preset);
    });
  });
});
