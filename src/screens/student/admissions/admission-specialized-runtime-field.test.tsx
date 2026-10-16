import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionRuntimeField from './admission-runtime-field';
import { buildDynamicAdmissionYupSchema } from './admission-form-validation';

const panField = {
  code: 'STUDENT_PAN',
  label: 'Student PAN number',
  fieldType: 0,
  required: false,
  readOnly: false,
  validationJson: JSON.stringify({ format: 'pan', regex: '^[A-Z]{5}[0-9]{4}[A-Z]$' }),
};

function RuntimeField({ field = panField }: { field?: typeof panField }) {
  const [value, setValue] = useState('');
  return <AdmissionRuntimeField field={field} value={value} onChange={setValue} disabled={false} />;
}

describe('PAN runtime input normalization', () => {
  it('accepts lowercase typing and sends uppercase through the controlled field', async () => {
    render(<RuntimeField />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name: 'Student PAN number' });
    expect(input).toHaveAttribute('inputmode', 'text');
    await user.type(input, 'abcde1234f');
    expect(input).toHaveValue('ABCDE1234F');
    const schema = buildDynamicAdmissionYupSchema({ sections: [{ fields: [panField] }] });
    expect(await schema.isValid({ STUDENT_PAN: (input as HTMLInputElement).value })).toBe(true);
    expect(await schema.isValid({ STUDENT_PAN: 'ABCDE12345' })).toBe(false);
  });

  it('normalizes pasted PAN while rejecting invalid typed characters', async () => {
    render(<RuntimeField />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name: 'Student PAN number' });
    await user.click(input);
    await user.paste(' abcde-1234f ');
    expect(input).toHaveValue('ABCDE1234F');
    await user.clear(input);
    fireEvent.change(input, { target: { value: 'a' } });
    expect(input).toHaveValue('A');
    fireEvent.change(input, { target: { value: 'A@' } });
    expect(input).toHaveValue('A');
  });

  it('preserves the case of ordinary text fields', async () => {
    render(
      <RuntimeField
        field={{ ...panField, code: 'NAME', label: 'Student name', validationJson: '{}' }}
      />
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Student name' }), 'Riya Sharma');
    expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('Riya Sharma');
  });
});
