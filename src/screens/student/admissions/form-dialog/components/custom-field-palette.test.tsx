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
  it('offers every supported custom field and passes its type to the builder', () => {
    const onAddField = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette onAddField={onAddField} />
      </ThemeProvider>
    );

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

    CUSTOM_FIELD_PRESETS.forEach((preset) => {
      fireEvent.click(screen.getByRole('button', { name: `Add ${preset.label}` }));
      expect(onAddField).toHaveBeenLastCalledWith(preset.fieldType, undefined, preset);
    });
  });
});
