import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
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
    fireEvent.change(input, { target: { value: 'Parent@Example.TEST' } });
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

it.each([3, 0])('normalizes typed and pasted emails for field type %i', async (fieldType) => {
  const user = userEvent.setup();
  function EmailEntry() {
    const [value, setValue] = useState('Existing@Example.TEST');
    return (
      <AdmissionRuntimeField
        field={{
          code: 'EMAIL',
          label: 'Email',
          fieldType,
          required: false,
          readOnly: false,
          validationJson: '{"format":"email"}',
        }}
        value={value}
        onChange={setValue}
        disabled={false}
      />
    );
  }
  render(<EmailEntry />);
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(input).toHaveValue('existing@example.test');
  expect(input).toHaveAttribute('type', 'email');
  expect(input).toHaveAttribute('autocapitalize', 'none');
  expect(input).toHaveAttribute('spellcheck', 'false');
  await user.clear(input);
  await user.type(input, 'Parent@Example.TEST');
  expect(input).toHaveValue('parent@example.test');
  await user.clear(input);
  await user.paste('PASTED+TAG@Example.TEST');
  expect(input).toHaveValue('pasted+tag@example.test');
});

it('preserves the case of non-email text', () => {
  const onChange = vi.fn();
  render(
    <AdmissionRuntimeField
      field={{ code: 'NAME', label: 'Name', fieldType: 0, required: false, readOnly: false }}
      value="Aanya Patel"
      onChange={onChange}
      disabled={false}
    />
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  expect(input).toHaveValue('Aanya Patel');
  fireEvent.change(input, { target: { value: 'Aanya PATEL' } });
  expect(onChange).toHaveBeenCalledWith('Aanya PATEL');
});

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
