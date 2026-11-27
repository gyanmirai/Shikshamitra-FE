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
  it('warns before adding a custom Country when the student Country is already present', () => {
    const onAddField = vi.fn();
    const onViewExisting = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette
          onAddField={onAddField}
          onViewExisting={onViewExisting}
          usedBindings={['Address.Country']}
          systemFields={[
            {
              key: 'Address.Country',
              displayName: 'Country',
              description: '',
              fieldType: 6,
              readOnly: false,
            },
          ]}
        />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: '  COUNTRY  ' } });
    expect(screen.getByText(/already included in this form/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add Custom Field' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'View existing field' }));
    expect(onViewExisting).toHaveBeenCalledWith('Address.Country');
    expect(onAddField).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Add a different question' }));
    expect(screen.getByRole('button', { name: 'Add Custom Field' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Country of birth' } });
    expect(screen.queryByText(/already included in this form/i)).not.toBeInTheDocument();
  });

  it('asks before adding a separate Country preset when a student address is present', () => {
    const onAddField = vi.fn();
    const onViewExisting = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette
          onAddField={onAddField}
          onViewExisting={onViewExisting}
          usedBindings={['Address.Country']}
          systemFields={[
            {
              key: 'Address.Country',
              displayName: 'Country',
              description: '',
              fieldType: 6,
              readOnly: false,
            },
          ]}
        />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'More Field Formats' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Country' }));
    expect(onAddField).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'View existing field' }));
    expect(onViewExisting).toHaveBeenCalledWith('Address.Country');
    fireEvent.click(screen.getByRole('button', { name: 'Add a different question' }));
    expect(onAddField).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      expect.objectContaining({ key: 'country' })
    );
  });

  it('does not mistake a permanent address for a current address question', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette
          onAddField={vi.fn()}
          usedBindings={['PermanentAddress.Country']}
          systemFields={[
            {
              key: 'PermanentAddress.Country',
              displayName: 'Permanent address country',
              description: '',
              fieldType: 6,
              readOnly: false,
            },
          ]}
        />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Country' } });
    expect(screen.queryByText(/already included in this form/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Custom Field' })).toBeEnabled();
  });
  it('creates the class-interest alias from Institute Setup without asking for manual choices', () => {
    const onAddField = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette onAddField={onAddField} />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Interested Class' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Custom Field' }));
    expect(onAddField).toHaveBeenCalledWith(
      6,
      undefined,
      expect.objectContaining({
        label: 'Interested Class',
        fieldType: 6,
        optionsJson: '{"source":"Standards"}',
      })
    );
    expect(screen.queryByLabelText('Choices')).not.toBeInTheDocument();
  });
  it('requires confirmation before using an included Student field alias as a different custom question', () => {
    const onAddField = vi.fn();
    const onViewExisting = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomFieldPalette
          onAddField={onAddField}
          onViewExisting={onViewExisting}
          usedBindings={['Applicant.FirstName']}
          systemFields={[
            {
              key: 'Applicant.FirstName',
              displayName: 'First name',
              description: '',
              fieldType: 0,
              readOnly: false,
            },
          ]}
        />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'fname' } });
    expect(screen.getByRole('button', { name: 'Add Custom Field' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'View existing field' }));
    expect(onViewExisting).toHaveBeenLastCalledWith('Applicant.FirstName');
    fireEvent.click(screen.getByRole('button', { name: 'Add a different question' }));
    expect(screen.getByRole('button', { name: 'Add Custom Field' })).toBeEnabled();
  });
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
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Answer Type' }));
    fireEvent.click(screen.getByRole('option', { name: 'Select' }));
    expect(screen.getByRole('button', { name: 'Add Custom Field' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Choices'), { target: { value: 'Art\nMusic' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Custom Field' }));
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
    expect(screen.getByRole('button', { name: 'Add Custom Field' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Blood group' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Blood group' }));
    expect(onAddField).toHaveBeenLastCalledWith(6, 'Medical.BloodGroup');
    fireEvent.change(screen.getByLabelText('Question'), {
      target: { value: 'Preferred activity' },
    });
    fireEvent.click(screen.getByLabelText('Required'));
    fireEvent.click(screen.getByRole('button', { name: 'Add Custom Field' }));
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

    fireEvent.click(screen.getByRole('button', { name: 'More Field Formats' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'More Field Formats' }));

    CUSTOM_FIELD_PRESETS.forEach((preset) => {
      fireEvent.click(screen.getByRole('button', { name: `Add ${preset.label}` }));
      expect(onAddField).toHaveBeenLastCalledWith(preset.fieldType, undefined, preset);
    });
  });
});
