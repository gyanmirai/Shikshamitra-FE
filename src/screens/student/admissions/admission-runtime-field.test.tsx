import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import AdmissionRuntimeField from './admission-runtime-field';

it.each(['Guardian.Email', 'Father.Email', 'Mother.Email', 'Applicant.Email'])(
  'renders and updates the required %s with email format metadata',
  (bindingKey) => {
    const onChange = vi.fn();
    const field = {
      code: bindingKey.toUpperCase().replace('.', '_'),
      bindingKey,
      label: bindingKey,
      fieldType: 3,
      required: true,
      readOnly: false,
      validationJson: '{"format":"email"}',
    };
    const view = render(
      <AdmissionRuntimeField field={field} value="" disabled={false} onChange={onChange} />
    );
    const input = screen.getByRole('textbox', { name: bindingKey });
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
    fireEvent.change(input, { target: { value: 'parent@example.test' } });
    expect(onChange).toHaveBeenCalledWith('parent@example.test');
    view.rerender(
      <AdmissionRuntimeField
        field={field}
        value="parent@example.test"
        disabled
        onChange={onChange}
      />
    );
    expect(screen.getByRole('textbox', { name: bindingKey })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: bindingKey })).toHaveValue('parent@example.test');
  }
);

it.each([6, 7, 8])('shows the required indicator for choice field type %i', (fieldType) => {
  renderChoice(fieldType, true);
  expect(screen.getByText('Class applying for', { selector: 'label' })).toHaveTextContent(
    'Class applying for *'
  );
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
});

it.each([6, 7, 8])(
  'keeps optional choice field type %i without a required indicator',
  (fieldType) => {
    renderChoice(fieldType, false);
    expect(screen.getByText('Class applying for', { selector: 'label' }).textContent).toBe(
      'Class applying for'
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-required', 'true');
  }
);

function renderChoice(fieldType: number, required: boolean) {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionRuntimeField
        field={{
          code: 'CLASS_APPLYING_FOR',
          label: 'Class applying for',
          fieldType,
          required,
          readOnly: false,
          optionsJson: '[{"value":"Class 1","label":"Class 1"}]',
        }}
        value={fieldType === 7 ? '[]' : ''}
        disabled={false}
        onChange={vi.fn()}
      />
    </ThemeProvider>
  );
}
